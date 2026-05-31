/**
 * Controles táctiles para móvil (Phaser puro, sin plugins externos).
 * - Joystick izquierdo: movimiento (WASD).
 * - Botones derechos: salto, disparo y cambio de arma.
 */
class TouchControls {
  constructor(scene) {
    this.scene = scene;
    const { width, height } = scene.scale;

    this.depth = 6000;
    this.enabled = true;
    this.actionLabels = [];
    this.joystickActive = false;
    this.joystickPointerId = null;
    this.joystickVector = { x: 0, y: 0 };
    this.deadZone = 0.22;

    const joyRadius = Math.min(90, height * 0.11);
    const joyX = width * 0.14;
    const joyY = height * 0.78;
    this.joyRadius = joyRadius;
    this.joyCenterX = joyX;
    this.joyCenterY = joyY;

    this.base = scene.add
      .circle(joyX, joyY, joyRadius, 0x1e293b, 0.45)
      .setStrokeStyle(2, 0x38bdf8, 0.7)
      .setScrollFactor(0)
      .setDepth(this.depth);

    this.thumb = scene.add
      .circle(joyX, joyY, joyRadius * 0.42, 0x38bdf8, 0.55)
      .setScrollFactor(0)
      .setDepth(this.depth + 1);

    this.joystickZone = scene.add
      .zone(joyX, joyY, joyRadius * 2.6, joyRadius * 2.6)
      .setScrollFactor(0)
      .setDepth(this.depth - 1)
      .setInteractive();

    this.joystickZone.on("pointerdown", (pointer) => this._onJoystickDown(pointer));
    this._onMove = (pointer) => this._onJoystickMove(pointer);
    this._onUp = () => this._onJoystickUp();
    scene.input.on("pointermove", this._onMove);
    scene.input.on("pointerup", this._onUp);

    const btnY = height * 0.78;
    const btnSpacing = Math.min(72, width * 0.055);
    const btnR = Math.min(34, height * 0.045);
    const startX = width * 0.86;

    this._jumpPressed = false;
    this._shootPressed = false;
    this._weaponPressed = false;

    this.btnShoot = this._createActionButton(
      startX,
      btnY,
      btnR,
      0xef4444,
      "DIS",
      () => {
        this._shootPressed = true;
      },
    );
    this.btnJump = this._createActionButton(
      startX - btnSpacing,
      btnY,
      btnR,
      0x22c55e,
      "SAL",
      () => {
        this._jumpPressed = true;
      },
    );
    this.btnWeapon = this._createActionButton(
      startX - btnSpacing * 2,
      btnY,
      btnR,
      0xa855f7,
      "ARMA",
      () => {
        this._weaponPressed = true;
      },
    );

    this.controlBounds = [];
    this._registerControlBounds(this.joystickZone, joyRadius * 1.3);
    [this.btnShoot, this.btnJump, this.btnWeapon].forEach((btn) => {
      this._registerControlBounds(btn, btnR * 1.2);
    });
  }

  _registerControlBounds(obj, radius) {
    this.controlBounds.push({ obj, radius });
  }

  _onJoystickDown(pointer) {
    if (!this.enabled) return;
    this.joystickActive = true;
    this.joystickPointerId = pointer.id;
    this._updateJoystick(pointer.x, pointer.y);
  }

  _onJoystickMove(pointer) {
    if (!this.enabled || !this.joystickActive) return;
    if (this.joystickPointerId !== null && pointer.id !== this.joystickPointerId) {
      return;
    }
    this._updateJoystick(pointer.x, pointer.y);
  }

  _onJoystickUp() {
    if (!this.joystickActive) return;
    this.joystickActive = false;
    this.joystickPointerId = null;
    this.joystickVector.x = 0;
    this.joystickVector.y = 0;
    this.thumb.setPosition(this.joyCenterX, this.joyCenterY);
  }

  _updateJoystick(x, y) {
    const dx = x - this.joyCenterX;
    const dy = y - this.joyCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = this.joyRadius;
    const clamped = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);

    this.thumb.setPosition(
      this.joyCenterX + Math.cos(angle) * clamped,
      this.joyCenterY + Math.sin(angle) * clamped,
    );

    this.joystickVector.x =
      dist > 0 ? Phaser.Math.Clamp(dx / maxDist, -1, 1) : 0;
    this.joystickVector.y =
      dist > 0 ? Phaser.Math.Clamp(dy / maxDist, -1, 1) : 0;
  }

  _createActionButton(x, y, radius, color, label, onPress) {
    const circle = this.scene.add
      .circle(x, y, radius, color, 0.55)
      .setStrokeStyle(2, 0xffffff, 0.35)
      .setScrollFactor(0)
      .setDepth(this.depth)
      .setInteractive({ useHandCursor: true });

    const caption = this.scene.add
      .text(x, y, label, {
        fontFamily: "Arial",
        fontSize: `${Math.max(10, radius * 0.38)}px`,
        color: "#f8fafc",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(this.depth + 1);
    this.actionLabels.push(caption);

    circle.on("pointerdown", (pointer, localX, localY, event) => {
      if (event?.stopPropagation) event.stopPropagation();
      if (!this.enabled) return;
      onPress();
    });

    return circle;
  }

  static shouldUse(scene) {
    const game = scene.sys.game;
    const touch =
      game.device.input.touch ||
      (typeof window !== "undefined" && "ontouchstart" in window);
    const mobileOs = game.device.os.android || game.device.os.iOS;
    const narrow = scene.scale.width < 1024;
    return touch || mobileOs || narrow;
  }

  isActive() {
    return this.enabled && !!this.base;
  }

  isPointerOnControls(pointer) {
    if (!pointer) return false;
    for (const { obj, radius } of this.controlBounds) {
      if (!obj?.active) continue;
      const dist = Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        obj.x,
        obj.y,
      );
      if (dist <= radius) return true;
    }
    return false;
  }

  getMovementState() {
    const v = this.joystickVector;
    const dz = this.deadZone;
    return {
      left: v.x < -dz,
      right: v.x > dz,
      up: v.y < -dz,
      down: v.y > dz,
    };
  }

  consumeJumpPress() {
    const v = this._jumpPressed;
    this._jumpPressed = false;
    return v;
  }

  consumeShootPress() {
    const v = this._shootPressed;
    this._shootPressed = false;
    return v;
  }

  consumeWeaponPress() {
    const v = this._weaponPressed;
    this._weaponPressed = false;
    return v;
  }

  setEnabled(value) {
    this.enabled = value;
    const visible = value;
    [this.base, this.thumb, this.joystickZone].forEach((obj) => {
      if (obj) obj.setVisible(visible);
    });
    if (!value) this._onJoystickUp();
    [this.btnShoot, this.btnJump, this.btnWeapon].forEach((btn) => {
      if (btn) btn.setVisible(visible);
    });
    (this.actionLabels || []).forEach((lbl) => lbl.setVisible(visible));
  }

  destroy() {
    this.scene.input.off("pointermove", this._onMove);
    this.scene.input.off("pointerup", this._onUp);
    [this.base, this.thumb, this.joystickZone].forEach((obj) => obj?.destroy());
    [this.btnShoot, this.btnJump, this.btnWeapon].forEach((btn) => btn?.destroy());
    (this.actionLabels || []).forEach((lbl) => lbl.destroy());
    this.btnShoot = this.btnJump = this.btnWeapon = null;
    this.actionLabels = [];
    this.controlBounds = [];
  }
}

if (typeof window !== "undefined") {
  window.TouchControls = TouchControls;
}
