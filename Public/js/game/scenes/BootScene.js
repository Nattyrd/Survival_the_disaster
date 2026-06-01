/**
 * BootScene — Primera escena tras cargar Phaser.
 * 1) Precarga audio/imágenes del opening y menú
 * 2) Inicializa SettingsManager, MusicManager, ScaleManager
 * 3) Arranca IntroScene
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: "BootScene" });
    }

    /** FASE 1: Carga ultrarrápida del fondo para mostrarlo de inmediato */
    preload() {
        this.load.image('loading_bg', '/assets/menu/Loading.png');
    }

    create() {
        const { width, height } = this.scale;

        // 1. Mostrar Fondo de Carga
        const bg = this.add.image(width / 2, height / 2, 'loading_bg');
        const scale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(scale).setAlpha(0);
        
        // Entrada suave del fondo
        this.tweens.add({ targets: bg, alpha: 1, duration: 800 });

        // 2. UI de Carga Estilizada
        const barW = 400;
        const barH = 12;
        const barX = width / 2 - barW / 2;
        const barY = height * 0.85;

        // Texto de Título/Estado
        const statusText = this.add.text(width / 2, barY - 45, "INICIALIZANDO SISTEMAS...", {
            fontFamily: "Arial Black", fontSize: "18px", color: "#38bdf8"
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, barY + 35, "0%", {
            fontFamily: "Consolas", fontSize: "16px", color: "#94a3b8"
        }).setOrigin(0.5);

        // Gráficos de la barra
        const progressBox = this.add.graphics();
        const progressBar = this.add.graphics();
        
        progressBox.fillStyle(0x0f172a, 0.7);
        progressBox.lineStyle(2, 0x38bdf8, 0.5);
        progressBox.fillRoundedRect(barX, barY, barW, barH, 6);
        progressBox.strokeRoundedRect(barX, barY, barW, barH, 6);

        // 3. EVENTOS DE CARGA
        this.load.on('progress', (value) => {
            const currentPerc = Math.floor(value * 100);
            percentText.setText(`${currentPerc}%`);
            
            progressBar.clear();
            progressBar.fillStyle(0x38bdf8, 1);
            // Efecto de brillo en la barra
            progressBar.fillRoundedRect(barX + 2, barY + 2, (barW - 4) * value, barH - 4, 4);

            // Textos dinámicos según el progreso
            if (value < 0.3) statusText.setText("CONECTANDO AL NÚCLEO AETHERION...");
            else if (value < 0.6) statusText.setText("SINCRONIZANDO PROTOCOLOS DE AUDIO...");
            else if (value < 0.9) statusText.setText("CARGANDO MEMORIA VISUAL...");
            else statusText.setText("SISTEMA LISTO. BIENVENIDO.");
        });

        this.load.on('complete', () => {
            this.tweens.add({
                targets: [statusText, percentText, progressBox, progressBar],
                alpha: 0,
                duration: 500,
                onComplete: () => this.startIntro()
            });
        });

        // 4. FASE 2: CARGA PESADA (Mantenemos tu lógica funcional de assets)
        this.startHeavyLoading();
    }

    startHeavyLoading() {
        //   CARGA TOTAL para cinematicas
        this.load.audio('introMusic', '/assets/audio/introOpeningCompleto.mp3');
        this.load.audio('menuMusic', '/assets/audio/soundtrackMenu.mp3');
        this.load.audio('selectMusic', '/assets/audio/bgmselectPlayer.mp3');
        this.load.audio('selectDan', '/assets/audio/selectDan.mp3');
        this.load.audio('selectSfx', '/assets/audio/sfxselectPlayer.mp3');
        this.load.audio('cinematicMusic', '/assets/audio/SoundtrackCinematica.mp3');

        // ► SOUNDTRACKS POR MISIÓN (PREPARADOS)
        this.load.audio('bgm_mission1', '/assets/audio/bgmBoss1.mp3'); 
        this.load.audio('bgm_mission2', '/assets/audio/bgmBoss2.mp3');
        this.load.audio('bgm_mission3', '/assets/audio/bgmBoss3.mp3');
        this.load.audio('bgm_wave', '/assets/audio/intro.mp3');
        this.load.audio('bgm_tension', '/assets/audio/bgmTension.mp3');
        this.load.audio('electrical_buzz', '/assets/audio/bgmTension.mp3');

        this.load.image('menuBg', '/assets/menu/ScreenMainGame.png');
        this.load.multiatlas('selectPlayerBG', '/assets/seleccion de personajes/selectPlayer.json', '/assets/seleccion de personajes');

        // Opening
        for (let i = 1; i <= 6; i++) {
            this.load.multiatlas(`introParte${i}`, `/assets/intro/intro_parte${i}.json`, '/assets/intro');
        }

        // Novela Visual
        this.load.json('intro_script', '/assets/intro/intro_script.json');
        this.load.image('vn_campus_noche', '/assets/novela/DiaNormal.png');
        this.load.image('vn_vista_u', '/assets/novela/vidaFutura.png');
        this.load.image('vn_entrada_campus', '/assets/novela/EntrdaUniversidad.jpg');
        this.load.image('vn_restaurante', '/assets/novela/cafeteria.png');
        this.load.image('vn_interferencias', '/assets/novela/interferencia.png');
        this.load.image('vn_explosion', '/assets/novela/explosion.png');
        this.load.image('vn_cielo_oscuro', '/assets/novela/edicioNoche.png');

        this.load.image('dan_normal', '/assets/novela/calmado.png');
        this.load.image('mika_sentada', '/assets/novela/calmada.png');
        this.load.image('mika_surprise', '/assets/novela/sorprendida.png');
        this.load.image('dan_surprise', '/assets/novela/sorprendido.png');
        this.load.image('student_extra', '/assets/novela/estudiante extra.png');

        // Audio VN
        this.load.audio('vn_ambient_1', '/assets/audio/SoundtrackCinematica.mp3');
        this.load.audio('explosion', '/assets/bgm/sonidoExplosion.mp3');

        // Iniciar carga manual (necesario al estar en create)
        this.load.start();
    }

    startIntro() {
        console.log('[BootScene] ► Inicializando Managers');
        this.game.settingsManager = new SettingsManager(this.game);
        this.game.musicManager = new MusicManager(this.game);
        ScaleManager.setup(this.game);
        this.game.settingsManager.graphics.setupScaleListeners();

        this.time.delayedCall(200, () => {
            const sm = this.game.settingsManager;
            if (sm.settings.fullscreen && !this.game.scale.isFullscreen) {
                sm.settings.fullscreen = false;
                sm.saveSettings();
            }
        });

        const params = new URLSearchParams(window.location.search);
        const mission = parseInt(params.get("mission") || "0", 10);
        this.registry.set("mission", mission);
        this.registry.set("totalDamageInflicted", 0);
        this.registry.set("attemptIncomplete", false);

        this.scene.start("IntroScene");
    }
}
