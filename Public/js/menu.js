const mainButtons = document.getElementById("main-buttons");
const missionButtons = document.getElementById("mission-buttons");

document.getElementById("btn-play").addEventListener("click", () => {
    mainButtons.classList.add("hidden");
    missionButtons.classList.remove("hidden");
});

document.getElementById("btn-back").addEventListener("click", () => {
    missionButtons.classList.add("hidden");
    mainButtons.classList.remove("hidden");
});

document.getElementById("btn-settings").addEventListener("click", () => {
    alert("Configuración — próximamente");
});

missionButtons.querySelectorAll(".mission").forEach((btn) => {
    btn.addEventListener("click", () => {
        const mission = btn.dataset.mission;

        if (mission === "1") {
            window.location.href = "/game?mission=1";
            return;
        }

        alert(`Misión ${mission} — próximamente`);
    });
});
