/**
 * Jugador controlable (Dan = hero, Mika = hero2).
 * Lee registry.selectedCharacter; sprites desde ENTITY_MANIFESTS en AssetManifest.js.
 * Input: WASD + espacio + clic (disparo). En móvil: TouchControls integrado en update().
 */
const PLAYER_SPEED = 320;
const BULLET_SPEED = 850; 
const BULLET_SCALE_FIXED = 1.8;
const FIRE_COOLDOWN_MS = 220; 
const PLAYER_MAX_HP = 200; // Aumentado a 200 HP
const PLAYER_BULLET_DAMAGE = 10;
const PLAYER_INVULN_MS = 1000; 

class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.id = scene.registry.get("selectedCharacter") || "hero";
        this.manifest = ENTITY_MANIFESTS[this.id];

        this.maxHp = PLAYER_MAX_HP;
        const savedHP = scene.registry.get("savedHP");
        // Si hay vida guardada pero es menor al nuevo máximo (debido al cambio de versión), 
        // podríamos resetearla o ajustarla, pero aquí respetamos el valor o usamos el nuevo máximo.
        this.hp = (savedHP !== undefined && savedHP !== null) ? savedHP : PLAYER_MAX_HP;
        scene.registry.set("savedHP", null);
        
        this.isDead = false;
        this.isDying = false;
        this.invulnerableUntil = 0;
        this.hasWeapon = false;
        this.isJumping = false;
        this.isAttacking = false;
        this.lastFireAt = 0;
        this.bulletDamage = PLAYER_BULLET_DAMAGE;

        this.currentAction = "none"; 

        // Reducción del 10% en el multiplicador de tamaño (Dan 1.3 -> 1.17, Mika 1.0 -> 0.9)
        const sizeReduction = 0.9;
        const danMultiplier = this.id === "hero" ? 1.3 * sizeReduction : 1.0 * sizeReduction;
        this.targetHeight = scene.scale.height * 0.28 * danMultiplier;
        
        this.baseFrameSize = (this.id === "hero") ? 256 : 64;
        this.scale = this.targetHeight / this.baseFrameSize;
        
        this.jumpLift = scene.scale.height * (this.id === "hero" ? 0.22 : 0.16);

        this.sprite = scene.physics.add.sprite(x, y, this.tex("stand"), 0);
        this.sprite.setScale(this.scale);
        this.sprite.setDepth(10);
        this.sprite.setCollideWorldBounds(true);
        
        this.setupBody();

        this.bullets = scene.physics.add.group({
            defaultKey: EntityLoader.textureKey(this.id, "bullet"),
            maxSize: 30 // Aumentado para el nuevo fire rate
        });
        
        this.bulletScale = 0.6;

        this.keys = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        this.sprite.on("animationcomplete", this.onAnimComplete, this);
        this.sprite.on("animationupdate", this.normalizeFrameSize, this);

        this.updateState("idle", true);
    }

    normalizeFrameSize() {
        if (this.id !== "hero") return;
        this.sprite.setOrigin(0.5, 1);
        const frame = this.sprite.frame;
        if (frame && frame.realHeight > 0) {
            const dynamicScale = this.targetHeight / frame.realHeight;
            this.sprite.setScale(dynamicScale);
            this.scale = dynamicScale;
        }
    }

    setupBody() {
        if (this.id === "hero") {
            // Hitbox MUCHO más ajustada para Dan (antes 60x160)
            // Centrada en el torso para ser más permisiva
            this.sprite.body.setSize(40, 110);
            this.sprite.body.setOffset(108, 100); 
        } else {
            // Hitbox más ajustada para Mika (antes 0.5x0.8)
            const size = 64;
            this.sprite.body.setSize(size * 0.35, size * 0.65);
            this.sprite.body.setOffset(size * 0.32, size * 0.25);
        }
    }

    equipWeaponForMission() {
        this.hasWeapon = true;
        this.updateState("idle", true);
    }

    canAct() {
        return !this.isDead && !this.isDying && this.hp > 0;
    }

    takeDamage(amount) {
        if (!this.canAct() || this.scene.time.now < this.invulnerableUntil) return;
        this.hp -= amount;
        this.invulnerableUntil = this.scene.time.now + PLAYER_INVULN_MS;
        this.isInvulnerable = true;

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(PLAYER_INVULN_MS / 200),
            onComplete: () => {
                if (this.sprite) this.sprite.setAlpha(1);
                this.isInvulnerable = false;
            }
        });

        this.sprite.setTint(0xff6b6b);
        this.scene.time.delayedCall(120, () => { if (this.sprite.active) this.sprite.clearTint(); });
        this.scene.events.emit("player-hp-changed");
        if (this.hp <= 0) this.playDeath();
    }

    playDeath() {
        if (this.isDead) return;
        this.isDying = true;
        this.isDead = true;
        
        console.log(`[Player] Iniciando secuencia de muerte para: ${this.id}`);
        this.sprite.body.setVelocity(0, 0);
        
        const deathAnim = `${this.id}_death`;
        if (this.scene.anims.exists(deathAnim)) {
            this.sprite.play(deathAnim);
            this.sprite.once("animationcomplete", () => {
                console.log("[Player] Animación de muerte completada");
                this.finishDeath();
            });
            // Fallback por si la animación falla
            this.scene.time.delayedCall(2000, () => this.finishDeath());
        } else {
            this.finishDeath();
        }
    }

    finishDeath() {
        if (this.hasFinishedDeath) return;
        this.hasFinishedDeath = true;
        
        console.log("[Player] Finalizando secuencia de muerte");
        if (this.scene && typeof this.scene.onPlayerDefeated === 'function') {
            this.scene.onPlayerDefeated();
        }
    }

    static createAnimations(scene) {
        ["hero", "hero2"].forEach(charId => {
            const m = ENTITY_MANIFESTS[charId];
            if (!m) return;
            const isDan = charId === "hero";

            const defs = [
                { anim: "stand", sheet: "stand", rate: 6, repeat: -1 },
                { anim: "walk", sheet: "walk", rate: 22, repeat: -1 },
                { anim: "jump", sheet: "jump", rate: isDan ? 32 : 18, repeat: 0 }, 
                { anim: "attack", sheet: "attack", rate: 28, repeat: 0 }, // Animación más rápida para Dan
                { anim: "bullet_fly", sheet: "bullet", rate: 18, repeat: -1 },
                { anim: "death", sheet: "died", rate: 10, repeat: 0 }
            ];

            defs.forEach((d) => {
                const sheetData = m.sheets.find(s => s.key === d.sheet);
                if (!sheetData) return;
                const animKey = `${charId}_${d.anim}`;
                if (scene.anims.exists(animKey)) return;

                if (sheetData.isIndividual) {
                    const frames = [];
                    sheetData.files.forEach((_, i) => {
                        const subKey = EntityLoader.textureKey(charId, d.sheet, i);
                        if (scene.textures.exists(subKey)) frames.push({ key: subKey });
                    });
                    if (frames.length > 0) {
                        scene.anims.create({ key: animKey, frames, frameRate: d.rate, repeat: d.repeat });
                    }
                } else {
                    const texKey = EntityLoader.textureKey(charId, d.sheet);
                    if (scene.textures.exists(texKey)) {
                        scene.anims.create({
                            key: animKey,
                            frames: scene.anims.generateFrameNumbers(texKey, { start: 0, end: Math.min(sheetData.frames - 1, scene.textures.get(texKey).frameTotal - 1) }),
                            frameRate: d.rate, repeat: d.repeat
                        });
                    }
                }
            });
        });
    }

    tex(sheetKey) {
        const sheetData = this.manifest.sheets.find(s => s.key === sheetKey);
        if (sheetData && sheetData.isIndividual) return EntityLoader.textureKey(this.id, sheetKey, 0);
        return EntityLoader.textureKey(this.id, sheetKey);
    }

    updateState(action, force = false) {
        if (this.currentAction === action && !force) return;
        
        // Bloqueo de estado mientras ataca para que la animación termine (o casi termine)
        if (this.isAttacking && action !== "attack" && !force) {
            // Permitimos que el walk interrumpa el attack solo si ya pasó gran parte del cooldown
            const timeSinceShoot = this.scene.time.now - this.lastFireAt;
            if (timeSinceShoot < FIRE_COOLDOWN_MS * 0.7) return;
        }

        if (this.isJumping && action !== "jump" && !force) return;

        this.currentAction = action;
        const animKey = `${this.id}_${action}`;
        const finalKey = this.scene.anims.exists(animKey) ? animKey : `${this.id}_stand`;
        
        this.sprite.setOrigin(0.5, 1);
        this.sprite.play(finalKey, true);
    }

    onAnimComplete(anim) {
        if (anim.key.includes("attack")) {
            this.isAttacking = false;
            // No reseteamos currentAction a "none" inmediatamente para permitir suavidad
        }
        if (anim.key.includes("jump")) {
            this.isJumping = false;
        }
    }

    startJump() {
        if (this.isJumping || this.isAttacking) return;
        this.isJumping = true;
        this.updateState("jump", true);

        const groundY = this.sprite.y;
        this.scene.tweens.add({
            targets: this.sprite,
            y: groundY - this.jumpLift,
            duration: 350,
            yoyo: true,
            ease: "Quad.easeOut",
            onUpdate: () => this.syncBody(),
            onComplete: () => {
                this.isJumping = false;
                this.currentAction = "none";
                this.syncBody();
            }
        });
    }

    shoot(pointer) {
        if (!this.canAct() || this.isJumping) return;
        if (this.scene.time.now - this.lastFireAt < FIRE_COOLDOWN_MS) return;
        
        this.lastFireAt = this.scene.time.now;
        this.isAttacking = true;
        this.updateState("attack", true);
        
        // Resetear isAttacking un poco después del cooldown para asegurar que la animación se vea
        this.scene.time.delayedCall(FIRE_COOLDOWN_MS, () => {
            this.isAttacking = false;
        });

        if (pointer) this.sprite.setFlipX(pointer.x < this.sprite.x);
        const dir = this.sprite.flipX ? -1 : 1;

        // Spawn de bala más rápido (80ms en lugar de 120ms)
        this.scene.time.delayedCall(80, () => {
            if (!this.canAct()) return;

            const spawnX = this.sprite.x + (dir * this.sprite.displayWidth * 0.45);
            const spawnY = this.sprite.y - (this.targetHeight * 0.62);

            const bulletKey = EntityLoader.textureKey(this.id, "bullet");
            const bullet = this.bullets.get(spawnX, spawnY, bulletKey);
            
            if (bullet) {
                bullet.setActive(true).setVisible(true).setOrigin(0.5, 0.5);
                
                if (bullet.body) {
                    bullet.body.reset(spawnX, spawnY);
                    bullet.body.setAllowGravity(false);
                    bullet.body.setVelocity(dir * BULLET_SPEED, 0);
                }

                bullet.setScale(this.bulletScale || 0.6); 
                bullet.setFlipX(this.sprite.flipX);
                
                const bAnim = `${this.id}_bullet_fly`;
                if (this.scene.anims.exists(bAnim)) bullet.play(bAnim);
                
                bullet.damage = this.bulletDamage;
                bullet.lifespan = this.scene.time.now + 2000;
                bullet.setData("playerBullet", true).setData("hasHit", false);

                try {
                    if (this.scene.sound) {
                        this.scene.sound.play("sfx_player_shoot", { volume: 0.3 });
                    }
                } catch (e) {}
            }
        });
    }

    syncBody() { 
        if (this.sprite && this.sprite.body) {
            this.sprite.body.updateFromGameObject();
        }
    }

    getMovementInput() {
        const touch = this.scene.touchControls;
        if (touch && touch.isActive()) {
            return touch.getMovementState();
        }
        return {
            left: this.keys.left.isDown,
            right: this.keys.right.isDown,
            up: this.keys.up.isDown,
            down: this.keys.down.isDown,
        };
    }

    update(pointer) {
        if (!this.canAct()) return;

        this.bullets.getChildren().forEach(b => {
            if (b.active && this.scene.time.now > b.lifespan) b.setActive(false).setVisible(false);
        });

        const touch = this.scene.touchControls;
        if (touch && touch.isActive()) {
            if (touch.consumeJumpPress()) this.startJump();
            if (touch.consumeWeaponPress()) this.equipWeaponForMission();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.space)) return this.startJump();

        const body = this.sprite.body;
        if (!body) return;

        const input = this.getMovementInput();

        // Permitimos movimiento horizontal mientras se ataca/salta
        if (this.isAttacking || this.isJumping) {
            let vx = 0;
            if (input.left) { vx = -1; this.sprite.setFlipX(true); }
            else if (input.right) { vx = 1; this.sprite.setFlipX(false); }
            if (vx !== 0) body.setVelocityX(vx * PLAYER_SPEED);
            else body.setVelocityX(0);

            if (!this.isJumping && vx !== 0) {
                this.updateState("walk");
            }
            return;
        }

        let vx = 0, vy = 0;
        if (input.left) { vx = -1; this.sprite.setFlipX(true); }
        else if (input.right) { vx = 1; this.sprite.setFlipX(false); }
        if (input.up) vy = -1;
        else if (input.down) vy = 1;

        if (vx !== 0 || vy !== 0) {
            body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED).velocity.normalize().scale(PLAYER_SPEED);
            this.updateState("walk");
        } else {
            body.setVelocity(0, 0);
            this.updateState("idle");
        }
    }
}

