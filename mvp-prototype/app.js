const state = {
  splits: [
    { email: "artist@kroa.local", percentage: 70 },
    { email: "producer@example.com", percentage: 30 }
  ],
  coverArt: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const sevenDaysFromNow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};

const releaseDateInput = $("#releaseDate");
releaseDateInput.min = sevenDaysFromNow();
releaseDateInput.value = sevenDaysFromNow();

function getReleaseData() {
  const dsps = $$("#dspList input:checked").map((input) => input.value);
  return {
    artistName: $("#artistName").value.trim(),
    genre: $("#genre").value,
    title: $("#releaseTitle").value.trim(),
    type: $("#releaseType").value,
    releaseDate: $("#releaseDate").value,
    isrc: $("#isrc").value.trim().toUpperCase(),
    explicit: $("input[name='explicit']:checked").value,
    territory: $("input[name='territory']:checked").value,
    dsps,
    audioFile: $("#audioFile").files[0] || null,
    coverArt: state.coverArt
  };
}

function validateRelease() {
  const data = getReleaseData();
  const checks = [];
  const minDate = new Date(sevenDaysFromNow() + "T00:00:00");
  const chosenDate = data.releaseDate ? new Date(data.releaseDate + "T00:00:00") : null;
  const isrcPattern = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/;

  checks.push(result(
    data.title.length > 0,
    "Release title",
    "A release title is present.",
    "Add a release title before submission.",
    "error"
  ));

  checks.push(result(
    data.title !== data.title.toUpperCase() || data.title.length < 4,
    "Title formatting",
    "Title casing looks DSP-friendly.",
    "Avoid all-caps titles unless it is a registered artistic styling.",
    "warn"
  ));

  checks.push(result(
    !/^\s|\s$|\s{2,}/.test($("#releaseTitle").value),
    "Spacing",
    "No leading, trailing, or repeated spaces detected.",
    "Clean up extra spacing in the release title.",
    "error"
  ));

  checks.push(result(
    ["Single", "EP"].includes(data.type),
    "Release type",
    "This type is in MVP scope.",
    "Albums are Phase 2 and should stay disabled for MVP launch.",
    "error"
  ));

  checks.push(result(
    chosenDate && chosenDate >= minDate,
    "Release scheduling",
    "Release date is at least 7 days away.",
    "Choose a date at least 7 calendar days from today.",
    "error"
  ));

  checks.push(result(
    data.isrc === "" || isrcPattern.test(data.isrc),
    "ISRC",
    data.isrc ? "ISRC format is valid." : "No ISRC supplied; KROA can generate one later.",
    "Use an ISRC like USABC2600001 or leave it blank for generation.",
    data.isrc ? "error" : "warn"
  ));

  const audio = data.audioFile;
  const audioOk = audio && /\.(wav|flac|mp3)$/i.test(audio.name);
  checks.push(result(
    audioOk,
    "Audio format",
    audio ? "Audio extension is accepted for MVP intake." : "No audio uploaded yet.",
    "Upload WAV, FLAC, or 320kbps MP3.",
    "warn"
  ));

  const art = data.coverArt;
  const artOk = art && art.validType && art.width >= 3000 && art.height >= 3000;
  checks.push(result(
    artOk,
    "Cover art",
    art ? `${art.width} by ${art.height}px ${art.type} artwork inspected.` : "No artwork uploaded yet.",
    "Use JPG or PNG artwork at least 3000 by 3000 pixels.",
    "warn"
  ));

  checks.push(result(
    data.explicit !== "unknown",
    "Explicit flag",
    "Explicit status is confirmed.",
    "Confirm whether the track is clean or explicit.",
    "warn"
  ));

  checks.push(result(
    data.dsps.length > 0,
    "DSP selection",
    `${data.dsps.length} DSPs selected.`,
    "Select at least one distribution destination.",
    "error"
  ));

  const splitTotal = getSplitTotal();
  checks.push(result(
    splitTotal === 100,
    "Royalty splits",
    "Splits total exactly 100%.",
    `Splits currently total ${splitTotal}%. Adjust before enabling payouts.`,
    "warn"
  ));

  renderValidation(checks);
  renderPayload(data, checks);
  updateReadiness(checks);
  updateOverview(data);
  return checks;
}

function result(passed, title, passText, failText, failType) {
  return {
    title,
    message: passed ? passText : failText,
    level: passed ? "pass" : failType
  };
}

function renderValidation(checks) {
  $("#validationList").innerHTML = checks.map((check) => `
    <li class="${check.level}">
      <strong>${check.level.toUpperCase()} · ${check.title}</strong>
      <span>${check.message}</span>
    </li>
  `).join("");

  const hasErrors = checks.some((check) => check.level === "error");
  const hasWarnings = checks.some((check) => check.level === "warn");
  $("#submissionStatus").textContent = hasErrors ? "Blocked" : hasWarnings ? "Needs review" : "Ready";
}

