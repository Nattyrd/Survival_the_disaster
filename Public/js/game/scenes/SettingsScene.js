/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: CONFIGURACIÓN (SETTINGS)
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Pantalla de ajustes con:
 * - Control de volumen (0-100%)
 * - Selección de resolución
 * - Persistencia en localStorage
 * - Botón para volver al menú
 */

class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: "SettingsScene" });

    // ► Configuración guardada
    this.settings = {
      volume: 75,
      resolution: '1280x720'
    };

    // ► Resoluciones disponibles
    this.resolutionsDisponibles = ['1280x720', '1600x900', '1920x1080'];

    // ► Índices de navegación
    this.campoActual = 0;
    this.elementos = [];
  }

  create() {
    console.log('[SettingsScene] → Iniciando create()');

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ CONFIGURACIÓN INICIAL
    // ╚════════════════════════════════════════════════════════════════╝

    this.cameras.main.setBackgroundColor('#1a1a2e');

    // ► Cargar configuración guardada
    this.cargarConfiguracion();

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ TÍTULO
    // ╚════════════════════════════════════════════════════════════════╝

    const titulo = this.add.text(GAME_WIDTH / 2, 80, 'AJUSTES', {
      fontSize: '48px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    titulo.setOrigin(0.5);

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ CONTROL DE VOLUMEN
    // ╚════════════════════════════════════════════════════════════════╝

    const labelVolumen = this.add.text(200, 200, 'Volumen:', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // ► Mostrar valor actual de volumen
    this.textoVolumen = this.add.text(GAME_WIDTH - 200, 200, `${this.settings.volume}%`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#9366ff'
    });

    // ► Botones para ajustar volumen
    const botonVolumenMenos = new Button(this, 450, 200, {
      text: '◀',
      width: 60,
      height: 60,
      fontSize: '24px',
      callback: () => this.ajustarVolumen(-5)
    });

    const botonVolumenMas = new Button(this, GAME_WIDTH - 450, 200, {
      text: '▶',
      width: 60,
      height: 60,
      fontSize: '24px',
      callback: () => this.ajustarVolumen(5)
    });

    this.elementos.push({
      tipo: 'volumen',
      botones: [botonVolumenMenos, botonVolumenMas],
      indice: 0
    });

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ SELECCIÓN DE RESOLUCIÓN
    // ╚════════════════════════════════════════════════════════════════╝

    const labelResolucion = this.add.text(200, 350, 'Resolución:', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    // ► Mostrar resolución actual
    this.textoResolucion = this.add.text(GAME_WIDTH - 200, 350, this.settings.resolution, {
      fontSize: '24px',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      color: '#9366ff'
    });

    // ► Botones para cambiar resolución
    const botonResolucionMenos = new Button(this, 450, 350, {
      text: '◀',
      width: 60,
      height: 60,
      fontSize: '24px',
      callback: () => this.cambiarResolucion(-1)
    });

    const botonResolucionMas = new Button(this, GAME_WIDTH - 450, 350, {
      text: '▶',
      width: 60,
      height: 60,
      fontSize: '24px',
      callback: () => this.cambiarResolucion(1)
    });

    this.elementos.push({
      tipo: 'resolucion',
      botones: [botonResolucionMenos, botonResolucionMas],
      indice: 1
    });

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ BOTÓN VOLVER
    // ╚════════════════════════════════════════════════════════════════╝

    const botonVolver = new Button(this, GAME_WIDTH / 2, 550, {
      text: 'Volver al Menú',
      width: 300,
      height: 60,
      fontSize: '24px',
      callback: () => this.volverAlMenu()
    });

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ ENTRADA DE USUARIO - TECLADO
    // ╚════════════════════════════════════════════════════════════════╝

    this.input.keyboard.on('keydown-ESC', () => {
      this.volverAlMenu();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.volverAlMenu();
    });

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ FADE IN
    // ╚════════════════════════════════════════════════════════════════╝

    this.cameras.main.fadeIn(1000);

    console.log('[SettingsScene] ✓ Ajustes inicializados');
  }

  /**
   * Cargar configuración desde localStorage
   */
  cargarConfiguracion() {
    try {
      const stored = localStorage.getItem('gameSettings');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (error) {
      console.warn('[SettingsScene] No se pudo cargar configuración:', error.message);
    }
  }

  /**
   * Guardar configuración en localStorage
   */
  guardarConfiguracion() {
    try {
      localStorage.setItem('gameSettings', JSON.stringify(this.settings));
      console.log('[SettingsScene] ✓ Configuración guardada');
    } catch (error) {
      console.warn('[SettingsScene] No se pudo guardar configuración:', error.message);
    }
  }

  /**
   * Ajustar volumen
   */
  ajustarVolumen(delta) {
    this.settings.volume = Phaser.Math.Clamp(
      this.settings.volume + delta,
      0,
      100
    );

    this.textoVolumen.setText(`${this.settings.volume}%`);
    this.guardarConfiguracion();

    console.log(`[SettingsScene] 🔊 Volumen: ${this.settings.volume}%`);
  }

  /**
   * Cambiar resolución
   */
  cambiarResolucion(direccion) {
    const indiceActual = this.resolutionsDisponibles.indexOf(this.settings.resolution);
    let nuevoIndice = indiceActual + direccion;

    if (nuevoIndice < 0) {
      nuevoIndice = this.resolutionsDisponibles.length - 1;
    } else if (nuevoIndice >= this.resolutionsDisponibles.length) {
      nuevoIndice = 0;
    }

    this.settings.resolution = this.resolutionsDisponibles[nuevoIndice];
    this.textoResolucion.setText(this.settings.resolution);
    this.guardarConfiguracion();

    console.log(`[SettingsScene] 📺 Resolución: ${this.settings.resolution}`);
  }

  /**
   * Actualizar visualización del campo seleccionado
   */
  actualizarSeleccion() {
    // TODO: Implementar navegación con teclado
  }

  /**
   * Volver al menú
   */
  volverAlMenu() {
    console.log('[SettingsScene] ⏪ Volviendo al menú...');

    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }

  /**
   * Limpiar al salir
   */
  shutdown() {
    console.log('[SettingsScene] ⏹ Limpiando SettingsScene');
  }
}
