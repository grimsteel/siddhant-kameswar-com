const autoprefixer = require("autoprefixer");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");
const yaml = require("js-yaml");

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
module.exports = eleventyConfig => {
  const postcssInstance = postcss([
    tailwindcss(),
    autoprefixer()
  ]);

  eleventyConfig.addPassthroughCopy("./src/assets");
  eleventyConfig.addPassthroughCopy({ "./functions/_routes.json": "_routes.json" });
  eleventyConfig.addPassthroughCopy({ "./js/dist": "js" });
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.addTemplateFormats("css");

  // Compile our css with tailwind
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    async compile(inputContent, inputPath) {
      if (inputPath === "./src/main.css") {
        return async data => {
          const content = await postcssInstance.process(inputContent, { from: "./src/main.css" });
          return content.css
        };
      }
    }
  });

  eleventyConfig.addDataExtension("yml", contents => yaml.load(contents));

  eleventyConfig.addCollection("navbarSorted", collectionApi => {
    return collectionApi.getFilteredByTag("navbar").sort((a, b) => a.data.order - b.data.order);
  });

  return {
    dir: {
      input: "src",
      output: "dist"
    },
    formats: ["liquid", "html", "md", "css"]
  };
}
