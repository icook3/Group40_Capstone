const BACKEND_URL = "https://YOUR-BACKEND.com"; // TODO
const INTAKE_CRASH = "/intake";
const HEALTH_CHECK = "/crashLoggingHealth"

async function isCrashReporterBackendUp() {
    try {
        const res = await fetch(`${BACKEND_URL}${HEALTH_CHECK}`, {
            method: "GET",
        });

        return res.ok;
    } catch {
        return false;
    }
}

export function initCrashReporter(getMetadata) {
    let backendUp = false;
    let alreadyReporting = false;
    let memoryWatchdogFired = false;
    let aframeWatchdogFired = false;
    let lastSnapshot = {};

    // check once at startup
    (async () => {
        backendUp = await isCrashReporterBackendUp();
    })();

    // Get snapshot data every 5s
    setInterval(async () => {
        try {
            lastSnapshot = {
                ...(await collectEnvironmentSnapshot()),
                ...(await getMetadata?.())
            };
        } catch {}
    }, 5000);

    async function sendCrash(errorMessage, stackTrace) {
        if (!backendUp || alreadyReporting) return;
        alreadyReporting = true;

        try {
            const payload = {
                time: new Date().toISOString(),
                url: location.href,
                errorMessage,
                stackTrace,
                ...lastSnapshot
            };

            await fetch(`${BACKEND_URL}${INTAKE_CRASH}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                keepalive: true,
                body: JSON.stringify(payload),
            });

        } catch (e) {
            console.error("Crash reporter failed:", e);
        }

        alreadyReporting = false;
    }

    function startMemoryWatchdog() {
        if (!performance.memory) return;

        setInterval(() => {
            const mem = performance.memory;
            if (!mem) return;

            const used = mem.usedJSHeapSize;
            const limit = mem.jsHeapSizeLimit;

            if (!used || !limit) return;

            const ratio = used / limit;

            if (ratio > 0.75 && !memoryWatchdogFired) { // 75% heap used
                memoryWatchdogFired = true;
                sendCrash(
                    `Probable OOM: heap at ${Math.round(ratio * 100)}%`,
                    "Memory watchdog triggered before renderer kill"
                );
            }
        }, 2000);
    }

    function startAframeRenderWatchdog() {
        setInterval(() => {
            if (aframeWatchdogFired) return;

            try {
                const info = AFRAME?.scenes?.[0]?.renderer?.info;
                if (!info) return;

                const geom = info.memory?.geometries || 0;
                const tex = info.memory?.textures || 0;
                const calls = info.render?.calls || 0;
                const tris = info.render?.triangles || 0;

                // These should roughly plateau after the scene loads
                if (calls > 1500 || tris > 400000 || geom > 1500) {
                    aframeWatchdogFired = true;

                    sendCrash(
                        `Renderer pressure detected: calls=${calls}, tris=${tris}, geom=${geom}, tex=${tex}`,
                        "A-Frame render watchdog"
                    );
                }
            } catch {
            }
        }, 3000);
    }

    window.addEventListener("error", (event) => {
        sendCrash(
            event.message || "unknown error",
            event.error?.stack || "no stack"
        );
    });

    window.addEventListener("unhandledrejection", (event) => {
        const reason = event.reason;
        sendCrash(
            typeof reason === "string" ? reason : reason?.message || "unhandled promise rejection",
            event.reason?.stack || "no stack"
        );
    });

        startMemoryWatchdog();
        startAframeRenderWatchdog();
}

export async function collectEnvironmentSnapshot() {
    return {
        ...(await getPlatformInfo()),
        ...getWebGLInfo(),

        screen: {
            width: innerWidth,
            height: innerHeight,
            devicePixelRatio: devicePixelRatio
        },
        memory: {
            used: performance.memory?.usedHeapSize,
            total: performance.memory?.totalJSHeapSize,
            limit: performance.memory?.jsHeapSizeLimit
        },

        visibility: document.visibilityState,

        network: {
            downlink: navigator.connection?.downlink,
            rtt: navigator.connection?.rtt, //rtt is estimated latency in ms
            type: navigator.connection?.effectiveType
        }
    };
}

async function getPlatformInfo() {
    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        hardwareConcurrency: navigator.hardwareConcurrency,
    };
}

function getWebGLInfo() {
    const canvas = document.createElement("canvas");
    const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");

    if (!gl) return {};

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const attributes = gl.getContextAttributes() || {};

    return {
        webglVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
        webglRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
        webglVersion: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        contextAttributes: attributes
    };
}