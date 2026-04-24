const platforms = ["Combined", "LinkedIn", "Instagram", "Facebook", "YouTube"];
const combinedPlatforms = ["LinkedIn", "Instagram", "Facebook", "YouTube"];

const metrics = [
  { key: "impressions", label: "Impressions" },
  { key: "engagement", label: "Engagement" },
  { key: "reach", label: "Reach" },
  { key: "videoViews", label: "Video Views" },
  { key: "engagementRate", label: "Engagement Rate" },
  { key: "shares", label: "Shares" },
];

const defaultCardMetrics = metrics;
const instagramCardMetrics = metrics.filter((metric) => metric.key !== "videoViews");
const facebookCardMetrics = metrics
  .filter((metric) => !["impressions", "engagementRate"].includes(metric.key))
  .concat({ key: "clicks", label: "Total Clicks" });

const state = {
  selected: "Combined",
  data: {},
  previousData: {},
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

function titleFromUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const slug = parsed.pathname.split("/").filter(Boolean).pop();
    if (!slug) return null;
    return slug.replace(/[-_]/g, " ").slice(0, 80);
  } catch {
    return null;
  }
}

function hasNavigableUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(String(url).trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function parseWorkbookRows(rows, forcedPlatform = null) {
  return rows
    .map((raw) => {
      const row = {};
      Object.keys(raw).forEach((key) => {
        row[normalizeKey(key)] = raw[key];
      });

      const platform =
        forcedPlatform || detectPlatform(metricFromRow(row, ["platform", "profile", "channel", "network"]));
      if (!platform) return null;
      if (!platforms.includes(platform)) return null;

      const rawUrl = metricFromRow(row, ["url", "posturl", "link"]);
      const url = hasNavigableUrl(rawUrl) ? String(rawUrl).trim() : null;
      const title =
        metricFromRow(row, ["posttitle", "title", "post", "postname", "contenttitle", "headline", "name"]) ||
        titleFromUrl(url) ||
        "Post";
      const previewText =
        metricFromRow(row, ["caption", "description", "text", "content", "postcopy", "summary", "message"]) || title;
      const media = metricFromRow(row, ["image", "thumbnail", "previewimage", "mediaurl"]);
      const impressions = toNumber(metricFromRow(row, ["impressions"]));
      const reach = toNumber(metricFromRow(row, ["reach"]));
      const videoViews = toNumber(metricFromRow(row, ["videoviews", "views", "videoplays"]));
      const shares = toNumber(metricFromRow(row, ["shares"]));
      const reactions = toNumber(metricFromRow(row, ["reactions", "likes"]));
      const comments = toNumber(metricFromRow(row, ["comments"]));
      const clicks = toNumber(metricFromRow(row, ["clicks", "totalclicks", "linkclicks"]));
      let engagementRate = toNumber(metricFromRow(row, ["engagementrate", "er", "engrate"]));
      let engagement = toNumber(metricFromRow(row, ["engagement", "engagements"]));

      if (platform === "Facebook") {
        const calculatedFbEngagement =
          (reactions ?? 0) + (comments ?? 0) + (shares ?? 0);
        const hasFbEngagementParts = reactions !== null || comments !== null || shares !== null;
        if (hasFbEngagementParts) engagement = calculatedFbEngagement;
      }

      if (engagementRate === null && impressions && engagement !== null) {
        engagementRate = Number(((engagement / impressions) * 100).toFixed(2));
      }

      return {
        platform,
        title,
        previewText,
        media,
        url,
        metrics: { impressions, engagement, reach, videoViews, engagementRate, shares, clicks },
      };
    })
    .filter(Boolean);
}

function parseCsvText(csvText, forcedPlatform = null) {
  const [headerLine, ...lines] = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!headerLine) return [];

  const headers = headerLine.split(",").map((h) => h.trim());
  const rows = lines.map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? null;
    });
    return row;
  });

  return parseWorkbookRows(rows, forcedPlatform);
}

