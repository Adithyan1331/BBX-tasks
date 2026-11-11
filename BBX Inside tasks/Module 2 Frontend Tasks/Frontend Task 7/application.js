const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const STORAGE_KEY = "daymark:v1";
const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Heavy thunderstorm with hail",
};

const elements = {
  searchForm: document.querySelector("#city-search-form"),
  searchInput: document.querySelector("#city-search"),
  results: document.querySelector("#results-list"),
  status: document.querySelector("#search-status"),
  resultsCaption: document.querySelector("#results-caption"),
  savedList: document.querySelector("#saved-list"),
  savedSearch: document.querySelector("#saved-search"),
  savedFilter: document.querySelector("#saved-filter"),
  savedCount: document.querySelector("#saved-count"),
  savedFeedback: document.querySelector("#saved-feedback"),
  tripForm: document.querySelector("#trip-form"),
  tripFeedback: document.querySelector("#trip-feedback"),
  planList: document.querySelector("#plan-list"),
  planCount: document.querySelector("#plan-count"),
};

let appData = readStoredData();
let activeController;
let requestNumber = 0;
let latestResults = [];

function readStoredData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      saved: Array.isArray(stored.saved) ? stored.saved : [],
      plans: Array.isArray(stored.plans) ? stored.plans : [],
    };
  } catch (error) {
    console.error("Daymark could not read saved data from this browser.", error);
    return { saved: [], plans: [] };
  }
}

