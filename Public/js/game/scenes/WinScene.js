class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: "WinScene" });
    }

    create() {
        const { width, height } = this.scale;
        const mission = this.registry.get("mission") || 1;

        this.cameras.main.setBackgroundColor("#0f172a");

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65)
            .setDepth(0);

        this.add.text(width / 2, height * 0.3, "¡VICTORIA!", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "68px",
            color: "#22c55e",
            stroke: "#14532d",
            strokeThickness: 8
        })
            .setOrigin(0.5)
            .setDepth(10);

        this.add.text(width / 2, height * 0.46, `Misión ${mission} completada`, {
            fontFamily: "Arial, sans-serif",
            fontSize: "26px",
            color: "#e2e8f0"
        })
            .setOrigin(0.5)
            .setDepth(10);

        this.add.text(width / 2, height * 0.54, "Has derrotado al robot jefe", {
            fontFamily: "Arial, sans-serif",
            fontSize: "18px",
            color: "#94a3b8"
        })
            .setOrigin(0.5)
            .setDepth(10);

        const menu = this.add.text(width / 2, height * 0.68, "[ M ]  Menú principal", {
            fontFamily: "Arial, sans-serif",
            fontSize: "22px",
            color: "#38bdf8"
        })
            .setOrigin(0.5)
            .setDepth(10)
            .setInteractive({ useHandCursor: true });

        menu.on("pointerover", () => menu.setColor("#7dd3fc"));
        menu.on("pointerout", () => menu.setColor("#38bdf8"));
        menu.on("pointerdown", () => (window.location.href = "/"));
        this.input.keyboard.on("keydown-M", () => (window.location.href = "/"));
    }
}
