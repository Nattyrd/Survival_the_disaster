/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: MENÚ PRINCIPAL
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * Estados internos (this.estado):
 *   PRINCIPAL  → botones del menú (Empezar, Misiones, Ajustes…)
 *   PERSONAJE  → selección Dan/Mika → AetherionCinema → PreloadScene
 *   MISIONES   → elegir misión 1-3 o Modo Oleada → PreloadScene → GameScene
 *
 * Registry que escribe: selectedCharacter, mission, totalDamageInflicted
 * ════════════════════════════════════════════════════════════════════════════════
 */

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
    this.botones = [];
    this.botonesIndice = 0;
    this.estado = "PRINCIPAL"; 
    
    this.botonesPrincipales = [];
    this.botonesPersonajes = [];
    this.botonesMisiones = [];
  }

  create() {
    console.log('[MenuScene] → Iniciando MenuScene');
    this.cameras.main.setBackgroundColor("#000000");

    // 1. Animaciones
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

    // 2. Audio
    this.game.musicManager.stopAll();
    this.game.musicManager.stopCharacterSelectVoices();
    this.game.musicManager.play("menuMusic", { volumeScale: 0.5 });

    // 3. Fondo
    if (this.textures.exists('menuBg')) {
      this.menuBg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'menuBg').setDepth(-100);
    }

    this.selectBg = this.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'selectPlayerBG')
      .setDepth(-90).setVisible(false).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // 4. Crear UI
    this.crearMenuPrincipal();
    this.crearSubMenuPersonajes();
    this.crearSubMenuMisiones();

    // 5. Entrada Teclado
    this.input.keyboard.on('keydown-UP', () => this.cambiarSeleccion(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.cambiarSeleccion(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirmarSeleccion());
    this.input.keyboard.on('keydown-ESC', () => this.manejarEsc());

    // 6. Iniciar Estado
    this.cambiarEstado("PRINCIPAL");

    this.cameras.main.fadeIn(1000);
  }

  crearMenuPrincipal() {
    this.botonesPrincipales = [];
    
    // Configuración de dos columnas (4 por columna)
    const col1X = GAME_WIDTH * 0.35;
    const col2X = GAME_WIDTH * 0.65;
    const startY = 380;
    const spacingY = 75;

    const botonesInfo = [
        { texto: 'Empezar Aventura',  x: col1X, y: startY,           cb: () => this.cambiarEstado("PERSONAJE") },
        { texto: 'Cargar Partida',    x: col2X, y: startY,           cb: () => this.irCargarPartida() },
        
        { texto: 'Continuar Partida', x: col1X, y: startY + spacingY, cb: () => this.continuarJuego() },
        { texto: 'Seleccionar Misión', x: col2X, y: startY + spacingY, cb: () => this.cambiarEstado("MISIONES") },
        
        { texto: 'Ajustes',           x: col1X, y: startY + spacingY * 2, cb: () => this.irAjustes() },
        { texto: 'Ranking',           x: col2X, y: startY + spacingY * 2, cb: () => this.irRanking() },
        
        { texto: 'Créditos',          x: col1X, y: startY + spacingY * 3, cb: () => this.irCreditos() },
        { texto: 'Salir',             x: col2X, y: startY + spacingY * 3, cb: () => this.salirJuego() }
    ];

    botonesInfo.forEach((info) => {
        const btn = new Button(this, info.x, info.y, {
            text: info.texto, width: 320, height: 55, callback: info.cb
        });
        btn.setVisible(false);
        this.botonesPrincipales.push(btn);
    });
  }

  irRanking() {
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => this.scene.start('RankingScene'));
  }

  irCargarPartida() {
    this.scene.launch("PauseScene", { parentScene: "MenuScene", fromMenu: true });
  }

  crearSubMenuPersonajes() {
    this.contenedorPersonajes = this.add.container(0, 0).setVisible(false);
    this.botonesPersonajes = [];
    
    const layout = {
      titulo: { x: GAME_WIDTH / 2, y: 40 },
      personajes: [
        { id: 'hero',   nombre: 'DAN',    x: 425, y: 690 },
        { id: 'hero2',  nombre: 'MIKA',   x: 850, y: 690 },
        { id: 'volver', nombre: 'VOLVER', x: 1100, y: 50 }
      ]
    };

    const titulo = this.add.text(layout.titulo.x, layout.titulo.y, 'SELECCIONA TU HÉROE', { 
        fontSize: '42px', backgroundColor: '#4a2a6f', color: '#ffffff', fontStyle: 'bold',
        stroke: '#38bdf8', strokeThickness: 6
    }).setOrigin(0.5);
    this.contenedorPersonajes.add(titulo);

    layout.personajes.forEach((p) => {
        const btn = new Button(this, p.x, p.y, {
            text: p.nombre, width: (p.id === 'volver') ? 100 : 250, height: 40,
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
    this.registry.set("selectedCharacter", id);
    this.registry.set("mission", 1);
    this.registry.set("totalDamageInflicted", 0);

    if (this.timerSfxPersonaje) this.timerSfxPersonaje.remove();

    const irACinematica = () => {
      this.game.musicManager.stopAll();
      this.cameras.main.fadeOut(1000);
      this.time.delayedCall(1000, () => {
        this.game.musicManager.stopAll();
        this.scene.start("AetherionCinema");
      });
    };

    this.cleanupSelectAudio({ restoreMenuMusic: false });

    if (id === "hero") {
      this.game.musicManager.stopAll();

      const sfx = this.sound.add("selectDan");
      sfx.play();

      sfx.on("complete", () => irACinematica());
    } else {
      irACinematica();
    }
  }

  cleanupSelectAudio(options = { restoreMenuMusic: true }) {
    if (this.timerSfxPersonaje) {
      this.timerSfxPersonaje.remove();
      this.timerSfxPersonaje = null;
    }
    this.game.musicManager.stopCharacterSelectVoices();

    if (this.selectMusicPlaying) {
      this.selectMusicPlaying = false;
      this.game.musicManager.stopAll();
      if (options.restoreMenuMusic) {
        this.game.musicManager.play("menuMusic", { volumeScale: 0.5 });
      }
    }
  }

  crearSubMenuMisiones() {
    this.contenedorMisiones = this.add.container(0, 0).setVisible(false);
    this.botonesMisiones = [];

    const panelW = 520;
    const panelH = 520;
    this.contenedorMisiones.add(
      this.add
        .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, panelW, panelH, 0x000000, 0.9)
        .setStrokeStyle(2, 0x4a2a6f),
    );
    this.contenedorMisiones.add(
      this.add
        .text(GAME_WIDTH / 2, 175, "OBJETIVOS DISPONIBLES", {
          fontSize: "28px",
          color: "#a855f7",
          fontStyle: "bold",
        })
        .setOrigin(0.5),
    );

    const misiones = [
      { id: 1, nombre: "Misión 1: El Robot Jefe" },
      { id: 2, nombre: "Misión 2: Titán MK-3" },
      { id: 3, nombre: "Misión 3: Andronimus" },
      { id: MISSION_WAVE, nombre: "Modo Oleada" },
      { id: "volver", nombre: "Volver al Menú" },
    ];

    const startY = 235;
    const spacing = 58;

    misiones.forEach((m, i) => {
      const btn = new Button(this, GAME_WIDTH / 2, startY + i * spacing, {
        text: m.nombre,
        width: 400,
        height: 52,
        fontSize: "18px",
        callback: () => {
          if (m.id === "volver") this.cambiarEstado("PRINCIPAL");
          else {
            this.registry.set("totalDamageInflicted", 0);
            if (!this.registry.get("selectedCharacter")) {
              this.registry.set("selectedCharacter", "hero");
            }
            this.iniciarMision(m.id);
          }
        },
      });
      this.botonesMisiones.push(btn);
      this.contenedorMisiones.add(btn);
    });
  }

  cambiarEstado(nuevoEstado) {
    console.log(`[MenuScene] Cambio de estado: ${nuevoEstado}`);
    
    // Gestión de Fondos y Música
    if (nuevoEstado === "PERSONAJE") {
      if (this.menuBg) this.menuBg.setVisible(false);
      this.selectBg.setVisible(true).play('selectPlayerAnim');
      this.game.musicManager.play("selectMusic", { volumeScale: 0.5 });
      this.selectMusicPlaying = true;

      this.sound.play('selectSfx', { volume: 0.6 });
      this.timerSfxPersonaje = this.time.addEvent({
        delay: 5000,
        callback: () => {
          if (this.estado === "PERSONAJE") {
            this.sound.play('selectSfx', { volume: 0.6 });
          }
        },
        loop: true
      });
    } else {
      if (this.menuBg) this.menuBg.setVisible(true);
      this.selectBg.setVisible(false).stop();

      if (this.estado === "PERSONAJE") {
        this.cleanupSelectAudio();
      }
    }

    // Limpiar visibilidad
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
        case "MISIONES":
            this.contenedorMisiones.setVisible(true);
            this.botones = this.botonesMisiones;
            break;
    }
    this.seleccionarBoton(0);
  }

  cambiarSeleccion(dir) {
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
    if (this.botones[this.botonesIndice]) this.botones[this.botonesIndice].simulateClick();
  }

  manejarEsc() {
    if (this.estado !== "PRINCIPAL") this.cambiarEstado("PRINCIPAL");
  }

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
    this.cleanupSelectAudio();
    this.game.musicManager.stopAll();
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

  shutdown() {
    this.cleanupSelectAudio();
  }
}
