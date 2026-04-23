const platforms = ["Combined", "LinkedIn", "Instagram", "Facebook", "X", "YouTube", "Threads"];

const metrics = [
  { key: "followers", label: "Followers" },
  { key: "engagementRate", label: "Engagement Rate" },
  { key: "impressions", label: "Impressions" },
  { key: "clicks", label: "Link Clicks" },
  { key: "videoViews", label: "Video Views" },
];

const profileLinks = {
  LinkedIn: "https://www.linkedin.com/company/impact-networking",
  Instagram: "https://www.instagram.com/impactmybiz",
  Facebook: "https://www.facebook.com/impactmybiz",
  X: "https://x.com/ImpactMyBiz",
  YouTube: "https://www.youtube.com/@ImpactMyBiz",
  Threads: "https://www.threads.com/@impactmybiz",
};

/**
 * Populate these with real, verified values from your reporting exports.
 * Keep null when a metric is not available yet.
 */
const manualMetrics = {
  LinkedIn: {
    current: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
    previous: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
  },
  Instagram: {
    current: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
    previous: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
  },
  Facebook: {
    current: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
    previous: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
  },
  X: {
    current: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
    previous: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
  },
  YouTube: {
    current: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
    previous: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
  },
  Threads: {
    current: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
    previous: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
  },
};

const state = {
  selected: "Combined",
  data: {},
};

function setupWelcomeOverlay() {
  const overlay = document.getElementById("welcomeOverlay");
  const closeButton = document.getElementById("welcomeCloseBtn");
  const hideOverlay = () => overlay.classList.add("hidden");
  closeButton.addEventListener("click", hideOverlay);
  setTimeout(hideOverlay, 60000);
}

const platformInsights = {
  LinkedIn: {
    topPosts: ["Paste your top LinkedIn posts after each reporting cycle."],
    topicsToTry: ["Case studies", "Executive POV", "Business-risk explainers"],
    topicsToAvoid: ["Overly technical jargon", "Generic motivation", "Hard-sell copy only"],
  },
  Instagram: {
    topPosts: ["Paste your top Instagram posts after each reporting cycle."],
    topicsToTry: ["Short reels", "Visual checklists", "Behind-the-scenes operations"],
    topicsToAvoid: ["Text-heavy graphics", "No-hook captions", "Fear-only messaging"],
  },
  Facebook: {
    topPosts: ["Paste your top Facebook posts after each reporting cycle."],
    topicsToTry: ["How-to explainers", "Community wins", "Live Q&A"],
    topicsToAvoid: ["Link-only posts", "Repeated copy", "Controversial hot takes"],
  },
  X: {
    topPosts: ["Paste your top X posts after each reporting cycle."],
    topicsToTry: ["Real-time commentary", "Data snippets", "Short thread frameworks"],
    topicsToAvoid: ["Unverified news", "Over-promotion", "Broad irrelevant hashtags"],
  },
  YouTube: {
    topPosts: ["Paste your top YouTube videos after each reporting cycle."],
    topicsToTry: ["Tutorials", "Before/after stories", "Monthly trend breakdowns"],
    topicsToAvoid: ["Slow intros", "Clickbait", "Deep technicals with no business lens"],
  },
  Threads: {
    topPosts: ["Paste your top Threads posts after each reporting cycle."],
    topicsToTry: ["Conversation starters", "Founder POV", "Mini educational series"],
    topicsToAvoid: ["Corporate tone", "Aggressive CTAs", "Dense walls of text"],
  },
};

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function initializeData() {
  state.data = JSON.parse(JSON.stringify(manualMetrics));
  recomputeCombined();
}

function recomputeCombined() {
  const channels = Object.keys(state.data).filter((platform) => platform !== "Combined");
  const combined = {
    current: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
    previous: { followers: null, engagementRate: null, impressions: null, clicks: null, videoViews: null },
  };

  metrics.forEach((metric) => {
    const currentValues = channels.map((channel) => state.data[channel].current[metric.key]).filter(isNumber);
    const previousValues = channels.map((channel) => state.data[channel].previous[metric.key]).filter(isNumber);

    if (metric.key === "engagementRate") {
      combined.current[metric.key] = currentValues.length
        ? Number((currentValues.reduce((a, b) => a + b, 0) / currentValues.length).toFixed(2))
        : null;
      combined.previous[metric.key] = previousValues.length
        ? Number((previousValues.reduce((a, b) => a + b, 0) / previousValues.length).toFixed(2))
        : null;
    } else {
      combined.current[metric.key] = currentValues.length ? currentValues.reduce((a, b) => a + b, 0) : null;
      combined.previous[metric.key] = previousValues.length ? previousValues.reduce((a, b) => a + b, 0) : null;
    }
  });

  state.data.Combined = combined;
}

function formatValue(key, value) {
  if (!isNumber(value)) return "—";
  if (key === "engagementRate") return `${value}%`;
  return new Intl.NumberFormat("en-US").format(value);
}

