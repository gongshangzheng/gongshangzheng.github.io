/**
 * Deprecated compatibility shim.
 *
 * Shortcode dependency registry now lives in config.json and is exposed via
 * lib/config.js as SHORTCODE_DEPS. Keep this file temporarily so any older
 * requires fail loudly with a clear migration path.
 */

const { SHORTCODE_DEPS } = require('./config');

module.exports = { SHORTCODE_DEPS };
