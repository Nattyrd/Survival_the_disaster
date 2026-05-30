/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: CONFIGURACIÓN (SETTINGS)
 * ════════════════════════════════════════════════════════════════════════════════
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
 * Pantalla de ajustes con:
 * - Control de volumen (0-100%)
 * - Selección de resolución
 * - Persistencia en localStorage
 * - Botón para volver al menú
 */

class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: "SettingsScene" });

<<<<<<< HEAD
    this.settings = {
      volume: 75,
      resolution: "1680x900",
    };

    this.resolutionsDisponibles = [
      "1680x900",
      "1600x900",
      "1920x1080",
      "1280x720",
    ];

=======
    // ► Configuración guardada
    this.settings = {
      volume: 75,
      resolution: '1280x720'
    };

    // ► Resoluciones disponibles
    this.resolutionsDisponibles = ['1280x720', '1600x900', '1920x1080'];

    // ► Índices de navegación
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    this.campoActual = 0;
    this.elementos = [];
  }

  create() {
<<<<<<< HEAD
    console.log("[SettingsScene] → Iniciando create()");

    this.cameras.main.setBackgroundColor("#1a1a2e");
    this.cargarConfiguracion();
    this.crearPanelAjustes();

    this.input.keyboard.on("keydown-ESC", () => this.volverAlMenu());
    this.input.keyboard.on("keydown-ENTER", () => this.volverAlMenu());

    this.cameras.main.fadeIn(1000);
    console.log("[SettingsScene] ✓ Ajustes inicializados");
  }

  /**
   * Panel centrado en pantalla; filas y botones se colocan con márgenes internos
   * relativos a GAME_WIDTH / GAME_HEIGHT (no coordenadas fijas de 720p).
   */
  crearPanelAjustes() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const panelW = Math.min(760, GAME_WIDTH - 120);
    const panelH = Math.min(460, GAME_HEIGHT - 160);
    const panelTop = cy - panelH / 2;
    const padTop = 44;
    const titleBlock = 46;
    const rowGap = 88;
    const btnCtrl = 52;
    const btnBackW = 300;
    const btnBackH = 54;

    this.add
      .rectangle(cx, cy, panelW, panelH, 0x000000, 0.88)
      .setStrokeStyle(2, 0x9366ff);

    const titulo = this.add
      .text(cx, panelTop + padTop + titleBlock / 2, "AJUSTES", {
        fontSize: "40px",
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const row1Y = panelTop + padTop + titleBlock + 36 + btnCtrl / 2;
    const row2Y = row1Y + rowGap;

    const labelX = cx - panelW / 2 + 48;
    const btnMinusX = cx - 70;
    const valueX = cx + 70;
    const btnPlusX = cx + 210;

    const labelVolumen = this.add.text(labelX, row1Y, "Volumen:", {
      fontSize: "22px",
      fontFamily: "Arial",
      color: "#ffffff",
    });
    labelVolumen.setOrigin(0, 0.5);

    this.textoVolumen = this.add
      .text(valueX, row1Y, `${this.settings.volume}%`, {
        fontSize: "22px",
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#9366ff",
      })
      .setOrigin(0.5);

    const botonVolumenMenos = new Button(this, btnMinusX, row1Y, {
      text: "◀",
      width: btnCtrl,
      height: btnCtrl,
      fontSize: "22px",
      callback: () => this.ajustarVolumen(-5),
    });

    const botonVolumenMas = new Button(this, btnPlusX, row1Y, {
      text: "▶",
      width: btnCtrl,
      height: btnCtrl,
      fontSize: "22px",
      callback: () => this.ajustarVolumen(5),
    });

    this.elementos.push({
      tipo: "volumen",
      botones: [botonVolumenMenos, botonVolumenMas],
      indice: 0,
    });

    const labelResolucion = this.add.text(labelX, row2Y, "Resolución:", {
      fontSize: "22px",
      fontFamily: "Arial",
      color: "#ffffff",
    });
    labelResolucion.setOrigin(0, 0.5);

    this.textoResolucion = this.add
      .text(valueX, row2Y, this.settings.resolution, {
        fontSize: "22px",
        fontFamily: "Arial",
        fontStyle: "bold",
        color: "#9366ff",
      })
      .setOrigin(0.5);

    const botonResolucionMenos = new Button(this, btnMinusX, row2Y, {
      text: "◀",
      width: btnCtrl,
      height: btnCtrl,
      fontSize: "22px",
      callback: () => this.cambiarResolucion(-1),
    });

    const botonResolucionMas = new Button(this, btnPlusX, row2Y, {
      text: "▶",
      width: btnCtrl,
      height: btnCtrl,
      fontSize: "22px",
      callback: () => this.cambiarResolucion(1),
    });

    this.elementos.push({
      tipo: "resolucion",
      botones: [botonResolucionMenos, botonResolucionMas],
      indice: 1,
    });

    const btnBackY = panelTop + panelH - 44 - btnBackH / 2;
    new Button(this, cx, btnBackY, {
      text: "Volver al Menú",
      width: btnBackW,
      height: btnBackH,
      fontSize: "22px",
      callback: () => this.volverAlMenu(),
    });
  }

  cargarConfiguracion() {
    try {
      const stored = localStorage.getItem("gameSettings");
=======
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
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (error) {
<<<<<<< HEAD
      console.warn(
        "[SettingsScene] No se pudo cargar configuración:",
        error.message,
      );
    }
  }

  guardarConfiguracion() {
    try {
      localStorage.setItem("gameSettings", JSON.stringify(this.settings));
      console.log("[SettingsScene] ✓ Configuración guardada");
    } catch (error) {
      console.warn(
        "[SettingsScene] No se pudo guardar configuración:",
        error.message,
      );
    }
  }

=======
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
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
  ajustarVolumen(delta) {
    this.settings.volume = Phaser.Math.Clamp(
      this.settings.volume + delta,
      0,
<<<<<<< HEAD
      100,
=======
      100
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    );

    this.textoVolumen.setText(`${this.settings.volume}%`);
    this.guardarConfiguracion();

    console.log(`[SettingsScene] 🔊 Volumen: ${this.settings.volume}%`);
  }

<<<<<<< HEAD
  cambiarResolucion(direccion) {
    const indiceActual = this.resolutionsDisponibles.indexOf(
      this.settings.resolution,
    );
=======
  /**
   * Cambiar resolución
   */
  cambiarResolucion(direccion) {
    const indiceActual = this.resolutionsDisponibles.indexOf(this.settings.resolution);
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
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

<<<<<<< HEAD
=======
  /**
   * Actualizar visualización del campo seleccionado
   */
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
  actualizarSeleccion() {
    // TODO: Implementar navegación con teclado
  }

<<<<<<< HEAD
  volverAlMenu() {
    console.log("[SettingsScene] ⏪ Volviendo al menú...");

    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      irAlMenuPrincipal(this);
    });
  }

  shutdown() {
    console.log("[SettingsScene] ⏹ Limpiando SettingsScene");
=======
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
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
  }
}
