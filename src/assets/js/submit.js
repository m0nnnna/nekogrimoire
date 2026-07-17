(function () {
  var cfg = window.NEKOGRIMOIRE_CONFIG || { repo: "", branch: "main" };

  var titleEl = document.getElementById("f-title");
  var creditNameEl = document.getElementById("f-credit-name");
  var creditUrlEl = document.getElementById("f-credit-url");
  var tagsEl = document.getElementById("f-tags");
  var imagesEl = document.getElementById("f-images");
  var versionsEl = document.getElementById("versions");
  var previewEl = document.getElementById("f-preview");

  var addVersionBtn = document.getElementById("add-version-btn");
  var generateBtn = document.getElementById("generate-btn");
  var copyJsonBtn = document.getElementById("copy-json-btn");
  var uploadLinkBtn = document.getElementById("upload-link-btn");

  function slugify(str) {
    return (str || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "untitled-prompt";
  }

  function addVersionRow(label, text) {
    var row = document.createElement("div");
    row.className = "version-fields";
    row.innerHTML =
      '<button type="button" class="remove-version">remove</button>' +
      '<div class="field">' +
      '<label>Version label (AI / variant name)</label>' +
      '<input type="text" class="v-label" placeholder="Midjourney v6" />' +
      "</div>" +
      '<div class="field">' +
      "<label>Prompt text</label>" +
      '<textarea class="v-text" rows="3" placeholder="the exact prompt text…"></textarea>' +
      "</div>";
    row.querySelector(".v-label").value = label || "";
    row.querySelector(".v-text").value = text || "";
    row.querySelector(".remove-version").addEventListener("click", function () {
      if (versionsEl.children.length > 1) {
        row.remove();
        updatePreview();
      }
    });
    row.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", updatePreview);
    });
    versionsEl.appendChild(row);
  }

  function collectVersions() {
    return Array.prototype.slice
      .call(versionsEl.querySelectorAll(".version-fields"))
      .map(function (row) {
        return {
          label: row.querySelector(".v-label").value.trim(),
          text: row.querySelector(".v-text").value,
        };
      })
      .filter(function (v) {
        return v.text.trim().length > 0;
      });
  }

  function buildData() {
    var tags = tagsEl.value
      .split(",")
      .map(function (t) {
        return t.trim();
      })
      .filter(Boolean);

    var images = imagesEl.value
      .split("\n")
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean)
      .map(function (name) {
        return name.indexOf("/") === -1 ? "/images/" + name : name;
      });

    var data = {
      title: titleEl.value.trim() || "Untitled Prompt",
      credit: creditNameEl.value.trim()
        ? { name: creditNameEl.value.trim(), url: creditUrlEl.value.trim() || undefined }
        : undefined,
      tags: tags,
      images: images,
      dateAdded: new Date().toISOString().slice(0, 10),
      versions: collectVersions(),
    };

    return data;
  }

  function updatePreview() {
    previewEl.value = JSON.stringify(buildData(), null, 2);
  }

  function currentSlug() {
    return slugify(titleEl.value);
  }

  titleEl.addEventListener("input", updatePreview);
  [creditNameEl, creditUrlEl, tagsEl, imagesEl].forEach(function (el) {
    el.addEventListener("input", updatePreview);
  });

  addVersionBtn.addEventListener("click", function () {
    addVersionRow();
    updatePreview();
  });

  uploadLinkBtn.addEventListener("click", function () {
    window.open(
      "https://github.com/" + cfg.repo + "/upload/" + encodeURIComponent(cfg.branch) + "/images",
      "_blank"
    );
  });

  generateBtn.addEventListener("click", function () {
    var data = buildData();
    if (!titleEl.value.trim()) {
      alert("Please add a title first.");
      return;
    }
    if (data.versions.length === 0) {
      alert("Please add at least one prompt version with text.");
      return;
    }

    var slug = currentSlug();
    var filename = "prompts/" + slug + ".json";
    var content = JSON.stringify(data, null, 2);
    var url =
      "https://github.com/" + cfg.repo + "/new/" + encodeURIComponent(cfg.branch) +
      "?filename=" + encodeURIComponent(filename) +
      "&value=" + encodeURIComponent(content) +
      "&message=" + encodeURIComponent("Add prompt: " + data.title);

    if (url.length > 7500) {
      alert(
        "This prompt is long enough that the auto-generated link may not open correctly. " +
          "Use “Copy JSON instead” and paste it manually into a new file on GitHub."
      );
    }

    window.open(url, "_blank");
  });

  copyJsonBtn.addEventListener("click", function () {
    updatePreview();
    navigator.clipboard.writeText(previewEl.value).then(function () {
      var original = copyJsonBtn.textContent;
      copyJsonBtn.textContent = "Copied!";
      setTimeout(function () {
        copyJsonBtn.textContent = original;
      }, 1500);
    });
  });

  // init
  addVersionRow();
  updatePreview();
})();
