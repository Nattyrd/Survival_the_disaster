/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: AETHERION CINEMA (VN ENGINE)
 * ════════════════════════════════════════════════════════════════════════════════
 */

class AetherionCinema extends Phaser.Scene {
  constructor() {
    super({ key: "AetherionCinema" });
    this.currentSceneIdx = 0;
    this.currentStepIdx = 0;
    this.isTyping = false;
    this.activeCharacters = new Map();
  }

  create() {
    console.log('[AetherionCinema] → Iniciando Motor de Novela Visual');
    
    this.layerBG = this.add.container(0, 0);
    this.layerChars = this.add.container(0, 0);
    this.ui = new DialogueBox(this, GAME_WIDTH / 2, GAME_HEIGHT - 120);

    // Carga de Guion
    this.scriptData = this.cache.json.get('intro_script');
    if (!this.scriptData) {
      console.warn("[AetherionCinema] No se encontró intro_script.json, usando guion de emergencia.");
      this.scriptData = this.createEmergencyScript();
    }

    this.input.keyboard.on('keydown-SPACE', () => this.handleInteraction());
    this.input.keyboard.on('keydown-ENTER', () => this.handleInteraction());
    this.input.on('pointerdown', () => this.handleInteraction());

    this.startScene(0);
  }

  createEmergencyScript() {
    return {
      scenes: [{
        background: 'cine_bg_city',
        steps: [
          { speaker: "Narrador", text: "El mundo ha cambiado... pero Dan sigue en pie." },
          { char: "char_dan_norm", action: "enter", position: "center", text: "Dan: No permitiré que el desastre gane." }
        ]
      }]
    };
  }

  handleInteraction() {
    if (this.isTyping) {
      const scene = this.scriptData.scenes[this.currentSceneIdx];
      const step = scene.steps[this.currentStepIdx];
      this.ui.skipTyping(step.text);
      this.isTyping = false;
    } else {
      this.nextStep();
    }
  }

  startScene(idx) {
    this.currentSceneIdx = idx;
    this.currentStepIdx = 0;
    const scene = this.scriptData.scenes[idx];

    if (scene.background) this.changeBackground(scene.background);
    if (scene.music) this.playMusic(scene.music);

    this.playStep(scene.steps[0]);
  }

  changeBackground(key) {
    const oldBG = this.layerBG.list[0];
    const newBG = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, key)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setAlpha(0);

    this.layerBG.add(newBG);

    this.tweens.add({
      targets: newBG,
      alpha: 1,
      duration: 1000,
      onComplete: () => { if (oldBG) oldBG.destroy(); }
    });
  }

  playStep(step) {
    this.isTyping = true;

    // ► GESTIÓN DE PERSONAJES
    if (step.action === "enter") {
      this.characterEnter(step);
    } else if (step.action === "exit") {
      this.characterExit(step.char);
    } else if (step.action === "clear_chars") {
      this.clearCharacters();
    }

    // Efectos
    if (step.effect === "shake") this.cameras.main.shake(500, 0.01);
    if (step.effect === "flash") this.cameras.main.flash(500);
    if (step.effect === "fade_out") this.cameras.main.fadeOut(2000);

    // Sonidos
    if (step.sound) this.sound.play(step.sound);

    // Mostrar Texto
    this.ui.displayDialogue(step.speaker || "", step.text, () => {
      this.isTyping = false;
    });
  }

  /**
   * Permite posicionar personajes usando 'left', 'right', 'center' 
   * o coordenadas exactas x, y.
   */
  characterEnter(step) {
    const key = step.char;
    if (!this.textures.exists(key)) return;

    // Eliminar si ya existe para evitar duplicados
    if (this.activeCharacters.has(key)) {
      this.activeCharacters.get(key).destroy();
    }

    const xPos = step.x !== undefined ? step.x : this.getPosX(step.position);
    const yPos = step.y !== undefined ? step.y : GAME_HEIGHT;
    
    const char = this.add.sprite(xPos, yPos + 300, key).setOrigin(0.5, 1);
    
    // Escala personalizada o defecto 1.0 (Dan y Mika son grandes)
    char.setScale(step.scale || 1.2);

    this.layerChars.add(char);
    this.activeCharacters.set(key, char);

    this.tweens.add({
      targets: char,
      y: yPos,
      duration: 600,
      ease: 'Power2.easeOut'
    });
  }

  characterExit(key) {
    const char = this.activeCharacters.get(key);
    if (char) {
      this.tweens.add({
        targets: char,
        y: GAME_HEIGHT + 300,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          char.destroy();
          this.activeCharacters.delete(key);
        }
      });
    }
  }

  clearCharacters() {
    this.activeCharacters.forEach(char => {
      this.tweens.add({
        targets: char,
        alpha: 0,
        duration: 500,
        onComplete: () => char.destroy()
      });
    });
    this.activeCharacters.clear();
  }

  getPosX(pos) {
    switch(pos) {
      case 'left': return GAME_WIDTH * 0.25;
      case 'right': return GAME_WIDTH * 0.75;
      default: return GAME_WIDTH * 0.5;
    }
  }

  nextStep() {
    const scene = this.scriptData.scenes[this.currentSceneIdx];
    this.currentStepIdx++;

    if (this.currentStepIdx < scene.steps.length) {
      this.playStep(scene.steps[this.currentStepIdx]);
    } else {
      const nextIdx = this.currentSceneIdx + 1;
      if (nextIdx < this.scriptData.scenes.length) {
        this.startScene(nextIdx);
      } else {
        this.finishCinema();
      }
    }
  }

  playMusic(key) {
    if (this.currentMusic) this.currentMusic.stop();
    if (this.cache.audio.exists(key)) {
      this.currentMusic = this.sound.add(key, { loop: true, volume: 0.4 });
      this.currentMusic.play();
    }
  }

  finishCinema() {
    console.log('[AetherionCinema] → Fin de cinemática');
    if (this.currentMusic) this.currentMusic.stop();
    
    this.cameras.main.fadeOut(1000);
    this.time.delayedCall(1000, () => {
      this.scene.start("PreloadScene");
    });
  }
}
