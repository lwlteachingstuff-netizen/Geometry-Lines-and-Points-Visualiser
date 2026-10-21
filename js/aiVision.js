/**
 * Multimodal AI Vision Diagram Extractor (Google Gemini Vision & OpenAI Vision)
 * Geometry Diagram Visualiser - Created by LWL
 *
 * Features:
 * 1. Dynamic Gemini Model Discovery via `/v1beta/models` + automatic fallback cascade.
 * 2. Native 0..1000 normalized spatial coordinate extraction.
 * 3. Strictly separates structural geometry vertices/lines/circle-arcs from decorative
 *    corner angle markers (so fake points like `A_arc_p1`, `D_arc_p2` are NEVER created).
 * 4. Automatic 3-point Circular Arc reconstruction for true structural arcs/circles
 *    and automatic clean angle-arc attachment for angle annotations (`33°`, `122°`, `1 rad`, etc.).
 */

class AIVisionDiagramExtractor {
    static getSavedConfig() {
        try {
            const raw = localStorage.getItem("lwl_geometry_ai_config");
            if (raw) return JSON.parse(raw);
        } catch (_) {}
        return {
            provider: "gemini",
            apiKey: "",
            model: "auto"
        };
    }

    static saveConfig(config) {
        try {
            localStorage.setItem("lwl_geometry_ai_config", JSON.stringify(config));
        } catch (_) {}
    }

