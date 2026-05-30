const mainButtons = document.getElementById("main-buttons");
const missionButtons = document.getElementById("mission-buttons");

const btnPlay = document.getElementById("btn-play");
const btnSettings = document.getElementById("btn-settings");
const btnBack = document.getElementById("btn-back");

btnPlay.addEventListener("click", () => {
    mainButtons.classList.add("hidden");
    missionButtons.classList.remove("hidden");
});

btnBack.addEventListener("click", () => {
    missionButtons.classList.add("hidden");
    mainButtons.classList.remove("hidden");
});

btnSettings.addEventListener("click", () => {
    alert("Configuración — próximamente");
});

missionButtons.querySelectorAll(".mission").forEach((btn) => {
    btn.addEventListener("click", () => {
        const mission = btn.dataset.mission;
        window.location.href = "/game?mission=" + mission;
    });
});
