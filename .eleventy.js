const autoprefixer = require("autoprefixer");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");
const yaml = require("js-yaml");
const { transform, Features } = require("lightningcss");
const htmlnano = require("htmlnano");

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
module.exports = eleventyConfig => {
  const postcssInstance = postcss([
    tailwindcss(),
    autoprefixer()
  ]);

  eleventyConfig.addPassthroughCopy("./src/assets");
  eleventyConfig.addPassthroughCopy("./src/robots.txt");
  eleventyConfig.addPassthroughCopy({ "./functions/_routes.json": "_routes.json" });
  eleventyConfig.addPassthroughCopy({ "./js/dist": "js" });
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.addTemplateFormats("css");

  // Compile our css with tailwind
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    async compile(inputContent, inputPath) {
      if (inputPath === "./src/main.css") {
        return async _data => {
          const content = await postcssInstance.process(inputContent, { from: "./src/main.css" });
          // run through lightningcss
          const result = transform({
            filename: "./src/main.css",
            code: Buffer.from(content.css),
            minify: true,
            sourceMap: false,
            nonStandard: { deepSelectorCombinator: true },
            include: Features.Nesting,
            errorRecovery: true,
            targets: {
              chrome: 105,
              firefox: 105,
              ios_saf: 16,
              android: 10
            }
          });
          return result.code.toString();
        };
      }
    }
  });

  if (process.env.NODE_ENV === "production") {
    eleventyConfig.addTransform("htmlmin", async function (content) {
      if (this.page.outputPath?.endsWith(".html")) {
        return await htmlnano.process(content, { minifyCss: false }).then(a => a.html);
      }
      return content;
    });
  }

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
