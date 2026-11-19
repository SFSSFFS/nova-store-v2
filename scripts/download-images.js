// =================================
// Downloads every Unsplash image used by the store into assets/images
// and rewrites the references (HTML, CSS, JS) to the local copies.
//
// Why: remote images slow the site down, can disappear, and a buyer expects
// the project to work on its own.
//
// Run from the project root (needs Node 18+ and an internet connection):
//     node scripts/download-images.js --dry-run     (shows what would happen)
//     node scripts/download-images.js               (downloads and rewrites)
//
// Unsplash photos can be used commercially, but check the license at
// https://unsplash.com/license before you sell the store, or replace them
// with your own product photos (keep the same file names, or edit js/products.js).
// =================================

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "assets", "images");
const DRY = process.argv.includes("--dry-run");

const URL_PATTERN = /https:\/\/images\.unsplash\.com\/[^\s"')]+/g;
const SCAN_DIRS = [".", "css", "js"];
const SCAN_EXT = [".html", ".css", ".js"];

function listFiles() {
    const files = [];
    SCAN_DIRS.forEach(function (dir) {
        const full = path.join(ROOT, dir);
        fs.readdirSync(full).forEach(function (name) {
            if (SCAN_EXT.includes(path.extname(name))) files.push(path.join(full, name));
        });
    });
    return files;
}

// photo-1539109136881-3be0616acf4b?...&w=1600 -> photo-1539109136881-3be0616acf4b-w1600.jpg
function localName(url) {
    const u = new URL(url.replace(/&amp;/g, "&"));
    const id = u.pathname.replace(/^\//, "").replace(/[^a-zA-Z0-9_-]/g, "");
    const width = u.searchParams.get("w") || "orig";
    return id + "-w" + width + ".jpg";
}

async function main() {
    const files = listFiles();
    const urls = new Set();

    files.forEach(function (file) {
        (fs.readFileSync(file, "utf8").match(URL_PATTERN) || []).forEach(function (u) { urls.add(u); });
    });

    console.log("Found " + urls.size + " Unsplash image(s) in " + files.length + " files.");
    if (!urls.size) return;

    const map = new Map();
    urls.forEach(function (u) { map.set(u, localName(u)); });

    if (DRY) {
        map.forEach(function (name, u) { console.log("  " + name + "  <-  " + u); });
        console.log("\nDry run only: nothing downloaded or changed.");
        return;
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });

    // Download first; only rewrite files if EVERY download succeeded.
    for (const [url, name] of map) {
        const target = path.join(OUT_DIR, name);
        if (fs.existsSync(target)) { console.log("exists   " + name); continue; }

        const response = await fetch(url.replace(/&amp;/g, "&"));
        if (!response.ok) throw new Error("Download failed (" + response.status + "): " + url);

        fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
        console.log("saved    " + name);
    }

    files.forEach(function (file) {
        let text = fs.readFileSync(file, "utf8");
        const original = text;

        map.forEach(function (name, url) {
            // From the project root (HTML, JS) the path is assets/images/...; from css/ it is ../assets/images/...
            const prefix = path.basename(path.dirname(file)) === "css" ? "../assets/images/" : "assets/images/";
            text = text.split(url).join(prefix + name);
        });

        if (text !== original) {
            fs.writeFileSync(file, text);
            console.log("updated  " + path.relative(ROOT, file));
        }
    });

    console.log("\nDone. Open the store and check that every image still shows.");
}

main().catch(function (error) {
    console.error("\n" + error.message);
    console.error("No files were rewritten.");
    process.exit(1);
});
