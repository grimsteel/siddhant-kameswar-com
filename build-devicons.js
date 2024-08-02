import { readFile, writeFile} from "fs/promises";
import { optimize } from "svgo";
import { load } from "js-yaml";

async function handleSvg(svgUrl, id) {
    const svgRes = await fetch(svgUrl);
    const svg = await svgRes.text();
    // calculate the viewbox 
    let viewBox = svg.match(/viewBox="[^"]+"/)?.[0];
    if (!viewBox) {
        // use width/height instead
        const width = svg.match(/width="(\d+)"/)[1];
        const height = svg.match(/height="(\d+)"/)[1];
        viewBox = `viewBox="0 0 ${width} ${height}"`;
    }
    /** @type {Map<string, string>} */
    const idMap = new Map();
    // contents between the svg tags
    let innerContents = svg.match(/<svg [^>]+>(.*)<\/svg>/s)[1]
        .replace('xmlns="&ns_sfw;"', '')
        // namespace all the ids within this svg
        .replace(/id="([^"]+)"/g, (_, oldId) => {
            const newId = `${id}-${oldId}`;
            idMap.set(oldId, newId);
            return `id="${newId}"`;
        });
    idMap.forEach((value, key) => {
        innerContents = innerContents.replace(new RegExp(`#${key}(?=\\b)`, "g"), `#${value}`);
    });
    
    // wrap in <symbol>
    const symbol = `<symbol id="${id}" ${viewBox}>${innerContents}</symbol>`;
    return symbol;
}

function makeSprite(symbols) {
    // concatenate
    const fullSprite = `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join("")}</svg>`;
    const optimized = optimize(fullSprite, {
        multipass: true,
        plugins: [
            {
                name: "preset-default",
                params: {
                    overrides: {
                        cleanupIds: false,
                        // <symbol> is hidden
                        removeHiddenElems: false,
                        removeUselessDefs: false
                    }
                }
            }
        ]
    });
    return optimized.data;
}

const deviconObj = JSON.parse(await readFile("./src/_data/devicons.json", "utf8"));

const devicons = Object.entries(deviconObj).map(([id, icon]) => {
    const iconId = icon.style ? icon.name : icon;
    const style = icon.style ?? "plain";

    return [id, `https://cdn.jsdelivr.net/gh/devicons/devicon@develop/icons/${iconId}/${iconId}-${style}.svg`];
});

devicons.push(["liquid", "https://github.com/panoply/vscode-liquid/raw/master/icons/liquid.svg"]);

const deviconSvgs = await Promise.all(
    devicons.map(([id, url]) => handleSvg(url, id))
);

// make the rust icon readable
const rustIdx = devicons.findIndex(el => el[0] === "rust");
deviconSvgs[rustIdx] = deviconSvgs[rustIdx].replace("<symbol", "<symbol fill='currentColor'");

await writeFile("./src/assets/language-icons.svg", makeSprite(deviconSvgs));


const skillsObj = load(await readFile("./src/_data/skills.yml", "utf8"));
const skillIcons = await Promise.all(Object.values(skillsObj).flat().map(async ({ icon, icon_url }) => {
    const url = icon_url ?? `https://cdn.jsdelivr.net/gh/devicons/devicon@develop/icons/${icon}/${icon}-original.svg`;
    // non-svg images are wrapped in an <image>
    if (url.endsWith(".svg")) {
        const result = await handleSvg(url, icon);
        // make some icons more readable
        if (icon === "denojs" || icon === "django") {
            return result.replace("<symbol", "<symbol fill='currentColor'");
        } else if (icon === "flask" || icon === "github") {
            return result.replace(/fill="[^"]+"/, "fill='currentColor'");
        } else return result;
    } else {
        return `<symbol viewBox="0 0 24 24" id="${icon}"><image height="24" width="24" href="${url}" /></symbol>`
    }
}));
await writeFile("./src/assets/skill-icons.svg", makeSprite(skillIcons));

