const platforms = ["Combined", "LinkedIn", "Instagram", "Facebook", "X", "YouTube", "Threads"];

const metrics = [
  { key: "impressions", label: "Impressions" },
  { key: "engagement", label: "Engagement" },
  { key: "reach", label: "Reach" },
  { key: "videoViews", label: "Video Views" },
  { key: "engagementRate", label: "Engagement Rate" },
  { key: "shares", label: "Shares" },
];

const state = {
  selected: "Combined",
  data: {},
  posts: [],
};

function setupWelcomeOverlay() {
  const overlay = document.getElementById("welcomeOverlay");
  const closeButton = document.getElementById("welcomeCloseBtn");
  const hideOverlay = () => overlay.classList.add("hidden");
  closeButton.addEventListener("click", hideOverlay);
  setTimeout(hideOverlay, 60000);
}

function normalizeKey(key) {
  return String(key || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).replace(/[%,$\s]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function metricFromRow(row, aliases) {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && row[alias] !== "") {
      return row[alias];
    }
  }
  return null;
}

function detectPlatform(rawPlatform) {
  const value = String(rawPlatform || "").toLowerCase();
  if (value.includes("linkedin")) return "LinkedIn";
  if (value.includes("instagram")) return "Instagram";
  if (value.includes("facebook")) return "Facebook";
  if (value === "x" || value.includes("twitter")) return "X";
  if (value.includes("youtube")) return "YouTube";
  if (value.includes("threads")) return "Threads";
  return null;
}

function parseWorkbookRows(rows) {
  return rows
    .map((raw) => {
      const row = {};
      Object.keys(raw).forEach((key) => {
        row[normalizeKey(key)] = raw[key];
      });

      const platform = detectPlatform(metricFromRow(row, ["platform", "profile", "channel", "network"]));
      if (!platform) return null;

      const title = metricFromRow(row, ["posttitle", "title", "post", "postname", "contenttitle"]) || "Untitled post";
      const url = metricFromRow(row, ["url", "posturl", "link"]);
      const impressions = toNumber(metricFromRow(row, ["impressions"]));
      const engagement = toNumber(metricFromRow(row, ["engagement", "engagements"]));
      const reach = toNumber(metricFromRow(row, ["reach"]));
      const videoViews = toNumber(metricFromRow(row, ["videoviews", "views", "videoplays"]));
      const shares = toNumber(metricFromRow(row, ["shares"]));
      let engagementRate = toNumber(metricFromRow(row, ["engagementrate", "er", "engrate"]));

      if (engagementRate === null && impressions && engagement !== null) {
        engagementRate = Number(((engagement / impressions) * 100).toFixed(2));
      }

      return {
        platform,
        title,
        url,
        metrics: { impressions, engagement, reach, videoViews, engagementRate, shares },
      };
    })
    .filter(Boolean);
}

function initializeAggregates() {
  const template = { impressions: 0, engagement: 0, reach: 0, videoViews: 0, shares: 0, engagementRate: null, _postCount: 0 };
  const aggregates = {};
  platforms.slice(1).forEach((platform) => {
    aggregates[platform] = { ...template };
  });
  return aggregates;
}

function computeDataFromPosts(posts) {
  const aggregates = initializeAggregates();

  posts.forEach((post) => {
    const agg = aggregates[post.platform];
    agg._postCount += 1;

    ["impressions", "engagement", "reach", "videoViews", "shares"].forEach((metric) => {
      if (post.metrics[metric] !== null) agg[metric] += post.metrics[metric];
    });

    if (post.metrics.engagementRate !== null) {
      if (agg.engagementRate === null) agg.engagementRate = 0;
      agg.engagementRate += post.metrics.engagementRate;
    }
  });

  Object.values(aggregates).forEach((agg) => {
    if (agg.engagementRate !== null) {
      agg.engagementRate = Number((agg.engagementRate / agg._postCount).toFixed(2));
    }
  });

  const combined = { impressions: 0, engagement: 0, reach: 0, videoViews: 0, shares: 0, engagementRate: null, _postCount: 0 };
  Object.values(aggregates).forEach((agg) => {
    combined.impressions += agg.impressions;
    combined.engagement += agg.engagement;
    combined.reach += agg.reach;
    combined.videoViews += agg.videoViews;
    combined.shares += agg.shares;
    if (agg.engagementRate !== null) {
      if (combined.engagementRate === null) combined.engagementRate = 0;
      combined.engagementRate += agg.engagementRate;
      combined._postCount += 1;
    }
  });

  if (combined.engagementRate !== null && combined._postCount > 0) {
    combined.engagementRate = Number((combined.engagementRate / combined._postCount).toFixed(2));
  }

  const wrapped = {};
  Object.entries(aggregates).forEach(([platform, agg]) => {
    wrapped[platform] = { current: agg };
  });
  wrapped.Combined = { current: combined };
  return wrapped;
}

