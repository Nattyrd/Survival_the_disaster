/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA DE INTRODUCCIÓN - REPLICACIÓN DE LÓGICA FUNCIONAL
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
    console.log('[IntroScene] → Iniciando create() con tu lógica funcional');
    this.cameras.main.setBackgroundColor('#000000');
    this.parteActual = 0;
    this.transitioning = false;

    // 1. Audio (Sincronización inmediata como en tu código)
    try {
        this.introMusic = this.sound.add('introMusic', { volume: 0.5, loop: false });
        this.introMusic.play();
        console.log('[IntroScene] ♫ Música iniciada');
    } catch (e) { console.error("Error Audio:", e); }

    // 2. Sprite principal: escala la intro nativa al mundo lógico sin deformar
    const introScale = Math.min(
      GAME_WIDTH / INTRO_NATIVE_WIDTH,
      GAME_HEIGHT / INTRO_NATIVE_HEIGHT,
    );
    this.spriteIntro = this.add
      .sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, "introParte1")
      .setDisplaySize(
        INTRO_NATIVE_WIDTH * introScale,
        INTRO_NATIVE_HEIGHT * introScale,
      )
      .setDepth(1000);

    // 3. Crear TODAS las animaciones (Tu lógica, pero con un pequeño delay para evitar crash)
    console.log('[IntroScene] → Creando animaciones...');
    this.secuenciaPartes.forEach((parte, index) => {
        // Usamos un pequeño delay entre creaciones para que el OpenGL no se sature
        this.time.delayedCall(index * 50, () => {
            GestorAnimaciones.crearAnimacionFotogramas(this, parte.clave, parte.animacion, 24);
            
            // Si es la primera, la lanzamos ya
            if (index === 0) {
                this.reproducirSiguienteParte();
            }
        });
    });

    this.crearUITextoSalto();

    this.input.keyboard.on('keydown-ENTER', () => this.irAlMenu());
  }

  reproducirSiguienteParte() {
    if (this.parteActual >= this.secuenciaPartes.length) {
      this.irAlMenu();
      return;
    }

    const parte = this.secuenciaPartes[this.parteActual];
    
    // Validar que la animación ya se haya creado (por el delay de seguridad)
    if (!this.anims.exists(parte.animacion)) {
        this.time.delayedCall(50, () => this.reproducirSiguienteParte());
        return;
    }

    this.spriteIntro.setTexture(parte.clave);
    GestorAnimaciones.reproducirAnimacion(this.spriteIntro, parte.animacion, () => {
        console.log(`[IntroScene] ✓ Parte ${this.parteActual + 1} completada`);
        this.parteActual++;
        this.reproducirSiguienteParte();
    });
  }

  crearUITextoSalto() {
    const margenInferior = Math.max(48, Math.round(GAME_HEIGHT * 0.06));
    const texto = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - margenInferior,
        "PRESIONA ENTER PARA SALTAR",
        { fontSize: "20px", color: "#ffffff" },
      )
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

  irAlMenu() {
    if (this.transitioning) return;
    this.transitioning = true;
    if (this.introMusic) this.introMusic.stop();
    this.cameras.main.fadeOut(1000);
    this.time.delayedCall(1000, () => {
        this.scene.start('MenuScene');
    });
  }
}
