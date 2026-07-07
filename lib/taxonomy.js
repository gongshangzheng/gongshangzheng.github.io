const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin-pro');
const { PATHS } = require('./config');

const REGISTRY_PATH = path.join(PATHS.root, 'data', 'taxonomy-slugs.json');
const NAMES_PATH = path.join(PATHS.root, 'data', 'category-names.json');

/**
 * category-names.json provides explicit Chinese→English slug translations.
 * Falls back to pinyin conversion when no translation is registered.
 */
function loadCategoryNames() {
  try {
    if (fs.existsSync(NAMES_PATH)) {
      return JSON.parse(fs.readFileSync(NAMES_PATH, 'utf8'));
    }
  } catch (e) {
    // fallthrough to empty
  }
  return {};
}

const categoryNames = loadCategoryNames();

/**
 * Backward-compatible registry shape — still stores tags and categorySlugs
 * (flat map: any category name at any depth → slug).
 */
const DEFAULT_REGISTRY = {
  version: 2,
  tags: {},
  categorySlugs: {},
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
  if (isObject(input.categorySlugs)) {
    registry.categorySlugs = { ...input.categorySlugs };
  } else {
    // Migrate old nested structure into flat map
    if (isObject(input.categories)) {
      for (const [k, v] of Object.entries(input.categories)) {
        if (typeof v === 'string') registry.categorySlugs[k] = v;
      }
    }
    if (isObject(input.subcategories)) {
      for (const submap of Object.values(input.subcategories)) {
        if (isObject(submap)) {
          for (const [k, v] of Object.entries(submap)) {
            if (typeof v === 'string' && !registry.categorySlugs[k]) registry.categorySlugs[k] = v;
          }
        }
      }
    }
    if (isObject(input.subsubcategories)) {
      for (const submap of Object.values(input.subsubcategories)) {
        if (isObject(submap)) {
          for (const subsubmap of Object.values(submap)) {
            if (isObject(subsubmap)) {
              for (const [k, v] of Object.entries(subsubmap)) {
                if (typeof v === 'string' && !registry.categorySlugs[k]) registry.categorySlugs[k] = v;
              }
            }
          }
        }
      }
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

  // 1. Check explicit translation registry
  if (typeof categoryNames[raw] === 'string' && categoryNames[raw].trim()) {
    return categoryNames[raw].trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'item';
  }

  // 2. Fallback to pinyin conversion
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

/**
 * Ensure a slug exists for a category name in the flat categorySlugs map.
 * Checks the translation registry first, then pinyin, then collision-avoidance.
 *
 * If a cached pinyin slug exists but a translation has since been added to
 * category-names.json, the translation takes precedence and the cache is
 * updated.
 */
function ensureCategorySlug(map, name) {
  // Check translation registry first — translations always win over stale cache
  if (typeof categoryNames[name] === 'string' && categoryNames[name].trim()) {
    const translated = categoryNames[name].trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (translated) {
      // If cache already has the correct translation, return early
      if (map[name] === translated) return translated;
      // If cache has a stale pinyin but translation now exists, upgrade
      // (only if the translated slug isn't already claimed by another name)
      const claimedBy = Object.keys(map).find(k => map[k] === translated);
      if (!claimedBy || claimedBy === name) {
        map[name] = translated;
        return translated;
      }
    }
  }
  // Use cached value if no translation upgrade is needed
  if (typeof map[name] === 'string' && map[name].trim()) return map[name];
  // Fallback: pinyin-based slug with collision avoidance
  const used = new Set(Object.values(map).filter(value => typeof value === 'string' && value.trim()));
  const slug = nextAvailableSlug(toAsciiBase(name), used);
  map[name] = slug;
  return slug;
}

function ensureEntry(map, key) {
  // Translation registry takes precedence over stale cache (same logic as ensureCategorySlug)
  if (typeof categoryNames[key] === 'string' && categoryNames[key].trim()) {
    const translated = categoryNames[key].trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (translated) {
      if (map[key] === translated) return translated;
      const claimedBy = Object.keys(map).find(k => map[k] === translated);
      if (!claimedBy || claimedBy === key) {
        map[key] = translated;
        return translated;
      }
    }
  }
  // Use cached value if no translation upgrade is needed
  if (typeof map[key] === 'string' && map[key].trim()) return map[key];
  // Fallback: pinyin-based slug with collision avoidance
  const used = new Set(Object.values(map).filter(value => typeof value === 'string' && value.trim()));
  const slug = nextAvailableSlug(toAsciiBase(key), used);
  map[key] = slug;
  return slug;
}

/**
 * Ensure taxonomy registry has slugs for all tags and category path segments.
 */
function ensureTaxonomyRegistry(allPosts) {
  const registry = loadRegistry();
  let mutated = false;

  for (const post of allPosts || []) {
    // Tags
    for (const tag of (post.tags || [])) {
      if (!(typeof registry.tags[tag] === 'string' && registry.tags[tag].trim())) {
        ensureEntry(registry.tags, tag);
        mutated = true;
      }
    }
    // Category path segments (flat map — each name gets one slug regardless of depth)
    for (const seg of (post.categoryPath || [])) {
      if (!(typeof registry.categorySlugs[seg] === 'string' && registry.categorySlugs[seg].trim())) {
        ensureCategorySlug(registry.categorySlugs, seg);
        mutated = true;
      }
    }
  }

  if (mutated || !fs.existsSync(REGISTRY_PATH)) saveRegistry(registry);
  return createTaxonomyResolver(registry);
}

function createTaxonomyResolver(registryInput) {
  const registry = ensureRegistryShape(registryInput);

  // Collect all used category slugs for collision detection
  function usedCategorySlugs() {
    return new Set(Object.values(registry.categorySlugs).filter(v => typeof v === 'string' && v.trim()));
  }

  function getNameSlug(name) {
    return ensureCategorySlug(registry.categorySlugs, name);
  }

  function getPathSlugs(segments) {
    return (segments || []).map(seg => getNameSlug(seg));
  }

  function pathUrl(segments) {
    const slugs = getPathSlugs(segments);
    if (!slugs.length) return './categories/index.html';
    return `./categories/${slugs.join('/')}/index.html`;
  }

  return {
    registry,
    // --- New path-based API ---
    getNameSlug,
    getPathSlugs,
    pathUrl,
    /**
     * Parse a category alias string like "categories/AI/动作识别/宠物动作识别"
     * into path segments ["AI", "动作识别", "宠物动作识别"].
     * Returns [] for hub aliases (ending in /index) or non-category aliases.
     */
    parseCategoryAlias(alias) {
      const raw = String(alias || '').replace(/^\/+|\/+$/g, '');
      if (!raw.startsWith('categories/')) return [];
      const rest = raw.slice('categories/'.length);
      if (rest.endsWith('/index') || rest === 'index') return [];
      return rest.split('/').filter(Boolean);
    },
    /**
     * Check if an alias is a category hub override (e.g. "categories/AI/动作识别/index")
     */
    isHubAlias(alias) {
      const raw = String(alias || '').replace(/^\/+|\/+$/g, '');
      return raw.startsWith('categories/') && (raw.endsWith('/index') || raw === 'categories/index');
    },
    /**
     * Normalize a hub alias into its slug path form: "categories/AI/动作识别/index" → "categories/ai/action-recognition/index"
     */
    normalizeHubAlias(alias) {
      const raw = String(alias || '').replace(/^\/+|\/+$/g, '');
      const parts = raw.split('/').filter(Boolean);
      if (parts[0] !== 'categories') return raw;
      // Last part should be "index"
      if (parts[parts.length - 1] !== 'index') return raw;
      const nameParts = parts.slice(1, -1);
      const slugParts = getPathSlugs(nameParts);
      return `categories/${slugParts.join('/')}/index`;
    },
    // --- Backward-compatible API (delegates to flat map) ---
    getTagSlug(tag) {
      return ensureEntry(registry.tags, tag);
    },
    getCategorySlug(category) {
      return getNameSlug(category);
    },
    getSubcategorySlug(category, subcategory) {
      getNameSlug(category);
      return getNameSlug(subcategory);
    },
    getSubsubcategorySlug(category, subcategory, subsubcategory) {
      getNameSlug(category);
      getNameSlug(subcategory);
      return getNameSlug(subsubcategory);
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
    subsubcategoryUrl(category, subcategory, subsubcategory) {
      return `./categories/${this.getCategorySlug(category)}/${this.getSubcategorySlug(category, subcategory)}/${this.getSubsubcategorySlug(category, subcategory, subsubcategory)}/index.html`;
    },
    save() {
      saveRegistry(registry);
    },
  };
}

module.exports = {
  REGISTRY_PATH,
  NAMES_PATH,
  loadRegistry,
  saveRegistry,
  createTaxonomyResolver,
  ensureTaxonomyRegistry,
  toAsciiBase,
  loadCategoryNames,
};
