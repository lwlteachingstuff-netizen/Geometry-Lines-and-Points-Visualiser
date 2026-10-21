/**
 * Main Application Controller
 * Geometry Diagram Visualiser - Created by LWL
 */

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("geometryCanvas");
    const themeManager = new window.AnimalThemeManager();

    const engine = new window.GeometryVisualiserEngine(canvas, {
        onStateChange: (state) => updateUI(state),
        onToast: (msg, type) => showToast(msg, type)
    });

    window.appEngine = engine;
    window.appThemeManager = themeManager;

    // Initialize Theme Selector (City with Cats & Dogs, Underwater, Sky, Forest)
    const themeSelect = document.getElementById("themeSelect");
    const applyThemeAndSyncBackgrounds = (themeId, showNotification = false) => {
        const t = themeManager.setTheme(themeId);
        if (themeSelect) themeSelect.value = t.id;
        document.querySelectorAll("[data-theme-pick]").forEach(b => {
            b.classList.toggle("active", b.getAttribute("data-theme-pick") === t.id);
        });
        // Update canvas paper theme tint & re-render
        engine.setCanvasBackground(null, t);
        if (showNotification) {
            showToast(`Switched theme & background to ${t.name}!`, "info");
        }
    };

    if (themeSelect) {
        Object.values(window.ANIMAL_THEMES).forEach(theme => {
            const opt = document.createElement("option");
            opt.value = theme.id;
            opt.textContent = `${theme.icon} ${theme.name}`;
            themeSelect.appendChild(opt);
        });
        themeSelect.value = "city";
        themeSelect.addEventListener("change", (e) => {
            applyThemeAndSyncBackgrounds(e.target.value, true);
        });
    }
    applyThemeAndSyncBackgrounds("city", false);

    // Quick Theme Switcher Pills
    document.querySelectorAll("[data-theme-pick]").forEach(btn => {
        btn.addEventListener("click", () => {
            const tid = btn.getAttribute("data-theme-pick");
            applyThemeAndSyncBackgrounds(tid, true);
        });
    });

    // Background & Canvas Style Customizer Controls
    const stageBackdropSelect = document.getElementById("stageBackdropSelect");
    const customBackdropColorPicker = document.getElementById("customBackdropColorPicker");
    const btnUploadWallpaper = document.getElementById("btnUploadWallpaper");
    const customWallpaperInput = document.getElementById("customWallpaperInput");
    const canvasPaperBgSelect = document.getElementById("canvasPaperBgSelect");
    const customCanvasPaperColorPicker = document.getElementById("customCanvasPaperColorPicker");

    if (stageBackdropSelect) {
        stageBackdropSelect.addEventListener("change", (e) => {
            const mode = e.target.value;
            if (mode === "custom_image" && !themeManager.customBackdropImageUrl && customWallpaperInput) {
                customWallpaperInput.click();
                return;
            }
            themeManager.setBackdropStyle(mode, customBackdropColorPicker ? customBackdropColorPicker.value : null);
            showToast(`Updated world background style!`, "info");
        });
    }
    if (customBackdropColorPicker) {
        customBackdropColorPicker.addEventListener("input", (e) => {
            if (stageBackdropSelect) stageBackdropSelect.value = "custom_color";
            themeManager.setBackdropStyle("custom_color", e.target.value);
        });
    }
    if (btnUploadWallpaper && customWallpaperInput) {
        btnUploadWallpaper.addEventListener("click", () => customWallpaperInput.click());
        customWallpaperInput.addEventListener("change", (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (stageBackdropSelect) stageBackdropSelect.value = "custom_image";
                themeManager.setBackdropStyle("custom_image", ev.target.result);
                showToast("Custom background wallpaper applied!", "success");
            };
            reader.readAsDataURL(file);
            customWallpaperInput.value = "";
        });
    }
    if (canvasPaperBgSelect) {
        canvasPaperBgSelect.addEventListener("change", (e) => {
            const style = e.target.value;
            engine.setCanvasBackground(style, themeManager.currentTheme, customCanvasPaperColorPicker ? customCanvasPaperColorPicker.value : null);
            showToast("Updated diagram canvas background!", "info");
        });
    }
    if (customCanvasPaperColorPicker) {
        customCanvasPaperColorPicker.addEventListener("input", (e) => {
            if (canvasPaperBgSelect) canvasPaperBgSelect.value = "custom_color";
            engine.setCanvasBackground("custom_color", themeManager.currentTheme, e.target.value);
        });
    }

    // Stepper Navigation Buttons (Steps 1 to 5)
    document.querySelectorAll(".step-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const step = parseInt(btn.getAttribute("data-step"), 10);
            engine.setStep(step);
            updateMascotForStep(step);
        });
    });

    const btnPrevStep = document.getElementById("btnPrevStep");
    const btnNextStep = document.getElementById("btnNextStep");
    if (btnPrevStep) {
        btnPrevStep.addEventListener("click", () => {
            if (engine.currentStep > 1) {
                engine.setStep(engine.currentStep - 1);
                updateMascotForStep(engine.currentStep);
            }
        });
    }
    if (btnNextStep) {
        btnNextStep.addEventListener("click", () => {
            if (!engine.hasDiagram) {
                showToast("Insert a geometry problem diagram in Step 1 first!", "warning");
                return;
            }
            if (engine.currentStep < 5) {
                engine.setStep(engine.currentStep + 1);
                updateMascotForStep(engine.currentStep);
            }
        });
    }

    // Blank Slate & Step 1 Preset Insertion Buttons
    document.querySelectorAll("[data-load-preset]").forEach(btn => {
        btn.addEventListener("click", () => {
            const presetId = btn.getAttribute("data-load-preset");
            engine.loadPresetDiagram(presetId);
            showToast("Step 1: Geometry problem diagram inserted! Click Step 2 to ignore the question.", "success");
            updateMascotForStep(1);
        });
    });

    // Blank Slate Reset Button
    const btnBlankSlate = document.getElementById("btnBlankSlate");
    if (btnBlankSlate) {
        btnBlankSlate.addEventListener("click", () => {
            engine.resetToBlankSlate();
            showToast("Returned to Blank Slate.", "info");
        });
    }

    // AI Vision API Key Management (Top Sidebar + Header + Blank Slate + Prompt Modal)
    const aiProviderSelect = document.getElementById("aiProviderSelect");
    const aiApiKeyInput = document.getElementById("aiApiKeyInput");
    const blankAiProviderSelect = document.getElementById("blankAiProviderSelect");
    const blankAiApiKeyInput = document.getElementById("blankAiApiKeyInput");
    const modalAiProviderSelect = document.getElementById("modalAiProviderSelect");
    const modalAiApiKeyInput = document.getElementById("modalAiApiKeyInput");

    const btnRunAIVision = document.getElementById("btnRunAIVision");
    const btnSaveAiKeyTop = document.getElementById("btnSaveAiKeyTop");
    const btnBlankSaveAiKey = document.getElementById("btnBlankSaveAiKey");
    const btnOpenAIKeyModal = document.getElementById("btnOpenAIKeyModal");
    const headerAiKeyStatusText = document.getElementById("headerAiKeyStatusText");
    const aiEngineStatusBadge = document.getElementById("aiEngineStatusBadge");

    const aiKeyPromptModal = document.getElementById("aiKeyPromptModal");
    const btnCloseAiKeyModal = document.getElementById("btnCloseAiKeyModal");
    const btnSaveModalAiKey = document.getElementById("btnSaveModalAiKey");
    const btnSkipModalAiKey = document.getElementById("btnSkipModalAiKey");
    const btnToggleKeyVisibility = document.getElementById("btnToggleKeyVisibility");
    const btnModalToggleKeyVisibility = document.getElementById("btnModalToggleKeyVisibility");

    let pendingAIAnalysisAfterKeySave = false;

    function syncAIKeyUI(provider, apiKey) {
        const cleanKey = (apiKey || "").trim();
        const prov = provider || "gemini";
        if (aiProviderSelect) aiProviderSelect.value = prov;
        if (blankAiProviderSelect) blankAiProviderSelect.value = prov;
        if (modalAiProviderSelect) modalAiProviderSelect.value = prov;

        if (aiApiKeyInput && aiApiKeyInput.value !== cleanKey) aiApiKeyInput.value = cleanKey;
        if (blankAiApiKeyInput && blankAiApiKeyInput.value !== cleanKey) blankAiApiKeyInput.value = cleanKey;
        if (modalAiApiKeyInput && modalAiApiKeyInput.value !== cleanKey) modalAiApiKeyInput.value = cleanKey;

        const hasKey = cleanKey.length > 5;
        if (aiEngineStatusBadge) {
            aiEngineStatusBadge.textContent = hasKey ? "✅ AI Key Ready" : "⚠️ Input API Key";
        }
        if (headerAiKeyStatusText) {
            headerAiKeyStatusText.textContent = hasKey ? "AI Key Active" : "Enter AI API Key";
        }
        if (btnOpenAIKeyModal) {
            btnOpenAIKeyModal.classList.toggle("key-ready", hasKey);
        }

        if (window.AIVisionDiagramExtractor) {
            window.AIVisionDiagramExtractor.saveConfig({
                provider: prov,
                apiKey: cleanKey,
                model: "auto"
            });
        }
    }

    if (window.AIVisionDiagramExtractor) {
        const savedCfg = window.AIVisionDiagramExtractor.getSavedConfig();
        syncAIKeyUI(savedCfg.provider || "gemini", savedCfg.apiKey || "");
        // Ask the user to input their AI API Key on initial load if none is set yet
        if (!savedCfg.apiKey || savedCfg.apiKey.trim().length < 5) {
            if (aiKeyPromptModal) {
                aiKeyPromptModal.style.display = "flex";
            }
        }
    }

    // Keep all 3 provider/key inputs in sync as the user types
    [aiProviderSelect, blankAiProviderSelect, modalAiProviderSelect].forEach(sel => {
        if (!sel) return;
        sel.addEventListener("change", () => {
            const currentKey = (aiApiKeyInput && aiApiKeyInput.value) || "";
            syncAIKeyUI(sel.value, currentKey);
        });
    });

    [aiApiKeyInput, blankAiApiKeyInput, modalAiApiKeyInput].forEach(inp => {
        if (!inp) return;
        inp.addEventListener("input", () => {
            const currentProv = (aiProviderSelect && aiProviderSelect.value) || "gemini";
            syncAIKeyUI(currentProv, inp.value);
        });
    });

    const togglePasswordInput = (inputEl) => {
        if (!inputEl) return;
        inputEl.type = inputEl.type === "password" ? "text" : "password";
    };
    if (btnToggleKeyVisibility) {
        btnToggleKeyVisibility.addEventListener("click", () => togglePasswordInput(aiApiKeyInput));
    }
    if (btnModalToggleKeyVisibility) {
        btnModalToggleKeyVisibility.addEventListener("click", () => togglePasswordInput(modalAiApiKeyInput));
    }

    const handleSaveKeyButton = async (sourceProviderEl, sourceKeyEl, closeModal = false) => {
        const prov = sourceProviderEl ? sourceProviderEl.value : "gemini";
        const key = sourceKeyEl ? sourceKeyEl.value.trim() : "";
        syncAIKeyUI(prov, key);
        if (!key) {
            showToast("Please paste a valid Gemini or OpenAI API Key first.", "warning");
            return;
        }
        if (closeModal && aiKeyPromptModal) {
            aiKeyPromptModal.style.display = "none";
        }
        showToast("✅ AI Vision API Key saved! Ready to identify lines, points & values.", "success");
        if (pendingAIAnalysisAfterKeySave || (engine.hasDiagram && engine.activePresetId === "custom_upload")) {
            pendingAIAnalysisAfterKeySave = false;
            await maybeRunCloudAIVision(true);
        }
    };

    if (btnSaveAiKeyTop) {
        btnSaveAiKeyTop.addEventListener("click", () => handleSaveKeyButton(aiProviderSelect, aiApiKeyInput, false));
    }
    if (btnBlankSaveAiKey) {
        btnBlankSaveAiKey.addEventListener("click", () => handleSaveKeyButton(blankAiProviderSelect, blankAiApiKeyInput, false));
    }
    if (btnSaveModalAiKey) {
        btnSaveModalAiKey.addEventListener("click", () => handleSaveKeyButton(modalAiProviderSelect, modalAiApiKeyInput, true));
    }
    if (btnOpenAIKeyModal && aiKeyPromptModal) {
        btnOpenAIKeyModal.addEventListener("click", () => {
            aiKeyPromptModal.style.display = "flex";
            if (modalAiApiKeyInput) modalAiApiKeyInput.focus();
        });
    }
    if (btnCloseAiKeyModal && aiKeyPromptModal) {
        btnCloseAiKeyModal.addEventListener("click", () => {
            aiKeyPromptModal.style.display = "none";
            pendingAIAnalysisAfterKeySave = false;
        });
    }
    if (btnSkipModalAiKey && aiKeyPromptModal) {
        btnSkipModalAiKey.addEventListener("click", () => {
            aiKeyPromptModal.style.display = "none";
            pendingAIAnalysisAfterKeySave = false;
            showToast("Using built-in Planar CV. You can input your AI API Key at the top anytime!", "info");
        });
    }

    // Unified Handler for Any Inserted Image (File Upload, Clipboard Paste, or Camera Photo)
    async function handleInsertedDiagramImage(img, sourceLabel = "Diagram inserted") {
        engine.loadCustomImage(img);
        showToast(`${sourceLabel}! Extracting clickable lines, points & values...`, "success");
        updateMascotForStep(1);

        const currentKey = aiApiKeyInput ? aiApiKeyInput.value.trim() : "";
        if (!currentKey) {
            // Prompt user to input their AI API Key so AI Vision can extract the exact diagram!
            pendingAIAnalysisAfterKeySave = true;
            if (aiKeyPromptModal) {
                aiKeyPromptModal.style.display = "flex";
                if (modalAiApiKeyInput) modalAiApiKeyInput.focus();
            }
            showToast("Please input your AI Vision API Key so AI can accurately extract your diagram's lines & points!", "info");
            return;
        }
        await maybeRunCloudAIVision();
    }

    // Custom Image Upload Input (Step 1)
    const fileInput = document.getElementById("diagramFileInput");
    const cameraCaptureInput = document.getElementById("cameraCaptureInput");
    const btnUploadDiagram = document.getElementById("btnUploadDiagram");
    const btnBlankSlateUpload = document.getElementById("btnBlankSlateUpload");

    const triggerFileUpload = () => {
        if (fileInput) fileInput.click();
    };
    if (btnUploadDiagram) btnUploadDiagram.addEventListener("click", triggerFileUpload);
    if (btnBlankSlateUpload) btnBlankSlateUpload.addEventListener("click", triggerFileUpload);

    const handleFileInputChange = (e, label) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = async () => {
                await handleInsertedDiagramImage(img, label);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    if (fileInput) {
        fileInput.addEventListener("change", (e) => handleFileInputChange(e, "Uploaded diagram image"));
    }
    if (cameraCaptureInput) {
        cameraCaptureInput.addEventListener("change", (e) => {
            closeCameraModal();
            handleFileInputChange(e, "Captured camera photo");
        });
    }

    // Support Clipboard Paste (Ctrl+V) of any image
    window.addEventListener("paste", (e) => {
        if (!e.clipboardData || !e.clipboardData.items) return;
        for (const item of e.clipboardData.items) {
            if (item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = async () => {
                        await handleInsertedDiagramImage(img, "Pasted diagram image");
                    };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    });

    // Live Camera Capture Function for Step 1
    const cameraModal = document.getElementById("cameraModal");
    const cameraVideoPreview = document.getElementById("cameraVideoPreview");
    const cameraStatusMessage = document.getElementById("cameraStatusMessage");
    const btnOpenCameraStep1 = document.getElementById("btnOpenCameraStep1");
    const btnBlankSlateCamera = document.getElementById("btnBlankSlateCamera");
    const btnSnapCameraPhoto = document.getElementById("btnSnapCameraPhoto");
    const btnFlipCamera = document.getElementById("btnFlipCamera");
    const btnDeviceCameraFallback = document.getElementById("btnDeviceCameraFallback");
    const btnCloseCameraModal = document.getElementById("btnCloseCameraModal");
    const btnCancelCameraModal = document.getElementById("btnCancelCameraModal");

    let activeCameraStream = null;
    let cameraFacingMode = "environment";

    function stopCameraStream() {
        if (activeCameraStream) {
            activeCameraStream.getTracks().forEach(track => track.stop());
            activeCameraStream = null;
        }
        if (cameraVideoPreview) {
            cameraVideoPreview.srcObject = null;
        }
    }

    function closeCameraModal() {
        stopCameraStream();
        if (cameraModal) cameraModal.style.display = "none";
    }

    async function startCameraStream() {
        stopCameraStream();
        if (cameraStatusMessage) {
            cameraStatusMessage.style.display = "flex";
            cameraStatusMessage.textContent = "📷 Starting camera preview...";
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (cameraStatusMessage) {
                cameraStatusMessage.textContent = "⚠️ Live webcam API is not available in this browser context. Click '📱 Device Camera / File' below to capture a photo!";
            }
            return;
        }
        try {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: cameraFacingMode },
                        width: { ideal: 1600 },
                        height: { ideal: 1200 }
                    },
                    audio: false
                });
            } catch (_) {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            }
            activeCameraStream = stream;
            if (cameraVideoPreview) {
                cameraVideoPreview.srcObject = stream;
                await cameraVideoPreview.play().catch(() => {});
            }
            if (cameraStatusMessage) {
                cameraStatusMessage.style.display = "none";
            }
        } catch (err) {
            if (cameraStatusMessage) {
                cameraStatusMessage.style.display = "flex";
                cameraStatusMessage.textContent = `⚠️ Could not access webcam (${err.message || "Permission denied"}). Click "📱 Device Camera / File" below to take or pick a photo!`;
            }
        }
    }

    function openCameraModal() {
        if (!cameraModal) return;
        cameraModal.style.display = "flex";
        startCameraStream();
    }

    if (btnOpenCameraStep1) btnOpenCameraStep1.addEventListener("click", openCameraModal);
    if (btnBlankSlateCamera) btnBlankSlateCamera.addEventListener("click", openCameraModal);
    if (btnCloseCameraModal) btnCloseCameraModal.addEventListener("click", closeCameraModal);
    if (btnCancelCameraModal) btnCancelCameraModal.addEventListener("click", closeCameraModal);

    if (btnFlipCamera) {
        btnFlipCamera.addEventListener("click", () => {
            cameraFacingMode = cameraFacingMode === "environment" ? "user" : "environment";
            startCameraStream();
        });
    }
    if (btnDeviceCameraFallback && cameraCaptureInput) {
        btnDeviceCameraFallback.addEventListener("click", () => cameraCaptureInput.click());
    }
    if (btnSnapCameraPhoto) {
        btnSnapCameraPhoto.addEventListener("click", () => {
            if (!cameraVideoPreview || !activeCameraStream || !cameraVideoPreview.videoWidth) {
                if (cameraCaptureInput) cameraCaptureInput.click();
                return;
            }
            const vw = cameraVideoPreview.videoWidth;
            const vh = cameraVideoPreview.videoHeight;
            const snapCanvas = document.createElement("canvas");
            snapCanvas.width = vw;
            snapCanvas.height = vh;
            const sctx = snapCanvas.getContext("2d");
            sctx.drawImage(cameraVideoPreview, 0, 0, vw, vh);
            const dataUrl = snapCanvas.toDataURL("image/png");
            closeCameraModal();

            const img = new Image();
            img.onload = async () => {
                await handleInsertedDiagramImage(img, "📷 Camera photo captured in Step 1");
            };
            img.src = dataUrl;
        });
    }

    async function maybeRunCloudAIVision(forceAlert = false) {
        if (!window.AIVisionDiagramExtractor) return;
        const provider = aiProviderSelect ? aiProviderSelect.value : "gemini";
        const apiKey = aiApiKeyInput ? aiApiKeyInput.value.trim() : "";
        syncAIKeyUI(provider, apiKey);

        if (!apiKey) {
            if (forceAlert) {
                pendingAIAnalysisAfterKeySave = true;
                if (aiKeyPromptModal) {
                    aiKeyPromptModal.style.display = "flex";
                    if (modalAiApiKeyInput) modalAiApiKeyInput.focus();
                }
                showToast("Please input your Gemini or OpenAI API key to run Cloud AI Vision!", "warning");
            }
            return;
        }
        if (!engine.hasDiagram || !engine.step2Image) {
            if (forceAlert) showToast("Insert or capture a geometry problem diagram in Step 1 first!", "warning");
            return;
        }

        try {
            if (aiEngineStatusBadge) aiEngineStatusBadge.textContent = "⏳ AI Analyzing...";
            showToast(`Running ${provider.toUpperCase()} Vision AI (auto-discovering active model) to identify lines, points & values...`, "info");
            const cvHints = { points: engine.points, edges: engine.edges };
            const aiGeom = await window.AIVisionDiagramExtractor.analyzeCanvasWithAIVision(
                engine.step2Image || engine.step1Image,
                {
                    provider,
                    apiKey,
                    model: "auto"
                },
                cvHints
            );
            engine.applyAIVisionGeometry(aiGeom);
            engine.bgImageOpacity = 0.20;
            const bgSlider = document.getElementById("bgOpacitySlider");
            const bgVal = document.getElementById("bgOpacityValue");
            if (bgSlider) bgSlider.value = "20";
            if (bgVal) bgVal.textContent = "20%";
            engine.setStep(3);
            updateMascotForStep(3);

            const modelUsed = aiGeom.usedModelName ? ` (${aiGeom.usedModelName})` : "";
            if (aiEngineStatusBadge) aiEngineStatusBadge.textContent = `✅ AI Extracted${modelUsed}`;
            showToast(
                `AI Vision${modelUsed} identified ${aiGeom.edges.length} clickable lines/arcs, ${aiGeom.points.length} points & ${aiGeom.annotations.length} values!`,
                "success"
            );
            // Automatically save the newly extracted diagram into the 15-slot 24h gallery!
            await saveCurrentDiagramToGallery(true);
        } catch (err) {
            if (aiEngineStatusBadge) aiEngineStatusBadge.textContent = "Built-in CV Active";
            showToast(`AI Vision note: ${err.message}. Built-in Planar CV lines remain active.`, "warning");
        }
    }

    if (btnRunAIVision) {
        btnRunAIVision.addEventListener("click", () => maybeRunCloudAIVision(true));
    }

    // =========================================================================
    // SAVED DIAGRAMS MANAGER (Up to 15 Diagrams, Auto-Deletes After 24 Hours)
    // =========================================================================
    const MAX_SAVED_DIAGRAMS = 15;
    const EXPIRY_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const DB_NAME = "lwl_geometry_saved_db_v1";
    const STORE_NAME = "diagrams";
    const LS_FALLBACK_KEY = "lwl_saved_diagrams_fallback_v1";

    let savedDiagramsCache = [];
    let currentLoadedSavedId = null;

    function openDiagramsIndexedDB() {
        return new Promise((resolve) => {
            if (typeof indexedDB === "undefined") return resolve(null);
            try {
                const req = indexedDB.open(DB_NAME, 1);
                req.onupgradeneeded = (ev) => {
                    const db = ev.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: "id" });
                    }
                };
                req.onsuccess = (ev) => resolve(ev.target.result);
                req.onerror = () => resolve(null);
            } catch (_) {
                resolve(null);
            }
        });
    }

    async function readAllStoredDiagrams() {
        const db = await openDiagramsIndexedDB();
        if (db) {
            return new Promise((resolve) => {
                try {
                    const tx = db.transaction(STORE_NAME, "readonly");
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.getAll();
                    req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
                    req.onerror = () => resolve([]);
                } catch (_) {
                    resolve([]);
                }
            });
        }
        try {
            const raw = localStorage.getItem(LS_FALLBACK_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) {
            return [];
        }
    }

    async function writeAllStoredDiagrams(records) {
        const db = await openDiagramsIndexedDB();
        if (db) {
            await new Promise((resolve) => {
                try {
                    const tx = db.transaction(STORE_NAME, "readwrite");
                    const store = tx.objectStore(STORE_NAME);
                    store.clear();
                    for (const rec of records) {
                        store.put(rec);
                    }
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                } catch (_) {
                    resolve(false);
                }
            });
        }
        try {
            // Also keep a lightweight mirror in localStorage as fallback
            const lightRecords = records.map(r => ({
                ...r,
                step1DataUrl: null // Keep localStorage under quota if IndexedDB is absent
            }));
            localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(lightRecords));
        } catch (_) {}
    }

    /**
     * Purges any diagram older than 24 hours and enforces the 15-diagram maximum limit
     */
    async function loadAndPurgeExpiredDiagrams() {
        const now = Date.now();
        const all = await readAllStoredDiagrams();
        const valid = all
            .filter(item => {
                const exp = item.expiresAt || ((item.createdAt || 0) + EXPIRY_DURATION_MS);
                return exp > now;
            })
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .slice(0, MAX_SAVED_DIAGRAMS);

        if (valid.length !== all.length) {
            await writeAllStoredDiagrams(valid);
        }
        savedDiagramsCache = valid;
        renderSavedDiagramsGallery();
        return valid;
    }

    function formatRemainingTime(expiresAt) {
        const remMs = Math.max(0, expiresAt - Date.now());
        const totalMins = Math.ceil(remMs / 60000);
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hrs > 0) return `${hrs}h ${mins}m left`;
        return `${mins}m left`;
    }

    async function saveCurrentDiagramToGallery(isAutoSave = false) {
        if (!engine.hasDiagram) {
            if (!isAutoSave) {
                showToast("Insert or capture a geometry diagram in Step 1 before saving!", "warning");
            }
            return;
        }
        await loadAndPurgeExpiredDiagrams();

        const record = engine.exportDiagramRecord(null, null);
        if (!record) return;

        // Add new diagram at the top; cap at MAX_SAVED_DIAGRAMS (15)
        const updated = [record, ...savedDiagramsCache];
        if (updated.length > MAX_SAVED_DIAGRAMS) {
            updated.length = MAX_SAVED_DIAGRAMS;
        }
        savedDiagramsCache = updated;
        currentLoadedSavedId = record.id;
        await writeAllStoredDiagrams(savedDiagramsCache);
        renderSavedDiagramsGallery();

        if (!isAutoSave) {
            showToast(
                `💾 Saved "${record.title}" (${savedDiagramsCache.length}/${MAX_SAVED_DIAGRAMS}). Auto-deletes in 24 hrs!`,
                "success"
            );
        }
    }

    async function deleteSavedDiagramById(id) {
        savedDiagramsCache = savedDiagramsCache.filter(item => item.id !== id);
        if (currentLoadedSavedId === id) currentLoadedSavedId = null;
        await writeAllStoredDiagrams(savedDiagramsCache);
        renderSavedDiagramsGallery();
        showToast("Deleted saved diagram.", "info");
    }

    async function clearAllSavedDiagrams() {
        savedDiagramsCache = [];
        currentLoadedSavedId = null;
        await writeAllStoredDiagrams([]);
        renderSavedDiagramsGallery();
        showToast("Cleared all saved diagrams.", "info");
    }

    function renderSavedDiagramsGallery() {
        const listEl = document.getElementById("savedDiagramsList");
        const countBadge = document.getElementById("savedDiagramsCountBadge");
        if (countBadge) {
            countBadge.textContent = `${savedDiagramsCache.length} / ${MAX_SAVED_DIAGRAMS}`;
        }
        if (!listEl) return;

        if (savedDiagramsCache.length === 0) {
            listEl.innerHTML = `<div class="empty-inspector-msg">No saved diagrams yet (0 / 15). Click <strong>💾 Save Current Diagram</strong> or analyze a photo to save up to 15 diagrams for 24 hours!</div>`;
            return;
        }

        listEl.innerHTML = savedDiagramsCache.map((item, idx) => {
            const ttlText = formatRemainingTime(item.expiresAt || (item.createdAt + EXPIRY_DURATION_MS));
            const isActive = item.id === currentLoadedSavedId;
            const thumbSrc = item.thumbnailDataUrl || item.step2DataUrl || "";
            const lineCount = (item.edges || []).length;
            const ptCount = (item.points || []).filter(p => p.showLabel !== false && !p.isArrowTip).length;
            return `
                <div class="saved-diagram-card ${isActive ? 'active-slot' : ''}" data-load-saved-id="${item.id}" title="Click to load ${item.title}">
                    ${thumbSrc ? `<img class="saved-thumb-img" src="${thumbSrc}" alt="Diagram preview">` : `<div class="saved-thumb-img"></div>`}
                    <div class="saved-meta-col">
                        <div class="saved-title-text">#${idx + 1} ${item.title}</div>
                        <div class="saved-sub-row">
                            <span>${ptCount} pts • ${lineCount} lines</span>
                            <span class="saved-ttl-badge">⏳ ${ttlText}</span>
                        </div>
                    </div>
                    <button class="btn-delete-saved" data-delete-saved-id="${item.id}" title="Delete this saved diagram">✕</button>
                </div>
            `;
        }).join("");

        listEl.querySelectorAll("[data-load-saved-id]").forEach(card => {
            card.addEventListener("click", async (e) => {
                if (e.target.closest("[data-delete-saved-id]")) return;
                const id = card.getAttribute("data-load-saved-id");
                const rec = savedDiagramsCache.find(r => r.id === id);
                if (rec) {
                    currentLoadedSavedId = rec.id;
                    await engine.restoreDiagramRecord(rec);
                    const bgSlider = document.getElementById("bgOpacitySlider");
                    const bgVal = document.getElementById("bgOpacityValue");
                    const pct = Math.round((engine.bgImageOpacity || 0) * 100);
                    if (bgSlider) bgSlider.value = String(pct);
                    if (bgVal) bgVal.textContent = `${pct}%`;
                    renderSavedDiagramsGallery();
                    showToast(`Loaded "${rec.title}"!`, "success");
                }
            });
        });

        listEl.querySelectorAll("[data-delete-saved-id]").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-delete-saved-id");
                await deleteSavedDiagramById(id);
            });
        });
    }

    const btnSaveCurrentDiagram = document.getElementById("btnSaveCurrentDiagram");
    const btnHeaderSaveDiagram = document.getElementById("btnHeaderSaveDiagram");
    const btnClearSavedDiagrams = document.getElementById("btnClearSavedDiagrams");

    if (btnSaveCurrentDiagram) {
        btnSaveCurrentDiagram.addEventListener("click", () => saveCurrentDiagramToGallery(false));
    }
    if (btnHeaderSaveDiagram) {
        btnHeaderSaveDiagram.addEventListener("click", () => saveCurrentDiagramToGallery(false));
    }
    if (btnClearSavedDiagrams) {
        btnClearSavedDiagrams.addEventListener("click", () => clearAllSavedDiagrams());
    }

    // Load & purge expired (>24h) diagrams on startup and check every 60 seconds
    loadAndPurgeExpiredDiagrams();
    setInterval(() => {
        loadAndPurgeExpiredDiagrams();
    }, 60000);

    // Zoom Controls
    const btnZoomIn = document.getElementById("btnZoomIn");
    const btnZoomOut = document.getElementById("btnZoomOut");
    const btnResetZoom = document.getElementById("btnResetZoom");
    const btnTogglePan = document.getElementById("btnTogglePan");
    const zoomSlider = document.getElementById("zoomSlider");

    if (btnZoomIn) btnZoomIn.addEventListener("click", () => engine.zoomIn());
    if (btnZoomOut) btnZoomOut.addEventListener("click", () => engine.zoomOut());
    if (btnResetZoom) btnResetZoom.addEventListener("click", () => engine.resetZoom());
    if (btnTogglePan) {
        btnTogglePan.addEventListener("click", () => {
            engine.panMode = !engine.panMode;
            btnTogglePan.classList.toggle("active", engine.panMode);
            engine.updateCursor();
        });
    }
    if (zoomSlider) {
        zoomSlider.addEventListener("input", (e) => {
            const pct = parseInt(e.target.value, 10);
            engine.setZoom(pct / 100);
        });
    }

    // Step 2 -> Step 3 -> Step 4 Proceed Buttons
    const btnStep2Proceed = document.getElementById("btnStep2Proceed");
    const btnStep3Proceed = document.getElementById("btnStep3Proceed");
    if (btnStep2Proceed) {
        btnStep2Proceed.addEventListener("click", () => {
            engine.setStep(3);
            updateMascotForStep(3);
            showToast("Step 3: Website created all clickable lines, points & stated values!", "success");
        });
    }
    if (btnStep3Proceed) {
        btnStep3Proceed.addEventListener("click", () => {
            engine.setStep(4);
            updateMascotForStep(4);
            showToast("Step 4: Click any line, point, or value to highlight it in your chosen color!", "info");
        });
    }

    const bgOpacitySlider = document.getElementById("bgOpacitySlider");
    const bgOpacityValue = document.getElementById("bgOpacityValue");
    if (bgOpacitySlider) {
        bgOpacitySlider.addEventListener("input", (e) => {
            const val = parseInt(e.target.value, 10);
            engine.bgImageOpacity = val / 100;
            if (bgOpacityValue) bgOpacityValue.textContent = `${val}%`;
            engine.render();
        });
    }

    // Step 4 Line/Point/Value Highlight Color Swatches
    document.querySelectorAll("[data-line-color]").forEach(swatch => {
        swatch.addEventListener("click", () => {
            const color = swatch.getAttribute("data-line-color");
            engine.selectedLineColor = color;
            const customInput = document.getElementById("customLineColorPicker");
            if (customInput) customInput.value = color;
            document.querySelectorAll("[data-line-color]").forEach(s => {
                s.classList.toggle("active", s.getAttribute("data-line-color") === color);
            });
            engine.render();
        });
    });

    const customLineColorPicker = document.getElementById("customLineColorPicker");
    if (customLineColorPicker) {
        customLineColorPicker.addEventListener("input", (e) => {
            engine.selectedLineColor = e.target.value;
            document.querySelectorAll("[data-line-color]").forEach(s => s.classList.remove("active"));
            engine.render();
        });
    }

    const btnDemoStep4 = document.getElementById("btnDemoStep4");
    const btnClearFocusLines = document.getElementById("btnClearFocusLines");
    if (btnDemoStep4) {
        btnDemoStep4.addEventListener("click", () => {
            engine.applyDemoStep4Highlights();
            showToast("Highlighted example lines from the PDF! Click any line again to delete it from focus.", "success");
        });
    }
    if (btnClearFocusLines) {
        btnClearFocusLines.addEventListener("click", () => {
            engine.clearAllFocusedLines();
            showToast("Cleared all highlights.", "info");
        });
    }

    // Step 5 Closed Shape Fill Color Swatches & Fill Style Controls
    document.querySelectorAll("[data-fill-color]").forEach(swatch => {
        swatch.addEventListener("click", () => {
            const color = swatch.getAttribute("data-fill-color");
            engine.selectedFillColor = color;
            const customInput = document.getElementById("customFillColorPicker");
            if (customInput) customInput.value = color;
            document.querySelectorAll("[data-fill-color]").forEach(s => {
                s.classList.toggle("active", s.getAttribute("data-fill-color") === color);
            });
            engine.render();
        });
    });

    const customFillColorPicker = document.getElementById("customFillColorPicker");
    if (customFillColorPicker) {
        customFillColorPicker.addEventListener("input", (e) => {
            engine.selectedFillColor = e.target.value;
            document.querySelectorAll("[data-fill-color]").forEach(s => s.classList.remove("active"));
            engine.render();
        });
    }

    document.querySelectorAll("[data-fill-style]").forEach(btn => {
        btn.addEventListener("click", () => {
            const style = btn.getAttribute("data-fill-style");
            engine.selectedFillStyle = style;
            document.querySelectorAll("[data-fill-style]").forEach(b => {
                b.classList.toggle("active", b.getAttribute("data-fill-style") === style);
            });
            engine.render();
        });
    });

    const btnAutoColorClosed = document.getElementById("btnAutoColorClosed");
    const btnClearShapeFills = document.getElementById("btnClearShapeFills");
    if (btnAutoColorClosed) {
        btnAutoColorClosed.addEventListener("click", () => {
            engine.colorDetectedClosedShapes();
        });
    }
    if (btnClearShapeFills) {
        btnClearShapeFills.addEventListener("click", () => {
            engine.clearAllColoredShapes();
            showToast("Cleared all colored shapes.", "info");
        });
    }

    function updateMascotForStep(step) {
        const messages = {
            1: "Step 1: Insert a geometry problem diagram! Choose from the PDF diagrams or upload/paste an image.",
            2: "Step 2: The website automatically ignores the question text so only the geometry diagram remains!",
            3: "Step 3: The website automatically created all clickable lines, points, and stated values! You only need to click to highlight them.",
            4: "Step 4: Click on any line, point, or value to highlight it in a DIFFERENT COLOR! Click a highlighted item again to delete it from focus.",
            5: "Step 5: If your highlighted lines form a CLOSED SHAPE, click inside the shape (or click Color Shape) to shade it!"
        };
        if (messages[step]) {
            themeManager.setMascotMessage(messages[step]);
        }
    }

    function updateUI(state) {
        const blankSlateOverlay = document.getElementById("blankSlateOverlay");
        if (blankSlateOverlay) {
            blankSlateOverlay.style.display = state.hasDiagram ? "none" : "flex";
        }

        document.querySelectorAll(".step-tab-btn").forEach(btn => {
            const step = parseInt(btn.getAttribute("data-step"), 10);
            btn.classList.toggle("active", step === state.currentStep);
            btn.classList.toggle("completed", state.hasDiagram && step < state.currentStep);
        });

        document.querySelectorAll(".step-control-card").forEach(card => {
            const cardStep = parseInt(card.getAttribute("data-step-panel"), 10);
            card.style.display = (cardStep === state.currentStep) ? "block" : "none";
        });

        const zoomPctLabel = document.getElementById("zoomPctLabel");
        if (zoomPctLabel) {
            zoomPctLabel.textContent = `${Math.round(state.zoom * 100)}%`;
        }
        if (zoomSlider) {
            zoomSlider.value = Math.round(state.zoom * 100);
        }

        const stepInstructionBanner = document.getElementById("stepInstructionBanner");
        if (stepInstructionBanner) {
            if (!state.hasDiagram) {
                stepInstructionBanner.innerHTML = `<strong>Blank Slate</strong> — Insert a geometry problem diagram in Step 1 to begin.`;
            } else {
                const titles = {
                    1: `<strong>Step 1: Insert Geometry Problem Diagram</strong> — Viewing inserted problem diagram. Click <em>Step 2</em> to ignore the question.`,
                    2: `<strong>Step 2: Ignore the Question</strong> — Question text is ignored automatically. Click <em>Step 3</em> to view website-created lines, points & values.`,
                    3: `<strong>Step 3: Website-Created Clickable Lines, Points & Values</strong> — Created automatically! Click any line, point, or value on the diagram to highlight it.`,
                    4: `<strong>Step 4: Click Lines to Show in a DIFFERENT COLOR</strong> — Click any line/arc/point/value to highlight it; <strong>click again to delete from focus</strong>.`,
                    5: `<strong>Step 5: Color Closed Shape</strong> — Click inside any <strong>closed shape</strong> formed by your highlighted lines to color it!`
                };
                stepInstructionBanner.innerHTML = titles[state.currentStep] || "";
            }
        }

        renderStep3AutoSummary(state);
        renderInspectorLists(state);
    }

    /**
     * Renders the Step 3 panel summary showing all clickable lines, points, and values
     * that the website automatically created from the diagram.
     */
    function renderStep3AutoSummary(state) {
        const container = document.getElementById("step3AutoSummary");
        if (!container) return;

        if (!state.hasDiagram) {
            container.innerHTML = "";
            return;
        }

        container.innerHTML = `
            <div class="auto-stat-grid">
                <div class="auto-stat-box">
                    <strong>${state.edges.length}</strong>
                    <span>Clickable Lines & Arcs</span>
                </div>
                <div class="auto-stat-box">
                    <strong>${state.points.length}</strong>
                    <span>Clickable Points</span>
                </div>
                <div class="auto-stat-box">
                    <strong>${state.annotations.length}</strong>
                    <span>Stated Values</span>
                </div>
            </div>

            <div class="auto-chip-group">
                <div class="chip-group-label">📏 Clickable Lines & Arcs (Click to Highlight):</div>
                <div class="chip-wrap">
                    ${state.edges.map(e => `
                        <button class="elem-chip ${e.focused ? 'focused' : ''}" 
                                style="${e.focused ? `border-color:${e.focusColor}; background:${e.focusColor}33;` : ''}"
                                data-toggle-edge="${e.id}">
                            ${e.name}
                        </button>
                    `).join("")}
                </div>
            </div>

            <div class="auto-chip-group">
                <div class="chip-group-label">📍 Clickable Points & Stated Values:</div>
                <div class="chip-wrap">
                    ${state.points.map(p => `
                        <button class="elem-chip ${p.focused ? 'focused' : ''}"
                                style="${p.focused ? `border-color:${p.focusColor}; background:${p.focusColor}33;` : ''}"
                                data-toggle-point="${p.id}">
                            Pt ${p.label}
                        </button>
                    `).join("")}
                    ${state.annotations.map(a => `
                        <button class="elem-chip ${a.focused ? 'focused' : ''}"
                                style="${a.focused ? `border-color:${a.focusColor}; background:${a.focusColor}33;` : ''}"
                                data-toggle-ann="${a.id}">
                            ${a.text}
                        </button>
                    `).join("")}
                </div>
            </div>
        `;

        container.querySelectorAll("[data-toggle-edge]").forEach(btn => {
            btn.addEventListener("click", () => engine.toggleEdgeFocus(btn.getAttribute("data-toggle-edge")));
        });
        container.querySelectorAll("[data-toggle-point]").forEach(btn => {
            btn.addEventListener("click", () => engine.togglePointFocus(btn.getAttribute("data-toggle-point")));
        });
        container.querySelectorAll("[data-toggle-ann]").forEach(btn => {
            btn.addEventListener("click", () => engine.toggleAnnotationFocus(btn.getAttribute("data-toggle-ann")));
        });
    }

    function renderInspectorLists(state) {
        const focusedListEl = document.getElementById("focusedLinesList");
        const closedShapesListEl = document.getElementById("closedShapesList");
        const focusCountBadge = document.getElementById("focusCountBadge");
        const closedCountBadge = document.getElementById("closedCountBadge");

        const totalFocusedCount =
            state.focusedEdges.length + state.focusedPoints.length + state.focusedAnnotations.length;

        if (focusCountBadge) {
            focusCountBadge.textContent = totalFocusedCount;
        }
        if (closedCountBadge) {
            closedCountBadge.textContent = state.detectedClosedCycles.length;
        }

        if (focusedListEl) {
            if (totalFocusedCount === 0) {
                focusedListEl.innerHTML = `<div class="empty-list-hint">No items highlighted yet. Click any line, arc, point, or stated value on the diagram to highlight it in a different color!</div>`;
            } else {
                const edgeRows = state.focusedEdges.map(edge => `
                    <div class="focused-item-row">
                        <span class="color-dot" style="background: ${edge.focusColor};"></span>
                        <span class="focused-item-name">${edge.name}</span>
                        <button class="btn-remove-focus" data-edge-id="${edge.id}" title="Click to delete from focus">✕ Unfocus</button>
                    </div>
                `);
                const pointRows = state.focusedPoints.map(pt => `
                    <div class="focused-item-row">
                        <span class="color-dot" style="background: ${pt.focusColor};"></span>
                        <span class="focused-item-name">Point ${pt.label}</span>
                        <button class="btn-remove-focus" data-point-id="${pt.id}" title="Click to delete from focus">✕ Unfocus</button>
                    </div>
                `);
                const annRows = state.focusedAnnotations.map(ann => `
                    <div class="focused-item-row">
                        <span class="color-dot" style="background: ${ann.focusColor};"></span>
                        <span class="focused-item-name">Value "${ann.text}"</span>
                        <button class="btn-remove-focus" data-ann-id="${ann.id}" title="Click to delete from focus">✕ Unfocus</button>
                    </div>
                `);

                focusedListEl.innerHTML = [...edgeRows, ...pointRows, ...annRows].join("");

                focusedListEl.querySelectorAll("[data-edge-id]").forEach(btn => {
                    btn.addEventListener("click", () => engine.toggleEdgeFocus(btn.getAttribute("data-edge-id")));
                });
                focusedListEl.querySelectorAll("[data-point-id]").forEach(btn => {
                    btn.addEventListener("click", () => engine.togglePointFocus(btn.getAttribute("data-point-id")));
                });
                focusedListEl.querySelectorAll("[data-ann-id]").forEach(btn => {
                    btn.addEventListener("click", () => engine.toggleAnnotationFocus(btn.getAttribute("data-ann-id")));
                });
            }
        }

        if (closedShapesListEl) {
            if (state.detectedClosedCycles.length === 0) {
                closedShapesListEl.innerHTML = `
                    <div class="empty-list-hint status-unclosed">
                        ⚠️ <strong>No Closed Shape Formed Yet</strong><br/>
                        Highlight a complete closed loop of lines/arcs (e.g. Line AP + Line PB + Arc AB, or Line PA + Line PQ + Arc AQ).
                    </div>
                `;
            } else {
                closedShapesListEl.innerHTML = state.detectedClosedCycles.map(cycle => {
                    const colored = state.coloredShapes.find(cs => cs.key === cycle.key);
                    return `
                        <div class="closed-shape-row ${colored ? 'is-colored' : ''}">
                            <div class="closed-shape-info">
                                <span class="shape-status-dot" style="background: ${colored ? colored.color : '#94a3b8'};"></span>
                                <div>
                                    <div class="shape-title">${cycle.label}</div>
                                    <div class="shape-sub">${cycle.edgeIds.length} bounding lines/arcs • Closed!</div>
                                </div>
                            </div>
                            <button class="btn-fill-shape" data-cycle-key="${cycle.key}">
                                ${colored ? "🎨 Recolor / Clear" : "🎨 Color Shape"}
                            </button>
                        </div>
                    `;
                }).join("");

                closedShapesListEl.querySelectorAll(".btn-fill-shape").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const key = btn.getAttribute("data-cycle-key");
                        const cycle = engine.detectedClosedCycles.find(c => c.key === key);
                        if (cycle) {
                            if (engine.currentStep < 5) {
                                engine.setStep(5);
                            }
                            engine.toggleOrColorClosedShape(cycle);
                        }
                    });
                });
            }
        }
    }

    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = `toast-item toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add("fade-out");
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    updateUI(engine.getStateSummary());
});
