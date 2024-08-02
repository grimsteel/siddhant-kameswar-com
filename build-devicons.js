import { readFile, writeFile} from "fs/promises";
import { optimize } from "svgo";

const deviconObj = JSON.parse(await readFile("./src/_data/devicons.json", "utf8"));

const devicons = Object.entries(deviconObj).map(([id, icon]) => {
    const iconId = icon.style ? icon.name : icon;
    const style = icon.style ?? "plain";

    return [id, `https://cdn.jsdelivr.net/gh/devicons/devicon@develop/icons/${iconId}/${iconId}-${style}.svg`];
});

devicons.push(["liquid", "https://github.com/panoply/vscode-liquid/raw/master/icons/liquid.svg"]);

const deviconSvgs = await Promise.all(
    devicons.map(async ([id, icon]) => {
        const res = await fetch(icon);
        let content = await res.text();
        // calculate the viewbox 
        const viewBox = content.match(/viewBox="[^"]+"/)[0];
        // contents between the svg tags
        const innerContents = content.match(/<svg [^>]+>(.*)<\/svg>/s)[1];
        // wrap in <symbol>
        const symbol = `<symbol id="${id}" ${viewBox}>${innerContents}</symbol>`;
        return symbol;
    })
);

// make the rust icon readable
const rustIdx = devicons.findIndex(el => el[0] === "rust");
deviconSvgs[rustIdx] = deviconSvgs[rustIdx].replace("<symbol", "<symbol fill='currentColor'");

// concatenate
const fullSprite = `<svg xmlns="http://www.w3.org/2000/svg">${deviconSvgs.join("")}</svg>`;
const optimized = optimize(fullSprite, {
    multipass: true,
    plugins: [
        {
            name: "preset-default",
            params: {
                overrides: {
                    cleanupIds: false,
                    // <symbol> is hidden
                    removeHiddenElems: false
                }
            }
        }
    ]
});

await writeFile("./src/assets/language-icons.svg", optimized.data);



