const BACKEND_URL = "https://usa-chapel-teenage-reply.trycloudflare.com"; // TODO
const INTAKE_CRASH = "/intake";

export function initCrashReporter(getMetadata) {
    let alreadyReporting = false;

    async function sendCrash(errorMessage, stackTrace) {
        if (alreadyReporting) return;
        alreadyReporting = true;

        try {
            const [userEnv, meta] = await Promise.all([
                collectEnvironmentSnapshot(),
                Promise.resolve(getMetadata?.())
            ]);

            const payload = {
                time: new Date().toISOString(),
                url: location.href,
                errorMessage,
                stackTrace,
                ...userEnv,
                ...meta
            };

            console.log(payload);

            await fetch(`${BACKEND_URL}${INTAKE_CRASH}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                keepalive: true,
                body: JSON.stringify(payload),
            });

        } catch (e) {
            console.error("Crash reporter failed:", e);
        } finally {
            alreadyReporting = false;
        }
    }

    function startMemoryWatchdog() {
        if (!performance.memory) return;

        setInterval(() => {
            const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;

            const ratio = usedJSHeapSize / jsHeapSizeLimit;

            // 88% of JS heap size used
            if (ratio > 0.88) {
                sendCrash(
                    "Probable OOM: heap at " + Math.round(ratio * 100) + "%",
                    "Memory watchdog triggered before renderer kill"
                );
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