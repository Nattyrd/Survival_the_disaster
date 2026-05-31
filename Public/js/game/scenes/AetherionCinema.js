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
    this.isFinished = false; // Control para evitar doble transición
  }

  create() {
    console.log("[AetherionCinema] → Iniciando Motor de Novela Visual");
    this.isFinished = false;

    this.game.musicManager.stopAll();

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
          { speaker: "Narrador", text: "El mundo ha cambiado... pero la misión sigue." },
          { speaker: "Sistema", text: "Haz clic para continuar al combate." }
        ]
      }]
    };
  }

  handleInteraction() {
    if (this.isFinished) return;

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
    if (scene.music) {
      this.playMusic(scene.music);
    }

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

  characterEnter(step) {
    const key = step.char;
    if (!this.textures.exists(key)) {
        console.warn(`[AetherionCinema] Texture missing: ${key}`);
        return;
    }

    if (this.activeCharacters.has(key)) {
      this.activeCharacters.get(key).destroy();
    }

    // Prioridad de posicionamiento: 
    // 1. Coordenadas explícitas (step.x, step.y)
    // 2. Palabra clave (step.position: 'left', 'right', 'center', 'closeup')
    const xPos = step.x !== undefined ? step.x : this.getPosX(step.position);

    const layout = this.getCharacterLayout(key, step.position);
    const finalX = step.x !== undefined ? step.x : layout.x !== undefined ? layout.x : xPos;
    const finalY = step.y !== undefined ? step.y : layout.y !== undefined ? layout.y : layout.yDefault;
    const finalScale = step.scale || layout.scale;
    const finalDepth = layout.depth;

    // yPos inicial para el efecto slide-in (desde más abajo)
    const char = this.add.sprite(finalX, finalY + 500, key).setOrigin(0.5, 1);
    char.setScale(finalScale);
    char.setDepth(finalDepth);

    this.layerChars.add(char);
    this.activeCharacters.set(key, char);

    this.tweens.add({
      targets: char,
      y: finalY,
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
      case 'left': return GAME_WIDTH * 0.22;
      case 'right': return GAME_WIDTH * 0.78;
      case 'closeup': return GAME_WIDTH * 0.5;
      case 'center': return GAME_WIDTH * 0.5;
      default: return GAME_WIDTH * 0.5;
    }
  }

  getCharacterLayout(key, position) {
    const baseY = position === 'closeup' ? GAME_HEIGHT - 280 : GAME_HEIGHT - 180;
    const defaultScale = position === 'closeup' ? 1.8 : 1.25;
    const depth = position === 'closeup' ? 3000 : 50;

    const layouts = {
      dan_normal: {
        x: position === 'right' ? GAME_WIDTH * 0.58 : this.getPosX(position),
        y: position === 'closeup' ? GAME_HEIGHT - 300 : GAME_HEIGHT - 210,
        scale: position === 'closeup' ? 2.0 : 1.3,
        depth
      },
      mika_sentada: {
        x: position === 'left' ? GAME_WIDTH * 0.42 : this.getPosX(position),
        y: position === 'closeup' ? GAME_HEIGHT - 300 : GAME_HEIGHT - 220,
        scale: position === 'closeup' ? 1.9 : 1.25,
        depth
      },
      mika_surprise: {
        x: this.getPosX(position),
        y: position === 'closeup' ? GAME_HEIGHT - 300 : GAME_HEIGHT - 210,
        scale: position === 'closeup' ? 1.9 : 1.25,
        depth
      },
      dan_surprise: {
        x: this.getPosX(position),
        y: position === 'closeup' ? GAME_HEIGHT - 300 : GAME_HEIGHT - 210,
        scale: position === 'closeup' ? 2.0 : 1.3,
        depth
      }
    };

    return layouts[key] || {
      x: this.getPosX(position),
      yDefault: baseY,
      scale: defaultScale,
      depth
    };
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
    if (!key) return;
    this.game.musicManager.play(key, { volumeScale: 0.4 });
    this.currentMusic = this.game.musicManager.currentInstance;
  }

  finishCinema() {
    if (this.isFinished) return;
    this.isFinished = true;

    console.log("[AetherionCinema] → Transicionando a PreloadScene");
    this.game.musicManager.stopAll();

    this.cameras.main.fadeOut(800);
    this.time.delayedCall(800, () => {
      this.scene.start("PreloadScene");
    });
  }

  shutdown() {
    this.game.musicManager?.stopAll();
  }
}

window.AetherionCinema = AetherionCinema;
