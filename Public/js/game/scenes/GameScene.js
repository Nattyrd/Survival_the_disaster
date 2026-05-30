class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  /**
   * Punto de entrada: elige la misión según registry.mission
   * (1 = Boss1, 2 = Boss3, 3 = Boss2 / Andronimus).
   */
  create() {
    const { width, height } = this.scale;
    this.mission = this.registry.get("mission") || 0;
    this.combatActive = false;
    this.gameEnded = false;
    this.isPaused = false;
    this.pauseUi = null;

    // Debug audio
    console.log("[GameScene] Mission:", this.mission);
    console.log(
      "[GameScene] Audio cache keys:",
      Object.keys(this.cache.audio.entries),
    );
    console.log(
      "[GameScene] sfx_player_shoot existe:",
      this.cache.audio.exists("sfx_player_shoot") ? "SÍ" : "NO",
    );
    console.log(
      "[GameScene] sfx_boss_shoot existe:",
      this.cache.audio.exists("sfx_boss_shoot") ? "SÍ" : "NO",
    );
    console.log(
      "[GameScene] sfx_destroyer_shoot existe:",
      this.cache.audio.exists("sfx_destroyer_shoot") ? "SÍ" : "NO",
    );

    if (this.mission === 1) {
      this.createMission1();
      return;
    }

    if (this.mission === 2) {
      this.createMission2();
      return;
    }

    if (this.mission === 3) {
      this.createMission3();
      return;
    }

    this.createSandbox(width, height);
  }

  /**
   * Define los límites físicos del combate y devuelve coordenadas de spawn.
   * Jugador y jefe usan setCollideWorldBounds(true) → no salen de este rectángulo.
   */
  setupMissionArena() {
    const { width, height } = this.scale;
    this.physics.world.setBounds(0, 0, width, height);

    return {
      playerX: width * MISSION_SPAWN.playerX,
      playerY: height * MISSION_SPAWN.playerY,
      bossX: width * MISSION_SPAWN.bossX,
      bossY: height * MISSION_SPAWN.bossY,
    };
  }

  /** Texto de controles fijo en pantalla (no se mueve con el mundo). */
  addMissionControlsHint() {
    const { height } = this.scale;
    this.add
      .text(
        16,
        height - 32,
        "WASD | ESPACIO | 2 Arma | CLIC DER Disparar | P Pausa | ESC Menú",
        {
          font: "14px Arial",
          fill: "#e2e8f0",
        },
      )
      .setScrollFactor(0)
      .setDepth(5000);
  }

  /** Suscripciones HUD: actualizar barras de vida al recibir daño. */
  bindBossMissionEvents() {
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
  }

  /**
   * Monta combate estándar jefe vs jugador (misiones 1–3).
   * @param {{ createBoss: Function, extraSetup?: Function }} options
   */
  initBossMission(options) {
    const spawn = this.setupMissionArena();

    this.player = new Player(this, spawn.playerX, spawn.playerY);
    this.player.equipWeaponForMission();
    this.boss = options.createBoss(spawn);
    this.combatActive = true;

    this.setupCombatCollisions();
    if (options.extraSetup) {
      options.extraSetup();
    }

    this.setupInput();
    this.setupPauseUi();
    this.hud = new Hud(this);
    this.hud.update(this.player, this.boss);
    this.bindBossMissionEvents();
    this.addMissionControlsHint();
    this.createFpsCounter(this.scale.width);
  }

  /** Fondo a pantalla completa con modo "cover" (sin bandas negras). */
  createBackground(key, options = {}) {
    const { width, height } = this.scale;
    const bg = this.add.image(width / 2, height / 2, key);
    bg.setOrigin(0.5, 0.5);
    bg.setScrollFactor(0);
    bg.setDepth(0);

    const texW = bg.width;
    const texH = bg.height;
    if (texW > 0 && texH > 0) {
      const scale = Math.max(width / texW, height / texH);
      bg.setScale(scale);
    }

    if (options.offsetY) {
      bg.y += options.offsetY;
    }

    return bg;
  }

  createMission1() {
    this.createBackground("bg_mission1");
    Player.createAnimations(this);
    Boss1.createAnimations(this);
    this.initBossMission({
      createBoss: (spawn) => new Boss1(this, spawn.bossX, spawn.bossY),
    });
  }

  createMission2() {
    this.createBackground("bg_mission2");
    this.cameras.main.setBackgroundColor("#0f1419");
    Player.createAnimations(this);
    Boss3.createAnimations(this);
    this.initBossMission({
      createBoss: (spawn) => new Boss3(this, spawn.bossX, spawn.bossY),
    });
  }

  createMission3() {
    this.createBackground("bg_mission3");
    this.cameras.main.setBackgroundColor("#1a1520");
    Player.createAnimations(this);
    Boss2.createAnimations(this);
    this.initBossMission({
      createBoss: (spawn) => new Boss2(this, spawn.bossX, spawn.bossY),
      extraSetup: () => this.setupBoss2ShockwaveCollisions(),
    });
  }

  createSandbox(width, height) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x1e293b);

    Player.createAnimations(this);
    this.player = new Player(this, width / 2, height / 2);
    this.setupInput();

    this.add
      .text(16, height - 32, "Modo prueba — Elige una misión en el menú", {
        font: "14px Arial",
        fill: "#94a3b8",
      })
      .setScrollFactor(0);

    this.createFpsCounter(width);
  }

  setupInput() {
    this.input.mouse.disableContextMenu();

    this.input.on("pointerdown", (pointer) => {
      if (this.gameEnded || this.isPaused || !this.player) {
        return;
      }
      if (pointer.rightButtonDown()) {
        this.player.shoot(pointer);
      }
    });

    if (this.teclaP) {
      this.teclaP.removeAllListeners();
    }
    this.teclaP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.teclaP.on("down", () => this.togglePause());

    if (this.teclaEsc) {
      this.teclaEsc.removeAllListeners();
    }
    this.teclaEsc = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );
    this.teclaEsc.on("down", () => {
      if (this.isPaused) {
        this.togglePause();
      } else {
        this.irAlMenu();
      }
    });
  }

  setupPauseUi() {
    const { width, height } = this.scale;
    this.pauseUi = this.add.container(0, 0).setDepth(6000).setVisible(false);

    const titulo = this.add
      .text(width / 2, height / 2, "PAUSA", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "80px",
        color: "#ef4444",
        stroke: "#7f1d1d",
        strokeThickness: 10,
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(width / 2, height / 2 + 56, "P — Reanudar", {
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        color: "#fca5a5",
      })
      .setOrigin(0.5);

    this.pauseUi.add([titulo, hint]);
    this.pauseUi.setScrollFactor(0);
  }

  /** Pausa física, tweens y muestra overlay "PAUSA". */
  togglePause() {
    if (this.gameEnded || !this.combatActive) {
      return;
    }

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.tweens.pauseAll();
      if (this.pauseUi) {
        this.pauseUi.setVisible(true);
      }
      return;
    }

    this.physics.resume();
    this.tweens.resumeAll();
    if (this.pauseUi) {
      this.pauseUi.setVisible(false);
    }
  }

  irAlMenu() {
    irAlMenuPrincipal(this);
  }

  /** Colisiones balas del jugador → jefe, y proyectiles del jefe → jugador. */
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
      },
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
      },
    );
  }

  /** Misión 3: rayos especiales de Andronimus (grupo shockwaves). */
  setupBoss2ShockwaveCollisions() {
    if (!this.boss || !this.boss.shockwaves) {
      return;
    }

    this.physics.add.overlap(
      this.player.sprite,
      this.boss.shockwaves,
      (objA, objB) => {
        const wave = objA?.getData?.("bossShockwave")
          ? objA
          : objB?.getData?.("bossShockwave")
            ? objB
            : null;

        if (
          !wave ||
          !wave.active ||
          wave.getData("hasHitPlayer") ||
          this.gameEnded ||
          this.isPaused
        ) {
          return;
        }

        wave.setData("hasHitPlayer", true);
        this.player.takeDamage(wave.damage || 28);
        this.hud.update(this.player, this.boss);
      },
    );
  }

  setupCombatCollisions2() {
    this.physics.add.overlap(
      this.player.bullets,
      this.enemy.sprite,
      (objA, objB) => {
        const bullet = objA?.getData?.("playerBullet")
          ? objA
          : objB?.getData?.("playerBullet")
            ? objB
            : null;

        if (!bullet || !bullet.active || bullet.getData("hasHit")) {
          return;
        }

        if (this.enemy.dead || this.gameEnded) {
          return;
        }

        bullet.setData("hasHit", true);
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();
        this.enemy.takeDamage(bullet.damage || 8);
        this.hud.update(this.player, this.enemy);
      },
    );

    this.physics.add.overlap(
      this.player.sprite,
      this.enemy.projectiles,
      (objA, objB) => {
        const proj = objA?.getData?.("enemyProjectile")
          ? objA
          : objB?.getData?.("enemyProjectile")
            ? objB
            : null;

        if (!proj || !proj.active || this.gameEnded || this.enemy.dead) {
          return;
        }

        proj.setActive(false);
        proj.setVisible(false);
        proj.body.stop();
        this.player.takeDamage(proj.damage || 10);
        this.hud.update(this.player, this.enemy);
      },
    );
  }

  createFpsCounter(width) {
    this.fpsText = this.add
      .text(width - 12, 10, "— fps", {
        fontFamily: "Consolas, Monaco, monospace",
        fontSize: "11px",
        color: "#475569",
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
    if (this.enemy && !this.enemy.dead) {
      this.enemy.sprite.body.setVelocity(0, 0);
    }

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

  /** Fin de misión: WinScene (el botón Continuar avanza mission en registry). */
  onBossDefeated() {
    if (this.gameEnded) {
      return;
    }
    this.gameEnded = true;
    // Mostrar pantalla de victoria sin setear mission=2 todavía
    // El botón "Continuar" en WinScene lo hará
    this.time.delayedCall(300, () => this.showEndScreen("WinScene"));
  }

  onEnemyDefeated() {
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

    if (this.isPaused || this.gameEnded) {
      return;
    }

    if (this.player.isDying) {
      return;
    }

    if (this.combatActive) {
      this.player.update(this.input.activePointer);
      if (this.boss) {
        this.boss.update(this.player);
        this.hud.update(this.player, this.boss);
      } else if (this.enemy) {
        this.enemy.update(this.player);
        this.hud.update(this.player, this.enemy);
      }
    } else if (!this.player.isDead) {
      this.player.update(this.input.activePointer);
    }
  }
}
