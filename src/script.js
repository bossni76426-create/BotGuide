/* =========================================================
   GOGITO Bot Guide — data + rendering
   Shared with the admin page; rendering blocks self-skip
   when the expected DOM nodes are not present.
   ========================================================= */

const STORAGE_KEY = "dokkan_guide_overrides_v1";

const STEPS = [
  {
    id: "start",
    num: 1,
    title: "Download & launch",
    desc: "The bot ships as a single Nuitka-compiled .exe. No Python install required — just double-click GogitoBot.exe.",
  },
  {
    id: "login",
    num: 2,
    title: "Create or load an account",
    desc: "Sign up a fresh account, log in with Google, or load a saved one.",
  },
  {
    id: "help",
    num: 3,
    title: "Type a command",
    desc: "Once logged in, type `help` to list everything or jump straight into farming.",
  },
];

const COMMANDS = [
  /* ===================== BOT MENU LAYER ===================== */
  {
    section: "menu", cat: "menu", tier: "basic", id: "new",
    name: "new <client> <platform> [count]",
    desc: "Create a fresh Dokkan account. Use gb/jp for client and android/ios for platform. Pass a count to open multiple terminals for bulk reroll.",
    example: "new gb android\nnew jp ios 5",
  },
  {
    section: "menu", cat: "menu", tier: "basic", id: "load",
    name: "load <name|number>",
    desc: "Load an existing save into the current terminal. Auto-detects the platform.",
    example: "load mainacc\nload 3",
  },
  {
    section: "menu", cat: "menu", tier: "basic", id: "login",
    name: "login <name>  ·  login all [n]",
    desc: "Open a new terminal window for one save, or open terminals for every save (optionally limited to the first n).",
    example: "login mainacc\nlogin all 5",
  },
  {
    section: "menu", cat: "menu", tier: "basic", id: "login-gg",
    name: "login gg <client> <platform>",
    desc: "Sign in through Google for the given client/platform combo.",
    example: "login gg gb android\nlogin gg jp ios",
  },
  {
    section: "menu", cat: "menu", tier: "basic", id: "id",
    name: "id <identifier>",
    desc: "Skip the save flow and log in directly from a Dokkan transfer identifier.",
    example: "id abc123xyz",
  },
  {
    section: "menu", cat: "menu", tier: "basic", id: "list",
    name: "list",
    desc: "Show every saved account with its name, client and platform.",
    example: "list",
  },
  {
    section: "menu", cat: "menu", tier: "basic", id: "custom-menu",
    name: "custom  ·  custom all",
    desc: "Run a custom command script from custom_commands/ on the current account, or on every saved account in batch.",
    example: "custom\ncustom all",
  },
  {
    section: "menu", cat: "menu", tier: "basic", id: "setproxy",
    name: "setproxy <url|none>",
    desc: "Set or clear the game API proxy for the active session. Saved with the account when you save it. Use `setproxy help` for the full guide.",
    example: "setproxy http://127.0.0.1:7890\nsetproxy socks5://host:1080\nsetproxy none",
  },
  {
    section: "menu", cat: "menu", tier: "basic", id: "limit",
    name: "limit",
    desc: "Display your tier, total account creation limit, and how many slots remain.",
    example: "limit",
  },
  {
    section: "menu", cat: "menu", tier: "basic", id: "settings-menu",
    name: "settings",
    desc: "Open the web UI that edits bot_config.json (delays, proxy, stamina, etc.).",
    example: "settings",
  },
  {
    section: "menu", cat: "menu", tier: "basic", id: "exit",
    name: "exit",
    desc: "Quit the bot cleanly from the menu, or leave the command loop back to the menu.",
    example: "exit",
  },

  /* ===================== ACCOUNT ===================== */
  {
    section: "in-game", cat: "account", tier: "basic", id: "info",
    name: "info",
    desc: "Display account information: name, rank, stones, zeni, friend code, capacity, current deck.",
    example: "info",
  },
  {
    section: "in-game", cat: "account", tier: "basic", id: "gift",
    name: "gift",
    desc: "Accept all pending gifts in the gift box and claim every available mission reward.",
    example: "gift",
  },
  {
    section: "in-game", cat: "account", tier: "basic", id: "refresh",
    name: "refresh",
    desc: "Re-authenticate the current client session. Use it when you see token / 401 errors.",
    example: "refresh",
  },
  {
    section: "in-game", cat: "account", tier: "basic", id: "updatedb",
    name: "updatedb",
    desc: "Force download / refresh of the local Dokkan database from the server. The bot also auto-runs this on first DB error.",
    example: "updatedb",
  },
  {
    section: "in-game", cat: "account", tier: "basic", id: "name",
    name: "name",
    desc: "Change the in-game display name of the loaded account.",
    example: "name",
  },
  {
    section: "in-game", cat: "account", tier: "basic", id: "link-google",
    name: "link google",
    desc: "Link the loaded Dokkan account to a Google account so you can recover it later.",
    example: "link google",
  },
  {
    section: "in-game", cat: "account", tier: "basic", id: "unlink-google",
    name: "unlink google",
    desc: "Remove the Google link from the loaded account.",
    example: "unlink google",
  },

  /* ===================== CARD MANAGEMENT ===================== */
  {
    section: "in-game", cat: "card", tier: "vip", id: "box",
    name: "box",
    desc: "Open the Card Box in your browser with full awaken / Hidden Potential options. Best way to inspect your whole collection.",
    example: "box",
  },
  {
    section: "in-game", cat: "card", tier: "basic", id: "card-view",
    name: "card view",
    desc: "Open the Card Box in view-only mode — same browser UI as box, without the awaken / HP actions.",
    example: "card view",
  },
  {
    section: "in-game", cat: "card", tier: "basic", id: "list-cards",
    name: "list cards [filter]",
    desc: "Print cards (SSR+) in the terminal. Optional filter by rarity (ssr/ur/lr), element (agl/teq/int/str/phy), or name substring.",
    example: "list cards\nlist cards lr\nlist cards goku",
  },
  {
    section: "in-game", cat: "card", tier: "basic", id: "list-items",
    name: "list items",
    desc: "Print your items in the terminal. Use `all` for every item or `cat` to pick a category (support / awakening / training).",
    example: "list items\nlist items all",
  },
  {
    section: "in-game", cat: "card", tier: "vip", id: "medalsgui",
    name: "medalsgui",
    desc: "Open the medal browser. Select medals, set quantities and the bot farms them in a single queue.",
    example: "medalsgui",
  },
  {
    section: "in-game", cat: "card", tier: "vip", id: "medalcardgui",
    name: "medalcardgui",
    desc: "Open the card browser to queue cards and farm full Dokkan-medal sets up to LR — no awakening, just medals.",
    example: "medalcardgui",
  },
  {
    section: "in-game", cat: "card", tier: "basic", id: "list-team",
    name: "list team",
    desc: "Print every team-build deck you have configured.",
    example: "list team",
  },
  {
    section: "in-game", cat: "card", tier: "vip", id: "link-view",
    name: "link view",
    desc: "Open the link-level viewer in the browser. Click a link to auto-farm it to max.",
    example: "link view",
  },
  {
    section: "in-game", cat: "card", tier: "vip", id: "awaken",
    name: "awaken",
    desc: "Train and Dokkan-awaken every awakenable card in your box up to its max rarity.",
    example: "awaken",
  },
  {
    section: "in-game", cat: "card", tier: "premium", id: "hp",
    name: "hp  (hiddenpotential)",
    desc: "Open Hidden Potential in the browser with auto-unlock of every path.",
    example: "hp",
  },
  {
    section: "in-game", cat: "card", tier: "vip", id: "team",
    name: "team view",
    desc: "Open the team builder to pick cards and assemble a composition.",
    example: "team view",
  },
  {
    section: "in-game", cat: "card", tier: "basic", id: "deck",
    name: "deck",
    desc: "Show the active deck number and optionally switch to another deck (1–50).",
    example: "deck",
  },
  {
    section: "in-game", cat: "card", tier: "basic", id: "sell",
    name: "sell  ·  sell auto [rarities]  ·  sell 99 <rarity>",
    desc: "Sell cards or items. `sell auto` mass-sells N/R/SR (default) or the rarities you pass. `sell 99 SR` sells up to 99 at once.",
    example: "sell\nsell auto\nsell auto N R SR\nsell 99 SR",
  },
  {
    section: "in-game", cat: "card", tier: "basic", id: "capacity",
    name: "capacity [times]",
    desc: "Expand the card box by 5 slots per use, spending 1 dragon stone each. Pass a number to repeat.",
    example: "capacity\ncapacity 10",
  },

  /* ===================== STAGES ===================== */
  {
    section: "in-game", cat: "stage", tier: "basic", id: "stage",
    name: "stage <id> <diff> [runs]",
    desc: "Complete a specific stage. Difficulty is the numeric Dokkan ID (1=Normal, 3=Z-Hard, etc.). Optional run count.",
    example: "stage 101001 3 5",
  },
  {
    section: "in-game", cat: "stage", tier: "vip", id: "stage-key",
    name: "stage key <id> <diff> [runs]",
    desc: "Complete an inactive event stage using stage keys.",
    example: "stage key 101001 3 5",
  },
  {
    section: "in-game", cat: "stage", tier: "basic", id: "area",
    name: "area <id>",
    desc: "Complete every stage in a story area.",
    example: "area 101",
  },
  {
    section: "in-game", cat: "stage", tier: "basic", id: "quests",
    name: "quests",
    desc: "Complete all unfinished story quest stages on your account.",
    example: "quests",
  },
  {
    section: "in-game", cat: "stage", tier: "basic", id: "list-events",
    name: "list events",
    desc: "List every active event with quest details printed to the terminal.",
    example: "list events",
  },
  {
    section: "in-game", cat: "stage", tier: "basic", id: "events",
    name: "events",
    desc: "Complete all unfinished event stages currently active in-game.",
    example: "events",
  },
  {
    section: "in-game", cat: "stage", tier: "vip", id: "events-keys",
    name: "events keys",
    desc: "Complete inactive (rotation-out) event stages using stage keys.",
    example: "events keys",
  },
  {
    section: "in-game", cat: "stage", tier: "basic", id: "eventgui",
    name: "eventgui",
    desc: "Open the event browser GUI to pick stages, set difficulty and run counts, then farm the queue.",
    example: "eventgui",
  },
  {
    section: "in-game", cat: "stage", tier: "basic", id: "dbstories",
    name: "dbstories",
    desc: "Complete all Dragon Ball Stories stages.",
    example: "dbstories",
  },
  {
    section: "in-game", cat: "stage", tier: "basic", id: "omegafarm",
    name: "omegafarm",
    desc: "Mega-combo: story, quests, events and Z-Battles in one go. The classic full-clear macro.",
    example: "omegafarm",
  },
  {
    section: "in-game", cat: "stage", tier: "basic", id: "settings",
    name: "settings",
    desc: "Open the web UI to edit bot_config.json — delays, proxy, stamina policy and more.",
    example: "settings",
  },

  /* ===================== Z-BATTLE / EZA ===================== */
  {
    section: "in-game", cat: "zbattle", tier: "basic", id: "zbattles",
    name: "zbattles",
    desc: "Complete all active Z-Battles up to level 30.",
    example: "zbattles",
  },
  {
    section: "in-game", cat: "zbattle", tier: "vip", id: "zbattles-keys",
    name: "zbattles keys",
    desc: "Complete inactive Z-Battles using Z-Battle keys.",
    example: "zbattles keys",
  },
  {
    section: "in-game", cat: "zbattle", tier: "basic", id: "list-eza",
    name: "list eza",
    desc: "List every EZA event with your current progress.",
    example: "list eza",
  },
  {
    section: "in-game", cat: "zbattle", tier: "basic", id: "eza",
    name: "eza <id>",
    desc: "Complete a specific EZA from its current level up to 30.",
    example: "eza 33",
  },
  {
    section: "in-game", cat: "zbattle", tier: "vip", id: "eza-replay",
    name: "eza replay <id> [sets]",
    desc: "Replay EZA checkpoints until target medal set(s): Bronze 15, Silver / Gold / Rainbow 30.",
    example: "eza replay 33\neza replay 33 3",
  },
  {
    section: "in-game", cat: "zbattle", tier: "vip", id: "eza-keys",
    name: "eza keys <id>",
    desc: "Finish an inactive EZA / Z-Battle using Z-Battle keys.",
    example: "eza keys 66",
  },
  {
    section: "in-game", cat: "zbattle", tier: "basic", id: "eza-lv-runs",
    name: "eza <id> <lv> <runs>",
    desc: "Run a single EZA level for a chosen number of attempts.",
    example: "eza 33 30 10",
  },
  {
    section: "in-game", cat: "zbattle", tier: "basic", id: "eza-range",
    name: "eza <id> <start>-<end>",
    desc: "Run an EZA across a level range, e.g. levels 11 through 30+.",
    example: "eza 148 11-999",
  },
  {
    section: "in-game", cat: "zbattle", tier: "vip", id: "supereza",
    name: "supereza",
    desc: "List and complete Super Z-Battle stages.",
    example: "supereza",
  },

  /* ===================== FARMING ===================== */
  {
    section: "in-game", cat: "farm", tier: "basic", id: "farmmedal",
    name: "farmmedal <id> <qty>",
    desc: "Farm an exact quantity of a specific medal. The bot adds to your current count until target is hit.",
    example: "farmmedal 15181 77",
  },
  {
    section: "in-game", cat: "farm", tier: "basic", id: "farmmedal-card",
    name: "farmmedal card <id>",
    desc: "Auto-farm every medal required to fully awaken a card.",
    example: "farmmedal card 1022361",
  },
  {
    section: "in-game", cat: "farm", tier: "basic", id: "farmdupe",
    name: "farmdupe <id> <qty>",
    desc: "Farm duplicate F2P copies of a card from its source stage(s).",
    example: "farmdupe 1022361 15",
  },
  {
    section: "in-game", cat: "farm", tier: "premium", id: "f2pauto",
    name: "farm f2pauto [UR|LR]",
    desc: "Automatically farm every F2P card across the box toward UR or LR. Default target is LR.",
    example: "farm f2pauto\nfarm f2pauto UR",
  },
  {
    section: "in-game", cat: "farm", tier: "vip", id: "farm-link",
    name: "farm link",
    desc: "Farm every link-skill level on the active team up to max (level 10).",
    example: "farm link",
  },
  {
    section: "in-game", cat: "farm", tier: "vip", id: "farm-card",
    name: "farm card",
    desc: "Pick any single card and farm its link skills to level 10.",
    example: "farm card",
  },
  {
    section: "in-game", cat: "farm", tier: "premium", id: "autobuild-all",
    name: "autobuild all",
    desc: "Auto-assemble a team from LR / UR cards that share the same maxed link-level attributes.",
    example: "autobuild all",
  },
  {
    section: "in-game", cat: "farm", tier: "vip", id: "f2p",
    name: "f2p",
    desc: "Open the F2P card farming browser. Pick cards, see DB plans, queue them — pair with `farm f2pauto` for full automation.",
    example: "f2p",
  },
  {
    section: "in-game", cat: "farm", tier: "vip", id: "bluegems",
    name: "bluegems <amount>",
    desc: "Farm Incredible Gems (blue) — used to raise Hidden Potential.",
    example: "bluegems 200",
  },
  {
    section: "in-game", cat: "farm", tier: "vip", id: "greengems",
    name: "greengems <amount>",
    desc: "Farm Support Memory Gems (green).",
    example: "greengems 200",
  },
  {
    section: "in-game", cat: "farm", tier: "basic", id: "rank",
    name: "rank",
    desc: "Display rank-up requirements and progress toward the next level.",
    example: "rank",
  },
  {
    section: "in-game", cat: "farm", tier: "vip", id: "dragonballs",
    name: "dragonballs",
    desc: "Collect Dragon Balls across active stages and pick which wishes to fulfill.",
    example: "dragonballs",
  },
  {
    section: "in-game", cat: "farm", tier: "vip", id: "dragonballs-auto",
    name: "dragonballs auto",
    desc: "Auto-collect every Dragon Ball stage available and grant all available wishes.",
    example: "dragonballs auto",
  },
  {
    section: "in-game", cat: "farm", tier: "vip", id: "missions-challenge",
    name: "missions challenge",
    desc: "Complete challenge missions (Red Zone and similar).",
    example: "missions challenge",
  },
  {
    section: "in-game", cat: "farm", tier: "vip", id: "missions-zbattles",
    name: "missions zbattles",
    desc: "Complete Z-Battle / EZA missions.",
    example: "missions zbattles",
  },
  {
    section: "in-game", cat: "farm", tier: "vip", id: "automissions",
    name: "automissions",
    desc: "Auto-complete both the challenge and Z-Battle mission lists in sequence.",
    example: "automissions",
  },

  /* ===================== GREATEST WARRIOR ===================== */
  {
    section: "in-game", cat: "gw", tier: "vip", id: "gwprogress",
    name: "gwprogress",
    desc: "Show Greatest Warrior (Tutorial) board progress and what is still missing.",
    example: "gwprogress",
  },
  {
    section: "in-game", cat: "gw", tier: "vip", id: "board",
    name: "board <1-7>",
    desc: "Auto-complete a specific Greatest Warrior board.",
    example: "board 1\nboard 5",
  },
  {
    section: "in-game", cat: "gw", tier: "vip", id: "autoboard",
    name: "autoboard",
    desc: "Run all 7 Greatest Warrior boards back-to-back.",
    example: "autoboard",
  },

  /* ===================== SUMMON ===================== */
  {
    section: "in-game", cat: "summon", tier: "basic", id: "summon",
    name: "summon",
    desc: "Open the summon banner browser. Pick a banner, summon type and count from the GUI.",
    example: "summon",
  },
  {
    section: "in-game", cat: "summon", tier: "basic", id: "summon-id",
    name: "summon <id> <m|s> [count]",
    desc: "Summon directly on a banner. `m` = multi, `s` = single. Count is optional.",
    example: "summon 12070 m 10\nsummon 569 s 30",
  },
  {
    section: "in-game", cat: "summon", tier: "basic", id: "summon-target",
    name: "summon <id> <m|s> <card_id[,card_id…]>",
    desc: "Summon until a target card (or any of several) appears, then auto-stop.",
    example: "summon 12070 m 1032530\nsummon 12070 m 1032530,1031370",
  },
  {
    section: "in-game", cat: "summon", tier: "basic", id: "list-summons",
    name: "list summons",
    desc: "List every banner currently summonable, with their IDs.",
    example: "list summons",
  },
  {
    section: "in-game", cat: "summon", tier: "basic", id: "summonsgui",
    name: "summonsgui",
    desc: "Open the summon banner browser GUI (same as `summon`).",
    example: "summonsgui",
  },

  /* ===================== SHOP ===================== */
  {
    section: "in-game", cat: "shop", tier: "basic", id: "baba",
    name: "baba",
    desc: "Print every Baba Shop item to the console with prices.",
    example: "baba",
  },
  {
    section: "in-game", cat: "shop", tier: "premium", id: "baba-gui",
    name: "baba gui",
    desc: "Open the Baba Shop in the browser to inspect bundles, currencies and click-buy items.",
    example: "baba gui",
  },
  {
    section: "in-game", cat: "shop", tier: "vip", id: "baba-auto",
    name: "baba auto",
    desc: "Mass-exchange SR cards for Baba Points (Hercule Statues etc.).",
    example: "baba auto",
  },
  {
    section: "in-game", cat: "shop", tier: "vip", id: "autotraining",
    name: "autotraining",
    desc: "Auto-buy all training items from the Zeni Shop — buys 200 of each per category.",
    example: "autotraining",
  },

  /* ===================== SPECIAL ===================== */
  {
    section: "in-game", cat: "special", tier: "vip", id: "clash",
    name: "clash",
    desc: "Complete the Ultimate Clash / Chain Battle event.",
    example: "clash",
  },
  {
    section: "in-game", cat: "special", tier: "basic", id: "custom",
    name: "custom <file>",
    desc: "Run a `.txt` script from custom_commands/. Each line is a command. Lines starting with `#` are comments.",
    example: "custom\ncustom dailies.txt",
  },
  {
    section: "in-game", cat: "special", tier: "basic", id: "tb",
    name: "tb  ·  tb <id>  ·  list tb",
    desc: "Toggle auto team-build, force-build a team for a specific category ID, or list every category that can be team-built.",
    example: "tb\ntb 30024\nlist tb",
  },
  {
    section: "in-game", cat: "special", tier: "vip", id: "memory",
    name: "memory",
    desc: "Toggle use of Support Memory in stages that allow it.",
    example: "memory",
  },
  {
    section: "in-game", cat: "special", tier: "vip", id: "bonus",
    name: "bonus",
    desc: "Toggle bonus-drop team priority during farming.",
    example: "bonus",
  },
  {
    section: "in-game", cat: "special", tier: "basic", id: "english",
    name: "english",
    desc: "Toggle English card / item names on the JP client.",
    example: "english",
  },
  {
    section: "in-game", cat: "special", tier: "basic", id: "skipid",
    name: "skipid",
    desc: "Toggle skipping pre-known stage IDs ON / OFF during farming.",
    example: "skipid",
  },
];

