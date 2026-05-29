class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameOverScene" });
    }

    create() {
        const { width, height } = this.scale;
        const mission = this.registry.get("mission") || 1;

        this.cameras.main.setBackgroundColor("#0f172a");

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)
            .setDepth(0);

        this.add.text(width / 2, height * 0.32, "GAME OVER", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "72px",
            color: "#ef4444",
            stroke: "#450a0a",
            strokeThickness: 8
        })
            .setOrigin(0.5)
            .setDepth(10);

        this.add.text(width / 2, height * 0.48, "El robot te ha derrotado", {
            fontFamily: "Arial, sans-serif",
            fontSize: "24px",
            color: "#e2e8f0"
        })
            .setOrigin(0.5)
            .setDepth(10);

        const retry = this.add.text(width / 2, height * 0.62, "[ R ]  Reintentar misión", {
            fontFamily: "Arial, sans-serif",
            fontSize: "22px",
            color: "#38bdf8"
        })
            .setOrigin(0.5)
            .setDepth(10)
            .setInteractive({ useHandCursor: true });

        const menu = this.add.text(width / 2, height * 0.7, "[ M ]  Menú principal", {
            fontFamily: "Arial, sans-serif",
            fontSize: "22px",
            color: "#94a3b8"
        })
            .setOrigin(0.5)
            .setDepth(10)
            .setInteractive({ useHandCursor: true });

        retry.on("pointerover", () => retry.setColor("#7dd3fc"));
        retry.on("pointerout", () => retry.setColor("#38bdf8"));
        menu.on("pointerover", () => menu.setColor("#cbd5e1"));
        menu.on("pointerout", () => menu.setColor("#94a3b8"));

        retry.on("pointerdown", () => this.retry(mission));
        menu.on("pointerdown", () => (window.location.href = "/"));

        this.input.keyboard.on("keydown-R", () => this.retry(mission));
        this.input.keyboard.on("keydown-M", () => (window.location.href = "/"));
    }

    retry(mission) {
        window.location.href = `/game?mission=${mission}`;
    }
}
