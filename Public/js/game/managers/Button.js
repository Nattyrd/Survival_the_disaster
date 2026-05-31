/**
 * ════════════════════════════════════════════════════════════════════════════════
 * COMPONENTE: BOTÓN INTERACTIVO
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de botones profesional con:
 * - Soporte mouse (click, hover)
 * - Soporte teclado (↑↓ navegación, ENTER selección)
 * - Efectos visuales (glow, escala, transición)
 * - Gestión de estado (normal, hover, press, disabled)
 */

class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y)

    // ► Configuración por defecto
    this.config = {
      width: config.width ?? 300,
      height: config.height ?? 60,
      text: config.text ?? 'Botón',
      fontSize: config.fontSize ?? '24px',
      colors: {
        normal: config.normalColor ?? '#4a2a6f',
        hover: config.hoverColor ?? '#6a4a9f',
        press: config.pressColor ?? '#8a6abf',
        disabled: config.disabledColor ?? '#2a1a4f',
        glow: config.glowColor ?? '#9366ff',
        text: config.textColor ?? '#ffffff'
      },
      callback: config.callback ?? (() => {}),
      enabled: config.enabled ?? true,
      ...config
    }

    // ► Estados del botón
    this.isHovering = false
    this.isPressed = false
    this.isEnabled = this.config.enabled

    // ► Crear elementos visuales
    this.createGraphics()

    // ► Agregar a escena
    scene.add.existing(this)

    // ► Interacción sobre el fondo del botón
    this.background.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.config.width / 2,
        -this.config.height / 2,
        this.config.width,
        this.config.height
      ),
      Phaser.Geom.Rectangle.Contains
    )

    // ► Eventos del ratón/táctil
    this.background.on('pointerover', () => this.onHover())
    this.background.on('pointerout', () => this.onHoverOut())
    this.background.on('pointerdown', () => this.onPress())
    this.background.on('pointerup', () => this.onRelease())
    this.background.on('pointerupoutside', () => this.onReleaseOutside())
  }

  _isAlive() {
    return !!(
      this.active &&
      this.scene &&
      this.scene.sys &&
      this.background &&
      this.background.active
    )
  }

  _safeTween(config) {
    if (!this._isAlive() || !this.scene.tweens) return null
    return this.scene.tweens.add(config)
  }

  _resetVisual(animate = true) {
    if (!this._isAlive()) return

    this.isHovering = false
    this.isPressed = false

    this.background.clear()
    this.background.fillStyle(
      Phaser.Display.Color.HexStringToColor(this.config.colors.normal).color,
      1
    )
    this.background.fillRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height
    )

    this.glowGraphics.lineStyle(
      2,
      Phaser.Display.Color.HexStringToColor(this.config.colors.glow).color,
      0.5
    )

    if (animate) {
      this._safeTween({
        targets: this,
        scale: 1,
        duration: 200,
        ease: 'Quad.easeOut'
      })
    } else {
      this.setScale(1)
    }
  }

  /**
   * Crear elementos visuales del botón
   */
  createGraphics() {
    // ► Fondo del botón
    this.background = this.scene.add.graphics()
    this.background.fillStyle(
      Phaser.Display.Color.HexStringToColor(this.config.colors.normal).color,
      1
    )
    this.background.fillRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height
    )
    this.add(this.background)

    // ► Borde/Glow
    this.glowGraphics = this.scene.add.graphics()
    this.glowGraphics.lineStyle(2, Phaser.Display.Color.HexStringToColor(this.config.colors.glow).color, 0.5)
    this.glowGraphics.strokeRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height
    )
    this.add(this.glowGraphics)

    // ► Texto
    this.text = this.scene.add.text(0, 0, this.config.text, {
      fontSize: this.config.fontSize,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: this.config.colors.text,
      align: 'center'
    })
    this.text.setOrigin(0.5)
    this.add(this.text)
  }

  /**
   * Evento: Ratón sobre el botón
   */
  onHover() {
    if (!this.isEnabled || !this._isAlive()) return

    this.isHovering = true

    this.background.clear()
    this.background.fillStyle(
      Phaser.Display.Color.HexStringToColor(this.config.colors.hover).color,
      1
    )
    this.background.fillRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height
    )

    this.glowGraphics.lineStyle(3, Phaser.Display.Color.HexStringToColor(this.config.colors.glow).color, 1)

    this._safeTween({
      targets: this,
      scale: 1.05,
      duration: 200,
      ease: 'Quad.easeOut'
    })
  }

  onHoverOut() {
    if (!this.isEnabled || !this._isAlive()) return
    this._resetVisual(true)
  }

  onPress() {
    if (!this.isEnabled || !this._isAlive()) return

    this.isPressed = true
    this.isHovering = true

    this.background.clear()
    this.background.fillStyle(
      Phaser.Display.Color.HexStringToColor(this.config.colors.press).color,
      1
    )
    this.background.fillRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height
    )
  }

  onRelease() {
    if (!this.isEnabled || !this._isAlive()) return

    const shouldClick = this.isPressed
    this.isPressed = false

    if (shouldClick) {
      this._resetVisual(false)
      this.config.callback()
      return
    }

    this.onHoverOut()
  }

  onReleaseOutside() {
    if (!this.isEnabled || !this._isAlive()) return
    this._resetVisual(false)
  }

  /**
   * Simular click mediante teclado (ENTER)
   */
  simulateClick() {
    if (!this.isEnabled || !this._isAlive()) return

    this._safeTween({
      targets: this,
      scale: 0.95,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    })

    this.config.callback()
  }

  /**
   * Establecer estado habilitado/deshabilitado
   */
  setEnabled(enabled) {
    this.isEnabled = enabled

    if (enabled) {
      this.background.clear()
      this.background.fillStyle(
        Phaser.Display.Color.HexStringToColor(this.config.colors.normal).color,
        1
      )
    } else {
      this.background.clear()
      this.background.fillStyle(
        Phaser.Display.Color.HexStringToColor(this.config.colors.disabled).color,
        1
      )
    }

    this.background.fillRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height
    )

    if (this.background && this.background.setInteractive) {
      this.background.setInteractive(enabled)
    }

    console.log(`[Button] ${enabled ? '✓' : '✗'} ${this.config.text}`)
  }

  /**
   * Cambiar texto del botón
   */
  setText(newText) {
    this.text.setText(newText)
    this.config.text = newText
  }

  /**
   * Cambiar callback del botón
   */
  setCallback(callback) {
    this.config.callback = callback
  }
}

if (typeof window !== 'undefined') {
  window.Button = Button
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Button
}
