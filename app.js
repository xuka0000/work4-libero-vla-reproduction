const state = {
  task: "All",
  algorithm: "All",
  outcome: "All",
};

let siteData = null;

const text = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) node.textContent = value || "";
};

const clear = (selector) => {
  const node = document.querySelector(selector);
  if (node) node.innerHTML = "";
  return node;
};

const formatRate = (value) => {
  if (value === null || value === undefined) return "n/a";
  return `${Math.round(value * 100)}%`;
};

const rolloutStatusText = (rollout) => {
  if (rollout.summary) return rollout.summary;
  if (rollout.frames && rollout.fps) {
    return `${rollout.status}; ${rollout.frames} frames at ${rollout.fps} FPS`;
  }
  return rollout.status || "";
};

const evidenceLink = (href, label = "source") => {
  if (!href) return document.createTextNode("n/a");
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  return link;
};

const statusClass = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const renderButtons = (buttons) => {
  const node = clear("#buttons");
  buttons.forEach((button) => {
    const link = document.createElement("a");
    link.href = button.href;
    link.textContent = button.label;
    node.appendChild(link);
  });
};

const renderParagraphs = (selector, paragraphs) => {
  const node = clear(selector);
  paragraphs.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    node.appendChild(p);
  });
};

const renderList = (selector, values) => {
  const node = clear(selector);
  values.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    node.appendChild(item);
  });
};

const renderLinkList = (selector, values) => {
  const node = clear(selector);
  values.forEach((value) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = value.href || value.url;
    link.textContent = value.label;
    item.appendChild(link);
    node.appendChild(item);
  });
};

const renderStack = (items) => {
  const node = clear("#technical-stack");
  items.forEach((item) => {
    const tag = document.createElement("span");
    tag.textContent = item;
    node.appendChild(tag);
  });
};

const renderHighlightsInto = (selector, items) => {
  const node = clear(selector);
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "metric-card";

    const value = document.createElement("strong");
    value.textContent = item.value;

    const label = document.createElement("span");
    label.textContent = item.label;

    card.append(value, label);
    node.appendChild(card);
  });
};

const renderHighlights = (items) => renderHighlightsInto("#highlights", items);

const renderAlgorithmOverview = () => {
  const node = clear("#algorithm-overview");
  const videoFamilies = new Set(flattenRollouts(siteData).map((rollout) => rollout.algorithm));
  siteData.performance_comparison.forEach((row) => {
    const card = document.createElement("article");
    card.className = "algorithm-card";

    const top = document.createElement("div");
    top.className = "algorithm-card-top";

    const title = document.createElement("h3");
    title.textContent = row.family;

    const rate = document.createElement("strong");
    rate.textContent = formatRate(row.success_rate);

    top.append(title, rate);

    const label = document.createElement("p");
    label.textContent = row.algorithm;

    const meta = document.createElement("div");
    meta.className = "card-row";

    const videoState = document.createElement("span");
    const hasVideo = videoFamilies.has(row.family);
    videoState.className = `status-pill ${hasVideo ? "video-failure" : "metric-only"}`;
    videoState.textContent = hasVideo ? "video + metric" : "metric only";

    const protocol = document.createElement("span");
    protocol.className = "muted";
    protocol.textContent = `${row.successes}/${row.episodes}`;

    meta.append(videoState, protocol);
    card.append(top, label, meta);
    node.appendChild(card);
  });
};

const flattenRollouts = (data) =>
  data.visual_task_groups.flatMap((group) =>
    group.rollouts.map((rollout) => ({
      ...rollout,
      groupTaskId: group.task_id,
      groupTaskName: group.task_name,
    })),
  );

const optionMatches = (selected, value) => selected === "All" || selected === value;

const rolloutMatches = (rollout) => {
  const outcome = rollout.outcome || "";
  if (!optionMatches(state.task, rollout.task_id)) return false;
  if (!optionMatches(state.algorithm, rollout.algorithm)) return false;
  if (state.outcome === "Metric only") return false;
  if (state.outcome === "Video available") return true;
  if (state.outcome !== "All" && state.outcome !== outcome) return false;
  return true;
};

