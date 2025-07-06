const API_URL = "https://api.allorigins.win/raw?url=http://139.162.4.173:30120/players.json";

const playerBody = document.getElementById("playerBody");
const searchInput = document.getElementById("searchInput");
const lastUpdated = document.getElementById("lastUpdated");
const allTab = document.getElementById("allTab");
const favoritesTab = document.getElementById("favoritesTab");
const statsTab = document.getElementById("statsTab");
const playerCount = document.getElementById("playerCount");
const refreshButton = document.getElementById("refreshButton");
const timerSpan = document.getElementById("timer");
const toggleThemeCheckbox = document.getElementById("toggleTheme");
const themeLabel = document.getElementById("themeLabel");
const playerTable = document.getElementById("playerTable");
const chartContainer = document.getElementById("chartContainer");

let allPlayers = [];
let currentTab = "all";
let countdown = 30;
let countdownInterval;
let pingChart;

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

    const favClass = isFavorite(player.name) ? "remove" : "";
    const favText = isFavorite(player.name) ? "Remove" : "Add";

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${player.id || "-"}</td>
      <td>${player.name}</td>
      <td>${player.offline ? "Offline" : player.ping}</td>
      <td>
        <button class="favorite-btn ${favClass}" onclick="toggleFavorite('${player.name}')">
          ${favText}
        </button>
      </td>
    `;

    playerBody.appendChild(tr);
  });

  playerCount.textContent = `Players: ${dataToShow.length}`;
}

async function fetchPlayers() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch players.");
    allPlayers = await res.json();
    allPlayers.sort((a, b) => a.id - b.id);
    lastUpdated.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;
  } catch (e) {
    allPlayers = [];
    lastUpdated.textContent = `Last Updated: Error loading data.`;
    console.error(e);
  }
  if(currentTab !== "statistics") renderTable();
  if(currentTab === "statistics") renderChart();
}

function startCountdown() {
  clearInterval(countdownInterval);
  timerSpan.textContent = countdown;
  countdownInterval = setInterval(() => {
    countdown--;
    timerSpan.textContent = countdown;
    if (countdown <= 0) {
      fetchPlayers();
      countdown = 30;
    }
  }, 1000);
}

function renderChart() {
  if(pingChart) pingChart.destroy();

  const ctx = document.getElementById('pingChart').getContext('2d');

  const playerNames = allPlayers.map(p => p.name);
  const pings = allPlayers.map(p => p.ping);

  pingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: playerNames,
      datasets: [{
        label: 'Ping (ms)',
        data: pings,
        backgroundColor: 'rgba(0, 184, 148, 0.7)',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 10
          }
        }
      }
    }
  });
}

function setActiveTab(tabName) {
  currentTab = tabName;

  allTab.classList.toggle("active", tabName === "all");
  favoritesTab.classList.toggle("active", tabName === "favorites");
  statsTab.classList.toggle("active", tabName === "statistics");

  if(tabName === "statistics") {
    playerTable.style.display = "none";
    searchInput.style.display = "none";
    chartContainer.style.display = "block";
    renderChart();
  } else {
    playerTable.style.display = "";
    searchInput.style.display = "";
    chartContainer.style.display = "none";
    renderTable();
  }
}

allTab.addEventListener("click", () => setActiveTab("all"));
favoritesTab.addEventListener("click", () => setActiveTab("favorites"));
statsTab.addEventListener("click", () => setActiveTab("statistics"));

searchInput.addEventListener("input", () => {
  if(currentTab !== "statistics") renderTable();
});

refreshButton.addEventListener("click", () => {
  fetchPlayers();
  countdown = 30;
  timerSpan.textContent = countdown;
});

toggleThemeCheckbox.addEventListener("change", () => {
  if (toggleThemeCheckbox.checked) {
    document.body.classList.add("light");
    themeLabel.textContent = "Light Mode";
  } else {
    document.body.classList.remove("light");
    themeLabel.textContent = "Dark Mode";
  }
});

window.onload = () => {
  fetchPlayers();
  startCountdown();
  setActiveTab("all");

  if (document.body.classList.contains("light")) {
    toggleThemeCheckbox.checked = true;
    themeLabel.textContent = "Light Mode";
  } else {
    toggleThemeCheckbox.checked = false;
    themeLabel.textContent = "Dark Mode";
  }
};
