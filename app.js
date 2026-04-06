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
  const followersChart = document.getElementById("followersChart");
  const engagementChart = document.getElementById("engagementChart");
  const benchmarkTitle = document.getElementById("benchmarkTitle");
  const channels = Object.keys(state.data).filter((platform) => platform !== "Combined");
  const selectedIsCombined = state.selected === "Combined";

  benchmarkTitle.textContent = selectedIsCombined
    ? "Platform benchmarks (all channels)"
    : `Platform benchmarks (including ${state.selected})`;

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

function render() {
  renderTabs();
  renderCards();
  renderTable();
  renderBenchmarks();
}

initializeData();
render();
setInterval(refreshLiveData, 15000);
