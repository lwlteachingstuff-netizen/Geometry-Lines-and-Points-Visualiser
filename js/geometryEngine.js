/**
 * Interactive Geometry Diagram Visualiser Engine
 * Created by LWL
 *
 * Implements the 5-step geometry visualiser workflow:
 * - Blank Slate initial state (shown first before inserting any image)
 * - Step 1: Insert geometry problem diagram (Built-in PDF Problem or Custom Image Upload/Paste)
 * - Step 2: Ignore the question (Website automatically strips question text & isolates diagram)
 * - Step 3: Website automatically creates the clickable lines, points, and stated values
 * - Step 4: User clicks lines (or points/values) to HIGHLIGHT in a DIFFERENT COLOR;
 *           click again to delete from focus
 * - Step 5: User colors the shape formed by the highlighted lines IF they form a closed shape
 * - Smooth Zoom In / Zoom Out & Pan controls
 */

class GeometryVisualiserEngine {
    constructor(canvas, callbacks = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.callbacks = callbacks;

        // Logical coordinate space
        this.worldWidth = 900;
        this.worldHeight = 620;

        // Blank Slate initial state
        this.hasDiagram = false;
        this.currentStep = 1; // 1 to 5
        this.activePresetId = null;

        // Background problem images for Step 1 & Step 2
        this.step1Image = null; // Full problem image with question text
        this.step2Image = null; // Isolated diagram image (question ignored automatically)
        this.bgImageOpacity = 0.0; // 0 = clean reconstructed diagram like PDF Page 2 & 3

        // Automatically generated clickable geometry elements (Step 3)
        this.points = [];      // { id, label, x, y, labelOffset, focused, focusColor }
        this.edges = [];       // { id, type: 'line'|'arc', p1, p2, name, focused, focusColor, ... }
        this.annotations = []; // { id, type: 'value'|'angle'|'right_angle', text, x, y, focused, focusColor, ... }

        // Highlight & Fill Colors (Step 4 & Step 5)
        this.selectedLineColor = "#2563eb"; // Default Electric Blue (matches PDF Step 4)
        this.selectedFillColor = "#ef4444"; // Default Crimson Red (matches PDF Step 5)
        this.selectedFillStyle = "hatch_solid"; // 'hatch_solid' | 'hatch' | 'solid'

        // Diagram Canvas Paper Background Style
        this.canvasPaperStyle = "theme_matched"; // 'theme_matched' | 'white_grid' | 'plain_white' | 'warm_paper' | 'chalkboard' | 'blueprint' | 'custom_color'
        this.themePaperBg = "#fff8f0";
        this.themeGridColor = "rgba(217, 119, 6, 0.14)";
        this.customPaperColor = "#ffffff";
        this.defaultInkColor = "#0f172a";

        // Detected closed cycles & user-colored closed shapes (Step 5)
        this.detectedClosedCycles = [];
        this.coloredShapes = [];

        // Hover state for clickable lines, points, values, and closed shapes
        this.hoveredTarget = null; // { kind: 'edge'|'point'|'annotation'|'cycle', id }

        // Zoom & Pan state
        this.zoom = 1.0;
        this.minZoom = 0.35;
        this.maxZoom = 3.5;
        this.panX = 0;
        this.panY = 0;
        this.panMode = false;
        this.isPanning = false;
        this.panStartMouse = { x: 0, y: 0 };
        this.panStartOffset = { x: 0, y: 0 };

        this.initEvents();
        this.resizeCanvas();
    }

