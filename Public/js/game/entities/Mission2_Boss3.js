/**
 * MISIÓN 2 — Boss principal (Titán MK-3)
 * Archivo: Mission2_Boss3.js | Entidad manifest: boss3 | Background: Background2
 *
 * Especial: se planta, anima Special.png y lanza ráfaga en abanico (más balas cada uso).
 */

/** Estadísticas y rangos de combate del jefe. */
const BOSS3_MAX_HP = 400;
const BOSS3_SPEED = 125;
const BOSS3_SCALE = 4;
const BOSS3_ATTACK_RANGE_MIN = 200;
const BOSS3_ATTACK_RANGE_MAX = 600;
const BOSS3_PROJECTILE_SPEED = 380;
const BOSS3_FIRE_COOLDOWN = 950;
const BOSS3_HURT_ANIM_COOLDOWN = 260;
const BOSS3_MOVE_THRESHOLD = 12;
const BOSS3_SPECIAL_COOLDOWN = 9000;
const BOSS3_SPECIAL_COOLDOWN_MIN = 4800;
const BOSS3_SPECIAL_RANGE = 560;
const BOSS3_SPECIAL_MAX_PROJECTILES = 14;

class Boss3 {
  constructor(scene, x, y) {
    this.scene = scene;
    this.id = "boss3";
    this.displayName = "Titán MK-3";
    this.specialUseCount = 0;
    this.maxHp = BOSS3_MAX_HP;
    this.hp = BOSS3_MAX_HP;
    this.dead = false;
    this.isHurting = false;
    this.isAttacking = false;
    this.isFlying = false;
    this.isChasing = false;
    this.isSpecialAttacking = false;
    this.moveState = "idle";
    this.lastFireAt = 0;
    this.lastSpecialAt = 0;
    this.lastStepAt = 0;
    this.hurtAnimCooldownUntil = 0;
    this.nextThinkAt = 0;
    this.facing = -1;

    this.sprite = scene.physics.add.sprite(x, y, this.tex("idle"), 0);
    this.sprite.setScale(BOSS3_SCALE);
    this.sprite.setDepth(8);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setFlipX(true);
    this.sprite.setData("isBoss", true);

    this.projectiles = scene.physics.add.group({ maxSize: 32 });

    this.setupBody();
    this.setIdle();
    this.sprite.on("animationcomplete", this.onAnimComplete, this);
    this.scheduleThink(1100);
  }

  static createAnimations(scene) {
    const bodyAnims = [
      { anim: "boss3_idle", sheet: "idle", frames: 4, rate: 6, repeat: -1 },
      { anim: "boss3_walk", sheet: "walk", frames: 6, rate: 10, repeat: -1 },
      { anim: "boss3_attack", sheet: "attack", frames: 6, rate: 14, repeat: 0 },
      {
        anim: "boss3_walk_attack",
        sheet: "walk_attack",
        frames: 6,
        rate: 12,
        repeat: 0,
      },
      { anim: "boss3_hurt", sheet: "hurt", frames: 2, rate: 10, repeat: 0 },
      { anim: "boss3_death", sheet: "death", frames: 6, rate: 9, repeat: 0 },
      { anim: "boss3_fly_up", sheet: "fly_up", frames: 4, rate: 11, repeat: 0 },
      {
        anim: "boss3_fly_down",
        sheet: "fly_down",
        frames: 6,
        rate: 11,
        repeat: 0,
      },
      {
        anim: "boss3_special",
        sheet: "special",
        frames: 8,
        rate: 12,
        repeat: 0,
      },
    ];

    bodyAnims.forEach((d) => {
      Boss3.createAnimFromSheet(scene, d.anim, "boss3", d.sheet, d.frames, d.rate, d.repeat);
    });
  }

