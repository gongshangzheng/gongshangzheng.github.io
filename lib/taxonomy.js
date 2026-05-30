const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin-pro');
const { PATHS } = require('./config');

const REGISTRY_PATH = path.join(PATHS.root, 'data', 'taxonomy-slugs.json');
const DEFAULT_REGISTRY = {
  version: 1,
  tags: {},
  categories: {},
  subcategories: {},
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
  if (isObject(input.tags)) registry.tags = { ...input.tags };
  if (isObject(input.categories)) registry.categories = { ...input.categories };
  if (isObject(input.subcategories)) {
    for (const [cat, submap] of Object.entries(input.subcategories)) {
      if (isObject(submap)) registry.subcategories[cat] = { ...submap };
    }
  }
  return registry;
}

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) return cloneDefaultRegistry();
  try {
    return ensureRegistryShape(JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')));
  } catch (error) {
    throw new Error(`Failed to read taxonomy registry at ${REGISTRY_PATH}: ${error.message}`);
  }
}

function saveRegistry(registry) {
  fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true });
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(ensureRegistryShape(registry), null, 2) + '\n');
}

function hasCjk(text) {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/.test(String(text || ''));
}

function toAsciiBase(text) {
  const raw = String(text || '').trim();
  if (!raw) return 'item';

  let normalized = raw;
  if (hasCjk(raw)) {
    normalized = pinyin(raw, {
      toneType: 'none',
      type: 'array',
      nonZh: 'consecutive',
      v: false,
    }).join(' ');
  }

  const slug = normalized
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'item';
}

function nextAvailableSlug(baseSlug, usedSlugs) {
  if (!usedSlugs.has(baseSlug)) return baseSlug;
  let counter = 2;
  while (usedSlugs.has(`${baseSlug}-${counter}`)) counter += 1;
  return `${baseSlug}-${counter}`;
}

function ensureEntry(map, key) {
  if (typeof map[key] === 'string' && map[key].trim()) return map[key];
  const used = new Set(Object.values(map).filter(value => typeof value === 'string' && value.trim()));
  const slug = nextAvailableSlug(toAsciiBase(key), used);
  map[key] = slug;
  return slug;
}

function ensureSubcategoryEntry(registry, category, subcategory) {
  if (!registry.subcategories[category]) registry.subcategories[category] = {};
  return ensureEntry(registry.subcategories[category], subcategory);
}

function ensureTaxonomyRegistry(allPosts) {
  const registry = loadRegistry();
  let mutated = false;

  for (const post of allPosts || []) {
    for (const tag of (post.tags || [])) {
      if (!(typeof registry.tags[tag] === 'string' && registry.tags[tag].trim())) {
        ensureEntry(registry.tags, tag);
        mutated = true;
      }
    }

    for (const category of (post.categories || [])) {
      if (!(typeof registry.categories[category] === 'string' && registry.categories[category].trim())) {
        ensureEntry(registry.categories, category);
        mutated = true;
      }
      const subcategory = String(post.subcategory || '').trim();
      if (subcategory) {
        if (!registry.subcategories[category] || !(typeof registry.subcategories[category][subcategory] === 'string' && registry.subcategories[category][subcategory].trim())) {
          ensureSubcategoryEntry(registry, category, subcategory);
          mutated = true;
        }
      }
    }
  }

  if (mutated || !fs.existsSync(REGISTRY_PATH)) saveRegistry(registry);
  return createTaxonomyResolver(registry);
}

function createTaxonomyResolver(registryInput) {
  const registry = ensureRegistryShape(registryInput);

  return {
    registry,
    getTagSlug(tag) {
      return ensureEntry(registry.tags, tag);
    },
    getCategorySlug(category) {
      return ensureEntry(registry.categories, category);
    },
    getSubcategorySlug(category, subcategory) {
      this.getCategorySlug(category);
      return ensureSubcategoryEntry(registry, category, subcategory);
    },
    tagUrl(tag) {
      return `./tags/${this.getTagSlug(tag)}/index.html`;
    },
    categoryUrl(category) {
      return `./categories/${this.getCategorySlug(category)}/index.html`;
    },
    subcategoryUrl(category, subcategory) {
      return `./categories/${this.getCategorySlug(category)}/${this.getSubcategorySlug(category, subcategory)}/index.html`;
    },
    save() {
      saveRegistry(registry);
    },
  };
}

module.exports = {
  REGISTRY_PATH,
  loadRegistry,
  saveRegistry,
  createTaxonomyResolver,
  ensureTaxonomyRegistry,
  toAsciiBase,
};
