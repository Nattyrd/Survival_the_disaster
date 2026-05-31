/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: VICTORIA (Misión Completada)
 * ════════════════════════════════════════════════════════════════════════════════
 */

class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: "WinScene" });
    this.navegando = false;
  }

  create() {
    console.log("[WinScene] Creando pantalla de victoria");
    this.navegando = false;

    this.game.musicManager.stopAll();

    const { width, height } = this.scale;
    const mission = this.registry.get("mission") || 1;
    const hasNextMission = mission < 3;

    this.guardarProgreso(mission);

    // ► Fondo de Victoria
    const bg = this.add.image(width / 2, height / 2, 'screen_win');
    const bgScale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(bgScale);

    // ► Cuadro de Resumen (Estilo Aetherion)
    const panelW = 500;
    const panelH = 300;
    const panelX = width / 2;
    const panelY = height / 2 + 50;

    this.add.rectangle(panelX, panelY, panelW, panelH, 0x000000, 0.8)
        .setStrokeStyle(3, 0xfbbf24);

    this.add.text(panelX, panelY - panelH / 2 + 40, "RESUMEN DE MISIÓN", {
        fontFamily: "Arial Black", fontSize: "28px", color: "#fbbf24"
    }).setOrigin(0.5);

    // Estadísticas
    const totalDamage = this.registry.get("totalDamageInflicted") || 0;
    const charId = this.registry.get("selectedCharacter") || "hero";
    const charName = charId === "hero" ? "DAN" : "MIKA";

    const statsConfig = { fontFamily: "Arial", fontSize: "22px", color: "#ffffff" };
    
    this.add.text(panelX - 180, panelY - 30, `Personaje:`, statsConfig);
    this.add.text(panelX + 180, panelY - 30, charName, statsConfig).setOrigin(1, 0.5).setColor("#38bdf8");

    this.add.text(panelX - 180, panelY + 20, `Puntos (Daño):`, statsConfig);
    this.add.text(panelX + 180, panelY + 20, String(totalDamage), statsConfig).setOrigin(1, 0.5).setColor("#22c55e");

    this.add.text(panelX - 180, panelY + 70, `Estado:`, statsConfig);
    this.add.text(panelX + 180, panelY + 70, "COMPLETADO", statsConfig).setOrigin(1, 0.5).setColor("#fbbf24");

    // ► BOTONES
    const btnY = height * 0.9;
    
    if (hasNextMission) {
        new Button(this, width / 2 - 160, btnY, {
            text: "Siguiente Misión", width: 280, height: 55, 
            callback: () => this.continuar(mission + 1)
        });
    } else {
        new Button(this, width / 2 - 160, btnY, {
            text: "Registrar Ranking", width: 280, height: 55, 
            callback: () => this.irAlRanking()
        });
    }

    new Button(this, width / 2 + 160, btnY, {
        text: "Menú Principal", width: 280, height: 55, 
        callback: () => this.irAlMenu()
    });

    this.cameras.main.fadeIn(1000);
  }

  guardarProgreso(mission) {
    try {
      const next = Math.min(mission + 1, 3);
      localStorage.setItem("last_mission", String(next));
    } catch (e) {}
  }

  continuar(nextMission) {
    if (this.navegando) return;
    this.navegando = true;
    this.registry.set("mission", nextMission);
    this.scene.start("PreloadScene");
  }

  irAlRanking() {
    if (this.navegando) return;
    this.navegando = true;
    this.registry.set("attemptIncomplete", false);
    this.scene.start("NameInputScene");
  }

  irAlMenu() {
    if (this.navegando) return;
    this.navegando = true;
    this.registry.set("attemptIncomplete", false);
    this.scene.start("NameInputScene"); // Guardar progreso antes de ir al menú
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
  }
}
