// API_KEY comes from js/config.js 
// That file is gitignored 
const API_KEY_SAFE = (typeof API_KEY !== "undefined") ? API_KEY : "";
const API_BASE = "https://api.themoviedb.org/3";
const POSTER_BASE = "https://image.tmdb.org/t/p/w185";

// TRANSLATIONS
const translations = {
  en: {
    pageTitle: "Movie Searcher",
    pageSubtitle: "Search for any movie and get title, year and synopsis.",
    placeholder: "Type a movie title...",
    searchBtn: "Search",
    searching: "Searching...",
    noResults: "Movie not found",
    noResultsHint: "Try a different title or check the spelling.",
    connectionError: "Connection error. Please check your internet and try again.",
    emptyQuery: "Please type a movie title to search.",
    missingKey: "API key is missing. Add your TMDB API key in js/app.js",
    noOverview: "No synopsis available.",
    resultsFound: "result(s) found",
    footerAboutTitle: "About",
    footerAboutText: "Simple movie searcher built with HTML, CSS and vanilla JavaScript using the TMDB API.",
    footerAuthorTitle: "Author",
    footerProjectsLabel: "Other projects:",
    footerLinksTitle: "Links",
    footerCredit: "This product uses the TMDB API but is not endorsed or certified by TMDB."
  },
  es: {
    pageTitle: "Buscador de Películas",
    pageSubtitle: "Busca cualquier película y obtén título, año y sinopsis.",
    placeholder: "Escribe el nombre de una película...",
    searchBtn: "Buscar",
    searching: "Buscando...",
    noResults: "Película no encontrada",
    noResultsHint: "Prueba con otro título o revisa la ortografía.",
    connectionError: "Error de conexión. Revisa tu internet e intenta de nuevo.",
    emptyQuery: "Escribe el nombre de una película para buscar.",
    missingKey: "Falta la API key. Agrégala en js/app.js",
    noOverview: "Sinopsis no disponible.",
    resultsFound: "resultado(s) encontrado(s)",
    footerAboutTitle: "Acerca de",
    footerAboutText: "Buscador de películas simple hecho con HTML, CSS y JavaScript puro usando la API de TMDB.",
    footerAuthorTitle: "Autor",
    footerProjectsLabel: "Otros proyectos:",
    footerLinksTitle: "Enlaces",
    footerCredit: "Este producto usa la API de TMDB pero no está respaldado ni certificado por TMDB."
  }
};
// STATE
let currentLang = "en";

// DOM REFERENCES
const form = document.getElementById("search-form");
const input = document.getElementById("movie-input");
const btnSearch = document.getElementById("btn-search");
const results = document.getElementById("results");
const btnLangEn = document.getElementById("btn-lang-en");
const btnLangEs = document.getElementById("btn-lang-es");


// LANGUAGE

// Detect browser language and set initial language
function detectBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage || "en";
  // Use Spanish if browser starts with "es", otherwise English
  return browserLang.toLowerCase().startsWith("es") ? "es" : "en";
}

// Apply translations to static UI elements
function applyLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];

  // Header / hero
  document.getElementById("page-title").textContent = t.pageTitle;
  document.getElementById("page-subtitle").textContent = t.pageSubtitle;
  input.placeholder = t.placeholder;
  btnSearch.textContent = t.searchBtn;

  // Footer
  document.getElementById("footer-about-title").textContent = t.footerAboutTitle;
  document.getElementById("footer-about-text").textContent = t.footerAboutText;
  document.getElementById("footer-author-title").textContent = t.footerAuthorTitle;
  document.getElementById("footer-projects-label").textContent = t.footerProjectsLabel;
  document.getElementById("footer-links-title").textContent = t.footerLinksTitle;
  document.getElementById("footer-credit").textContent = t.footerCredit;

  // Language buttons state
  btnLangEn.classList.toggle("active", lang === "en");
  btnLangEs.classList.toggle("active", lang === "es");

  // Update html lang attribute
  document.documentElement.lang = lang;

  // Clear previous results so messages match the new language
  results.innerHTML = "";
}

// UI HELPERS
// Show a loading state inside the results area
function showLoading() {
  const t = translations[currentLang];
  results.innerHTML = `
    <div class="state-message">
      <div class="loading-spinner"></div>
      <p>${t.searching}</p>
    </div>
  `;
}

// Show an error or empty state message
function showMessage(message, type = "empty") {
  results.innerHTML = `
    <div class="state-message ${type}">
      <p>${message}</p>
    </div>
  `;
}

function getYear(dateString) {
  if (!dateString) return "—";
  return dateString.slice(0, 4);
}

function getPosterHTML(posterPath, title) {
  if (posterPath) {
    return `<img
      class="movie-poster"
      src="${POSTER_BASE}${posterPath}"
      alt="${escapeHTML(title)}"
      loading="lazy"
    >`;
  }
  return `<div class="movie-poster placeholder">No image</div>`;
}

//Render movie cards from API results
function renderMovies(movies) {
  const t = translations[currentLang];

  if (!movies || movies.length === 0) {
    showMessage(`${t.noResults}<br><small>${t.noResultsHint}</small>`, "error");
    return;
  }

  const countText = `${movies.length} ${t.resultsFound}`;

  const cardsHTML = movies
    .map((movie) => {
      const title = movie.title || movie.original_title || "—";
      const year = getYear(movie.release_date);
      const overview = movie.overview
        ? movie.overview
        : t.noOverview;

      return `
        <article class="movie-card">
          ${getPosterHTML(movie.poster_path, title)}
          <div class="movie-info">
            <h2 class="movie-title">${escapeHTML(title)}</h2>
            <span class="movie-year">${year}</span>
            <p class="movie-overview ${movie.overview ? "" : "no-overview"}">
              ${escapeHTML(overview)}
            </p>
          </div>
        </article>
      `;
    })
    .join("");

  results.innerHTML = `
    <p class="results-count">${countText}</p>
    <div class="movies-list">
      ${cardsHTML}
    </div>
  `;
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// API
// ============================================

/**
 * 
 * @param {string} query - Movie title to search
 */
async function searchMovies(query) {
  const t = translations[currentLang];

  // Guard: missing API key
  if (!API_KEY_SAFE || API_KEY_SAFE === "YOUR_TMDB_API_KEY_HERE") {
    showMessage(t.missingKey, "error");
    return;
  }

  // Language for TMDB results (synopsis language)
  const apiLang = currentLang === "es" ? "es-ES" : "en-US";

  const url = `${API_BASE}/search/movie?api_key=${API_KEY_SAFE}&query=${encodeURIComponent(query)}&language=${apiLang}&include_adult=false`;

  showLoading();
  btnSearch.disabled = true;

  try {
    const response = await fetch(url);

    // Network / HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // TMDB returns results array (empty if nothing found)
    renderMovies(data.results);
  } catch (error) {
    console.error("Search error:", error);
    showMessage(t.connectionError, "error");
  } finally {
    btnSearch.disabled = false;
  }
}

// EVENT LISTENERS
// Handle form submit
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent page reload

  const query = input.value.trim();
  const t = translations[currentLang];

  if (!query) {
    showMessage(t.emptyQuery, "error");
    return;
  }

  searchMovies(query);
});

//Language switcher buttons
btnLangEn.addEventListener("click", () => applyLanguage("en"));
btnLangEs.addEventListener("click", () => applyLanguage("es"));

// Initialize app
function init() {
  const preferredLang = detectBrowserLanguage();
  applyLanguage(preferredLang);
  input.focus();
}

init();
