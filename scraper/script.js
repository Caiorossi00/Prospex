async function loadResults() {
  const container = document.getElementById("results");
  container.innerHTML = "<p>Carregando...</p>";

  try {
    const res = await fetch("./output.json");
    const data = await res.json();

    if (!Array.isArray(data) && !Array.isArray(data.results)) {
      container.innerHTML = "<p>Nenhum resultado.</p>";
      return;
    }

    let results = Array.isArray(data) ? data : data.results;

    results = results.filter(
      (item) => item.username && item.username.trim() !== ""
    );

    renderResults(results);
  } catch (err) {
    container.innerHTML = "<p>Erro ao carregar output.json.</p>";
  }
}

function renderResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  results.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    const username = item.username ? `@${item.username}` : "(sem username)";
    const snippet = item.snippet || "Sem descrição disponível.";

    card.innerHTML = `
    <div class="card-title">📸 ${item.title}</div>
    <div class="card-username">@${item.username}</div>
    <div class="card-snippet">${snippet}</div>
  
    <div class="btn-div">
      <button class="btn-open" onclick="window.open('${item.link}', '_blank')">
        Abrir Instagram
      </button>
  
      <button class="btn-copy" onclick="copyText('${item.username}', this)">
        Copiar username
      </button>
    </div>
  `;

    container.appendChild(card);
  });
}

function copyText(text, buttonElement) {
  navigator.clipboard.writeText(text);

  const originalText = buttonElement.innerText;
  buttonElement.innerText = "Copiado!";

  buttonElement.disabled = true;

  setTimeout(() => {
    buttonElement.innerText = originalText;
    buttonElement.disabled = false;
  }, 2000);
}
