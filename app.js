const platforms = [
  "Combined",
  "LinkedIn",
  "Instagram",
  "Facebook",
  "X",
  "YouTube",
  "Threads",
  "Pinterest",
];

const metrics = [
  { key: "followers", label: "Followers" },
  { key: "engagementRate", label: "Engagement Rate" },
  { key: "impressions", label: "Impressions" },
  { key: "clicks", label: "Link Clicks" },
  { key: "videoViews", label: "Video Views" },
];

const state = {
  selected: "Combined",
  data: {},
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
    topPosts: [
      "Client success case study carousel (CIO quote + measurable outcome)",
      "Cybersecurity checklist post with downloadable PDF",
      "Short founder POV post on reducing IT downtime costs",
    ],
    hashtags: ["#ManagedServices", "#B2BTechnology", "#BusinessContinuity", "#CyberResilience"],
    topicsToTry: [
      "Before/after stories showing business impact from your services",
      "Myth-busting posts about MSP pricing and ROI",
      "Employee spotlight on technical experts and certifications",
    ],
    topicsToAvoid: [
      "Highly technical jargon without business context",
      "Generic motivational content with no practical takeaway",
      "Overly promotional posts without proof or numbers",
    ],
  },
  Instagram: {
    topPosts: [
      "Quick-reel: 3 signs your IT setup needs an upgrade",
      "Behind-the-scenes setup day at a client office",
      "Infographic carousel on phishing red flags",
    ],
    hashtags: ["#MSPLife", "#BusinessIT", "#CyberTips", "#SmallBusinessSupport"],
    topicsToTry: [
      "Short educational reels with actionable tips",
      "Visual security checklists and office-tech transformations",
      "Team culture and human side of IT support",
    ],
    topicsToAvoid: [
      "Text-heavy graphics with small unreadable copy",
      "Long captions without a clear hook",
      "Negative fear-based messaging without solutions",
    ],
  },
  Facebook: {
    topPosts: [
      "Live Q&A: common cybersecurity questions from SMB owners",
      "Community-oriented client shoutout and milestone post",
      "Step-by-step guide to choosing a managed IT plan",
    ],
    hashtags: ["#ManagedIT", "#SMBSupport", "#BusinessSecurity", "#DigitalOperations"],
    topicsToTry: [
      "Educational posts tied to local business challenges",
      "Video explainers and repurposed webinar clips",
      "Client wins and testimonials with concrete outcomes",
    ],
    topicsToAvoid: [
      "Link-only posts with no context",
      "Very frequent posting of near-identical messages",
      "Overly controversial industry hot takes",
    ],
  },
  X: {
    topPosts: [
      "Thread: weekly cybersecurity incidents and what SMBs can learn",
      "Real-time commentary on major outage news with takeaways",
      "Polling post on top business IT pain points",
    ],
    hashtags: ["#MSP", "#InfoSec", "#SMBTech", "#BusinessIT"],
    topicsToTry: [
      "Fast insights tied to timely tech/business events",
      "Data-backed micro tips with one clear action",
      "Thought-leadership threads with simple frameworks",
    ],
    topicsToAvoid: [
      "Long promotional chains with no value-first content",
      "Unverified breaking news claims",
      "Overly broad hashtags that dilute relevance",
    ],
  },
  YouTube: {
    topPosts: [
      "5-minute explainer: MSP vs in-house IT cost comparison",
      "Client transformation story mini-documentary",
      "Security audit walk-through for business leaders",
    ],
    hashtags: ["#ManagedServiceProvider", "#BusinessTechnology", "#CyberSecurityAwareness", "#ITStrategy"],
    topicsToTry: [
      "Evergreen educational tutorials with chapter timestamps",
      "Comparison videos (tool/process A vs B)",
      "Monthly trend roundups for business owners",
    ],
    topicsToAvoid: [
      "Very long videos with weak first 30 seconds",
      "Clickbait titles that do not match content",
      "Overly complex demos without business framing",
    ],
  },
  Threads: {
    topPosts: [
      "Founder perspective posts on practical IT leadership",
      "Short story posts about solving client challenges",
      "Weekly prompt asking operators for their biggest tech blocker",
    ],
    hashtags: ["#ManagedServices", "#BusinessOps", "#SMBLeadership", "#CyberHygiene"],
    topicsToTry: [
      "Conversational posts that invite peer discussion",
      "Simple opinion-led takes from recent client learnings",
      "Series posts (3-part) around one recurring pain point",
    ],
    topicsToAvoid: [
      "Corporate-sounding copy with no personality",
      "Hard-sell CTA in every post",
      "Overly dense bullet dumps",
    ],
  },
  Pinterest: {
    topPosts: [
      "Infographic pin: 2026 business cybersecurity checklist",
      "Template pin: IT onboarding process for new employees",
      "Visual guide: disaster recovery planning basics",
    ],
    hashtags: ["#BusinessChecklist", "#MSPResources", "#ITBestPractices", "#CyberAwareness"],
    topicsToTry: [
      "Template-based visuals businesses can save and reuse",
      "Seasonal business tech planning boards",
      "Step-by-step decision trees in infographic format",
    ],
    topicsToAvoid: [
      "Low-resolution visuals",
      "Pins without clear text overlays and topic labels",
      "Narrowly technical architecture diagrams",
    ],
  },
};

