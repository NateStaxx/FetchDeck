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
    const url = `https://cataas.com/cat/${data._id}`;
    out.innerHTML = '';
    out.appendChild(imgEl(url, 'Random cat'));
  } catch (e) {
    setError(out, e.message);
  }
}


//Generate Weather API



//Generate Currency API



//Generate Movies API



//Generate GitHub API



//Generate Joke API



//Generate Public API