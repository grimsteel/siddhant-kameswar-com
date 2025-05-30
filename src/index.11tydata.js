export const eleventyComputed = {
  sections(data) {
    return data.rawSections.map(({ projects, cat }) => ({
      cat,
      projects: projects.map(({ cat, idx }) => {
        return {
          ...data.projects[cat][idx],
          cat
        }
      })
    }));
  }
};
export const rawSections = [
  {
    "projects": [
      {
        "cat": "web-development",
        "idx": 7
      },
      {
        "cat": "web-development",
        "idx": 3
      }
    ],
    "cat": "web-development"
  },
  {
    "projects": [
      {
        "cat": "electronics-and-IOT",
        "idx": 3
      },
      {
        "cat": "electronics-and-IOT",
        "idx": 6
      }
    ],
    "cat": "electronics-and-IOT"
  },
  {
    "projects": [
      {
        "cat": "desktop-app-development",
        "idx": 1
      },
      {
        "cat": "desktop-app-development",
        "idx": 8
      }
    ],
    "cat": "desktop-app-development"
  },
  {
    "projects": [
      {
        "cat": "android-app-development",
        "idx": 8
      },
      {
        "cat": "android-app-development",
        "idx": 7
      }
    ],
    "cat": "android-app-development"
  }
];
