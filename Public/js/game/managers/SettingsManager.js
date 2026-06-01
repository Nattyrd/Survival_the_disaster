/**
 * ════════════════════════════════════════════════════════════════════════════════
 * SETTINGS SYSTEM: ARQUITECTURA PROFESIONAL
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Clase que representa el modelo de datos de configuración.
 */
class GameSettings {
    constructor() {
        this.masterVolume = 100;
        this.musicVolume = 100;
        this.sfxVolume = 100;
        this.fullscreen = false;
        this.resolution = "1280x720";
        this.showFPS = false;
        this.graphicsQuality = "HIGH"; // LOW, MEDIUM, HIGH
        this.language = "ES"; // ES, EN
    }
}

/**
 * Gestor central de configuración.
 * Sigue el patrón Singleton para acceso global.
 */
class SettingsManager {
    constructor(game) {
        this.game = game;
        this.settings = new GameSettings();
        this.storageKey = 'survival_disaster_settings';
        
        // Inicializar sub-managers
        this.audio = new AudioManager(game);
        this.graphics = new GraphicsManager(game);
        this.language = new LanguageManager(game);
        
        this.loadSettings();
    }

    /**
     * Carga la configuración desde el almacenamiento local.
     */
    loadSettings() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                this.settings = { ...this.settings, ...parsed };
                this.settings.resolution = `${GAME_WIDTH}x${GAME_HEIGHT}`;
                console.log("[SettingsManager] Configuración cargada con éxito.");
            } else {
                console.log("[SettingsManager] No hay configuración previa. Usando defaults.");
                this.saveSettings();
            }
            this.applyAll();
        } catch (e) {
            console.error("[SettingsManager] Error al cargar configuración:", e);
        }
    }

    /**
     * Guarda la configuración actual.
     */
    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            console.log("[SettingsManager] Configuración guardada.");
        } catch (e) {
            console.error("[SettingsManager] Error al guardar configuración:", e);
        }
    }

    /**
     * Aplica todos los ajustes actuales al sistema.
     */
    applyAll() {
        this.audio.apply(this.settings);
        this.graphics.apply(this.settings);
        this.language.apply(this.settings);
        
        // Actualizar registry de Phaser para que las escenas reaccionen
        if (this.game.registry) {
            this.game.registry.set("settings", this.settings);
        }
    }

    /**
     * Restablece los valores predeterminados.
     */
    resetToDefaults() {
        this.settings = new GameSettings();
        this.applyAll();
        this.saveSettings();
    }

    updateSetting(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            this.applyAll();
            this.saveSettings();
        }
    }
}

/**
 * GESTOR DE AUDIO
 */
class AudioManager {
    constructor(game) { this.game = game; }
    apply(settings) {
        const master = settings.masterVolume / 100;
        const music = settings.musicVolume / 100;
        const sfx = settings.sfxVolume / 100;

        this.game.sound.volume = master;
        this.game.registry.set("musicVolume", settings.musicVolume);
        this.game.registry.set("sfxVolume", settings.sfxVolume);

        if (this.game.musicManager) {
            this.game.musicManager.updateVolume();
        }
    }

    playTestSfx() {
        this.game.sound.play('sfx_player_shoot', { volume: 0.5 });
    }
}

/**
 * GESTOR DE GRÁFICOS
 */
class GraphicsManager {
    constructor(game) {
        this.game = game;
        this._scaleListenersReady = false;
    }

    setupScaleListeners() {
        if (this._scaleListenersReady) return;
        this._scaleListenersReady = true;

        const scale = this.game.scale;
        scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, () => {
            const sm = this.game.settingsManager;
            if (!sm || !sm.settings.fullscreen) return;
            sm.settings.fullscreen = false;
            sm.saveSettings();
            ScaleManager.refresh(this.game);
        });

        scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, () => {
            const sm = this.game.settingsManager;
            if (!sm || sm.settings.fullscreen) return;
            sm.settings.fullscreen = true;
            sm.saveSettings();
            ScaleManager.refresh(this.game);
        });
    }

    apply(settings) {
        this.setupScaleListeners();
        // Evitamos llamar a refresh aquí porque ScaleManager ya lo hace al inicio
        // y applyFullscreen ya gestionará el estado si es necesario.
        ScaleManager.applyFullscreen(this.game, settings.fullscreen);

        this.game.registry.set("showFPS", settings.showFPS);
        this.game.registry.set("graphicsQuality", settings.graphicsQuality);
    }
}

/**
 * GESTOR DE IDIOMAS
 */
class LanguageManager {
    constructor(game) { 
        this.game = game;
        this.locales = {
            "ES": {
                "settings": "AJUSTES",
                "vol_master": "Volumen General",
                "vol_music": "Música",
                "vol_sfx": "Efectos de Sonido",
                "fullscreen": "Pantalla Completa",
                "resolution": "Resolución",
                "show_fps": "Mostrar FPS",
                "quality": "Calidad Gráfica",
                "language": "Idioma",
                "apply": "APLICAR",
                "reset": "RESTABLECER",
                "back": "VOLVER",
                "low": "Baja",
                "med": "Media",
                "high": "Alta",
                "on": "Activado",
                "off": "Desactivado"
            },
            "EN": {
                "settings": "SETTINGS",
                "vol_master": "Master Volume",
                "vol_music": "Music",
                "vol_sfx": "Sound Effects",
                "fullscreen": "Fullscreen",
                "resolution": "Resolution",
                "show_fps": "Show FPS",
                "quality": "Graphics Quality",
                "language": "Language",
                "apply": "APPLY",
                "reset": "RESET",
                "back": "BACK",
                "low": "Low",
                "med": "Medium",
                "high": "High",
                "on": "ON",
                "off": "OFF"
            }
        };
    }

    apply(settings) {
        this.current = this.locales[settings.language] || this.locales["ES"];
        this.game.registry.set("locale", this.current);
    }

    get(key) {
        return this.current[key] || key;
    }
}