function renderPayload(data, checks) {
  const payload = {
    artist: {
      name: data.artistName,
      genre: data.genre
    },
    release: {
      title: data.title,
      type: data.type,
      releaseDate: data.releaseDate,
      explicit: data.explicit,
      territory: data.territory,
      dsps: data.dsps
    },
    assets: {
      audioFileName: data.audioFile ? data.audioFile.name : null,
      coverArt: data.coverArt ? {
        width: data.coverArt.width,
        height: data.coverArt.height,
        type: data.coverArt.type
      } : null
    },
    splits: state.splits,
    validation: checks.map(({ title, level }) => ({ title, level }))
  };
  $("#payloadPreview").textContent = JSON.stringify(payload, null, 2);
}

function updateReadiness(checks) {
  const score = Math.round((checks.filter((check) => check.level === "pass").length / checks.length) * 100);
  $("#readinessScore").textContent = `${score}%`;
  $("#readinessMeter").style.width = `${score}%`;
}

function updateOverview(data) {
  $("#overviewTitle").textContent = `${data.title || "Untitled release"} is moving toward release readiness.`;
  $("#overviewText").textContent = `${data.artistName || "Your artist"} is targeting ${data.dsps.length} DSPs with a ${data.type.toLowerCase()} scheduled for ${data.releaseDate || "a future date"}.`;
  const initials = (data.artistName || "KROA Studio")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  $("#coverInitials").textContent = initials || "KS";
}

function getSplitTotal() {
  return state.splits.reduce((sum, split) => sum + Number(split.percentage || 0), 0);
}

function renderSplits() {
  $("#splitTable").innerHTML = state.splits.map((split, index) => `
    <div class="split-row">
      <input aria-label="Collaborator email" data-split-field="email" data-index="${index}" value="${split.email}" />
      <input aria-label="Royalty percentage" data-split-field="percentage" data-index="${index}" type="number" min="0" max="100" step="1" value="${split.percentage}" />
      <button class="icon-button" type="button" aria-label="Remove split" data-remove-split="${index}">×</button>
    </div>
  `).join("");

  const total = getSplitTotal();
  $("#splitTotal").textContent = total === 100
    ? "Splits total 100%. This is payout-ready."
    : `Splits total ${total}%. Production payouts should stay disabled until this equals 100%.`;
}

function generateDrafts() {
  const data = getReleaseData();
  const story = $("#releaseStory").value.trim();
  const title = data.title || "the release";
  const artist = data.artistName || "the artist";
  const genre = data.genre || "music";

  $("#pitchOutput").textContent = `${artist}'s "${title}" is a ${genre} release built around ${story.toLowerCase()} The track is positioned for listeners who respond to confident, story-led independent music with a polished global sound.`;
  $("#pressOutput").textContent = `${artist} announces "${title}", a new ${genre} release shaped by ${story.toLowerCase()} The single introduces a focused creative direction for the artist and is prepared for distribution across major streaming platforms through KROA Studio.`;
  $("#captionOutput").textContent = `Instagram: "${title}" is almost here. Pre-save soon. #${genre.replace(/[^a-z0-9]/gi, "")} #NewMusic\nTikTok: Built this one for the late-night reset.\nX: New release loading: ${title}.`;
}

$("#coverArt").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    state.coverArt = null;
    validateRelease();
    return;
  }

  const img = new Image();
  img.onload = () => {
    state.coverArt = {
      width: img.naturalWidth,
      height: img.naturalHeight,
      type: file.type || file.name.split(".").pop().toUpperCase(),
      validType: /image\/(png|jpeg)/.test(file.type) || /\.(png|jpe?g)$/i.test(file.name)
    };
    URL.revokeObjectURL(img.src);
    validateRelease();
  };
  img.src = URL.createObjectURL(file);
});

$("#releaseForm").addEventListener("input", validateRelease);
$("#releaseForm").addEventListener("change", validateRelease);
$("#validateRelease").addEventListener("click", validateRelease);
$("#generateDrafts").addEventListener("click", generateDrafts);
$("#jumpToRelease").addEventListener("click", () => $("#release").scrollIntoView({ behavior: "smooth" }));

$("#addSplit").addEventListener("click", () => {
  state.splits.push({ email: "", percentage: 0 });
  renderSplits();
  validateRelease();
});

$("#splitTable").addEventListener("input", (event) => {
  const index = Number(event.target.dataset.index);
  const field = event.target.dataset.splitField;
  if (field) {
    state.splits[index][field] = field === "percentage" ? Number(event.target.value) : event.target.value;
    renderSplits();
    validateRelease();
  }
});

$("#splitTable").addEventListener("click", (event) => {
  const index = event.target.dataset.removeSplit;
  if (index !== undefined) {
    state.splits.splice(Number(index), 1);
    renderSplits();
    validateRelease();
  }
});

$("#waitlistForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = $("#waitlistEmail").value.trim();
  const role = $("#waitlistRole").value;
  const signups = JSON.parse(localStorage.getItem("kroaWaitlist") || "[]");
  signups.push({ email, role, createdAt: new Date().toISOString() });
  localStorage.setItem("kroaWaitlist", JSON.stringify(signups));
  $("#waitlistMessage").textContent = `Added ${email} as ${role}. Local prototype count: ${signups.length}.`;
  event.target.reset();
});

$$(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    $$(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

renderSplits();
validateRelease();
generateDrafts();