    initEvents() {
        window.addEventListener("resize", () => this.resizeCanvas());

        this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
        this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
        this.canvas.addEventListener("mouseup", () => this.onMouseUp());
        this.canvas.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });

        window.addEventListener("keydown", (e) => {
            if (e.code === "Space" && document.activeElement.tagName !== "INPUT") {
                this.canvas.style.cursor = "grab";
            }
        });
        window.addEventListener("keyup", (e) => {
            if (e.code === "Space") {
                this.isPanning = false;
                this.updateCursor();
            }
        });
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.max(300, Math.floor(rect.width * dpr));
        this.canvas.height = Math.max(250, Math.floor(rect.height * dpr));
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.render();
    }

    /**
     * Converts screen pixel coordinates (relative to canvas element) to logical world coordinates (900x620)
     */
    screenToWorld(sx, sy) {
        const rect = this.canvas.getBoundingClientRect();
        const cw = rect.width;
        const ch = rect.height;

        const baseScale = Math.min((cw - 40) / this.worldWidth, (ch - 40) / this.worldHeight);
        const totalScale = baseScale * this.zoom;

        const centerX = cw / 2 + this.panX;
        const centerY = ch / 2 + this.panY;

        const wx = (sx - centerX) / totalScale + this.worldWidth / 2;
        const wy = (sy - centerY) / totalScale + this.worldHeight / 2;
        return { x: wx, y: wy };
    }

    /**
     * Resets the visualiser back to the initial Blank Slate
     */
    resetToBlankSlate() {
        this.hasDiagram = false;
        this.currentStep = 1;
        this.activePresetId = null;
        this.step1Image = null;
        this.step2Image = null;
        this.points = [];
        this.edges = [];
        this.annotations = [];
        this.detectedClosedCycles = [];
        this.coloredShapes = [];
        this.hoveredTarget = null;
        this.resetZoom();
        this.notifyStateChange();
        this.render();
    }

    /**
     * Step 1: Inserts one of the built-in geometry problem diagrams and automatically prepares
     * Step 2 (question ignored) and Step 3 (website-created clickable lines, points, and values).
     */
    loadPresetDiagram(presetId) {
        const preset = window.GEOMETRY_PRESETS ? window.GEOMETRY_PRESETS[presetId] : null;
        if (!preset) return;

        this.hasDiagram = true;
        this.activePresetId = presetId;
        this.currentStep = 1;

        // Generate Step 1 (with question text) and Step 2 (question ignored) images
        this.step1Image = window.renderPresetProblemImage(preset, true);
        this.step2Image = window.renderPresetProblemImage(preset, false);

        // Website automatically creates all clickable points, lines/arcs, and stated values for Step 3
        this.points = preset.points.map(p => ({
            ...p,
            labelOffset: p.labelOffset ? { ...p.labelOffset } : { dx: 0, dy: -16 },
            focused: false,
            focusColor: null
        }));
        this.edges = preset.edges.map(e => ({
            ...e,
            center: e.center ? { ...e.center } : undefined,
            focused: false,
            focusColor: null
        }));
        this.annotations = preset.annotations.map(a => ({
            ...a,
            focused: false,
            focusColor: null
        }));

        this.detectedClosedCycles = [];
        this.coloredShapes = [];
        this.bgImageOpacity = 0.0;
        this.resetZoom();
        this.notifyStateChange();
        this.render();
    }

    /**
     * Step 1: Loads a user-uploaded or pasted image file, and uses GeometryImageAnalyzer
     * so the website automatically removes the question text (Step 2) and automatically
     * creates the clickable lines, points, and stated values (Step 3).
     */
    loadCustomImage(imgElement) {
        this.hasDiagram = true;
        this.activePresetId = "custom_upload";
        this.currentStep = 1;

        const analyzed = window.GeometryImageAnalyzer.analyzeUploadedImage(imgElement);
        this.step1Image = analyzed.step1Canvas;
        this.step2Image = analyzed.step2Canvas;

        this.points = analyzed.geometry.points.map(p => ({
            ...p,
            focused: false,
            focusColor: null
        }));
        this.edges = analyzed.geometry.edges.map(e => ({
            ...e,
            focused: false,
            focusColor: null
        }));
        this.annotations = analyzed.geometry.annotations.map(a => ({
            ...a,
            focused: false,
            focusColor: null
        }));

        this.detectedClosedCycles = [];
        this.coloredShapes = [];
        this.bgImageOpacity = 0.0;
        this.resetZoom();
        this.notifyStateChange();
        this.render();
    }

    /**
     * Applies geometry identified by the Multimodal AI Vision Extractor
     */
    applyAIVisionGeometry(geometry) {
        if (!geometry) return;
        this.points = (geometry.points || []).map(p => ({
            ...p,
            focused: false,
            focusColor: null
        }));
        this.edges = (geometry.edges || []).map(e => ({
            ...e,
            focused: false,
            focusColor: null
        }));
        this.annotations = (geometry.annotations || []).map(a => ({
            ...a,
            focused: false,
            focusColor: null
        }));
        this.detectedClosedCycles = [];
        this.coloredShapes = [];
        this.recomputeClosedCycles();
        this.notifyStateChange();
        this.render();
    }

    /**
     * Exports the current diagram (images, clickable points, lines/arrows, values, highlights & colored shapes)
     * into a serializable object for saving up to 15 diagrams with 24-hour auto-expiration.
     */
    exportDiagramRecord(customTitle = null, existingId = null) {
        if (!this.hasDiagram) return null;

        const imageToDataUrl = (imgOrCanvas, quality = 0.78) => {
            if (!imgOrCanvas) return null;
            try {
                const c = document.createElement("canvas");
                c.width = this.worldWidth;
                c.height = this.worldHeight;
                const ctx = c.getContext("2d");
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, c.width, c.height);
                ctx.drawImage(imgOrCanvas, 0, 0, c.width, c.height);
                return c.toDataURL("image/jpeg", quality);
            } catch (_) {
                return null;
            }
        };

        // Generate a crisp 180x124 thumbnail of the current canvas view
        let thumbnailDataUrl = null;
        try {
            const thumbCanvas = document.createElement("canvas");
            thumbCanvas.width = 180;
            thumbCanvas.height = 124;
            const tctx = thumbCanvas.getContext("2d");
            tctx.fillStyle = "#ffffff";
            tctx.fillRect(0, 0, 180, 124);
            if (this.step2Image) {
                tctx.globalAlpha = 0.35;
                tctx.drawImage(this.step2Image, 0, 0, 180, 124);
                tctx.globalAlpha = 1.0;
            }
            tctx.drawImage(this.canvas, 0, 0, 180, 124);
            thumbnailDataUrl = thumbCanvas.toDataURL("image/jpeg", 0.75);
        } catch (_) {}

        // Build an automatic descriptive title if none provided
        const realLabels = this.points
            .filter(p => p.showLabel !== false && !p.isArrowTip && p.label)
            .map(p => p.label)
            .slice(0, 5)
            .join("");
        const hasNorth = this.points.some(p => p.isArrowTip && /north/i.test(p.label));
        const autoTitle = customTitle || (
            realLabels
                ? `Diagram ${realLabels}${hasNorth ? " (North)" : ""}`
                : `Diagram (${this.edges.length} lines)`
        );

        const serializedAnns = this.annotations.map(a => {
            const copy = { ...a };
            if (copy.patchCanvas) {
                try {
                    copy.patchDataUrl = copy.patchCanvas.toDataURL("image/png");
                } catch (_) {}
                delete copy.patchCanvas;
            }
            return copy;
        });

        const now = Date.now();
        return {
            id: existingId || `diag_${now}_${Math.random().toString(36).slice(2, 7)}`,
            title: autoTitle,
            createdAt: now,
            expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours in ms
            activePresetId: this.activePresetId,
            currentStep: this.currentStep,
            bgImageOpacity: this.bgImageOpacity,
            thumbnailDataUrl,
            step1DataUrl: imageToDataUrl(this.step1Image, 0.76),
            step2DataUrl: imageToDataUrl(this.step2Image, 0.78),
            points: this.points.map(p => ({ ...p })),
            edges: this.edges.map(e => ({ ...e })),
            annotations: serializedAnns,
            coloredShapes: this.coloredShapes.map(cs => ({
                ...cs,
                edgeIds: [...(cs.edgeIds || [])],
                polyPoints: (cs.polyPoints || []).map(pt => ({ ...pt }))
            }))
        };
    }

    /**
     * Restores a saved diagram record back onto the canvas
     */
    async restoreDiagramRecord(record) {
        if (!record) return;

        const loadImgFromUrl = (dataUrl) => new Promise((resolve) => {
            if (!dataUrl) return resolve(null);
            const img = new Image();
            img.onload = () => {
                const c = document.createElement("canvas");
                c.width = this.worldWidth;
                c.height = this.worldHeight;
                c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
                resolve(c);
            };
            img.onerror = () => resolve(null);
            img.src = dataUrl;
        });

        this.hasDiagram = true;
        this.activePresetId = record.activePresetId || "custom_upload";
        this.currentStep = record.currentStep || 3;
        this.bgImageOpacity = typeof record.bgImageOpacity === "number" ? record.bgImageOpacity : 0.2;

        const [s1, s2] = await Promise.all([
            loadImgFromUrl(record.step1DataUrl),
            loadImgFromUrl(record.step2DataUrl)
        ]);
        this.step1Image = s1;
        this.step2Image = s2 || s1;

        this.points = (record.points || []).map(p => ({ ...p }));
        this.edges = (record.edges || []).map(e => ({ ...e }));

        const restoredAnns = [];
        for (const a of (record.annotations || [])) {
            const copy = { ...a };
            if (copy.patchDataUrl) {
                const patchCanvas = await new Promise((res) => {
                    const pImg = new Image();
                    pImg.onload = () => {
                        const pc = document.createElement("canvas");
                        pc.width = pImg.width;
                        pc.height = pImg.height;
                        pc.getContext("2d").drawImage(pImg, 0, 0);
                        res(pc);
                    };
                    pImg.onerror = () => res(null);
                    pImg.src = copy.patchDataUrl;
                });
                if (patchCanvas) copy.patchCanvas = patchCanvas;
            }
            restoredAnns.push(copy);
        }
        this.annotations = restoredAnns;

        this.recomputeClosedCycles();
        this.coloredShapes = (record.coloredShapes || []).map(cs => ({
            ...cs,
            edgeIds: [...(cs.edgeIds || [])],
            polyPoints: (cs.polyPoints || []).map(pt => ({ ...pt }))
        }));

        this.resetZoom();
        this.notifyStateChange();
        this.render();
    }

    /**
     * Transitions to a given step (1 to 5)
     */
    setStep(stepNumber) {
        if (!this.hasDiagram && stepNumber > 1) {
            if (this.callbacks.onToast) {
                this.callbacks.onToast("Please insert a geometry problem diagram in Step 1 first!", "warning");
            }
            return;
        }
        this.currentStep = Math.max(1, Math.min(5, stepNumber));
        this.recomputeClosedCycles();
        this.updateCursor();
        this.notifyStateChange();
        this.render();
    }

    /**
     * Zoom Controls
     */
    zoomIn() {
        this.setZoom(this.zoom * 1.2);
    }

    zoomOut() {
        this.setZoom(this.zoom / 1.2);
    }

    setZoom(newZoom, focusScreenX = null, focusScreenY = null) {
        const clamped = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
        if (focusScreenX !== null && focusScreenY !== null) {
            const beforeWorld = this.screenToWorld(focusScreenX, focusScreenY);
            this.zoom = clamped;
            const afterWorld = this.screenToWorld(focusScreenX, focusScreenY);
            const rect = this.canvas.getBoundingClientRect();
            const baseScale = Math.min((rect.width - 40) / this.worldWidth, (rect.height - 40) / this.worldHeight);
            const totalScale = baseScale * this.zoom;
            this.panX += (afterWorld.x - beforeWorld.x) * totalScale;
            this.panY += (afterWorld.y - beforeWorld.y) * totalScale;
        } else {
            this.zoom = clamped;
        }
        this.notifyStateChange();
        this.render();
    }

    resetZoom() {
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.notifyStateChange();
        this.render();
    }

    onWheel(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        this.setZoom(this.zoom * factor, sx, sy);
    }

    updateCursor() {
        if (this.panMode || this.isPanning) {
            this.canvas.style.cursor = this.isPanning ? "grabbing" : "grab";
            return;
        }
        if (this.currentStep >= 3) {
            this.canvas.style.cursor = this.hoveredTarget ? "pointer" : "default";
        } else {
            this.canvas.style.cursor = "default";
        }
    }

    /**
     * Hit-Testing Utilities for Clickable Lines, Points, Stated Values, and Closed Shapes
     */
    getPointById(id) {
        return this.points.find(p => p.id === id) || null;
    }

    findClickableTargetAt(wx, wy) {
        const zoomScale = Math.sqrt(this.zoom);

        // In Step 5, check if mouse is inside a closed cycle formed by focused lines first
        if (this.currentStep === 5) {
            // Also allow clicking lines in Step 5 if directly on an edge, or prioritize closed shape interior
            const hitCycle = this.findClosedCycleContainingPoint(wx, wy);
            if (hitCycle) {
                return { kind: "cycle", id: hitCycle.key, item: hitCycle };
            }
        }

        // 1. Check stated values / angle annotations (text position or angle arc)
        for (const ann of this.annotations) {
            if (ann.x !== undefined && ann.y !== undefined) {
                const d = Math.hypot(wx - ann.x, wy - ann.y);
                if (d <= 20 / zoomScale) {
                    return { kind: "annotation", id: ann.id, item: ann };
                }
            }
            if (ann.type === "angle" && ann.vertex && ann.arcRadius) {
                const v = this.getPointById(ann.vertex);
                if (v) {
                    const distV = Math.hypot(wx - v.x, wy - v.y);
                    if (Math.abs(distV - ann.arcRadius) <= 10 / zoomScale) {
                        const ang = Math.atan2(wy - v.y, wx - v.x);
                        if (this.isAngleOnArc(ang, ann.startAngle, ann.endAngle, false)) {
                            return { kind: "annotation", id: ann.id, item: ann };
                        }
                    }
                }
            }
        }

        // 2. Check point labels & vertex dots
        for (const pt of this.points) {
            const lx = pt.x + (pt.labelOffset ? pt.labelOffset.dx : 0);
            const ly = pt.y + (pt.labelOffset ? pt.labelOffset.dy : -16);
            const distLabel = Math.hypot(wx - lx, wy - ly);
            const distDot = Math.hypot(wx - pt.x, wy - pt.y);
            if (distLabel <= 15 / zoomScale || distDot <= 8 / zoomScale) {
                return { kind: "point", id: pt.id, item: pt };
            }
        }

        // 3. Check straight line segments & circular arcs
        let bestEdge = null;
        let bestDist = 14 / zoomScale;
        for (const edge of this.edges) {
            const d = this.distanceToEdge(wx, wy, edge);
            if (d <= bestDist) {
                bestDist = d;
                bestEdge = edge;
            }
        }
        if (bestEdge) {
            return { kind: "edge", id: bestEdge.id, item: bestEdge };
        }

        // 4. Fallback in Step 3/4: if user clicks inside a detected closed shape when already in Step 5
        return null;
    }

    distanceToEdge(wx, wy, edge) {
        if (edge.type === "line") {
            const p1 = this.getPointById(edge.p1);
            const p2 = this.getPointById(edge.p2);
            if (!p1 || !p2) return Infinity;
            return this.pointToSegmentDist(wx, wy, p1.x, p1.y, p2.x, p2.y);
        } else if (edge.type === "arc") {
            const cx = edge.center.x;
            const cy = edge.center.y;
            const r = edge.radius;
            const distToCenter = Math.hypot(wx - cx, wy - cy);
            const radialError = Math.abs(distToCenter - r);
            const angle = Math.atan2(wy - cy, wx - cx);
            if (this.isAngleOnArc(angle, edge.startAngle, edge.endAngle, !!edge.ccw)) {
                return radialError;
            }
            const p1 = this.getPointById(edge.p1);
            const p2 = this.getPointById(edge.p2);
            const d1 = p1 ? Math.hypot(wx - p1.x, wy - p1.y) : Infinity;
            const d2 = p2 ? Math.hypot(wx - p2.x, wy - p2.y) : Infinity;
            return Math.min(d1, d2);
        }
        return Infinity;
    }

    pointToSegmentDist(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        return Math.hypot(px - projX, py - projY);
    }

    normalizeAngle(a) {
        const twoPi = Math.PI * 2;
        return ((a % twoPi) + twoPi) % twoPi;
    }

    isAngleOnArc(testAngle, startAngle, endAngle, ccw = false) {
        const a = this.normalizeAngle(testAngle);
        const s = this.normalizeAngle(startAngle);
        const e = this.normalizeAngle(endAngle);
        if (!ccw) {
            const span = this.normalizeAngle(e - s);
            const rel = this.normalizeAngle(a - s);
            return rel <= span + 0.02;
        } else {
            const span = this.normalizeAngle(s - e);
            const rel = this.normalizeAngle(s - a);
            return rel <= span + 0.02;
        }
    }

    /**
     * Mouse Interaction Handlers
     * In Steps 3 & 4: User clicks any line, point, or stated value to HIGHLIGHT it in the selected color;
     * clicking a highlighted item again deletes it from focus!
     * In Step 5: User clicks inside any closed shape formed by highlighted lines to color it!
     */
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const world = this.screenToWorld(sx, sy);

        if (e.button === 1 || this.panMode || e.shiftKey) {
            this.isPanning = true;
            this.panStartMouse = { x: e.clientX, y: e.clientY };
            this.panStartOffset = { x: this.panX, y: this.panY };
            this.updateCursor();
            return;
        }

        if (!this.hasDiagram || this.currentStep < 3) return;

        const target = this.findClickableTargetAt(world.x, world.y);

        if (this.currentStep === 3 || this.currentStep === 4) {
            if (!target) return;
            if (target.kind === "edge") {
                this.toggleEdgeFocus(target.id);
            } else if (target.kind === "point") {
                this.togglePointFocus(target.id);
            } else if (target.kind === "annotation") {
                this.toggleAnnotationFocus(target.id);
            }
            return;
        }

        if (this.currentStep === 5) {
            if (target && target.kind === "cycle") {
                this.toggleOrColorClosedShape(target.item);
            } else if (target && target.kind === "edge") {
                // Also allow toggling lines in Step 5 if they click an edge directly
                this.toggleEdgeFocus(target.id);
            } else {
                if (this.callbacks.onToast) {
                    if (this.detectedClosedCycles.length === 0) {
                        this.callbacks.onToast(
                            "No closed shape is formed yet! Highlight lines/arcs that form a closed loop first.",
                            "warning"
                        );
                    } else {
                        this.callbacks.onToast(
                            "Click inside a closed region bounded by your highlighted lines to color it!",
                            "info"
                        );
                    }
                }
            }
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const world = this.screenToWorld(sx, sy);

        if (this.isPanning) {
            this.panX = this.panStartOffset.x + (e.clientX - this.panStartMouse.x);
            this.panY = this.panStartOffset.y + (e.clientY - this.panStartMouse.y);
            this.render();
            return;
        }

        if (!this.hasDiagram || this.currentStep < 3) return;

        const target = this.findClickableTargetAt(world.x, world.y);
        const prevKey = this.hoveredTarget ? `${this.hoveredTarget.kind}:${this.hoveredTarget.id}` : null;
        const nextKey = target ? `${target.kind}:${target.id}` : null;

        if (prevKey !== nextKey) {
            this.hoveredTarget = target;
            this.updateCursor();
            this.render();
        }
    }

    onMouseUp() {
        if (this.isPanning) {
            this.isPanning = false;
            this.updateCursor();
        }
    }

    /**
     * Highlight / Unhighlight (Delete from Focus) Methods for Lines, Points, and Values
     */
    toggleEdgeFocus(edgeId) {
        const edge = this.edges.find(e => e.id === edgeId);
        if (!edge) return;

        if (edge.focused) {
            edge.focused = false;
            edge.focusColor = null;
            if (this.callbacks.onToast) {
                this.callbacks.onToast(`Removed ${edge.name} from focus.`, "info");
            }
        } else {
            edge.focused = true;
            edge.focusColor = this.selectedLineColor;
            if (this.callbacks.onToast) {
                this.callbacks.onToast(`Highlighted ${edge.name} in focus!`, "success");
            }
        }

        this.recomputeClosedCycles();
        this.notifyStateChange();
        this.render();
    }

    togglePointFocus(pointId) {
        const pt = this.points.find(p => p.id === pointId);
        if (!pt) return;

        if (pt.focused) {
            pt.focused = false;
            pt.focusColor = null;
            if (this.callbacks.onToast) {
                this.callbacks.onToast(`Removed Point ${pt.label} from focus.`, "info");
            }
        } else {
            pt.focused = true;
            pt.focusColor = this.selectedLineColor;
            if (this.callbacks.onToast) {
                this.callbacks.onToast(`Highlighted Point ${pt.label}!`, "success");
            }
        }
        this.notifyStateChange();
        this.render();
    }

    toggleAnnotationFocus(annId) {
        const ann = this.annotations.find(a => a.id === annId);
        if (!ann) return;

        if (ann.focused) {
            ann.focused = false;
            ann.focusColor = null;
            if (this.callbacks.onToast) {
                this.callbacks.onToast(`Removed value "${ann.text}" from focus.`, "info");
            }
        } else {
            ann.focused = true;
            ann.focusColor = this.selectedLineColor;
            if (this.callbacks.onToast) {
                this.callbacks.onToast(`Highlighted stated value "${ann.text}"!`, "success");
            }
        }
        this.notifyStateChange();
        this.render();
    }

    clearAllFocusedLines() {
        this.edges.forEach(e => {
            e.focused = false;
            e.focusColor = null;
        });
        this.points.forEach(p => {
            p.focused = false;
            p.focusColor = null;
        });
        this.annotations.forEach(a => {
            a.focused = false;
            a.focusColor = null;
        });
        this.detectedClosedCycles = [];
        this.coloredShapes = [];
        this.notifyStateChange();
        this.render();
    }

    applyDemoStep4Highlights() {
        const preset = window.GEOMETRY_PRESETS ? window.GEOMETRY_PRESETS[this.activePresetId] : null;
        if (preset && preset.demoStep4Edges) {
            this.edges.forEach(e => {
                if (preset.demoStep4Edges.includes(e.id)) {
                    e.focused = true;
                    e.focusColor = this.selectedLineColor;
                } else {
                    e.focused = false;
                    e.focusColor = null;
                }
            });
        } else {
            // For custom uploaded diagrams, highlight all detected edges
            this.edges.forEach(e => {
                e.focused = true;
                e.focusColor = this.selectedLineColor;
            });
        }
        this.recomputeClosedCycles();
        this.notifyStateChange();
        this.render();
    }

    /**
     * Step 5: Closed Shape Detection Engine
     */
    recomputeClosedCycles() {
        const focusedEdges = this.edges.filter(e => e.focused);
        const adj = new Map();
        for (const e of focusedEdges) {
            if (!adj.has(e.p1)) adj.set(e.p1, []);
            if (!adj.has(e.p2)) adj.set(e.p2, []);
            adj.get(e.p1).push({ edge: e, neighbor: e.p2 });
            adj.get(e.p2).push({ edge: e, neighbor: e.p1 });
        }

        const foundCyclesMap = new Map();
        const maxCycleLen = 8;
        const visitedVertices = new Set();
        const vertexStack = [];
        const edgeStack = [];

        const dfs = (startV, currentV) => {
            const neighbors = adj.get(currentV) || [];
            for (const { edge, neighbor } of neighbors) {
                if (edgeStack.length > 0 && edgeStack[edgeStack.length - 1].id === edge.id) {
                    continue;
                }
                if (neighbor === startV && edgeStack.length >= 1) {
                    const cycleEdges = [...edgeStack, edge];
                    const cycleVertices = [...vertexStack];
                    const canonicalKey = [...cycleEdges.map(ce => ce.id)].sort().join("|");
                    if (!foundCyclesMap.has(canonicalKey)) {
                        const polyPoints = this.buildCyclePolygon(cycleVertices, cycleEdges);
                        const area = Math.abs(this.computeSignedArea(polyPoints));
                        if (area > 40) {
                            const centroid = this.computePolygonCentroid(polyPoints);
                            const label = this.buildCycleLabel(cycleVertices, cycleEdges);
                            foundCyclesMap.set(canonicalKey, {
                                key: canonicalKey,
                                edgeIds: cycleEdges.map(ce => ce.id),
                                vertexIds: cycleVertices,
                                polyPoints,
                                area,
                                centroid,
                                label
                            });
                        }
                    }
                } else if (!visitedVertices.has(neighbor) && vertexStack.length < maxCycleLen) {
                    visitedVertices.add(neighbor);
                    vertexStack.push(neighbor);
                    edgeStack.push(edge);
                    dfs(startV, neighbor);
                    edgeStack.pop();
                    vertexStack.pop();
                    visitedVertices.delete(neighbor);
                }
            }
        };

        for (const vId of adj.keys()) {
            visitedVertices.clear();
            visitedVertices.add(vId);
            vertexStack.length = 0;
            edgeStack.length = 0;
            vertexStack.push(vId);
            dfs(vId, vId);
        }

        this.detectedClosedCycles = Array.from(foundCyclesMap.values()).sort((a, b) => a.area - b.area);

        const validKeys = new Set(this.detectedClosedCycles.map(c => c.key));
        this.coloredShapes = this.coloredShapes.filter(cs => validKeys.has(cs.key));
    }

    buildCycleLabel(vertexIds, cycleEdges) {
        const ptNames = vertexIds.map(id => {
            const p = this.getPointById(id);
            return p ? p.label : id;
        });
        const hasArc = cycleEdges.some(e => e.type === "arc");
        return `${hasArc ? "Closed Region" : "Polygon"} ${ptNames.join("")}`;
    }

    buildCyclePolygon(vertexIds, cycleEdges) {
        const pts = [];
        const k = cycleEdges.length;
        for (let i = 0; i < k; i++) {
            const uId = vertexIds[i];
            const vId = vertexIds[(i + 1) % k];
            const edge = cycleEdges[i];
            const u = this.getPointById(uId);
            const v = this.getPointById(vId);
            if (!u || !v) continue;

            if (edge.type === "line") {
                pts.push({ x: u.x, y: u.y });
            } else if (edge.type === "arc") {
                const forward = (edge.p1 === uId && edge.p2 === vId);
                const cx = edge.center.x;
                const cy = edge.center.y;
                const r = edge.radius;

                let aStart = edge.startAngle;
                let aEnd = edge.endAngle;
                let span = this.normalizeAngle(aEnd - aStart);
                if (edge.ccw) {
                    span = -this.normalizeAngle(aStart - aEnd);
                }

                const steps = 36;
                for (let s = 0; s < steps; s++) {
                    const t = forward ? (s / steps) : (1 - s / steps);
                    const ang = aStart + span * t;
                    pts.push({
                        x: cx + r * Math.cos(ang),
                        y: cy + r * Math.sin(ang)
                    });
                }
            }
        }
        return pts;
    }

    computeSignedArea(poly) {
        if (!poly || poly.length < 3) return 0;
        let sum = 0;
        for (let i = 0; i < poly.length; i++) {
            const p1 = poly[i];
            const p2 = poly[(i + 1) % poly.length];
            sum += (p1.x * p2.y - p2.x * p1.y);
        }
        return sum * 0.5;
    }

    computePolygonCentroid(poly) {
        if (!poly || poly.length === 0) return { x: 0, y: 0 };
        let sx = 0, sy = 0;
        for (const p of poly) {
            sx += p.x;
            sy += p.y;
        }
        return { x: sx / poly.length, y: sy / poly.length };
    }

    pointInPolygon(px, py, poly) {
        if (!poly || poly.length < 3) return false;
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const xi = poly[i].x, yi = poly[i].y;
            const xj = poly[j].x, yj = poly[j].y;
            const intersect = ((yi > py) !== (yj > py)) &&
                (px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-12) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    findClosedCycleContainingPoint(wx, wy) {
        for (const cycle of this.detectedClosedCycles) {
            if (this.pointInPolygon(wx, wy, cycle.polyPoints)) {
                return cycle;
            }
        }
        return null;
    }

    toggleOrColorClosedShape(cycle) {
        const existingIdx = this.coloredShapes.findIndex(cs => cs.key === cycle.key);
        if (existingIdx >= 0) {
            const existing = this.coloredShapes[existingIdx];
            if (
                existing.color.toLowerCase() === this.selectedFillColor.toLowerCase() &&
                existing.style === this.selectedFillStyle
            ) {
                this.coloredShapes.splice(existingIdx, 1);
                if (this.callbacks.onToast) {
                    this.callbacks.onToast(`Removed color fill from ${cycle.label}.`, "info");
                }
            } else {
                existing.color = this.selectedFillColor;
                existing.style = this.selectedFillStyle;
                if (this.callbacks.onToast) {
                    this.callbacks.onToast(`Updated ${cycle.label} with new color!`, "success");
                }
            }
        } else {
            this.coloredShapes.push({
                key: cycle.key,
                edgeIds: [...cycle.edgeIds],
                polyPoints: cycle.polyPoints,
                color: this.selectedFillColor,
                style: this.selectedFillStyle,
                label: cycle.label
            });
            if (this.callbacks.onToast) {
                this.callbacks.onToast(`Colored closed shape: ${cycle.label}!`, "success");
            }
        }
        this.notifyStateChange();
        this.render();
    }

    colorDetectedClosedShapes() {
        if (this.detectedClosedCycles.length === 0) {
            if (this.callbacks.onToast) {
                this.callbacks.onToast(
                    "Cannot color shape: The focused lines do NOT form a closed shape yet!",
                    "warning"
                );
            }
            return false;
        }

        const targetCycle = this.detectedClosedCycles[0];
        const existing = this.coloredShapes.find(cs => cs.key === targetCycle.key);
        if (existing) {
            existing.color = this.selectedFillColor;
            existing.style = this.selectedFillStyle;
        } else {
            this.coloredShapes.push({
                key: targetCycle.key,
                edgeIds: [...targetCycle.edgeIds],
                polyPoints: targetCycle.polyPoints,
                color: this.selectedFillColor,
                style: this.selectedFillStyle,
                label: targetCycle.label
            });
        }
        if (this.callbacks.onToast) {
            this.callbacks.onToast(`Colored closed shape: ${targetCycle.label}!`, "success");
        }
        this.notifyStateChange();
        this.render();
        return true;
    }

    clearAllColoredShapes() {
        this.coloredShapes = [];
        this.notifyStateChange();
        this.render();
    }

    notifyStateChange() {
        if (this.callbacks.onStateChange) {
            this.callbacks.onStateChange(this.getStateSummary());
        }
    }

    getStateSummary() {
        return {
            hasDiagram: this.hasDiagram,
            currentStep: this.currentStep,
            activePresetId: this.activePresetId,
            zoom: this.zoom,
            points: this.points,
            edges: this.edges,
            annotations: this.annotations,
            focusedEdges: this.edges.filter(e => e.focused),
            focusedPoints: this.points.filter(p => p.focused),
            focusedAnnotations: this.annotations.filter(a => a.focused),
            detectedClosedCycles: this.detectedClosedCycles,
            coloredShapes: this.coloredShapes
        };
    }

    /**
     * Main Render Pipeline
     */
    render() {
        const ctx = this.ctx;
        const dpr = window.devicePixelRatio || 1;
        const cw = this.canvas.width / dpr;
        const ch = this.canvas.height / dpr;

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, cw, ch);

        if (!this.hasDiagram) {
            this.drawSubtleBackdropGrid(ctx, cw, ch);
            ctx.restore();
            return;
        }

        const baseScale = Math.min((cw - 40) / this.worldWidth, (ch - 40) / this.worldHeight);
        const totalScale = baseScale * this.zoom;
        const centerX = cw / 2 + this.panX;
        const centerY = ch / 2 + this.panY;

        ctx.translate(centerX, centerY);
        ctx.scale(totalScale, totalScale);
        ctx.translate(-this.worldWidth / 2, -this.worldHeight / 2);

        const paperPalette = this.getActivePaperPalette();
        this.defaultInkColor = paperPalette.inkColor;

        // Paper card
        ctx.save();
        ctx.shadowColor = "rgba(15, 23, 42, 0.26)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = paperPalette.paperBg;
        this.roundRect(ctx, 0, 0, this.worldWidth, this.worldHeight, 16);
        ctx.fill();
        ctx.restore();

        ctx.save();
        this.roundRect(ctx, 0, 0, this.worldWidth, this.worldHeight, 16);
        ctx.clip();

        if (paperPalette.showGrid) {
            this.drawPaperGrid(ctx, paperPalette.gridColor);
        }

        // STEP 1: Show full geometry problem diagram (with question text)
        if (this.currentStep === 1 && this.step1Image) {
            ctx.drawImage(this.step1Image, 0, 0, this.worldWidth, this.worldHeight);
            this.drawStepWatermark(ctx, "Step 1: Geometry Problem Diagram Inserted");
        }
        // STEP 2: Ignore the question (website automatically strips question text)
        else if (this.currentStep === 2 && this.step2Image) {
            ctx.drawImage(this.step2Image, 0, 0, this.worldWidth, this.worldHeight);
            this.drawStepWatermark(ctx, "Step 2: Question Ignored Automatically by Website");
        }
        // STEPS 3, 4, 5: Website-created Clickable Lines, Points & Values + User Highlights & Closed Shape Fills
        else if (this.currentStep >= 3) {
            if (this.bgImageOpacity > 0 && this.step2Image) {
                ctx.save();
                ctx.globalAlpha = this.bgImageOpacity;
                ctx.drawImage(this.step2Image, 0, 0, this.worldWidth, this.worldHeight);
                ctx.restore();
            }

            // 1. Render Step 5 Colored Closed Shapes
            this.renderClosedShapes(ctx);

            // 2. Render Website-Created Clickable Stated Values & Angle Markers
            this.renderAnnotations(ctx);

            // 3. Render Website-Created Clickable Lines & Circular Arcs
            this.renderEdges(ctx);

            // 4. Render Website-Created Clickable Points & Labels
            this.renderPoints(ctx);
        }

        // Subtle watermark on paper card
        ctx.save();
        ctx.font = "600 12px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(100, 116, 139, 0.65)";
        ctx.textAlign = "right";
        ctx.fillText("Geometry Diagram Visualiser • Created by LWL", this.worldWidth - 18, this.worldHeight - 14);
        ctx.restore();

        ctx.restore();
        ctx.restore();
    }

    drawSubtleBackdropGrid(ctx, cw, ch) {
        ctx.save();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
        ctx.lineWidth = 1;
        const step = 36;
        for (let x = 0; x < cw; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ch);
            ctx.stroke();
        }
        for (let y = 0; y < ch; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(cw, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    setCanvasBackground(style, themeObj = null, customColor = null) {
        if (style) this.canvasPaperStyle = style;
        if (themeObj) {
            this.themePaperBg = themeObj.paperBg || "#ffffff";
            this.themeGridColor = themeObj.gridColor || "rgba(226, 232, 240, 0.7)";
        }
        if (customColor) {
            this.customPaperColor = customColor;
        }
        this.render();
    }

    getActivePaperPalette() {
        switch (this.canvasPaperStyle) {
            case "theme_matched":
                return {
                    paperBg: this.themePaperBg || "#fffdf9",
                    gridColor: this.themeGridColor || "rgba(217, 119, 6, 0.14)",
                    showGrid: true,
                    inkColor: "#0f172a"
                };
            case "plain_white":
                return {
                    paperBg: "#ffffff",
                    gridColor: "transparent",
                    showGrid: false,
                    inkColor: "#0f172a"
                };
            case "warm_paper":
                return {
                    paperBg: "#fef9c3",
                    gridColor: "rgba(202, 138, 4, 0.18)",
                    showGrid: true,
                    inkColor: "#1c1917"
                };
            case "chalkboard":
                return {
                    paperBg: "#143326",
                    gridColor: "rgba(255, 255, 255, 0.08)",
                    showGrid: true,
                    inkColor: "#f8fafc"
                };
            case "blueprint":
                return {
                    paperBg: "#0c2d48",
                    gridColor: "rgba(56, 189, 248, 0.18)",
                    showGrid: true,
                    inkColor: "#e0f2fe"
                };
            case "custom_color": {
                const hex = (this.customPaperColor || "#ffffff").replace("#", "");
                let r = 255, g = 255, b = 255;
                if (hex.length === 6) {
                    r = parseInt(hex.slice(0, 2), 16);
                    g = parseInt(hex.slice(2, 4), 16);
                    b = parseInt(hex.slice(4, 6), 16);
                }
                const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                const isDark = lum < 0.45;
                return {
                    paperBg: this.customPaperColor || "#ffffff",
                    gridColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.08)",
                    showGrid: true,
                    inkColor: isDark ? "#f8fafc" : "#0f172a"
                };
            }
            case "white_grid":
            default:
                return {
                    paperBg: "#ffffff",
                    gridColor: "rgba(226, 232, 240, 0.7)",
                    showGrid: true,
                    inkColor: "#0f172a"
                };
        }
    }

    drawPaperGrid(ctx, gridColor = "rgba(226, 232, 240, 0.7)") {
        ctx.save();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        const step = 30;
        for (let x = 0; x <= this.worldWidth; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.worldHeight);
            ctx.stroke();
        }
        for (let y = 0; y <= this.worldHeight; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.worldWidth, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawStepWatermark(ctx, text) {
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        this.roundRect(ctx, 20, this.worldHeight - 48, 430, 32, 8);
        ctx.fill();
        ctx.font = "600 13px 'Inter', sans-serif";
        ctx.fillStyle = "#f8fafc";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 34, this.worldHeight - 32);
        ctx.restore();
    }

    renderClosedShapes(ctx) {
        for (const shape of this.coloredShapes) {
            this.drawPolygonFillAndHatch(ctx, shape.polyPoints, shape.color, shape.style, 0.34);
        }

        if (this.currentStep === 5 && this.hoveredTarget && this.hoveredTarget.kind === "cycle") {
            const cycle = this.hoveredTarget.item;
            if (cycle) {
                ctx.save();
                ctx.beginPath();
                cycle.polyPoints.forEach((p, idx) => {
                    if (idx === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                });
                ctx.closePath();
                ctx.fillStyle = this.hexToRgba(this.selectedFillColor, 0.18);
                ctx.fill();
                ctx.strokeStyle = this.selectedFillColor;
                ctx.lineWidth = 2.2;
                ctx.setLineDash([6, 4]);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    drawPolygonFillAndHatch(ctx, polyPoints, color, style, alpha = 0.32) {
        if (!polyPoints || polyPoints.length < 3) return;

        ctx.save();
        ctx.beginPath();
        polyPoints.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.clip();

        if (style === "solid" || style === "hatch_solid") {
            ctx.fillStyle = this.hexToRgba(color, style === "solid" ? 0.42 : alpha);
            ctx.fill();
        }

        if (style === "hatch" || style === "hatch_solid") {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (const p of polyPoints) {
                if (p.x < minX) minX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.x > maxX) maxX = p.x;
                if (p.y > maxY) maxY = p.y;
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 3.2;
            ctx.lineCap = "round";
            const spacing = 10;
            const height = maxY - minY;
            for (let x = minX - height; x <= maxX + height; x += spacing) {
                ctx.beginPath();
                ctx.moveTo(x, maxY + 4);
                ctx.lineTo(x + height * 0.55, minY - 4);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    renderEdges(ctx) {
        const unfocused = this.edges.filter(e => !e.focused);
        const focused = this.edges.filter(e => e.focused);

        for (const edge of unfocused) {
            const isHovered = this.hoveredTarget && this.hoveredTarget.kind === "edge" && this.hoveredTarget.id === edge.id;
            this.drawSingleEdge(ctx, edge, isHovered);
        }
        for (const edge of focused) {
            const isHovered = this.hoveredTarget && this.hoveredTarget.kind === "edge" && this.hoveredTarget.id === edge.id;
            this.drawSingleEdge(ctx, edge, isHovered);
        }
    }

    drawSingleEdge(ctx, edge, isHovered) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (isHovered) {
            ctx.save();
            ctx.beginPath();
            this.traceEdgePath(ctx, edge);
            ctx.strokeStyle = edge.focused
                ? "rgba(239, 68, 68, 0.35)"
                : this.hexToRgba(this.selectedLineColor, 0.35);
            ctx.lineWidth = 14;
            ctx.stroke();
            ctx.restore();
        }

        const strokeColor = edge.focused
            ? (edge.focusColor || this.selectedLineColor)
            : (this.defaultInkColor || "#0f172a");

        ctx.beginPath();
        if (edge.dashed) {
            ctx.setLineDash([8, 6]);
        }
        this.traceEdgePath(ctx, edge);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = edge.focused ? 5.5 : 3.6;
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw arrowheads for North lines, compass rays, or directional/parallel arrows
        if (edge.type === "line" && edge.arrow) {
            const p1 = this.getPointById(edge.p1);
            const p2 = this.getPointById(edge.p2);
            if (p1 && p2) {
                const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                const headSize = edge.focused ? 16 : 13.5;
                if (edge.arrow === "end" || edge.arrow === "both") {
                    this.drawArrowhead(ctx, p2.x, p2.y, ang, headSize, strokeColor);
                }
                if (edge.arrow === "start" || edge.arrow === "both") {
                    this.drawArrowhead(ctx, p1.x, p1.y, ang + Math.PI, headSize, strokeColor);
                }
                if (edge.arrow === "mid") {
                    const mx = (p1.x + p2.x) * 0.5;
                    const my = (p1.y + p2.y) * 0.5;
                    this.drawArrowhead(ctx, mx, my, ang, headSize * 0.9, strokeColor);
                }
            }
        }

        ctx.restore();
    }

    drawArrowhead(ctx, tipX, tipY, angle, size, color) {
        ctx.save();
        ctx.translate(tipX, tipY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(-size, -size * 0.46);
        ctx.lineTo(-size * 0.76, 0);
        ctx.lineTo(-size, size * 0.46);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    traceEdgePath(ctx, edge) {
        if (edge.type === "line") {
            const p1 = this.getPointById(edge.p1);
            const p2 = this.getPointById(edge.p2);
            if (p1 && p2) {
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
            }
        } else if (edge.type === "arc") {
            ctx.arc(
                edge.center.x,
                edge.center.y,
                edge.radius,
                edge.startAngle,
                edge.endAngle,
                !!edge.ccw
            );
        }
    }

    /**
     * Renders website-created clickable stated values, angle arcs, and right-angle symbols
     */
    renderAnnotations(ctx) {
        for (const ann of this.annotations) {
            ctx.save();
            const isHovered = this.hoveredTarget && this.hoveredTarget.kind === "annotation" && this.hoveredTarget.id === ann.id;
            const color = ann.focused ? (ann.focusColor || this.selectedLineColor) : (this.defaultInkColor || "#0f172a");

            if (isHovered || ann.focused) {
                ctx.fillStyle = this.hexToRgba(ann.focused ? color : this.selectedLineColor, isHovered ? 0.22 : 0.14);
                this.roundRect(ctx, ann.x - 28, ann.y - 14, 56, 28, 7);
                ctx.fill();
            }

            if (ann.type === "value") {
                if (ann.patchCanvas) {
                    const pw = ann.patchCanvas.width;
                    const ph = ann.patchCanvas.height;
                    ctx.drawImage(ann.patchCanvas, ann.x - pw / 2, ann.y - ph / 2);
                    if (ann.focused) {
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 2.2;
                        this.roundRect(ctx, ann.x - pw / 2 - 4, ann.y - ph / 2 - 4, pw + 8, ph + 8, 5);
                        ctx.stroke();
                    }
                } else {
                    ctx.font = "bold 20px 'Comic Sans MS', 'Chalkboard SE', 'Inter', sans-serif";
                    ctx.fillStyle = color;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(ann.text, ann.x, ann.y);
                }
            } else if (ann.type === "angle") {
                const v = this.getPointById(ann.vertex);
                if (v) {
                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = ann.focused ? 3.8 : 2.6;
                    ctx.arc(v.x, v.y, ann.arcRadius, ann.startAngle, ann.endAngle, false);
                    ctx.stroke();
                }
                ctx.font = "bold 18px 'Comic Sans MS', 'Chalkboard SE', 'Inter', sans-serif";
                ctx.fillStyle = color;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(ann.text, ann.x, ann.y);
            } else if (ann.type === "right_angle") {
                const v = this.getPointById(ann.vertex);
                if (v) {
                    const s = ann.size || 16;
                    const dx = ann.dirX * s;
                    const dy = ann.dirY * s;
                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = ann.focused ? 3.6 : 2.4;
                    ctx.moveTo(v.x + dx, v.y);
                    ctx.lineTo(v.x + dx, v.y + dy);
                    ctx.lineTo(v.x, v.y + dy);
                    ctx.stroke();
                }
            }
            ctx.restore();
        }
    }

    /**
     * Renders website-created clickable points and labels (P, Q, R, A, B, O, C)
     */
    renderPoints(ctx) {
        for (const pt of this.points) {
            ctx.save();
            const isHovered = this.hoveredTarget && this.hoveredTarget.kind === "point" && this.hoveredTarget.id === pt.id;
            const color = pt.focused ? (pt.focusColor || this.selectedLineColor) : (this.defaultInkColor || "#0f172a");

            const lx = pt.x + (pt.labelOffset ? pt.labelOffset.dx : 0);
            const ly = pt.y + (pt.labelOffset ? pt.labelOffset.dy : -16);

            if (isHovered || pt.focused) {
                ctx.beginPath();
                ctx.arc(lx, ly, 15, 0, Math.PI * 2);
                ctx.fillStyle = this.hexToRgba(pt.focused ? color : this.selectedLineColor, isHovered ? 0.24 : 0.15);
                ctx.fill();
            }

            // Vertex dot (skip round dot on sharp arrow tips like "North" so the arrowhead is crisp)
            if (!pt.isArrowTip) {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, (isHovered || pt.focused) ? 6.2 : (pt.showLabel === false ? 3.2 : 4.2), 0, Math.PI * 2);
                ctx.fillStyle = isHovered ? this.selectedLineColor : color;
                ctx.fill();
            }

            // Point label (skip synthetic unlabelled intersection points)
            if (pt.showLabel !== false && pt.label) {
                ctx.font = pt.isArrowTip
                    ? "bold 19px 'Comic Sans MS', 'Chalkboard SE', 'Inter', sans-serif"
                    : "bold 22px 'Comic Sans MS', 'Chalkboard SE', 'Inter', sans-serif";
                ctx.fillStyle = isHovered ? this.selectedLineColor : color;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(pt.label, lx, ly);
            }
            ctx.restore();
        }
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    hexToRgba(hex, alpha) {
        let c = hex.replace("#", "");
        if (c.length === 3) {
            c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
        }
        const num = parseInt(c, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

if (typeof window !== "undefined") {
    window.GeometryVisualiserEngine = GeometryVisualiserEngine;
}
