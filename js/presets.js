/**
 * Built-in Geometry Problem Diagram Presets
 * Geometry Diagram Visualiser - Created by LWL
 *
 * Includes:
 * 1. Both PDF Diagrams Together (Side-by-Side, matching Pages 1-3 of the PDF)
 * 2. PDF Problem 1: Circle & Tangents (O, P, A, Q, R, B, C; radius 6 cm; angle ACB = 1 rad)
 * 3. PDF Problem 2: Sector OAB (angle AOB = 0.8 rad; OP = 15 cm; AP perpendicular to OB)
 */

const GEOMETRY_PRESETS = {
    pdf_both_diagrams: {
        id: "pdf_both_diagrams",
        title: "Both PDF Diagrams (Circle & Tangents + Sector OAB)",
        shortName: "Both PDF Diagrams",
        badge: "Full PDF Sheet",
        questionBlocks: [
            {
                x: 22, y: 18, w: 390, h: 112,
                lines: [
                    "5  The diagram shows a circle with centre O and radius 6 cm.",
                    "   A, Q, B and C lie on the circle.",
                    "   PA and PB are tangents to the circle at A and B respectively.",
                    "   O, R, Q and P lie on a straight line. Angle ACB = 1 radian."
                ]
            },
            {
                x: 475, y: 485, w: 405, h: 105,
                lines: [
                    "(b) The diagram shows a sector OAB with centre O and angle AOB = 0.8 rad.",
                    "    P is a point on OB such that OP = 15 cm and AP is perpendicular to OB.",
                    "    Find (i) the length of OA,"
                ]
            }
        ],
        points: [
            // Left Diagram: Circle & Tangents
            { id: "P", label: "P", x: 240, y: 152.2, labelOffset: { dx: 0, dy: -18 } },
            { id: "Q", label: "Q", x: 240, y: 250.0, labelOffset: { dx: 15, dy: -11 } },
            { id: "R", label: "R", x: 240, y: 302.9, labelOffset: { dx: 15, dy: -11 } },
            { id: "O", label: "O", x: 240, y: 365.0, labelOffset: { dx: 0, dy: 22 } },
            { id: "C", label: "C", x: 240, y: 480.0, labelOffset: { dx: 0, dy: 22 } },
            { id: "A", label: "A", x: 143.2, y: 302.9, labelOffset: { dx: -20, dy: 4 } },
            { id: "B", label: "B", x: 336.8, y: 302.9, labelOffset: { dx: 20, dy: 4 } },

            // Right Diagram: Sector OAB
            { id: "O2", label: "O", x: 510, y: 430.0, labelOffset: { dx: -20, dy: 8 } },
            { id: "P2", label: "P", x: 705.1, y: 430.0, labelOffset: { dx: 0, dy: 25 } },
            { id: "B2", label: "B", x: 790.0, y: 430.0, labelOffset: { dx: 18, dy: 14 } },
            { id: "A2", label: "A", x: 705.1, y: 229.1, labelOffset: { dx: 0, dy: -18 } }
        ],
        edges: [
            // Left Diagram Straight Lines
            { id: "seg_PA", type: "line", p1: "P", p2: "A", name: "Line PA (Circle)" },
            { id: "seg_PB", type: "line", p1: "P", p2: "B", name: "Line PB (Circle)" },
            { id: "seg_PQ", type: "line", p1: "P", p2: "Q", name: "Line PQ (Circle)" },
            { id: "seg_QR", type: "line", p1: "Q", p2: "R", name: "Line QR (Circle)" },
            { id: "seg_RO", type: "line", p1: "R", p2: "O", name: "Line RO (Circle)" },
            { id: "seg_AR", type: "line", p1: "A", p2: "R", name: "Line AR (Circle)" },
            { id: "seg_RB", type: "line", p1: "R", p2: "B", name: "Line RB (Circle)" },
            { id: "seg_AO", type: "line", p1: "A", p2: "O", name: "Line AO (Circle)" },
            { id: "seg_BO", type: "line", p1: "B", p2: "O", name: "Line BO (Circle)" },
            { id: "seg_AC", type: "line", p1: "A", p2: "C", name: "Line AC (Circle)" },
            { id: "seg_BC", type: "line", p1: "B", p2: "C", name: "Line BC (Circle)" },

            // Left Diagram Circular Arcs
            {
                id: "arc_AQ",
                type: "arc",
                p1: "A",
                p2: "Q",
                center: { x: 240, y: 365 },
                radius: 115,
                startAngle: -Math.PI / 2 - 1.0,
                endAngle: -Math.PI / 2,
                ccw: false,
                name: "Arc AQ (Circle)"
            },
            {
                id: "arc_QB",
                type: "arc",
                p1: "Q",
                p2: "B",
                center: { x: 240, y: 365 },
                radius: 115,
                startAngle: -Math.PI / 2,
                endAngle: -Math.PI / 2 + 1.0,
                ccw: false,
                name: "Arc QB (Circle)"
            },
            {
                id: "arc_BC",
                type: "arc",
                p1: "B",
                p2: "C",
                center: { x: 240, y: 365 },
                radius: 115,
                startAngle: -Math.PI / 2 + 1.0,
                endAngle: Math.PI / 2,
                ccw: false,
                name: "Arc BC (Circle)"
            },
            {
                id: "arc_CA",
                type: "arc",
                p1: "C",
                p2: "A",
                center: { x: 240, y: 365 },
                radius: 115,
                startAngle: Math.PI / 2,
                endAngle: Math.PI * 1.5 - 1.0,
                ccw: false,
                name: "Arc CA (Circle)"
            },

            // Right Diagram (Sector OAB) Straight Lines & Arc
            { id: "seg_OA2", type: "line", p1: "O2", p2: "A2", name: "Line OA (Sector)" },
            { id: "seg_OP2", type: "line", p1: "O2", p2: "P2", name: "Line OP (Sector)" },
            { id: "seg_PB2", type: "line", p1: "P2", p2: "B2", name: "Line PB (Sector)" },
            { id: "seg_AP2", type: "line", p1: "A2", p2: "P2", name: "Line AP (Sector)" },
            {
                id: "arc_AB2",
                type: "arc",
                p1: "A2",
                p2: "B2",
                center: { x: 510, y: 430 },
                radius: 280,
                startAngle: -0.8,
                endAngle: 0,
                ccw: false,
                name: "Arc AB (Sector)"
            }
        ],
        annotations: [
            { id: "val_6", type: "value", text: "6", x: 296, y: 344 },
            {
                id: "ang_1rad",
                type: "angle",
                vertex: "C",
                text: "1 rad",
                x: 240,
                y: 442,
                arcRadius: 24,
                startAngle: -Math.PI / 2 - 0.5,
                endAngle: -Math.PI / 2 + 0.5
            },
            { id: "val_15", type: "value", text: "15", x: 608, y: 455 },
            {
                id: "ang_08rad",
                type: "angle",
                vertex: "O2",
                text: "0.8 rad",
                x: 592,
                y: 412,
                arcRadius: 44,
                startAngle: -0.8,
                endAngle: 0
            },
            {
                id: "right_angle_P2",
                type: "right_angle",
                text: "90° (⊥)",
                vertex: "P2",
                x: 697,
                y: 422,
                size: 15,
                dirX: -1,
                dirY: -1
            }
        ],
        demoStep4Edges: [
            "seg_PA", "seg_PB", "seg_PQ", "seg_QR", "seg_AR", "seg_RB", "arc_AQ", "arc_QB",
            "seg_AP2", "seg_PB2", "arc_AB2"
        ]
    },

    pdf_circle_tangents: {
        id: "pdf_circle_tangents",
        title: "PDF Problem 1: Circle & Tangents (r = 6 cm, 1 rad)",
        shortName: "Circle & Tangents (PDF #1)",
        badge: "PDF Diagram 1",
        questionBlocks: [
            {
                x: 24, y: 24, w: 315, h: 138,
                lines: [
                    "5  The diagram shows a circle with centre O",
                    "   and radius 6 cm. A, Q, B and C lie on the circle.",
                    "   PA and PB are tangents to the circle at A and B.",
                    "   O, R, Q and P lie on a straight line.",
                    "   Angle ACB = 1 radian."
                ]
            }
        ],
        points: [
            { id: "P", label: "P", x: 450, y: 110, labelOffset: { dx: 0, dy: -16 } },
            { id: "Q", label: "Q", x: 450, y: 225, labelOffset: { dx: 15, dy: -10 } },
            { id: "R", label: "R", x: 450, y: 287.1, labelOffset: { dx: 15, dy: -10 } },
            { id: "O", label: "O", x: 450, y: 360, labelOffset: { dx: 0, dy: 24 } },
            { id: "C", label: "C", x: 450, y: 495, labelOffset: { dx: 0, dy: 24 } },
            { id: "A", label: "A", x: 336.4, y: 287.1, labelOffset: { dx: -20, dy: 4 } },
            { id: "B", label: "B", x: 563.6, y: 287.1, labelOffset: { dx: 20, dy: 4 } }
        ],
        edges: [
            { id: "seg_PA", type: "line", p1: "P", p2: "A", name: "Line PA" },
            { id: "seg_PB", type: "line", p1: "P", p2: "B", name: "Line PB" },
            { id: "seg_PQ", type: "line", p1: "P", p2: "Q", name: "Line PQ" },
            { id: "seg_QR", type: "line", p1: "Q", p2: "R", name: "Line QR" },
            { id: "seg_RO", type: "line", p1: "R", p2: "O", name: "Line RO" },
            { id: "seg_AR", type: "line", p1: "A", p2: "R", name: "Line AR" },
            { id: "seg_RB", type: "line", p1: "R", p2: "B", name: "Line RB" },
            { id: "seg_AO", type: "line", p1: "A", p2: "O", name: "Line AO" },
            { id: "seg_BO", type: "line", p1: "B", p2: "O", name: "Line BO" },
            { id: "seg_AC", type: "line", p1: "A", p2: "C", name: "Line AC" },
            { id: "seg_BC", type: "line", p1: "B", p2: "C", name: "Line BC" },
            {
                id: "arc_AQ",
                type: "arc",
                p1: "A",
                p2: "Q",
                center: { x: 450, y: 360 },
                radius: 135,
                startAngle: -Math.PI / 2 - 1.0,
                endAngle: -Math.PI / 2,
                ccw: false,
                name: "Arc AQ"
            },
            {
                id: "arc_QB",
                type: "arc",
                p1: "Q",
                p2: "B",
                center: { x: 450, y: 360 },
                radius: 135,
                startAngle: -Math.PI / 2,
                endAngle: -Math.PI / 2 + 1.0,
                ccw: false,
                name: "Arc QB"
            },
            {
                id: "arc_BC",
                type: "arc",
                p1: "B",
                p2: "C",
                center: { x: 450, y: 360 },
                radius: 135,
                startAngle: -Math.PI / 2 + 1.0,
                endAngle: Math.PI / 2,
                ccw: false,
                name: "Arc BC"
            },
            {
                id: "arc_CA",
                type: "arc",
                p1: "C",
                p2: "A",
                center: { x: 450, y: 360 },
                radius: 135,
                startAngle: Math.PI / 2,
                endAngle: Math.PI * 1.5 - 1.0,
                ccw: false,
                name: "Arc CA"
            }
        ],
        annotations: [
            { id: "val_6", type: "value", text: "6", x: 515, y: 334 },
            {
                id: "ang_1rad",
                type: "angle",
                vertex: "C",
                text: "1 rad",
                x: 450,
                y: 452,
                arcRadius: 28,
                startAngle: -Math.PI / 2 - 0.5,
                endAngle: -Math.PI / 2 + 0.5
            }
        ],
        demoStep4Edges: ["seg_PA", "seg_PB", "seg_PQ", "seg_QR", "seg_AR", "seg_RB", "arc_AQ", "arc_QB"]
    },

    pdf_sector_oab: {
        id: "pdf_sector_oab",
        title: "PDF Problem 2: Sector OAB (0.8 rad, OP = 15)",
        shortName: "Sector OAB (PDF #2)",
        badge: "PDF Diagram 2",
        questionBlocks: [
            {
                x: 140, y: 485, w: 620, h: 112,
                lines: [
                    "(b) The diagram shows a sector OAB with centre O and angle AOB = 0.8 rad.",
                    "    P is a point on OB such that OP = 15 cm and AP is perpendicular to OB.",
                    "    Find",
                    "    (i) the length of OA,"
                ]
            }
        ],
        points: [
            { id: "O", label: "O", x: 240, y: 430, labelOffset: { dx: -20, dy: 8 } },
            { id: "P", label: "P", x: 456.0, y: 430, labelOffset: { dx: 0, dy: 26 } },
            { id: "B", label: "B", x: 550.0, y: 430, labelOffset: { dx: 18, dy: 14 } },
            { id: "A", label: "A", x: 456.0, y: 207.6, labelOffset: { dx: 0, dy: -16 } }
        ],
        edges: [
            { id: "seg_OA", type: "line", p1: "O", p2: "A", name: "Line OA" },
            { id: "seg_OP", type: "line", p1: "O", p2: "P", name: "Line OP" },
            { id: "seg_PB", type: "line", p1: "P", p2: "B", name: "Line PB" },
            { id: "seg_AP", type: "line", p1: "A", p2: "P", name: "Line AP" },
            {
                id: "arc_AB",
                type: "arc",
                p1: "A",
                p2: "B",
                center: { x: 240, y: 430 },
                radius: 310,
                startAngle: -0.8,
                endAngle: 0,
                ccw: false,
                name: "Arc AB"
            }
        ],
        annotations: [
            { id: "val_15", type: "value", text: "15", x: 348, y: 456 },
            {
                id: "ang_08rad",
                type: "angle",
                vertex: "O",
                text: "0.8 rad",
                x: 325,
                y: 412,
                arcRadius: 48,
                startAngle: -0.8,
                endAngle: 0
            },
            {
                id: "right_angle_P",
                type: "right_angle",
                text: "90° (⊥)",
                vertex: "P",
                x: 448,
                y: 422,
                size: 16,
                dirX: -1,
                dirY: -1
            }
        ],
        demoStep4Edges: ["seg_AP", "seg_PB", "arc_AB"]
    }
};