function initializeAggregates() {
  const template = {
    impressions: 0,
    engagement: 0,
    reach: 0,
    videoViews: 0,
    shares: 0,
    clicks: 0,
    engagementRate: null,
    _postCount: 0,
    _metricCounts: { impressions: 0, engagement: 0, reach: 0, videoViews: 0, shares: 0, clicks: 0 },
  };
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

    ["impressions", "engagement", "reach", "videoViews", "shares", "clicks"].forEach((metric) => {
      if (post.metrics[metric] !== null) {
        agg[metric] += post.metrics[metric];
        agg._metricCounts[metric] += 1;
      }
    });

    if (post.metrics.engagementRate !== null) {
      if (agg.engagementRate === null) agg.engagementRate = 0;
      agg.engagementRate += post.metrics.engagementRate;
    }
  });

  Object.values(aggregates).forEach((agg) => {
    ["impressions", "engagement", "reach", "videoViews", "shares", "clicks"].forEach((metric) => {
      if (agg._metricCounts[metric] === 0) agg[metric] = null;
    });
    if (agg.engagementRate !== null) {
      agg.engagementRate = Number((agg.engagementRate / agg._postCount).toFixed(2));
    }
  });

  const combined = {
    impressions: 0,
    engagement: 0,
    reach: 0,
    videoViews: 0,
    shares: 0,
    clicks: 0,
    engagementRate: null,
    _postCount: 0,
    _metricCounts: { impressions: 0, engagement: 0, reach: 0, videoViews: 0, shares: 0, clicks: 0 },
  };
  Object.values(aggregates).forEach((agg) => {
    ["impressions", "engagement", "reach", "videoViews", "shares", "clicks"].forEach((metric) => {
      if (agg[metric] !== null) {
        combined[metric] += agg[metric];
        combined._metricCounts[metric] += 1;
      }
    });
    if (agg.engagementRate !== null) {
      if (combined.engagementRate === null) combined.engagementRate = 0;
      combined.engagementRate += agg.engagementRate;
      combined._postCount += 1;
    }
  });

  if (combined.engagementRate !== null && combined._postCount > 0) {
    combined.engagementRate = Number((combined.engagementRate / combined._postCount).toFixed(2));
  }
  ["impressions", "engagement", "reach", "videoViews", "shares", "clicks"].forEach((metric) => {
    if (combined._metricCounts[metric] === 0) combined[metric] = null;
  });

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

