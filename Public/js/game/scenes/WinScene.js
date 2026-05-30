class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: "WinScene" });
    this.navegando = false;
  }

  create() {
    this.navegando = false;
    const { width, height } = this.scale;
    const mission = this.registry.get("mission") || 1;
    const hasNextMission = mission < 3;

    this.guardarProgreso(mission);

    this.cameras.main.setBackgroundColor("#0f172a");

    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.65)
      .setDepth(0);

    this.add
      .text(width / 2, height * 0.3, "¡VICTORIA!", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "68px",
        color: "#22c55e",
        stroke: "#14532d",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(width / 2, height * 0.46, `Misión ${mission} completada`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "26px",
        color: "#e2e8f0",
      })
      .setOrigin(0.5)
      .setDepth(10);

    const enemyNames = {
      1: "robot jefe",
      2: "Titán MK-3",
      3: "Andronimus",
    };
    this.add
      .text(
        width / 2,
        height * 0.54,
        `Has derrotado al ${enemyNames[mission] || "enemigo"}`,
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
          color: "#94a3b8",
        },
      )
      .setOrigin(0.5)
      .setDepth(10);

    if (hasNextMission) {
      const nextMission = mission + 1;
      const continuar = this.add
        .text(
          width / 2,
          height * 0.68,
          `[ C ]  Continuar → Misión ${nextMission}`,
          {
            fontFamily: "Arial, sans-serif",
            fontSize: "22px",
            color: "#22c55e",
          },
        )
        .setOrigin(0.5)
        .setDepth(10)
        .setInteractive({ useHandCursor: true });

      continuar.on("pointerover", () => continuar.setColor("#4ade80"));
      continuar.on("pointerout", () => continuar.setColor("#22c55e"));
      continuar.on("pointerdown", () => this.continuar(nextMission));
      this.input.keyboard.on("keydown-C", () => this.continuar(nextMission));
    } else {
      this.add
        .text(width / 2, height * 0.62, "¡Has completado todas las misiones!", {
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
          color: "#fbbf24",
        })
        .setOrigin(0.5)
        .setDepth(10);
    }

    const menu = this.add
      .text(width / 2, height * 0.78, "[ M ]  Menú principal", {
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        color: "#38bdf8",
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    menu.on("pointerover", () => menu.setColor("#7dd3fc"));
    menu.on("pointerout", () => menu.setColor("#38bdf8"));
    menu.on("pointerdown", () => this.irAlMenu());
    this.input.keyboard.on("keydown-M", () => this.irAlMenu());
  }

  guardarProgreso(mission) {
    try {
      const next = Math.min(mission + 1, 3);
      localStorage.setItem("last_mission", String(next));
    } catch (e) {
      // localStorage no disponible
    }
  }

  continuar(nextMission) {
    this.registry.set("mission", nextMission);
    this.scene.start("PreloadScene");
  }

  irAlMenu() {
    if (this.navegando) return;
    this.navegando = true;
    irAlMenuPrincipal(this);
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
  }
}