    static async getAvailableGeminiModels(apiKey) {
        const defaultFallbacks = [
            "gemini-flash-latest",
            "gemini-3-flash-preview",
            "gemini-2.5-flash-lite",
            "gemini-2.5-pro",
            "gemini-pro-latest",
            "gemini-2.0-flash",
            "gemini-1.5-flash-latest"
        ];

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
            const resp = await fetch(url);
            if (!resp.ok) return defaultFallbacks;
            const data = await resp.json();
            if (!data.models || !Array.isArray(data.models)) return defaultFallbacks;

            const excludedKeywords = [
                "embedding", "tts", "imagen", "veo", "aqa",
                "audio", "bisheng", "robotics", "computer-use", "gemma", "learnlm"
            ];

            const discovered = data.models
                .filter(m => {
                    const name = (m.name || "").toLowerCase();
                    const methods = m.supportedGenerationMethods || [];
                    if (!methods.includes("generateContent")) return false;
                    if (!name.includes("gemini")) return false;
                    if (excludedKeywords.some(kw => name.includes(kw))) return false;
                    return true;
                })
                .map(m => m.name.replace(/^models\//, ""));

            if (discovered.length === 0) return defaultFallbacks;

            const scoreModel = (name) => {
                const n = name.toLowerCase();
                let score = 0;
                if (n.includes("gemini-3")) score += 50;
                else if (n.includes("gemini-2.5")) score += 40;
                else if (n.includes("latest")) score += 35;
                else if (n.includes("gemini-2.0")) score += 25;
                if (n.includes("flash")) score += 15;
                if (n.includes("pro")) score += 10;
                return score;
            };

            discovered.sort((a, b) => scoreModel(b) - scoreModel(a));

            const combined = [...discovered];
            for (const fb of defaultFallbacks) {
                if (!combined.includes(fb)) combined.push(fb);
            }
            return combined;
        } catch (_) {
            return defaultFallbacks;
        }
    }

    static async analyzeCanvasWithAIVision(canvas900x620, config, cvHints = null) {
        const W = 900;
        const H = 620;
        const dataUrl = canvas900x620.toDataURL("image/png");
        const base64Data = dataUrl.split(",")[1];

        let hintText = "";
        if (cvHints && cvHints.points && cvHints.points.length > 0) {
            const samplePts = cvHints.points.slice(0, 14).map(p =>
                `(${Math.round((p.x / W) * 1000)}, ${Math.round((p.y / H) * 1000)})`
            ).join(", ");
            hintText = `\nComputer Vision detected candidate main vertices near these 0..1000 coordinates: ${samplePts}.`;
        }

        const systemPrompt = `You are an expert mathematical geometry diagram analyzer.
Examine the uploaded image and extract ONLY the geometry diagram(s), ignoring any question sentences.
Use a 0 to 1000 normalized coordinate system where:
- x = 0 is the left edge, x = 1000 is the right edge
- y = 0 is the top edge, y = 1000 is the bottom edge${hintText}

Return ONLY valid JSON matching this exact structure:
{
  "diagramBox": { "minX": 50, "minY": 50, "maxX": 950, "maxY": 950 },
  "points": [
    { "id": "A", "label": "A", "x": 150, "y": 720 },
    { "id": "B", "label": "B", "x": 495, "y": 355 },
    { "id": "C", "label": "C", "x": 785, "y": 895 },
    { "id": "NA", "label": "North", "x": 168, "y": 360, "isArrowTip": true },
    { "id": "NB", "label": "North", "x": 502, "y": 135, "isArrowTip": true }
  ],
  "edges": [
    { "type": "line", "p1": "A", "p2": "B", "name": "Line AB" },
    { "type": "line", "p1": "B", "p2": "C", "name": "Line BC" },
    { "type": "line", "p1": "A", "p2": "C", "name": "Line AC" },
    { "type": "line", "p1": "A", "p2": "NA", "name": "North Line at A", "arrow": "end" },
    { "type": "line", "p1": "B", "p2": "NB", "name": "North Line at B", "arrow": "end" }
  ],
  "annotations": [
    { "type": "value", "text": "8 km", "x": 315, "y": 445 },
    { "type": "value", "text": "11 km", "x": 680, "y": 545 },
    { "type": "value", "text": "13 km", "x": 410, "y": 840 },
    { "type": "angle", "text": "60°", "vertex": "A", "x": 195, "y": 530 }
  ]
}

CRITICAL RULES — READ CAREFULLY:
1. ALWAYS EXTRACT NORTH LINES, COMPASS RAYS & ARROWS:
   - If the diagram has "North" (or "N", "South", "East", "West") lines or directional arrow rays starting from a vertex (like A or B), YOU MUST include a point at the tip of EACH arrow (e.g. "id": "NA", "label": "North", "isArrowTip": true for the North arrow above A, and "id": "NB", "label": "North", "isArrowTip": true for the North arrow above B) AND include the line segment in "edges" with "arrow": "end" (e.g. { "type": "line", "p1": "A", "p2": "NA", "name": "North Line at A", "arrow": "end" }).
   - If any other line has an arrowhead at its end, start, both ends, or middle (parallel line mark), set "arrow": "end" | "start" | "both" | "mid". If a line is dashed/dotted, set "dashed": true.
2. NEVER create points or edges for small corner angle indicator arcs (such as the small curved arc next to "60°", "122°", "33°", "45°", "1 rad", "0.8 rad")! NEVER invent points like "A_arc_p1", "A_arc_p2", "D_arc_p1", etc.!
3. Small angle indicator arcs (both labeled ones like "60°" and unlabelled target bearing/angle arcs like the angle arc at B) MUST ONLY be placed in "annotations" with "type": "angle", "vertex" set to the corner point ID (e.g. "A", "B", "C", "D", "O"), and (x, y) placed inside that angle sector between the two lines. If an angle arc has no text label, set "text": "".
4. In "edges", only use "type": "arc" when the main geometry shape itself is a circle, semicircle, or circular sector (like a circle with centre O or a large sector OAB). For any such true structural circular arc between "p1" and "p2", provide "viaX" and "viaY" (the 0..1000 coordinates of the midpoint on that circular arc).
5. If a real labeled vertex lies in the middle of a structural line (for example, points Q and R lie on line PO), split the line at those real vertices (e.g. PQ, QR, RO).`;

        let rawJsonText = "";
        let usedModelName = "";

        if (config.provider === "gemini") {
            const candidateModels = await AIVisionDiagramExtractor.getAvailableGeminiModels(config.apiKey);
            let lastError = null;

            for (const modelName of candidateModels) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
                    const resp = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [
                                {
                                    parts: [
                                        { text: systemPrompt },
                                        {
                                            inline_data: {
                                                mime_type: "image/png",
                                                data: base64Data
                                            }
                                        }
                                    ]
                                }
                            ],
                            generationConfig: {
                                temperature: 0.1,
                                responseMimeType: "application/json"
                            }
                        })
                    });

                    if (!resp.ok) {
                        const errText = await resp.text();
                        lastError = new Error(`Model ${modelName} (${resp.status}): ${errText.slice(0, 140)}`);
                        if (resp.status === 404 || resp.status === 400 || resp.status === 503) {
                            continue;
                        }
                        throw lastError;
                    }

                    const json = await resp.json();
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    if (text) {
                        rawJsonText = text;
                        usedModelName = modelName;
                        break;
                    }
                } catch (err) {
                    lastError = err;
                }
            }

            if (!rawJsonText) {
                throw lastError || new Error("No Gemini Vision model succeeded for this API key.");
            }
        } else {
            const models = ["gpt-4o", "gpt-4o-mini"];
            let lastError = null;

            for (const modelName of models) {
                try {
                    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${config.apiKey}`
                        },
                        body: JSON.stringify({
                            model: modelName,
                            temperature: 0.1,
                            response_format: { type: "json_object" },
                            messages: [
                                {
                                    role: "user",
                                    content: [
                                        { type: "text", text: systemPrompt },
                                        { type: "image_url", image_url: { url: dataUrl } }
                                    ]
                                }
                            ]
                        })
                    });
                    if (!resp.ok) {
                        const errText = await resp.text();
                        lastError = new Error(`OpenAI (${resp.status}): ${errText.slice(0, 140)}`);
                        continue;
                    }
                    const json = await resp.json();
                    rawJsonText = json.choices?.[0]?.message?.content || "";
                    usedModelName = modelName;
                    if (rawJsonText) break;
                } catch (err) {
                    lastError = err;
                }
            }

            if (!rawJsonText) {
                throw lastError || new Error("OpenAI Vision request failed.");
            }
        }

        const parsed = AIVisionDiagramExtractor.safeParseJSON(rawJsonText);
        return AIVisionDiagramExtractor.buildGeometryFromAIResponse(parsed, W, H, usedModelName);
    }

    static safeParseJSON(rawText) {
        let cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleaned = cleaned.slice(firstBrace, lastBrace + 1);
        }
        return JSON.parse(cleaned);
    }

    /**
     * Converts the AI's 0..1000 normalized geometry response into exact 900x620 world coordinates,
     * filters out any synthetic `_arc_` / angle-marker points, fits 3-point circles for true
     * structural arcs, and attaches neat textbook angle arcs to angle annotations!
     */
    static buildGeometryFromAIResponse(parsed, W, H, usedModelName = "") {
        const rawPts = Array.isArray(parsed.points) ? parsed.points : [];
        const rawEdges = Array.isArray(parsed.edges) ? parsed.edges : [];
        const rawAnns = Array.isArray(parsed.annotations) ? parsed.annotations : [];

        const toWorldX = (x) => Math.round(((Number(x) || 0) / 1000) * W * 10) / 10;
        const toWorldY = (y) => Math.round(((Number(y) || 0) / 1000) * H * 10) / 10;

        // 1. Filter out any fake angle-marker points (e.g. A_arc_p1, D_arc_p2, angle_p1, etc.)
        //    while keeping North / compass arrow points (NA, NB, North, etc.)
        const isFakeArcPointName = (str) => {
            const s = String(str || "").toLowerCase().trim();
            return (
                s.includes("_arc") ||
                s.includes("arc_") ||
                s.includes("angle") ||
                s.includes("_p1") ||
                s.includes("_p2") ||
                s.includes("marker") ||
                s.includes("tick")
            );
        };

        const isCompassOrArrowLabel = (idStr, labelStr) => {
            const idL = String(idStr || "").toLowerCase().trim();
            const lbL = String(labelStr || "").toLowerCase().trim();
            if (/^(north|south|east|west)$/.test(lbL)) return true;
            if (/^n[a-z0-9_]+$/.test(idL) && (lbL === "north" || lbL === "n" || idL.startsWith("north"))) return true;
            return false;
        };

        const points = [];
        for (let idx = 0; idx < rawPts.length; idx++) {
            const p = rawPts[idx];
            const rawId = String(p.id || p.label || `P${idx + 1}`).trim();
            const label = String(p.label || rawId).trim();
            if (isFakeArcPointName(rawId) || isFakeArcPointName(label)) {
                continue; // Skip fake angle-arc helper points!
            }
            // Ensure unique point ID even if multiple points share label "North"
            let id = rawId;
            if (points.some(existing => existing.id === id)) {
                id = `${rawId}_${idx + 1}`;
            }
            const arrowTip = !!p.isArrowTip || isCompassOrArrowLabel(id, label);
            points.push({
                id,
                label,
                x: toWorldX(p.x),
                y: toWorldY(p.y),
                isArrowTip: arrowTip,
                showLabel: true,
                labelOffset: { dx: 0, dy: -18 },
                focused: false,
                focusColor: null
            });
        }

        const getPt = (id) => points.find(p => p.id === id) || points.find(p => p.label === id);

        const initialLines = [];
        const arcs = [];
        let edgeCount = 0;

        for (const e of rawEdges) {
            const p1Str = String(e.p1 || "").trim();
            const p2Str = String(e.p2 || "").trim();
            if (isFakeArcPointName(p1Str) || isFakeArcPointName(p2Str)) {
                continue; // Skip any fake angle-marker arc edge!
            }

            const u = getPt(p1Str);
            const v = getPt(p2Str);
            if (!u || !v || u.id === v.id) continue;

            if (e.type === "arc") {
                const chordLen = Math.hypot(v.x - u.x, v.y - u.y);
                if (chordLen < 42) {
                    continue; // Ignore tiny corner angle indicator arcs (< 42px chord)
                }

                edgeCount++;
                const viaX = e.viaX !== undefined ? toWorldX(e.viaX) : null;
                const viaY = e.viaY !== undefined ? toWorldY(e.viaY) : null;

                if (viaX !== null && viaY !== null) {
                    const circle = AIVisionDiagramExtractor.fitCircle3Points(u, { x: viaX, y: viaY }, v);
                    if (circle && circle.radius >= 45 && circle.radius <= 1800) {
                        const a1 = Math.atan2(u.y - circle.cy, u.x - circle.cx);
                        const a2 = Math.atan2(v.y - circle.cy, v.x - circle.cx);
                        const aMid = Math.atan2(viaY - circle.cy, viaX - circle.cx);
                        const ccw = !AIVisionDiagramExtractor.isAngleBetweenCCWFalse(aMid, a1, a2);
                        arcs.push({
                            id: `arc_${u.id}_${v.id}_${edgeCount}`,
                            type: "arc",
                            p1: u.id,
                            p2: v.id,
                            center: { x: circle.cx, y: circle.cy },
                            radius: circle.radius,
                            startAngle: a1,
                            endAngle: a2,
                            ccw,
                            arrow: e.arrow || null,
                            name: e.name || `Arc ${u.label}${v.label}`,
                            focused: false,
                            focusColor: null
                        });
                        continue;
                    }
                }

                if (e.center && e.radius) {
                    const cx = toWorldX(e.center.x);
                    const cy = toWorldY(e.center.y);
                    const r = Math.hypot(u.x - cx, u.y - cy);
                    if (r >= 45) {
                        const a1 = Math.atan2(u.y - cy, u.x - cx);
                        const a2 = Math.atan2(v.y - cy, v.x - cx);
                        arcs.push({
                            id: `arc_${u.id}_${v.id}_${edgeCount}`,
                            type: "arc",
                            p1: u.id,
                            p2: v.id,
                            center: { x: cx, y: cy },
                            radius: r,
                            startAngle: a1,
                            endAngle: a2,
                            ccw: !!e.ccw,
                            arrow: e.arrow || null,
                            name: e.name || `Arc ${u.label}${v.label}`,
                            focused: false,
                            focusColor: null
                        });
                    }
                }
            } else {
                // Determine if one of the endpoints is a North/compass arrow tip
                let arrowMode = e.arrow || null;
                let lineStart = u;
                let lineEnd = v;
                if (u.isArrowTip && !v.isArrowTip) {
                    // Orient ray from vertex v -> arrow tip u so arrow is always at 'end'
                    lineStart = v;
                    lineEnd = u;
                    if (!arrowMode) arrowMode = "end";
                } else if (v.isArrowTip && !u.isArrowTip) {
                    if (!arrowMode) arrowMode = "end";
                }
                initialLines.push({
                    u: lineStart,
                    v: lineEnd,
                    name: e.name || (lineEnd.isArrowTip ? `${lineEnd.label} Line at ${lineStart.label}` : `Line ${lineStart.label}${lineEnd.label}`),
                    arrow: arrowMode,
                    dashed: !!e.dashed
                });
            }
        }

        // Fallback safeguard: if AI placed "North" in annotations without creating a North ray point/edge,
        // automatically synthesize the vertical North line & arrow from the vertex directly below it!
        const remainingAnns = [];
        for (const a of rawAnns) {
            const txt = String(a.text || "").trim();
            if (/^north$/i.test(txt)) {
                const nx = toWorldX(a.x);
                const ny = toWorldY(a.y);
                const alreadyHasNorthPt = points.some(p => p.isArrowTip && Math.hypot(p.x - nx, p.y - ny) < 65);
                if (!alreadyHasNorthPt) {
                    // Find vertex below this "North" label
                    let baseVertex = null;
                    let bestScore = Infinity;
                    for (const pt of points) {
                        if (pt.isArrowTip) continue;
                        const dx = Math.abs(pt.x - nx);
                        const dy = pt.y - ny;
                        if (dx <= 55 && dy >= 35 && dx + dy * 0.25 < bestScore) {
                            bestScore = dx + dy * 0.25;
                            baseVertex = pt;
                        }
                    }
                    if (baseVertex) {
                        const northPtId = `N_${baseVertex.id}`;
                        const tipPt = {
                            id: northPtId,
                            label: "North",
                            x: baseVertex.x,
                            y: Math.max(24, ny + 18),
                            isArrowTip: true,
                            showLabel: true,
                            labelOffset: { dx: 0, dy: -20 },
                            focused: false,
                            focusColor: null
                        };
                        points.push(tipPt);
                        initialLines.push({
                            u: baseVertex,
                            v: tipPt,
                            name: `North Line at ${baseVertex.label}`,
                            arrow: "end",
                            dashed: false
                        });
                        continue; // Consumed as a real North arrow point + line!
                    }
                } else {
                    continue; // Already represented by a North arrow point
                }
            }
            remainingAnns.push(a);
        }

        // Check for genuine interior line-line intersections (hidden label so no clutter)
        let interIdx = 1;
        for (let i = 0; i < initialLines.length; i++) {
            for (let j = i + 1; j < initialLines.length; j++) {
                const l1 = initialLines[i];
                const l2 = initialLines[j];
                if (l1.u.id === l2.u.id || l1.u.id === l2.v.id || l1.v.id === l2.u.id || l1.v.id === l2.v.id) {
                    continue;
                }
                const inter = AIVisionDiagramExtractor.findInteriorIntersection(l1.u, l1.v, l2.u, l2.v);
                if (inter) {
                    const nearExisting = points.find(p => Math.hypot(p.x - inter.x, p.y - inter.y) <= 18);
                    if (!nearExisting) {
                        const newId = `X${interIdx++}`;
                        points.push({
                            id: newId,
                            label: newId,
                            x: Math.round(inter.x * 10) / 10,
                            y: Math.round(inter.y * 10) / 10,
                            showLabel: false, // Do not draw synthetic label text on canvas
                            labelOffset: { dx: 14, dy: -12 },
                            focused: false,
                            focusColor: null
                        });
                    }
                }
            }
        }

        // Split every line segment ONLY at real vertices lying along it
        const finalEdges = [];
        for (const line of initialLines) {
            const pStart = line.u;
            const pEnd = line.v;
            const dx = pEnd.x - pStart.x;
            const dy = pEnd.y - pStart.y;
            const len = Math.hypot(dx, dy);
            if (len < 12) continue;

            const onSeg = [];
            for (const pt of points) {
                const d = AIVisionDiagramExtractor.pointToSegmentDist(pt.x, pt.y, pStart.x, pStart.y, pEnd.x, pEnd.y);
                if (d <= 8.5) {
                    const t = ((pt.x - pStart.x) * dx + (pt.y - pStart.y) * dy) / (len * len);
                    if (t >= -0.03 && t <= 1.03) {
                        onSeg.push({ pt, t });
                    }
                }
            }

            onSeg.sort((a, b) => a.t - b.t);
            const numSegs = onSeg.length - 1;
            for (let k = 0; k < numSegs; k++) {
                const a = onSeg[k].pt;
                const b = onSeg[k + 1].pt;
                if (a.id === b.id) continue;
                const exists = finalEdges.some(
                    fe => fe.type === "line" && ((fe.p1 === a.id && fe.p2 === b.id) || (fe.p1 === b.id && fe.p2 === a.id))
                );
                if (!exists) {
                    edgeCount++;
                    let segArrow = null;
                    if (line.arrow === "end" && k === numSegs - 1) segArrow = "end";
                    else if (line.arrow === "start" && k === 0) segArrow = "start";
                    else if (line.arrow === "both") {
                        if (numSegs === 1) segArrow = "both";
                        else if (k === 0) segArrow = "start";
                        else if (k === numSegs - 1) segArrow = "end";
                    } else if (line.arrow === "mid") {
                        segArrow = "mid";
                    }
                    const isNorthRay = b.isArrowTip || a.isArrowTip;
                    const defaultName = isNorthRay
                        ? (line.name || `${b.isArrowTip ? b.label : a.label} Line at ${b.isArrowTip ? a.label : b.label}`)
                        : `Line ${a.label}${b.label}`;
                    finalEdges.push({
                        id: `seg_${a.id}_${b.id}_${edgeCount}`,
                        type: "line",
                        p1: a.id,
                        p2: b.id,
                        arrow: segArrow,
                        dashed: !!line.dashed,
                        name: numSegs === 1 && line.name ? line.name : defaultName,
                        focused: false,
                        focusColor: null
                    });
                }
            }
        }

        for (const arc of arcs) {
            finalEdges.push(arc);
        }

        // Compute outward point label offsets from diagram centroid so point labels never overlap lines
        if (points.length > 0) {
            const nonArrowPts = points.filter(p => !p.isArrowTip);
            const refPts = nonArrowPts.length > 0 ? nonArrowPts : points;
            const cx = refPts.reduce((s, p) => s + p.x, 0) / refPts.length;
            const cy = refPts.reduce((s, p) => s + p.y, 0) / refPts.length;
            for (const p of points) {
                if (p.isArrowTip) {
                    // Place "North" / arrow label directly beyond the arrowhead tip
                    const parentEdge = finalEdges.find(e => e.type === "line" && (e.p2 === p.id || e.p1 === p.id));
                    if (parentEdge) {
                        const otherId = parentEdge.p2 === p.id ? parentEdge.p1 : parentEdge.p2;
                        const otherPt = points.find(pt => pt.id === otherId);
                        if (otherPt) {
                            const rdx = p.x - otherPt.x;
                            const rdy = p.y - otherPt.y;
                            const rLen = Math.hypot(rdx, rdy) || 1;
                            p.labelOffset = {
                                dx: Math.round((rdx / rLen) * 20),
                                dy: Math.round((rdy / rLen) * 20)
                            };
                            continue;
                        }
                    }
                    p.labelOffset = { dx: 0, dy: -20 };
                    continue;
                }
                const vx = p.x - cx;
                const vy = p.y - cy;
                const len = Math.hypot(vx, vy) || 1;
                p.labelOffset = {
                    dx: Math.round((vx / len) * 22),
                    dy: Math.round((vy / len) * 22)
                };
            }
        }

        // Build annotations and automatically compute clean textbook angle arcs for angle values
        const annotations = remainingAnns.map((a, idx) => {
            const text = String(a.text || "").trim();
            const ax = toWorldX(a.x);
            const ay = toWorldY(a.y);
            const isAngleText = a.type === "angle" || /°|rad|deg/i.test(text);

            if (isAngleText) {
                // Find the vertex for this angle (either specified by a.vertex or nearest non-arrow point within 110px)
                let vPt = a.vertex ? getPt(String(a.vertex).trim()) : null;
                if (!vPt) {
                    let bestD = 110;
                    for (const pt of points) {
                        if (pt.isArrowTip) continue;
                        const d = Math.hypot(pt.x - ax, pt.y - ay);
                        if (d < bestD) {
                            bestD = d;
                            vPt = pt;
                        }
                    }
                }

                if (vPt) {
                    const angleArc = AIVisionDiagramExtractor.computeVertexAngleArc(vPt, ax, ay, finalEdges, points);
                    if (angleArc) {
                        return {
                            id: `ann_${idx + 1}`,
                            type: "angle",
                            vertex: vPt.id,
                            text,
                            x: ax,
                            y: ay,
                            arcRadius: angleArc.radius,
                            startAngle: angleArc.startAngle,
                            endAngle: angleArc.endAngle,
                            focused: false,
                            focusColor: null
                        };
                    }
                }
            }

            return {
                id: `ann_${idx + 1}`,
                type: "value",
                text,
                x: ax,
                y: ay,
                focused: false,
                focusColor: null
            };
        });

        return {
            points,
            edges: finalEdges,
            annotations,
            usedModelName
        };
    }

    /**
     * Computes a clean textbook angle arc at vertex `vPt` between the two structural lines
     * (including North lines!) meeting at `vPt` that enclose the angle label position `(ax, ay)`.
     */
    static computeVertexAngleArc(vPt, ax, ay, edges, points) {
        const incidentAngles = [];
        for (const e of edges) {
            if (e.type !== "line") continue;
            let otherId = null;
            if (e.p1 === vPt.id) otherId = e.p2;
            else if (e.p2 === vPt.id) otherId = e.p1;
            if (!otherId) continue;
            const otherPt = points.find(p => p.id === otherId);
            if (!otherPt) continue;
            incidentAngles.push(Math.atan2(otherPt.y - vPt.y, otherPt.x - vPt.x));
        }

        if (incidentAngles.length < 2) return null;

        const labelAngle = Math.atan2(ay - vPt.y, ax - vPt.x);
        const norm = (ang) => ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        // Sort ray angles around vertex and find the sector containing labelAngle
        const sorted = incidentAngles.map(a => norm(a)).sort((a, b) => a - b);
        const target = norm(labelAngle);

        for (let i = 0; i < sorted.length; i++) {
            const a1 = sorted[i];
            const a2 = sorted[(i + 1) % sorted.length];
            const span = norm(a2 - a1);
            const rel = norm(target - a1);
            if (rel <= span && span < Math.PI * 1.65) {
                const distToLabel = Math.hypot(ax - vPt.x, ay - vPt.y);
                const radius = Math.max(18, Math.min(34, distToLabel * 0.55));
                return {
                    startAngle: a1,
                    endAngle: a1 + span,
                    radius
                };
            }
        }
        return null;
    }

    static findInteriorIntersection(p1, p2, p3, p4) {
        const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
        const x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-4) return null;

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

        if (t > 0.06 && t < 0.94 && u > 0.06 && u < 0.94) {
            return {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            };
        }
        return null;
    }

    static fitCircle3Points(p1, p2, p3) {
        const x1 = p1.x, y1 = p1.y;
        const x2 = p2.x, y2 = p2.y;
        const x3 = p3.x, y3 = p3.y;
        const D = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
        if (Math.abs(D) < 1e-5) return null;

        const s1 = x1 * x1 + y1 * y1;
        const s2 = x2 * x2 + y2 * y2;
        const s3 = x3 * x3 + y3 * y3;

        const cx = (s1 * (y2 - y3) + s2 * (y3 - y1) + s3 * (y1 - y2)) / D;
        const cy = (s1 * (x3 - x2) + s2 * (x1 - x3) + s3 * (x2 - x1)) / D;
        const radius = Math.hypot(x1 - cx, y1 - cy);
        return { cx, cy, radius };
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
    window.AIVisionDiagramExtractor = AIVisionDiagramExtractor;
}
