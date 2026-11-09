# Zakkart Movie Searcher

Simple movie search web page using the TMDB API.

Part of: **Bootcamp WDFRT1**

## Features

- Search movies by title
- Shows poster, title, release year and synopsis
- Error handling (no results / connection errors)
- English / Spanish interface
- Detects browser language on load
- Clean dark minimal design

## Setup (API key)

1. Get a free API key: [TMDB Settings → API](https://www.themoviedb.org/settings/api)
2. Copy the example config:

```bash
cp js/config.example.js js/config.js
```

3. Open `js/config.js` and replace `YOUR_TMDB_API_KEY` with your key
4. Open `index.html` in a browser


## Project structure

```
movie-searcher/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── config.example.js
├── .gitignore
└── README.md
```

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript (fetch + DOM)

## By

[YonaZakkart](https://github.com/YonaZakkart)

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB
