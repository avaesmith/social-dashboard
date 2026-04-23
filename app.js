const platforms = ["Combined", "LinkedIn", "Instagram", "Facebook", "X", "YouTube", "Threads"];

const profileLinks = {
  LinkedIn: "https://www.linkedin.com/company/impact-networking",
  Instagram: "https://www.instagram.com/impactmybiz",
  Facebook: "https://www.facebook.com/impactmybiz",
  X: "https://x.com/ImpactMyBiz",
  YouTube: "https://www.youtube.com/@ImpactMyBiz",
  Threads: "https://www.threads.com/@impactmybiz",
};

const state = {
  selected: "Combined",
};

function setupWelcomeOverlay() {
  const overlay = document.getElementById("welcomeOverlay");
  const closeButton = document.getElementById("welcomeCloseBtn");

  const hideOverlay = () => {
    overlay.classList.add("hidden");
  };

  closeButton.addEventListener("click", hideOverlay);
  setTimeout(hideOverlay, 60000);
}

const platformInsights = {
  LinkedIn: {
    topPosts: ["Unavailable until LinkedIn API is connected."],
    topicsToTry: [
      "Client case studies with measurable outcomes",
      "Business-risk posts translated from technical issues",
      "Leadership POV from your experts",
    ],
    topicsToAvoid: [
      "Generic motivational posts without business relevance",
      "Jargon-heavy copy with no practical takeaway",
      "Overly promotional messaging in every post",
    ],
  },
  Instagram: {
    topPosts: ["Unavailable until Instagram API is connected."],
    topicsToTry: [
      "Short educational reels with one practical tip",
      "Visual checklists for business cybersecurity",
      "Team culture and behind-the-scenes ops content",
    ],
    topicsToAvoid: [
      "Text-heavy designs with low readability",
      "Fear-only messaging without solutions",
      "Long captions with no opening hook",
    ],
  },
  Facebook: {
    topPosts: ["Unavailable until Facebook API is connected."],
    topicsToTry: [
      "Community-focused client stories",
      "Video explainers answering SMB IT questions",
      "How-to posts tied to daily business operations",
    ],
    topicsToAvoid: [
      "Link-only posts with no context",
      "Frequent reposting of near-identical copy",
      "Hot-take content that risks brand trust",
    ],
  },
  X: {
    topPosts: ["Unavailable until X API is connected."],
    topicsToTry: [
      "Fast commentary on relevant tech events",
      "Data snippets with one clear action",
      "Thought-leadership threads in simple language",
    ],
    topicsToAvoid: [
      "Unverified breaking-news commentary",
      "Long self-promotional threads",
      "Overly broad hashtags that reduce relevance",
    ],
  },
  YouTube: {
    topPosts: ["Unavailable until YouTube API is connected."],
    topicsToTry: [
      "Tutorials solving recurring SMB problems",
      "Before/after transformation stories",
      "Monthly trend explainers for non-technical leaders",
    ],
    topicsToAvoid: [
      "Long intros with no immediate value",
      "Clickbait titles that over-promise",
      "Technical deep-dives with no business framing",
    ],
  },
  Threads: {
    topPosts: ["Unavailable until Threads API is connected."],
    topicsToTry: [
      "Conversation starters around common pain points",
      "Founder POV posts based on real field learnings",
      "Short educational multi-part series",
    ],
    topicsToAvoid: [
      "Overly corporate tone",
      "Constant hard-sell calls-to-action",
      "Dense posts with no scannable structure",
    ],
  },
};

function renderTabs() {
  const wrapper = document.getElementById("platformTabs");
  const tpl = document.getElementById("tabTemplate");
  wrapper.innerHTML = "";

  platforms.forEach((platform) => {
    const button = tpl.content.firstElementChild.cloneNode(true);
    button.textContent = platform;
    if (platform === state.selected) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      state.selected = platform;
      render();
    });

    wrapper.appendChild(button);
  });
}

function makeInfoCard(title, value, subtitle = "") {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <h3>${title}</h3>
    <p class="value">${value}</p>
    <p class="delta">${subtitle}</p>
  `;
  return card;
}

function renderCards() {
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = "";

  if (state.selected === "Combined") {
    const connectedCount = 0;
    const total = platforms.length - 1;
    grid.appendChild(makeInfoCard("Connected Channels", `${connectedCount}/${total}`, "APIs not connected"));
    grid.appendChild(makeInfoCard("Public Profiles Added", `${total}/${total}`, "Links configured"));
    grid.appendChild(makeInfoCard("Benchmark Charts", "Hidden", "Requires authenticated metric access"));
    return;
  }

  const profileUrl = profileLinks[state.selected];
  const linkMarkup = `<a href="${profileUrl}" target="_blank" rel="noreferrer">Open profile ↗</a>`;
  grid.appendChild(makeInfoCard("Profile", linkMarkup, state.selected));
  grid.appendChild(makeInfoCard("Verified Metrics", "Not Available", "API connection required"));
  grid.appendChild(makeInfoCard("Connection Status", "Not Connected", "Read-only OAuth needed"));
}

function renderTable() {
  const body = document.getElementById("metricRows");
  body.innerHTML = "";
  document.getElementById("panelTitle").textContent = `${state.selected} data availability`;

  const rows = [
    ["Public profile URL", "Available", state.selected === "Combined" ? "Available for each channel" : "Configured"],
    ["Follower count", "Unavailable", "Requires authenticated API access"],
    ["Engagement metrics", "Unavailable", "Requires authenticated API access"],
    ["Top performing posts", "Unavailable", "Requires authenticated API access"],
  ];

  rows.forEach(([capability, status, detail]) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${capability}</td>
      <td>${status}</td>
      <td>${detail}</td>
    `;
    body.appendChild(row);
  });
}

function renderBenchmarks() {
  const benchmarkPanel = document.querySelector(".benchmark-panel");
  benchmarkPanel.style.display = state.selected === "Combined" ? "block" : "none";
}

function renderPlatformInsights() {
  const insightsPanel = document.getElementById("platformInsightsPanel");
  const selectedIsCombined = state.selected === "Combined";

  insightsPanel.style.display = selectedIsCombined ? "none" : "block";
  if (selectedIsCombined) return;

  const insights = platformInsights[state.selected];
  document.getElementById("insightsTitle").textContent = `${state.selected} planning guidance`;

  const writeList = (listId, values) => {
    const list = document.getElementById(listId);
    list.innerHTML = "";
    values.forEach((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      list.appendChild(item);
    });
  };

  writeList("topPostsList", insights.topPosts);
  writeList("hashtagsList", ["Unavailable until API data is connected."]);
  writeList("topicsToTryList", insights.topicsToTry);
  writeList("topicsToAvoidList", insights.topicsToAvoid);
}

function render() {
  renderTabs();
  renderCards();
  renderTable();
  renderBenchmarks();
  renderPlatformInsights();
}

setupWelcomeOverlay();
render();
