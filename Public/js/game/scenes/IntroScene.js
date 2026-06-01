/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA DE INTRODUCCIÓN
 * ════════════════════════════════════════════════════════════════════════════════
 */

class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
    this.spriteIntro = null;
    this.introMusic = null;
    this.parteActual = 0;
    this.transitioning = false;
    
    this.secuenciaPartes = [
      { clave: 'introParte1', animacion: 'animIntro1' },
      { clave: 'introParte2', animacion: 'animIntro2' },
      { clave: 'introParte3', animacion: 'animIntro3' },
      { clave: 'introParte4', animacion: 'animIntro4' },
      { clave: 'introParte5', animacion: 'animIntro5' },
      { clave: 'introParte6', animacion: 'animIntro6' }
    ];
  }

  create() {
    console.log('[IntroScene] → Iniciando IntroScene');
    this.cameras.main.setBackgroundColor('#000000');
    this.parteActual = 0;
    this.transitioning = false;

    // 1. Audio
    try {
        this.game.musicManager.play("introMusic", { volumeScale: 0.5 });
        console.log("[IntroScene] ♫ Música iniciada");
    } catch (e) {
        console.error("Error Audio:", e);
    }

    // 2. Sprite Principal
    this.spriteIntro = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'introParte1');
    this.spriteIntro.setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setDepth(1000);

    // 3. Crear animaciones
    console.log('[IntroScene] → Creando animaciones...');
    this.secuenciaPartes.forEach((parte, index) => {
        this.time.delayedCall(index * 50, () => {
            GestorAnimaciones.crearAnimacionFotogramas(this, parte.clave, parte.animacion, 24);
            if (index === 0) {
                this.reproducirSiguienteParte();
            }
        });
    });

    this.crearUITextoSalto();

    this.skipEnabled = false;
    this.time.delayedCall(700, () => {
      this.skipEnabled = true;
    });

    this.input.keyboard.on("keydown-ENTER", () => this.irAlMenu(true));
    this.input.on("pointerdown", () => {
      if (this.skipEnabled) this.irAlMenu(true);
    });
  }

  reproducirSiguienteParte() {
    if (this.parteActual >= this.secuenciaPartes.length) {
      this.parteActual = 0;
    }

    const parte = this.secuenciaPartes[this.parteActual];
    
    if (!this.anims.exists(parte.animacion)) {
        this.time.delayedCall(50, () => this.reproducirSiguienteParte());
        return;
    }

    this.spriteIntro.setTexture(parte.clave);
    GestorAnimaciones.reproducirAnimacion(this.spriteIntro, parte.animacion, () => {
        this.parteActual++;
        this.reproducirSiguienteParte();
    });
  }

  crearUITextoSalto() {
    const hint = TouchControls.shouldUse(this)
      ? "TOCA LA PANTALLA O PULSA ENTER PARA SALTAR"
      : "PRESIONA ENTER PARA SALTAR";
    const texto = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 60, hint, {
        fontSize: "18px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: GAME_WIDTH - 80 },
      })
      .setOrigin(0.5)
      .setDepth(5000);
    this.tweens.add({
      targets: texto,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  irAlMenu(force = false) {
    if (this.transitioning) return;
    if (!force && !this.skipEnabled) return;
    this.transitioning = true;
    this.game.musicManager.stopAll(true); // Limpiar todo antes de ir al menú
    this.cameras.main.fadeOut(1000);
    this.time.delayedCall(1000, () => {
      this.scene.start("MenuScene");
    });
  }

  shutdown() {
    this.game.musicManager?.stopAll();
    this.game.musicManager?.stopKey("introMusic");
  }
}
