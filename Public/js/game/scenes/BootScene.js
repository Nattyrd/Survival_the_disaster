class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: "BootScene" });
    }

    preload() {
        console.log('[BootScene] ► Iniciando preload()');

        // UI de carga para evitar sensación de pantalla blanca
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        // ╔════════════════════════════════════════╗
        // ║   CARGA TOTAL (Tu código funcional)   ║
        // ╚════════════════════════════════════════╝
        this.load.audio('introMusic', '/assets/audio/intro2.mp3');
        this.load.image('menuBg', '/assets/menu/ScreenMainGame.png');

        for (let i = 1; i <= 6; i++) {
            const clave = `introParte${i}`;
            const rutaJSON = `/assets/intro/intro_parte${i}.json`;
            this.load.multiatlas(clave, rutaJSON, '/assets/intro');
            console.log(`[BootScene] → Cargando: ${clave}`);
        }
    }

    create() {
        console.log('[BootScene] ► Inicializando Boot');

        // ► Leer parámetros de URL (Arquitectura Aetherion)
        const params = new URLSearchParams(window.location.search);
        const mission = parseInt(params.get("mission") || "0", 10);

        // ► Guardar misión en registro global
        this.registry.set("mission", mission);

        console.log(`[BootScene] → Misión detectada: ${mission}`);
        console.log('[BootScene] ✓ Todo cargado. Iniciando IntroScene');
        this.scene.start("IntroScene");
    }
}
