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

    // ► Crear Animación de Selección (si no existe)
    if (!this.anims.exists('selectPlayerAnim')) {
      this.anims.create({
        key: 'selectPlayerAnim',
        frames: this.anims.generateFrameNames('selectPlayerBG', {
          start: 1, end: 125, zeroPad: 3,
          prefix: 'ezgif-frame-', suffix: '.jpg'
        }),
        frameRate: 24,
        repeat: -1
      });
    }

    // ► Música de Fondo
    if (!this.sound.get('bgMusic')) {
      this.bgMusic = this.sound.add('introMusic', { loop: true, volume: 0.5 });
      this.selectMusic = this.sound.add('selectMusic', { loop: true, volume: 0.5 });
      this.bgMusic.play();
    } else {
      this.bgMusic = this.sound.get('introMusic');
      this.selectMusic = this.sound.get('selectMusic');
    }

    // Fondo Normal
    try {
      if (this.textures.exists('menuBg')) {
        this.menuBg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'menuBg').setDepth(-100);
      }
    } catch (e) {}

    // Fondo Animado Selección (oculto por defecto)
    this.selectBg = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'selectPlayerBG')
      .setDepth(-90)
      .setVisible(false)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

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
    const posY = [320, 385, 450, 515, 580, 645];
    const textos = ['Empezar Aventura', 'Seleccionar Misión', 'Continuar', 'Ajustes', 'Créditos', 'Salir'];
    const callbacks = [
        () => this.cambiarEstado("PERSONAJE"),
        () => this.cambiarEstado("MISIONES"),
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

    // ► Configuración de Layout: Aquí puedes mover todo libremente
    const layout = {
      titulo: { x: GAME_WIDTH / 2, y: 40 },
      personajes: [
        { id: 'hero',   nombre: 'DAN',    x: 425, y: 690 },
        { id: 'hero2',  nombre: 'MIKA',   x: 850, y: 690 },
        { id: 'volver', nombre: 'VOLVER', x: 1100, y: 50 }
      ]
    };

    // Crear Título
    const titulo = this.add.text(layout.titulo.x, layout.titulo.y, 'SELECCIONA TU HÉROE', { 
        fontSize: '42px',
        backgroundColor: '#4a2a6f', 
        color: '#ffffff', 
        fontStyle: 'bold',
        stroke: '#38bdf8',
        strokeThickness: 6,
        shadow: { blur: 10, color: '#000', fill: true }
    }).setOrigin(0.5);
    this.contenedorPersonajes.add(titulo);

    // Crear Botones desde el layout
    layout.personajes.forEach((p) => {
        const btn = new Button(this, p.x, p.y, {
            text: p.nombre, 
            width: (p.id === 'volver') ? 100 : 250, 
            height: 40,
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
    this.registry.set("mission", 1); // <--- IMPORTANTE: Iniciar en Misión 1
    
    // ► Transición a Novela Visual (Proyecto Aetherion)
    this.cameras.main.fadeOut(1000);
    this.time.delayedCall(1000, () => {
        this.scene.start('AetherionCinema');
    });
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
        { id: 2, nombre: 'Misión 2: Titán MK-3' },
        { id: 3, nombre: 'Misión 3: Andronimus' },
        { id: 'volver', nombre: 'Volver al Menú' }
    ];

    misiones.forEach((m, i) => {
        const btn = new Button(this, GAME_WIDTH / 2, 280 + (i * 70), {
            text: m.nombre, width: 380, height: 55,
            callback: () => {
                if (m.id === 'volver') this.cambiarEstado("PRINCIPAL");
                else this.iniciarMision(m.id);
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
    
    // ► Gestión de Fondos y Música
    if (nuevoEstado === "PERSONAJE") {
      if (this.menuBg) this.menuBg.setVisible(false);
      this.selectBg.setVisible(true).play('selectPlayerAnim');
      
      // Transición de música
      if (this.bgMusic.isPlaying) this.bgMusic.stop();
      if (!this.selectMusic.isPlaying) this.selectMusic.play();
    } else {
      if (this.menuBg) this.menuBg.setVisible(true);
      this.selectBg.setVisible(false).stop();
      
      // Volver a música principal si venimos de personaje
      if (this.estado === "PERSONAJE") {
        if (this.selectMusic.isPlaying) this.selectMusic.stop();
        if (!this.bgMusic.isPlaying) this.bgMusic.play();
      }
    }

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