  static createAnimFromSheet(scene, animKey, manifestId, sheetKey, frameCount, rate, repeat) {
    try {
      const tex = EntityLoader.textureKey(manifestId, sheetKey);
      if (!scene.textures.exists(tex)) {
        console.warn(`[Boss3] Texture ${tex} does not exist yet`);
        return;
      }
      if (scene.anims.exists(animKey)) {
        return;
      }

      const availableFrames = scene.textures.get(tex).frameTotal;
      const endFrame = Math.min(frameCount, availableFrames) - 1;
      if (endFrame < 0) {
        console.warn(`[Boss3] No frames for ${tex}`);
        return;
      }

      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(tex, {
          start: 0,
          end: endFrame,
        }),
        frameRate: rate,
        repeat: repeat,
      });
    } catch (e) {
      console.error(`[Boss3] Error creating animation ${animKey}:`, e);
    }
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
    return body && body.velocity.length() > BOSS3_MOVE_THRESHOLD;
  }

  setIdle() {
    this.moveState = "idle";
    this.stopMovement();
    this.lastStepAt = 0;
    if (
      !this.dead &&
      !this.isHurting &&
      !this.isAttacking &&
      !this.isFlying &&
      !this.isSpecialAttacking
    ) {
      this.playBodyAnim("boss3_idle", "idle");
    }
  }

  setWalk() {
    if (
      this.dead ||
      this.isHurting ||
      this.isAttacking ||
      this.isFlying ||
      this.isSpecialAttacking
    ) {
      return;
    }
    if (this.moveState !== "walk") {
      this.moveState = "walk";
      this.playBodyAnim("boss3_walk", "walk");
    }
  }

  syncMovementAnimation() {
    if (
      this.dead ||
      this.isHurting ||
      this.isAttacking ||
      this.isFlying ||
      this.isSpecialAttacking
    ) {
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

  /** Punto de salida del cañón en coordenadas de mundo (para balas rectas). */
  getWeaponOrigin() {
    const w = this.sprite.displayWidth;
    const h = this.sprite.displayHeight;
    return {
      x: this.sprite.x + this.facing * w * 0.28,
      y: this.sprite.y - h * 0.08,
    };
  }

  /** Enfriamiento del especial: baja con cada uso (mínimo BOSS3_SPECIAL_COOLDOWN_MIN). */
  getSpecialCooldown() {
    const ag = this.getAggression();
    const reduction = (this.specialUseCount - 1) * 350;
    return (
      Phaser.Math.Clamp(
        BOSS3_SPECIAL_COOLDOWN - reduction,
        BOSS3_SPECIAL_COOLDOWN_MIN,
        BOSS3_SPECIAL_COOLDOWN,
      ) * Phaser.Math.Linear(1, 0.85, ag)
    );
  }

  playBodyAnim(animKey, sheetKey) {
    if (this.sprite.anims.currentAnim?.key === animKey) {
      return;
    }
    this.sprite.setTexture(this.tex(sheetKey));
    this.sprite.setScale(BOSS3_SCALE);
    this.sprite.play(animKey);
  }

  scheduleThink(delay) {
    this.nextThinkAt = this.scene.time.now + delay;
  }

  getAggression() {
    return 1 - Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
  }

  getCombatStats() {
    const ag = this.getAggression();

    return {
      fireCooldown: Phaser.Math.Linear(BOSS3_FIRE_COOLDOWN, 400, ag),
      thinkMin: Phaser.Math.Linear(850, 260, ag),
      thinkMax: Phaser.Math.Linear(1300, 440, ag),
      moveSpeed: Phaser.Math.Linear(BOSS3_SPEED, 180, ag),
      walkAttackSpeed: Phaser.Math.Linear(BOSS3_SPEED * 0.65, 155, ag),
      projectileSpeed: Phaser.Math.Linear(BOSS3_PROJECTILE_SPEED, 470, ag),
      attackWeight: Phaser.Math.Linear(0.5, 0.88, ag),
      walkAttackWeight: Phaser.Math.Linear(0.26, 0.46, ag),
      repositionWeight: Phaser.Math.Linear(0.24, 0.06, ag),
      doubleShotChance: ag > 0.35 ? (ag - 0.35) * 1.3 : 0,
      specialWeight: Phaser.Math.Linear(0.1, 0.32, ag),
      flyDuration: Phaser.Math.Linear(480, 310, ag),
      postAttackDelay: Phaser.Math.Linear(650, 260, ag),
    };
  }

  onAnimComplete(anim) {
    if (this.dead) {
      return;
    }

    if (anim.key === "boss3_hurt") {
      this.isHurting = false;
      this.setIdle();
      this.scheduleThink(450);
      return;
    }

    if (anim.key === "boss3_special") {
      this.isSpecialAttacking = false;
      this.isAttacking = false;
      this.setIdle();
      this.scheduleThink(
        Phaser.Math.Linear(500, 220, this.getAggression()),
      );
      return;
    }

    if (anim.key === "boss3_attack" || anim.key === "boss3_walk_attack") {
      if (this.isSpecialAttacking) {
        return;
      }
      this.isAttacking = false;
      this.stopMovement();
      this.setIdle();
      this.scheduleThink(this.getCombatStats().postAttackDelay);
    }
  }

  /** Bala en línea recta con velocidad fija (sin seguimiento). */
  spawnBulletAtAngle(x, y, angle, speed, damage) {
    const texKey = this.tex("bullet");
    if (!this.scene.textures.exists(texKey)) {
      return;
    }

    const proj = this.projectiles.get(x, y, texKey, 0);
    if (!proj) {
      return;
    }

    proj.setActive(true);
    proj.setVisible(true);
    proj.setScale(BOSS3_SCALE * 0.45);
    proj.setDepth(9);
    proj.setTint(0x66ff88);
    proj.body.setAllowGravity(false);
    proj.damage = damage;
    proj.setData("bossProjectile", true);
    proj.body.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
    );
    proj.lifespan = this.scene.time.now + 3200;
  }

  spawnBulletAtPlayer(player, stats, damage) {
    const origin = this.getWeaponOrigin();
    const angle = Phaser.Math.Angle.Between(
      origin.x,
      origin.y,
      player.sprite.x,
      player.sprite.y,
    );
    this.spawnBulletAtAngle(
      origin.x,
      origin.y,
      angle,
      stats.projectileSpeed,
      damage,
    );
  }

  playShootSound() {
    try {
      if (this.scene.sound) {
        this.scene.sound.play("sfx_boss3_shoot", { volume: 0.6 });
      }
    } catch (e) {
      // Sonido no disponible
    }
  }

  fireAtPlayer(player, moveWhileShooting) {
    if (
      this.dead ||
      this.isHurting ||
      this.isFlying ||
      this.isSpecialAttacking
    ) {
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

    if (moveWhileShooting) {
      this.moveState = "walk";
      this.playBodyAnim("boss3_walk_attack", "walk_attack");
      this.isChasing = true;
      this.scene.physics.moveToObject(
        this.sprite,
        player.sprite,
        stats.walkAttackSpeed,
      );
    } else {
      this.stopMovement();
      this.playBodyAnim("boss3_attack", "attack");
    }

    const damage = 14 + Math.floor(this.getAggression() * 6);
    const fireDelay = Phaser.Math.Linear(210, 120, this.getAggression());

    this.scene.time.delayedCall(fireDelay, () => {
      if (this.dead || this.isSpecialAttacking) {
        return;
      }

      this.playShootSound();
      this.spawnBulletAtPlayer(player, stats, damage);

      if (Math.random() < stats.doubleShotChance) {
        this.scene.time.delayedCall(130, () => {
          if (!this.dead && !this.isSpecialAttacking) {
            this.spawnBulletAtPlayer(player, stats, damage);
          }
        });
      }
    });
  }

  /**
   * Ataque especial: el jefe no se mueve, reproduce boss3_special
   * y dispara muchas balas a la vez en abanico hacia el jugador.
   */
  performSpecialAttack(player) {
    if (
      this.dead ||
      this.isHurting ||
      this.isFlying ||
      this.isSpecialAttacking
    ) {
      return false;
    }

    const now = this.scene.time.now;
    if (now - this.lastSpecialAt < this.getSpecialCooldown()) {
      return false;
    }

    const dist = this.distanceTo(player);
    if (dist > BOSS3_SPECIAL_RANGE) {
      return false;
    }

    this.lastSpecialAt = now;
    this.specialUseCount += 1;
    this.isSpecialAttacking = true;
    this.isAttacking = true;
    this.isChasing = false;
    this.stopMovement();
    this.faceTarget(player);
    this.playBodyAnim("boss3_special", "special");

    const ag = this.getAggression();
    const projectileCount = Math.min(
      4 + this.specialUseCount,
      BOSS3_SPECIAL_MAX_PROJECTILES,
    );
    const damage = 10 + Math.floor(ag * 5);

    this.scene.time.delayedCall(420, () => {
      if (this.dead || !this.isSpecialAttacking) {
        return;
      }
      this.fireSpecialVolley(player, projectileCount, damage);
    });

    return true;
  }

  /** Lanza `count` proyectiles repartidos en un arco centrado en el jugador. */
  fireSpecialVolley(player, count, damage) {
    const origin = this.getWeaponOrigin();
    const baseAngle = Phaser.Math.Angle.Between(
      origin.x,
      origin.y,
      player.sprite.x,
      player.sprite.y,
    );
    const spread = Phaser.Math.DegToRad(
      Phaser.Math.Clamp(28 + count * 2.5, 28, 72),
    );
    const speed =
      BOSS3_PROJECTILE_SPEED + Math.floor(this.getAggression() * 80);

    this.playShootSound();

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const angle = baseAngle - spread / 2 + spread * t;
      this.spawnBulletAtAngle(origin.x, origin.y, angle, speed, damage);
    }
  }

  reposition(player, goUp) {
    if (
      this.dead ||
      this.isHurting ||
      this.isFlying ||
      this.isSpecialAttacking
    ) {
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
      this.sprite.x + side * Phaser.Math.Between(150, 250),
      margin,
      width - margin,
    );
    const targetY = goUp
      ? Phaser.Math.Clamp(
          this.sprite.y - Phaser.Math.Between(70, 130),
          margin,
          height - margin,
        )
      : Phaser.Math.Clamp(
          this.sprite.y + Phaser.Math.Between(55, 110),
          margin,
          height - margin,
        );

    if (goUp) {
      this.playBodyAnim("boss3_fly_up", "fly_up");
    } else {
      this.playBodyAnim("boss3_fly_down", "fly_down");
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
        this.scheduleThink(Phaser.Math.Linear(380, 140, this.getAggression()));
      },
    });
  }

  startChase(player) {
    if (this.isSpecialAttacking) {
      return;
    }

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
          this.scene.sound.play("sfx_boss3_steps", { volume: 0.35 });
        }
      } catch (e) {
        // Sonido no disponible
      }
    }
  }

  /** IA: prioriza especial si está en rango, luego ataque normal o reposición. */
  think(player) {
    const dist = this.distanceTo(player);
    const stats = this.getCombatStats();
    const ag = this.getAggression();
    const roll = Math.random();

    if (
      ag >= 0.15 &&
      dist <= BOSS3_SPECIAL_RANGE &&
      roll < stats.specialWeight &&
      this.performSpecialAttack(player)
    ) {
      return;
    }

    if (dist < BOSS3_ATTACK_RANGE_MIN) {
      this.stopMovement();
      if (roll < stats.attackWeight * 0.7) {
        this.fireAtPlayer(player, roll < stats.walkAttackWeight);
      } else {
        this.reposition(player, Math.random() > 0.5);
      }
      return;
    }

    if (dist >= BOSS3_ATTACK_RANGE_MIN && dist <= BOSS3_ATTACK_RANGE_MAX) {
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

    if (dist > BOSS3_ATTACK_RANGE_MAX) {
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
      this.displayName = "Titán MK-3 — FURIOSO";
    } else if (ag >= 0.33) {
      this.displayName = "Titán MK-3 — AGRESIVO";
    } else {
      this.displayName = "Titán MK-3";
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

    this.hurtAnimCooldownUntil = now + BOSS3_HURT_ANIM_COOLDOWN;

    if (this.isAttacking || this.isFlying || this.isSpecialAttacking) {
      return true;
    }

    this.isHurting = true;
    this.isChasing = false;
    this.stopMovement();

    if (this.flyTween) {
      this.flyTween.stop();
    }

    this.playBodyAnim("boss3_hurt", "hurt");
    return true;
  }

  flashHit() {
    this.sprite.setTint(0xaaffcc);
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
    this.isSpecialAttacking = false;
    this.stopMovement();

    this.projectiles.getChildren().forEach((p) => {
      p.setActive(false);
      p.setVisible(false);
    });

    if (this.flyTween) {
      this.flyTween.stop();
    }

    this.playBodyAnim("boss3_death", "death");
    this.sprite.once("animationcomplete-boss3_death", () => {
      this.scene.onBossDefeated();
    });
  }

  update(player) {
    this.updateProjectiles();

    if (this.dead) {
      return;
    }

    this.faceTarget(player);

    if (this.isHurting || this.isFlying || this.isSpecialAttacking) {
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

      if (dist <= BOSS3_ATTACK_RANGE_MAX) {
        this.stopMovement();
        this.setIdle();
        if (
          dist >= BOSS3_ATTACK_RANGE_MIN &&
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

    if (dist > BOSS3_ATTACK_RANGE_MAX + 50) {
      this.startChase(player);
    } else {
      this.stopMovement();
      this.setIdle();
    }
  }
}
