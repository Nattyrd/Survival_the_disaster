/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: CRÉDITOS
 * ════════════════════════════════════════════════════════════════════════════════
 */

class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: "CreditsScene" });
  }

  create() {
    console.log('[CreditsScene] → Iniciando create()');
    this.cameras.main.setBackgroundColor('#0a0a1a');

    const creditos = [
      { titulo: 'CRÉDITOS', tamaño: '48px', color: '#ffffff' },
      { titulo: 'Dirección de Desarrollo', tamaño: '28px', color: '#9366ff' },
      { titulo: 'Tu Nombre / Tu Equipo', tamaño: '20px', color: '#ffffff' },
      { titulo: 'Programación', tamaño: '28px', color: '#9366ff' },
      { titulo: 'Desarrolladores del Proyecto', tamaño: '20px', color: '#ffffff' },
      { titulo: 'Arte & Diseño', tamaño: '28px', color: '#9366ff' },
      { titulo: 'Equipo Artístico', tamaño: '20px', color: '#ffffff' },
      { titulo: 'Audio & Música', tamaño: '28px', color: '#9366ff' },
      { titulo: 'Compositores y Diseñadores de Sonido', tamaño: '20px', color: '#ffffff' },
      { titulo: 'Tecnología', tamaño: '28px', color: '#9366ff' },
      { titulo: 'Phaser 3.60 - Game Framework', tamaño: '16px', color: '#aaaaaa' },
      { titulo: 'Express - Web framework', tamaño: '16px', color: '#aaaaaa' },
      { titulo: 'Electron - Desktop application', tamaño: '16px', color: '#aaaaaa' },
      { titulo: 'Gracias por jugar', tamaño: '32px', color: '#9366ff' }
    ];

    let yPos = 80;
    creditos.forEach((credito) => {
      const texto = this.add.text(GAME_WIDTH / 2, yPos, credito.titulo, {
        fontSize: credito.tamaño,
        fontFamily: 'Arial',
        color: credito.color,
        align: 'center'
      }).setOrigin(0.5);
      yPos += 50;
    });

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 80, {
      text: 'Volver al Menú', width: 300, height: 60, callback: () => this.volverAlMenu()
    });

    this.input.keyboard.on('keydown-ESC', () => this.volverAlMenu());
    this.cameras.main.fadeIn(1000);
  }

  volverAlMenu() {
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
