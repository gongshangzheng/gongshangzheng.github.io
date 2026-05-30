const fs = require('fs');
const path = require('path');
const { PATHS } = require('./config');
const { toAsciiBase } = require('./taxonomy');

const REGISTRY_PATH = path.join(PATHS.root, 'data', 'article-slugs.json');
const DEFAULT_REGISTRY = {
  version: 1,
  articles: {},
};

function cloneDefaultRegistry() {
  return JSON.parse(JSON.stringify(DEFAULT_REGISTRY));
}

function isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function ensureRegistryShape(input) {
  const registry = cloneDefaultRegistry();
  if (!isObject(input)) return registry;
  if (typeof input.version === 'number') registry.version = input.version;
  if (isObject(input.articles)) {
    for (const [sourcePath, entry] of Object.entries(input.articles)) {
      if (typeof entry === 'string') {
        registry.articles[sourcePath] = { title: '', slug: entry };
      } else if (isObject(entry)) {
        registry.articles[sourcePath] = {
          title: typeof entry.title === 'string' ? entry.title : '',
          slug: typeof entry.slug === 'string' ? entry.slug : '',
        };
      }
    }
  }
  return registry;
}

function loadArticleRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) return cloneDefaultRegistry();
  return ensureRegistryShape(JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')));
}

function saveArticleRegistry(registry) {
  fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true });
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(ensureRegistryShape(registry), null, 2) + '\n');
}

function nextAvailableSlug(baseSlug, usedSlugs) {
  if (!usedSlugs.has(baseSlug)) return baseSlug;
  let counter = 2;
  while (usedSlugs.has(`${baseSlug}-${counter}`)) counter += 1;
  return `${baseSlug}-${counter}`;
}

function ensureArticleSlugs(records) {
  const registry = loadArticleRegistry();
  let mutated = false;
  const usedSlugs = new Set(
    Object.values(registry.articles)
      .map(entry => entry && entry.slug)
      .filter(slug => typeof slug === 'string' && slug.trim())
  );

  for (const record of records || []) {
    const sourcePath = record.sourcePath;
    if (!sourcePath) continue;
    const title = String(record.title || '').trim() || 'untitled';
    const existing = registry.articles[sourcePath];
    if (existing && typeof existing.slug === 'string' && existing.slug.trim()) {
      if (existing.title !== title) {
        existing.title = title;
        mutated = true;
      }
      continue;
    }
    const slug = nextAvailableSlug(toAsciiBase(title), usedSlugs);
    usedSlugs.add(slug);
    registry.articles[sourcePath] = { title, slug };
    mutated = true;
  }

  if (mutated || !fs.existsSync(REGISTRY_PATH)) saveArticleRegistry(registry);
  return registry;
}

function getArticleSlug(registryInput, sourcePath) {
  const registry = ensureRegistryShape(registryInput);
  const entry = registry.articles[sourcePath];
  return entry && entry.slug ? entry.slug : '';
}

module.exports = {
  REGISTRY_PATH,
  loadArticleRegistry,
  saveArticleRegistry,
  ensureArticleSlugs,
  getArticleSlug,
};