const renderSegmentedControl = (selector, options, selected, onSelect) => {
  const node = clear(selector);
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.className = option === selected ? "active" : "";
    button.setAttribute("aria-pressed", option === selected ? "true" : "false");
    button.addEventListener("click", () => onSelect(option));
    node.appendChild(button);
  });
};

const selectedTaskGroups = () =>
  siteData.visual_task_groups.filter((group) => optionMatches(state.task, group.task_id));

const metricOnlyAlgorithms = () => {
  const videoFamilies = new Set(flattenRollouts(siteData).map((rollout) => rollout.algorithm));
  const algorithms = siteData.video_coverage_matrix.algorithms.filter(
    (algorithm) => !videoFamilies.has(algorithm),
  );
  if (state.algorithm === "All") return algorithms;
  return algorithms.includes(state.algorithm) ? [state.algorithm] : [];
};

const buildMetricOnlySlots = () => {
  if (state.outcome !== "Metric only" && state.algorithm === "All") return [];
  if (state.outcome === "Success") return [];
  if (state.outcome === "Failure" || state.outcome === "Video available") return [];

  const algorithms = metricOnlyAlgorithms();
  const groups = selectedTaskGroups();
  return groups.flatMap((group) =>
    algorithms.map((algorithm) => ({
      algorithm,
      task_id: group.task_id,
      task: group.task_name,
      title: `${algorithm} ${group.task_id}`,
      status: "metric only",
    })),
  );
};

const renderVideoCard = (rollout) => {
  const card = document.createElement("article");
  card.className = `video-card outcome-${statusClass(rollout.outcome)}`;

  const video = document.createElement("video");
  video.controls = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.src = rollout.video;
  if (rollout.poster) video.poster = rollout.poster;

  const body = document.createElement("div");
  body.className = "video-card-body";

  const meta = document.createElement("div");
  meta.className = "card-kicker";
  meta.textContent = `${rollout.algorithm} / ${rollout.task_id}`;

  const title = document.createElement("h3");
  title.textContent = rollout.title;

  const task = document.createElement("p");
  task.textContent = rollout.task;

  const status = document.createElement("p");
  status.className = "muted";
  status.textContent = rolloutStatusText(rollout);

  const row = document.createElement("div");
  row.className = "card-row";

  const pill = document.createElement("span");
  pill.className = `status-pill ${statusClass(rollout.outcome)}`;
  pill.textContent = rollout.outcome;

  const evidence = document.createElement("a");
  evidence.href = rollout.evidence;
  evidence.textContent = rollout.truth_level || "step evidence";

  row.append(pill, evidence);
  body.append(meta, title, task, status, row);
  card.append(video, body);
  return card;
};

const renderMetricSlot = (slot) => {
  const card = document.createElement("article");
  card.className = "video-card metric-slot";

  const placeholder = document.createElement("div");
  placeholder.className = "metric-placeholder";
  placeholder.textContent = "Metric only";

  const body = document.createElement("div");
  body.className = "video-card-body";

  const meta = document.createElement("div");
  meta.className = "card-kicker";
  meta.textContent = `${slot.algorithm} / ${slot.task_id}`;

  const title = document.createElement("h3");
  title.textContent = slot.title;

  const task = document.createElement("p");
  task.textContent = slot.task;

  const note = document.createElement("p");
  note.className = "muted";
  note.textContent = "This algorithm has a reproduced metric row, but no local video clip for this task.";

  body.append(meta, title, task, note);
  card.append(placeholder, body);
  return card;
};

