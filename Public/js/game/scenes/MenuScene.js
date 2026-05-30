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
    
    // Estados del menú
    this.estado = "PRINCIPAL"; // PRINCIPAL, PERSONAJE, CINEMATICA, MISIONES
    
    this.botonesPrincipales = [];
    this.botonesPersonajes = [];
    this.botonesMisiones = [];
  }

  create() {
    console.log('[MenuScene] → Iniciando MenuScene v2');
    this.cameras.main.setBackgroundColor("#000000");

    // Fondo
    try {
      if (this.textures.exists('menuBg')) {
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'menuBg').setDepth(-100);
      }
    } catch (e) {}

    // Inicializar Contenedores de Submenús
    this.crearMenuPrincipal();
    this.crearSubMenuPersonajes();
    this.crearSubMenuMisiones();

    // Entrada Teclado
    this.input.keyboard.on('keydown-UP', () => this.cambiarSeleccion(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.cambiarSeleccion(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirmarSeleccion());
    this.input.keyboard.on('keydown-ESC', () => this.manejarEsc());

    this.cameras.main.fadeIn(1000);
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ MENÚ PRINCIPAL
  // ╚════════════════════════════════════════════════════════════════╝

  crearMenuPrincipal() {
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
    });
    this.botones = this.botonesPrincipales;
    this.seleccionarBoton(0);
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ SELECCIÓN DE PERSONAJE
  // ╚════════════════════════════════════════════════════════════════╝

  crearSubMenuPersonajes() {
    this.contenedorPersonajes = this.add.container(0, 0).setVisible(false);
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
    });
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ SELECCIÓN DE MISIONES
  // ╚════════════════════════════════════════════════════════════════╝

  crearSubMenuMisiones() {
    this.contenedorMisiones = this.add.container(0, 0).setVisible(false);
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

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ CONTROL DE ESTADOS Y NAVEGACIÓN
  // ╚════════════════════════════════════════════════════════════════╝

  cambiarEstado(nuevoEstado) {
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
    }

    this.seleccionarBoton(0);
  }

  cambiarSeleccion(dir) {
    if (this.estado === "CINEMATICA") return;
    let nuevo = this.botonesIndice + dir;
    if (nuevo < 0) nuevo = this.botones.length - 1;
    if (nuevo >= this.botones.length) nuevo = 0;
    this.seleccionarBoton(nuevo);
  }

  seleccionarBoton(indice) {
    if (this.botones[this.botonesIndice]) this.botones[this.botonesIndice].onHoverOut();
    this.botonesIndice = indice;
    if (this.botones[this.botonesIndice]) this.botones[this.botonesIndice].onHover();
  }

  confirmarSeleccion() {
    if (this.estado === "CINEMATICA") return;
    if (this.botones[this.botonesIndice]) {
        this.botones[this.botonesIndice].simulateClick();
    }
  }

  manejarEsc() {
    if (this.estado === "PERSONAJE" || this.estado === "MISIONES") {
        this.cambiarEstado("PRINCIPAL");
    }
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║ FUNCIONES DE ACCIÓN
  // ╚════════════════════════════════════════════════════════════════╝

  iniciarMision(id) {
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
  }

  salirJuego() {
    if (window.electronAPI) window.electronAPI.quit();
    else window.location.href = "about:blank";
  }
}
