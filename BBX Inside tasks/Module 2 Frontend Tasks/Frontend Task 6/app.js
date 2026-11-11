"use strict";

const API_URL = "https://jsonplaceholder.typicode.com/todos";
const CORS_DEMO_URL = "https://example.com/";
const SEARCH_DELAY_MS = 300;
const INITIAL_TASK_LIMIT = 12;

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-title");
const submitButton = document.querySelector("#submit-task");
const searchInput = document.querySelector("#search-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const notice = document.querySelector("#notice");
const taskCount = document.querySelector("#task-count");
const resultCaption = document.querySelector("#result-caption");
const editNotice = document.querySelector("#edit-notice");
const emptyTitle = document.querySelector(".empty-title");
const emptyCopy = document.querySelector(".empty-copy");
const cancelEditButton = document.querySelector("#cancel-edit");
const corsButton = document.querySelector("#cors-button");
const corsResult = document.querySelector("#cors-result");
const benchmarkButton = document.querySelector("#benchmark-button");
const benchmarkResult = document.querySelector("#benchmark-result");
const benchmarkStage = document.querySelector("#benchmark-stage");
const scrollPosition = document.querySelector("#scroll-position");

let tasks = [];
let editingId = null;
let localTaskSequence = 0;
let searchTimer = null;
let searchController = null;
let searchRequestNumber = 0;

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric"
}).format(new Date()).toUpperCase();

function showNotice(message, kind = "info") {
  notice.textContent = message;
  notice.dataset.kind = kind;
  notice.hidden = false;
}

function clearNotice() {
  notice.textContent = "";
  notice.hidden = true;
  delete notice.dataset.kind;
}

function renderTasks() {
  const fragment = document.createDocumentFragment();

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = `task-row${task.completed ? " is-complete" : ""}`;
    item.dataset.id = String(task.id);

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(task.completed);
    checkbox.setAttribute("aria-label", `Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`);

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const actions = document.createElement("span");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.className = "icon-button";
    editButton.type = "button";
    editButton.dataset.action = "edit";
    editButton.setAttribute("aria-label", `Edit ${task.title}`);
    editButton.textContent = "↗";

    const deleteButton = document.createElement("button");
    deleteButton.className = "icon-button";
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
    deleteButton.textContent = "×";

    actions.append(editButton, deleteButton);
    item.append(checkbox, title, actions);
    fragment.append(item);
  }

  taskList.replaceChildren(fragment);
  emptyState.hidden = tasks.length > 0;
  taskCount.textContent = String(tasks.length);
  if (searchInput.value.trim()) {
    emptyTitle.textContent = "No matches this time.";
    emptyCopy.textContent = "Try another search or clear the search field.";
  } else {
    emptyTitle.textContent = "A little breathing room.";
    emptyCopy.textContent = "Nothing here yet. Add a task when you're ready.";
  }
}

async function readTasks(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`The task service responded with ${response.status} ${response.statusText}.`);
  }

  const result = await response.json();
  if (!Array.isArray(result)) {
    throw new Error("The task service returned an unexpected response.");
  }
  return result.map((task) => ({
    id: task.id,
    title: String(task.title),
    completed: Boolean(task.completed)
  }));
}

async function loadTasks() {
  const loadVersion = searchRequestNumber;
  showNotice("Loading your tasks…", "loading");
  taskList.replaceChildren();
  emptyState.hidden = true;
  resultCaption.textContent = "Connecting";

  try {
    const loadedTasks = await readTasks(`${API_URL}?_limit=${INITIAL_TASK_LIMIT}`);
    if (loadVersion !== searchRequestNumber) return;
    tasks = loadedTasks;
    renderTasks();
    clearNotice();
    resultCaption.textContent = "Recently added";
  } catch (error) {
    if (loadVersion !== searchRequestNumber) return;
    tasks = [];
    renderTasks();
    emptyState.hidden = true;
    resultCaption.textContent = "Unavailable";
    showNotice(`Couldn't load tasks. ${error.message} Check your connection and try again.`, "error");
  }
}

