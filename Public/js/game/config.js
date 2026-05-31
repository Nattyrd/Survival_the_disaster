/**
 * Configuración principal de Phaser.Game.
 * Las escenas se registran aquí en orden de disponibilidad (no de ejecución).
 * La secuencia real la controla BootScene → IntroScene → …
 */
const GameConfig = {
    type: Phaser.CANVAS, // CAMBIO CRÍTICO: De AUTO (WebGL) a CANVAS (RAM del sistema)
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: "game-container",
    backgroundColor: "#1e293b",
    pixelArt: false, // Falso para que las imágenes de la intro se vean suaves (Cine)
    render: {
        desynchronized: true, // Optimización de latencia
        antialias: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        parent: "game-container",
        fullscreenTarget: "game-container",
        expandParent: false,
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    audio: {
        disableWebAudio: false
    },
    // ► Secuencia: Boot → Intro → Menú → AetherionCinema → Configuración/Créditos → Preload → Juego → Fin
    scene: [
        BootScene, 
        IntroScene, 
        MenuScene, 
        AetherionCinema,
        SettingsScene, 
        CreditsScene, 
        PreloadScene, 
        GameScene, 
        GameOverScene, 
        WinScene,
        NameInputScene,
        RankingScene,
        PauseScene
    ]
};
