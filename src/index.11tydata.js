const included = [
  {
    name: "Electronics and IOT",
    cat: "electronics-and-IOT",
    color: "border-yellow-500",
    text: "hover:text-yellow-500"
  },
  {
    name: "Web Applications",
    cat: "web-development",
    color: "border-lime-500",
    text: "hover:text-lime-500"
  },
  {
    name: "Systems Applications",
    cat: "desktop-app-development",
    color: "border-emerald-500",
    text: "hover:text-emerald-500"
  },
  {
    name: "Mobile Apps",
    cat: "android-app-development",
    color: "border-teal-500",
    text: "hover:text-teal-500"
  }
];
  

export const eleventyComputed = {
  sections(data) {
    return included.map(({ name, cat, color, text }) => ({
      name,
      cat,
      color,
      text,
      projects: data.projects[cat].filter(project => project.image).sort((a, b) => b.date.localeCompare(a.date))
        .map(project => ({
          ...project,
          link: `/projects/?s=${encodeURIComponent(project.name)}`
        }))
    }));
  }
};
