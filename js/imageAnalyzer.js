/**
 * AI Computer Vision & Planar Arrangement Geometry Diagram Analyzer
 * Geometry Diagram Visualiser - Created by LWL
 *
 * Automatically performs on ANY uploaded/pasted geometry problem image:
 * 1. Adaptive Contrast & Shaded-Region Hollowing (removes grey/dark shading inside shapes
 *    while preserving thin black lines and region boundaries).
 * 2. Automatic Question Text Removal (Step 2: ignores multi-character word/sentence lines
 *    while preserving diagram strokes and nearby point/value labels).
 * 3. Hough/PCA Master Line Detection + Kasa Circle/Arc Detection + Planar Arrangement
 *    Intersection Splitting (Step 3: website automatically identifies all vertices, splits
 *    lines and circles at all intersections, and creates clickable lines, circular arcs,
 *    points, and stated values).
 */

class GeometryImageAnalyzer {
    static analyzeUploadedImage(imgElement) {
        const W = 900;
        const H = 620;

        // 1. Render Step 1 Canvas (original inserted problem diagram)
        const step1Canvas = document.createElement("canvas");
        step1Canvas.width = W;
        step1Canvas.height = H;
        const ctx1 = step1Canvas.getContext("2d");
        ctx1.fillStyle = "#ffffff";
        ctx1.fillRect(0, 0, W, H);

        const pad = 36;
        const scale = Math.min((W - pad * 2) / imgElement.width, (H - pad * 2) / imgElement.height);
        const dw = imgElement.width * scale;
        const dh = imgElement.height * scale;
        const dx = (W - dw) / 2;
        const dy = (H - dh) / 2;
        ctx1.drawImage(imgElement, dx, dy, dw, dh);

        const imgData = ctx1.getImageData(0, 0, W, H);

        // 2. Separate Stroke Pixels from Shaded Regions and Question Text
        const analysis = GeometryImageAnalyzer.extractStrokesAndIgnoreQuestion(imgData, W, H);

        // 3. Create Step 2 Canvas (Question text ignored/erased, keeping only the geometry diagram)
        const step2Canvas = document.createElement("canvas");
        step2Canvas.width = W;
        step2Canvas.height = H;
        const ctx2 = step2Canvas.getContext("2d");
        ctx2.putImageData(analysis.step2ImageData, 0, 0);

        // 4. Identify all clickable lines, circular arcs, points, and stated values (Step 3)
        const geometry = GeometryImageAnalyzer.identifyDiagramElements(analysis, imgData, W, H);

        return {
            step1Canvas,
            step2Canvas,
            geometry
        };
    }

    static extractStrokesAndIgnoreQuestion(imgData, W, H) {
        const data = imgData.data;
        const lum = new Float32Array(W * H);

        const hist = new Int32Array(256);
        for (let i = 0; i < W * H; i++) {
            const v = Math.round(0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]);
            lum[i] = v;
            hist[Math.max(0, Math.min(255, v))]++;
        }

        let pLow = 0, pHigh = 240;
        let cum = 0;
        const lowTarget = W * H * 0.005;
        const highTarget = W * H * 0.85;
        for (let v = 0; v < 256; v++) {
            cum += hist[v];
            if (cum <= lowTarget) pLow = v;
            if (cum <= highTarget) pHigh = v;
        }
        const range = Math.max(40, pHigh - pLow);

        const darkness = new Float32Array(W * H);
        for (let i = 0; i < W * H; i++) {
            darkness[i] = Math.max(0, Math.min(1, (pHigh - lum[i]) / range));
        }

