const autoprefixer = require("autoprefixer");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
module.exports = eleventyConfig => {
    const postcssInstance = postcss([
        tailwindcss(),
        autoprefixer()
    ]);

    eleventyConfig.addTemplateFormats("css");

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