/**
 * Generates an offscreen Canvas representing the textbook exam paper problem image
 * for Step 1 (with question text) and Step 2 (question text ignored/cropped out).
 */
function renderPresetProblemImage(preset, includeQuestionText = true) {
    const offCanvas = document.createElement("canvas");
    offCanvas.width = 900;
    offCanvas.height = 620;
    const ctx = offCanvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);

    // Draw original grey textbook shading in Step 1 & Step 2
    ctx.save();
    ctx.fillStyle = "rgba(120, 130, 145, 0.45)";
    if (preset.id === "pdf_circle_tangents") {
        const P = preset.points.find(p => p.id === "P");
        const A = preset.points.find(p => p.id === "A");
        ctx.beginPath();
        ctx.moveTo(P.x, P.y);
        ctx.lineTo(A.x, A.y);
        ctx.arc(450, 360, 135, -Math.PI / 2 - 1.0, -Math.PI / 2, false);
        ctx.closePath();
        ctx.fill();
    } else if (preset.id === "pdf_sector_oab") {
        const A = preset.points.find(p => p.id === "A");
        const P = preset.points.find(p => p.id === "P");
        const B = preset.points.find(p => p.id === "B");
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(P.x, P.y);
        ctx.lineTo(B.x, B.y);
        ctx.arc(240, 430, 310, 0, -0.8, true);
        ctx.closePath();
        ctx.fill();
    } else if (preset.id === "pdf_both_diagrams") {
        // Left shaded region PAQ
        const P = preset.points.find(p => p.id === "P");
        const A = preset.points.find(p => p.id === "A");
        ctx.beginPath();
        ctx.moveTo(P.x, P.y);
        ctx.lineTo(A.x, A.y);
        ctx.arc(240, 365, 115, -Math.PI / 2 - 1.0, -Math.PI / 2, false);
        ctx.closePath();
        ctx.fill();

        // Right shaded region A2 P2 B2
        const A2 = preset.points.find(p => p.id === "A2");
        const P2 = preset.points.find(p => p.id === "P2");
        const B2 = preset.points.find(p => p.id === "B2");
        ctx.beginPath();
        ctx.moveTo(A2.x, A2.y);
        ctx.lineTo(P2.x, P2.y);
        ctx.lineTo(B2.x, B2.y);
        ctx.arc(510, 430, 280, 0, -0.8, true);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // Draw textbook thin lines
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.8;
    preset.edges.forEach(edge => {
        ctx.beginPath();
        if (edge.type === "line") {
            const p1 = preset.points.find(p => p.id === edge.p1);
            const p2 = preset.points.find(p => p.id === edge.p2);
            if (p1 && p2) {
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
            }
        } else if (edge.type === "arc") {
            ctx.arc(edge.center.x, edge.center.y, edge.radius, edge.startAngle, edge.endAngle, !!edge.ccw);
        }
        ctx.stroke();
    });

    // Draw textbook annotations
    preset.annotations.forEach(ann => {
        if (ann.type === "value") {
            ctx.font = "italic 17px 'Times New Roman', serif";
            ctx.fillStyle = "#0f172a";
            ctx.textAlign = "center";
            ctx.fillText(ann.text, ann.x, ann.y);
        } else if (ann.type === "angle") {
            const v = preset.points.find(p => p.id === ann.vertex);
            if (v) {
                ctx.beginPath();
                ctx.lineWidth = 1.3;
                ctx.arc(v.x, v.y, ann.arcRadius, ann.startAngle, ann.endAngle, false);
                ctx.stroke();
            }
            ctx.font = "16px 'Times New Roman', serif";
            ctx.fillStyle = "#0f172a";
            ctx.textAlign = "center";
            ctx.fillText(ann.text, ann.x, ann.y);
        } else if (ann.type === "right_angle") {
            const v = preset.points.find(p => p.id === ann.vertex);
            if (v) {
                const s = ann.size || 14;
                const dx = ann.dirX * s;
                const dy = ann.dirY * s;
                ctx.beginPath();
                ctx.lineWidth = 1.4;
                ctx.moveTo(v.x + dx, v.y);
                ctx.lineTo(v.x + dx, v.y + dy);
                ctx.lineTo(v.x, v.y + dy);
                ctx.stroke();
            }
        }
    });

    // Draw textbook serif labels
    ctx.font = "italic 18px 'Times New Roman', serif";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    preset.points.forEach(pt => {
        const lx = pt.x + (pt.labelOffset ? pt.labelOffset.dx : 0);
        const ly = pt.y + (pt.labelOffset ? pt.labelOffset.dy : -14);
        ctx.fillText(pt.label, lx, ly);
    });

    // Step 1: Draw exam question text blocks
    if (includeQuestionText && preset.questionBlocks) {
        ctx.save();
        preset.questionBlocks.forEach(block => {
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1;
            ctx.fillRect(block.x, block.y, block.w, block.h);
            ctx.strokeRect(block.x, block.y, block.w, block.h);
            ctx.font = "italic 14px 'Times New Roman', serif";
            ctx.fillStyle = "#0f172a";
            ctx.textAlign = "left";
            block.lines.forEach((line, i) => {
                ctx.fillText(line, block.x + 12, block.y + 22 + i * 21);
            });
        });
        ctx.restore();
    }

    return offCanvas;
}

if (typeof window !== "undefined") {
    window.GEOMETRY_PRESETS = GEOMETRY_PRESETS;
    window.renderPresetProblemImage = renderPresetProblemImage;
}
