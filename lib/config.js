const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

module.exports = {
  CONFIG: JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8')),
  RECENT_COUNT: (() => {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
    return cfg.recent_posts || 10;
  })(),
  PATHS: {
    root: ROOT,
    src: SRC,
    templates: path.join(SRC, 'templates'),
    pages: path.join(SRC, 'pages'),
    assets: path.join(SRC, 'assets'),
    public: path.join(ROOT, 'public'),
  }
};
