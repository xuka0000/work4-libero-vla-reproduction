const text = (selector, value) => {
  const node = document.querySelector(selector);
  if (node) node.textContent = value || "";
};

const clear = (selector) => {
  const node = document.querySelector(selector);
  if (node) node.innerHTML = "";
  return node;
};

const list = (selector, values) => {
  const node = clear(selector);
  values.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    node.appendChild(item);
  });
};

const linkList = (selector, values) => {
  const node = clear(selector);
  values.forEach((value) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = value.href;
    link.textContent = value.label;
    item.appendChild(link);
    node.appendChild(item);
  });
};

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

const renderStack = (items) => {
  const node = clear("#technical-stack");
  items.forEach((item) => {
    const tag = document.createElement("span");
    tag.textContent = item;
    node.appendChild(tag);
  });
};

const renderHighlights = (items) => {
  const node = clear("#highlights");
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

const renderRollouts = (rollouts) => {
  const node = clear("#rollout-gallery");
  rollouts.forEach((rollout) => {
    const card = document.createElement("article");
    card.className = "video-card";

    const video = document.createElement("video");
    video.controls = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = rollout.video;
    video.poster = rollout.poster;

    const body = document.createElement("div");
    body.className = "video-card-body";

    const title = document.createElement("h3");
    title.textContent = rollout.title;

    const task = document.createElement("p");
    task.textContent = rollout.task;

    const meta = document.createElement("p");
    meta.className = "muted";
    meta.textContent = `${rollout.status}; ${rollout.frames} frames at ${rollout.fps} FPS`;

    const evidence = document.createElement("a");
    evidence.href = rollout.evidence;
    evidence.textContent = "step evidence";

    body.append(title, task, meta, evidence);
    card.append(video, body);
    node.appendChild(card);
  });
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

const render = (data) => {
  text("#venue", data.venue);
  text("#title", data.title);
  text("#subtitle", data.subtitle);
  text("#authors", data.authors.join(" / "));
  text("#updated-at", `Updated ${data.updated_at}`);
  text("#method-title", data.method.title);

  renderButtons(data.buttons);

  const video = document.querySelector("#teaser-video");
  video.src = data.teaser.src;
  video.poster = data.teaser.poster;
  text("#teaser-caption", data.teaser.caption);

  renderParagraphs("#abstract-text", data.abstract);
  renderHighlights(data.visual_highlights);
  renderRollouts(data.visual_rollouts);
  list("#method-points", data.method.points);
  renderStack(data.technical_stack);
  linkList("#evidence-files", data.evidence_files);
  renderTimeline(data.timeline);
  list("#boundaries", data.boundaries);
  list("#next-actions", data.next_actions);
  linkList("#references", data.references);
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