const renderGallery = () => {
  const node = clear("#task-gallery");
  const videos = flattenRollouts(siteData).filter(rolloutMatches);
  const slots = buildMetricOnlySlots();

  videos.forEach((rollout) => node.appendChild(renderVideoCard(rollout)));
  slots.forEach((slot) => node.appendChild(renderMetricSlot(slot)));

  if (!videos.length && !slots.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No recorded clip matches this filter. Success clips are not available yet.";
    node.appendChild(empty);
  }
};

const rerenderFilters = () => {
  renderSegmentedControl("#task-filter", siteData.filters.tasks, state.task, (value) => {
    state.task = value;
    rerenderFilters();
    renderGallery();
  });
  renderSegmentedControl(
    "#algorithm-filter",
    siteData.filters.algorithms,
    state.algorithm,
    (value) => {
      state.algorithm = value;
      rerenderFilters();
      renderGallery();
    },
  );
  renderSegmentedControl("#outcome-filter", siteData.filters.outcomes, state.outcome, (value) => {
    state.outcome = value;
    rerenderFilters();
    renderGallery();
  });
};

const renderCoverageMatrix = () => {
  const node = clear("#coverage-matrix");
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Task", ...siteData.video_coverage_matrix.algorithms].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);

  const tbody = document.createElement("tbody");
  siteData.video_coverage_matrix.rows.forEach((row) => {
    const tr = document.createElement("tr");
    const task = document.createElement("th");
    task.scope = "row";
    task.textContent = row.task;
    tr.appendChild(task);
    siteData.video_coverage_matrix.algorithms.forEach((algorithm) => {
      const td = document.createElement("td");
      const value = row.coverage[algorithm];
      const badge = document.createElement("span");
      badge.className = `status-pill ${statusClass(value)}`;
      badge.textContent = value;
      td.appendChild(badge);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.append(thead, tbody);
  node.appendChild(table);
};

const renderPerformanceTable = () => {
  const node = clear("#performance-table");
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Algorithm</th>
        <th>Suite</th>
        <th>Protocol</th>
        <th>Success</th>
        <th>Episodes</th>
        <th>Evidence</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement("tbody");
  siteData.performance_comparison.forEach((row) => {
    const tr = document.createElement("tr");
    const evidence = document.createElement("a");
    evidence.href = row.evidence;
    evidence.textContent = "source";
    const cells = [
      row.algorithm,
      row.suite,
      row.protocol,
      `${formatRate(row.success_rate)} (${row.successes}/${row.episodes})`,
      String(row.episodes),
    ];
    cells.forEach((value, index) => {
      const cell = document.createElement(index === 0 ? "th" : "td");
      if (index === 0) cell.scope = "row";
      cell.textContent = value;
      tr.appendChild(cell);
    });
    const td = document.createElement("td");
    td.appendChild(evidence);
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  node.appendChild(table);
};

const renderReproductionTable = () => {
  const node = clear("#reproduction-table");
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Algorithm</th>
        <th>Suite</th>
        <th>Status</th>
        <th>Success</th>
        <th>Media</th>
        <th>Note</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement("tbody");
  siteData.reproduction_rows.forEach((row) => {
    const tr = document.createElement("tr");
    [row.algorithm, row.suite, row.state, formatRate(row.success_rate), row.media, row.note].forEach(
      (value, index) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        if (index === 0) cell.scope = "row";
        cell.textContent = value;
        tr.appendChild(cell);
      },
    );
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  node.appendChild(table);
};

const renderTimeline = (entries) => {
  const node = clear("#timeline");
  entries.forEach((entry) => {
    const item = document.createElement("li");
    const time = document.createElement("strong");
    time.textContent = entry.time;
    item.append(time, document.createTextNode(` ${entry.event}`));
    node.appendChild(item);
  });
};

const renderEvidenceVideoCard = (rollout) => {
  const card = document.createElement("article");
  card.className = `video-card outcome-${statusClass(rollout.outcome)}`;

  const video = document.createElement("video");
  video.controls = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.src = rollout.video;
  if (rollout.poster) video.poster = rollout.poster;

  const body = document.createElement("div");
  body.className = "video-card-body";

  const meta = document.createElement("div");
  meta.className = "card-kicker";
  meta.textContent = `${rollout.algorithm} / ${rollout.task_id}`;

  const title = document.createElement("h3");
  title.textContent = rollout.title;

  const task = document.createElement("p");
  task.textContent = rollout.task;

  const status = document.createElement("p");
  status.className = "muted";
  status.textContent = rolloutStatusText(rollout);

  const row = document.createElement("div");
  row.className = "card-row";

  const pill = document.createElement("span");
  pill.className = `status-pill ${statusClass(rollout.outcome)}`;
  pill.textContent = rollout.outcome;

  const evidence = document.createElement("a");
  evidence.href = rollout.evidence;
  evidence.textContent = rollout.truth_level || "evidence";

  row.append(pill, evidence);
  body.append(meta, title, task, status, row);
  card.append(video, body);
  return card;
};

const renderSecondarySection = (secondaryData) => {
  if (!secondaryData) return;

  renderHighlightsInto("#secondary-highlights", secondaryData.visual_highlights || []);

  const gallery = clear("#secondary-video-gallery");
  const rollouts = secondaryData.visual_task_groups.flatMap((group) =>
    group.rollouts.map((rollout) => ({
      ...rollout,
      groupTaskName: group.task_name,
    })),
  );
  rollouts.forEach((rollout) => gallery.appendChild(renderEvidenceVideoCard(rollout)));

  const tableNode = clear("#secondary-status-table");
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Experiment</th>
        <th>Suite</th>
        <th>Status</th>
        <th>Success</th>
        <th>Media</th>
        <th>Note</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement("tbody");
  secondaryData.reproduction_rows.forEach((row) => {
    const tr = document.createElement("tr");
    [row.algorithm, row.suite, row.state, formatRate(row.success_rate), row.media, row.note].forEach(
      (value, index) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        if (index === 0) cell.scope = "row";
        cell.textContent = value;
        tr.appendChild(cell);
      },
    );
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableNode.appendChild(table);
};

const render = ({ mainData, secondaryData }) => {
  const data = mainData;
  siteData = data;
  text("#venue", data.venue);
  text("#title", data.title);
  text("#subtitle", data.subtitle);
  text("#authors", data.authors.join(" / "));
  text("#updated-at", `Updated ${data.updated_at}`);
  text("#method-title", data.method.title);

  renderButtons(data.buttons);

  const video = document.querySelector("#teaser-video");
  video.src = data.teaser.src;
  if (data.teaser.poster) video.poster = data.teaser.poster;
  text("#teaser-caption", data.teaser.caption);

  renderParagraphs("#abstract-text", data.abstract);
  renderHighlights(data.visual_highlights);
  renderAlgorithmOverview();
  rerenderFilters();
  renderGallery();
  renderCoverageMatrix();
  renderPerformanceTable();
  renderReproductionTable();
  renderList("#method-points", data.method.points);
  renderStack(data.technical_stack);
  renderLinkList("#evidence-files", data.evidence_files);
  renderTimeline(data.timeline);
  renderList("#boundaries", data.boundaries);
  renderList("#next-actions", data.next_actions);
  renderLinkList("#references", data.references);
  renderSecondarySection(secondaryData);
};

Promise.all([
  fetch("data/site.json").then((response) => {
    if (!response.ok) throw new Error(`Unable to load site data: ${response.status}`);
    return response.json();
  }),
  fetch("data/libero_vla_site.json").then((response) => {
    if (!response.ok) throw new Error(`Unable to load secondary data: ${response.status}`);
    return response.json();
  }),
])
  .then(([mainData, secondaryData]) => ({ mainData, secondaryData }))
  .then(render)
  .catch((error) => {
    const main = document.querySelector("main");
    const message = document.createElement("section");
    message.className = "section-band";
    message.textContent = error.message;
    main.prepend(message);
    console.error(error);
  });