function persistData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    return true;
  } catch (error) {
    console.error("Daymark could not save data in this browser.", error);
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function showView(viewName) {
  const validViews = ["explore", "saved", "planner"];
  const view = validViews.includes(viewName) ? viewName : "explore";
  document.querySelectorAll(".view").forEach((section) => {
    section.hidden = section.id !== `${view}-view`;
  });
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    if (link.dataset.viewLink === view) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  if (view === "saved") renderSavedPlaces();
  if (view === "planner") renderPlans();
  document.title = `${view === "explore" ? "Explore" : view === "saved" ? "Saved places" : "Trip planner"} — Daymark`;
}

function weatherLabel(code) {
  return WEATHER_CODES[code] || "Forecast available";
}

function placeLabel(place) {
  return [place.admin1, place.country].filter(Boolean).join(", ");
}

async function fetchJSON(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Forecast service returned ${response.status}`);
  return response.json();
}

async function fetchPlaceWeather(place, signal) {
  const query = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    forecast_days: "1",
    timezone: "auto",
  });
  const forecast = await fetchJSON(`${FORECAST_URL}?${query}`, signal);
  if (!forecast.current || !forecast.daily) throw new Error("The forecast service returned incomplete weather data.");
  return {
    id: `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}`,
    name: place.name,
    region: placeLabel(place),
    latitude: place.latitude,
    longitude: place.longitude,
    temperature: Math.round(forecast.current.temperature_2m),
    feelsLike: Math.round(forecast.current.apparent_temperature),
    humidity: Math.round(forecast.current.relative_humidity_2m),
    wind: Math.round(forecast.current.wind_speed_10m),
    code: forecast.current.weather_code,
    high: Math.round(forecast.daily.temperature_2m_max[0]),
    low: Math.round(forecast.daily.temperature_2m_min[0]),
  };
}

function renderLoading() {
  elements.status.innerHTML = `
    <div class="state-panel" role="status">
      <span class="spinner" aria-hidden="true"></span>
      <p>Finding the forecast and a little inspiration…</p>
    </div>`;
  elements.results.innerHTML = `
    <div class="skeleton-card" aria-hidden="true"><div class="skeleton-line short"></div><div class="skeleton-line medium"></div><div class="skeleton-temp"></div><div class="skeleton-line"></div></div>
    <div class="skeleton-card" aria-hidden="true"><div class="skeleton-line short"></div><div class="skeleton-line medium"></div><div class="skeleton-temp"></div><div class="skeleton-line"></div></div>
    <div class="skeleton-card" aria-hidden="true"><div class="skeleton-line short"></div><div class="skeleton-line medium"></div><div class="skeleton-temp"></div><div class="skeleton-line"></div></div>`;
  elements.resultsCaption.textContent = "Checking the latest forecast";
}

function renderError(message, query) {
  elements.results.innerHTML = "";
  elements.status.innerHTML = `
    <div class="state-panel error" role="alert">
      <p>${escapeHTML(message)}</p>
      <button class="button button-light" type="button" data-retry-query="${escapeHTML(query)}">Try again</button>
    </div>`;
  elements.resultsCaption.textContent = "We couldn't load those places";
  elements.status.querySelector("[data-retry-query]").addEventListener("click", () => searchPlaces(query));
}

function renderEmpty(query) {
  elements.results.innerHTML = "";
  elements.status.innerHTML = `
    <div class="state-panel">
      <p>No places matched “${escapeHTML(query)}”. Try a city name like Osaka or Porto.</p>
    </div>`;
  elements.resultsCaption.textContent = "Try another city";
}

function isSaved(place) {
  return appData.saved.some((saved) => saved.id === place.id);
}

function renderWeatherCards(places) {
  elements.results.innerHTML = places.map((place) => `
    <article class="weather-card">
      <div class="weather-card-top">
        <div>
          <h3>${escapeHTML(place.name)}</h3>
          <p class="weather-place">${escapeHTML(place.region || "Local forecast")}</p>
        </div>
        <span class="sun-mark" aria-hidden="true">${place.code === 0 || place.code === 1 ? "✳" : "◌"}</span>
      </div>
      <p class="temperature" aria-label="${place.temperature} degrees Celsius">${place.temperature}<small>°C</small></p>
      <p class="weather-description">${escapeHTML(weatherLabel(place.code))} · H ${place.high}° / L ${place.low}°</p>
      <div class="weather-meta"><span>Feels ${place.feelsLike}°</span><span>Wind ${place.wind} km/h</span><span>Humidity ${place.humidity}%</span></div>
      <div class="card-action">${isSaved(place)
        ? '<span class="saved-label" aria-label="Already saved">✓ Saved to your places</span>'
        : `<button class="button button-light" type="button" data-save-place="${escapeHTML(place.id)}">Save this place <span aria-hidden="true">＋</span></button>`}
      </div>
    </article>`).join("");
  elements.results.querySelectorAll("[data-save-place]").forEach((button) => {
    button.addEventListener("click", () => savePlace(button.dataset.savePlace));
  });
}

async function searchPlaces(rawQuery) {
  const query = rawQuery.trim();
  if (!query) {
    elements.searchInput.focus();
    return;
  }
  if (activeController) activeController.abort();
  activeController = new AbortController();
  const thisRequest = ++requestNumber;
  renderLoading();
  elements.status.focus?.();
  try {
    const parameters = new URLSearchParams({ name: query, count: "5", language: "en", format: "json" });
    const geocoding = await fetchJSON(`${GEOCODING_URL}?${parameters}`, activeController.signal);
    if (thisRequest !== requestNumber) return;
    if (!Array.isArray(geocoding.results) || geocoding.results.length === 0) {
      latestResults = [];
      renderEmpty(query);
      return;
    }
    const forecasts = await Promise.all(geocoding.results.map((place) => fetchPlaceWeather(place, activeController.signal)));
    if (thisRequest !== requestNumber) return;
    latestResults = forecasts;
    elements.status.innerHTML = "";
    elements.resultsCaption.textContent = `Today's forecast for ${forecasts.length} ${forecasts.length === 1 ? "place" : "places"}`;
    renderWeatherCards(forecasts);
  } catch (error) {
    if (error.name === "AbortError" || thisRequest !== requestNumber) return;
    console.error("Daymark could not load city forecasts.", error);
    renderError("We couldn't reach the forecast just now. Check your connection and try again.", query);
  }
}

function savePlace(placeId) {
  const place = latestResults.find((result) => result.id === placeId);
  if (!place || isSaved(place)) return;
  appData.saved.unshift(place);
  if (!persistData()) {
    appData.saved.shift();
    renderError("This browser couldn't save your place. Check your browser storage settings and try again.", elements.searchInput.value);
    return;
  }
  renderWeatherCards(latestResults);
  elements.savedFeedback.textContent = `${place.name} added to your saved places.`;
}