function pctDelta(current, previous) {
  if (!isNumber(current) || !isNumber(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function renderTabs() {
  const wrapper = document.getElementById("platformTabs");
  const tpl = document.getElementById("tabTemplate");
  wrapper.innerHTML = "";

  platforms.forEach((platform) => {
    const button = tpl.content.firstElementChild.cloneNode(true);
    button.textContent = platform;
    if (platform === state.selected) button.classList.add("active");
    button.addEventListener("click", () => {
      state.selected = platform;
      render();
    });
    wrapper.appendChild(button);
  });
}

function renderCards() {
  const grid = document.getElementById("kpiGrid");
  const active = state.data[state.selected];
  grid.innerHTML = "";

  if (state.selected !== "Combined") {
    const profileCard = document.createElement("article");
    profileCard.className = "card";
    profileCard.innerHTML = `
      <h3>Profile</h3>
      <p class="value"><a href="${profileLinks[state.selected]}" target="_blank" rel="noreferrer">Open profile ↗</a></p>
      <p class="delta">${state.selected}</p>
    `;
    grid.appendChild(profileCard);
  }

  metrics.forEach((metric) => {
    const current = active.current[metric.key];
    const previous = active.previous[metric.key];
    const delta = pctDelta(current, previous);

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${metric.label}</h3>
      <p class="value">${formatValue(metric.key, current)}</p>
      <p class="delta ${delta === null ? "" : delta >= 0 ? "up" : "down"}">${
        delta === null ? "Add verified values in app.js" : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(2)}%`
      }</p>
    `;
    grid.appendChild(card);
  });
}

function renderTable() {
  const body = document.getElementById("metricRows");
  const active = state.data[state.selected];
  document.getElementById("panelTitle").textContent = `${state.selected} metric details`;
  body.innerHTML = "";

  metrics.forEach((metric) => {
    const current = active.current[metric.key];
    const previous = active.previous[metric.key];
    const delta = pctDelta(current, previous);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${metric.label}</td>
      <td>${formatValue(metric.key, current)}</td>
      <td>${formatValue(metric.key, previous)}</td>
      <td class="delta ${delta === null ? "" : delta >= 0 ? "up" : "down"}">${
        delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}%`
      }</td>
    `;
    body.appendChild(row);
  });
}

function buildBarRow({ label, valueText, percentage, alt = false }) {
  const row = document.createElement("div");
  row.className = "bar-row";
  row.innerHTML = `
    <span>${label}</span>
    <div class="bar-track">
      <div class="bar-fill ${alt ? "alt" : ""}" style="width:${percentage}%"></div>
    </div>
    <strong>${valueText}</strong>
  `;
  return row;
}

function renderBenchmarks() {
  const benchmarkPanel = document.querySelector(".benchmark-panel");
  const followersChart = document.getElementById("followersChart");
  const engagementChart = document.getElementById("engagementChart");
  const selectedIsCombined = state.selected === "Combined";

  benchmarkPanel.style.display = selectedIsCombined ? "block" : "none";
  if (!selectedIsCombined) return;

  followersChart.innerHTML = "";
  engagementChart.innerHTML = "";

  const channels = platforms.slice(1);
  const followerValues = channels
    .map((platform) => ({ platform, value: state.data[platform].current.followers }))
    .filter((item) => isNumber(item.value));
  const engagementValues = channels
    .map((platform) => ({ platform, value: state.data[platform].current.engagementRate }))
    .filter((item) => isNumber(item.value));

  if (!followerValues.length) {
    followersChart.innerHTML = "<p class='subtitle'>No follower data entered yet.</p>";
  } else {
    const maxFollowers = Math.max(...followerValues.map((item) => item.value));
    followerValues
      .sort((a, b) => b.value - a.value)
      .forEach((item) => {
        followersChart.appendChild(
          buildBarRow({
            label: item.platform,
            valueText: new Intl.NumberFormat("en-US").format(item.value),
            percentage: (item.value / maxFollowers) * 100,
          }),
        );
      });
  }

  if (!engagementValues.length) {
    engagementChart.innerHTML = "<p class='subtitle'>No engagement-rate data entered yet.</p>";
  } else {
    const maxEngagement = Math.max(...engagementValues.map((item) => item.value));
    engagementValues
      .sort((a, b) => b.value - a.value)
      .forEach((item) => {
        engagementChart.appendChild(
          buildBarRow({
            label: item.platform,
            valueText: `${item.value}%`,
            percentage: (item.value / maxEngagement) * 100,
            alt: true,
          }),
        );
      });
  }
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
  writeList("hashtagsList", ["Add trending hashtags manually after your reporting review."]);
  writeList("topicsToTryList", insights.topicsToTry);
  writeList("topicsToAvoidList", insights.topicsToAvoid);
}

function render() {
  recomputeCombined();
  renderTabs();
  renderCards();
  renderTable();
  renderBenchmarks();
  renderPlatformInsights();
}

setupWelcomeOverlay();
initializeData();
render();
