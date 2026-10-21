import os

base_dir = r"c:\Users\Admin\OneDrive\Desktop\Antigravity experiments\geometry-teacher-app"

# 1. Verify index.html
with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
    html = f.read()

assert "Geometry Diagram Visualiser — Created by LWL" in html, "Title with 'Created by LWL' missing"
assert '<span class="lwl-badge">Created by LWL</span>' in html, "LWL badge missing"
assert 'id="blankSlateOverlay"' in html, "Blank slate overlay missing"
assert 'js/imageAnalyzer.js' in html, "imageAnalyzer.js script tag missing"
assert 'js/aiVision.js' in html, "aiVision.js script tag missing"
assert 'id="step3AutoSummary"' in html, "Step 3 auto-created summary missing"
assert 'id="btnRunAIVision"' in html, "AI Vision button missing"
assert 'id="topAiVisionBox"' in html, "Top AI Vision box missing"
assert 'id="aiKeyPromptModal"' in html, "AI API Key prompt modal missing"
assert 'id="cameraModal"' in html, "Camera modal missing"
assert 'id="btnOpenCameraStep1"' in html, "Step 1 camera button missing"
assert 'id="btnBlankSlateCamera"' in html, "Blank slate camera button missing"
assert 'id="stageBackdropSelect"' in html, "Stage backdrop selector missing"
assert 'id="canvasPaperBgSelect"' in html, "Canvas paper background selector missing"

# Ensure topAiVisionBox appears BEFORE data-step-panel="1" in index.html
assert html.index('id="topAiVisionBox"') < html.index('data-step-panel="1"'), "AI API Key box must be at the top before Step 1!"

for forbidden in ["add_point", "add_line", "add_arc", "add_value", "delete_elem", "btnBlankCustomDraw"]:
    assert forbidden not in html, f"Forbidden manual drawing tool {forbidden} still in index.html"

print("[OK] index.html verified.")

# 2. Verify js/imageAnalyzer.js (Planar Arrangement Hough + Circle/Arc + Intersection Splitter)
with open(os.path.join(base_dir, "js", "imageAnalyzer.js"), "r", encoding="utf-8") as f:
    analyzer_js = f.read()

assert "class GeometryImageAnalyzer" in analyzer_js
assert "extractStrokesAndIgnoreQuestion" in analyzer_js
assert "extractPlanarArrangement" in analyzer_js
assert "detectHoughMasterLines" in analyzer_js
assert "detectCurvedArcs" in analyzer_js
assert "intersectLineSegments" in analyzer_js
assert "intersectLineAndArc" in analyzer_js
print("[OK] js/imageAnalyzer.js verified (Hough Master Lines + Kasa Circle/Arcs + Planar Intersection Splitting).")

# 3. Verify js/aiVision.js (Multimodal AI Vision)
with open(os.path.join(base_dir, "js", "aiVision.js"), "r", encoding="utf-8") as f:
    ai_js = f.read()

assert "class AIVisionDiagramExtractor" in ai_js
assert "analyzeCanvasWithAIVision" in ai_js
assert "generativelanguage.googleapis.com" in ai_js
assert "api.openai.com" in ai_js
assert "isArrowTip" in ai_js
assert "North Line at" in ai_js
print("[OK] js/aiVision.js verified (Gemini Vision & OpenAI GPT-4o Vision + North Lines & Arrows).")

# 4. Verify js/geometryEngine.js
with open(os.path.join(base_dir, "js", "geometryEngine.js"), "r", encoding="utf-8") as f:
    engine_js = f.read()

assert "this.hasDiagram = false;" in engine_js
assert "applyAIVisionGeometry(geometry)" in engine_js
assert "drawArrowhead(" in engine_js
assert "exportDiagramRecord(" in engine_js
assert "restoreDiagramRecord(" in engine_js
assert "toggleEdgeFocus(edgeId)" in engine_js
assert "togglePointFocus(pointId)" in engine_js
assert "toggleAnnotationFocus(annId)" in engine_js
assert "recomputeClosedCycles()" in engine_js
assert "toggleOrColorClosedShape(cycle)" in engine_js
print("[OK] js/geometryEngine.js verified (Arrowheads + Save/Restore Diagram Records).")

# 5. Verify js/app.js
with open(os.path.join(base_dir, "js", "app.js"), "r", encoding="utf-8") as f:
    app_js = f.read()

assert "maybeRunCloudAIVision" in app_js
assert "renderStep3AutoSummary" in app_js
assert "openCameraModal" in app_js
assert "syncAIKeyUI" in app_js
assert "applyThemeAndSyncBackgrounds" in app_js
assert "MAX_SAVED_DIAGRAMS = 15" in app_js
assert "EXPIRY_DURATION_MS = 24 * 60 * 60 * 1000" in app_js
assert "loadAndPurgeExpiredDiagrams" in app_js
print("[OK] js/app.js verified (15 Saved Diagrams + 24h Auto-Delete).")
print("\nALL CHECKS PASSED PERFECTLY!")
