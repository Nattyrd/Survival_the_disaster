/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: MENÚ PRINCIPAL (CON SELECCIÓN DE PERSONAJE Y CINEMÁTICA)
 * ════════════════════════════════════════════════════════════════════════════════
 */

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.botones = [];
    this.botonesIndice = 0;
<<<<<<< HEAD

    // Estados del menú
    this.estado = "PRINCIPAL"; // PRINCIPAL, PERSONAJE, CINEMATICA, MISIONES, HISTORIA
    this.navegacionBloqueada = false;

    this.botonesPrincipales = [];
    this.botonesPersonajes = [];
    this.botonesMisiones = [];
    this.botonesHistoria = [];
  }

  create() {
    console.log("[MenuScene] → Iniciando MenuScene v2");
    this.botonesPrincipales = [];
    this.botonesPersonajes = [];
    this.botonesMisiones = [];
    this.botonesHistoria = [];
    this.botones = [];
    this.botonesIndice = 0;
    this.navegacionBloqueada = false;
    this.estado = "PRINCIPAL";

=======
    
    // Estados del menú
    this.estado = "PRINCIPAL"; // PRINCIPAL, PERSONAJE, CINEMATICA, MISIONES
    
    this.botonesPrincipales = [];
    this.botonesPersonajes = [];
    this.botonesMisiones = [];
  }

  create() {
    console.log('[MenuScene] → Iniciando MenuScene v2');
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    this.cameras.main.setBackgroundColor("#000000");

    // Fondo
    try {
<<<<<<< HEAD
      if (this.textures.exists("menuBg")) {
        this.add
          .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "menuBg")
          .setDepth(-100);
=======
      if (this.textures.exists('menuBg')) {
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'menuBg').setDepth(-100);
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
      }
    } catch (e) {}

    // Inicializar Contenedores de Submenús
    this.crearMenuPrincipal();
    this.crearSubMenuPersonajes();
    this.crearSubMenuMisiones();
<<<<<<< HEAD
    this.crearSubMenuHistoria();

    // Entrada Teclado
    this.teclas = {
      up: this.input.keyboard.addKey("UP"),
      down: this.input.keyboard.addKey("DOWN"),
      enter: this.input.keyboard.addKey("ENTER"),
      esc: this.input.keyboard.addKey("ESC"),
    };

    this.teclas.up.on("down", () => this.cambiarSeleccion(-1));
    this.teclas.down.on("down", () => this.cambiarSeleccion(1));
    this.teclas.enter.on("down", () => this.confirmarSeleccion());
    this.teclas.esc.on("down", () => this.manejarEsc());