function makeStartingMetrics(seed = 1) {
  return {
    followers: Math.floor(5000 + seed * 1300 + Math.random() * 1500),
    engagementRate: Number((1.8 + seed * 0.35 + Math.random() * 1.3).toFixed(2)),
    impressions: Math.floor(20000 + seed * 5000 + Math.random() * 8000),
    clicks: Math.floor(900 + seed * 220 + Math.random() * 450),
    videoViews: Math.floor(1200 + seed * 440 + Math.random() * 3000),
  };
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function initializeData() {
  const channelData = {};

  platforms.slice(1).forEach((platform, idx) => {
    channelData[platform] = {
      current: makeStartingMetrics(idx + 1),
      previous: makeStartingMetrics(idx + 1),
    };
  });

  state.data = channelData;
  recomputeCombined();
}

function recomputeCombined() {
  const combinedCurrent = { followers: 0, engagementRate: 0, impressions: 0, clicks: 0, videoViews: 0 };
  const combinedPrevious = { followers: 0, engagementRate: 0, impressions: 0, clicks: 0, videoViews: 0 };

  const channels = Object.keys(state.data).filter((k) => k !== "Combined");

  channels.forEach((platform) => {
    metrics.forEach((metric) => {
      combinedCurrent[metric.key] += state.data[platform].current[metric.key];
      combinedPrevious[metric.key] += state.data[platform].previous[metric.key];
    });
  });

  combinedCurrent.engagementRate = Number((combinedCurrent.engagementRate / channels.length).toFixed(2));
  combinedPrevious.engagementRate = Number((combinedPrevious.engagementRate / channels.length).toFixed(2));

  state.data.Combined = {
    current: combinedCurrent,
    previous: combinedPrevious,
  };
}

function driftMetric(value, key) {
  const ranges = {
    followers: 0.02,
    engagementRate: 0.08,
    impressions: 0.1,
    clicks: 0.15,
    videoViews: 0.12,
  };

  const delta = (Math.random() * 2 - 1) * ranges[key];
  const next = value * (1 + delta);

  if (key === "engagementRate") {
    return Number(Math.max(0.2, next).toFixed(2));
  }

  return Math.max(0, Math.round(next));
}

function refreshLiveData() {
  Object.keys(state.data)
    .filter((platform) => platform !== "Combined")
    .forEach((platform) => {
      const snapshot = clone(state.data[platform].current);
      state.data[platform].previous = snapshot;

      metrics.forEach((metric) => {
        state.data[platform].current[metric.key] = driftMetric(snapshot[metric.key], metric.key);
      });
    });

  recomputeCombined();
  render();
}

function formatValue(key, value) {
  if (key === "engagementRate") {
    return `${value}%`;
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function pctDelta(current, previous) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

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

function renderCards() {
  const grid = document.getElementById("kpiGrid");
  const active = state.data[state.selected];
  grid.innerHTML = "";

  metrics.forEach((metric) => {
    const current = active.current[metric.key];
    const previous = active.previous[metric.key];
    const delta = pctDelta(current, previous);

    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${metric.label}</h3>
      <p class="value">${formatValue(metric.key, current)}</p>
      <p class="delta ${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(2)}%</p>
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
      <td class="delta ${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "+" : ""}${delta.toFixed(2)}%</td>
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
  const benchmarkTitle = document.getElementById("benchmarkTitle");
  const channels = Object.keys(state.data).filter((platform) => platform !== "Combined");
  const selectedIsCombined = state.selected === "Combined";

  benchmarkPanel.style.display = selectedIsCombined ? "block" : "none";
  if (!selectedIsCombined) {
    followersChart.innerHTML = "";
    engagementChart.innerHTML = "";
    return;
  }

  benchmarkTitle.textContent = "Platform benchmarks (all channels)";

  followersChart.innerHTML = "";
  engagementChart.innerHTML = "";

  const followerValues = channels.map((platform) => ({
    platform,
    value: state.data[platform].current.followers,
  }));
  const engagementValues = channels.map((platform) => ({
    platform,
    value: state.data[platform].current.engagementRate,
  }));

  const maxFollowers = Math.max(...followerValues.map((item) => item.value));
  const maxEngagement = Math.max(...engagementValues.map((item) => item.value));

  followerValues
    .sort((a, b) => b.value - a.value)
    .forEach((item) => {
      const row = buildBarRow({
        label: item.platform,
        valueText: new Intl.NumberFormat("en-US").format(item.value),
        percentage: (item.value / maxFollowers) * 100,
      });
      followersChart.appendChild(row);
    });

  engagementValues
    .sort((a, b) => b.value - a.value)
    .forEach((item) => {
      const row = buildBarRow({
        label: item.platform,
        valueText: `${item.value}%`,
        percentage: (item.value / maxEngagement) * 100,
        alt: true,
      });
      engagementChart.appendChild(row);
    });
}

function renderPlatformInsights() {
  const insightsPanel = document.getElementById("platformInsightsPanel");
  const selectedIsCombined = state.selected === "Combined";

  insightsPanel.style.display = selectedIsCombined ? "none" : "block";
  if (selectedIsCombined) {
    return;
  }

  const insights = platformInsights[state.selected];
  document.getElementById("insightsTitle").textContent = `${state.selected} content intelligence`;

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
  writeList("hashtagsList", insights.hashtags);
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

initializeData();
setupWelcomeOverlay();
render();
setInterval(refreshLiveData, 15000);
