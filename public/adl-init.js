/**
 * Adobe Data Layer Initialization & Interceptor
 * 
 * Objectives:
 * 1. Initialize window.adobeDataLayer
 * 2. Intercept all .push() calls
 * 3. Inject the required `_digiwebanoptznapcptrsd` root object into EVERY event
 * 4. Ensure no existing keys are removed/renamed
 */

(function () {
    // 1. Initialize Data Layer
    window.adobeDataLayer = window.adobeDataLayer || [];

    // 2. Define the Interceptor
    // Store original push only if we haven't already wrapped it (to avoid double wrapping if script loads twice)
    if (!window.adobeDataLayer._interceptorAttached) {

        const originalPush = Array.prototype.push;

        // Override push method on the specific adobeDataLayer array instance
        window.adobeDataLayer.push = function (...args) {
            // 3. Inject required object into each event argument
            const modifiedArgs = args.map(arg => {
                if (arg && typeof arg === 'object') {
                    // Ensure root-level object exists
                    // We stick to the requirement: _digiwebanoptznapcptrsd: {}
                    // Using assignment to ensure it's there. We preserve if it somehow exists (though typical usage expects empty)
                    if (!arg.hasOwnProperty('_digiwebanoptznapcptrsd')) {
                        arg._digiwebanoptznapcptrsd = {};
                    }
                }
                return arg;
            });

            // 4. Call original push
            return originalPush.apply(this, modifiedArgs);
        };

        // Mark as attached
        window.adobeDataLayer._interceptorAttached = true;

        // OPTIONAL: Process any existing events if this script loaded late (Backfill)
        // Since we are replacing the init script, this is less likely needed for initial items, 
        // but robust for async loading scenarios.
        for (let i = 0; i < window.adobeDataLayer.length; i++) {
            if (window.adobeDataLayer[i] && typeof window.adobeDataLayer[i] === 'object') {
                if (!window.adobeDataLayer[i].hasOwnProperty('_digiwebanoptznapcptrsd')) {
                    window.adobeDataLayer[i]._digiwebanoptznapcptrsd = {};
                }
            }
        }

        console.log("ACDL: Interceptor initialized. _digiwebanoptznapcptrsd injection active.");
    }

})();
