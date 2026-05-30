const GameConfig = {
    type: Phaser.CANVAS, // CAMBIO CRÍTICO: De AUTO (WebGL) a CANVAS (RAM del sistema)
<<<<<<< HEAD
    // Tamaño lógico del juego; combate usa todo este rectángulo (ver constants.js).
=======
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: "game-container",
    backgroundColor: "#1e293b",
    pixelArt: false, // Falso para que las imágenes de la intro se vean suaves (Cine)
    render: {
        desynchronized: true, // Optimización de latencia estilo Aetherion
        antialias: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
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
    // ► Secuencia mejorada: Boot → Intro → Menú → Configuración/Créditos → Preload → Juego → Fin
    scene: [
        BootScene, 
        IntroScene, 
        MenuScene, 
        SettingsScene, 
        CreditsScene, 
        PreloadScene, 
        GameScene, 
        GameOverScene, 
        WinScene
    ]
};