/* ===================== OVERRIDES (admin) ===================== */

function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to read overrides", e);
    return {};
  }
}

function overrideFor(prefix, id) {
  const overrides = loadOverrides();
  return overrides[`${prefix}-${id}`] || null;
}

/* ===================== RENDERING ===================== */

const TIER_LABELS = {
  basic: "Basic",
  vip: "VIP",
  premium: "Premium",
};

/* ===================== IMAGE RESOLUTION ===================== */

const MAX_PROBE = 4; // max screenshots auto-discovered per card
let imageManifestPromise = null;

function probeImage(url) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(url);
    im.onerror = () => resolve(null);
    im.src = url;
  });
}

function filePathFor(prefix, id, idx) {
  return idx === 0 ? `img/${prefix}-${id}.png` : `img/${prefix}-${id}-${idx + 1}.png`;
}

function loadImageManifest() {
  if (!imageManifestPromise) {
    imageManifestPromise = fetch("img-manifest.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { images: [] }))
      .then((data) => (Array.isArray(data.images) ? data.images : []))
      .catch(() => []);
  }
  return imageManifestPromise;
}

function normalizeKeyPart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function manifestImagesFor(manifest, prefix, id) {
  const key = `${prefix}-${normalizeKeyPart(id)}`;
  return manifest.filter((url) => {
    const filename = decodeURIComponent(url.split("/").pop() || "");
    const name = normalizeKeyPart(filename);
    return name === key || name.startsWith(`${key}-`) || name.includes(key);
  });
}

function fallbackManifestImagesFor(manifest, prefix, id) {
  if (!manifest.length) return [];
  const index =
    prefix === "step"
      ? STEPS.findIndex((item) => item.id === id)
      : STEPS.length + COMMANDS.findIndex((item) => item.id === id);
  return index >= 0 && index < manifest.length ? [manifest[index]] : [];
}

// Resolve images for a card: override first, then probe sequential files.
async function resolveImages(prefix, id, override) {
  if (override) {
    if (Array.isArray(override.images) && override.images.length) return override.images.slice();
    if (override.image) return [override.image];
  }
  const probes = [];
  for (let i = 0; i < MAX_PROBE; i++) {
    probes.push(probeImage(filePathFor(prefix, id, i)));
  }
  const results = await Promise.all(probes);
  const out = [];
  for (const r of results) {
    if (r) out.push(r);
    else break; // stop at first gap
  }
  if (out.length) return out;

  const manifest = await loadImageManifest();
  const mapped = manifestImagesFor(manifest, prefix, id);
  if (mapped.length) return mapped;
  return fallbackManifestImagesFor(manifest, prefix, id);
}

function attachShot(fig, images, captionLabel) {
  const img = fig.querySelector("img") || document.createElement("img");
  if (!img.parentElement) {
    img.alt = captionLabel;
    img.loading = "lazy";
    fig.prepend(img);
  }
  const badge = fig.querySelector(".shot-count");

  if (!images || images.length === 0) {
    fig.classList.remove("has-image");
    img.removeAttribute("src");
    if (badge) badge.hidden = true;
    fig.removeAttribute("data-clickable");
    return;
  }

  fig.classList.add("has-image");
  fig._images = images;
  fig._caption = captionLabel;
  fig.dataset.clickable = "1";
  img.src = images[0];
  if (badge) {
    if (images.length > 1) {
      badge.textContent = `+${images.length - 1}`;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }
}

/* ===================== RENDERING ===================== */

function renderCards() {
  const tpl = document.getElementById("tpl-card");
  const grids = document.querySelectorAll(".cmd-grid");
  if (!tpl || grids.length === 0) return; // not on public page

  const buckets = {};
  grids.forEach((g) => (buckets[g.dataset.section] = g));
  const overrides = loadOverrides();

  COMMANDS.forEach((cmd) => {
    const grid = buckets[cmd.section];
    if (!grid) return;

    // Merge overrides (text only; image handled below)
    const ov = overrides[`cmd-${cmd.id}`] || {};
    const name = ov.name || cmd.name;
    const desc = ov.desc || cmd.desc;
    const example = ov.example != null ? ov.example : cmd.example;

    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = cmd.id;
    node.dataset.tier = cmd.tier;
    node.dataset.cat = cmd.cat;

    const haystack = (name + " " + desc + " " + (example || ""))
      .toLowerCase();
    node.dataset.search = haystack;

    node.querySelector(".cmd-name").textContent = name;

    const badge = node.querySelector(".tier-badge");
    badge.textContent = TIER_LABELS[cmd.tier];
    badge.classList.add("tier-" + cmd.tier);

    node.querySelector(".cmd-desc").textContent = desc;

    const ex = node.querySelector(".cmd-example code");
    if (example) {
      ex.textContent = example;
    } else {
      node.querySelector(".cmd-example").remove();
    }

    const fig = node.querySelector(".shot");
    const cap = fig.querySelector("figcaption");
    const captionLabel = "Result: " + name.split(/[\s·]/)[0];
    cap.textContent = captionLabel;
    fig.dataset.captionLabel = captionLabel;

    grid.appendChild(node);

    // Resolve images asynchronously so the layout shows up immediately
    resolveImages("cmd", cmd.id, ov).then((images) => attachShot(fig, images, captionLabel));
  });

  // Stats
  const stat = document.getElementById("stat-cmds");
  if (stat) stat.textContent = COMMANDS.length;
}

/* ===================== STEP SHOTS ===================== */

function wireStepShots() {
  const overrides = loadOverrides();
  document.querySelectorAll(".step .shot").forEach((fig) => {
    const id = fig.dataset.shot;
    if (!id) return;
    const captionEl = fig.querySelector("figcaption");
    const captionLabel = (captionEl && captionEl.textContent.trim()) || ("Step " + id);
    const ov = overrides[`step-${id}`];
    resolveImages("step", id, ov).then((images) => attachShot(fig, images, captionLabel));
  });
}

/* ===================== FILTERING ===================== */

const state = {
  q: "",
  cat: "all",
  tier: "all",
};

function applyFilters() {
  const q = state.q.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll("#in-game-commands .cmd").forEach((node) => {
    const matchQ = !q || node.dataset.search.includes(q);
    const matchCat = state.cat === "all" || node.dataset.cat === state.cat;
    const matchTier = state.tier === "all" || node.dataset.tier === state.tier;
    const show = matchQ && matchCat && matchTier;
    node.style.display = show ? "" : "none";
    if (show) visible++;
  });

  // Also filter menu cards by search (ignore category/tier chips)
  document.querySelectorAll("#menu-commands .cmd").forEach((node) => {
    const matchQ = !q || node.dataset.search.includes(q);
    node.style.display = matchQ ? "" : "none";
  });

  const empty = document.getElementById("empty-state");
  if (empty) empty.hidden = visible > 0;
}

function wireFilters() {
  const search = document.getElementById("search");
  if (!search) return; // not on public page
  search.addEventListener("input", (e) => {
    state.q = e.target.value;
    applyFilters();
  });

  // Keyboard: focus search with `/`
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
      e.preventDefault();
      search.focus();
    }
  });

  document.querySelectorAll("#category-chips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll("#category-chips .chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.cat = chip.dataset.filter;
      applyFilters();
    });
  });

  document.querySelectorAll(".chips-tier .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll(".chips-tier .chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      state.tier = chip.dataset.tier;
      applyFilters();
    });
  });
}

