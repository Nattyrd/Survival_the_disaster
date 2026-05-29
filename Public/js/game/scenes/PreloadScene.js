class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        const mission = this.registry.get("mission") || 0;
        const { width, height } = this.scale;

        const bar = this.add.graphics();
        const box = this.add.graphics();
        box.fillStyle(0x222222, 0.8);
        box.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, "Cargando...", {
            font: "20px Arial",
            fill: "#ffffff"
        });
        loadingText.setOrigin(0.5, 0.5);

        this.load.on("progress", (value) => {
            bar.clear();
            bar.fillStyle(0x38bdf8, 1);
            bar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on("complete", () => {
            bar.destroy();
            box.destroy();
            loadingText.destroy();
        });

        if (mission === 0) {
            EntityLoader.preload(this, ENTITY_MANIFESTS.hero);
            return;
        }

        EntityLoader.preloadMission(this, mission);
    }

    create() {
        const mission = this.registry.get("mission") || 0;

        if (mission === 0) {
            EntityLoader.applyPixelFilters(this, ENTITY_MANIFESTS.hero);
        } else {
            EntityLoader.applyMissionFilters(this, mission);
        }

        this.scene.start("GameScene");
    }
}
