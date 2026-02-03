export function initCrashReporter(getMetadata) {
    let alreadyReporting = false;

    async function sendCrash(errorMessage, stackTrace) {
        if (alreadyReporting) return;
        alreadyReporting = true;

        try {

        } catch (e) {

        } finally {
            alreadyReporting = false;
        }
    }

    window.addEventListener("error", (event) => {
        sendCrash(
            event.message || "unknown error",
            event.error?.stack || "no stack"
        );
    });

    window.addEventListener("unhandledrejection", (event) => {
        sendCrash(
            event.reason?.message || "unhandled promise rejection",
            event.reason?.stack || "no stack"
        );
    });
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