/* ===================== OVERRIDE BANNER ===================== */

function maybeShowOverrideBanner() {
  const overrides = loadOverrides();
  if (!Object.keys(overrides).length) return;
  const main = document.querySelector("main.container");
  if (!main) return;
  const banner = document.createElement("aside");
  banner.className = "override-banner";
  banner.innerHTML =
    '<strong>Preview mode ·</strong> showing local edits from /admin. ' +
    '<button id="override-clear">Clear</button>';
  main.prepend(banner);
  document.getElementById("override-clear").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
}

/* ===================== LIGHTBOX ===================== */

const lightbox = {
  el: null,
  imgEl: null,
  capEl: null,
  counterEl: null,
  prevBtn: null,
  nextBtn: null,
  closeBtn: null,
  images: [],
  index: 0,
  caption: "",
  active: false,
};

function lightboxInit() {
  const el = document.getElementById("lightbox");
  if (!el) return;
  lightbox.el = el;
  lightbox.imgEl = el.querySelector(".lb-img");
  lightbox.capEl = el.querySelector(".lb-caption");
  lightbox.counterEl = el.querySelector(".lb-counter");
  lightbox.prevBtn = el.querySelector(".lb-prev");
  lightbox.nextBtn = el.querySelector(".lb-next");
  lightbox.closeBtn = el.querySelector(".lb-close");

  lightbox.closeBtn.addEventListener("click", lightboxClose);
  lightbox.prevBtn.addEventListener("click", () => lightboxStep(-1));
  lightbox.nextBtn.addEventListener("click", () => lightboxStep(1));
  el.addEventListener("click", (e) => {
    if (e.target === el) lightboxClose();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.active) return;
    if (e.key === "Escape") lightboxClose();
    else if (e.key === "ArrowLeft") lightboxStep(-1);
    else if (e.key === "ArrowRight") lightboxStep(1);
  });
}

