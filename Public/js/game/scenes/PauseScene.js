/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: PAUSA (MENU OVERLAY) - VERSIÓN MEJORADA CON SLOTS DE GUARDADO
 * ════════════════════════════════════════════════════════════════════════════════
 */

class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: "PauseScene" });
    }

    init(data) {
        this.parentScene = data.parentScene;
        this.fromMenu = data.fromMenu || false;
        this.isMuted = this.sound.mute;
    }

    create() {
        const { width, height } = this.scale;

        // ► Fondo oscurecido total
        this.add.rectangle(0, 0, width, height, 0x000000, 0.75).setOrigin(0);

        // ► Contenedores
        this.menuContainer = this.add.container(0, 0);
        this.saveContainer = this.add.container(0, 0).setVisible(false);

        if (this.fromMenu) {
            this.showSaveSlots();
        } else {
            this.createMainMenu(width, height);
        }

        this.createSaveSlotsMenu(width, height);

        this.input.keyboard.on("keydown-ESC", () => {
            if (this.saveContainer.visible) {
                if (this.fromMenu) this.scene.stop();
                else this.showMainMenu();
            } else if (!this.fromMenu) {
                this.resumeGame();
            }
        });
    }

    createMainMenu(width, height) {
        const menuHeight = Math.min(650, height * 0.9);
        const menuWidth = 550;
        const x = width / 2;
        const y = height / 2;
        const panelTop = y - menuHeight / 2;
        const panelBottom = y + menuHeight / 2;

        this.menuContainer.removeAll(true);

        const bg = this.add.rectangle(x, y, menuWidth, menuHeight, 0x0f172a, 1)
            .setStrokeStyle(4, 0x38bdf8);

        const title = this.add.text(x, panelTop + 45, "PAUSA", {
            fontFamily: "Arial Black", fontSize: "36px", color: "#38bdf8",
            stroke: "#1e293b", strokeThickness: 6
        }).setOrigin(0.5);

        const audioStartY = panelTop + 105;
        this.createVolumeControl(x, audioStartY, "Música", "musicVolume");
        this.createVolumeControl(x, audioStartY + 58, "Efectos", "sfxVolume");

        this.muteBtn = new Button(this, x, audioStartY + 118, {
            text: this.isMuted ? "🔇 Sonido Desactivado" : "🔊 Sonido Activado",
            width: 320, height: 45, fontSize: "18px", callback: () => this.toggleMute()
        });

        const btnHeight = 50;
        const spacing = 54;
        const btnCount = 4;
        const buttonsBlockHeight = btnHeight + spacing * (btnCount - 1);
        const muteBottom = audioStartY + 118 + btnHeight / 2;
        const remainingTop = muteBottom + 24;
        const remainingBottom = panelBottom - 28;
        const firstBtnY = remainingTop + (remainingBottom - remainingTop - buttonsBlockHeight) / 2 + btnHeight / 2;

        const btnContinuar = new Button(this, x, firstBtnY, {
            text: "Continuar Partida", width: 380, height: 50, fontSize: "20px", callback: () => this.resumeGame()
        });

        const btnGuardar = new Button(this, x, firstBtnY + spacing, {
            text: "Guardar / Ranuras", width: 380, height: 50, fontSize: "20px", callback: () => this.showSaveSlots()
        });

        const btnReiniciar = new Button(this, x, firstBtnY + spacing * 2, {
            text: "Reiniciar Nivel", width: 380, height: 50, fontSize: "20px", callback: () => this.confirmAction("restart")
        });

        const btnSalir = new Button(this, x, firstBtnY + spacing * 3, {
            text: "Salir al Menú", width: 380, height: 50, fontSize: "20px", callback: () => this.confirmAction("exit")
        });

        this.menuContainer.add([bg, title, this.muteBtn, btnContinuar, btnGuardar, btnReiniciar, btnSalir]);
    }

    createSaveSlotsMenu(width, height) {
        const x = width / 2;
        const y = height / 2;
        const menuWidth = 650;
        const menuHeight = 600;
        const panelTop = y - menuHeight / 2;
        const panelBottom = y + menuHeight / 2;

        this.saveContainer.removeAll(true);

        const bg = this.add.rectangle(x, y, menuWidth, menuHeight, 0x0f172a, 1)
            .setStrokeStyle(4, this.fromMenu ? 0x38bdf8 : 0x22c55e);

        const titleText = this.fromMenu ? "CARGAR PARTIDA" : "GUARDAR EN RANURA";
        const title = this.add.text(x, panelTop + 45, titleText, {
            fontFamily: "Arial Black", fontSize: "32px", color: this.fromMenu ? "#38bdf8" : "#22c55e"
        }).setOrigin(0.5);

        this.saveContainer.add([bg, title]);

        const slotHeight = 105;
        const slotSpacing = 20;
        const slotsBlockHeight = slotHeight * 3 + slotSpacing * 2;
        const titleBottom = panelTop + 90;
        const backBtnHeight = 50;
        const backMargin = 28;
        const availableHeight = panelBottom - titleBottom - backMargin - backBtnHeight - 20;
        const slotsStartY = titleBottom + (availableHeight - slotsBlockHeight) / 2 + slotHeight / 2;

        for (let i = 1; i <= 3; i++) {
            const slotBtn = this.createSlot(x, slotsStartY + (i - 1) * (slotHeight + slotSpacing), i);
            this.saveContainer.add(slotBtn);
        }

        const btnBack = new Button(this, x, panelBottom - backMargin - backBtnHeight / 2, {
            text: "VOLVER", width: 220, height: 50, callback: () => {
                if (this.fromMenu) this.scene.stop();
                else this.showMainMenu();
            }
        });

        this.saveContainer.add(btnBack);
    }

    createSlot(x, y, id) {
        const slotData = JSON.parse(localStorage.getItem(`save_slot_${id}`)) || null;
        let slotText = `RANURA ${id}: Vacía`;
        
        if (slotData) {
            slotText = `RANURA ${id}: Misión ${slotData.mission} - ${slotData.charName}\n(HP: ${slotData.hp}% | Score: ${slotData.score})`;
        }

        // Retornamos el objeto botón para que el llamador lo agregue al contenedor correcto
        return new Button(this, x, y, {
            text: slotText, width: 580, height: 105, fontSize: "16px",
            callback: () => {
                if (this.fromMenu) {
                    if (slotData) this.loadFromSlot(slotData);
                } else {
                    this.saveToSlot(id);
                }
            }
        });
    }

    loadFromSlot(data) {
        this.registry.set("mission", data.mission);
        this.registry.set("selectedCharacter", data.character);
        this.registry.set("totalDamageInflicted", data.score);
        this.registry.set("savedHP", data.hp); 
        
        const menu = this.scene.get("MenuScene");
        if (menu) menu.scene.stop();
        
        this.scene.start("PreloadScene");
        this.scene.stop();
    }

    createVolumeControl(x, y, label, settingKey) {
        const locale = this.registry.get("locale");
        const manager = this.game.settingsManager;
        const labelTxt = this.add.text(x - 200, y, label, { fontSize: "20px", color: "#ffffff", fontFamily: "Arial Black" }).setOrigin(0, 0.5);
        
        let vol = manager.settings[settingKey];
        
        // ► BARRA VISUAL DE VOLUMEN
        const barBg = this.add.rectangle(x + 20, y, 160, 15, 0x1e293b).setOrigin(0, 0.5).setStrokeStyle(1, 0x38bdf8);
        const barFill = this.add.rectangle(x + 22, y, 156 * (vol / 100), 11, 0x38bdf8).setOrigin(0, 0.5);
        
        const volText = this.add.text(x + 220, y, `${vol}%`, { fontSize: "18px", fontWeight: "bold", color: "#38bdf8" }).setOrigin(0.5);

        const btnMenos = new Button(this, x - 25, y, {
            text: "-", width: 40, height: 40, callback: () => {
                vol = Phaser.Math.Clamp(vol - 10, 0, 100);
                volText.setText(`${vol}%`);
                barFill.setSize(156 * (vol / 100), 11);
                manager.updateSetting(settingKey, vol);
            }
        });

        const btnMas = new Button(this, x + 200, y, {
            text: "+", width: 40, height: 40, callback: () => {
                vol = Phaser.Math.Clamp(vol + 10, 0, 100);
                volText.setText(`${vol}%`);
                barFill.setSize(156 * (vol / 100), 11);
                manager.updateSetting(settingKey, vol);
            }
        });

        this.menuContainer.add([labelTxt, barBg, barFill, volText, btnMenos, btnMas]);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.sound.setMute(this.isMuted);
        this.muteBtn.text.setText(this.isMuted ? "🔇 Sonido Desactivado" : "🔊 Sonido Activado");
    }

    showSaveSlots() {
        this.menuContainer.setVisible(false);
        this.saveContainer.setVisible(true);
        // Refrescar ranuras cada vez que se abre
        this.saveContainer.removeAll(true);
        this.createSaveSlotsMenu(this.scale.width, this.scale.height);
    }

    showMainMenu() {
        this.saveContainer.setVisible(false);
        this.menuContainer.setVisible(true);
    }

    saveToSlot(id) {
        const gameScene = this.scene.get(this.parentScene);
        if (!gameScene || !gameScene.player) return;
        
        const player = gameScene.player;

        const saveData = {
            slot: id,
            mission: this.registry.get("mission"),
            character: this.registry.get("selectedCharacter"),
            charName: player.id === "hero" ? "DAN" : "MIKA",
            hp: Math.ceil(player.hp),
            score: this.registry.get("totalDamageInflicted"),
            date: new Date().toLocaleString()
        };

        localStorage.setItem(`save_slot_${id}`, JSON.stringify(saveData));
        this.showMainMenu();
        
        const feedback = this.add.text(this.scale.width/2, this.scale.height - 100, `¡GUARDADO EN RANURA ${id}!`, {
            fontSize: "26px", color: "#22c55e", fontStyle: "bold", stroke: "#000", strokeThickness: 5
        }).setOrigin(0.5).setDepth(2000);
        this.time.delayedCall(1500, () => feedback.destroy());
    }

    resumeGame() {
        const parent = this.scene.get(this.parentScene);
        if (parent?.touchControls) parent.touchControls.setEnabled(true);
        this.scene.resume(this.parentScene);
        this.scene.stop();
    }

    confirmAction(type) {
        const { width, height } = this.scale;
        const confirmLayer = this.add.container(0, 0).setDepth(2000);
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.92).setOrigin(0);
        
        const msg = type === "restart" ? "¿REINICIAR MISIÓN ACTUAL?" : "¿SALIR AL MENÚ PRINCIPAL?\n(Perderás el progreso no guardado)";
        const txt = this.add.text(width / 2, height / 2 - 80, msg, {
            fontFamily: "Arial Black", fontSize: "26px", color: "#ffffff", align: "center", lineSpacing: 10
        }).setOrigin(0.5);

        const btnY = height / 2 + 80;

        const btnYes = new Button(this, width / 2 - 150, btnY, {
            text: "SÍ, CONFIRMAR", width: 250, height: 60, callback: () => {
                this.game.musicManager.stopAll(true); // Limpieza de audio antes de salir
                this.scene.stop(this.parentScene);
                if (type === "restart") this.scene.start("PreloadScene");
                else this.scene.start("MenuScene");
                this.scene.stop();
            }
        });

        const btnNo = new Button(this, width / 2 + 150, btnY, {
            text: "NO, CANCELAR", width: 250, height: 60, callback: () => confirmLayer.destroy()
        });

        confirmLayer.add([overlay, txt, btnYes, btnNo]);
    }
}
