/**
 * Gestor central de música de fondo.
 * Garantiza que solo una pista musical esté activa a la vez.
 */
class MusicManager {
  static MUSIC_KEYS = new Set([
    "introMusic",
    "menuMusic",
    "selectMusic",
    "cinematicMusic",
    "bgm_intro",
    "bgm_intro2",
    "bgm_menu",
    "vn_ambient_1",
  ]);

  static SFX_KEYS = new Set([
    "electrical_buzz",
    "selectSfx",
    "selectDan",
    "explosion",
    "text_type",
  ]);

  constructor(game) {
    this.game = game;
    this.currentKey = null;
    this.currentInstance = null;
    this._instances = new Map();
  }

  getMusicVolume(scale = 0.5) {
    const settings = this.game.settingsManager?.settings;
    const master = (settings?.masterVolume ?? 100) / 100;
    const music = (settings?.musicVolume ?? 100) / 100;
    return master * music * scale;
  }

  isMusicKey(key) {
    if (!key) return false;
    if (MusicManager.SFX_KEYS.has(key)) return false;
    if (MusicManager.MUSIC_KEYS.has(key)) return true;
    const lower = key.toLowerCase();
    if (lower.includes("sfx") || lower.includes("selectdan") || lower.includes("selectsfx")) {
      return false;
    }
    return lower.includes("bgm") || lower.includes("music");
  }

  stopKey(key) {
    const sounds = this.game.sound.sounds;
    if (!sounds) return;
    sounds.forEach((sound) => {
      if (sound.key === key && sound.isPlaying) sound.stop();
    });
  }

  stopAll() {
    MusicManager.MUSIC_KEYS.forEach((key) => this.stopKey(key));

    if (this.game.sound.sounds) {
      this.game.sound.sounds.forEach((sound) => {
        if (sound.isPlaying && this.isMusicKey(sound.key)) sound.stop();
      });
    }

    this.game.sound.getAllPlaying().forEach((sound) => {
      if (this.isMusicKey(sound.key)) sound.stop();
    });

    this._instances.forEach((sound) => {
      if (sound?.isPlaying) sound.stop();
    });

    this.currentKey = null;
    this.currentInstance = null;
  }

  stopCharacterSelectVoices() {
    this.stopKey("selectSfx");
    this.stopKey("selectDan");
  }

  play(key, options = {}) {
    if (!this.game.cache.audio.exists(key)) {
      console.warn(`[MusicManager] Pista no encontrada: ${key}`);
      return null;
    }

    const loop = options.loop !== false;
    const volume =
      options.volume ?? this.getMusicVolume(options.volumeScale ?? 0.5);

    if (this.currentKey === key && this.currentInstance?.isPlaying) {
      this.currentInstance.setVolume(volume);
      return this.currentInstance;
    }

    this.stopAll();

    let sound = this._instances.get(key);
    if (!sound) {
      sound = this.game.sound.add(key, { loop, volume });
      this._instances.set(key, sound);
    } else {
      sound.setLoop(loop);
      sound.setVolume(volume);
    }

    if (!sound.isPlaying) sound.play();
    this.currentKey = key;
    this.currentInstance = sound;
    return sound;
  }

  updateVolume() {
    if (!this.currentInstance?.isPlaying) return;
    this.currentInstance.setVolume(this.getMusicVolume(0.5));
  }
}

if (typeof window !== "undefined") {
  window.MusicManager = MusicManager;
}
