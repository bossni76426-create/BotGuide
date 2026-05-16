/* =========================================================
   GOGITO Bot Guide · Admin editor
   - Reads COMMANDS / STEPS from script.js (window.GOGITO)
   - Stores user overrides in localStorage (per-browser, draft mode)
   - Export to JSON for permanent baking via src/overrides.json
   ========================================================= */

(function () {
  if (!window.GOGITO) {
    console.error("Admin: window.GOGITO not loaded. Make sure script.js is included first.");
    return;
  }

  const { COMMANDS, STEPS, TIER_LABELS, STORAGE_KEY } = window.GOGITO;

  const MAX_IMG_WIDTH = 1280;
  const IMG_QUALITY = 0.85;

  /* ---------- storage ---------- */

  function readOverrides() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function writeOverrides(o) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
      return true;
    } catch (e) {
      alert(
        "Could not save to localStorage — usually means an image is too large. " +
          "Try Export JSON to back up your text edits before retrying."
      );
      console.error(e);
      return false;
    }
  }

  function setStatus(msg, kind) {
    const el = document.getElementById("admin-status");
    if (!el) return;
    el.textContent = msg;
    el.dataset.kind = kind || "info";
  }

  /* ---------- image processing ---------- */

  function fileToResizedDataURL(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => (img.src = reader.result);
      reader.onerror = reject;
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(1, MAX_IMG_WIDTH / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        // Prefer JPEG for screenshots — much smaller than PNG
        resolve(canvas.toDataURL("image/jpeg", IMG_QUALITY));
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- card rendering ---------- */

  function makeCard(kind, item) {
    // kind: "step" | "cmd"
    const tpl = document.getElementById("tpl-admin-card");
    const node = tpl.content.firstElementChild.cloneNode(true);
    const key = `${kind}-${item.id}`;

    node.dataset.id = item.id;
    node.dataset.kind = kind;
    node.dataset.key = key;
    node.dataset.cat = item.cat || (kind === "step" ? "step" : "");

    node.querySelector(".admin-card-id").textContent =
      kind === "step" ? `Step ${item.num} — ${item.title}` : item.name;

    const badge = node.querySelector(".tier-badge");
    if (kind === "cmd") {
      badge.textContent = TIER_LABELS[item.tier];
      badge.classList.add("tier-" + item.tier);
    } else {
      badge.remove();
    }

    const overrides = readOverrides();
    const ov = overrides[key] || {};

    /* fields */
    const fName = node.querySelector('[data-field="name"]');
    const fDesc = node.querySelector('[data-field="desc"]');
    const fEx = node.querySelector('[data-field="example"]');
    const fNameLabel = fName && fName.closest("label");

    if (kind === "step") {
      // Step name lives in static HTML — we only allow image override + a notes desc
      if (fNameLabel) fNameLabel.remove();
      fDesc.placeholder = "Optional note (not yet rendered on public site)";
      fEx.closest("label").remove();
      fDesc.value = ov.desc || "";
    } else {
      fName.placeholder = item.name;
      fName.value = ov.name || "";
      fDesc.placeholder = item.desc;
      fDesc.value = ov.desc || "";
      fEx.placeholder = item.example || "";
      fEx.value = ov.example || "";
    }

    /* gallery (multi-image) */
    const gallery = node.querySelector(".admin-gallery");
    const thumbsRow = node.querySelector(".admin-thumbs");
    const addLabel = node.querySelector(".admin-add-img");
    const fileInput = addLabel.querySelector('input[type="file"]');

    // In-memory state: array of data URLs OR file paths.
    // Order persisted in override.images on every change.
    let images = [];
    if (Array.isArray(ov.images) && ov.images.length) {
      images = ov.images.slice();
    } else if (ov.image) {
      images = [ov.image]; // legacy single-image entry
    }

    const filePrefix = kind === "step" ? "step" : "cmd";
    const probeFile = (idx) =>
      idx === 0
        ? `../img/${filePrefix}-${item.id}.png`
        : `../img/${filePrefix}-${item.id}-${idx + 1}.png`;

    async function probeFileChain() {
      const out = [];
      for (let i = 0; i < 4; i++) {
        const url = probeFile(i);
        const ok = await new Promise((res) => {
          const im = new Image();
          im.onload = () => res(true);
          im.onerror = () => res(false);
          im.src = url;
        });
        if (ok) out.push(url);
        else break;
      }
      return out;
    }

    function rerenderThumbs() {
      thumbsRow.innerHTML = "";
      const tpl = document.getElementById("tpl-admin-thumb");
      images.forEach((src, idx) => {
        const t = tpl.content.firstElementChild.cloneNode(true);
        t.dataset.idx = idx;
        t.querySelector("img").src = src;
        t.querySelector(".admin-thumb-up").disabled = idx === 0;
        t.querySelector(".admin-thumb-down").disabled = idx === images.length - 1;
        t.querySelector(".admin-thumb-up").addEventListener("click", (e) => {
          e.preventDefault();
          if (idx === 0) return;
          [images[idx - 1], images[idx]] = [images[idx], images[idx - 1]];
          persistImages();
        });
        t.querySelector(".admin-thumb-down").addEventListener("click", (e) => {
          e.preventDefault();
          if (idx === images.length - 1) return;
          [images[idx + 1], images[idx]] = [images[idx], images[idx + 1]];
          persistImages();
        });
        t.querySelector(".admin-thumb-remove").addEventListener("click", (e) => {
          e.preventDefault();
          images.splice(idx, 1);
          persistImages();
        });
        t.querySelector("img").addEventListener("click", () => openPreview(src));
        thumbsRow.appendChild(t);
      });
      gallery.classList.toggle("is-empty", images.length === 0);
    }

    function persistImages() {
      // Save the user's working set. Strip override.image if present
      // (we only care about images[] going forward).
      const all = readOverrides();
      const entry = all[key] ? { ...all[key] } : {};
      delete entry.image;
      if (images.length === 0) {
        delete entry.images;
      } else {
        entry.images = images.slice();
      }
      if (Object.keys(entry).length === 0) {
        delete all[key];
      } else {
        all[key] = entry;
      }
      if (writeOverrides(all)) {
        rerenderThumbs();
        flashSaved(node);
      }
    }

    async function addFiles(fileList) {
      const arr = Array.from(fileList || []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (!arr.length) return;
      try {
        for (const f of arr) {
          const url = await fileToResizedDataURL(f);
          images.push(url);
        }
        persistImages();
      } catch (err) {
        alert("Failed to process image: " + err.message);
      }
    }

    fileInput.addEventListener("change", (e) => {
      addFiles(e.target.files);
      fileInput.value = "";
    });

    // Drag & drop on whole gallery (or its container)
    gallery.addEventListener("dragover", (e) => {
      e.preventDefault();
      gallery.classList.add("dragover");
    });
    gallery.addEventListener("dragleave", () => gallery.classList.remove("dragover"));
    gallery.addEventListener("drop", (e) => {
      e.preventDefault();
      gallery.classList.remove("dragover");
      addFiles(e.dataTransfer.files);
    });

    // Initial paint: prefer overrides, else probe disk files
    if (images.length) {
      rerenderThumbs();
    } else {
      probeFileChain().then((found) => {
        if (found.length) {
          // Keep file paths in state (NOT saved as override; they live on disk)
          images = found;
          rerenderThumbs();
        } else {
          rerenderThumbs(); // empty state
        }
      });
    }

    /* text auto-save */
    [fName, fDesc, fEx].forEach((el) => {
      if (!el) return;
      el.addEventListener(
        "input",
        debounce(() => {
          const field = el.dataset.field;
          const value = el.value.trim();
          saveField(node, field, value === "" ? null : value);
        }, 300)
      );
    });

    /* per-card reset */
    node.querySelector(".admin-reset-card").addEventListener("click", () => {
      if (!confirm("Reset every override for this card?")) return;
      const all = readOverrides();
      delete all[key];
      writeOverrides(all);
      if (fName) fName.value = "";
      if (fDesc) fDesc.value = "";
      if (fEx) fEx.value = "";
      images = [];
      probeFileChain().then((found) => {
        images = found;
        rerenderThumbs();
      });
      flashSaved(node, "Reset");
    });

    return node;
  }

  /* ---------- thumbnail preview ---------- */

  function openPreview(src) {
    let lb = document.getElementById("admin-preview");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "admin-preview";
      lb.className = "admin-preview";
      lb.innerHTML =
        '<button class="admin-preview-close" aria-label="Close">&times;</button>' +
        '<img class="admin-preview-img" alt="Preview" />';
      document.body.appendChild(lb);
      lb.addEventListener("click", (e) => {
        if (e.target === lb || e.target.classList.contains("admin-preview-close")) {
          closePreview();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lb.classList.contains("open")) closePreview();
      });
    }
    lb.querySelector(".admin-preview-img").src = src;
    lb.classList.add("open");
    document.body.classList.add("lb-open");
  }

  function closePreview() {
    const lb = document.getElementById("admin-preview");
    if (!lb) return;
    lb.classList.remove("open");
    document.body.classList.remove("lb-open");
  }

  /* ---------- saving ---------- */

  function saveField(node, field, value) {
    const key = node.dataset.key;
    const all = readOverrides();
    const entry = all[key] || {};
    if (value == null) {
      delete entry[field];
    } else {
      entry[field] = value;
    }
    if (Object.keys(entry).length === 0) {
      delete all[key];
    } else {
      all[key] = entry;
    }
    if (writeOverrides(all)) {
      flashSaved(node);
    }
  }

  function flashSaved(node, label) {
    const el = node.querySelector(".admin-save-state");
    if (!el) return;
    el.textContent = label || "Saved ✓";
    el.classList.add("flash");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("flash"), 900);
  }

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /* ---------- toolbar ---------- */

  function exportJSON() {
    const data = readOverrides();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "overrides.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus(`Exported ${Object.keys(data).length} override(s). Put overrides.json in src/ and push it.`, "ok");
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (typeof parsed !== "object" || parsed === null) throw new Error("not an object");
        writeOverrides(parsed);
        setStatus(`Imported ${Object.keys(parsed).length} override(s). Reloading…`, "ok");
        setTimeout(() => location.reload(), 600);
      } catch (e) {
        alert("Invalid JSON: " + e.message);
      }
    };
    reader.readAsText(file);
  }

  function resetAll() {
    if (!confirm("Clear every local override? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  /* ---------- filtering ---------- */

  let activeCat = "all";
  let activeQuery = "";

  function applyFilters() {
    const q = activeQuery.toLowerCase();
    let visible = 0;
    document.querySelectorAll("#admin-cmds .admin-card").forEach((node) => {
      const cat = node.dataset.cat;
      const id = node.dataset.id;
      const name = node.querySelector(".admin-card-id").textContent.toLowerCase();
      const matchCat = activeCat === "all" || cat === activeCat;
      const matchQ = !q || name.includes(q) || id.toLowerCase().includes(q);
      const show = matchCat && matchQ;
      node.style.display = show ? "" : "none";
      if (show) visible++;
    });
    document.getElementById("admin-empty").hidden = visible > 0;
  }

  /* ---------- init ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    // Steps
    const stepsGrid = document.getElementById("admin-steps");
    STEPS.forEach((s) => stepsGrid.appendChild(makeCard("step", s)));

    // Commands
    const cmdsGrid = document.getElementById("admin-cmds");
    COMMANDS.forEach((c) => cmdsGrid.appendChild(makeCard("cmd", c)));

    // Toolbar
    document.getElementById("export-btn").addEventListener("click", exportJSON);
    document.getElementById("reset-btn").addEventListener("click", resetAll);
    document.getElementById("import-input").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importJSON(file);
    });

    // Search
    const search = document.getElementById("admin-search");
    search.addEventListener("input", (e) => {
      activeQuery = e.target.value.trim();
      applyFilters();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        search.focus();
      }
    });

    // Category chips
    document.querySelectorAll("#admin-categories .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document
          .querySelectorAll("#admin-categories .chip")
          .forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeCat = chip.dataset.filter;
        applyFilters();
      });
    });

    const count = Object.keys(readOverrides()).length;
    setStatus(
      count
        ? `${count} local override(s) active. They will preview on the public site in this browser.`
        : "Ready. Edits autosave to this browser only.",
      "info"
    );
  });
})();
