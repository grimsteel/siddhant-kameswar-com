import Alpine, { type Magics } from "alpinejs";
import devicons from "../../src/_data/devicons.json";
import langs from "../../src/_data/langs.json";

interface Project {
  name: string,
  date: string,
  description: string,
  langs: string[],
  tools: string[],
  skills: string[]
}

interface Category {
  name: string,
  dates: { date: string, projects: Project[] }[],
  langs: { lang: string, count: number }[],
  count: number,
  id: string
};

const categories = JSON.parse(document.getElementById("project-data").innerText) as Category[];
const aggregatedLangs = JSON.parse(document.getElementById("aggregated-langs").innerText) as { lang: string, count: number }[];
const categoryMap = new Map(categories.map(c => [c.id, c]));

const aggregatedProjects: [Map<string, Project[]>, number] = categories.reduce(([prev, c], acc) => {
  for (const date of acc.dates) {
    const existing = prev.get(date.date);
    if (existing) existing.push(...date.projects);
    else prev.set(date.date, [...date.projects]);
  }
  return [prev, c + acc.count];
}, [new Map<string, Project[]>(), 0] as [Map<string, Project[]>, number]);

const allProjects: Category = {
  name: "All projects",
  id: "",
  langs: aggregatedLangs,
  dates: [...aggregatedProjects[0].entries()]
           .sort((b, a) => a[0].localeCompare(b[0]))
           .map(([date, projects]) => ({ date, projects })),
  count: aggregatedProjects[1]
};

Alpine.data("projects", () => {
  const url = new URL(location.href);
  
  return {
    search: url.searchParams.get("s") ?? "",
    category: url.searchParams.get("c") ?? "",
    language: url.searchParams.get("l") ?? "",

    langNames: langs,
    
    init(this: Magics<{ search: string, category: string; language: string; categoryData: Category }>) {
      // update the URL when something changes
      this.$watch("search", (newValue) => {
        if (newValue.trim()) {
          url.searchParams.set("s", newValue.trim());
        } else {
          url.searchParams.delete("s");
        }
        history.replaceState(undefined, "", url);
      });
      this.$watch("category", (newValue) => {
        if (newValue.trim()) {
          url.searchParams.set("c", newValue.trim());

          // autoclear language
          if (!this.$data.categoryData.langs.find(l => l.lang === this.$data.language)) {
            this.$data.language = "";
          }
        } else {
          url.searchParams.delete("c");
        }
        history.replaceState(undefined, "", url);
      });
      this.$watch("language", (newValue) => {
        if (newValue.trim()) {
          url.searchParams.set("l", newValue.trim());
        } else {
          url.searchParams.delete("l");
        }
        history.replaceState(undefined, "", url);
      });
    },
    get categoryData() {
      return categoryMap.get(this.category) ?? allProjects;
    },
    get projects() {
      const search = this.search.trim().toLowerCase();
      if (this.language || search) {
        return (this.categoryData as Category).dates
          .map(({ date, projects }) => ({
            date,
            projects: projects.filter(p => {
              if (this.language && !p.langs?.includes(this.language)) return false;
              if (this.search && !p.name?.toLowerCase().includes(search) && !p.description?.toLowerCase().includes(search)) return false;
              return true;
            })
          }))
          .filter(d => d.projects.length > 0);
      } else {
        return (this.categoryData as Category).dates;
      }
    },
    /**
     * Humanize a date
     * @param {string} date 
     */
    parseDate(date: string) {
      // Can't use Date.parse here because of utc issues
      const [year, month] = date.split("-");
      // JS months are 0-indexed
      const dateObj = new Date(parseInt(year), parseInt(month) - 1);
      return dateObj.toLocaleString("en-US", { year: "numeric", month: "long" }); // "December 2023"
    },
    linkIcon(link: string) {
      if (link.includes("github.com")) {
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
</svg>`;
      } else {
        return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>
</svg>`;
      }
    }
  };
});

Alpine.start();
