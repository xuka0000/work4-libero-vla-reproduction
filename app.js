const statusClass = (state) => {
  if (state.includes("completed main")) return "completed";
  if (state.includes("smoke")) return "smoke";
  if (state.includes("running")) return "running";
  return "";
};

const formatRate = (value) => {
  if (value === null || value === undefined) return "pending";
  return `${(value * 100).toFixed(0)}%`;
};

const text = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
};

const list = (selector, values) => {
  const node = document.querySelector(selector);
  node.innerHTML = "";
  values.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    node.appendChild(item);
  });
};

const render = (data) => {
  text("#venue", data.venue);
  text("#title", data.title);
  text("#subtitle", data.subtitle);
  text("#authors", data.authors.join(" / "));
  text("#updated-at", `Updated ${data.updated_at}`);
  text("#method-title", data.method.title);

  const buttons = document.querySelector("#buttons");
  buttons.innerHTML = "";
  data.buttons.forEach((button) => {
    const link = document.createElement("a");
    link.href = button.href;
    link.textContent = button.label;
    buttons.appendChild(link);
  });

  const video = document.querySelector("#teaser-video");
  video.src = data.teaser.src;
  video.poster = data.teaser.poster;
  text("#teaser-caption", data.teaser.caption);

  const abstract = document.querySelector("#abstract-text");
  abstract.innerHTML = "";
  data.abstract.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    abstract.appendChild(p);
  });

  list("#method-points", data.method.points);
  list("#boundaries", data.boundaries);
  list("#next-actions", data.next_actions);

  const stack = document.querySelector("#technical-stack");
  stack.innerHTML = "";
  data.technical_stack.forEach((item) => {
    const tag = document.createElement("span");
    tag.textContent = item;
    stack.appendChild(tag);
  });

  const highlights = document.querySelector("#highlights");
  highlights.innerHTML = "";
  data.result_highlights.forEach((metric) => {
    const card = document.createElement("article");
    card.className = "metric-card";
    const value = document.createElement("strong");
    value.textContent = metric.value;
    const label = document.createElement("span");
    label.textContent = metric.label;
    card.append(value, label);
    highlights.appendChild(card);
  });

  const rows = document.querySelector("#result-rows");
  rows.innerHTML = "";
  data.reproduction_rows.forEach((row) => {
    const tr = document.createElement("tr");
    const rate = formatRate(row.success_rate);
    const success =
      row.successes === null || row.successes === undefined
        ? "pending"
        : `${row.successes}/${row.episodes}`;

    tr.innerHTML = `
      <td><strong>${row.algorithm}</strong></td>
      <td>${row.run}</td>
      <td><span class="status-pill ${statusClass(row.state)}">${row.state}</span></td>
      <td>${rate} <span class="muted">(${success})</span></td>
      <td>${row.episodes}</td>
      <td>${row.truth_level}<br><a href="evidence/public_baseline_queue_status_20260612.md">evidence snapshot</a></td>
    `;
    rows.appendChild(tr);
  });

  const timeline = document.querySelector("#timeline");
  timeline.innerHTML = "";
  data.timeline.forEach((entry) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${entry.time}</strong> ${entry.event}`;
    timeline.appendChild(item);
  });

  const refs = document.querySelector("#references");
  refs.innerHTML = "";
  data.references.forEach((entry) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = entry.url;
    link.textContent = entry.label;
    item.appendChild(link);
    refs.appendChild(item);
  });
};

fetch("data/site.json")
  .then((response) => {
    if (!response.ok) throw new Error(`Unable to load site data: ${response.status}`);
    return response.json();
  })
  .then(render)
  .catch((error) => {
    const main = document.querySelector("main");
    const message = document.createElement("section");
    message.className = "paper-shell";
    message.textContent = error.message;
    main.prepend(message);
    console.error(error);
  });
