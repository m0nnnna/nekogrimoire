const fs = require("fs");
const path = require("path");

const PROMPTS_DIR = path.join(__dirname, "..", "..", "prompts");

module.exports = function () {
  const files = fs
    .readdirSync(PROMPTS_DIR)
    .filter((file) => file.endsWith(".json"));

  const prompts = files.map((file) => {
    const slug = file.replace(/\.json$/, "");
    const data = JSON.parse(fs.readFileSync(path.join(PROMPTS_DIR, file), "utf8"));

    return {
      slug,
      title: data.title || slug,
      credit: data.credit || null,
      tags: data.tags || [],
      images: data.images || [],
      versions: data.versions || [],
      dateAdded: data.dateAdded || null,
    };
  });

  prompts.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));

  return prompts;
};
