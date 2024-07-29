/**
 * @typedef {{ name: string, date: string, cat: string, description: string, langs: string[], tools: string[], skills: string[] }} Project
 */

/**
 * Humanize a date
 * @param {string} date 
 */
function parseDate(date) {
  // Can't use Date.parse here because of utc issues
  const [year, month] = date.split("-");
  // JS months are 0-indexed
  const dateObj = new Date(parseInt(year), parseInt(month) - 1);
  return dateObj.toLocaleString("en-US", { year: "numeric", month: "long" }); // "December 2023"
}

/**
 * Group the projects by date and sort by date descending
 * @param {Project[]} projects 
 * @returns {{ month: string, projects: Project[] }[]}
 */
function groupProjects(projects) {
  const grouped = projects.reduce((acc, cur) => {
    if (acc[cur.date]) {
      acc[cur.date].push(cur);
    } else {
      acc[cur.date] = [cur];
    }
    return acc;
  }, /** @type {Record<string, Project[]>} */ ({}));
  return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).map(([date, projects]) => {
    return {
      date,
      projects
    }
  });
}

/**
 * Get the languages from the projects, sorted by count
 * @param {Project[]} projects 
 */
function getLangs(projects) {
  return Object.entries(projects.reduce((acc, cur) => {
    if (!cur.langs) return acc;
    for (const lang of cur.langs) {
      if (acc[lang]) {
        acc[lang]++;
      } else {
        acc[lang] = 1;
      }
    }
    return acc;
  }, /**@type {Record<string, number>} */ ({})))
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({ lang, count }));
}

function capitalize(slug) {
  return slug.split("-").map(el => el[0].toUpperCase() + el.substring(1)).join(" ");
}

let cachedCategories = null;
let lastCategoryCompute = 0;
let cachedLangs = null;
let lastLangCompute = 0;

module.exports = {
  categories(data) {
    // recompute if more than 5s ago
    if (cachedCategories && (Date.now() - lastCategoryCompute) < 5 * 1000) return cachedCategories;
    
    lastCategoryCompute = Date.now();
    const categories = Object.entries(data.projects).map(([id, projects]) => ({
      name: capitalize(id),
      dates: groupProjects(projects),
      langs: getLangs(projects),
      count: projects.length,
      id
    }));
    // sort by count desc/name asc
    categories.sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));
    if (categories.length > 0) cachedCategories = categories;
    return categories;
  },
  // aggregate all of the languages across all of the projects
  aggregatedLangs: (data) => {
    // recompute if more than 5s ago
    if (cachedLangs && (Date.now() - lastLangCompute) < 5 * 1000) return cachedLangs;
    
    lastLangCompute = Date.now();
    const langs = data.categories.reduce?.((acc, { langs: cur }) => {
      cur.forEach(({ lang, count }) => {
        const existing = acc.find(el => el.lang === lang);
        if (existing) existing.count += count;
        else acc.push({ lang, count });
      });
      return acc;
    }, []).sort((a, b) => b.count - a.count);

    if (langs?.length > 0) cachedLangs = langs;
    return langs;
  }
};
