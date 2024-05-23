const yaml = require("js-yaml");
const { readFile } = require("fs/promises");

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
      date: parseDate(date),
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
  }, /**@type {Record<string, number>} */ ({}))).sort((a, b) => b[1] - a[1]).map(([lang, count]) => ({ lang, count }));
}

module.exports = async () => {
  const { electronics, software, networking } = yaml.load(await readFile("./src/data/projects.yml", "utf8"));

  const categories =  [
    { name: "Software", dates: groupProjects(software), langs: getLangs(software) },
    { name: "Electronics", dates: groupProjects(electronics), langs: getLangs(electronics) },
    { name: "Networking", dates: groupProjects(networking), langs: getLangs(networking) },
  ];

  const aggregatedLangs = categories.reduce((acc, { langs: cur }) => {
    cur.forEach(({ lang, count }) => {
      const existing = acc.find(el => el.lang === lang);
      if (existing) existing.count += count;
      else acc.push({ lang, count });
    });
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  return {
    categories,
    // Map of lang code (used in YAML file) to human readable name
    langs: {
      python: "Python",
      html: "HTML",
      css: "CSS",
      js: "JavaScript",
      ts: "TypeScript",
      node: "Node.js",
      kotlin: "Kotlin",
      c: "C",
      csharp: "C#",
      cpp: "C++",
      sql: "SQL",
      xml: "XML",
      vba: "Visual Basic",
      json: "JSON",
      rust: "Rust"
    },
    devicons: {
      python: "python",
      html: "html5",
      css: "css3",
      js: "javascript",
      ts: "typescript",
      node: "nodejs",
      kotlin: "kotlin",
      c: "c",
      csharp: "csharp",
      cpp: "cplusplus",
      sql: "postgresql",
      xml: "xml",
      vba: "visualbasic",
      json: "json",
      rust: { name: "rust", style: "original" }
    },
    aggregatedLangs
  };
}