function lightboxOpen(images, startIndex, caption) {
  if (!lightbox.el || !images || !images.length) return;
  lightbox.images = images;
  lightbox.index = Math.max(0, Math.min(startIndex || 0, images.length - 1));
  lightbox.caption = caption || "";
  lightbox.active = true;
  lightbox.el.hidden = false;
  lightbox.el.setAttribute("aria-hidden", "false");
  document.body.classList.add("lb-open");
  lightboxRender();
}

function lightboxClose() {
  if (!lightbox.active) return;
  lightbox.active = false;
  lightbox.el.hidden = true;
  lightbox.el.setAttribute("aria-hidden", "true");
  lightbox.imgEl.removeAttribute("src");
  document.body.classList.remove("lb-open");
}

function lightboxStep(delta) {
  if (!lightbox.images.length) return;
  const len = lightbox.images.length;
  lightbox.index = (lightbox.index + delta + len) % len;
  lightboxRender();
}

function lightboxRender() {
  const { images, index, caption } = lightbox;
  lightbox.imgEl.src = images[index];
  lightbox.imgEl.alt = caption + (images.length > 1 ? ` (${index + 1}/${images.length})` : "");
  lightbox.capEl.textContent = caption;
  lightbox.counterEl.textContent =
    images.length > 1 ? `${index + 1} / ${images.length}` : "";
  lightbox.counterEl.style.display = images.length > 1 ? "" : "none";
  lightbox.prevBtn.style.visibility = images.length > 1 ? "visible" : "hidden";
  lightbox.nextBtn.style.visibility = images.length > 1 ? "visible" : "hidden";
}

function wireShotClicks() {
  // Single delegated handler for clickable figures (cards + steps)
  document.addEventListener("click", (e) => {
    const fig = e.target.closest && e.target.closest(".shot[data-clickable]");
    if (!fig) return;
    const images = fig._images;
    if (!images || !images.length) return;
    e.preventDefault();
    lightboxOpen(images, 0, fig._caption || "");
  });

  // Keyboard: Enter / Space on focused .shot opens it
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const fig = document.activeElement;
    if (!fig || !fig.classList || !fig.classList.contains("shot")) return;
    if (!fig._images || !fig._images.length) return;
    e.preventDefault();
    lightboxOpen(fig._images, 0, fig._caption || "");
  });
}

/* ===================== INIT ===================== */

// Expose to admin page
window.GOGITO = { COMMANDS, STEPS, TIER_LABELS, STORAGE_KEY, loadOverrides };

document.addEventListener("DOMContentLoaded", () => {
  lightboxInit();
  renderCards();
  wireStepShots();
  wireFilters();
  wireShotClicks();
  maybeShowOverrideBanner();
});
