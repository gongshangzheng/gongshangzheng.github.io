const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { walkFiles } = require('./utils');

function sha1(text) {
  return crypto.createHash('sha1').update(String(text)).digest('hex');
}

function hashFile(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return crypto.createHash('sha1').update(fs.readFileSync(filePath)).digest('hex');
}

function statSignature(filePath) {
  try {
    const st = fs.statSync(filePath);
    return `${st.size}:${Math.floor(st.mtimeMs)}`;
  } catch (_) {
    return 'missing';
  }
}

function collectFileSignatures(rootDir, predicate = null) {
  const files = walkFiles(rootDir, predicate).sort();
  const signatures = files.map(filePath => {
    const rel = path.relative(rootDir, filePath);
    return `${rel}:${statSignature(filePath)}`;
  });
  return {
    files,
    hash: sha1(signatures.join('|')),
    signatures,
  };
}

function createBuildCache(cachePath, rootDir) {
  let data = {
    version: 1,
    pages: {},
    global: {},
  };

  if (fs.existsSync(cachePath)) {
    try {
      data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      if (!data.pages) data.pages = {};
      if (!data.global) data.global = {};
    } catch (_) {}
  }

  function pageKey(filePath) {
    return path.relative(rootDir, path.resolve(filePath)).replace(/\\/g, '/');
  }

  return {
    data,
    getPage(filePath) {
      return data.pages[pageKey(filePath)] || null;
    },
    setPage(filePath, value) {
      data.pages[pageKey(filePath)] = value;
    },
    deletePage(filePath) {
      delete data.pages[pageKey(filePath)];
    },
    getGlobal(key) {
      return data.global[key];
    },
    setGlobal(key, value) {
      data.global[key] = value;
    },
    save() {
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
    },
  };
}

module.exports = {
  sha1,
  hashFile,
  statSignature,
  collectFileSignatures,
  createBuildCache,
};
