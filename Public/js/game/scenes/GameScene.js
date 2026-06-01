/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ESCENA: COMBATE (GameScene)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Lee registry.mission y monta la arena:
 *   1 → initMission(..., Boss1, bg_mission1)  ← Mission1_Boss1.js
 *   2 → initMission(..., Boss3, bg_mission2)  ← Mission2_Boss3.js
 *   3 → initMission(..., Boss2, bg_mission3)  ← Mission3_Boss2.js
 *   "wave" → createWaveMode() — Destroyers infinitos, máx. 5 en pantalla
 *
 * initMission: fondo, música, Player, jefe, HUD, colisiones, tutorial, countdown.
 * combatActive = true activa IA del jefe y daño. Pausa → PauseScene overlay.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    create() {
        const { width, height } = this.scale;
        this.mission = this.registry.get("mission") || 0;
        this.combatActive = false;
        this.gameEnded = false;
        this.startTime = this.time.now;

        console.log(`[GameScene] Iniciando Misión: ${this.mission}`);

        switch (this.mission) {
            case 1:
                this.createMission1(width, height);
                break;
            case 2:
                this.createMission2(width, height);
                break;
            case 3:
                this.createMission3(width, height);
                break;
            case MISSION_WAVE:
                this.createWaveMode(width, height);
                break;
            default:
                this.createSandbox(width, height);
                break;
        }
    }

    createBackground(key) {
        const { width, height } = this.scale;
        if (!this.textures.exists(key)) {
            console.warn(`[GameScene] Background texture missing: ${key}`);
            return this.add.rectangle(width / 2, height / 2, width, height, 0x1e293b);
        }
        const bg = this.add.image(width / 2, height / 2, key);
        const scale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(scale).setDepth(0);
        return bg;
    }

    updateVolumes() {
        this.game.musicManager.updateVolume();
    }

    manageMusic() {
        const mission = this.registry.get("mission") || 1;
        let trackKey = "bgm_mission1";

        if (mission === 2) trackKey = "bgm_mission2";
        else if (mission === 3) trackKey = "bgm_mission3";
        else if (mission === MISSION_WAVE) trackKey = "bgm_wave";

        console.log(`[GameScene] Reproduciendo música de misión: ${trackKey}`);
        this.game.musicManager.play(trackKey, { volumeScale: 0.45 });
    }

    initMission(width, height, bossClass, bgKey) {
        this.isWaveMode = false;
        this.createBackground(bgKey);
        this.manageMusic();
        this.updateVolumes();

        Player.createAnimations(this);
        bossClass.createAnimations(this);

        this.player = new Player(this, width * 0.18, height * 0.55);
        this.player.equipWeaponForMission();

        this.boss = new bossClass(this, width * 0.78, height * 0.42);
        
        this.combatActive = false;
        this.isStarting = true;

        this.setupCombatCollisions();
        this.setupInput();

        this.hud = new Hud(this);
        this.hud.update(this.player, this.boss, 0);

        this.events.on("boss-hp-changed", () => {
            if (this.hud) this.hud.update(this.player, this.boss, this.time.now - (this.startTime || this.time.now));
        });

        this.events.on("player-hp-changed", () => {
            if (this.hud) this.hud.update(this.player, this.boss, this.time.now - (this.startTime || this.time.now));
        });

        this.createFpsCounter(width);

        // ► EVENTO ACTUALIZACIÓN VOLUMEN
        this.registry.events.on('changedata-musicVolume', () => this.updateVolumes());

        this.showTutorial();
    }

    showTutorial() {
        const { width, height } = this.scale;
        this.tutorialLayer = this.add.container(0, 0).setDepth(10000);
        
        const dim = this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);
        const img = this.add.image(width / 2, height / 2, 'guia_tutorial');
        const scale = Math.min((width * 0.8) / img.width, (height * 0.8) / img.height);
        img.setScale(scale);

        const closeX = width / 2 + (img.displayWidth / 2) - 30;
        const closeY = height / 2 - (img.displayHeight / 2) + 30;
        
        const btnClose = new Button(this, closeX, closeY, {
            text: "X", width: 45, height: 45, callback: () => this.startMissionSequence()
        });

        this.tutorialLayer.add([dim, img, btnClose]);
        this.physics.pause();
        if (this.touchControls) this.touchControls.setEnabled(false);
    }

    startMissionSequence() {
        if (this.tutorialLayer) this.tutorialLayer.destroy();
        this.physics.resume();
        if (this.touchControls) this.touchControls.setEnabled(true);

        const { width, height } = this.scale;
        const missionNames = {
            1: "LIMPIA LA ZONA DE ESTE ROBOT",
            2: "DETÉN AL TITÁN MK-3",
            3: "DERROTA AL COMANDANTE ANDRONIMUS",
        };

        const titleText = this.isWaveMode ? "MODO OLEADA" : `MISIÓN ${this.mission}`;
        const goalText = this.isWaveMode
            ? "SOBREVIVE Y ELIMINA TODOS LOS DESTROYERS QUE PUEDAS"
            : missionNames[this.mission] || "OBJETIVO DESCONOCIDO";

        const title = this.add.text(width / 2, height * 0.35, titleText, {
            fontFamily: "Arial Black", fontSize: "70px", color: "#38bdf8", stroke: "#000", strokeThickness: 8
        }).setOrigin(0.5).setAlpha(0).setDepth(9000);

        const goal = this.add.text(width / 2, height * 0.46, goalText, {
            fontFamily: "Arial Black", fontSize: "28px", color: "#ffffff", stroke: "#000", strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0).setDepth(9000);

        this.tweens.add({
            targets: [title, goal],
            alpha: 1,
            y: "-=30",
            duration: 1000,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.time.delayedCall(1500, () => {
                    this.tweens.add({
                        targets: [title, goal],
                        alpha: 0,
                        scale: 1.3,
                        duration: 600,
                        onComplete: () => {
                            title.destroy();
                            goal.destroy();
                            this.startCountdown();
                        }
                    });
                });
            }
        });
    }

    startCountdown() {
        const { width, height } = this.scale;
        const countText = this.add.text(width / 2, height / 2, "3", {
            fontFamily: "Arial Black", fontSize: "120px", color: "#fbbf24", stroke: "#000", strokeThickness: 10
        }).setOrigin(0.5).setDepth(9000);

        let count = 3;
        const timer = this.time.addEvent({
            delay: 1000,
            repeat: 3,
            callback: () => {
                count--;
                if (count > 0) {
                    countText.setText(count);
                    this.tweens.add({ targets: countText, scale: { from: 1.5, to: 1 }, duration: 200 });
                } else if (count === 0) {
                    countText.setText("¡GO!");
                    countText.setColor("#22c55e");
                    this.startTime = this.time.now; // El timer real empieza aquí
                    this.combatActive = true;
                    this.isStarting = false;
                    if (this.isWaveMode) {
                        this.startWaveSpawning();
                    }
                    this.time.delayedCall(800, () => countText.destroy());
                }
            }
        });
    }

    /** Modo Oleada — Destroyers infinitos sobre Background1 (bg_mission1). */
    createWaveMode(width, height) {
        this.isWaveMode = true;
        this.enemies = [];
        this.enemiesKilled = 0;
        this.waveScore = 0;
        this.maxEnemiesOnScreen = WAVE_MAX_ENEMIES;
        this.boss = null;

        this.createBackground("bg_mission1");
        this.registry.set("totalDamageInflicted", 0);
        this.registry.set("waveKills", 0);
        this.manageMusic();
        this.updateVolumes();

        Player.createAnimations(this);
        Destroyer.createAnimations(this);

        this.player = new Player(this, width * 0.18, height * 0.55);
        this.player.equipWeaponForMission();

        this.combatActive = false;
        this.isStarting = true;

        this.setupInput();

        this.hud = new Hud(this);
        this.hud.update(this.player, null, 0, this.getWaveHudInfo());

        this.events.on("player-hp-changed", () => {
            if (this.hud) {
                this.hud.update(
                    this.player,
                    null,
                    this.time.now - (this.startTime || this.time.now),
                    this.getWaveHudInfo(),
                );
            }
        });

        this.registry.events.on("changedata-musicVolume", () => this.updateVolumes());
        this.createFpsCounter(width);
        this.showTutorial();
    }

    getWaveHudInfo() {
        return {
            alive: this.getActiveEnemyCount(),
            max: this.maxEnemiesOnScreen,
            kills: this.enemiesKilled,
            score: this.waveScore,
        };
    }

    getActiveEnemyCount() {
        if (!this.enemies) return 0;
        return this.enemies.filter((e) => e && !e.dead && e.sprite?.active).length;
    }

    startWaveSpawning() {
        for (let i = 0; i < 3; i++) {
            this.time.delayedCall(i * 700, () => this.trySpawnEnemy());
        }

        this.waveSpawnTimer = this.time.addEvent({
            delay: 2200,
            loop: true,
            callback: () => this.trySpawnEnemy(),
        });
    }

    trySpawnEnemy() {
        if (!this.isWaveMode || !this.combatActive || this.gameEnded) return;
        while (this.getActiveEnemyCount() < this.maxEnemiesOnScreen) {
            this.spawnDestroyer();
        }
    }

    pickSpawnPoint() {
        const { width, height } = this.scale;
        const margin = 90;
        const px = this.player?.sprite?.x ?? width * 0.5;
        const py = this.player?.sprite?.y ?? height * 0.5;
        const minDist = 220;

        for (let i = 0; i < 12; i++) {
            const edge = Phaser.Math.Between(0, 3);
            let x;
            let y;
            if (edge === 0) {
                x = Phaser.Math.Between(margin, width - margin);
                y = margin;
            } else if (edge === 1) {
                x = width - margin;
                y = Phaser.Math.Between(margin, height - margin);
            } else if (edge === 2) {
                x = Phaser.Math.Between(margin, width - margin);
                y = height - margin;
            } else {
                x = margin;
                y = Phaser.Math.Between(margin, height - margin);
            }

            if (Phaser.Math.Distance.Between(x, y, px, py) >= minDist) {
                return { x, y };
            }
        }

        return { x: width * 0.82, y: height * 0.45 };
    }

    spawnDestroyer() {
        const { x, y } = this.pickSpawnPoint();
        const enemy = new Destroyer(this, x, y);
        this.enemies.push(enemy);
        this.registerEnemyCollisions(enemy);
    }

    registerEnemyCollisions(enemy) {
        this.physics.add.overlap(this.player.sprite, enemy.sprite, () => {
            if (!enemy.dead && !this.player.isInvulnerable && !this.gameEnded) {
                this.player.takeDamage(8);
            }
        });

        this.physics.add.overlap(this.player.bullets, enemy.sprite, (objA, objB) => {
            const bullet = objA?.getData?.("playerBullet")
                ? objA
                : objB?.getData?.("playerBullet")
                  ? objB
                  : null;
            if (!bullet || !bullet.active || bullet.getData("hasHit")) return;
            if (enemy.dead || this.gameEnded) return;

            bullet.setData("hasHit", true);
            bullet.setActive(false).setVisible(false);
            bullet.body.stop();

            enemy.takeDamage(bullet.damage || 8);
        });

        this.physics.add.overlap(this.player.sprite, enemy.projectiles, (objA, objB) => {
            const proj = objA?.getData?.("enemyProjectile")
                ? objA
                : objB?.getData?.("enemyProjectile")
                  ? objB
                  : null;
            if (!proj || !proj.active || this.gameEnded || enemy.dead) return;

            proj.setActive(false).setVisible(false);
            proj.body.stop();
            this.player.takeDamage(proj.damage || 12);
        });
    }

    onEnemyDefeated(destroyer) {
        if (!this.isWaveMode || this.gameEnded || !destroyer) return;

        this.enemiesKilled += 1;
        const killPoints =
            WAVE_SCORE_BASE + (this.enemiesKilled - 1) * WAVE_SCORE_BONUS_PER_KILL;
        this.waveScore += killPoints;
        this.registry.set("totalDamageInflicted", this.waveScore);
        this.registry.set("waveKills", this.enemiesKilled);

        const idx = this.enemies.indexOf(destroyer);
        if (idx >= 0) this.enemies.splice(idx, 1);

        if (destroyer.sprite?.active) {
            destroyer.sprite.destroy();
        }
        destroyer.projectiles?.getChildren?.().forEach((p) => {
            p.setActive(false).setVisible(false);
        });

        if (this.hud && this.player) {
            this.hud.update(
                this.player,
                null,
                this.time.now - (this.startTime || this.time.now),
                this.getWaveHudInfo(),
            );
        }

        this.time.delayedCall(400, () => this.trySpawnEnemy());
    }

    /** Misión 1 — Robot Jefe (archivo: Mission1_Boss1.js, clase: Boss1) */
    createMission1(width, height) {
        this.isWaveMode = false;
        this.initMission(width, height, Boss1, "bg_mission1");
    }

    /** Misión 2 — Titán MK-3 (archivo: Mission2_Boss3.js, clase: Boss3) */
    createMission2(width, height) {
        this.isWaveMode = false;
        this.initMission(width, height, Boss3, "bg_mission2");
    }

    /** Misión 3 — Andronimus (archivo: Mission3_Boss2.js, clase: Boss2) */
    createMission3(width, height) {
        this.isWaveMode = false;
        this.initMission(width, height, Boss2, "bg_mission3");
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

        if (TouchControls.shouldUse(this)) {
            this.touchControls = new TouchControls(this);
        }

        this.input.on("pointerdown", (pointer) => {
            if (this.gameEnded || this.isStarting || !this.player) return;
            if (this.touchControls?.isActive() && this.touchControls.isPointerOnControls(pointer)) {
                return;
            }
            if (!this.touchControls?.isActive()) {
                this.player.shoot(pointer);
            }
        });

        this.input.keyboard.on("keydown-ESC", () => {
            this.onPauseRequested();
        });
    }

    onPauseRequested() {
        if (this.gameEnded || this.isStarting) return;
        if (this.touchControls) this.touchControls.setEnabled(false);
        this.scene.pause();
        this.scene.launch("PauseScene", { parentScene: "GameScene" });
    }

    setupCombatCollisions() {
        // ► Daño por contacto (Jugador vs Jefe)
        this.physics.add.overlap(
            this.player.sprite,
            this.boss.sprite,
            () => {
                if (!this.boss.dead && !this.player.isInvulnerable && !this.gameEnded) {
                    this.player.takeDamage(10);
                }
            }
        );

        this.physics.add.overlap(
            this.player.bullets,
            this.boss.sprite,
            (objA, objB) => {
                const bullet = objA?.getData?.("playerBullet") ? objA : objB?.getData?.("playerBullet") ? objB : null;
                if (!bullet || !bullet.active || bullet.getData("hasHit")) return;
                if (this.boss.dead || this.gameEnded) return;

                bullet.setData("hasHit", true);
                bullet.setActive(false).setVisible(false);
                bullet.body.stop();
                
                const damage = bullet.damage || 8;
                this.boss.takeDamage(damage);

                // Acumular daño en el registry para el ranking
                const totalDamage = this.registry.get("totalDamageInflicted") || 0;
                this.registry.set("totalDamageInflicted", totalDamage + damage);

                this.hud.update(this.player, this.boss);
            }
        );

        this.physics.add.overlap(
            this.player.sprite,
            this.boss.projectiles,
            (objA, objB) => {
                const proj = objA?.getData?.("bossProjectile") ? objA : objB?.getData?.("bossProjectile") ? objB : null;
                if (!proj || !proj.active || this.gameEnded || this.boss.dead) return;

                proj.setActive(false).setVisible(false);
                proj.body.stop();
                this.player.takeDamage(proj.damage || 15);
                this.hud.update(this.player, this.boss);
            }
        );

        if (this.boss.shockwaves) {
            this.physics.add.overlap(
                this.player.sprite,
                this.boss.shockwaves,
                (objA, objB) => {
                    const wave = objA?.getData?.("bossShockwave") ? objA : objB?.getData?.("bossShockwave") ? objB : null;
                    if (!wave || !wave.active || wave.getData("hasHitPlayer") || this.gameEnded || this.boss.dead) return;

                    wave.setData("hasHitPlayer", true);
                    this.player.takeDamage(wave.damage || 25);
                    this.hud.update(this.player, this.boss);
                }
            );
        }
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
        // Evitar múltiples llamadas
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        this.gameEnded = true;
        this.combatActive = false;
        
        this.physics.pause();
        // No matamos todos los tweens para permitir que la animación de muerte termine si usa tweens
        // this.tweens.killAll(); 

        console.log(`[GameScene] Finalizando misión. Transicionando a: ${sceneKey}`);

        if (this.player && this.player.sprite && this.player.sprite.body) {
            this.player.sprite.body.setVelocity(0, 0);
        }
        
        if (this.boss && this.boss.sprite && this.boss.sprite.body) {
            this.boss.sprite.body.setVelocity(0, 0);
        }

        if (this.waveSpawnTimer) {
            this.waveSpawnTimer.remove();
            this.waveSpawnTimer = null;
        }

        // ► LIMPIEZA ROBUSTA DE ENEMIGOS (Evita crash en Modo Oleada)
        if (this.enemies && Array.isArray(this.enemies)) {
            const enemiesToClean = [...this.enemies]; // Copia para evitar problemas al iterar
            this.enemies = []; // Limpiar referencia principal inmediatamente
            
            enemiesToClean.forEach((e) => {
                if (!e) return;
                try {
                    e.dead = true; // Forzar estado muerto
                    // Detener proyectiles del enemigo
                    if (e.projectiles && typeof e.projectiles.clear === 'function') {
                        e.projectiles.clear(true, true);
                    }
                    // Destruir sprite
                    if (e.sprite && e.sprite.active) {
                        e.sprite.destroy();
                    }
                } catch (err) {
                    console.warn("[GameScene] Error limpiando enemigo:", err);
                }
            });
        }

        // Pequeño delay para que el jugador vea el resultado final
        this.time.delayedCall(800, () => {
            this.scene.stop("GameScene");
            this.scene.start(sceneKey);
        });
    }

    onPlayerDefeated() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.combatActive = false;
        
        // Detener spawneo de oleadas inmediatamente
        if (this.waveSpawnTimer) {
            this.waveSpawnTimer.remove();
            this.waveSpawnTimer = null;
        }

        console.log("[GameScene] Jugador derrotado. Transicionando a GameOver.");
        this.showEndScreen("GameOverScene");
    }

    onBossDefeated() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        this.combatActive = false;
        
        // Al ganar, el puntaje se mantiene en el registry para la siguiente fase o el ranking
        console.log(`[GameScene] Jefe derrotado. Puntuación acumulada: ${this.registry.get("totalDamageInflicted")}`);
        this.showEndScreen("WinScene");
    }

    shutdown() {
        if (this.waveSpawnTimer) {
            this.waveSpawnTimer.remove();
            this.waveSpawnTimer = null;
        }
        if (this.touchControls) {
            this.touchControls.destroy();
            this.touchControls = null;
        }
        this.registry.events.off("changedata-musicVolume");
        this.events.off("player-hp-changed");
        this.events.off("boss-hp-changed");
        this.events.off("enemy-hp-changed");
    }

    updateFps() {
        if (!this.fpsText || this.time.now < this.nextFpsUpdate) return;
        this.nextFpsUpdate = this.time.now + 300;
        this.fpsText.setText(`${Math.round(this.game.loop.actualFps)} fps`);
    }

    update() {
        this.updateFps();
        if (!this.player || this.gameEnded) return;

        // Si el jugador está en proceso de morir, seguimos actualizando el HUD y el timer
        // pero detenemos el procesamiento de combate/IA.
        if (this.player.isDying) {
            const timeElapsed = this.time.now - this.startTime;
            if (this.isWaveMode) {
                this.hud.update(this.player, null, timeElapsed, this.getWaveHudInfo());
            } else {
                this.hud.update(this.player, this.boss, timeElapsed);
            }
            return;
        }

        if (this.combatActive) {
            this.player.update(this.input.activePointer);

            if (this.isWaveMode) {
                if (this.enemies && Array.isArray(this.enemies)) {
                    this.enemies.forEach((enemy) => {
                        if (enemy && !enemy.dead) enemy.update(this.player);
                    });
                }
                const timeElapsed = this.time.now - this.startTime;
                this.hud.update(this.player, null, timeElapsed, this.getWaveHudInfo());
            } else {
                if (this.boss && !this.boss.dead) {
                    this.boss.update(this.player);
                }
                const timeElapsed = this.time.now - this.startTime;
                this.hud.update(this.player, this.boss, timeElapsed);
            }
        } else {
            this.player.update(this.input.activePointer);
        }

        if (this.touchControls?.isActive() && this.player && this.combatActive) {
            if (this.touchControls.consumeShootPress()) {
                const dir = this.player.sprite.flipX ? -1 : 1;
                this.player.shoot({
                    x: this.player.sprite.x + dir * 120,
                    y: this.player.sprite.y - this.player.targetHeight * 0.5,
                });
            }
        }
    }
}
