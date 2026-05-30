/**
 * MISIÓN 1 — Boss principal (Robot Jefe)
 * Archivo: Mission1_Boss1.js | Entidad manifest: boss1 | Background: Background1
 *
 * Ciclo de combate: perseguir → disparar / reposicionarse volando → subir agresión con poco HP.
 */

/** Estadísticas y rangos de combate del jefe (ajustar aquí dificultad). */
const BOSS1_MAX_HP = 450;
const BOSS1_SPEED = 120;
const BOSS1_SCALE = 4.1;
const BOSS1_ATTACK_RANGE_MIN = 220;
const BOSS1_ATTACK_RANGE_MAX = 620;
const BOSS1_PROJECTILE_SPEED = 340;
const BOSS1_FIRE_COOLDOWN = 1100;
const BOSS1_HURT_ANIM_COOLDOWN = 280;
const BOSS1_MOVE_THRESHOLD = 12;

class Boss1 {
  /** Crea sprite, grupo de proyectiles y arranca IA con primer "think" retardado. */
  constructor(scene, x, y) {
    this.scene = scene;
    this.id = "boss1";
    this.displayName = "Robot Jefe";
    this.maxHp = BOSS1_MAX_HP;
    this.hp = BOSS1_MAX_HP;
    this.dead = false;
    this.isHurting = false;
    this.isAttacking = false;
    this.isFlying = false;
    this.isChasing = false;
    this.moveState = "idle";
    this.lastFireAt = 0;
    this.lastStepAt = 0;
    this.hurtAnimCooldownUntil = 0;
    this.nextThinkAt = 0;
    this.facing = -1;

    this.sprite = scene.physics.add.sprite(x, y, this.tex("idle"), 0);
    this.sprite.setScale(BOSS1_SCALE);
    this.sprite.setDepth(8);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setFlipX(true);
    this.sprite.setData("isBoss", true);

    this.projectiles = scene.physics.add.group({ maxSize: 16 });

    this.setupBody();
    this.setIdle();
    this.sprite.on("animationcomplete", this.onAnimComplete, this);
    this.scheduleThink(1200);
  }

  /** Registra animaciones de cuerpo y proyectiles en el AnimationManager de Phaser. */
  static createAnimations(scene) {
    const bodyAnims = [
      { anim: "boss1_idle", sheet: "idle", frames: 4, rate: 6, repeat: -1 },
      { anim: "boss1_walk", sheet: "walk", frames: 6, rate: 10, repeat: -1 },
      { anim: "boss1_attack", sheet: "attack", frames: 6, rate: 14, repeat: 0 },
      {
        anim: "boss1_walk_attack",
        sheet: "walk_attack",
        frames: 6,
        rate: 12,
        repeat: 0,
      },
      { anim: "boss1_hurt", sheet: "hurt", frames: 2, rate: 10, repeat: 0 },
      { anim: "boss1_death", sheet: "death", frames: 6, rate: 9, repeat: 0 },
      { anim: "boss1_fly_up", sheet: "fly_up", frames: 4, rate: 11, repeat: 0 },
      {
        anim: "boss1_fly_down",
        sheet: "fly_down",
        frames: 6,
        rate: 11,
        repeat: 0,
      },
    ];

    const projAnims = [
      {
        anim: "boss1_proj_special1",
        sheet: "special1",
        frames: 6,
        rate: 16,
        repeat: -1,
      },
      {
        anim: "boss1_proj_special2",
        sheet: "special2",
        frames: 4,
        rate: 14,
        repeat: -1,
      },
    ];

    [...bodyAnims, ...projAnims].forEach((d) => {
      try {
        const tex = EntityLoader.textureKey("boss1", d.sheet);
        if (!scene.textures.exists(tex)) {
          console.warn(`[Boss1] Texture ${tex} does not exist yet`);
          return;
        }
        if (scene.anims.exists(d.anim)) {
          return;
        }
        scene.anims.create({
          key: d.anim,
          frames: scene.anims.generateFrameNumbers(tex, {
            start: 0,
            end: d.frames - 1,
          }),
          frameRate: d.rate,
          repeat: d.repeat,
        });
      } catch (e) {
        console.error(`[Boss1] Error creating animation ${d.anim}:`, e);
      }
    });
  }

  tex(sheetKey) {
    return EntityLoader.textureKey(this.id, sheetKey);
  }

  setupBody() {
    const w = 72;
    const h = 86;
    this.sprite.body.setSize(w, h);
    this.sprite.body.setOffset(12, 10);
  }

  syncBody() {
    this.sprite.body.reset(this.sprite.x, this.sprite.y);
  }

  stopMovement() {
    this.isChasing = false;
    this.sprite.body.setVelocity(0, 0);
  }

