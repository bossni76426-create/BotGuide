module.exports = function (eleventyConfig) {
  // Admin is local-only by default. Set INCLUDE_ADMIN=1 to bundle it
  // (e.g. for testing the editor against the built _site).
  const includeAdmin = process.env.INCLUDE_ADMIN === "1";

  // Pass-through copy for static assets
  eleventyConfig.addPassthroughCopy({ "src/style.css": "style.css" });
  eleventyConfig.addPassthroughCopy({ "src/script.js": "script.js" });
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });

  if (includeAdmin) {
    eleventyConfig.addPassthroughCopy({ "src/admin.js": "admin.js" });
  } else {
    // Skip the admin folder + its assets in production builds
    eleventyConfig.ignores.add("src/admin/**");
  }

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