function pctDelta(current, previous) {
  if (current === null || previous === null || previous === 0) return null;
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
  const active = state.data[state.selected]?.current;
  const previous = state.previousData[state.selected]?.current;
  const selectedMetrics =
    state.selected === "Instagram"
      ? instagramCardMetrics
      : state.selected === "Facebook"
        ? facebookCardMetrics
        : defaultCardMetrics;
  grid.innerHTML = "";

  if (state.selected === "Combined") {
    metrics.forEach((metric) => {
      const candidates = platforms
        .filter((platform) => combinedPlatforms.includes(platform))
        .map((platform) => ({ platform, value: state.data[platform]?.current?.[metric.key] ?? null }))
        .filter((item) => item.value !== null);
      const winner = candidates.sort((a, b) => b.value - a.value)[0];
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <h3>${metric.label} Leader</h3>
        <p class="value">${winner ? winner.platform : "—"}</p>
        <p class="delta">${winner ? formatValue(metric.key, winner.value) : "No data available"}</p>
      `;
      grid.appendChild(card);
    });
    return;
  }

  selectedMetrics.forEach((metric) => {
    const value = active ? active[metric.key] : null;
    const prevValue = previous ? previous[metric.key] : null;
    const delta = pctDelta(value, prevValue);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${metric.label}</h3>
      <p class="value">${formatValue(metric.key, value)}</p>
      <p class="delta ${delta === null ? "" : delta >= 0 ? "up" : "down"}">${
        delta === null ? "No previous timeframe value" : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(2)}% YoY`
      }</p>
    `;
    grid.appendChild(card);
  });
}

function renderTable() {
  const body = document.getElementById("metricRows");
  const head = document.getElementById("tableHead");
  const active = state.data[state.selected]?.current;
  const previous = state.previousData[state.selected]?.current;
  document.getElementById("panelTitle").textContent =
    state.selected === "Combined" ? "Channel comparison snapshot" : `${state.selected} metric details`;
  body.innerHTML = "";

  if (state.selected === "Combined") {
    head.innerHTML = `
      <tr>
        <th>Channel</th>
        <th>Engagements</th>
        <th>Reach</th>
        <th>Shares</th>
      </tr>
    `;
    combinedPlatforms.forEach((platform) => {
      const row = document.createElement("tr");
      const current = state.data[platform]?.current || {};
      row.innerHTML = `
        <td>${platform}</td>
        <td>${formatValue("engagement", current.engagement ?? null)}</td>
        <td>${formatValue("reach", current.reach ?? null)}</td>
        <td>${formatValue("shares", current.shares ?? null)}</td>
      `;
      body.appendChild(row);
    });
    return;
  }

  head.innerHTML = `
    <tr>
      <th>Metric</th>
      <th>Current</th>
      <th>Previous</th>
      <th>YoY Change</th>
    </tr>
  `;

  const tableMetrics =
    state.selected === "Facebook"
      ? metrics.filter((metric) => !["impressions", "engagementRate"].includes(metric.key))
      : metrics;

  tableMetrics.forEach((metric) => {
    const currentValue = active?.[metric.key] ?? null;
    const previousValue = previous?.[metric.key] ?? null;
    const delta = pctDelta(currentValue, previousValue);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${metric.label}</td>
      <td>${formatValue(metric.key, currentValue)}</td>
      <td>${formatValue(metric.key, previousValue)}</td>
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
  const impressionsChart = document.getElementById("impressionsChart");
  const engagementChart = document.getElementById("engagementChart");
  const selectedIsCombined = state.selected === "Combined";

  benchmarkPanel.style.display = selectedIsCombined ? "block" : "none";
  if (!selectedIsCombined) return;

  impressionsChart.innerHTML = "";
  engagementChart.innerHTML = "";

  const channels = combinedPlatforms;
  const engagementValues = channels.map((p) => ({ platform: p, value: state.data[p]?.current?.engagement || 0 }));
  const reachValues = channels.map((p) => ({ platform: p, value: state.data[p]?.current?.reach || 0 }));

  const maxEngagement = Math.max(...engagementValues.map((i) => i.value), 0);
  const maxReach = Math.max(...reachValues.map((i) => i.value), 0);

  if (maxEngagement === 0) {
    impressionsChart.innerHTML = "<p class='subtitle'>No engagement data found in source files.</p>";
  } else {
    engagementValues
      .sort((a, b) => b.value - a.value)
      .forEach((item) => {
        impressionsChart.appendChild(
          buildBarRow({
            label: item.platform,
            valueText: new Intl.NumberFormat("en-US").format(item.value),
            percentage: (item.value / maxEngagement) * 100,
          }),
        );
      });
  }

  if (maxReach === 0) {
    engagementChart.innerHTML = "<p class='subtitle'>No reach data found in source files.</p>";
  } else {
    reachValues
      .sort((a, b) => b.value - a.value)
      .forEach((item) => {
        engagementChart.appendChild(
          buildBarRow({
            label: item.platform,
            valueText: new Intl.NumberFormat("en-US").format(item.value),
            percentage: (item.value / maxReach) * 100,
            alt: true,
          }),
        );
      });
  }
}

function renderTopPosts() {
  const list = document.getElementById("topPostsList");
  const comparison = document.getElementById("topPostsComparison");
  const selectedIsCombined = state.selected === "Combined";
  const primaryMetric = state.selected === "Facebook" ? "engagement" : "engagementRate";
  const primaryLabel = state.selected === "Facebook" ? "engagement" : "engagement rate";

  document.getElementById("insightsTitle").textContent = selectedIsCombined
    ? "Top posts overall by engagement rate"
    : `${state.selected} top posts by ${primaryLabel}`;

  const scopedPosts = state.posts.filter((post) => (selectedIsCombined ? true : post.platform === state.selected));
  const filtered = [...scopedPosts]
    .filter((post) => hasNavigableUrl(post.url))
    .filter((post) => post.metrics[primaryMetric] !== null)
    .sort((a, b) => b.metrics[primaryMetric] - a.metrics[primaryMetric])
    .slice(0, 5);

  list.innerHTML = "";
  comparison.innerHTML = "";

  if (!filtered.length) {
    list.innerHTML = `<li>No top-post ${primaryLabel} data found in source files.</li>`;
  } else {
    filtered.forEach((post) => {
      const item = document.createElement("li");
      const postLabel = `Post ${list.children.length + 1}`;
      const valueSuffix =
        primaryMetric === "engagementRate" ? `${post.metrics[primaryMetric]}% ER` : `${post.metrics[primaryMetric]} engagements`;
      item.innerHTML = `<a href="${post.url}" target="_blank" rel="noreferrer">${postLabel}</a> <span>— ${valueSuffix}</span>`;
      list.appendChild(item);
    });
  }

  const createMetricColumn = (title, metricKey, formatter) => {
    const col = document.createElement("section");
    col.className = "comparison-col";
    const topByMetric = [...scopedPosts]
      .filter((post) => hasNavigableUrl(post.url))
      .filter((post) => post.metrics[metricKey] !== null)
      .sort((a, b) => b.metrics[metricKey] - a.metrics[metricKey])
      .slice(0, 5);
    const items = topByMetric.length
      ? topByMetric
          .map((post, idx) => {
            const label = `Post ${idx + 1}`;
            const value = formatter(post.metrics[metricKey]);
            return `<li><a href="${post.url}" target="_blank" rel="noreferrer">${label}</a> <span>— ${value}</span></li>`;
          })
          .join("")
      : `<li>No ${title.toLowerCase()} data found.</li>`;
    col.innerHTML = `<h3>${title}</h3><ol class="post-link-list">${items}</ol>`;
    return col;
  };

  comparison.appendChild(createMetricColumn("Top posts by video views", "videoViews", (value) => formatValue("videoViews", value)));
  comparison.appendChild(createMetricColumn("Top posts by engagements", "engagement", (value) => formatValue("engagement", value)));
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
    const loadDataFile = async (baseName, forcedPlatform = null) => {
      if (typeof XLSX !== "undefined") {
        const xlsxResponse = await fetch(`data/${baseName}.xlsx`);
        if (xlsxResponse.ok) {
          const arrayBuffer = await xlsxResponse.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });
          return parseWorkbookRows(rows, forcedPlatform);
        }
      }

      const csvResponse = await fetch(`data/${baseName}.csv`);
      if (csvResponse.ok) {
        const csvText = await csvResponse.text();
        return parseCsvText(csvText, forcedPlatform);
      }

      return [];
    };

    // Per requirement: LinkedIn, Instagram, and YouTube come from performq126.xlsx benchmarked to performq125.xlsx.
    const mainPlatforms = new Set(["LinkedIn", "Instagram", "YouTube"]);
    const currentMain = (await loadDataFile("performq126")).filter((post) => mainPlatforms.has(post.platform));
    const previousMain = (await loadDataFile("performq125")).filter((post) => mainPlatforms.has(post.platform));
    const currentFb = await loadDataFile("fbq126", "Facebook");
    const previousFb = await loadDataFile("fbq125", "Facebook");

    const currentPosts = [...currentMain, ...currentFb];
    const previousPosts = [...previousMain, ...previousFb];

    if (!currentPosts.length) {
      throw new Error("Could not load current timeframe data. Expected performq126(.xlsx/.csv) and fbq126(.xlsx/.csv).");
    }

    state.posts = currentPosts;
    state.data = computeDataFromPosts(currentPosts);
    state.previousData = computeDataFromPosts(previousPosts);
    document.getElementById("liveStatus").textContent = "● Q1 2026 metrics benchmarked against Q1 2025 metrics.";
  } catch (error) {
    document.getElementById("liveStatus").textContent = `● Data load issue: ${error.message}`;
    state.posts = [];
    state.data = computeDataFromPosts([]);
    state.previousData = computeDataFromPosts([]);
  }

  render();
}

setupWelcomeOverlay();
loadWorkbook();
