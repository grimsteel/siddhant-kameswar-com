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
 * Group the projects by date and sort by date ascending
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
  }, /** @type {Record<string, Project[]>}) */ ({}));
  return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0])).map(([date, projects]) => {
    return {
      date: parseDate(date),
      projects
    }
  });
}

module.exports = async () => {
  const { electronics, software, networking } = yaml.load(await readFile("./src/projects/projects.yml", "utf8"));

  const categories =  [
    { name: "Software", dates: groupProjects(software) },
    { name: "Electronics", dates: groupProjects(electronics) },
    { name: "Networking", dates: groupProjects(networking) },
  ];

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
      xaml: "XAML"
    }
  };
}