function searchTasks(query) {
  const requestNumber = ++searchRequestNumber;
  searchController?.abort();
  searchController = new AbortController();
  const { signal } = searchController;

  showNotice("Searching…", "loading");
  resultCaption.textContent = "Searching";

  const url = query
    ? `${API_URL}?title_like=${encodeURIComponent(query)}&_limit=100`
    : `${API_URL}?_limit=${INITIAL_TASK_LIMIT}`;

  readTasks(url, signal)
    .then((results) => {
      if (requestNumber !== searchRequestNumber) return;
      tasks = results;
      renderTasks();
      clearNotice();
      resultCaption.textContent = query ? `Matches for “${query}”` : "Recently added";
    })
    .catch((error) => {
      if (error.name === "AbortError" || requestNumber !== searchRequestNumber) return;
      resultCaption.textContent = "Search unavailable";
      showNotice(`Search failed. ${error.message}`, "error");
    });
}

function scheduleSearch() {
  window.clearTimeout(searchTimer);
  searchRequestNumber += 1;
  searchController?.abort();
  const query = searchInput.value.trim();
  searchTimer = window.setTimeout(() => searchTasks(query), SEARCH_DELAY_MS);
}

async function sendTaskRequest(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`The task service responded with ${response.status} ${response.statusText}.`);
  }
  return response.status === 204 ? null : response.json();
}

function findTask(id) {
  return tasks.find((task) => String(task.id) === String(id));
}

function resetEditor() {
  editingId = null;
  taskForm.reset();
  taskInput.placeholder = "What needs your attention?";
  const addIcon = document.createElement("span");
  addIcon.setAttribute("aria-hidden", "true");
  addIcon.textContent = "+";
  submitButton.replaceChildren(addIcon, document.createTextNode(" Add task"));
  editNotice.hidden = true;
}

function startEditing(task) {
  editingId = task.id;
  taskInput.value = task.title;
  taskInput.placeholder = "Update your task...";
  submitButton.textContent = "Save changes";
  editNotice.hidden = false;
  taskInput.focus();
}

