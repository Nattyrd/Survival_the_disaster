class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: "BootScene" });
    }

    create() {
        const params = new URLSearchParams(window.location.search);
        const mission = parseInt(params.get("mission") || "0", 10);

        this.registry.set("mission", mission);
        this.scene.start("PreloadScene");
    }
}
