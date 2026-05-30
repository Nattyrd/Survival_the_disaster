/**
 * DESTROYER - Enemigo de nivel 2
 * Versión más simple y rápida que Boss1, sin habilidad de volar
 * Estadísticas ajustadas para crear desafío intermedio
 */

const DESTROYER_MAX_HP = 200;
const DESTROYER_SPEED = 180;
const DESTROYER_SCALE = 2.5;
const DESTROYER_ATTACK_RANGE_MIN = 150;
const DESTROYER_ATTACK_RANGE_MAX = 480;
const DESTROYER_PROJECTILE_SPEED = 380;
const DESTROYER_FIRE_COOLDOWN = 800;
const DESTROYER_HURT_ANIM_COOLDOWN = 250;
const DESTROYER_MOVE_THRESHOLD = 12;
const DESTROYER_MELEE_RANGE = 180;
const DESTROYER_MELEE_DURATION = 1000;

class Destroyer {
  constructor(scene, x, y) {
    this.scene = scene;
    this.id = "destroyer";
    this.displayName = "Destroyer";
    this.maxHp = DESTROYER_MAX_HP;
    this.hp = DESTROYER_MAX_HP;
    this.dead = false;
    this.isHurting = false;
    this.isAttacking = false;
    this.isChasing = false;
    this.isMeleeAttacking = false;
    this.meleeAttackEndAt = 0;
    this.moveState = "idle";
    this.lastFireAt = 0;
    this.lastStepAt = 0; // Para sonido de pasos
    this.hurtAnimCooldownUntil = 0;
    this.nextThinkAt = 0;
    this.facing = -1;

    this.sprite = scene.physics.add.sprite(x, y, this.tex("idle"), 0);
    this.sprite.setScale(DESTROYER_SCALE);
    this.sprite.setDepth(8);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setFlipX(true);
    this.sprite.setData("isEnemy", true);

    this.projectiles = scene.physics.add.group({ maxSize: 12 });

    this.setupBody();
    this.setIdle();
    this.sprite.on("animationcomplete", this.onAnimComplete, this);
    this.scheduleThink(1000);
  }

