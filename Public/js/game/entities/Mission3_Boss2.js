/**
 * MISIÓN 3 — Boss principal (Andronimus)
 * Archivo: Mission3_Boss2.js | Entidad manifest: boss2 | Background: Background3
 *
 * Especial: rayos rectos desde los cañones; cada uso lanza más rayos y enfriamiento menor.
 */

/** Estadísticas y rangos de combate del jefe. */
const BOSS2_MAX_HP = 480;
const BOSS2_SPEED = 135;
const BOSS2_SCALE = 4.1;
const BOSS2_ATTACK_RANGE_MIN = 220;
const BOSS2_ATTACK_RANGE_MAX = 620;
const BOSS2_PROJECTILE_SPEED = 360;
const BOSS2_FIRE_COOLDOWN = 1000;
const BOSS2_HURT_ANIM_COOLDOWN = 260;
const BOSS2_MOVE_THRESHOLD = 12;
const BOSS2_SPECIAL_COOLDOWN = 8500;
const BOSS2_SPECIAL_COOLDOWN_MIN = 4500;
const BOSS2_SPECIAL_RANGE = 520;
const BOSS2_SPECIAL_BEAM_SPEED = 500;
const BOSS2_SPECIAL_BEAM_MAX = 10;

class Boss2 {
  constructor(scene, x, y) {
    this.scene = scene;
    this.id = "boss2";
    this.displayName = "Andronimus";
    this.specialUseCount = 0;
    this.maxHp = BOSS2_MAX_HP;
    this.hp = BOSS2_MAX_HP;
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
    this.sprite.setScale(BOSS2_SCALE);
    this.sprite.setDepth(8);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setFlipX(true);
    this.sprite.setData("isBoss", true);

    this.projectiles = scene.physics.add.group({ maxSize: 16 });
    this.shockwaves = scene.physics.add.group({ maxSize: 24 });

    this.setupBody();
    this.setIdle();
    this.sprite.on("animationcomplete", this.onAnimComplete, this);
    this.scheduleThink(1100);
  }

  static createAnimations(scene) {
    const bodyAnims = [
      { anim: "boss2_idle", sheet: "idle", frames: 4, rate: 6, repeat: -1 },
      { anim: "boss2_walk", sheet: "walk", frames: 6, rate: 10, repeat: -1 },
      { anim: "boss2_attack", sheet: "attack", frames: 6, rate: 14, repeat: 0 },
      {
        anim: "boss2_walk_attack",
        sheet: "walk_attack",
        frames: 6,
        rate: 12,
        repeat: 0,
      },
      { anim: "boss2_hurt", sheet: "hurt", frames: 2, rate: 10, repeat: 0 },
      { anim: "boss2_death", sheet: "death", frames: 6, rate: 9, repeat: 0 },
      { anim: "boss2_fly_up", sheet: "fly_up", frames: 4, rate: 11, repeat: 0 },
      {
        anim: "boss2_fly_down",
        sheet: "fly_down",
        frames: 6,
        rate: 11,
        repeat: 0,
      },
    ];

    const shockwaveAnims = [
      {
        anim: "boss2_special",
        sheet: "special",
        frames: 6,
        rate: 14,
        repeat: 0,
      },
    ];

    const projAnims = [
      {
        anim: "boss2_proj_special1",
        sheet: "special1",
        frames: 6,
        rate: 16,
        repeat: -1,
      },
      {
        anim: "boss2_proj_special2",
        sheet: "special2",
        frames: 4,
        rate: 14,
        repeat: -1,
      },
    ];

    [...bodyAnims, ...shockwaveAnims, ...projAnims].forEach((d) => {
      if (scene.anims.exists(d.anim)) return; // Evitar duplicados
      Boss2.createAnimFromSheet(scene, d.anim, "boss2", d.sheet, d.frames, d.rate, d.repeat);
    });
  }

