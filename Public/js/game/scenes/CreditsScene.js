/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: CRÉDITOS
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Pantalla de créditos con:
 * - Scroll automático o manual
 * - Información de desarrolladores
 * - Botón para volver al menú
 */

class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: "CreditsScene" });
  }

  create() {
    console.log('[CreditsScene] → Iniciando create()');

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ CONFIGURACIÓN INICIAL
    // ╚════════════════════════════════════════════════════════════════╝

    this.cameras.main.setBackgroundColor('#0a0a1a');

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ CONTENEDOR DE CRÉDITOS (SCROLLABLE)
    // ╚════════════════════════════════════════════════════════════════╝

    const creditos = [
      { titulo: 'CRÉDITOS', subtitulo: '', tamaño: '48px', color: '#ffffff' },
      { titulo: '', subtitulo: '', tamaño: '16px', color: '#ffffff' },
      { titulo: 'Dirección de Desarrollo', subtitulo: '', tamaño: '28px', color: '#9366ff' },
      { titulo: 'Tu Nombre / Tu Equipo', subtitulo: '', tamaño: '20px', color: '#ffffff' },
      { titulo: '', subtitulo: '', tamaño: '16px', color: '#ffffff' },
      { titulo: 'Programación', subtitulo: '', tamaño: '28px', color: '#9366ff' },
      { titulo: 'Desarrolladores del Proyecto', subtitulo: '', tamaño: '20px', color: '#ffffff' },
      { titulo: '', subtitulo: '', tamaño: '16px', color: '#ffffff' },
      { titulo: 'Arte & Diseño', subtitulo: '', tamaño: '28px', color: '#9366ff' },
      { titulo: 'Equipo Artístico', subtitulo: '', tamaño: '20px', color: '#ffffff' },
      { titulo: '', subtitulo: '', tamaño: '16px', color: '#ffffff' },
      { titulo: 'Audio & Música', subtitulo: '', tamaño: '28px', color: '#9366ff' },
      { titulo: 'Compositores y Diseñadores de Sonido', subtitulo: '', tamaño: '20px', color: '#ffffff' },
      { titulo: '', subtitulo: '', tamaño: '16px', color: '#ffffff' },
      { titulo: 'Tecnología', subtitulo: '', tamaño: '28px', color: '#9366ff' },
      { titulo: 'Phaser 4 - Framework de juegos', subtitulo: '', tamaño: '16px', color: '#aaaaaa' },
      { titulo: 'Express - Web framework', subtitulo: '', tamaño: '16px', color: '#aaaaaa' },
      { titulo: 'Electron - Desktop application', subtitulo: '', tamaño: '16px', color: '#aaaaaa' },
      { titulo: '', subtitulo: '', tamaño: '16px', color: '#ffffff' },
      { titulo: 'Gracias por jugar', subtitulo: '', tamaño: '32px', color: '#9366ff' },
      { titulo: '', subtitulo: '', tamaño: '32px', color: '#ffffff' }
    ];

    // ► Crear textos de créditos
    let yPos = 120;
    creditos.forEach((credito) => {
      if (credito.titulo) {
        const texto = this.add.text(GAME_WIDTH / 2, yPos, credito.titulo, {
          fontSize: credito.tamaño,
          fontFamily: 'Arial',
          color: credito.color,
          align: 'center'
        });
        texto.setOrigin(0.5);
        yPos += 50;
      }
    });

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ BOTÓN VOLVER
    // ╚════════════════════════════════════════════════════════════════╝

    const botonVolver = new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 80, {
      text: 'Volver al Menú (ESC)',
      width: 300,
      height: 60,
      fontSize: '20px',
      callback: () => this.volverAlMenu()
    });

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ ENTRADA DE USUARIO - TECLADO
    // ╚════════════════════════════════════════════════════════════════╝

    this.input.keyboard.on('keydown-ENTER', () => {
      this.volverAlMenu();
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.volverAlMenu();
    });

    // ╔════════════════════════════════════════════════════════════════╗
    // ║ FADE IN
    // ╚════════════════════════════════════════════════════════════════╝

    this.cameras.main.fadeIn(1000);

    console.log('[CreditsScene] ✓ Créditos inicializados');
  }

  /**
   * Volver al menú
   */
  volverAlMenu() {
    console.log('[CreditsScene] ⏪ Volviendo al menú...');

    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
<<<<<<< HEAD
      irAlMenuPrincipal(this);
=======
      this.scene.start('MenuScene');
>>>>>>> f56e963dc720d817425a19093f927a1d375d11b0
    });
  }

  /**
   * Limpiar al salir
   */
  shutdown() {
    console.log('[CreditsScene] ⏹ Limpiando CreditsScene');
  }
}
