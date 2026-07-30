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
  var resetPreviewBtn = document.getElementById("reset-preview-btn");

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

  // Once the user edits the preview box directly, it becomes the source of
  // truth — form-field changes stop overwriting it so manual edits survive.
  var previewEditedManually = false;

  function updatePreview() {
    if (previewEditedManually) return;
    previewEl.value = JSON.stringify(buildData(), null, 2);
  }

  // Returns the parsed JSON currently in the preview box, or null (with an
  // alert) if it isn't valid JSON. This is the single source of truth for
  // both "Copy JSON" and "Generate" so manual edits are always respected.
  function getPreviewData() {
    try {
      return JSON.parse(previewEl.value);
    } catch (e) {
      alert("The preview box doesn't contain valid JSON. Please fix it before continuing:\n\n" + e.message);
      return null;
    }
  }

  function currentSlug(title) {
    return slugify(title);
  }

  previewEl.addEventListener("input", function () {
    previewEditedManually = true;
  });

  resetPreviewBtn.addEventListener("click", function () {
    previewEditedManually = false;
    updatePreview();
  });

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

  // GitHub itself hard-rejects overly long request URLs ("Whoa there! Your
  // request URL is too long") well below typical browser limits. Stay well
  // under that wall and switch to a clipboard-copy fallback beyond it.
  var MAX_URL_VALUE_LENGTH = 3000;

  generateBtn.addEventListener("click", function () {
    updatePreview();
    var data = getPreviewData();
    if (!data) return;
    if (!data.title || !("" + data.title).trim()) {
      alert("Please add a title first.");
      return;
    }
    if (!Array.isArray(data.versions) || data.versions.length === 0) {
      alert("Please add at least one prompt version with text.");
      return;
    }

    var slug = currentSlug(data.title);
    var filename = "prompts/" + slug + ".json";
    var content = JSON.stringify(data, null, 2);
    var encodedValue = encodeURIComponent(content);

    var baseUrl =
      "https://github.com/" + cfg.repo + "/new/" + encodeURIComponent(cfg.branch) +
      "?filename=" + encodeURIComponent(filename) +
      "&message=" + encodeURIComponent("Add prompt: " + data.title);

    if (encodedValue.length > MAX_URL_VALUE_LENGTH) {
      // Too long to pass through the URL: copy JSON to the clipboard instead
      // and open a blank new-file page (still prefilled with the filename)
      // for the user to paste into.
      navigator.clipboard.writeText(content).then(
        function () {
          alert(
            "This prompt is too long to auto-fill, so the JSON has been copied to your clipboard instead. " +
              "A new GitHub file page is opening — just paste (Ctrl/Cmd+V) into the editor."
          );
          window.open(baseUrl, "_blank");
        },
        function () {
          alert(
            "This prompt is too long to auto-fill and your browser blocked the clipboard copy. " +
              "Use “Copy JSON instead” below, then paste it manually into a new file on GitHub."
          );
          window.open(baseUrl, "_blank");
        }
      );
      return;
    }

    window.open(baseUrl + "&value=" + encodedValue, "_blank");
  });

  copyJsonBtn.addEventListener("click", function () {
    updatePreview();
    if (!getPreviewData()) return;
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