  static createAnimations(scene) {
    const bodyAnims = [
      { anim: "destroyer_idle", sheet: "idle", frames: 4, rate: 6, repeat: -1 },
      {
        anim: "destroyer_walk",
        sheet: "walk",
        frames: 6,
        rate: 10,
        repeat: -1,
      },
      {
        anim: "destroyer_charge",
        sheet: "charge",
        frames: 1,
        rate: 10,
        repeat: 0,
      },
      {
        anim: "destroyer_charge2",
        sheet: "charge2",
        frames: 2,
        rate: 12,
        repeat: 0,
      },
      { anim: "destroyer_hurt", sheet: "hurt", frames: 2, rate: 10, repeat: 0 },
      {
        anim: "destroyer_death",
        sheet: "death",
        frames: 6,
        rate: 9,
        repeat: 0,
      },
    ];

    const projAnims = [
      {
        anim: "destroyer_proj_attack1",
        sheet: "special1",
        frames: 6,
        rate: 16,
        repeat: -1,
      },
      {
        anim: "destroyer_proj_attack2",
        sheet: "special2",
        frames: 4,
        rate: 14,
        repeat: -1,
      },
    ];

    [...bodyAnims, ...projAnims].forEach((d) => {
      try {
        const tex = EntityLoader.textureKey("destroyer", d.sheet);
        if (!scene.textures.exists(tex)) {
          console.warn(`[Destroyer] Texture ${tex} does not exist yet`);
          return;
        }
        if (scene.anims.exists(d.anim)) {
          console.warn(`[Destroyer] Animation ${d.anim} already exists`);
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
        console.error(`[Destroyer] Error creating animation ${d.anim}:`, e);
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
    return body && body.velocity.length() > DESTROYER_MOVE_THRESHOLD;
  }

  setIdle() {
    this.moveState = "idle";
    this.stopMovement();
    this.lastStepAt = 0; // Resetear contador de pasos
    if (!this.dead && !this.isHurting && !this.isAttacking) {
      this.playBodyAnim("destroyer_idle", "idle");
    }
  }

  setWalk() {
    if (this.dead || this.isHurting || this.isAttacking) {
      return;
    }
    if (this.moveState !== "walk") {
      this.moveState = "walk";
      this.playBodyAnim("destroyer_walk", "walk");
    }
  }

  syncMovementAnimation() {
    if (this.dead || this.isHurting || this.isAttacking) {
      return;
    }

    if (this.isMoving()) {
      this.setWalk();
    } else {
      if (this.moveState !== "idle") {
        this.setIdle();
      }
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
    this.sprite.setScale(DESTROYER_SCALE);
    this.sprite.play(animKey);
  }

  scheduleThink(delay) {
    this.nextThinkAt = this.scene.time.now + delay;
  }

  /** 0 = vida llena, 1 = vida crítica */
  getAggression() {
    return 1 - Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
  }

  getCombatStats() {
    const ag = this.getAggression();

    return {
      fireCooldown: Phaser.Math.Linear(DESTROYER_FIRE_COOLDOWN, 350, ag),
      thinkMin: Phaser.Math.Linear(800, 250, ag),
      thinkMax: Phaser.Math.Linear(1200, 400, ag),
      moveSpeed: Phaser.Math.Linear(DESTROYER_SPEED, 240, ag),
      projectileSpeed: Phaser.Math.Linear(DESTROYER_PROJECTILE_SPEED, 500, ag),
      attackWeight: Phaser.Math.Linear(0.6, 0.85, ag),
      chaseWeight: Phaser.Math.Linear(0.4, 0.15, ag),
    };
  }

  onAnimComplete(anim) {
    if (this.dead) {
      return;
    }

    if (anim.key === "destroyer_hurt") {
      this.isHurting = false;
      this.setIdle();
      this.scheduleThink(400);
      return;
    }

    if (anim.key === "destroyer_charge" || anim.key === "destroyer_charge2") {
      this.isAttacking = false;
      this.stopMovement();
      this.setIdle();
      this.scheduleThink(this.getCombatStats().thinkMin);
    }
  }

  spawnProjectile(type, player, stats) {
    const s = stats || this.getCombatStats();
    const isType1 = type === 1;
    const sheet = isType1 ? "special1" : "special2";
    const anim = isType1 ? "destroyer_proj_attack1" : "destroyer_proj_attack2";
    const damage = isType1
      ? 10 + Math.floor(this.getAggression() * 3)
      : 12 + Math.floor(this.getAggression() * 5);
    const scale = 0.4; // Proyectil pequeño pero visible

    const offsetX = this.facing * 45;
    const proj = this.projectiles.get(
      this.sprite.x + offsetX,
      this.sprite.y - 5,
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
    proj.setData("enemyProjectile", true);
    proj.lifespan = this.scene.time.now + 5000; // 5 segundos de vida
    proj.play(anim);

    this.scene.physics.moveToObject(proj, player.sprite, s.projectileSpeed);
    proj.lifespan = this.scene.time.now + 3000;

    // Reproducir sonido de disparo
    try {
      if (this.scene.sound) {
        this.scene.sound.play("sfx_destroyer_shoot", { volume: 0.6 });
      }
    } catch (e) {
      // Sonido no disponible
    }
  }

  fireAtPlayer(player) {
    if (this.dead || this.isHurting || this.isAttacking) {
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

    const projectileType = Math.random() > 0.5 ? 1 : 2;

    this.stopMovement();
    this.setIdle();

    const fireDelay = Phaser.Math.Linear(180, 100, this.getAggression());

    this.scene.time.delayedCall(fireDelay, () => {
      if (this.dead || !this.isAttacking) {
        return;
      }

      this.spawnProjectile(projectileType, player, stats);
    });

    // Terminar ataque después de 600ms
    this.scene.time.delayedCall(600, () => {
      this.isAttacking = false;
      this.scheduleThink(300);
    });
  }

  think(player) {
    // Si está atacando, no hacer nada hasta que termine
    if (this.isAttacking || this.isMeleeAttacking) {
      return;
    }

    const dist = this.distanceTo(player);
    const stats = this.getCombatStats();

    // Muy cerca (< 180px): ataque melee rápido
    if (dist < DESTROYER_MELEE_RANGE) {
      this.startMeleeAttack(player);
      return;
    }

    // En rango medio (180-480px): disparar o retroceder
    if (dist >= DESTROYER_MELEE_RANGE && dist <= DESTROYER_ATTACK_RANGE_MAX) {
      this.stopMovement();
      const roll = Math.random();
      if (roll < stats.attackWeight) {
        this.fireAtPlayer(player);
      } else {
        // Retroceder un poco
        this.startBackup(player);
      }
      return;
    }

    // Fuera de rango: perseguir
    if (dist > DESTROYER_ATTACK_RANGE_MAX) {
      this.startChase(player);
    }
  }

  startMeleeAttack(player) {
    this.isMeleeAttacking = true;
    this.isAttacking = true;
    this.meleeAttackEndAt = this.scene.time.now + DESTROYER_MELEE_DURATION;
    this.isChasing = false;
    this.faceTarget(player);

    // Usar animación walk (mantiene tamaño correcto) durante la carga
    this.setWalk();
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      player.sprite.x,
      player.sprite.y,
    );
    const speed = DESTROYER_SPEED * 2; // Muy rápido en carga
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    this.sprite.setVelocity(vx, vy);

    // Auto-terminar después de DESTROYER_MELEE_DURATION
    this.scene.time.delayedCall(DESTROYER_MELEE_DURATION, () => {
      this.isMeleeAttacking = false;
      this.isAttacking = false;
      this.stopMovement();
      this.setIdle();
      // Esperar antes de siguiente acción
      this.scheduleThink(500);
    });
  }

  startBackup(player) {
    // Retroceder (moverse en dirección opuesta al jugador)
    this.isChasing = false;
    this.faceTarget(player);
    const angle = Phaser.Math.Angle.Between(
      player.sprite.x,
      player.sprite.y,
      this.sprite.x,
      this.sprite.y,
    );
    const vx = Math.cos(angle) * DESTROYER_SPEED;
    const vy = Math.sin(angle) * DESTROYER_SPEED;
    this.sprite.setVelocity(vx, vy);
    this.setWalk();

    // Después de 1.5 segundos, volver a idle y pensar
    this.scene.time.delayedCall(1500, () => {
      this.stopMovement();
      this.setIdle();
      this.scheduleThink(300);
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

    // Reproducir sonido de pasos cada 300ms (solo si se está moviendo)
    const speed = Math.sqrt(
      this.sprite.body.velocity.x ** 2 + this.sprite.body.velocity.y ** 2,
    );
    if (speed > 0 && this.scene.time.now - this.lastStepAt > 300) {
      this.lastStepAt = this.scene.time.now;
      try {
        if (this.scene.sound) {
          this.scene.sound.play("sfx_destroyer_steps", { volume: 0.3 });
        }
      } catch (e) {
        // Sonido no disponible
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
    this.scene.events.emit("enemy-hp-changed");

    const ag = this.getAggression();
    if (ag >= 0.66) {
      this.displayName = "Destroyer — ¡FURIOSO!";
    } else if (ag >= 0.33) {
      this.displayName = "Destroyer — AGRESIVO";
    } else {
      this.displayName = "Destroyer";
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

    this.hurtAnimCooldownUntil = now + DESTROYER_HURT_ANIM_COOLDOWN;

    if (this.isAttacking) {
      return true;
    }

    this.isHurting = true;
    this.isChasing = false;
    this.stopMovement();

    this.playBodyAnim("destroyer_hurt", "hurt");
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
    this.isChasing = false;
    this.stopMovement();

    this.projectiles.getChildren().forEach((p) => {
      p.setActive(false);
      p.setVisible(false);
    });

    this.playBodyAnim("destroyer_death", "death");
    this.sprite.once("animationcomplete-destroyer_death", () => {
      this.scene.onEnemyDefeated();
    });
  }

  update(player) {
    this.updateProjectiles();

    if (this.dead) {
      return;
    }

    this.faceTarget(player);

    if (this.isHurting) {
      return;
    }

    const stats = this.getCombatStats();

    if (this.isAttacking) {
      return;
    }

    if (this.scene.time.now >= this.nextThinkAt) {
      this.think(player);
      this.scheduleThink(Phaser.Math.Between(stats.thinkMin, stats.thinkMax));
    }

    if (this.isChasing) {
      const dist = this.distanceTo(player);

      if (dist <= DESTROYER_ATTACK_RANGE_MAX) {
        this.stopMovement();
        this.setIdle();
        if (
          dist >= DESTROYER_ATTACK_RANGE_MIN &&
          this.scene.time.now >= this.lastFireAt + stats.fireCooldown * 0.5
        ) {
          this.fireAtPlayer(player);
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

    if (dist > DESTROYER_ATTACK_RANGE_MAX + 50) {
      this.startChase(player);
    } else {
      this.stopMovement();
      this.setIdle();
    }
  }
}
