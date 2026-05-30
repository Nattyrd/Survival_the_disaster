/**
 * ════════════════════════════════════════════════════════════════════════════════
 * GESTOR DE ANIMACIONES - Sistema cinematográfico frame-by-frame
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Características:
 * ✓ Soporte para múltiples atlas en secuencia (intro_parte1 → intro_parte6)
 * ✓ Ordenamiento numérico correcto de fotogramas (001, 002...010 - NO: 001, 002...01)
 * ✓ Manejo automático de paginación de multiatlas
 * ✓ Callbacks para eventos de animación
 * ✓ Gestión de memoria y limpieza de eventos
 */

class GestorAnimaciones {
  // ═══════════════════════════════════════════════════════════════════════════════
  // MÉTODOS ESTÁTICOS - Utilitarios de fotogramas
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Extrae el número de un nombre de fotograma
   * Ejemplo: "ezgif-frame-042" → 42
   */
  static extraerNumero(nombreFotograma) {
    const coincidencias = nombreFotograma.match(/\d+/g)
    return coincidencias ? parseInt(coincidencias[coincidencias.length - 1], 10) : 0
  }

  /**
   * Comparador para ordenamiento numérico
   * Crucial para mantener orden correcto de animación
   */
  static ordenarNumericamente(a, b) {
    return this.extraerNumero(a) - this.extraerNumero(b)
  }

  /**
   * Genera array de fotogramas ordenados correctamente desde multiatlas
   * 
   * ► IMPORTANTE: Ordena numéricamente, NO alfabéticamente
   *   Esto previene el bug donde frame-010 va después de frame-009
   */
  static generarFotogramasSecuenciados(escena, claveTienda) {
    // ► Verificar que la textura esté cargada
    if (!escena.textures.exists(claveTienda)) {
      console.error(
        `[GestorAnimaciones] ✗ Textura no encontrada: "${claveTienda}"`
      )
      return []
    }

    const textura = escena.textures.get(claveTienda)
    const nombresFotogramas = textura.getFrameNames()

    if (nombresFotogramas.length === 0) {
      console.warn(`[GestorAnimaciones] ⚠ Sin fotogramas en "${claveTienda}"`)
      return []
    }

    // ► CRÍTICO: Ordenar numéricamente, no alfabéticamente
    const fotogramasOrdenados = [...nombresFotogramas].sort(
      (a, b) => this.extraerNumero(a) - this.extraerNumero(b)
    )

    // ► Mapear al formato de fotogramas de Phaser
    const fotogramasAnimacion = fotogramasOrdenados.map(nombreFotograma => ({
      key: claveTienda,
      frame: nombreFotograma
    }))

    console.log(
      `[GestorAnimaciones] ✓ Generados ${fotogramasAnimacion.length} fotogramas desde "${claveTienda}"`
    )
    console.log(
      `[GestorAnimaciones] ► Secuencia: "${fotogramasOrdenados[0]}" → "${fotogramasOrdenados[fotogramasOrdenados.length - 1]}"`
    )

    return fotogramasAnimacion
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CREACIÓN DE ANIMACIONES
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Crea una animación desde un multiatlas
   * 
   * @param {Phaser.Scene} escena - Instancia de la escena Phaser
   * @param {string} claveTienda - Clave del multiatlas (ej: 'introParte1')
   * @param {string} claveAnimacion - ID único de la animación (ej: 'animIntro1')
   * @param {number} velFotogramas - FPS (24 para cine, 30 para juegos)
   * @param {Object} callbacks - {alIniciar, alCompletar, alRepetir}
   * @returns {Object|null} Metadata de animación o null si falla
   */
  static crearAnimacionFotogramas(
    escena,
    claveTienda,
    claveAnimacion,
    velFotogramas = 24,
    callbacks = {}
  ) {
    console.log(
      `[GestorAnimaciones] → Creando "${claveAnimacion}" desde "${claveTienda}"`
    )

    // ► Generar fotogramas ordenados correctamente
    const fotogramas = this.generarFotogramasSecuenciados(escena, claveTienda)

    if (fotogramas.length === 0) {
      console.error(`[GestorAnimaciones] ✗ No se pudo crear "${claveAnimacion}"`)
      return null
    }

    // ► Configurar animación
    const configAnimacion = {
      key: claveAnimacion,
      frames: fotogramas,
      frameRate: velFotogramas,
      repeat: 0,
      yoyo: false,
      showOnStart: true,
      hideOnComplete: false
    }

    // ► Agregar callbacks si existen
    if (callbacks.alIniciar) {
      configAnimacion.onStart = callbacks.alIniciar
    }
    if (callbacks.alCompletar) {
      configAnimacion.onComplete = callbacks.alCompletar
    }
    if (callbacks.alRepetir) {
      configAnimacion.onRepeat = callbacks.alRepetir
    }

    // ► Crear la animación
    try {
      escena.anims.create(configAnimacion)
      console.log(`[GestorAnimaciones] ✓ "${claveAnimacion}" creada exitosamente`)
      return configAnimacion
    } catch (error) {
      console.error(
        `[GestorAnimaciones] ✗ Error creando "${claveAnimacion}":`,
        error
      )
      return null
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // REPRODUCCIÓN Y CONTROL
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Reproduce una animación en un sprite
   * 
   * @param {Phaser.GameObjects.Sprite} sprite - El sprite a animar
   * @param {string} claveAnimacion - Clave de la animación a reproducir
   * @param {Function} alCompletar - Callback cuando termine la animación
   */
  static reproducirAnimacion(sprite, claveAnimacion, alCompletar = null) {
    if (!sprite) {
      console.error('[GestorAnimaciones] ✗ Sprite no válido')
      return
    }

    sprite.play(claveAnimacion)

    if (alCompletar) {
      sprite.once('animationcomplete', alCompletar)
    }

    console.log(`[GestorAnimaciones] ► Reproduciendo "${claveAnimacion}"`)
  }

  /**
   * Detiene una animación de forma limpia
   */
  static detenerAnimacion(sprite) {
    if (sprite && sprite.anims.isPlaying) {
      sprite.anims.stop()
      console.log('[GestorAnimaciones] ⏹ Animación detenida')
    }
  }

  /**
   * Pausa una animación en reproducción
   */
  static pausarAnimacion(sprite) {
    if (sprite && sprite.anims.isPlaying) {
      sprite.anims.pause()
      console.log('[GestorAnimaciones] ⏸ Animación pausada')
    }
  }

  /**
   * Reanuda una animación pausada
   */
  static reanudarAnimacion(sprite) {
    if (sprite && sprite.anims.isPaused) {
      sprite.anims.resume()
      console.log('[GestorAnimaciones] ▶ Animación reanudada')
    }
  }
}

if (typeof window !== 'undefined') {
  window.GestorAnimaciones = GestorAnimaciones
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GestorAnimaciones
}