function renderSavedPlaces() {
  const query = elements.savedSearch.value.trim().toLocaleLowerCase();
  const filter = elements.savedFilter.value;
  const matches = appData.saved.filter((place) => {
    const matchesQuery = `${place.name} ${place.region}`.toLocaleLowerCase().includes(query);
    const matchesFilter = filter === "all" || (filter === "warm" ? place.temperature >= 20 : place.temperature < 20);
    return matchesQuery && matchesFilter;
  });
  elements.savedCount.textContent = `${appData.saved.length} ${appData.saved.length === 1 ? "place" : "places"}`;
  if (appData.saved.length === 0) {
    elements.savedFeedback.textContent = "";
    elements.savedList.innerHTML = '<li class="empty-list"><p>Your list is open. Save a place from Explore to keep it here.</p><a href="#explore">Explore places →</a></li>';
    return;
  }
  if (matches.length === 0) {
    elements.savedFeedback.textContent = "No saved places match those filters.";
    elements.savedList.innerHTML = "";
    return;
  }
  elements.savedFeedback.textContent = "";
  elements.savedList.innerHTML = matches.map((place) => `
    <li class="saved-item">
      <div><h3>${escapeHTML(place.name)}</h3><p>${escapeHTML(place.region)} · ${escapeHTML(weatherLabel(place.code))}</p></div>
      <div class="saved-item-actions"><span class="saved-temp">${place.temperature}°</span><button class="text-button" type="button" data-remove-place="${escapeHTML(place.id)}" aria-label="Remove ${escapeHTML(place.name)} from saved places">Remove</button></div>
    </li>`).join("");
  elements.savedList.querySelectorAll("[data-remove-place]").forEach((button) => {
    button.addEventListener("click", () => removeSavedPlace(button.dataset.removePlace));
  });
}

function removeSavedPlace(placeId) {
  const previous = appData.saved;
  appData.saved = previous.filter((place) => place.id !== placeId);
  if (!persistData()) {
    appData.saved = previous;
    elements.savedFeedback.textContent = "This browser couldn't update your saved places. Please try again.";
    return;
  }
  renderSavedPlaces();
}

function renderPlans() {
  elements.planCount.textContent = `${appData.plans.length} ${appData.plans.length === 1 ? "plan" : "plans"}`;
  if (appData.plans.length === 0) {
    elements.planList.innerHTML = '<li class="empty-list"><p>Your next idea will feel right at home here.</p></li>';
    return;
  }
  elements.planList.innerHTML = appData.plans.map((plan) => `
    <li class="plan-item">
      <div><h3>${escapeHTML(plan.destination)}</h3><p>${escapeHTML(plan.note || "A little something to look forward to.")}</p></div>
      <div class="saved-item-actions"><time class="plan-date" datetime="${escapeHTML(plan.date)}">${escapeHTML(new Date(`${plan.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }))}</time><button class="text-button" type="button" data-remove-plan="${escapeHTML(plan.id)}" aria-label="Remove trip plan for ${escapeHTML(plan.destination)}">Remove</button></div>
    </li>`).join("");
  elements.planList.querySelectorAll("[data-remove-plan]").forEach((button) => {
    button.addEventListener("click", () => removePlan(button.dataset.removePlan));
  });
}

function removePlan(planId) {
  const previous = appData.plans;
  appData.plans = previous.filter((plan) => plan.id !== planId);
  if (!persistData()) {
    appData.plans = previous;
    elements.tripFeedback.textContent = "This browser couldn't update your plans. Please try again.";
    return;
  }
  renderPlans();
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchPlaces(elements.searchInput.value);
});
elements.savedSearch.addEventListener("input", renderSavedPlaces);
elements.savedFilter.addEventListener("change", renderSavedPlaces);
elements.tripForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!elements.tripForm.reportValidity()) return;
  const formData = new FormData(elements.tripForm);
  const plan = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    destination: String(formData.get("destination")).trim(),
    date: String(formData.get("date")),
    note: String(formData.get("note")).trim(),
  };
  appData.plans.unshift(plan);
  if (!persistData()) {
    appData.plans.shift();
    elements.tripFeedback.textContent = "This browser couldn't save your plan. Check your browser storage settings and try again.";
    return;
  }
  elements.tripForm.reset();
  elements.tripFeedback.textContent = `Your plan for ${plan.destination} is saved on this device.`;
  renderPlans();
});
window.addEventListener("hashchange", () => showView(window.location.hash.slice(1)));
showView(window.location.hash.slice(1));
renderSavedPlaces();
renderPlans();
searchPlaces("Lisbon");
