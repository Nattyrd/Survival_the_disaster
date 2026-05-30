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

    // ► Eventos del ratón
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -this.config.width / 2,
        -this.config.height / 2,
        this.config.width,
        this.config.height
      ),
      Phaser.Geom.Rectangle.Contains
    )

    this.on('pointerover', () => this.onHover())
    this.on('pointerout', () => this.onHoverOut())
    this.on('pointerdown', () => this.onPress())
    this.on('pointerup', () => this.onRelease())
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
    if (!this.isEnabled) return

    this.isHovering = true

    // ► Cambiar color de fondo
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

    // ► Aumentar brillo del glow
    this.glowGraphics.lineStyle(3, Phaser.Display.Color.HexStringToColor(this.config.colors.glow).color, 1)

    // ► Animación de escala
    this.scene.tweens.add({
      targets: this,
      scale: 1.05,
      duration: 200,
      ease: 'Quad.easeOut'
    })

    console.log(`[Button] ► Hover: ${this.config.text}`)
  }

  /**
   * Evento: Ratón sale del botón
   */
  onHoverOut() {
    if (!this.isEnabled) return

    this.isHovering = false
    this.isPressed = false

    // ► Restaurar color normal
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

    // ► Restaurar glow normal
    this.glowGraphics.lineStyle(2, Phaser.Display.Color.HexStringToColor(this.config.colors.glow).color, 0.5)

    // ► Animación de escala
    this.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 200,
      ease: 'Quad.easeOut'
    })
  }

  /**
   * Evento: Presionar botón (mouse down)
   */
  onPress() {
    if (!this.isEnabled || !this.isHovering) return

    this.isPressed = true

    // ► Cambiar color de presión
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

    console.log(`[Button] ◄ Presionado: ${this.config.text}`)
  }

  /**
   * Evento: Soltar botón (mouse up)
   */
  onRelease() {
    if (!this.isEnabled) return

    if (this.isPressed && this.isHovering) {
      console.log(`[Button] ✓ Click: ${this.config.text}`)
      this.config.callback()
    }

    this.isPressed = false
    this.onHoverOut()
  }

  /**
   * Simular click mediante teclado (ENTER)
   */
  simulateClick() {
    if (!this.isEnabled) return

    console.log(`[Button] ⌨️ Simulado: ${this.config.text}`)

    // ► Animación visual de click
    this.scene.tweens.add({
      targets: this,
      scale: 0.95,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    })

    // ► Ejecutar callback
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

    this.setInteractive(enabled)

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