=======

    // Entrada Teclado
    this.input.keyboard.on('keydown-UP', () => this.cambiarSeleccion(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.cambiarSeleccion(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirmarSeleccion());
    this.input.keyboard.on('keydown-ESC', () => this.manejarEsc());
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0

    this.cameras.main.fadeIn(1000);
  }

<<<<<<< HEAD
  shutdown() {
    if (this.teclas) {
      this.teclas.up.removeAllListeners();
      this.teclas.down.removeAllListeners();
      this.teclas.enter.removeAllListeners();
      this.teclas.esc.removeAllListeners();
    }
    this.tweens.killAll();
  }

=======
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
  // ╔════════════════════════════════════════════════════════════════╗
  // ║ MENÚ PRINCIPAL
  // ╚════════════════════════════════════════════════════════════════╝

  crearMenuPrincipal() {
<<<<<<< HEAD
    const btnW = 350;
    const btnH = 55;
    const btnGap = 68;
    const marginBottom = Math.max(72, Math.round(GAME_HEIGHT * 0.09));
    const textos = [
      "Empezar Aventura",
      "Continuar",
      "Ajustes",
      "Créditos",
      "Salir",
    ];
    const callbacks = [
      () => this.cambiarEstado("MISIONES"),
      () => this.continuarJuego(),
      () => this.irAjustes(),
      () => this.irCreditos(),
      () => this.salirJuego(),
    ];

    const lastBtnY = GAME_HEIGHT - marginBottom - btnH / 2;
    const firstBtnY = lastBtnY - (textos.length - 1) * btnGap;

    textos.forEach((txt, i) => {
      const btn = new Button(this, GAME_WIDTH / 2, firstBtnY + i * btnGap, {
        text: txt,
        width: btnW,
        height: btnH,
        callback: callbacks[i],
      });
      this.botonesPrincipales.push(btn);
=======
    const posY = [350, 420, 490, 560, 630];
    const textos = ['Empezar Aventura', 'Continuar', 'Ajustes', 'Créditos', 'Salir'];
    const callbacks = [
        () => this.cambiarEstado("PERSONAJE"),
        () => this.continuarJuego(),
        () => this.irAjustes(),
        () => this.irCreditos(),
        () => this.salirJuego()
    ];

    textos.forEach((txt, i) => {
        const btn = new Button(this, GAME_WIDTH / 2, posY[i], {
            text: txt, width: 350, height: 55, callback: callbacks[i]
        });
        this.botonesPrincipales.push(btn);
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    });
    this.botones = this.botonesPrincipales;
    this.seleccionarBoton(0);
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ SELECCIÓN DE PERSONAJE
  // ╚════════════════════════════════════════════════════════════════╝

  crearSubMenuPersonajes() {
    this.contenedorPersonajes = this.add.container(0, 0).setVisible(false);
<<<<<<< HEAD

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const btnW = 350;
    const btnH = 52;
    const btnGap = 62;
    const padX = 44;
    const padTop = 40;
    const padBottom = 36;
    const titleBlock = 36;

    const pjs = [
      { id: "hero", nombre: "Soldado Alpha" },
      { id: "hero2", nombre: "Cyber Vanguard" },
      { id: "volver", nombre: "Volver" },
    ];

    const buttonsBlockH = (pjs.length - 1) * btnGap + btnH;
    const panelW = btnW + padX * 2;
    const panelH = padTop + titleBlock + 24 + buttonsBlockH + padBottom;
    const panelTop = cy - panelH / 2;

    const fondo = this.add
      .rectangle(cx, cy, panelW, panelH, 0x000000, 0.9)
      .setStrokeStyle(2, 0x38bdf8);
    this.contenedorPersonajes.add(fondo);

    const titulo = this.add
      .text(cx, panelTop + padTop + titleBlock / 2, "ELIGE TU SUPERVIVIENTE", {
        fontSize: "26px",
        color: "#38bdf8",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.contenedorPersonajes.add(titulo);

    const firstBtnY = panelTop + padTop + titleBlock + 24 + btnH / 2;

    pjs.forEach((p, i) => {
      const btn = new Button(this, cx, firstBtnY + i * btnGap, {
        text: p.nombre,
        width: btnW,
        height: btnH,
        callback: () => {
          if (p.id === "volver") this.cambiarEstado("PRINCIPAL");
          else this.seleccionarPersonaje(p.id);
        },
      });
      this.botonesPersonajes.push(btn);
      this.contenedorPersonajes.add(btn);
=======
    const fondo = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, 500, 400, 0x000000, 0.9).setStrokeStyle(2, 0x38bdf8);
    this.contenedorPersonajes.add(fondo);

    const titulo = this.add.text(GAME_WIDTH/2, 220, 'ELIGE TU SUPERVIVIENTE', { fontSize: '28px', color: '#38bdf8', fontStyle: 'bold' }).setOrigin(0.5);
    this.contenedorPersonajes.add(titulo);

    const pjs = [
        { id: 'hero', nombre: 'Soldado Alpha' },
        { id: 'hero2', nombre: 'Cyber Vanguard' },
        { id: 'volver', nombre: 'Volver' }
    ];

    pjs.forEach((p, i) => {
        const btn = new Button(this, GAME_WIDTH / 2, 300 + (i * 70), {
            text: p.nombre, width: 350, height: 55,
            callback: () => {
                if (p.id === 'volver') this.cambiarEstado("PRINCIPAL");
                else this.seleccionarPersonaje(p.id);
            }
        });
        this.botonesPersonajes.push(btn);
        this.contenedorPersonajes.add(btn);
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    });
  }

  seleccionarPersonaje(id) {
    console.log(`[MenuScene] Personaje seleccionado: ${id}`);
    this.registry.set("selectedCharacter", id);
    this.cambiarEstado("CINEMATICA");
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ PEQUEÑA CINEMÁTICA NARRATIVA
  // ╚════════════════════════════════════════════════════════════════╝

  reproducirCinematicaHistoria() {
<<<<<<< HEAD
    this.botonesPrincipales.forEach((b) => b.setVisible(false));
    this.contenedorPersonajes.setVisible(false);
    this.botones = [];

    const overlay = this.add
      .rectangle(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        GAME_WIDTH,
        GAME_HEIGHT,
        0x000000,
      )
      .setAlpha(0);
    const textoHistoria = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        "El mundo ha caído...\nPero la misión apenas comienza.",
        {
          fontSize: "32px",
          color: "#ffffff",
          align: "center",
          fontFamily: "serif",
          fontStyle: "italic",
        },
      )
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: overlay,
      alpha: 0.8,
      duration: 1000,
      onComplete: () => {
        this.tweens.add({
          targets: textoHistoria,
          alpha: 1,
          duration: 2000,
          yoyo: true,
          hold: 1500,
          onComplete: () => {
            this.tweens.add({
              targets: overlay,
              alpha: 0,
              duration: 1000,
              onComplete: () => {
                overlay.destroy();
                textoHistoria.destroy();
                this.navegacionBloqueada = false;
                this.cambiarEstado("MISIONES");
              },
            });
          },
        });
      },
=======
    this.botonesPrincipales.forEach(b => b.setVisible(false));
    this.contenedorPersonajes.setVisible(false);
    
    const overlay = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x000000).setAlpha(0);
    const textoHistoria = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, "El mundo ha caído...\nPero la misión apenas comienza.", {
        fontSize: '32px', color: '#ffffff', align: 'center', fontFamily: 'serif', fontStyle: 'italic'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
        targets: overlay,
        alpha: 0.8,
        duration: 1000,
        onComplete: () => {
            this.tweens.add({
                targets: textoHistoria,
                alpha: 1,
                duration: 2000,
                yoyo: true,
                hold: 1500,
                onComplete: () => {
                    this.tweens.add({
                        targets: overlay,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            overlay.destroy();
                            textoHistoria.destroy();
                            this.cambiarEstado("MISIONES");
                        }
                    });
                }
            });
        }
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    });
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ SELECCIÓN DE MISIONES
  // ╚════════════════════════════════════════════════════════════════╝

  crearSubMenuMisiones() {
    this.contenedorMisiones = this.add.container(0, 0).setVisible(false);
<<<<<<< HEAD

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const btnW = 400;
    const btnH = 52;
    const btnGap = 56;
    const padX = 48;
    const padTop = 44;
    const padBottom = 36;
    const titleBlock = 40;
    const gapAfterTitle = 22;

    const misiones = [
      { id: 1, nombre: "Misión 1: El Robot Jefe" },
      { id: 2, nombre: "Misión 2: Titán MK-3" },
      { id: 3, nombre: "Misión 3: Andronimus" },
      { id: "historia", nombre: "Historia" },
      { id: "volver", nombre: "Volver al Menú" },
    ];

    const buttonsBlockH = (misiones.length - 1) * btnGap + btnH;
    const panelW = btnW + padX * 2;
    const panelH =
      padTop + titleBlock + gapAfterTitle + buttonsBlockH + padBottom;
    const panelTop = cy - panelH / 2;

    const fondo = this.add
      .rectangle(cx, cy, panelW, panelH, 0x000000, 0.9)
      .setStrokeStyle(2, 0x4a2a6f);
    this.contenedorMisiones.add(fondo);

    const titulo = this.add
      .text(cx, panelTop + padTop + titleBlock / 2, "OBJETIVOS DISPONIBLES", {
        fontSize: "26px",
        color: "#a855f7",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.contenedorMisiones.add(titulo);

    const firstBtnY =
      panelTop + padTop + titleBlock + gapAfterTitle + btnH / 2;

    misiones.forEach((m, i) => {
      const btn = new Button(this, cx, firstBtnY + i * btnGap, {
        text: m.nombre,
        width: btnW,
        height: btnH,
        callback: () => {
          if (m.id === "volver") this.cambiarEstado("PRINCIPAL");
          else if (m.id === "historia") this.cambiarEstado("HISTORIA");
          else this.iniciarMision(m.id);
        },
      });
      this.botonesMisiones.push(btn);
      this.contenedorMisiones.add(btn);
    });
  }

  crearSubMenuHistoria() {
    this.contenedorHistoria = this.add.container(0, 0).setVisible(false);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const padX = 44;
    const padTop = 40;
    const padBottom = 36;
    const btnW = 320;
    const btnH = 52;
    const panelW = 580;
    const wrapW = panelW - padX * 2;

    const descripcionTexto =
      "Aquí continuará la campaña principal por capítulos.\n\n" +
      "• La historia avanzará de forma lineal (sin elegir capítulo)\n" +
      "• Mapas con desplazamiento horizontal\n" +
      "• Nuevos enemigos, jefes y mecánicas\n\n" +
      "Por ahora, juega las misiones disponibles arriba.";

    const descripcionMedida = this.make
      .text({
        x: 0,
        y: 0,
        text: descripcionTexto,
        style: {
          fontSize: "15px",
          color: "#cbd5e1",
          align: "center",
          lineSpacing: 5,
          wordWrap: { width: wrapW },
        },
      })
      .setVisible(false);
    const descBlockH = descripcionMedida.height;
    descripcionMedida.destroy();

    const titleBlock = 34;
    const subtitleBlock = 24;
    const gapSmall = 10;
    const gapBeforeDesc = 18;
    const gapBeforeBtn = 22;

    const panelH =
      padTop +
      titleBlock +
      gapSmall +
      subtitleBlock +
      gapBeforeDesc +
      descBlockH +
      gapBeforeBtn +
      btnH +
      padBottom;
    const panelTop = cy - panelH / 2;

    let y = panelTop + padTop;

    const fondo = this.add
      .rectangle(cx, cy, panelW, panelH, 0x000000, 0.92)
      .setStrokeStyle(2, 0x22c55e);
    this.contenedorHistoria.add(fondo);

    const titulo = this.add
      .text(cx, y + titleBlock / 2, "HISTORIA", {
        fontSize: "28px",
        color: "#22c55e",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.contenedorHistoria.add(titulo);
    y += titleBlock + gapSmall;

    const subtitulo = this.add
      .text(cx, y + subtitleBlock / 2, "Próximamente", {
        fontSize: "18px",
        color: "#86efac",
      })
      .setOrigin(0.5);
    this.contenedorHistoria.add(subtitulo);
    y += subtitleBlock + gapBeforeDesc;

    const descripcion = this.add
      .text(cx, y + descBlockH / 2, descripcionTexto, {
        fontSize: "15px",
        color: "#cbd5e1",
        align: "center",
        lineSpacing: 5,
        wordWrap: { width: wrapW },
      })
      .setOrigin(0.5, 0.5);
    this.contenedorHistoria.add(descripcion);
    y += descBlockH + gapBeforeBtn;

    const btnVolver = new Button(this, cx, y + btnH / 2, {
      text: "Volver a misiones",
      width: btnW,
      height: btnH,
      callback: () => this.cambiarEstado("MISIONES"),
    });
    this.botonesHistoria.push(btnVolver);
    this.contenedorHistoria.add(btnVolver);
  }

=======
    const fondo = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, 500, 450, 0x000000, 0.9).setStrokeStyle(2, 0x4a2a6f);
    this.contenedorMisiones.add(fondo);

    const titulo = this.add.text(GAME_WIDTH/2, 200, 'OBJETIVOS DISPONIBLES', { fontSize: '28px', color: '#a855f7', fontStyle: 'bold' }).setOrigin(0.5);
    this.contenedorMisiones.add(titulo);

    const misiones = [
        { id: 1, nombre: 'Misión 1: El Robot Jefe' },
        { id: 2, nombre: 'Misión 2: (Bloqueado)' },
        { id: 3, nombre: 'Misión 3: (Bloqueado)' },
        { id: 'volver', nombre: 'Volver al Menú' }
    ];

    misiones.forEach((m, i) => {
        const btn = new Button(this, GAME_WIDTH / 2, 280 + (i * 70), {
            text: m.nombre, width: 380, height: 55,
            callback: () => {
                if (m.id === 'volver') this.cambiarEstado("PRINCIPAL");
                else if (m.id === 1) this.iniciarMision(m.id);
            }
        });
        this.botonesMisiones.push(btn);
        this.contenedorMisiones.add(btn);
    });
  }

>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
  // ╔════════════════════════════════════════════════════════════════╗
  // ║ CONTROL DE ESTADOS Y NAVEGACIÓN
  // ╚════════════════════════════════════════════════════════════════╝

  cambiarEstado(nuevoEstado) {
<<<<<<< HEAD
    if (this.navegacionBloqueada && nuevoEstado !== "PRINCIPAL") {
      return;
    }

    console.log(
      `[MenuScene] Cambio de estado: ${this.estado} → ${nuevoEstado}`,
    );

    // Limpiar visibilidad actual
    this.botonesPrincipales.forEach((b) => b.setVisible(false));
    this.contenedorPersonajes.setVisible(false);
    this.contenedorMisiones.setVisible(false);
    if (this.contenedorHistoria) {
      this.contenedorHistoria.setVisible(false);
    }

    this.estado = nuevoEstado;

    switch (nuevoEstado) {
      case "PRINCIPAL":
        this.botonesPrincipales.forEach((b) => b.setVisible(true));
        this.botones = this.botonesPrincipales;
        break;
      case "PERSONAJE":
        this.contenedorPersonajes.setVisible(true);
        this.botones = this.botonesPersonajes;
        break;
      case "CINEMATICA":
        this.navegacionBloqueada = true;
        this.reproducirCinematicaHistoria();
        return;
      case "MISIONES":
        this.contenedorMisiones.setVisible(true);
        this.botones = this.botonesMisiones;
        break;
      case "HISTORIA":
        this.contenedorHistoria.setVisible(true);
        this.botones = this.botonesHistoria;
        break;
=======
    console.log(`[MenuScene] Cambio de estado: ${this.estado} → ${nuevoEstado}`);
    
    // Limpiar visibilidad actual
    this.botonesPrincipales.forEach(b => b.setVisible(false));
    this.contenedorPersonajes.setVisible(false);
    this.contenedorMisiones.setVisible(false);

    this.estado = nuevoEstado;

    switch(nuevoEstado) {
        case "PRINCIPAL":
            this.botonesPrincipales.forEach(b => b.setVisible(true));
            this.botones = this.botonesPrincipales;
            break;
        case "PERSONAJE":
            this.contenedorPersonajes.setVisible(true);
            this.botones = this.botonesPersonajes;
            break;
        case "CINEMATICA":
            this.reproducirCinematicaHistoria();
            return; // No hay botones en cinemática
        case "MISIONES":
            this.contenedorMisiones.setVisible(true);
            this.botones = this.botonesMisiones;
            break;
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    }

    this.seleccionarBoton(0);
  }

  cambiarSeleccion(dir) {
<<<<<<< HEAD
    if (this.estado === "CINEMATICA" || this.navegacionBloqueada) return;
    if (!this.botones || this.botones.length === 0) return;
=======
    if (this.estado === "CINEMATICA") return;
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    let nuevo = this.botonesIndice + dir;
    if (nuevo < 0) nuevo = this.botones.length - 1;
    if (nuevo >= this.botones.length) nuevo = 0;
    this.seleccionarBoton(nuevo);
  }

  seleccionarBoton(indice) {
<<<<<<< HEAD
    if (this.botones[this.botonesIndice])
      this.botones[this.botonesIndice].onHoverOut();
    this.botonesIndice = indice;
    if (this.botones[this.botonesIndice])
      this.botones[this.botonesIndice].onHover();
  }

  confirmarSeleccion() {
    if (this.estado === "CINEMATICA" || this.navegacionBloqueada) return;
    if (!this.botones || this.botones.length === 0) return;
    if (this.botones[this.botonesIndice]) {
      this.botones[this.botonesIndice].simulateClick();
=======
    if (this.botones[this.botonesIndice]) this.botones[this.botonesIndice].onHoverOut();
    this.botonesIndice = indice;
    if (this.botones[this.botonesIndice]) this.botones[this.botonesIndice].onHover();
  }

  confirmarSeleccion() {
    if (this.estado === "CINEMATICA") return;
    if (this.botones[this.botonesIndice]) {
        this.botones[this.botonesIndice].simulateClick();
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    }
  }

  manejarEsc() {
<<<<<<< HEAD
    if (this.estado === "HISTORIA") {
      this.cambiarEstado("MISIONES");
      return;
    }
    if (this.estado === "PERSONAJE" || this.estado === "MISIONES") {
      this.cambiarEstado("PRINCIPAL");
=======
    if (this.estado === "PERSONAJE" || this.estado === "MISIONES") {
        this.cambiarEstado("PRINCIPAL");
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    }
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ FUNCIONES DE ACCIÓN
  // ╚════════════════════════════════════════════════════════════════╝

  iniciarMision(id) {
<<<<<<< HEAD
    if (this.navegacionBloqueada) return;
    this.navegacionBloqueada = true;
    this.registry.set("mission", id);
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => this.scene.start("PreloadScene"));
  }

  continuarJuego() {
    let last = 1;
    try {
      last = parseInt(localStorage.getItem("last_mission") || "1", 10);
    } catch (e) {
      last = 1;
    }
    if (Number.isNaN(last) || last < 1) last = 1;
    if (last > 3) last = 3;
    this.iniciarMision(last);
  }

  irAjustes() {
    if (this.navegacionBloqueada) return;
    this.navegacionBloqueada = true;
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => this.scene.start("SettingsScene"));
  }

  irCreditos() {
    if (this.navegacionBloqueada) return;
    this.navegacionBloqueada = true;
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => this.scene.start("CreditsScene"));
=======
    this.registry.set("mission", id);
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => this.scene.start('PreloadScene'));
  }

  continuarJuego() {
    const last = localStorage.getItem('last_mission') || 1;
    this.iniciarMision(parseInt(last));
  }

  irAjustes() {
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => this.scene.start('SettingsScene'));
  }

  irCreditos() {
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => this.scene.start('CreditsScene'));
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
  }

  salirJuego() {
    if (window.electronAPI) window.electronAPI.quit();
    else window.location.href = "about:blank";
  }
}
