const PLAYER_SPEED = 320;
const BULLET_SPEED = 560;
const BULLET_SCALE_FACTOR = 0.4;
const FIRE_COOLDOWN_MS = 350;
const PLAYER_MAX_HP = 100;
const PLAYER_BULLET_DAMAGE = 8;
const PLAYER_INVULN_MS = 900;

class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        // Identificar personaje seleccionado
        this.id = scene.registry.get("selectedCharacter") || "hero";
        this.manifest = ENTITY_MANIFESTS[this.id];

        this.maxHp = PLAYER_MAX_HP;
        this.hp = PLAYER_MAX_HP;
        this.isDead = false;
        this.isDying = false;
        this.invulnerableUntil = 0;
        this.hasWeapon = false;
        this.isJumping = false;
        this.isAttacking = false;
        this.lastFireAt = 0;
        this.bulletDamage = PLAYER_BULLET_DAMAGE;

        // Ajustar escala según el tamaño del frame (Dan usa 128x128, Mika 64x64)
        const frameSize = this.getFrameSize();
        const baseScale = (scene.scale.height * 0.22) / frameSize;
        this.scale = baseScale;
        this.jumpLift = scene.scale.height * 0.14;

        this.sprite = scene.physics.add.sprite(x, y, this.tex("stand"), 0);
        this.sprite.setScale(this.scale);
        this.sprite.setDepth(10);
        this.sprite.setCollideWorldBounds(true);
        this.setupBody(frameSize);

        this.bullets = scene.physics.add.group({
            defaultKey: EntityLoader.textureKey(this.id, "bullet"),
            maxSize: 24
        });

        this.keys = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            weapon: Phaser.Input.Keyboard.KeyCodes.TWO
        });

        this.sprite.on("animationcomplete", this.onAnimComplete, this);
        this.playIdle();
    }

    getFrameSize() {
        // Asume que el primer sheet da el tamaño base o usa SPRITE_FRAME_SIZE
        const firstSheet = this.manifest.sheets.find(s => s.frameWidth);
        return firstSheet ? firstSheet.frameWidth : SPRITE_FRAME_SIZE;
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
            if (b.body) b.body.stop();
        });

        this.sprite.setTexture(this.tex("died"));
        this.sprite.play(`${this.id}_death`);

        this.sprite.once("animationcomplete", () => {
            this.scene.onPlayerDefeated();
        });
    }

    static createAnimations(scene) {
        // Crear animaciones para CUALQUIER personaje definido en el manifest
        const characterIds = ["hero", "hero2"];
        
        characterIds.forEach(charId => {
            const m = ENTITY_MANIFESTS[charId];
            if (!m) return;

            const defs = [
                { anim: "stand", sheet: "stand", rate: 6, repeat: -1 },
                { anim: "walk", sheet: "walk", rate: 14, repeat: -1 },
                { anim: "jump", sheet: "jump", rate: 14, repeat: 0 },
                { anim: "stand_weapon", sheet: "stand_weapon", rate: 6, repeat: -1 },
                { anim: "walk_weapon", sheet: "walk_weapon", rate: 14, repeat: -1 },
                { anim: "jump_weapon", sheet: "jump_weapon", rate: 14, repeat: 0 },
                { anim: "attack", sheet: "attack", rate: 16, repeat: 0 },
                { anim: "bullet_fly", sheet: "bullet", rate: 18, repeat: -1 },
                { anim: "death", sheet: "died", rate: 10, repeat: 0 }
            ];

            defs.forEach((d) => {
                const sheetData = m.sheets.find(s => s.key === d.sheet);
                if (!sheetData) return;

                const tex = EntityLoader.textureKey(m.id, d.sheet);
                const animKey = `${charId}_${d.anim}`;

                if (!scene.anims.exists(animKey)) {
                    scene.anims.create({
                        key: animKey,
                        frames: scene.anims.generateFrameNumbers(tex, {
                            start: 0,
                            end: sheetData.frames - 1
                        }),
                        frameRate: d.rate,
                        repeat: d.repeat
                    });
                }
            });
        });
    }

    tex(sheetKey) {
        // Maneja fallbacks si una sheet no existe para el personaje actual
        const hasSheet = this.manifest.sheets.some(s => s.key === sheetKey);
        const key = hasSheet ? sheetKey : (sheetKey.includes("weapon") ? sheetKey.replace("_weapon", "") : "stand");
        return EntityLoader.textureKey(this.id, key);
    }

    getAnimKey(action) {
        // Maneja fallbacks de animaciones (ej: Dan no tiene animaciones de weapon separadas)
        let key = `${this.id}_${action}`;
        if (!this.scene.anims.exists(key)) {
            key = key.replace("_weapon", "");
        }
        return key;
    }

    setupBody(frameSize) {
        const hitW = frameSize * 0.5;
        const hitH = frameSize * 0.7;
        this.sprite.body.setSize(hitW, hitH);
        this.sprite.body.setOffset(
            (frameSize - hitW) / 2,
            frameSize - hitH - 5
        );
    }

    syncBody() {
        this.sprite.body.reset(this.sprite.x, this.sprite.y);
    }

    toggleWeapon() {
        this.hasWeapon = !this.hasWeapon;
        if (!this.isJumping && !this.isAttacking) {
            this.playIdle();
        }
    }

    playIdle() {
        const action = this.hasWeapon ? "stand_weapon" : "stand";
        const sheet = this.hasWeapon && this.manifest.sheets.some(s => s.key === "stand_weapon") ? "stand_weapon" : "stand";
        this.sprite.setTexture(this.tex(sheet));
        this.sprite.play(this.getAnimKey(action), true);
    }

    playWalk() {
        const action = this.hasWeapon ? "walk_weapon" : "walk";
        const sheet = this.hasWeapon && this.manifest.sheets.some(s => s.key === "walk_weapon") ? "walk_weapon" : "walk";
        if (this.sprite.texture.key !== this.tex(sheet)) {
            this.sprite.setTexture(this.tex(sheet));
        }
        this.sprite.play(this.getAnimKey(action), true);
    }

    onAnimComplete(anim) {
        if (anim.key.includes("jump")) {
            this.isJumping = false;
            this.playIdle();
        }
        if (anim.key.includes("attack")) {
            this.isAttacking = false;
            this.playIdle();
        }
    }

    startJump() {
        if (this.isJumping || this.isAttacking) return;
        this.isJumping = true;

        if (this.jumpTween) this.jumpTween.stop();

        const action = this.hasWeapon ? "jump_weapon" : "jump";
        const sheet = this.hasWeapon && this.manifest.sheets.some(s => s.key === "jump_weapon") ? "jump_weapon" : "jump";
        
        this.sprite.setTexture(this.tex(sheet));
        this.sprite.play(this.getAnimKey(action));

        const groundY = this.sprite.y;
        this.jumpTween = this.scene.tweens.add({
            targets: this.sprite,
            y: groundY - this.jumpLift,
            duration: 250,
            yoyo: true,
            ease: "Sine.easeOut",
            onUpdate: () => this.syncBody(),
            onComplete: () => this.syncBody()
        });
    }

    shoot(pointer) {
        if (!this.canAct() || !this.hasWeapon || this.isJumping || this.isAttacking) return;
        if (this.scene.time.now - this.lastFireAt < FIRE_COOLDOWN_MS) return;

        this.lastFireAt = this.scene.time.now;
        this.isAttacking = true;

        this.sprite.setTexture(this.tex("attack"));
        this.sprite.play(this.getAnimKey("attack"));

        if (pointer) {
            this.sprite.setFlipX(pointer.x < this.sprite.x);
        }

        const dir = this.sprite.flipX ? -1 : 1;
        const spawnX = this.sprite.x + dir * (this.getFrameSize() * 0.35);
        const spawnY = this.sprite.y - 10;

        const bullet = this.bullets.get(spawnX, spawnY, this.tex("bullet"), 0);
        if (!bullet) return;

        bullet.setActive(true).setVisible(true).setOrigin(0.5, 0.5);
        bullet.setScale(this.scale * BULLET_SCALE_FACTOR);
        bullet.setFlipX(this.sprite.flipX);
        bullet.body.setAllowGravity(false);
        bullet.play(this.getAnimKey("bullet_fly"));
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
            if (!bullet.active) return;
            const out = bullet.x < bounds.x - 80 || bullet.x > bounds.width + 80 || bullet.y < bounds.y - 80 || bullet.y > bounds.height + 80;
            if (out || this.scene.time.now > bullet.lifespan) {
                bullet.setActive(false).setVisible(false);
                bullet.body.stop();
            }
        });
    }

    update(pointer) {
        if (!this.canAct()) return;
        this.updateBullets();

        if (Phaser.Input.Keyboard.JustDown(this.keys.weapon)) this.toggleWeapon();
        if (Phaser.Input.Keyboard.JustDown(this.keys.space) && !this.isJumping && !this.isAttacking) {
            this.startJump();
            return;
        }

        const body = this.sprite.body;
        if (this.isJumping || this.isAttacking) {
            let vx = 0, vy = 0;
            if (this.keys.left.isDown) { vx = -1; this.sprite.setFlipX(true); }
            else if (this.keys.right.isDown) { vx = 1; this.sprite.setFlipX(false); }
            if (this.keys.up.isDown) vy = -1;
            else if (this.keys.down.isDown) vy = 1;

            if (vx !== 0 || vy !== 0) {
                body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
                body.velocity.normalize().scale(PLAYER_SPEED);
            } else {
                body.setVelocity(0, 0);
            }
            return;
        }

        let vx = 0, vy = 0;
        if (this.keys.left.isDown) { vx = -1; this.sprite.setFlipX(true); }
        else if (this.keys.right.isDown) { vx = 1; this.sprite.setFlipX(false); }
        if (this.keys.up.isDown) vy = -1;
        else if (this.keys.down.isDown) vy = 1;

        if (vx !== 0 || vy !== 0) {
            body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
            body.velocity.normalize().scale(PLAYER_SPEED);
            this.playWalk();
        } else {
            body.setVelocity(0, 0);
            this.playIdle();
        }
    }
}
