// ---------- tiny helpers ----------
const qs = (sel, root = document) => root.querySelector(sel);

function setLoading(outEl) {
  outEl.innerHTML = '<div class="loading" aria-label="Loading"></div>';
}
function setError(outEl, msg = 'Something went wrong. Please try again.') {
  outEl.innerHTML = `<p class="muted">⚠️ ${msg}</p>`;
}
function imgEl(src, alt = '') {
  const img = new Image();
  img.src = src;
  img.alt = alt;
  return img;
}

//Generate Dog image API
async function getDogImage() {
  const out = qs('#dog-output');
  try {
    setLoading(out);
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    if (!res.ok) throw new Error('Dog API error');
    const data = await res.json();
    out.innerHTML = '';
    out.appendChild(imgEl(data.message, 'Random dog'));
  } catch (e) {
    setError(out, e.message);
  }
}

//Generate Cat image API
async function getCatImage() {
  const out = qs('#cat-output');
  try {
    setLoading(out);
    // cataas JSON gives an id; construct image URL next
    const res = await fetch('https://cataas.com/cat?json=true');
    if (!res.ok) throw new Error('Cat API error');
    const data = await res.json();
    const url = `https://cataas.com${data._id}`;
    out.innerHTML = '';
    out.appendChild(imgEl(url, 'Random cat'));
  } catch (e) {
    setError(out, e.message);
  }
}


//Generate Weather API
async function getWeather() {
  const out = qs('#weather-output');
  const city = (qs('#weather-city').value || 'Phoenix').trim();
  const units = qs('#weather-units').value; // 'fahrenheit' or 'celsius'

  try {
    setLoading(out);
    // 1) geocode city
    const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!geo.ok) throw new Error('Geocoding failed');
    const g = await geo.json();
    if (!g.results || !g.results.length) throw new Error('City not found');
    const { latitude, longitude, name, country_code } = g.results[0];

    // 2) current weather
    const isF = units === 'fahrenheit';
    const params = new URLSearchParams({
      latitude, longitude,
      current: 'temperature_2m,wind_speed_10m,weather_code',
      wind_speed_unit: 'mph',
      temperature_unit: isF ? 'fahrenheit' : 'celsius',
      timezone: 'auto'
    });
    const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!wxRes.ok) throw new Error('Weather fetch failed');
    const wx = await wxRes.json();

    const t = wx.current.temperature_2m;
    const wind = wx.current.wind_speed_10m;
    const code = wx.current.weather_code;
    const label = weatherCodeToText(code);

    out.innerHTML = `
      <dl class="kv">
        <dt>Location</dt><dd>${name}, ${country_code}</dd>
        <dt>Condition</dt><dd>${label}</dd>
        <dt>Temperature</dt><dd>${t}°${isF ? 'F' : 'C'}</dd>
        <dt>Wind</dt><dd>${wind} mph</dd>
      </dl>
    `;
  } catch (e) {
    setError(out, e.message);
  }
}

// Map Open-Meteo weather codes to human text (minimal subset)
function weatherCodeToText(code){
  const map = {
    0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
    45:'Fog', 48:'Depositing rime fog',
    51:'Light drizzle', 53:'Moderate drizzle', 55:'Dense drizzle',
    61:'Light rain', 63:'Moderate rain', 65:'Heavy rain',
    71:'Light snow', 73:'Moderate snow', 75:'Heavy snow',
    80:'Rain showers', 81:'Rain showers', 82:'Violent rain showers',
    95:'Thunderstorm', 96:'Thunderstorm (hail)', 99:'Thunderstorm (heavy hail)'
  };
  return map[code] ?? `Code ${code}`;
}



//Generate Currency API
async function getExchangeRates() {
  const out = qs('#currency-output');
  try {
    setLoading(out);
    const res = await fetch('https://api.exchangerate.host/latest?base=USD');
    if (!res.ok) throw new Error('Rates fetch failed');
    const data = await res.json();
    const want = ['EUR','GBP','JPY','CAD','MXN'];
    const rows = want.map(k => {
      const val = data.rates?.[k];
      return `<tr><td>USD → ${k}</td><td>${val ? val.toFixed(4) : '—'}</td></tr>`;
    }).join('');
    out.innerHTML = `
      <table class="table" aria-label="Exchange Rates">
        <thead><tr><th>Pair</th><th>Rate</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="muted">Date: ${data.date}</p>
    `;
  } catch (e) {
    setError(out, e.message);
  }
}


//Generate Movies API
async function getMovies() {
  const out = qs('#movies-output');
  try {
    setLoading(out);
    // TVMaze doesn’t need a key; get some shows and show images
    const res = await fetch('https://api.tvmaze.com/shows');
    if (!res.ok) throw new Error('Shows fetch failed');
    const shows = await res.json();
    // pick top 6 by rating (where available)
    const picks = shows
      .filter(s => s.image && s.rating && s.rating.average)
      .sort((a,b) => (b.rating.average ?? 0) - (a.rating.average ?? 0))
      .slice(0, 6);

    const cards = picks.map(s => `
      <figure>
        <img src="${s.image.medium}" alt="${s.name}" />
        <figcaption>${s.name} · ⭐ ${s.rating.average}</figcaption>
      </figure>
    `).join('');

    out.innerHTML = `<div class="card-list">${cards}</div>`;
  } catch (e) {
    setError(out, e.message);
  }
}


//Generate GitHub API
async function getGitHubUser() {
  const out = qs('#github-output');
  try {
    setLoading(out);
    const res = await fetch('https://api.github.com/users/octocat');
    if (!res.ok) throw new Error('User fetch failed');
    const user = await res.json();
    out.innerHTML = `
      <h3>${user.name}</h3>
      <p>${user.bio}</p>
      <p>Followers: ${user.followers}</p>
      <p>Following: ${user.following}</p>
      <p>Public Repos: ${user.public_repos}</p>
      <img src="${user.avatar_url}" alt="${user.name}" />
    `;
  } catch (e) {
    setError(out, e.message);
  }
}


//Generate Joke API
async function getJoke() {
  const out = qs('#joke-output');
  try {
    setLoading(out);
    const res = await fetch('https://api.chucknorris.io/jokes/random');
    if (!res.ok) throw new Error('Joke fetch failed');
    const joke = await res.json();
    out.innerHTML = `
      <p>${joke.value}</p>
      <img src="${joke.icon_url}" alt="Chuck Norris" />
    `;
  } catch (e) {
    setError(out, e.message);
  }
}


//Generate Public API
async function getPublicApiInfo() {
  const out = qs('#publicapi-output');
  try {
    setLoading(out);
    const res = await fetch('https://api.publicapis.org/entries');
    if (!res.ok) throw new Error('Public API fetch failed');
    const data = await res.json();
    const api = data.entries[0];
    out.innerHTML = `
      <h3>${api.API}</h3>
      <p>${api.Description}</p>
      <p>Auth: ${api.Auth ? 'Yes' : 'No'}</p>
      <p>HTTPS: ${api.HTTPS ? 'Yes' : 'No'}</p>
      <p>Link: <a href="${api.Link}" target="_blank">${api.Link}</a></p>
    `;
  } catch (e) {
    setError(out, e.message);
  }
}