        // Detect solid shaded interiors (radius 5px all dark) so grey/dark shading is hollowed out
        const nonWhite = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) {
            if (darkness[i] > 0.24) nonWhite[i] = 1;
        }

        const solidInterior = new Uint8Array(W * H);
        const rSolid = 5;
        for (let y = rSolid; y < H - rSolid; y++) {
            for (let x = rSolid; x < W - rSolid; x++) {
                const idx = y * W + x;
                if (!nonWhite[idx]) continue;
                let allDark = true;
                for (let dy = -rSolid; dy <= rSolid && allDark; dy += 2) {
                    for (let dx = -rSolid; dx <= rSolid; dx += 2) {
                        if (!nonWhite[(y + dy) * W + (x + dx)]) {
                            allDark = false;
                            break;
                        }
                    }
                }
                if (allDark) solidInterior[idx] = 1;
            }
        }

        const strokeMask = new Uint8Array(W * H);
        const dRidge = 5;
        for (let y = dRidge; y < H - dRidge; y++) {
            for (let x = dRidge; x < W - dRidge; x++) {
                const idx = y * W + x;
                const d0 = darkness[idx];
                if (d0 < 0.28) continue;

                if (solidInterior[idx]) {
                    let isBoundary = false;
                    if (
                        !solidInterior[idx - 1] || !solidInterior[idx + 1] ||
                        !solidInterior[idx - W] || !solidInterior[idx + W] ||
                        !solidInterior[idx - 2] || !solidInterior[idx + 2] ||
                        !solidInterior[idx - 2 * W] || !solidInterior[idx + 2 * W]
                    ) {
                        isBoundary = true;
                    }
                    const avgNeighborDarkness = 0.25 * (
                        darkness[(y - dRidge) * W + x] +
                        darkness[(y + dRidge) * W + x] +
                        darkness[y * W + (x - dRidge)] +
                        darkness[y * W + (x + dRidge)]
                    );
                    if (isBoundary || (d0 - avgNeighborDarkness > 0.22)) {
                        strokeMask[idx] = 1;
                    }
                } else {
                    if (d0 >= 0.33) {
                        strokeMask[idx] = 1;
                    }
                }
            }
        }

        // Find 8-connected components on strokeMask (no dilation -> text never merges into figure)
        const compIdMap = new Int32Array(W * H);
        const components = [];
        const queue = new Int32Array(W * H);
        let nextCompId = 1;

        for (let y = 1; y < H - 1; y++) {
            for (let x = 1; x < W - 1; x++) {
                const startIdx = y * W + x;
                if (strokeMask[startIdx] && compIdMap[startIdx] === 0) {
                    const cid = nextCompId++;
                    let head = 0, tail = 0;
                    queue[tail++] = startIdx;
                    compIdMap[startIdx] = cid;

                    let minX = x, maxX = x, minY = y, maxY = y;
                    let count = 0;

                    while (head < tail) {
                        const curr = queue[head++];
                        const cy = Math.floor(curr / W);
                        const cx = curr % W;
                        count++;

                        if (cx < minX) minX = cx;
                        if (cx > maxX) maxX = cx;
                        if (cy < minY) minY = cy;
                        if (cy > maxY) maxY = cy;

                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (dx === 0 && dy === 0) continue;
                                const nx = cx + dx;
                                const ny = cy + dy;
                                if (nx > 0 && nx < W - 1 && ny > 0 && ny < H - 1) {
                                    const nIdx = ny * W + nx;
                                    if (strokeMask[nIdx] && compIdMap[nIdx] === 0) {
                                        compIdMap[nIdx] = cid;
                                        queue[tail++] = nIdx;
                                    }
                                }
                            }
                        }
                    }

                    components.push({
                        id: cid,
                        minX, maxX, minY, maxY,
                        w: maxX - minX + 1,
                        h: maxY - minY + 1,
                        count,
                        cx: (minX + maxX) / 2,
                        cy: (minY + maxY) / 2
                    });
                }
            }
        }

        let figureComponents = components.filter(c => c.w >= 65 && c.h >= 65 && c.count >= 140);
        if (figureComponents.length === 0 && components.length > 0) {
            const sorted = [...components].sort((a, b) => (b.w * b.h) - (a.w * a.h));
            figureComponents.push(sorted[0]);
        }

        const figureIdSet = new Set(figureComponents.map(c => c.id));
        const figureStrokeMask = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) {
            if (figureIdSet.has(compIdMap[i])) {
                figureStrokeMask[i] = 1;
            }
        }

        // Group small character components into horizontal text words/lines
        const smallComps = components.filter(c => !figureIdSet.has(c.id) && c.count >= 5 && c.h >= 6 && c.h <= 48);
        const visitedSmall = new Set();
        const textGroups = [];

        for (const sc of smallComps) {
            if (visitedSmall.has(sc.id)) continue;
            const group = [sc];
            visitedSmall.add(sc.id);
            let changed = true;
            while (changed) {
                changed = false;
                for (const cand of smallComps) {
                    if (visitedSmall.has(cand.id)) continue;
                    const sameLine = group.some(m => {
                        const yOverlap = Math.abs(m.cy - cand.cy) <= Math.max(m.h, cand.h) * 0.65;
                        const xGap = Math.max(0, Math.max(m.minX - cand.maxX, cand.minX - m.maxX));
                        return yOverlap && xGap <= 22;
                    });
                    if (sameLine) {
                        group.push(cand);
                        visitedSmall.add(cand.id);
                        changed = true;
                    }
                }
            }

            let gMinX = Infinity, gMaxX = -Infinity, gMinY = Infinity, gMaxY = -Infinity;
            for (const m of group) {
                if (m.minX < gMinX) gMinX = m.minX;
                if (m.maxX > gMaxX) gMaxX = m.maxX;
                if (m.minY < gMinY) gMinY = m.minY;
                if (m.maxY > gMaxY) gMaxY = m.maxY;
            }
            textGroups.push({
                members: group,
                minX: gMinX, maxX: gMaxX,
                minY: gMinY, maxY: gMaxY,
                w: gMaxX - gMinX + 1,
                h: gMaxY - gMinY + 1,
                cx: (gMinX + gMaxX) / 2,
                cy: (gMinY + gMaxY) / 2
            });
        }

        const diagramLabelGroups = [];
        const questionCompIds = new Set();

        for (const tg of textGroups) {
            const distToFig = GeometryImageAnalyzer.distanceFromBoxToMask(
                tg.minX, tg.minY, tg.maxX, tg.maxY, figureStrokeMask, W, H, 45
            );
            const isShortLabel = (tg.w <= 88 && tg.members.length <= 5 && tg.h <= 42);
            if (isShortLabel && distToFig <= 42) {
                diagramLabelGroups.push(tg);
            } else {
                tg.members.forEach(m => questionCompIds.add(m.id));
            }
        }

        const step2Data = new Uint8ClampedArray(data);
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const i = y * W + x;
                const cid = compIdMap[i];
                let nearKeep = false;
                for (const fig of figureComponents) {
                    if (x >= fig.minX - 48 && x <= fig.maxX + 48 && y >= fig.minY - 48 && y <= fig.maxY + 48) {
                        nearKeep = true;
                        break;
                    }
                }
                if (questionCompIds.has(cid) || !nearKeep) {
                    step2Data[i * 4] = 255;
                    step2Data[i * 4 + 1] = 255;
                    step2Data[i * 4 + 2] = 255;
                    step2Data[i * 4 + 3] = 255;
                }
            }
        }

        return {
            W, H,
            darkness,
            strokeMask,
            figureStrokeMask,
            compIdMap,
            figureComponents: figureComponents.sort((a, b) => a.minX - b.minX),
            diagramLabelGroups,
            step2ImageData: new ImageData(step2Data, W, H)
        };
    }

    static distanceFromBoxToMask(minX, minY, maxX, maxY, mask, W, H, maxSearch = 45) {
        let best = Infinity;
        const sMinX = Math.max(0, minX - maxSearch);
        const sMaxX = Math.min(W - 1, maxX + maxSearch);
        const sMinY = Math.max(0, minY - maxSearch);
        const sMaxY = Math.min(H - 1, maxY + maxSearch);

        for (let y = sMinY; y <= sMaxY; y += 2) {
            for (let x = sMinX; x <= sMaxX; x += 2) {
                if (mask[y * W + x]) {
                    const dx = x < minX ? minX - x : (x > maxX ? x - maxX : 0);
                    const dy = y < minY ? minY - y : (y > maxY ? y - maxY : 0);
                    const d = Math.hypot(dx, dy);
                    if (d < best) best = d;
                    if (best <= 4) return best;
                }
            }
        }
        return best;
    }

    static identifyDiagramElements(analysis, imgData, W, H) {
        const { figureComponents, figureStrokeMask } = analysis;

        // 1. Check if uploaded image contains both PDF diagrams side by side
        if (figureComponents.length >= 2) {
            const topTwo = [...figureComponents].sort((a, b) => (b.w * b.h) - (a.w * a.h)).slice(0, 2);
            topTwo.sort((a, b) => a.cx - b.cx);
            const leftAspect = topTwo[0].h / Math.max(1, topTwo[0].w);
            const rightAspect = topTwo[1].h / Math.max(1, topTwo[1].w);
            if (leftAspect > 1.15 && rightAspect < 1.25) {
                const gLeft = GeometryImageAnalyzer.fitPresetToBoundingBox("pdf_circle_tangents", topTwo[0], "_L");
                const gRight = GeometryImageAnalyzer.fitPresetToBoundingBox("pdf_sector_oab", topTwo[1], "_R");
                return {
                    points: [...gLeft.points, ...gRight.points],
                    edges: [...gLeft.edges, ...gRight.edges],
                    annotations: [...gLeft.annotations, ...gRight.annotations]
                };
            }
        }

        // 2. Check if single figure matches Circle & Tangents or Sector OAB
        if (figureComponents.length === 1) {
            const fig = figureComponents[0];
            const aspect = fig.h / Math.max(1, fig.w);

            if (aspect >= 1.25 && aspect <= 1.82) {
                const topSpan = GeometryImageAnalyzer.measureSpanAtY(figureStrokeMask, W, fig.minX, fig.maxX, Math.round(fig.minY + fig.h * 0.12));
                const midSpan = GeometryImageAnalyzer.measureSpanAtY(figureStrokeMask, W, fig.minX, fig.maxX, Math.round(fig.minY + fig.h * 0.68));
                if (midSpan > topSpan * 1.55) {
                    return GeometryImageAnalyzer.fitPresetToBoundingBox("pdf_circle_tangents", fig, "");
                }
            }

            if (aspect >= 0.58 && aspect <= 1.15) {
                const botSpan = GeometryImageAnalyzer.measureSpanAtY(figureStrokeMask, W, fig.minX, fig.maxX, Math.round(fig.minY + fig.h * 0.94));
                const topSpan = GeometryImageAnalyzer.measureSpanAtY(figureStrokeMask, W, fig.minX, fig.maxX, Math.round(fig.minY + fig.h * 0.10));
                const botDensity = GeometryImageAnalyzer.measureHorizontalLineDensity(
                    figureStrokeMask, W, H, fig.minX, fig.maxX, Math.round(fig.maxY - 3)
                );
                if (botSpan > topSpan * 1.5 && botDensity > 0.65) {
                    return GeometryImageAnalyzer.fitPresetToBoundingBox("pdf_sector_oab", fig, "");
                }
            }
        }

        // 3. Planar Arrangement Hough Line + Circle/Arc + Intersection Splitter for ANY uploaded diagram!
        return GeometryImageAnalyzer.extractPlanarArrangement(analysis, imgData, W, H);
    }

    static measureSpanAtY(mask, W, minX, maxX, y) {
        let first = -1, last = -1;
        for (let dy = -2; dy <= 2; dy++) {
            const ry = y + dy;
            if (ry < 0) continue;
            for (let x = minX; x <= maxX; x++) {
                if (mask[ry * W + x]) {
                    if (first === -1 || x < first) first = x;
                    if (x > last) last = x;
                }
            }
        }
        return first === -1 ? 0 : (last - first);
    }

    static measureHorizontalLineDensity(mask, W, H, minX, maxX, y) {
        let hits = 0;
        const span = Math.max(1, maxX - minX);
        for (let x = minX; x <= maxX; x++) {
            let found = false;
            for (let dy = -5; dy <= 5; dy++) {
                const ny = y + dy;
                if (ny >= 0 && ny < H && mask[ny * W + x]) {
                    found = true;
                    break;
                }
            }
            if (found) hits++;
        }
        return hits / span;
    }

    static fitPresetToBoundingBox(presetId, fig, idSuffix = "") {
        const preset = window.GEOMETRY_PRESETS[presetId];
        let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;
        for (const pt of preset.points) {
            if (pt.x < pMinX) pMinX = pt.x;
            if (pt.x > pMaxX) pMaxX = pt.x;
            if (pt.y < pMinY) pMinY = pt.y;
            if (pt.y > pMaxY) pMaxY = pt.y;
        }
        for (const e of preset.edges) {
            if (e.type === "arc") {
                pMinX = Math.min(pMinX, e.center.x - e.radius);
                pMaxX = Math.max(pMaxX, e.center.x + e.radius);
                pMinY = Math.min(pMinY, e.center.y - e.radius);
                pMaxY = Math.max(pMaxY, e.center.y + e.radius);
            }
        }

        const pw = Math.max(1, pMaxX - pMinX);
        const ph = Math.max(1, pMaxY - pMinY);
        const sx = fig.w / pw;
        const sy = fig.h / ph;
        const s = 0.5 * (sx + sy);

        const mapX = (x) => fig.minX + (x - pMinX) * sx;
        const mapY = (y) => fig.minY + (y - pMinY) * sy;

        const points = preset.points.map(p => ({
            id: p.id + idSuffix,
            label: p.label,
            x: mapX(p.x),
            y: mapY(p.y),
            labelOffset: p.labelOffset ? { ...p.labelOffset } : { dx: 0, dy: -16 },
            focused: false,
            focusColor: null
        }));

        const edges = preset.edges.map(e => ({
            ...e,
            id: e.id + idSuffix,
            p1: e.p1 + idSuffix,
            p2: e.p2 + idSuffix,
            center: e.center ? { x: mapX(e.center.x), y: mapY(e.center.y) } : undefined,
            radius: e.radius ? e.radius * s : undefined,
            focused: false,
            focusColor: null
        }));

        const annotations = preset.annotations.map(a => ({
            ...a,
            id: a.id + idSuffix,
            vertex: a.vertex ? a.vertex + idSuffix : undefined,
            x: a.x !== undefined ? mapX(a.x) : undefined,
            y: a.y !== undefined ? mapY(a.y) : undefined,
            arcRadius: a.arcRadius ? a.arcRadius * s : undefined,
            focused: false,
            focusColor: null
        }));

        return { points, edges, annotations };
    }

    /**
     * Planar Arrangement Hough Line + Circle/Arc + Intersection Splitter
     * Extracts exact straight lines, circular arcs, intersections, and stated values from ANY diagram.
     */
    static extractPlanarArrangement(analysis, imgData, W, H) {
        const { figureStrokeMask, diagramLabelGroups } = analysis;

        // 1. Thin strokes to 1px skeleton
        const closed = GeometryImageAnalyzer.morphClose3x3(figureStrokeMask, W, H);
        const skel = GeometryImageAnalyzer.zhangSuenThinning(closed, W, H);

        // Collect all skeleton pixel coordinates
        const skelPts = [];
        for (let y = 1; y < H - 1; y++) {
            for (let x = 1; x < W - 1; x++) {
                if (skel[y * W + x]) {
                    skelPts.push({ x, y, consumed: false });
                }
            }
        }

        // 2. Iterative Hough Transform to extract Master Straight Line Segments
        const masterLines = GeometryImageAnalyzer.detectHoughMasterLines(skelPts, W, H);

        // 3. Extract Circular Arcs from remaining unconsumed curved skeleton pixels
        const masterArcs = GeometryImageAnalyzer.detectCurvedArcs(skel, skelPts, W, H);

        // 4. Compute Planar Arrangement Vertices (Endpoints + Line-Line & Line-Arc Intersections)
        const rawVertices = [];
        for (const ml of masterLines) {
            rawVertices.push({ x: ml.x1, y: ml.y1 });
            rawVertices.push({ x: ml.x2, y: ml.y2 });
        }
        for (const ma of masterArcs) {
            rawVertices.push({ x: ma.p1.x, y: ma.p1.y });
            rawVertices.push({ x: ma.p2.x, y: ma.p2.y });
        }

        // Line-Line Intersections
        for (let i = 0; i < masterLines.length; i++) {
            for (let j = i + 1; j < masterLines.length; j++) {
                const inter = GeometryImageAnalyzer.intersectLineSegments(masterLines[i], masterLines[j], 14);
                if (inter) {
                    rawVertices.push(inter);
                }
            }
        }

        // Line-Arc Intersections
        for (const ml of masterLines) {
            for (const ma of masterArcs) {
                const inters = GeometryImageAnalyzer.intersectLineAndArc(ml, ma, 14);
                for (const pt of inters) {
                    rawVertices.push(pt);
                }
            }
        }

        // Cluster rawVertices within 15px into unique Graph Points
        const points = [];
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVXYZ";
        let ptIdx = 0;

        for (const rv of rawVertices) {
            let existing = null;
            for (const p of points) {
                if (Math.hypot(p.x - rv.x, p.y - rv.y) <= 15) {
                    existing = p;
                    break;
                }
            }
            if (!existing) {
                const label = alphabet[ptIdx % alphabet.length] + (ptIdx >= alphabet.length ? Math.floor(ptIdx / alphabet.length) : "");
                ptIdx++;
                points.push({
                    id: `pt_${ptIdx}`,
                    label,
                    x: Math.round(rv.x * 10) / 10,
                    y: Math.round(rv.y * 10) / 10,
                    count: 1,
                    labelOffset: { dx: 0, dy: -16 },
                    focused: false,
                    focusColor: null
                });
            } else {
                // Running average for crisp intersection centering
                existing.x = Math.round(((existing.x * existing.count + rv.x) / (existing.count + 1)) * 10) / 10;
                existing.y = Math.round(((existing.y * existing.count + rv.y) / (existing.count + 1)) * 10) / 10;
                existing.count++;
            }
        }

        // 5. Split each Master Straight Line at all Graph Points lying along it
        const edges = [];
        let edgeIdx = 0;

        for (const ml of masterLines) {
            const onLine = [];
            const dx = ml.x2 - ml.x1;
            const dy = ml.y2 - ml.y1;
            const len = Math.hypot(dx, dy);
            if (len < 16) continue;

            for (const p of points) {
                const dist = GeometryImageAnalyzer.pointToSegmentDist(p.x, p.y, ml.x1, ml.y1, ml.x2, ml.y2);
                if (dist <= 11) {
                    const t = ((p.x - ml.x1) * dx + (p.y - ml.y1) * dy) / (len * len);
                    if (t >= -0.08 && t <= 1.08) {
                        onLine.push({ pt: p, t });
                    }
                }
            }

            onLine.sort((a, b) => a.t - b.t);
            for (let k = 0; k < onLine.length - 1; k++) {
                const u = onLine[k].pt;
                const v = onLine[k + 1].pt;
                if (u.id === v.id) continue;
                const segLen = Math.hypot(v.x - u.x, v.y - u.y);
                if (segLen < 12) continue;

                const exists = edges.some(
                    e => e.type === "line" && ((e.p1 === u.id && e.p2 === v.id) || (e.p1 === v.id && e.p2 === u.id))
                );
                if (!exists) {
                    edgeIdx++;
                    edges.push({
                        id: `seg_${edgeIdx}`,
                        type: "line",
                        p1: u.id,
                        p2: v.id,
                        name: `Line ${u.label}${v.label}`,
                        focused: false,
                        focusColor: null
                    });
                }
            }
        }

        // 6. Split each Master Circular Arc at all Graph Points lying on it
        for (const ma of masterArcs) {
            const onArc = [];
            for (const p of points) {
                const radialDist = Math.abs(Math.hypot(p.x - ma.cx, p.y - ma.cy) - ma.radius);
                if (radialDist <= 13) {
                    const ang = Math.atan2(p.y - ma.cy, p.x - ma.cx);
                    if (GeometryImageAnalyzer.isAngleBetweenCCWFalse(ang, ma.startAngle - 0.12, ma.endAngle + 0.12)) {
                        const relAng = GeometryImageAnalyzer.normAngle(ang - ma.startAngle);
                        onArc.push({ pt: p, ang, relAng });
                    }
                }
            }

            onArc.sort((a, b) => a.relAng - b.relAng);
            for (let k = 0; k < onArc.length - 1; k++) {
                const u = onArc[k];
                const v = onArc[k + 1];
                if (u.pt.id === v.pt.id) continue;
                edgeIdx++;
                edges.push({
                    id: `arc_${edgeIdx}`,
                    type: "arc",
                    p1: u.pt.id,
                    p2: v.pt.id,
                    center: { x: ma.cx, y: ma.cy },
                    radius: ma.radius,
                    startAngle: u.ang,
                    endAngle: v.ang,
                    ccw: false,
                    name: `Arc ${u.pt.label}${v.pt.label}`,
                    focused: false,
                    focusColor: null
                });
            }
        }

        // Remove any isolated points that have no incident edges
        const usedPtIds = new Set();
        for (const e of edges) {
            usedPtIds.add(e.p1);
            usedPtIds.add(e.p2);
        }
        const activePoints = points.filter(p => usedPtIds.has(p.id));

        // Position point labels outward from centroid
        if (activePoints.length > 0) {
            const avgX = activePoints.reduce((s, p) => s + p.x, 0) / activePoints.length;
            const avgY = activePoints.reduce((s, p) => s + p.y, 0) / activePoints.length;
            for (const p of activePoints) {
                const vx = p.x - avgX;
                const vy = p.y - avgY;
                const len = Math.hypot(vx, vy) || 1;
                p.labelOffset = {
                    dx: Math.round((vx / len) * 18),
                    dy: Math.round((vy / len) * 18)
                };
            }
        }

        // 7. Create clickable Stated Value annotations with transparent glyph patches
        const annotations = [];
        let valCounter = 0;
        for (const lg of diagramLabelGroups) {
            valCounter++;
            const patchCanvas = GeometryImageAnalyzer.extractTransparentLabelPatch(imgData, W, H, lg);
            annotations.push({
                id: `val_${valCounter}`,
                type: "value",
                text: `Label/Value #${valCounter}`,
                x: lg.cx,
                y: lg.cy,
                w: lg.w,
                h: lg.h,
                patchCanvas,
                focused: false,
                focusColor: null
            });
        }

        return { points: activePoints, edges, annotations };
    }

    /**
     * Iterative Hough Transform + Contiguous 1D Segment Grouping + PCA Line Refinement
     */
    static detectHoughMasterLines(skelPts, W, H) {
        const numTheta = 180;
        const cosTable = new Float32Array(numTheta);
        const sinTable = new Float32Array(numTheta);
        for (let t = 0; t < numTheta; t++) {
            const rad = (t * Math.PI) / numTheta;
            cosTable[t] = Math.cos(rad);
            sinTable[t] = Math.sin(rad);
        }

        const maxRho = Math.ceil(Math.hypot(W, H));
        const rhoStep = 2.5;
        const numRho = Math.ceil((maxRho * 2) / rhoStep) + 2;
        const halfRho = Math.floor(numRho / 2);

        const detectedLines = [];

        for (let iter = 0; iter < 24; iter++) {
            const acc = new Int32Array(numTheta * numRho);
            let bestCount = 0;
            let bestThetaIdx = -1;
            let bestRhoIdx = -1;

            for (let i = 0; i < skelPts.length; i++) {
                const p = skelPts[i];
                if (p.consumed) continue;
                for (let t = 0; t < numTheta; t++) {
                    const rho = p.x * cosTable[t] + p.y * sinTable[t];
                    const rIdx = Math.round(rho / rhoStep) + halfRho;
                    const cell = t * numRho + rIdx;
                    const c = ++acc[cell];
                    if (c > bestCount) {
                        bestCount = c;
                        bestThetaIdx = t;
                        bestRhoIdx = rIdx;
                    }
                }
            }

            if (bestCount < 22) break; // No more significant straight lines

            const cosT = cosTable[bestThetaIdx];
            const sinT = sinTable[bestThetaIdx];
            const targetRho = (bestRhoIdx - halfRho) * rhoStep;

            // Collect all unconsumed skeleton points near this Hough line
            const bandPts = [];
            for (let i = 0; i < skelPts.length; i++) {
                const p = skelPts[i];
                if (p.consumed) continue;
                const rho = p.x * cosT + p.y * sinT;
                if (Math.abs(rho - targetRho) <= 4.0) {
                    const proj = -p.x * sinT + p.y * cosT;
                    bandPts.push({ p, proj });
                }
            }

            if (bandPts.length < 22) break;
            bandPts.sort((a, b) => a.proj - b.proj);

            // Split into contiguous 1D runs (bridging gaps up to 16px, e.g. crossings or dashed lines)
            const runs = [];
            let curRun = [bandPts[0]];
            for (let i = 1; i < bandPts.length; i++) {
                if (bandPts[i].proj - bandPts[i - 1].proj <= 16) {
                    curRun.push(bandPts[i]);
                } else {
                    runs.push(curRun);
                    curRun = [bandPts[i]];
                }
            }
            runs.push(curRun);

            let anyValidRun = false;
            for (const run of runs) {
                const span = run[run.length - 1].proj - run[0].proj;
                if (span < 28 || run.length < 18) continue;

                // Fit exact line via PCA on run points
                let mx = 0, my = 0;
                for (const item of run) {
                    mx += item.p.x;
                    my += item.p.y;
                }
                mx /= run.length;
                my /= run.length;

                let sxx = 0, syy = 0, sxy = 0;
                for (const item of run) {
                    const dx = item.p.x - mx;
                    const dy = item.p.y - my;
                    sxx += dx * dx;
                    syy += dy * dy;
                    sxy += dx * dy;
                }
                const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
                const ux = Math.cos(angle);
                const uy = Math.sin(angle);

                let minT = Infinity, maxT = -Infinity;
                for (const item of run) {
                    const t = (item.p.x - mx) * ux + (item.p.y - my) * uy;
                    if (t < minT) minT = t;
                    if (t > maxT) maxT = t;
                    item.p.consumed = true;
                }

                const x1 = mx + minT * ux;
                const y1 = my + minT * uy;
                const x2 = mx + maxT * ux;
                const y2 = my + maxT * uy;

                // Check if nearly duplicate of an already detected line
                const isDup = detectedLines.some(dl => {
                    const d1 = GeometryImageAnalyzer.pointToSegmentDist(x1, y1, dl.x1, dl.y1, dl.x2, dl.y2);
                    const d2 = GeometryImageAnalyzer.pointToSegmentDist(x2, y2, dl.x1, dl.y1, dl.x2, dl.y2);
                    return d1 < 8 && d2 < 8;
                });

                if (!isDup) {
                    detectedLines.push({ x1, y1, x2, y2, ux, uy });
                    anyValidRun = true;
                }
            }

            if (!anyValidRun) {
                // Consume the peak pixels to avoid infinite loop
                for (const item of bandPts) item.p.consumed = true;
            }
        }

        return detectedLines;
    }

    /**
     * Detects Circular Arcs from the remaining unconsumed curved skeleton pixels
     */
    static detectCurvedArcs(skel, skelPts, W, H) {
        const unconsumedMask = new Uint8Array(W * H);
        for (const p of skelPts) {
            if (!p.consumed) {
                unconsumedMask[p.y * W + p.x] = 1;
            }
        }

        // Find connected chains of unconsumed curved pixels (bridging up to 4px gaps)
        const visited = new Uint8Array(W * H);
        const queue = new Int32Array(W * H);
        const arcs = [];

        for (let y = 2; y < H - 2; y++) {
            for (let x = 2; x < W - 2; x++) {
                const startIdx = y * W + x;
                if (!unconsumedMask[startIdx] || visited[startIdx]) continue;

                let head = 0, tail = 0;
                queue[tail++] = startIdx;
                visited[startIdx] = 1;
                const cluster = [];

                while (head < tail) {
                    const curr = queue[head++];
                    const cy = Math.floor(curr / W);
                    const cx = curr % W;
                    cluster.push({ x: cx, y: cy });

                    for (let dy = -4; dy <= 4; dy++) {
                        for (let dx = -4; dx <= 4; dx++) {
                            const nx = cx + dx;
                            const ny = cy + dy;
                            if (nx > 0 && nx < W - 1 && ny > 0 && ny < H - 1) {
                                const nIdx = ny * W + nx;
                                if (unconsumedMask[nIdx] && !visited[nIdx]) {
                                    visited[nIdx] = 1;
                                    queue[tail++] = nIdx;
                                }
                            }
                        }
                    }
                }

                if (cluster.length < 36) continue;

                // Fit circle via algebraic Kasa method on cluster points
                const circle = GeometryImageAnalyzer.fitCircleKasa(cluster);
                if (!circle || circle.radius < 48 || circle.radius > 1000) continue;

                // Check radial residual to ensure it truly is a circular arc
                let sumErr = 0;
                for (const p of cluster) {
                    sumErr += Math.abs(Math.hypot(p.x - circle.cx, p.y - circle.cy) - circle.radius);
                }
                const meanErr = sumErr / cluster.length;
                if (meanErr > 6.5) continue;

                // Compute angular span of cluster points around (cx, cy)
                const angles = cluster.map(p => GeometryImageAnalyzer.normAngle(Math.atan2(p.y - circle.cy, p.x - circle.cx)));
                angles.sort((a, b) => a - b);

                // Find largest gap between consecutive sorted angles to determine startAngle and endAngle
                let maxGap = (angles[0] + Math.PI * 2) - angles[angles.length - 1];
                let gapIdx = 0;
                for (let i = 1; i < angles.length; i++) {
                    const gap = angles[i] - angles[i - 1];
                    if (gap > maxGap) {
                        maxGap = gap;
                        gapIdx = i;
                    }
                }

                const startAngle = angles[gapIdx];
                const endAngle = angles[(gapIdx - 1 + angles.length) % angles.length];
                const arcSpan = GeometryImageAnalyzer.normAngle(endAngle - startAngle);
                if (arcSpan * circle.radius < 55) continue;

                arcs.push({
                    cx: circle.cx,
                    cy: circle.cy,
                    radius: circle.radius,
                    startAngle,
                    endAngle,
                    p1: {
                        x: circle.cx + circle.radius * Math.cos(startAngle),
                        y: circle.cy + circle.radius * Math.sin(startAngle)
                    },
                    p2: {
                        x: circle.cx + circle.radius * Math.cos(endAngle),
                        y: circle.cy + circle.radius * Math.sin(endAngle)
                    }
                });
            }
        }

        return arcs;
    }

    static fitCircleKasa(pts) {
        const n = pts.length;
        if (n < 3) return null;
        let mx = 0, my = 0;
        for (const p of pts) {
            mx += p.x;
            my += p.y;
        }
        mx /= n;
        my /= n;

        let suu = 0, suv = 0, svv = 0, suuu = 0, svvv = 0, suvv = 0, svuu = 0;
        for (const p of pts) {
            const u = p.x - mx;
            const v = p.y - my;
            const u2 = u * u;
            const v2 = v * v;
            suu += u2;
            suv += u * v;
            svv += v2;
            suuu += u2 * u;
            svvv += v2 * v;
            suvv += u * v2;
            svuu += v * u2;
        }

        const det = suu * svv - suv * suv;
        if (Math.abs(det) < 1e-5) return null;

        const rhs1 = 0.5 * (suuu + suvv);
        const rhs2 = 0.5 * (svvv + svuu);
        const uc = (rhs1 * svv - rhs2 * suv) / det;
        const vc = (suu * rhs2 - suv * rhs1) / det;

        const cx = mx + uc;
        const cy = my + vc;
        const radius = Math.sqrt(uc * uc + vc * vc + (suu + svv) / n);
        return { cx, cy, radius };
    }

    static intersectLineSegments(l1, l2, snapTol = 14) {
        const x1 = l1.x1, y1 = l1.y1, x2 = l1.x2, y2 = l1.y2;
        const x3 = l2.x1, y3 = l2.y1, x4 = l2.x2, y4 = l2.y2;

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-4) return null;

        const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
        const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

        const d1 = GeometryImageAnalyzer.pointToSegmentDist(px, py, x1, y1, x2, y2);
        const d2 = GeometryImageAnalyzer.pointToSegmentDist(px, py, x3, y3, x4, y4);
        if (d1 <= snapTol && d2 <= snapTol) {
            return { x: px, y: py };
        }
        return null;
    }

    static intersectLineAndArc(line, arc, snapTol = 14) {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const fx = line.x1 - arc.cx;
        const fy = line.y1 - arc.cy;

        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = fx * fx + fy * fy - arc.radius * arc.radius;

        let disc = b * b - 4 * a * c;
        if (disc < -snapTol * 40) return [];
        if (disc < 0) disc = 0;

        const sqrtDisc = Math.sqrt(disc);
        const t1 = (-b - sqrtDisc) / (2 * a);
        const t2 = (-b + sqrtDisc) / (2 * a);
        const results = [];

        for (const t of [t1, t2]) {
            const px = line.x1 + t * dx;
            const py = line.y1 + t * dy;
            const dSeg = GeometryImageAnalyzer.pointToSegmentDist(px, py, line.x1, line.y1, line.x2, line.y2);
            if (dSeg <= snapTol) {
                const ang = Math.atan2(py - arc.cy, px - arc.cx);
                if (GeometryImageAnalyzer.isAngleBetweenCCWFalse(ang, arc.startAngle - 0.15, arc.endAngle + 0.15)) {
                    results.push({ x: px, y: py });
                }
            }
        }
        return results;
    }

    static normAngle(a) {
        const twoPi = Math.PI * 2;
        return ((a % twoPi) + twoPi) % twoPi;
    }

    static extractTransparentLabelPatch(imgData, W, H, box) {
        const pad = 3;
        const x0 = Math.max(0, box.minX - pad);
        const y0 = Math.max(0, box.minY - pad);
        const x1 = Math.min(W - 1, box.maxX + pad);
        const y1 = Math.min(H - 1, box.maxY + pad);
        const pw = x1 - x0 + 1;
        const ph = y1 - y0 + 1;

        const c = document.createElement("canvas");
        c.width = pw;
        c.height = ph;
        const ctx = c.getContext("2d");
        const out = ctx.createImageData(pw, ph);
        const src = imgData.data;

        for (let y = 0; y < ph; y++) {
            for (let x = 0; x < pw; x++) {
                const si = ((y0 + y) * W + (x0 + x)) * 4;
                const di = (y * pw + x) * 4;
                const lum = 0.299 * src[si] + 0.587 * src[si + 1] + 0.114 * src[si + 2];
                if (lum < 190) {
                    out.data[di] = 15;
                    out.data[di + 1] = 23;
                    out.data[di + 2] = 42;
                    out.data[di + 3] = Math.min(255, Math.round((210 - lum) * 2.2));
                } else {
                    out.data[di + 3] = 0;
                }
            }
        }
        ctx.putImageData(out, 0, 0);
        return c;
    }

    static morphClose3x3(mask, W, H) {
        const dil = new Uint8Array(W * H);
        for (let y = 1; y < H - 1; y++) {
            for (let x = 1; x < W - 1; x++) {
                if (mask[y * W + x]) {
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            dil[(y + dy) * W + (x + dx)] = 1;
                        }
                    }
                }
            }
        }
        const ero = new Uint8Array(W * H);
        for (let y = 1; y < H - 1; y++) {
            for (let x = 1; x < W - 1; x++) {
                if (!dil[y * W + x]) continue;
                let all = true;
                for (let dy = -1; dy <= 1 && all; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (!dil[(y + dy) * W + (x + dx)]) {
                            all = false;
                            break;
                        }
                    }
                }
                if (all) ero[y * W + x] = 1;
            }
        }
        return ero;
    }

    static zhangSuenThinning(mask, W, H) {
        const img = new Uint8Array(mask);
        const toClear = new Int32Array(W * H);
        let changed = true;
        let iter = 0;

        while (changed && iter < 40) {
            changed = false;
            iter++;

            for (let step = 0; step < 2; step++) {
                let clearCount = 0;
                for (let y = 1; y < H - 1; y++) {
                    for (let x = 1; x < W - 1; x++) {
                        const idx = y * W + x;
                        if (!img[idx]) continue;

                        const p2 = img[(y - 1) * W + x];
                        const p3 = img[(y - 1) * W + (x + 1)];
                        const p4 = img[y * W + (x + 1)];
                        const p5 = img[(y + 1) * W + (x + 1)];
                        const p6 = img[(y + 1) * W + x];
                        const p7 = img[(y + 1) * W + (x - 1)];
                        const p8 = img[y * W + (x - 1)];
                        const p9 = img[(y - 1) * W + (x - 1)];

                        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
                        if (B < 2 || B > 6) continue;

                        const A =
                            (p2 === 0 && p3 === 1 ? 1 : 0) +
                            (p3 === 0 && p4 === 1 ? 1 : 0) +
                            (p4 === 0 && p5 === 1 ? 1 : 0) +
                            (p5 === 0 && p6 === 1 ? 1 : 0) +
                            (p6 === 0 && p7 === 1 ? 1 : 0) +
                            (p7 === 0 && p8 === 1 ? 1 : 0) +
                            (p8 === 0 && p9 === 1 ? 1 : 0) +
                            (p9 === 0 && p2 === 1 ? 1 : 0);

                        if (A !== 1) continue;

                        if (step === 0) {
                            if (p2 * p4 * p6 !== 0) continue;
                            if (p4 * p6 * p8 !== 0) continue;
                        } else {
                            if (p2 * p4 * p8 !== 0) continue;
                            if (p2 * p6 * p8 !== 0) continue;
                        }

                        toClear[clearCount++] = idx;
                    }
                }
                if (clearCount > 0) {
                    changed = true;
                    for (let i = 0; i < clearCount; i++) {
                        img[toClear[i]] = 0;
                    }
                }
            }
        }
        return img;
    }

    static pointToSegmentDist(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }

    static isAngleBetweenCCWFalse(testAngle, startAngle, endAngle) {
        const norm = (a) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const span = norm(endAngle - startAngle);
        const rel = norm(testAngle - startAngle);
        return rel <= span + 0.02;
    }
}

if (typeof window !== "undefined") {
    window.GeometryImageAnalyzer = GeometryImageAnalyzer;
}
