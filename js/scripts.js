//const API_URL = "http://139.162.4.173:30120/players.json";
const API_URL = "https://api.allorigins.win/raw?url=http://139.162.4.173:30120/players.json";
const playerBody = document.getElementById("playerBody");
const searchInput = document.getElementById("searchInput");
const lastUpdated = document.getElementById("lastUpdated");
const allTab = document.getElementById("allTab");
const favoritesTab = document.getElementById("favoritesTab");

let allPlayers = [];
let currentTab = "all";

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function toggleFavorite(name) {
  let favs = getFavorites();
  if (favs.includes(name)) {
    favs = favs.filter(n => n !== name);
  } else {
    favs.push(name);
  }
  localStorage.setItem("favorites", JSON.stringify(favs));
  renderTable();
}

function isFavorite(name) {
  return getFavorites().includes(name);
}

function renderTable() {
  let dataToShow = [...allPlayers];
  const query = searchInput.value.toLowerCase();

  if (query) {
    dataToShow = dataToShow.filter(p => p.name.toLowerCase().includes(query));
  }

  if (currentTab === "favorites") {
    const favs = getFavorites();
    dataToShow = favs.map(name => {
      const match = allPlayers.find(p => p.name === name);
      return match || { id: "-", name, ping: "-", offline: true };
    });
  }

  playerBody.innerHTML = "";

  dataToShow.forEach((player, i) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${player.id || "-"}</td>
      <td>${player.name}</td>
      <td>${player.offline ? "Offline" : player.ping}</td>
      <td>
        <button class="favorite-btn ${isFavorite(player.name) ? "remove" : ""}" onclick="toggleFavorite('${player.name}')">
          ${isFavorite(player.name) ? "Remove" : "Add"}
        </button>
      </td>
    `;

    playerBody.appendChild(tr);
  });
}

async function fetchPlayers() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch players.");
    allPlayers = await res.json();
    lastUpdated.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;
  } catch (e) {
    allPlayers = [];
    lastUpdated.textContent = `Last Updated: Error loading data.`;
  }

  renderTable();
}

searchInput.addEventListener("input", renderTable);

allTab.addEventListener("click", () => {
  currentTab = "all";
  allTab.classList.add("active");
  favoritesTab.classList.remove("active");
  renderTable();
});

favoritesTab.addEventListener("click", () => {
  currentTab = "favorites";
  favoritesTab.classList.add("active");
  allTab.classList.remove("active");
  renderTable();
});

fetchPlayers();
setInterval(fetchPlayers, 30000); // 30 seconds
