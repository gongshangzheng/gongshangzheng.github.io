const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('./');
const SRC = path.join(ROOT, 'src');
const CONFIG_PATH = path.join(ROOT, 'config.json');
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

module.exports = {
  CONFIG,
  RECENT_COUNT: CONFIG.recent_posts || 10,
  SHORTCODE_DEPS: Array.isArray(CONFIG.shortcode_deps) ? CONFIG.shortcode_deps : [],
  PATHS: {
    root: ROOT,
    src: SRC,
    templates: path.join(SRC, 'templates'),
    pages: path.join(SRC, 'pages'),
    assets: path.join(SRC, 'assets'),
    public: path.join(ROOT, 'public'),
  }
};
