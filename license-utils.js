/**
 * TradeTrakR License Utilities
 * Shared HWID generation for license validation across all pages
 */
(function () {
    let hwidPromise = null;

    /**
     * Generate a hardware ID based on browser fingerprint
     * Uses SHA-256 hash of navigator.userAgent
     * Result is cached to avoid multiple digest operations
     * @returns {Promise<string>} Hex string of hardware ID
     */
    async function getHardwareId() {
        if (!hwidPromise) {
            hwidPromise = crypto.subtle
                .digest("SHA-256", new TextEncoder().encode(navigator.userAgent))
                .then((buffer) =>
                    Array.from(new Uint8Array(buffer))
                        .map((byte) => byte.toString(16).padStart(2, "0"))
                        .join("")
                )
                .catch((error) => {
                    // Reset promise on error so next call can retry
                    hwidPromise = null;
                    throw error;
                });
        }
        return hwidPromise;
    }

    // Expose globally via TradeTrakR namespace
    window.TradeTrakR = window.TradeTrakR || {};
    window.TradeTrakR.getHardwareId = getHardwareId;

    // License key validation regex
    // Format: [Letter]-[AlphaNum]+-[AlphaNum]+-[AlphaNum]+
    // Example: T-13312B-23DAD9EA-586D3DW
    const LICENSE_REGEX = /^[A-Za-z]-[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+$/;

    /**
     * Validate license key format
     * @param {string} value - License key to validate
     * @returns {boolean} True if valid format
     */
    function isValidLicenseKey(value) {
        return LICENSE_REGEX.test(value.trim());
    }

    // Expose validation function
    window.TradeTrakR.isValidLicenseKey = isValidLicenseKey;
})();
