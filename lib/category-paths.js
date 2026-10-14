/** Return all category paths for a post, with legacy single-path fallback. */
function getCategoryPaths(post) {
  const candidates = Array.isArray(post && post.categoryPaths) && post.categoryPaths.length
    ? post.categoryPaths
    : (post && Array.isArray(post.categoryPath) && post.categoryPath.length ? [post.categoryPath] : []);
  const seen = new Set();
  return candidates.filter(path => {
    if (!Array.isArray(path) || !path.length) return false;
    const key = JSON.stringify(path);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchesCategoryPrefix(post, prefix) {
  return getCategoryPaths(post).some(path =>
    path.length >= prefix.length && prefix.every((segment, index) => path[index] === segment)
  );
}

module.exports = { getCategoryPaths, matchesCategoryPrefix };
