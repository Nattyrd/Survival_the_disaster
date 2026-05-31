/**
 * ════════════════════════════════════════════════════════════════════════════════
 * SETTINGS SCENE: AAA UI/UX - CORREGIDO (BUTTON CLASS ALIGNMENT)
 * ════════════════════════════════════════════════════════════════════════════════
 */

class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: "SettingsScene" });
        this.activeCategory = 'AUDIO';
    }

    create() {
        this.manager = this.game.settingsManager;
        this.game.musicManager.stopAll();
        this.game.musicManager.stopCharacterSelectVoices();
        
        this.locale = this.registry.get("locale") || {
            settings: "AJUSTES", vol_master: "Volumen", fullscreen: "Pantalla Completa",
            resolution: "Resolución", show_fps: "FPS", quality: "Calidad", language: "Idioma",
            reset: "RESET", back: "VOLVER", on: "ON", off: "OFF"
        };

        const { width, height } = this.scale;

        // 1. FONDO
        this.createBackground(width, height);

        // 2. PANEL CENTRAL
        this.panelWidth = width * 0.85;
        this.panelHeight = height * 0.8;
        this.createMainPanel(width, height);

        // 3. BARRA LATERAL
        this.createSidebar(width, height);

        // 4. ÁREA DE CONTENIDO
        this.contentContainer = this.add.container(width * 0.35, height * 0.15);
        this.showCategory(this.activeCategory);

        this.input.keyboard.on('keydown-ESC', () => this.volver());
        this.cameras.main.fadeIn(400);
    }

    createBackground(width, height) {
        this.add.rectangle(0, 0, width, height, 0x020617).setOrigin(0);
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x0f172a, 0x0f172a, 0x1e1b4b, 0x1e1b4b, 1);
        graphics.fillRect(0, 0, width, height);
    }

    createMainPanel(width, height) {
        const x = (width - this.panelWidth) / 2;
        const y = (height - this.panelHeight) / 2;
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillRoundedRect(x + 10, y + 10, this.panelWidth, this.panelHeight, 20);
        graphics.fillStyle(0x1e293b, 0.85);
        graphics.lineStyle(2, 0x334155, 1);
        graphics.fillRoundedRect(x, y, this.panelWidth, this.panelHeight, 20);
        graphics.strokeRoundedRect(x, y, this.panelWidth, this.panelHeight, 20);
        graphics.lineStyle(1, 0x334155, 0.5);
        graphics.lineBetween(x + width * 0.22, y + 40, x + width * 0.22, y + this.panelHeight - 40);
    }

    createSidebar(width, height) {
        const x = width * 0.18;
        const startY = height * 0.25;
        const spacing = 100;
        const categories = [
            { id: 'AUDIO', icon: '🔊' },
            { id: 'VIDEO', icon: '🖥️' },
            { id: 'INTERFACE', icon: '🌐' }
        ];

        this.categoryButtons = {};
        categories.forEach((cat, i) => {
            const btn = new Button(this, x, startY + (i * spacing), {
                text: `${cat.icon}  ${cat.id}`, 
                width: 240, height: 60,
                callback: () => this.switchCategory(cat.id)
            });
            this.categoryButtons[cat.id] = btn;
        });

        this.updateSidebarVisuals();

        new Button(this, x, height * 0.75, {
            text: `↺ ${this.locale.reset}`, width: 220, height: 50,
            style: { fill: "#fca5a5", fontSize: "16px" },
            callback: () => this.resetSettings()
        });

        new Button(this, x, height * 0.83, {
            text: `« ${this.locale.back}`, width: 220, height: 50,
            callback: () => this.volver()
        });
    }

    switchCategory(id) {
        if (this.activeCategory === id) return;
        this.playSfx('click');
        this.activeCategory = id;
        this.updateSidebarVisuals();
        this.tweens.add({
            targets: this.contentContainer,
            alpha: 0, x: "-=20", duration: 150,
            onComplete: () => {
                this.showCategory(id);
                this.contentContainer.x += 40;
                this.tweens.add({ targets: this.contentContainer, alpha: 1, x: "-=20", duration: 200 });
            }
        });
    }

    updateSidebarVisuals() {
        Object.keys(this.categoryButtons).forEach(id => {
            const btn = this.categoryButtons[id];
            const isActive = id === this.activeCategory;
            if (btn) {
                btn.setAlpha(isActive ? 1 : 0.6);
                btn.setScale(isActive ? 1.05 : 1);
            }
        });
    }

    showCategory(id) {
        this.contentContainer.removeAll(true);
        const spacing = 85;
        let currentY = 50;
        const titleStyle = { fontFamily: "Arial Black", fontSize: "32px", color: "#38bdf8" };
        this.contentContainer.add(this.add.text(0, 0, id, titleStyle));
        currentY += 80;

        if (id === 'AUDIO') {
            this.addSettingItem(currentY, this.locale.vol_master, 'slider', 'masterVolume');
            this.addSettingItem(currentY + spacing, this.locale.vol_music, 'slider', 'musicVolume');
            this.addSettingItem(currentY + spacing * 2, this.locale.vol_sfx, 'slider', 'sfxVolume', true);
        } else if (id === 'VIDEO') {
            if (this.scale.isFullscreen !== this.manager.settings.fullscreen) {
                this.manager.settings.fullscreen = this.scale.isFullscreen;
            }
            this.addSettingItem(currentY, this.locale.fullscreen, 'toggle', 'fullscreen');
            this.contentContainer.add(this.add.text(0, currentY + spacing, `Resolución: ${GAME_WIDTH}×${GAME_HEIGHT} (escala automática)`, {
                fontFamily: "Arial", fontSize: "18px", color: "#94a3b8"
            }).setOrigin(0, 0.5));
            this.addSettingItem(currentY + spacing * 2, this.locale.quality, 'selector', 'graphicsQuality', ['LOW', 'MEDIUM', 'HIGH'], [this.locale.low, this.locale.med, this.locale.high]);
        } else if (id === 'INTERFACE') {
            this.addSettingItem(currentY, this.locale.show_fps, 'toggle', 'showFPS');
            this.addSettingItem(currentY + spacing, this.locale.language, 'selector', 'language', ['ES', 'EN'], ["Español", "English"], true);
        }
    }

    addSettingItem(y, label, type, key, extra = null, labels = null, reload = false) {
        const itemContainer = this.add.container(0, 0);
        const controlX = 450;
        const style = { fontFamily: "Arial", fontSize: "20px", color: "#cbd5e1" };
        const txtLabel = this.add.text(0, y, label, style).setOrigin(0, 0.5);
        itemContainer.add(txtLabel);

        let control;
        if (type === 'slider') {
            control = this.createModernSlider(controlX, y, key, extra);
        } else if (type === 'toggle') {
            control = this.createModernToggle(controlX, y, key);
        } else if (type === 'selector') {
            control = this.createModernSelector(controlX, y, key, extra, labels, reload);
        }

        if (control) itemContainer.add(control);
        this.contentContainer.add(itemContainer);
        return itemContainer;
    }

    createModernSlider(x, y, key, isSfx) {
        const container = this.add.container(x, y);
        const width = 250;
        const val = this.manager.settings[key];

        const track = this.add.graphics();
        track.fillStyle(0x334155, 1);
        track.fillRoundedRect(-width/2, -5, width, 10, 5);
        
        const progress = this.add.graphics();
        const updateProgress = (v) => {
            progress.clear();
            progress.fillStyle(0x38bdf8, 1);
            progress.fillRoundedRect(-width/2, -5, width * (v/100), 10, 5);
        };
        updateProgress(val);

        const txt = this.add.text(width/2 + 60, 0, `${val}%`, { fontSize: "18px", color: "#38bdf8", fontStyle: "bold" }).setOrigin(0.5);

        const btnMinus = new Button(this, -width/2 - 40, 0, { text: "-", width: 35, height: 35, callback: () => {
            const nv = Phaser.Math.Clamp(this.manager.settings[key] - 5, 0, 100);
            this.manager.updateSetting(key, nv);
            updateProgress(nv);
            txt.setText(`${nv}%`);
            if (isSfx) this.manager.audio.playTestSfx();
        }});

        const btnPlus = new Button(this, width/2 + 20, 0, { text: "+", width: 35, height: 35, callback: () => {
            const nv = Phaser.Math.Clamp(this.manager.settings[key] + 5, 0, 100);
            this.manager.updateSetting(key, nv);
            updateProgress(nv);
            txt.setText(`${nv}%`);
            if (isSfx) this.manager.audio.playTestSfx();
        }});

        container.add([track, progress, txt, btnMinus, btnPlus]);
        return container;
    }

    createModernToggle(x, y, key) {
        const val = this.manager.settings[key];
        const btn = new Button(this, x, y, {
            text: val ? this.locale.on : this.locale.off,
            width: 180, height: 45,
            callback: () => {
                const nv = !this.manager.settings[key];
                this.manager.updateSetting(key, nv);
                btn.setText(nv ? this.locale.on : this.locale.off);
                this.playSfx('click');
                if (key === "fullscreen") {
                    ScaleManager.applyFullscreen(this.game, nv);
                }
            }
        });
        return btn;
    }

    createModernSelector(x, y, key, options, labels = null, reload = false) {
        const container = this.add.container(x, y);
        const val = this.manager.settings[key];
        const getLabel = (v) => labels ? labels[options.indexOf(v)] : v;
        const txt = this.add.text(0, 0, getLabel(val), { fontSize: "20px", color: "#fbbf24", fontStyle: "bold" }).setOrigin(0.5);

        const btnPrev = new Button(this, -120, 0, { text: "◀", width: 40, height: 40, callback: () => {
            let idx = options.indexOf(this.manager.settings[key]) - 1;
            if (idx < 0) idx = options.length - 1;
            this.manager.updateSetting(key, options[idx]);
            txt.setText(getLabel(options[idx]));
            if (reload) this.scene.restart();
        }});

        const btnNext = new Button(this, 120, 0, { text: "▶", width: 40, height: 40, callback: () => {
            let idx = options.indexOf(this.manager.settings[key]) + 1;
            if (idx >= options.length) idx = 0;
            this.manager.updateSetting(key, options[idx]);
            txt.setText(getLabel(options[idx]));
            if (reload) this.scene.restart();
        }});

        container.add([txt, btnPrev, btnNext]);
        return container;
    }

    resetSettings() {
        this.playSfx('click');
        this.manager.resetToDefaults();
        this.scene.restart();
    }

    volver() {
        this.playSfx('click');
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => this.scene.start('MenuScene'));
    }

    playSfx(type) {
        const settings = this.manager.settings;
        const vol = (settings.sfxVolume / 100) * (settings.masterVolume / 100);
        if (type === "click" && this.cache.audio.exists("sfx_player_shoot")) {
            this.sound.play("sfx_player_shoot", { volume: vol * 0.12 });
        }
    }
}