function formatValue(key, value) {
  if (value === null || value === undefined) return "—";
  if (key === "engagementRate") return `${value}%`;
  return new Intl.NumberFormat("en-US").format(value);
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
  const active = state.data[state.selected]?.current;
  grid.innerHTML = "";

  metrics.forEach((metric) => {
    const value = active ? active[metric.key] : null;
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${metric.label}</h3>
      <p class="value">${formatValue(metric.key, value)}</p>
      <p class="delta">Source: perform.xlsx</p>
    `;
    grid.appendChild(card);
  });
}

function renderTable() {
  const body = document.getElementById("metricRows");
  const active = state.data[state.selected]?.current;
  document.getElementById("panelTitle").textContent = `${state.selected} metric details`;
  body.innerHTML = "";

  metrics.forEach((metric) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${metric.label}</td>
      <td>${formatValue(metric.key, active?.[metric.key])}</td>
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
  const impressionsChart = document.getElementById("impressionsChart");
  const engagementChart = document.getElementById("engagementChart");
  const selectedIsCombined = state.selected === "Combined";

  benchmarkPanel.style.display = selectedIsCombined ? "block" : "none";
  if (!selectedIsCombined) return;

  impressionsChart.innerHTML = "";
  engagementChart.innerHTML = "";

  const channels = platforms.slice(1);
  const impressionValues = channels.map((p) => ({ platform: p, value: state.data[p]?.current?.impressions || 0 }));
  const engagementValues = channels.map((p) => ({ platform: p, value: state.data[p]?.current?.engagementRate || 0 }));

  const maxImpressions = Math.max(...impressionValues.map((i) => i.value), 0);
  const maxEngagement = Math.max(...engagementValues.map((i) => i.value), 0);

  if (maxImpressions === 0) {
    impressionsChart.innerHTML = "<p class='subtitle'>No impression data found in perform.xlsx.</p>";
  } else {
    impressionValues
      .sort((a, b) => b.value - a.value)
      .forEach((item) => {
        impressionsChart.appendChild(
          buildBarRow({
            label: item.platform,
            valueText: new Intl.NumberFormat("en-US").format(item.value),
            percentage: (item.value / maxImpressions) * 100,
          }),
        );
      });
  }

  if (maxEngagement === 0) {
    engagementChart.innerHTML = "<p class='subtitle'>No engagement-rate data found in perform.xlsx.</p>";
  } else {
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

function renderTopPosts() {
  const list = document.getElementById("topPostsList");
  const selectedIsCombined = state.selected === "Combined";
  document.getElementById("insightsTitle").textContent = selectedIsCombined
    ? "Top posts overall by engagement rate"
    : `${state.selected} top posts by engagement rate`;

  const filtered = state.posts
    .filter((post) => (selectedIsCombined ? true : post.platform === state.selected))
    .filter((post) => post.metrics.engagementRate !== null)
    .sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate)
    .slice(0, 5);

  list.innerHTML = "";

  if (!filtered.length) {
    list.innerHTML = "<li>No top-post engagement-rate data found in perform.xlsx.</li>";
    return;
  }

  filtered.forEach((post) => {
    const item = document.createElement("li");
    const title = post.url
      ? `<a href="${post.url}" target="_blank" rel="noreferrer">${post.title}</a>`
      : post.title;
    item.innerHTML = `${post.platform}: ${title} — <strong>${post.metrics.engagementRate}% ER</strong>`;
    list.appendChild(item);
  });
}

function render() {
  renderTabs();
  renderCards();
  renderTable();
  renderBenchmarks();
  renderTopPosts();
}

async function loadWorkbook() {
  try {
    const response = await fetch("data/perform.xlsx");
    if (!response.ok) throw new Error("Could not load data/perform.xlsx");

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    state.posts = parseWorkbookRows(rows);
    state.data = computeDataFromPosts(state.posts);
    document.getElementById("liveStatus").textContent = `● Loaded ${state.posts.length} rows from data/perform.xlsx`;
  } catch (error) {
    document.getElementById("liveStatus").textContent = `● Data load issue: ${error.message}`;
    state.posts = [];
    state.data = computeDataFromPosts([]);
  }

  render();
}

setupWelcomeOverlay();
loadWorkbook();
