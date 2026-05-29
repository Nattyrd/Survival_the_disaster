const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, "..", "Public");
const phaserDir = path.join(__dirname, "..", "node_modules", "phaser", "dist");
const asepriteDir = path.join(__dirname, "..", "Assets", "aseprite");

app.use(express.static(publicDir));
app.use("/phaser", express.static(phaserDir));
app.use("/assets/sprites/hero", express.static(path.join(asepriteDir, "hero")));
app.use("/assets/sprites/enemies", express.static(path.join(asepriteDir, "enemies")));
app.use("/assets/sprites/bosses/Boss1", express.static(path.join(asepriteDir, "bosses", "Boss1")));
app.use("/assets/sprites/bosses/Boss2", express.static(path.join(asepriteDir, "bosses", "Boss2")));
app.use("/assets/sprites/bosses/Boss3", express.static(path.join(asepriteDir, "bosses", "Boss3")));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/game", (req, res) => {
    res.sendFile(path.join(publicDir, "game.html"));
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});

module.exports = app;
