class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    create() {
        const { width, height } = this.scale;
        this.mission = this.registry.get("mission") || 0;
        this.combatActive = false;
        this.gameEnded = false;

        if (this.mission === 1) {
            this.createMission1(width, height);
            return;
        }

        this.createSandbox(width, height);
    }

    createBackground(key) {
        const { width, height } = this.scale;
        const bg = this.add.image(width / 2, height / 2, key);
        const scale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(scale).setDepth(0);
        return bg;
    }

    createMission1(width, height) {
        this.createBackground("bg_mission1");

        Player.createAnimations(this);
        Boss1.createAnimations(this);

        this.player = new Player(this, width * 0.18, height * 0.55);
        this.player.equipWeaponForMission();

        this.boss = new Boss1(this, width * 0.78, height * 0.42);
        this.combatActive = true;

        this.setupCombatCollisions();
        this.setupInput();

        this.hud = new Hud(this);
        this.hud.update(this.player, this.boss);

        this.events.on("boss-hp-changed", () => {
            if (this.hud) {
                this.hud.update(this.player, this.boss);
            }
        });

        this.events.on("player-hp-changed", () => {
            if (this.hud) {
                this.hud.update(this.player, this.boss);
            }
        });

        this.add.text(16, height - 32, "WASD | ESPACIO | 2 Arma | CLIC DER Disparar | ESC Menú", {
            font: "14px Arial",
            fill: "#e2e8f0"
        }).setScrollFactor(0).setDepth(5000);

        this.createFpsCounter(width);
    }

    createSandbox(width, height) {
        this.add.rectangle(width / 2, height / 2, width, height, 0x1e293b);

        Player.createAnimations(this);
        this.player = new Player(this, width / 2, height / 2);
        this.setupInput();

        this.add.text(16, height - 32, "Modo prueba — Elige una misión en el menú", {
            font: "14px Arial",
            fill: "#94a3b8"
        }).setScrollFactor(0);

        this.createFpsCounter(width);
    }

    setupInput() {
        this.input.mouse.disableContextMenu();

        this.input.on("pointerdown", (pointer) => {
            if (this.gameEnded || !this.player) {
                return;
            }
            if (pointer.rightButtonDown()) {
                this.player.shoot(pointer);
            }
        });

        this.input.keyboard.on("keydown-ESC", () => {
            window.location.href = "/";
        });
    }

    setupCombatCollisions() {
        this.physics.add.overlap(
            this.player.bullets,
            this.boss.sprite,
            (objA, objB) => {
                const bullet = objA?.getData?.("playerBullet")
                    ? objA
                    : objB?.getData?.("playerBullet")
                      ? objB
                      : null;

                if (!bullet || !bullet.active || bullet.getData("hasHit")) {
                    return;
                }

                if (this.boss.dead || this.gameEnded) {
                    return;
                }

                bullet.setData("hasHit", true);
                bullet.setActive(false);
                bullet.setVisible(false);
                bullet.body.stop();
                this.boss.takeDamage(bullet.damage || 8);
                this.hud.update(this.player, this.boss);
            }
        );

        this.physics.add.overlap(
            this.player.sprite,
            this.boss.projectiles,
            (objA, objB) => {
                const proj = objA?.getData?.("bossProjectile")
                    ? objA
                    : objB?.getData?.("bossProjectile")
                      ? objB
                      : null;

                if (!proj || !proj.active || this.gameEnded || this.boss.dead) {
                    return;
                }

                proj.setActive(false);
                proj.setVisible(false);
                proj.body.stop();
                this.player.takeDamage(proj.damage || 15);
                this.hud.update(this.player, this.boss);
            }
        );
    }

    createFpsCounter(width) {
        this.fpsText = this.add.text(width - 12, 10, "— fps", {
            fontFamily: "Consolas, Monaco, monospace",
            fontSize: "11px",
            color: "#475569"
        })
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(5000)
            .setAlpha(0.65);

        this.nextFpsUpdate = 0;
    }

    showEndScreen(sceneKey) {
        this.combatActive = false;
        this.physics.pause();
        this.tweens.killAll();

        if (this.player) {
            this.player.sprite.body.setVelocity(0, 0);
        }
        if (this.boss && !this.boss.dead) {
            this.boss.sprite.body.setVelocity(0, 0);
        }

        this.scene.stop("GameScene");
        this.scene.start(sceneKey);
    }

    onPlayerDefeated() {
        if (this.gameEnded) {
            return;
        }
        this.gameEnded = true;
        this.combatActive = false;
        this.time.delayedCall(350, () => this.showEndScreen("GameOverScene"));
    }

    onBossDefeated() {
        if (this.gameEnded) {
            return;
        }
        this.gameEnded = true;
        this.time.delayedCall(300, () => this.showEndScreen("WinScene"));
    }

    updateFps() {
        if (!this.fpsText || this.time.now < this.nextFpsUpdate) {
            return;
        }
        this.nextFpsUpdate = this.time.now + 300;
        this.fpsText.setText(`${Math.round(this.game.loop.actualFps)} fps`);
    }

    update() {
        this.updateFps();

        if (!this.player) {
            return;
        }

        if (this.gameEnded) {
            return;
        }

        if (this.player.isDying) {
            return;
        }

        if (this.combatActive) {
            this.player.update(this.input.activePointer);
            this.boss.update(this.player);
            this.hud.update(this.player, this.boss);
        } else if (!this.player.isDead) {
            this.player.update(this.input.activePointer);
        }
    }
}
