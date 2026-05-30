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
        this.load.audio('selectMusic', '/assets/audio/seleccionPersonajes.mp3'); // Added for selection
        this.load.image('menuBg', '/assets/menu/ScreenMainGame.png');

        // ► SELECCIÓN DE PERSONAJE BG
        this.load.multiatlas('selectPlayerBG', '/assets/seleccion de personajes/selectPlayer.json', '/assets/seleccion de personajes');

        // ╔════════════════════════════════════════╗
        // ║   OPENING ORIGINAL (RESTAURADO)       ║
        // ╚════════════════════════════════════════╝
        for (let i = 1; i <= 6; i++) {
            const clave = `introParte${i}`;
            const rutaJSON = `/assets/intro/intro_parte${i}.json`;
            this.load.multiatlas(clave, rutaJSON, '/assets/intro');
        }

        // ╔════════════════════════════════════════╗
        // ║   NOVELA VISUAL (PROYECTO AETHERION)  ║
        // ╚════════════════════════════════════════╝
        this.load.json('intro_script', '/assets/intro/intro_script.json');
        
        // Backgrounds VN (Usando tus nombres de archivo reales)
        this.load.image('vn_campus_noche', '/assets/novela/edicioNoche.png');
        this.load.image('vn_vista_u', '/assets/novela/vistaFacultad.png');
        this.load.image('vn_entrada_campus', '/assets/novela/Entrada a la U.png');
        this.load.image('vn_restaurante', '/assets/novela/cafeteria.png');
        this.load.image('vn_interferencias', '/assets/novela/interferencia.png');
        this.load.image('vn_explosion', '/assets/novela/explosion.png');
        this.load.image('vn_cielo_oscuro', '/assets/novela/edicioNoche.png');

        // Characters VN (Usando tus nombres de archivo reales)
        this.load.image('dan_normal', '/assets/novela/calmado.png');
        this.load.image('mika_sentada', '/assets/novela/calmada.png');
        this.load.image('mika_surprise', '/assets/novela/sorprendida.png');
        this.load.image('dan_surprise', '/assets/novela/sorprendido.png');
        this.load.image('student_extra', '/assets/novela/estudiante extra.png');

        // Audio VN
        this.load.audio('vn_ambient_1', '/assets/audio/intro.mp3');
        this.load.audio('explosion', '/assets/bgm/sonidoExplosion.mp3');
        this.load.audio('electrical_buzz', '/assets/audio/intro2.mp3');
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