async function handleSubmit(event) {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    taskInput.focus();
    return;
  }

  searchController?.abort();
  searchRequestNumber += 1;
  window.clearTimeout(searchTimer);
  searchInput.value = "";
  resultCaption.textContent = "Recently added";
  clearNotice();

  if (editingId !== null) {
    const previous = findTask(editingId);
    if (!previous) return resetEditor();
    const updated = { ...previous, title };
    tasks = tasks.map((task) => task.id === editingId ? updated : task);
    renderTasks();
    resetEditor();

    try {
      await sendTaskRequest(`${API_URL}/${encodeURIComponent(previous.apiId ?? editingId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      showNotice("Task updated.");
    } catch (error) {
      tasks = tasks.map((task) => task.id === previous.id ? previous : task);
      renderTasks();
      showNotice(`Update failed; your task was restored. ${error.message}`, "error");
    }
    return;
  }

  const optimisticTask = {
    id: `local-${Date.now()}-${++localTaskSequence}`,
    apiId: null,
    title,
    completed: false
  };
  tasks = [optimisticTask, ...tasks];
  renderTasks();
  taskForm.reset();

  try {
    const created = await sendTaskRequest(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, completed: false, userId: 1 })
    });
    tasks = tasks.map((task) => task.id === optimisticTask.id
      ? { ...optimisticTask, apiId: created?.id ?? null }
      : task);
    renderTasks();
    showNotice("Task added.");
  } catch (error) {
    tasks = tasks.filter((task) => task.id !== optimisticTask.id);
    renderTasks();
    showNotice(`Couldn't add the task; the optimistic change was rolled back. ${error.message}`, "error");
  }
}

async function toggleTask(task) {
  const previous = { ...task };
  const completed = !task.completed;
  tasks = tasks.map((item) => item.id === task.id ? { ...item, completed } : item);
  renderTasks();
  clearNotice();

  try {
    await sendTaskRequest(`${API_URL}/${encodeURIComponent(task.apiId ?? task.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed })
    });
  } catch (error) {
    tasks = tasks.map((item) => item.id === previous.id ? previous : item);
    renderTasks();
    showNotice(`Couldn't update completion; the change was rolled back. ${error.message}`, "error");
  }
}

async function deleteTask(task) {
  const previousIndex = tasks.findIndex((item) => item.id === task.id);
  tasks = tasks.filter((item) => item.id !== task.id);
  renderTasks();
  clearNotice();

  try {
    await sendTaskRequest(`${API_URL}/${encodeURIComponent(task.apiId ?? task.id)}`, { method: "DELETE" });
    if (editingId === task.id) resetEditor();
    showNotice("Task deleted.");
  } catch (error) {
    tasks.splice(previousIndex, 0, task);
    renderTasks();
    showNotice(`Couldn't delete the task; it was restored. ${error.message}`, "error");
  }
}

taskForm.addEventListener("submit", handleSubmit);
searchInput.addEventListener("input", scheduleSearch);
cancelEditButton.addEventListener("click", resetEditor);

// One delegated click handler keeps working for rows rendered after the initial fetch.
taskList.addEventListener("click", (event) => {
  const row = event.target.closest(".task-row");
  if (!row || !taskList.contains(row)) return;
  const task = findTask(row.dataset.id);
  if (!task) return;

  if (event.target.matches(".task-check")) {
    toggleTask(task);
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "edit") startEditing(task);
  if (action === "delete") deleteTask(task);
});

corsButton.addEventListener("click", async () => {
  corsButton.disabled = true;
  corsResult.dataset.kind = "loading";
  corsResult.textContent = "Requesting the URL from this page's origin…";
  try {
    const response = await fetch(CORS_DEMO_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    corsResult.textContent = "The browser allowed this request. The endpoint may have changed its CORS policy.";
    delete corsResult.dataset.kind;
  } catch (error) {
    corsResult.dataset.kind = "error";
    corsResult.textContent = `The browser blocked the fetch: ${error.message}. Open the same URL in a new tab; navigation is not a CORS fetch.`;
  } finally {
    corsButton.disabled = false;
  }
});

function runAppendBenchmark() {
  benchmarkStage.replaceChildren();
  const list = document.createElement("ul");
  benchmarkStage.append(list);
  const appendStart = performance.now();
  for (let index = 0; index < 5000; index += 1) {
    const item = document.createElement("li");
    item.className = "benchmark-item";
    item.textContent = `Task ${index + 1}`;
    list.append(item);
  }
  return performance.now() - appendStart;
}

function runFragmentBenchmark() {
  benchmarkStage.replaceChildren();
  const list = document.createElement("ul");
  benchmarkStage.append(list);
  const fragment = document.createDocumentFragment();
  const fragmentStart = performance.now();
  for (let index = 0; index < 5000; index += 1) {
    const item = document.createElement("li");
    item.className = "benchmark-item";
    item.textContent = `Task ${index + 1}`;
    fragment.append(item);
  }
  list.append(fragment);
  return performance.now() - fragmentStart;
}

benchmarkButton.addEventListener("click", () => {
  const appendTime = runAppendBenchmark();
  const fragmentTime = runFragmentBenchmark();
  const difference = Math.abs(appendTime - fragmentTime);
  const faster = appendTime <= fragmentTime ? "Appending in a loop" : "DocumentFragment";
  benchmarkResult.textContent = `Loop: ${appendTime.toFixed(2)} ms · Fragment: ${fragmentTime.toFixed(2)} ms · ${faster} was ${difference.toFixed(2)} ms faster in this run.`;
});

function throttle(callback, delay) {
  let lastCall = 0;
  let timeoutId = null;
  return (...args) => {
    const now = performance.now();
    const remaining = delay - (now - lastCall);
    if (remaining <= 0) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
      lastCall = now;
      callback(...args);
    } else if (timeoutId === null) {
      timeoutId = window.setTimeout(() => {
        lastCall = performance.now();
        timeoutId = null;
        callback(...args);
      }, remaining);
    }
  };
}

// Throttling keeps the scroll indicator updating during a gesture; debouncing would wait until scrolling stops.
window.addEventListener("scroll", throttle(() => {
  scrollPosition.textContent = `SCROLL · ${Math.round(window.scrollY)} PX`;
}, 100), { passive: true });

loadTasks();
