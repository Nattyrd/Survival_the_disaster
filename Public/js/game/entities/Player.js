const PLAYER_SPEED = 320;
const BULLET_SPEED = 560;
const BULLET_SCALE_FACTOR = 0.4;
const FIRE_COOLDOWN_MS = 350;
const PLAYER_MAX_HP = 100;
const PLAYER_BULLET_DAMAGE = 8;
const PLAYER_INVULN_MS = 900;

function getPlayerScale(gameHeight) {
  return (gameHeight * 0.22) / SPRITE_FRAME_SIZE;
}

class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.id = "hero";
    this.maxHp = PLAYER_MAX_HP;
    this.hp = PLAYER_MAX_HP;
    this.isDead = false;
    this.isDying = false;
    this.invulnerableUntil = 0;
    this.hasWeapon = false;
    this.isJumping = false;
    this.isAttacking = false;
    this.lastFireAt = 0;
    this.lastStepAt = 0; // Para sonido de pasos
    this.bulletDamage = PLAYER_BULLET_DAMAGE;

    const scale = getPlayerScale(scene.scale.height);
    this.scale = scale;
    this.jumpLift = scene.scale.height * 0.14;

    this.sprite = scene.physics.add.sprite(x, y, this.tex("stand"), 0);
    this.sprite.setScale(scale);
    this.sprite.setDepth(10);
    this.sprite.setCollideWorldBounds(true);
    this.setupBody();

    this.bullets = scene.physics.add.group({
      defaultKey: EntityLoader.textureKey("hero", "bullet"),
      maxSize: 24,
    });

    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      weapon: Phaser.Input.Keyboard.KeyCodes.TWO,
    });

    this.sprite.on("animationcomplete", this.onAnimComplete, this);
    this.playIdle();
  }

  equipWeaponForMission() {
    this.hasWeapon = true;
    this.playIdle();
  }

  canAct() {
    return !this.isDead && !this.isDying && this.hp > 0;
  }

  takeDamage(amount) {
    if (!this.canAct() || this.scene.time.now < this.invulnerableUntil) {
      return;
    }

    this.hp -= amount;
    this.invulnerableUntil = this.scene.time.now + PLAYER_INVULN_MS;
    this.sprite.setTint(0xff6b6b);
    this.scene.time.delayedCall(120, () => {
      if (this.sprite.active) {
        this.sprite.clearTint();
      }
    });

    this.scene.events.emit("player-hp-changed");

    if (this.hp <= 0) {
      this.hp = 0;
      this.playDeath();
    }
  }

  playDeath() {
    if (this.isDying || this.isDead) {
      return;
    }

    this.isDying = true;
    this.isDead = true;
    this.isJumping = false;
    this.isAttacking = false;

    if (this.jumpTween) {
      this.jumpTween.stop();
    }

    this.sprite.body.setVelocity(0, 0);
    this.sprite.clearTint();

    this.bullets.getChildren().forEach((b) => {
      b.setActive(false);
      b.setVisible(false);
      if (b.body) {
        b.body.stop();
      }
    });

    if (this.scene.combatActive !== undefined) {
      this.scene.combatActive = false;
    }
    if (this.scene.boss) {
      this.scene.boss.stopMovement();
    }

    this.sprite.setTexture(this.tex("died"));
    this.sprite.setScale(this.scale);
    this.sprite.play("hero_death");

    this.sprite.once("animationcomplete-hero_death", () => {
      this.scene.onPlayerDefeated();
    });
  }

  static createAnimations(scene) {
    const m = ENTITY_MANIFESTS.hero;
    const defs = [
      { anim: "hero_stand", sheet: "stand", frames: 5, rate: 6, repeat: -1 },
      { anim: "hero_walk", sheet: "walk", frames: 13, rate: 14, repeat: -1 },
      { anim: "hero_jump", sheet: "jump", frames: 9, rate: 14, repeat: 0 },
      {
        anim: "hero_stand_weapon",
        sheet: "stand_weapon",
        frames: 4,
        rate: 6,
        repeat: -1,
      },
      {
        anim: "hero_walk_weapon",
        sheet: "walk_weapon",
        frames: 8,
        rate: 14,
        repeat: -1,
      },
      {
        anim: "hero_jump_weapon",
        sheet: "jump_weapon",
        frames: 9,
        rate: 14,
        repeat: 0,
      },
      { anim: "hero_attack", sheet: "attack", frames: 6, rate: 16, repeat: 0 },
      {
        anim: "hero_bullet_fly",
        sheet: "bullet",
        frames: 7,
        rate: 18,
        repeat: -1,
      },
      { anim: "hero_death", sheet: "died", frames: 8, rate: 10, repeat: 0 },
    ];

    defs.forEach((d) => {
      try {
        const tex = EntityLoader.textureKey(m.id, d.sheet);
        if (!scene.textures.exists(tex)) {
          console.warn(`[Player] Texture ${tex} does not exist yet`);
          return;
        }
        if (scene.anims.exists(d.anim)) {
          console.warn(`[Player] Animation ${d.anim} already exists`);
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
        console.error(`[Player] Error creating animation ${d.anim}:`, e);
      }
    });
  }

  tex(sheetKey) {
    return EntityLoader.textureKey(this.id, sheetKey);
  }

  animIdle() {
    return this.hasWeapon ? "hero_stand_weapon" : "hero_stand";
  }

  animWalk() {
    return this.hasWeapon ? "hero_walk_weapon" : "hero_walk";
  }

  animJump() {
    return this.hasWeapon ? "hero_jump_weapon" : "hero_jump";
  }

  sheetIdle() {
    return this.hasWeapon ? "stand_weapon" : "stand";
  }

  sheetWalk() {
    return this.hasWeapon ? "walk_weapon" : "walk";
  }

  sheetJump() {
    return this.hasWeapon ? "jump_weapon" : "jump";
  }

  setupBody() {
    const hitW = SPRITE_FRAME_SIZE * 0.55;
    const hitH = SPRITE_FRAME_SIZE * 0.75;
    this.sprite.body.setSize(hitW, hitH);
    this.sprite.body.setOffset(
      (SPRITE_FRAME_SIZE - hitW) / 2,
      SPRITE_FRAME_SIZE - hitH - 4,
    );
  }

  syncBody() {
    this.sprite.body.reset(this.sprite.x, this.sprite.y);
  }

  toggleWeapon() {
    this.hasWeapon = !this.hasWeapon;

    if (this.isJumping || this.isAttacking) {
      return;
    }

    this.playIdle();
  }

  playIdle() {
    const sheet = this.sheetIdle();
    this.sprite.setTexture(this.tex(sheet));
    this.sprite.setScale(this.scale);
    this.sprite.play(this.animIdle(), true);
    this.lastStepAt = 0; // Resetear contador de pasos
  }

  playWalk() {
    const sheet = this.sheetWalk();
    if (this.sprite.texture.key !== this.tex(sheet)) {
      this.sprite.setTexture(this.tex(sheet));
      this.sprite.setScale(this.scale);
    }
    if (this.sprite.anims.currentAnim?.key !== this.animWalk()) {
      this.sprite.play(this.animWalk(), true);
    }

    // Reproducir sonido de pasos cada 300ms (solo si se está moviendo)
    const speed = Math.sqrt(
      this.sprite.body.velocity.x ** 2 + this.sprite.body.velocity.y ** 2,
    );
    if (speed > 0 && this.scene.time.now - this.lastStepAt > 300) {
      this.lastStepAt = this.scene.time.now;
      try {
        if (this.scene.sound) {
          this.scene.sound.play("sfx_player_steps", { volume: 0.3 });
        }
      } catch (e) {
        // Sonido no disponible
      }
    }
  }

  onAnimComplete(anim) {
    if (anim.key === "hero_jump" || anim.key === "hero_jump_weapon") {
      this.isJumping = false;
      this.playIdle();
    }

    if (anim.key === "hero_attack") {
      this.isAttacking = false;
      this.playIdle();
    }
  }

  startJump() {
    if (this.isJumping || this.isAttacking) {
      return;
    }

    this.isJumping = true;

    if (this.jumpTween) {
      this.jumpTween.stop();
    }

    const sheet = this.sheetJump();
    this.sprite.setTexture(this.tex(sheet));
    this.sprite.setScale(this.scale);
    this.sprite.play(this.animJump());

    const groundY = this.sprite.y;
    this.jumpTween = this.scene.tweens.add({
      targets: this.sprite,
      y: groundY - this.jumpLift,
      duration: 220,
      yoyo: true,
      ease: "Sine.easeOut",
      onUpdate: () => this.syncBody(),
      onComplete: () => this.syncBody(),
    });
  }

  shoot(pointer) {
    if (
      !this.canAct() ||
      !this.hasWeapon ||
      this.isJumping ||
      this.isAttacking
    ) {
      return;
    }

    if (this.scene.time.now - this.lastFireAt < FIRE_COOLDOWN_MS) {
      return;
    }

    this.lastFireAt = this.scene.time.now;
    this.isAttacking = true;

    // Reproducir sonido de disparo
    try {
      if (this.scene.sound) {
        this.scene.sound.play("sfx_player_shoot", { volume: 0.6 });
        console.log("[Player] Sonido de disparo reproducido");
      }
    } catch (e) {
      console.log("[Player] Error al reproducir sonido:", e.message);
    }

    this.sprite.setTexture(this.tex("attack"));
    this.sprite.setScale(this.scale);
    this.sprite.play("hero_attack");

    const flip = this.sprite.flipX;
    if (pointer && pointer.x < this.sprite.x) {
      this.sprite.setFlipX(true);
    } else if (pointer && pointer.x >= this.sprite.x) {
      this.sprite.setFlipX(false);
    }

    const dir = this.sprite.flipX ? -1 : 1;
    const spawnX = this.sprite.x + dir * 36;
    const spawnY = this.sprite.y - 8;

    const bullet = this.bullets.get(spawnX, spawnY, this.tex("bullet"), 0);

    if (!bullet) {
      return;
    }

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setOrigin(0.5, 0.5);
    bullet.setScale(this.scale * BULLET_SCALE_FACTOR);
    bullet.setFlipX(this.sprite.flipX);
    bullet.body.setAllowGravity(false);
    bullet.body.setSize(22, 14);
    bullet.body.setOffset(21, 25);
    bullet.play("hero_bullet_fly");
    bullet.setVelocity(dir * BULLET_SPEED, 0);
    bullet.setDepth(this.sprite.depth + 1);

    bullet.damage = this.bulletDamage;
    bullet.lifespan = this.scene.time.now + 2500;
    bullet.setData("playerBullet", true);
    bullet.setData("hasHit", false);
  }

  updateBullets() {
    const bounds = this.scene.physics.world.bounds;

    this.bullets.getChildren().forEach((bullet) => {
      if (!bullet.active) {
        return;
      }

      const out =
        bullet.x < bounds.x - 80 ||
        bullet.x > bounds.width + 80 ||
        bullet.y < bounds.y - 80 ||
        bullet.y > bounds.height + 80;

      if (out || this.scene.time.now > bullet.lifespan) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();
      }
    });
  }

  applyMovement() {
    const body = this.sprite.body;
    let vx = 0;
    let vy = 0;

    // Movimiento WASD limitado por physics.world.setBounds (setupMissionArena).

    if (this.keys.left.isDown) {
      vx = -1;
      this.sprite.setFlipX(true);
    } else if (this.keys.right.isDown) {
      vx = 1;
      this.sprite.setFlipX(false);
    }

    if (this.keys.up.isDown) {
      vy = -1;
    } else if (this.keys.down.isDown) {
      vy = 1;
    }

    const moving = vx !== 0 || vy !== 0;

    if (moving) {
      body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
      body.velocity.normalize().scale(PLAYER_SPEED);
      this.playWalk();
    } else {
      body.setVelocity(0, 0);
      this.playIdle();
    }
  }

  update(pointer) {
    if (!this.canAct()) {
      return;
    }

    this.updateBullets();

    if (Phaser.Input.Keyboard.JustDown(this.keys.weapon)) {
      this.toggleWeapon();
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.keys.space) &&
      !this.isJumping &&
      !this.isAttacking
    ) {
      this.startJump();
      return;
    }

    if (this.isJumping || this.isAttacking) {
      let vx = 0;
      let vy = 0;

      if (this.keys.left.isDown) {
        vx = -1;
        this.sprite.setFlipX(true);
      } else if (this.keys.right.isDown) {
        vx = 1;
        this.sprite.setFlipX(false);
      }

      if (this.keys.up.isDown) {
        vy = -1;
      } else if (this.keys.down.isDown) {
        vy = 1;
      }

      if (vx !== 0 || vy !== 0) {
        this.sprite.body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
        this.sprite.body.velocity.normalize().scale(PLAYER_SPEED);
      } else {
        this.sprite.body.setVelocity(0, 0);
      }

      return;
    }

    this.applyMovement();
  }
}
