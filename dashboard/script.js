const STORAGE_KEY = "prospex_approached";

function getApproached() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function toggleApproached(username, card, btn) {
  const approached = getApproached();
  const index = approached.indexOf(username);
  if (index === -1) {
    approached.push(username);
    card.classList.add("approached");
    btn.classList.add("checked");
    btn.innerHTML = "✓ Abordado";
  } else {
    approached.splice(index, 1);
    card.classList.remove("approached");
    btn.classList.remove("checked");
    btn.innerHTML = "Marcar como abordado";
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(approached));
}

async function loadResults() {
  const container = document.getElementById("results");
  container.innerHTML = "<p>Carregando...</p>";
  try {
    const res = await fetch("../output/leads_qualified.json");
    const data = await res.json();
    const results = Array.isArray(data) ? data : [];
    const filtered = results.filter(
      (item) => item.username && item.username.trim() !== "",
    );
    if (filtered.length === 0) {
      container.innerHTML = "<p>Nenhum lead encontrado.</p>";
      return;
    }
    renderResults(filtered);
  } catch (err) {
    container.innerHTML = "<p>Erro ao carregar leads_qualified.json.</p>";
  }
}

function renderResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";
  const approached = getApproached();

  results.forEach((item) => {
    const isApproached = approached.includes(item.username);
    const card = document.createElement("div");
    card.className = "card" + (isApproached ? " approached" : "");
    const instagramUrl = `https://www.instagram.com/${item.username}/`;

    card.innerHTML = `
      <div class="card-header">
        <div class="card-username">@${item.username}</div>
        <button class="check-btn ${isApproached ? "checked" : ""}">
          ${isApproached ? "✓ Abordado" : "Marcar como abordado"}
        </button>
      </div>
      <div class="card-followers">${item.followers ? item.followers + " seguidores" : "seguidores não disponíveis"} · ${item.query_origin}</div>
      <div class="card-label">Diagnóstico</div>
      <div class="card-text">${item.diagnosis || "—"}</div>
      <div class="card-label">Oportunidade</div>
      <div class="card-text">${item.opportunity || "—"}</div>
      <div class="card-label">Ângulo de oferta</div>
      <div class="card-text">${item.offer_angle || "—"}</div>
      <div class="btn-div">
        <button class="btn-open" onclick="window.open('${instagramUrl}', '_blank')">Abrir Instagram</button>
        <button class="btn-copy" onclick="copyText('${item.username}', this)">Copiar username</button>
      </div>
    `;

    const btn = card.querySelector(".check-btn");
    btn.addEventListener("click", () =>
      toggleApproached(item.username, card, btn),
    );

    container.appendChild(card);
  });
}

function copyText(text, buttonElement) {
  navigator.clipboard.writeText(text);
  buttonElement.classList.add("copied");
  buttonElement.innerText = "Copiado!";
  buttonElement.disabled = true;
  setTimeout(() => {
    buttonElement.innerText = "Copiar username";
    buttonElement.disabled = false;
    buttonElement.classList.remove("copied");
  }, 2000);
}
