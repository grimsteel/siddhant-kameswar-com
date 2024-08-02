import autoprefixer from "autoprefixer";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { load } from "js-yaml";
import { transform, Features } from "lightningcss";
import htmlnano from "htmlnano";

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
export default eleventyConfig => {
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
    const turnstileKey = process.env.TURNSTILE_SITE_KEY;
    if (!turnstileKey) {
      throw new Error("missing TURNSTILE_SITE_KEY environment variable");
    }
    eleventyConfig.addGlobalData("turnstileKey", turnstileKey);
    
    eleventyConfig.addTransform("htmlmin", async function (content) {
      if (this.page.outputPath?.endsWith(".html")) {
        return await htmlnano.process(content, { minifyCss: false }).then(a => a.html);
      }
      return content;
    });
  } else {
    // turnstile testing site key
    eleventyConfig.addGlobalData("turnstileKey", "1x00000000000000000000AA");
  }

  eleventyConfig.addGlobalData("currentYear", new Date().getFullYear());

  eleventyConfig.addDataExtension("yml", contents => load(contents));

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