  static createAnimFromSheet(scene, animKey, manifestId, sheetKey, frameCount, rate, repeat) {
    try {
      const tex = EntityLoader.textureKey(manifestId, sheetKey);
      if (!scene.textures.exists(tex)) {
        console.warn(`[Boss2] Texture ${tex} does not exist yet`);
        return;
      }
      if (scene.anims.exists(animKey)) {
        return;
      }

      const availableFrames = scene.textures.get(tex).frameTotal;
      const endFrame = Math.min(frameCount, availableFrames) - 1;
      if (endFrame < 0) {
        console.warn(`[Boss2] No frames for ${tex}`);
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
      console.error(`[Boss2] Error creating animation ${animKey}:`, e);
    }
  }

  tex(sheetKey) {
    return EntityLoader.textureKey(this.id, sheetKey);
  }

  setupBody() {
    // Hitbox reducida para ser más justo con el jugador (antes 72x86)
    const w = 55;
    const h = 75;
    this.sprite.body.setSize(w, h);
    this.sprite.body.setOffset(20, 15);
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
    return body && body.velocity.length() > BOSS2_MOVE_THRESHOLD;
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
      this.playBodyAnim("boss2_idle", "idle");
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
      this.playBodyAnim("boss2_walk", "walk");
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

  /** Orígenes de los dos cañones (brazos) en coordenadas de mundo. */
  getWeaponOrigins() {
    const w = this.sprite.displayWidth;
    const h = this.sprite.displayHeight;
    const forward = this.facing;
    const muzzleX = this.sprite.x + forward * w * 0.26;
    const armSep = w * 0.11;
    const armY = this.sprite.y - h * 0.1;

    return [
      { x: muzzleX - armSep, y: armY },
      { x: muzzleX + armSep, y: armY },
    ];
  }

  getSpecialCooldown() {
    const ag = this.getAggression();
    const reduction = (this.specialUseCount - 1) * 380;
    return Phaser.Math.Clamp(
      BOSS2_SPECIAL_COOLDOWN - reduction,
      BOSS2_SPECIAL_COOLDOWN_MIN,
      BOSS2_SPECIAL_COOLDOWN,
    ) * Phaser.Math.Linear(1, 0.82, ag);
  }

  playBodyAnim(animKey, sheetKey) {
    if (this.sprite.anims.currentAnim?.key === animKey) {
      return;
    }
    this.sprite.setTexture(this.tex(sheetKey));
    this.sprite.setScale(BOSS2_SCALE);
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
      fireCooldown: Phaser.Math.Linear(BOSS2_FIRE_COOLDOWN, 380, ag),
      thinkMin: Phaser.Math.Linear(850, 250, ag),
      thinkMax: Phaser.Math.Linear(1300, 420, ag),
      moveSpeed: Phaser.Math.Linear(BOSS2_SPEED, 195, ag),
      walkAttackSpeed: Phaser.Math.Linear(BOSS2_SPEED * 0.65, 160, ag),
      projectileSpeed: Phaser.Math.Linear(BOSS2_PROJECTILE_SPEED, 480, ag),
      attackWeight: Phaser.Math.Linear(0.52, 0.9, ag),
      walkAttackWeight: Phaser.Math.Linear(0.28, 0.48, ag),
      repositionWeight: Phaser.Math.Linear(0.22, 0.05, ag),
      doubleShotChance: ag > 0.35 ? (ag - 0.35) * 1.4 : 0,
      specialWeight: Phaser.Math.Linear(0.08, 0.28, ag),
      flyDuration: Phaser.Math.Linear(480, 300, ag),
      postAttackDelay: Phaser.Math.Linear(650, 250, ag),
    };
  }

  onAnimComplete(anim) {
    if (this.dead) {
      return;
    }

    if (anim.key === "boss2_hurt") {
      this.isHurting = false;
      this.setIdle();
      this.scheduleThink(450);
      return;
    }

    if (anim.key === "boss2_attack" || anim.key === "boss2_walk_attack") {
      this.isAttacking = false;
      this.stopMovement();
      this.setIdle();
      this.scheduleThink(this.getCombatStats().postAttackDelay);
    }
  }

  spawnProjectile(type, player, stats) {
    const s = stats || this.getCombatStats();
    const isType1 = type === 1;
    const sheet = isType1 ? "special1" : "special2";
    const anim = isType1 ? "boss2_proj_special1" : "boss2_proj_special2";
    const damage = isType1
      ? 16 + Math.floor(this.getAggression() * 5)
      : 22 + Math.floor(this.getAggression() * 7);
    const scale = BOSS2_SCALE * 0.55;

    try {
      if (this.scene.sound) {
        const shootSounds = ["sfx_boss_shoot", "sfx_boss_shoot_alt"];
        const randomSound = shootSounds[Math.floor(Math.random() * shootSounds.length)];
        this.scene.sound.play(randomSound, { volume: 0.65 });
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
    proj.setTint(isType1 ? 0xff66cc : 0xff3399);
    proj.setData("bossProjectile", true);
    proj.play(anim);

    this.scene.physics.moveToObject(proj, player.sprite, s.projectileSpeed);
    proj.lifespan = this.scene.time.now + 3200;
  }

  /**
   * Ataque especial: alterna cañones y dispara rayos rectos (Special.png).
   * specialUseCount aumenta la cantidad de rayos por activación.
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
    if (dist > BOSS2_SPECIAL_RANGE) {
      return false;
    }

    this.lastSpecialAt = now;
    this.specialUseCount += 1;
    this.isSpecialAttacking = true;
    this.isAttacking = true;
    this.isChasing = false;
    this.stopMovement();
    this.faceTarget(player);
    this.playBodyAnim("boss2_attack", "attack");

    const ag = this.getAggression();
    const damage = 24 + Math.floor(ag * 12);
    const beamCount = Math.min(1 + this.specialUseCount, BOSS2_SPECIAL_BEAM_MAX);
    const origins = this.getWeaponOrigins();
    const staggerMs = 100;

    for (let i = 0; i < beamCount; i++) {
      const origin = origins[i % origins.length];
      this.scene.time.delayedCall(200 + i * staggerMs, () => {
        if (this.dead) {
          return;
        }
        this.spawnStraightBeam(origin.x, origin.y, player, damage);
      });
    }

    const finishDelay = 200 + beamCount * staggerMs + 750;
    this.scene.time.delayedCall(finishDelay, () => {
      if (this.dead) {
        return;
      }
      this.isSpecialAttacking = false;
      this.isAttacking = false;
      this.setIdle();
      this.scheduleThink(Phaser.Math.Linear(500, 200, ag));
    });

    return true;
  }

  /** Un rayo en línea recta desde el cañón hacia la posición actual del jugador. */
  spawnStraightBeam(originX, originY, player, damage) {
    const texKey = this.tex("special");
    if (!this.scene.textures.exists(texKey)) {
      console.warn("[Boss2] Shockwave texture missing:", texKey);
      return;
    }

    const targetX = player.sprite.x;
    const targetY = player.sprite.y;
    const angle = Phaser.Math.Angle.Between(originX, originY, targetX, targetY);
    const speed =
      BOSS2_SPECIAL_BEAM_SPEED + Math.floor(this.getAggression() * 90);

    const wave = this.shockwaves.get(originX, originY, texKey, 0);
    if (!wave) {
      return;
    }

    const frame = this.scene.textures.get(texKey).get(0);
    const frameW = frame?.width || 96;
    const frameH = frame?.height || 96;

    wave.setActive(true);
    wave.setVisible(true);
    wave.setDepth(7);
    wave.setAlpha(0.94);
    wave.setTint(0xff55cc);
    wave.setRotation(angle + Math.PI / 2);
    wave.setScale(0.45, 1.35);
    wave.damage = damage;
    wave.setData("bossShockwave", true);
    wave.setData("hasHitPlayer", false);
    wave.body.setAllowGravity(false);
    wave.body.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
    );
    wave.lifespan = this.scene.time.now + 4500;

    const hitRadius = 28;
    wave.body.setCircle(hitRadius);
    wave.body.setOffset(
      frameW / 2 - hitRadius,
      frameH / 2 - hitRadius,
    );

    this.playShockwaveAnim(wave);

    try {
      if (this.scene.sound) {
        const shootSounds = ["sfx_boss_shoot", "sfx_boss_shoot_alt"];
        const randomSound = shootSounds[Math.floor(Math.random() * shootSounds.length)];
        this.scene.sound.play(randomSound, { volume: 0.5 });
      }
    } catch (e) {
      // Sonido no disponible
    }
  }

  playShockwaveAnim(wave) {
    if (this.scene.anims.exists("boss2_special")) {
      wave.play("boss2_special");
      wave.once("animationcomplete-boss2_special", () => {
        if (wave.active) {
          wave.anims.stop();
        }
      });
      return;
    }

    const texKey = this.tex("special");
    const total = this.scene.textures.get(texKey).frameTotal;
    let frame = 0;
    wave.setFrame(0);

    const timer = this.scene.time.addEvent({
      delay: 80,
      repeat: Math.max(0, total - 1),
      callback: () => {
        if (!wave.active) {
          return;
        }
        frame = Math.min(frame + 1, total - 1);
        wave.setFrame(frame);
      },
    });

    wave.setData("shockwaveFrameTimer", timer);
  }

  stopShockwaveAnim(wave) {
    const timer = wave.getData("shockwaveFrameTimer");
    if (timer) {
      timer.remove(false);
      wave.setData("shockwaveFrameTimer", null);
    }
    if (wave.anims) {
      wave.anims.stop();
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

    const projectileType = Math.random() > 0.4 ? 1 : 2;

    if (moveWhileShooting) {
      this.moveState = "walk";
      this.playBodyAnim("boss2_walk_attack", "walk_attack");
      this.isChasing = true;
      this.scene.physics.moveToObject(
        this.sprite,
        player.sprite,
        stats.walkAttackSpeed,
      );
    } else {
      this.stopMovement();
      this.playBodyAnim("boss2_attack", "attack");
    }

    const fireDelay = Phaser.Math.Linear(200, 100, this.getAggression());

    this.scene.time.delayedCall(fireDelay, () => {
      if (this.dead) {
        return;
      }

      this.spawnProjectile(projectileType, player, stats);

      if (Math.random() < stats.doubleShotChance) {
        this.scene.time.delayedCall(130, () => {
          if (!this.dead) {
            this.spawnProjectile(Math.random() > 0.5 ? 1 : 2, player, stats);
          }
        });
      }
    });
  }

  reposition(player, goUp) {
    if (this.dead || this.isHurting || this.isFlying || this.isSpecialAttacking) {
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
      this.playBodyAnim("boss2_fly_up", "fly_up");
    } else {
      this.playBodyAnim("boss2_fly_down", "fly_down");
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
        this.scheduleThink(Phaser.Math.Linear(380, 130, this.getAggression()));
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
    if (speed > 0 && this.scene.time.now - this.lastStepAt > 350) {
      this.lastStepAt = this.scene.time.now;
      try {
        if (this.scene.sound) {
          const stepSounds = ["sfx_step_boss", "sfx_step_boss_long"];
          const randomStep = stepSounds[Math.floor(Math.random() * stepSounds.length)];
          this.scene.sound.play(randomStep, { volume: 0.4 });
        }
      } catch (e) {
        // Sonido no disponible
      }
    }
  }

  /** IA con prioridad de especial en rango medio; resto igual que Boss1. */
  think(player) {
    const dist = this.distanceTo(player);
    const stats = this.getCombatStats();
    const ag = this.getAggression();
    const roll = Math.random();

    if (
      ag >= 0.2 &&
      dist <= BOSS2_SPECIAL_RANGE &&
      roll < stats.specialWeight &&
      this.performSpecialAttack(player)
    ) {
      return;
    }

    if (dist < BOSS2_ATTACK_RANGE_MIN) {
      this.stopMovement();
      if (roll < stats.attackWeight * 0.7) {
        this.fireAtPlayer(player, roll < stats.walkAttackWeight);
      } else {
        this.reposition(player, Math.random() > 0.5);
      }
      return;
    }

    if (dist >= BOSS2_ATTACK_RANGE_MIN && dist <= BOSS2_ATTACK_RANGE_MAX) {
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

    if (dist > BOSS2_ATTACK_RANGE_MAX) {
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
    if (this.dead || this.isInvulnerable) {
      return false;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.scene.events.emit("boss-hp-changed");

    // ► SISTEMA ANTI STUN-LOCK (Recovery)
    this.isInvulnerable = true;
    this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
            if (this.sprite) this.sprite.setAlpha(1);
            this.isInvulnerable = false;
        }
    });

    const ag = this.getAggression();
    if (ag >= 0.66) {
      this.displayName = "Andronimus — FURIOSO";
    } else if (ag >= 0.33) {
      this.displayName = "Andronimus — AGRESIVO";
    } else {
      this.displayName = "Andronimus";
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

    this.hurtAnimCooldownUntil = now + BOSS2_HURT_ANIM_COOLDOWN;

    if (this.isAttacking || this.isFlying || this.isSpecialAttacking) {
      return true;
    }

    this.isHurting = true;
    this.isChasing = false;
    this.stopMovement();

    if (this.flyTween) {
      this.flyTween.stop();
    }

    this.playBodyAnim("boss2_hurt", "hurt");
    return true;
  }

  flashHit() {
    this.sprite.setTint(0xffaaff);
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
    this.shockwaves.getChildren().forEach((w) => {
      w.setActive(false);
      w.setVisible(false);
    });

    if (this.flyTween) {
      this.flyTween.stop();
    }

    try {
      if (this.scene.sound) {
        this.scene.sound.play("explosion", { volume: 0.8 });
      }
    } catch (e) {}

    this.playBodyAnim("boss2_death", "death");

    // Temporizador de seguridad (Fallback)
    const fallbackTimer = this.scene.time.delayedCall(2500, () => {
        this.scene.onBossDefeated();
    });

    this.sprite.once("animationcomplete-boss2_death", () => {
        fallbackTimer.remove();
        this.scene.onBossDefeated();
    });
  }

  /** Destruye rayos que salen del mundo jugable (MISSION_WORLD_MARGIN implícito en bounds). */
  updateShockwaves() {
    const bounds = this.scene.physics.world.bounds;

    this.shockwaves.getChildren().forEach((wave) => {
      if (!wave.active) {
        return;
      }

      const out =
        wave.x < bounds.x - 80 ||
        wave.x > bounds.width + 80 ||
        wave.y < bounds.y - 80 ||
        wave.y > bounds.height + 80;

      if (out || this.scene.time.now > wave.lifespan) {
        this.stopShockwaveAnim(wave);
        wave.setActive(false);
        wave.setVisible(false);
        wave.body.stop();
      }
    });
  }

  update(player) {
    this.updateProjectiles();
    this.updateShockwaves();

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

      if (dist <= BOSS2_ATTACK_RANGE_MAX) {
        this.stopMovement();
        this.setIdle();
        if (
          dist >= BOSS2_ATTACK_RANGE_MIN &&
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

    if (dist > BOSS2_ATTACK_RANGE_MAX + 50) {
      this.startChase(player);
    } else {
      this.stopMovement();
      this.setIdle();
    }
  }
}
