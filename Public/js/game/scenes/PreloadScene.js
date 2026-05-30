class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    const mission = this.registry.get("mission") || 0;
    const { width, height } = this.scale;

    console.log(`[PreloadScene] Loading mission: ${mission}`);

    const bar = this.add.graphics();
    const box = this.add.graphics();
    box.fillStyle(0x222222, 0.8);
    box.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(
      width / 2,
      height / 2 - 50,
      "Cargando...",
      {
        font: "20px Arial",
        fill: "#ffffff",
      },
    );
    loadingText.setOrigin(0.5, 0.5);

    // Guardar referencias para limpiar en create
    this.loadingBar = bar;
    this.loadingBox = box;
    this.loadingText = loadingText;

    this.load.on("progress", (value) => {
      bar.clear();
      bar.fillStyle(0x38bdf8, 1);
      bar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on("complete", () => {
      console.log(`[PreloadScene] Load complete for mission: ${mission}`);
      console.log(
        `[PreloadScene] Audio cache size:`,
        Object.keys(this.cache.audio.entries).length,
      );
    });

    this.load.on("error", (file) => {
      console.warn(`[PreloadScene] Load error for file:`, file.key, file.url);
    });

    if (mission === 0) {
      console.log(`[PreloadScene] Loading hero only`);
      EntityLoader.preload(this, ENTITY_MANIFESTS.hero);
      return;
    }

    console.log(
      `[PreloadScene] Loading mission manifests for mission ${mission}`,
    );
    EntityLoader.preloadMission(this, mission);

    // Cargar sonidos para Mission 1 y 2
    console.log(`[PreloadScene] Queuing audio files for mission ${mission}`);
    try {
      if (!this.cache.audio.exists("sfx_player_shoot")) {
        this.load.audio(
          "sfx_player_shoot",
          "/assets/sprites/disparo_jugador.mp3",
        );
      }
      if (!this.cache.audio.exists("sfx_player_steps")) {
        this.load.audio(
          "sfx_player_steps",
          "/assets/sprites/pasos_jugador.mp3",
        );
      }

      if (mission === 1) {
        if (!this.cache.audio.exists("sfx_boss_shoot")) {
          this.load.audio(
            "sfx_boss_shoot",
            "/assets/sprites/disparo_boss2.mp3",
          );
        }
        if (!this.cache.audio.exists("sfx_boss_steps")) {
          this.load.audio("sfx_boss_steps", "/assets/sprites/pasos_boss.mp3");
        }
      } else if (mission === 2) {
        if (!this.cache.audio.exists("sfx_boss3_shoot")) {
          this.load.audio(
            "sfx_boss3_shoot",
            "/assets/sprites/disparo_boss2.mp3",
          );
        }
        if (!this.cache.audio.exists("sfx_boss3_steps")) {
          this.load.audio("sfx_boss3_steps", "/assets/sprites/pasos_boss.mp3");
        }
      } else if (mission === 3) {
        if (!this.cache.audio.exists("sfx_boss2_shoot")) {
          this.load.audio(
            "sfx_boss2_shoot",
            "/assets/sprites/disparo_boss2.mp3",
          );
        }
        if (!this.cache.audio.exists("sfx_boss2_steps")) {
          this.load.audio("sfx_boss2_steps", "/assets/sprites/pasos_boss.mp3");
        }
      }
      console.log(`[PreloadScene] Audio files queued for mission ${mission}`);
    } catch (e) {
      console.error("[PreloadScene] Error queuing audio:", e);
    }
  }

  create() {
    const mission = this.registry.get("mission") || 0;

    // Limpiar elementos de carga si existen
    if (this.loadingBar) {
      this.loadingBar.destroy();
      this.loadingBar = null;
    }
    if (this.loadingBox) {
      this.loadingBox.destroy();
      this.loadingBox = null;
    }
    if (this.loadingText) {
      this.loadingText.destroy();
      this.loadingText = null;
    }

    console.log(`[PreloadScene] create() called for mission ${mission}`);

    if (mission === 0) {
      EntityLoader.applyPixelFilters(this, ENTITY_MANIFESTS.hero);
    } else {
      EntityLoader.applyMissionFilters(this, mission);
    }

    console.log(`[PreloadScene] Applying filters and starting GameScene`);

    // Dar un frame de delay para asegurar que todo está cargado
    this.time.delayedCall(100, () => {
      this.scene.start("GameScene");
    });
  }
}
