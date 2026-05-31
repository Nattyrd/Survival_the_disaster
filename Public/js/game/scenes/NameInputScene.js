/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: INGRESO DE NOMBRE PARA RANKING
 * ════════════════════════════════════════════════════════════════════════════════
 */

class NameInputScene extends Phaser.Scene {
  constructor() {
    super({ key: "NameInputScene" });
    this.playerName = "";
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0f172a");

    // Fondo oscuro
    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.65)
      .setDepth(0);

    const isIncomplete = this.registry.get("attemptIncomplete") || false;
    const mission = this.registry.get("mission") || 1;

    // Título
    const titleColor = isIncomplete ? "#ef4444" : "#fbbf24";
    const titleStroke = isIncomplete ? "#7f1d1d" : "#b45309";
    const titleText = isIncomplete ? "INTENTO INCOMPLETO" : "¡CAMPEÓN!";

    this.add
      .text(width / 2, height * 0.2, titleText, {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "60px",
        color: titleColor,
        stroke: titleStroke,
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Subtítulo
    let subtitleText = isIncomplete
      ? `Detenido en Misión ${mission}`
      : "Completaste todas las misiones";
    this.add
      .text(width / 2, height * 0.32, subtitleText, {
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        color: "#e2e8f0",
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Estadísticas
    const totalDamage = this.registry.get("totalDamageInflicted") || 0;
    const character = this.registry.get("selectedCharacter") || "hero";
    const charName =
      character === "hero"
        ? "DAN"
        : character === "hero2"
          ? "MIKA"
          : "Desconocido";

    this.add
      .text(width / 2, height * 0.42, `Personaje: ${charName}`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#94a3b8",
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(width / 2, height * 0.48, `Daño Total: ${totalDamage}`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#ef4444",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    if (isIncomplete) {
      this.add
        .text(width / 2, height * 0.54)
        .setOrigin(0.5)
        .setDepth(10);
    }

    // Cuadro de entrada de nombre
    const inputBox = this.add
      .rectangle(width / 2, height * 0.58, 400, 60, 0x1e293b, 1)
      .setStrokeStyle(2, 0x4a2a6f)
      .setDepth(9);

    this.add
      .text(width / 2, height * 0.54, "Ingresa tu nombre:", {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        color: "#cbd5e1",
      })
      .setOrigin(0.5, 1)
      .setDepth(10);

    // Texto de entrada
    this.nameText = this.add
      .text(width / 2, height * 0.58, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "32px",
        color: "#22c55e",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Cursor
    this.cursorText = this.add
      .text(width / 2 + 180, height * 0.58, "|", {
        fontFamily: "Arial, sans-serif",
        fontSize: "32px",
        color: "#22c55e",
      })
      .setOrigin(0, 0.5)
      .setDepth(10);

    // Animación de cursor parpadeante
    this.tweens.add({
      targets: this.cursorText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // Entrada de teclado
    this.input.keyboard.on("keydown", (event) => {
      const key = event.key;

      if (key === "Backspace") {
        this.playerName = this.playerName.slice(0, -1);
      } else if (key === "Enter") {
        if (this.playerName.trim().length > 0) {
          this.guardaryIrAlRanking();
        }
      } else if (
        key.length === 1 &&
        /[a-zA-Z0-9\s\-ñ]/.test(key) &&
        this.playerName.length < 20
      ) {
        this.playerName += key;
      }

      this.nameText.setText(this.playerName);

      // Ajustar posición del cursor
      const textWidth = this.nameText.width;
      this.cursorText.setX(width / 2 + textWidth / 2 + 10);
    });

    // Botón Confirmar
    const btnConfirm = this.add
      .rectangle(width / 2 - 120, height * 0.72, 200, 50, 0x22c55e, 1)
      .setStrokeStyle(2, 0x16a34a)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2 - 120, height * 0.72, "[ ENTER ] Guardar", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    btnConfirm.on("pointerover", () => btnConfirm.setFillStyle(0x4ade80));
    btnConfirm.on("pointerout", () => btnConfirm.setFillStyle(0x22c55e));
    btnConfirm.on("pointerdown", () => {
      if (this.playerName.trim().length > 0) {
        this.guardaryIrAlRanking();
      }
    });

    // Botón Cancelar
    const btnCancel = this.add
      .rectangle(width / 2 + 120, height * 0.72, 200, 50, 0xef4444, 1)
      .setStrokeStyle(2, 0xdc2626)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2 + 120, height * 0.72, "[ ESC ] Cancelar", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    btnCancel.on("pointerover", () => btnCancel.setFillStyle(0xf87171));
    btnCancel.on("pointerout", () => btnCancel.setFillStyle(0xef4444));
    btnCancel.on("pointerdown", () => this.irAlMenu());

    this.input.keyboard.on("keydown-ESC", () => this.irAlMenu());

    this.cameras.main.fadeIn(1000);
  }

  guardaryIrAlRanking() {
    const totalDamage = this.registry.get("totalDamageInflicted") || 0;
    const character = this.registry.get("selectedCharacter") || "hero";
    const isIncomplete = this.registry.get("attemptIncomplete") || false;

    console.log(
      "[NameInputScene] Guardando - Nombre:",
      this.playerName,
      "Daño:",
      totalDamage,
      "Incompleto:",
      isIncomplete,
    );

    // Obtener ranking actual
    let ranking = [];
    try {
      const saved = localStorage.getItem("playerRanking");
      ranking = saved ? JSON.parse(saved) : [];
      console.log("[NameInputScene] Ranking actual:", ranking);
    } catch (e) {
      console.error("Error reading ranking:", e);
    }

    // Agregar nuevo jugador
    const newEntry = {
      name: this.playerName.trim(),
      damage: totalDamage,
      character: character,
      date: new Date().toLocaleDateString(),
      completed: !isIncomplete,
      mission: this.registry.get("mission") || 1,
    };

    console.log("[NameInputScene] Nuevo entry:", newEntry);
    ranking.push(newEntry);

    // Guardar ranking actualizado
    try {
      localStorage.setItem("playerRanking", JSON.stringify(ranking));
      console.log("[NameInputScene] Ranking guardado exitosamente");
    } catch (e) {
      console.error("Error saving ranking:", e);
    }

    // Ir a la escena de ranking
    this.scene.start("RankingScene");
  }

  irAlMenu() {
    // Resetear daño acumulado y bandera de intento incompleto
    this.registry.set("totalDamageInflicted", 0);
    this.registry.set("mission", 1);
    this.registry.set("attemptIncomplete", false);
    this.scene.start("MenuScene");
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
  }
}