  isMoving() {
    const body = this.sprite.body;
    return body && body.velocity.length() > BOSS1_MOVE_THRESHOLD;
  }

  setIdle() {
    this.moveState = "idle";
    this.stopMovement();
    this.lastStepAt = 0;
    if (!this.dead && !this.isHurting && !this.isAttacking && !this.isFlying) {
      this.playBodyAnim("boss1_idle", "idle");
    }
  }

  setWalk() {
    if (this.dead || this.isHurting || this.isAttacking || this.isFlying) {
      return;
    }
    if (this.moveState !== "walk") {
      this.moveState = "walk";
      this.playBodyAnim("boss1_walk", "walk");
    }
  }

  syncMovementAnimation() {
    if (this.dead || this.isHurting || this.isAttacking || this.isFlying) {
      return;
    }

    if (this.isMoving()) {
      this.setWalk();
    } else if (this.moveState !== "idle") {
      this.setIdle();
    }
  }

  distanceTo(player) {
    return Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      player.sprite.x,
      player.sprite.y,
    );
  }

  faceTarget(player) {
    this.facing = player.sprite.x < this.sprite.x ? -1 : 1;
    this.sprite.setFlipX(this.facing < 0);
  }

  playBodyAnim(animKey, sheetKey) {
    if (this.sprite.anims.currentAnim?.key === animKey) {
      return;
    }
    this.sprite.setTexture(this.tex(sheetKey));
    this.sprite.setScale(BOSS1_SCALE);
    this.sprite.play(animKey);
  }

  scheduleThink(delay) {
    this.nextThinkAt = this.scene.time.now + delay;
  }

  getAggression() {
    return 1 - Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
  }

  /**
   * Pesos y tiempos de IA según HP restante (ag = 0 tranquilo → 1 furioso).
   * Los "Weight" deciden qué acción elige think() con un dado aleatorio.
   */
  getCombatStats() {
    const ag = this.getAggression();

    return {
      fireCooldown: Phaser.Math.Linear(BOSS1_FIRE_COOLDOWN, 420, ag),
      thinkMin: Phaser.Math.Linear(900, 280, ag),
      thinkMax: Phaser.Math.Linear(1400, 480, ag),
      moveSpeed: Phaser.Math.Linear(BOSS1_SPEED, 185, ag),
      walkAttackSpeed: Phaser.Math.Linear(BOSS1_SPEED * 0.65, 150, ag),
      projectileSpeed: Phaser.Math.Linear(BOSS1_PROJECTILE_SPEED, 460, ag),
      attackWeight: Phaser.Math.Linear(0.5, 0.88, ag),
      walkAttackWeight: Phaser.Math.Linear(0.25, 0.45, ag),
      repositionWeight: Phaser.Math.Linear(0.25, 0.06, ag),
      doubleShotChance: ag > 0.4 ? (ag - 0.4) * 1.35 : 0,
      flyDuration: Phaser.Math.Linear(500, 320, ag),
      postAttackDelay: Phaser.Math.Linear(700, 280, ag),
    };
  }

  onAnimComplete(anim) {
    if (this.dead) {
      return;
    }

    if (anim.key === "boss1_hurt") {
      this.isHurting = false;
      this.setIdle();
      this.scheduleThink(500);
      return;
    }

    if (anim.key === "boss1_attack" || anim.key === "boss1_walk_attack") {
      this.isAttacking = false;
      this.stopMovement();
      this.setIdle();
      this.scheduleThink(this.getCombatStats().postAttackDelay);
    }
  }

  /** Instancia un proyectil homing hacia el jugador (Special1 o Special2). */
  spawnProjectile(type, player, stats) {
    const s = stats || this.getCombatStats();
    const isType1 = type === 1;
    const sheet = isType1 ? "special1" : "special2";
    const anim = isType1 ? "boss1_proj_special1" : "boss1_proj_special2";
    const damage = isType1
      ? 14 + Math.floor(this.getAggression() * 4)
      : 20 + Math.floor(this.getAggression() * 6);
    const scale = BOSS1_SCALE * 0.55;

    try {
      if (this.scene.sound) {
        this.scene.sound.play("sfx_boss_shoot", { volume: 0.6 });
      }
    } catch (e) {
      // Sonido no disponible
    }

    const offsetX = this.facing * 55;
    const proj = this.projectiles.get(
      this.sprite.x + offsetX,
      this.sprite.y - 10,
      this.tex(sheet),
      0,
    );

    if (!proj) {
      return;
    }

    proj.setActive(true);
    proj.setVisible(true);
    proj.setScale(scale);
    proj.setDepth(9);
    proj.body.setAllowGravity(false);
    proj.damage = damage;
    proj.setFlipX(this.facing < 0);
    proj.setData("bossProjectile", true);
    proj.play(anim);

    this.scene.physics.moveToObject(proj, player.sprite, s.projectileSpeed);
    proj.lifespan = this.scene.time.now + 3200;
  }

  /** Ataque a distancia: animación de disparo + uno o dos proyectiles. */
  fireAtPlayer(player, moveWhileShooting) {
    if (this.dead || this.isHurting || this.isFlying) {
      return;
    }

    const stats = this.getCombatStats();

    if (this.scene.time.now - this.lastFireAt < stats.fireCooldown) {
      return;
    }

    this.lastFireAt = this.scene.time.now;
    this.isAttacking = true;
    this.isChasing = false;
    this.faceTarget(player);

    const projectileType = Math.random() > 0.45 ? 1 : 2;

    if (moveWhileShooting) {
      this.moveState = "walk";
      this.playBodyAnim("boss1_walk_attack", "walk_attack");
      this.isChasing = true;
      this.scene.physics.moveToObject(
        this.sprite,
        player.sprite,
        stats.walkAttackSpeed,
      );
    } else {
      this.stopMovement();
      this.playBodyAnim("boss1_attack", "attack");
    }

    const fireDelay = Phaser.Math.Linear(220, 120, this.getAggression());

    this.scene.time.delayedCall(fireDelay, () => {
      if (this.dead) {
        return;
      }

      this.spawnProjectile(projectileType, player, stats);

      if (Math.random() < stats.doubleShotChance) {
        this.scene.time.delayedCall(140, () => {
          if (!this.dead) {
            this.spawnProjectile(Math.random() > 0.5 ? 1 : 2, player, stats);
          }
        });
      }
    });
  }

  /** Salto lateral/vertical para cambiar ángulo de tiro (evita quedar pegado al borde). */
  reposition(player, goUp) {
    if (this.dead || this.isHurting || this.isFlying) {
      return;
    }

    this.isFlying = true;
    this.isAttacking = false;
    this.isChasing = false;
    this.stopMovement();

    const { width, height } = this.scene.scale;
    const margin = MISSION_WORLD_MARGIN;
    const side = player.sprite.x < width / 2 ? 1 : -1;
    const targetX = Phaser.Math.Clamp(
      this.sprite.x + side * Phaser.Math.Between(160, 260),
      margin,
      width - margin,
    );
    const targetY = goUp
      ? Phaser.Math.Clamp(
          this.sprite.y - Phaser.Math.Between(80, 140),
          margin,
          height - margin,
        )
      : Phaser.Math.Clamp(
          this.sprite.y + Phaser.Math.Between(60, 120),
          margin,
          height - margin,
        );

    if (goUp) {
      this.playBodyAnim("boss1_fly_up", "fly_up");
    } else {
      this.playBodyAnim("boss1_fly_down", "fly_down");
    }

    const stats = this.getCombatStats();

    this.flyTween = this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      y: targetY,
      duration: stats.flyDuration,
      ease: "Sine.easeInOut",
      onUpdate: () => this.syncBody(),
      onComplete: () => {
        this.isFlying = false;
        this.syncBody();
        this.setIdle();
        this.scheduleThink(Phaser.Math.Linear(400, 150, this.getAggression()));
      },
    });
  }

  startChase(player) {
    const stats = this.getCombatStats();
    this.isChasing = true;
    this.setWalk();
    this.scene.physics.moveToObject(
      this.sprite,
      player.sprite,
      stats.moveSpeed,
    );

    const speed = Math.sqrt(
      this.sprite.body.velocity.x ** 2 + this.sprite.body.velocity.y ** 2,
    );
    if (speed > 0 && this.scene.time.now - this.lastStepAt > 300) {
      this.lastStepAt = this.scene.time.now;
      try {
        if (this.scene.sound) {
          this.scene.sound.play("sfx_boss_steps", { volume: 0.3 });
        }
      } catch (e) {
        // Sonido no disponible
      }
    }
  }

  /** Decisión de IA cada intervalo: atacar, perseguir o reposicionarse según distancia. */
  think(player) {
    const dist = this.distanceTo(player);
    const stats = this.getCombatStats();
    const ag = this.getAggression();
    const roll = Math.random();

    if (dist < BOSS1_ATTACK_RANGE_MIN) {
      this.stopMovement();
      if (roll < stats.attackWeight * 0.7) {
        this.fireAtPlayer(player, roll < stats.walkAttackWeight);
      } else {
        this.reposition(player, Math.random() > 0.5);
      }
      return;
    }

    if (dist >= BOSS1_ATTACK_RANGE_MIN && dist <= BOSS1_ATTACK_RANGE_MAX) {
      this.stopMovement();

      if (roll < stats.attackWeight) {
        this.fireAtPlayer(player, false);
      } else if (roll < stats.attackWeight + stats.walkAttackWeight) {
        this.fireAtPlayer(player, true);
      } else if (
        roll <
        stats.attackWeight + stats.walkAttackWeight + stats.repositionWeight
      ) {
        this.reposition(player, Math.random() > 0.5);
      } else {
        this.fireAtPlayer(player, true);
      }
      return;
    }

    if (dist > BOSS1_ATTACK_RANGE_MAX) {
      if (roll < stats.repositionWeight && ag > 0.2) {
        this.stopMovement();
        this.reposition(player, true);
      } else {
        this.startChase(player);
      }
    }
  }

  updateProjectiles() {
    const bounds = this.scene.physics.world.bounds;

    this.projectiles.getChildren().forEach((proj) => {
      if (!proj.active) {
        return;
      }

      const out =
        proj.x < bounds.x - 60 ||
        proj.x > bounds.width + 60 ||
        proj.y < bounds.y - 60 ||
        proj.y > bounds.height + 60;

      if (out || this.scene.time.now > proj.lifespan) {
        proj.setActive(false);
        proj.setVisible(false);
        proj.body.stop();
      }
    });
  }

  takeDamage(amount) {
    if (this.dead) {
      return false;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.scene.events.emit("boss-hp-changed");

    const ag = this.getAggression();
    if (ag >= 0.66) {
      this.displayName = "Robot Jefe — FURIOSO";
    } else if (ag >= 0.33) {
      this.displayName = "Robot Jefe — AGRESIVO";
    } else {
      this.displayName = "Robot Jefe";
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }

    const now = this.scene.time.now;
    this.flashHit();

    if (now < this.hurtAnimCooldownUntil) {
      return true;
    }

    this.hurtAnimCooldownUntil = now + BOSS1_HURT_ANIM_COOLDOWN;

    if (this.isAttacking || this.isFlying) {
      return true;
    }

    this.isHurting = true;
    this.isChasing = false;
    this.stopMovement();

    if (this.flyTween) {
      this.flyTween.stop();
    }

    this.playBodyAnim("boss1_hurt", "hurt");
    return true;
  }

  flashHit() {
    this.sprite.setTint(0xffaaaa);
    this.scene.time.delayedCall(70, () => {
      if (this.sprite.active && !this.dead) {
        this.sprite.clearTint();
      }
    });
  }

  die() {
    if (this.dead) {
      return;
    }

    this.dead = true;
    this.isAttacking = false;
    this.isFlying = false;
    this.isChasing = false;
    this.stopMovement();

    this.projectiles.getChildren().forEach((p) => {
      p.setActive(false);
      p.setVisible(false);
    });

    if (this.flyTween) {
      this.flyTween.stop();
    }

    this.playBodyAnim("boss1_death", "death");
    this.sprite.once("animationcomplete-boss1_death", () => {
      this.scene.onBossDefeated();
    });
  }

  /** Bucle principal: proyectiles, persecución y programación de think(). */
  update(player) {
    this.updateProjectiles();

    if (this.dead) {
      return;
    }

    this.faceTarget(player);

    if (this.isHurting || this.isFlying) {
      return;
    }

    const stats = this.getCombatStats();

    if (this.isAttacking) {
      if (this.isChasing) {
        this.scene.physics.moveToObject(
          this.sprite,
          player.sprite,
          stats.walkAttackSpeed,
        );
        this.syncMovementAnimation();
      }
      return;
    }

    if (this.scene.time.now >= this.nextThinkAt) {
      this.think(player);
      this.scheduleThink(Phaser.Math.Between(stats.thinkMin, stats.thinkMax));
    }

    if (this.isChasing) {
      const dist = this.distanceTo(player);

      if (dist <= BOSS1_ATTACK_RANGE_MAX) {
        this.stopMovement();
        this.setIdle();
        if (
          dist >= BOSS1_ATTACK_RANGE_MIN &&
          this.scene.time.now >= this.lastFireAt + stats.fireCooldown * 0.5
        ) {
          this.fireAtPlayer(player, false);
        }
      } else {
        this.scene.physics.moveToObject(
          this.sprite,
          player.sprite,
          stats.moveSpeed,
        );
        this.syncMovementAnimation();
      }
      return;
    }

    const dist = this.distanceTo(player);

    if (dist > BOSS1_ATTACK_RANGE_MAX + 50) {
      this.startChase(player);
    } else {
      this.stopMovement();
      this.setIdle();
    }
  }
}
