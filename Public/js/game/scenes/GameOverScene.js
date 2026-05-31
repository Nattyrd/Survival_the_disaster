/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: DERROTA (GAME OVER)
 * ════════════════════════════════════════════════════════════════════════════════
 */

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
    this.navegando = false;
  }

  create() {
    console.log("[GameOverScene] Creando pantalla de derrota");
    this.navegando = false;

    this.game.musicManager.stopAll();

    const { width, height } = this.scale;
    const mission = this.registry.get("mission") || 1;
    const isWave = mission === MISSION_WAVE;

    // ► Fondo de Derrota
    const bg = this.add.image(width / 2, height / 2, 'screen_lose');
    const bgScale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(bgScale);

    // ► Cuadro de Resumen
    const panelW = 500;
    const panelH = 300;
    const panelX = width / 2;
    const panelY = height / 2 + 50;

    this.add.rectangle(panelX, panelY, panelW, panelH, 0x000000, 0.8)
        .setStrokeStyle(3, 0xef4444);

    this.add.text(panelX, panelY - panelH / 2 + 40, isWave ? "FIN DE LA OLEADA" : "FALLO EN LA MISIÓN", {
        fontFamily: "Arial Black", fontSize: "28px", color: "#ef4444"
    }).setOrigin(0.5);

    // Estadísticas
    const totalDamage = this.registry.get("totalDamageInflicted") || 0;
    const waveKills = this.registry.get("waveKills") || 0;
    const charId = this.registry.get("selectedCharacter") || "hero";
    const charName = charId === "hero" ? "DAN" : "MIKA";

    const statsConfig = { fontFamily: "Arial", fontSize: "22px", color: "#ffffff" };
    
    this.add.text(panelX - 180, panelY - 30, `Personaje:`, statsConfig);
    this.add.text(panelX + 180, panelY - 30, charName, statsConfig).setOrigin(1, 0.5).setColor("#38bdf8");

    this.add.text(panelX - 180, panelY + 20, isWave ? `Eliminados:` : `Puntos (Daño):`, statsConfig);
    this.add.text(panelX + 180, panelY + 20, isWave ? String(waveKills) : String(totalDamage), statsConfig).setOrigin(1, 0.5).setColor("#f97316");

    this.add.text(panelX - 180, panelY + 70, isWave ? `Score:` : `Estado:`, statsConfig);
    this.add.text(panelX + 180, panelY + 70, isWave ? String(totalDamage) : "DERROTADO", statsConfig).setOrigin(1, 0.5).setColor(isWave ? "#22c55e" : "#ef4444");

    // ► BOTONES
    const btnY = height * 0.9;
    
    new Button(this, width / 2 - 160, btnY, {
        text: isWave ? "Reintentar Oleada" : "Reintentar", width: 280, height: 55,
        callback: () => this.retry(mission)
    });

    new Button(this, width / 2 + 160, btnY, {
        text: "Menú Principal", width: 280, height: 55, 
        callback: () => this.irAlMenu()
    });

    this.cameras.main.fadeIn(1000);
  }

  retry(mission) {
    if (this.navegando) return;
    this.navegando = true;

    // ► RESET DE PUNTUACIÓN AL REINTENTAR
    this.registry.set("totalDamageInflicted", 0);
    this.registry.set("waveKills", 0);

    this.registry.set("mission", mission);
    this.scene.start("PreloadScene");
  }

  irAlMenu() {
    if (this.navegando) return;
    this.navegando = true;
    this.registry.set("attemptIncomplete", true);
    this.scene.start("NameInputScene"); // Guardar intento antes de ir al menú
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
  }
}
