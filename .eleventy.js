const fs = require("fs");
const path = require("path");

const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"]);

function toUrlPath(filePath) {
  return filePath.split(path.sep).map(encodeURIComponent).join("/");
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listImages(fullPath);
      if (!entry.isFile()) return [];
      return imageExtensions.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
    });
}

module.exports = function (eleventyConfig) {
  // Admin is local-only by default. Set INCLUDE_ADMIN=1 to bundle it
  // (e.g. for testing the editor against the built _site).
  const includeAdmin = process.env.INCLUDE_ADMIN === "1";

  // Pass-through copy for static assets
  eleventyConfig.addPassthroughCopy({ "src/style.css": "style.css" });
  eleventyConfig.addPassthroughCopy({ "src/script.js": "script.js" });
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  if (fs.existsSync(path.join(__dirname, "src", "overrides.json"))) {
    eleventyConfig.addPassthroughCopy({ "src/overrides.json": "overrides.json" });
  }

  if (includeAdmin) {
    eleventyConfig.addPassthroughCopy({ "src/admin.js": "admin.js" });
  } else {
    // Skip the admin folder + its assets in production builds
    eleventyConfig.ignores.add("src/admin/**");
  }

  eleventyConfig.on("eleventy.after", () => {
    const imgDir = path.join(__dirname, "src", "img");
    const outDir = path.join(__dirname, "_site");
    const images = listImages(imgDir)
      .map((filePath) => `img/${toUrlPath(path.relative(imgDir, filePath))}`)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, "img-manifest.json"),
      JSON.stringify({ images }, null, 2)
    );
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: false,
    markdownTemplateEngine: "njk",
  };
};
