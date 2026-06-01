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
    this.cameras.main.setBackgroundColor('#000000');

    // Música
    if (this.game.musicManager) {
        this.game.musicManager.play("menuMusic", { volumeScale: 0.5 });
    }

    // Fondo (opcional: usar el mismo que el menú si existe)
    if (this.textures.exists('menuBg')) {
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'menuBg').setAlpha(0.3);
    }

    const titleStyle = { fontSize: '42px', color: '#9366ff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 };
    const sectionStyle = { fontSize: '32px', color: '#38bdf8', fontStyle: 'bold' };
    const nameStyle = { fontSize: '26px', color: '#ffffff', fontStyle: 'bold' };
    const roleStyle = { fontSize: '22px', color: '#a855f7', fontStyle: 'italic' };
    const itemStyle = { fontSize: '18px', color: '#cccccc', wordWrap: { width: 800 } };
    const finalStyle = { fontSize: '24px', color: '#ffffff', fontStyle: 'italic', align: 'center', wordWrap: { width: 900 } };
    const quoteStyle = { fontSize: '28px', color: '#9366ff', fontStyle: 'bold italic', align: 'center', wordWrap: { width: 900 } };

    this.creditsContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT);

    let y = 0;

    // Título Principal
    this.addText('EQUIPO DE DESARROLLO', titleStyle, y);
    y += 100;

    // Dany Molina
    this.addText('Dany Molina', nameStyle, y);
    y += 35;
    this.addText('Desarrollador', roleStyle, y);
    y += 30;
    this.addText('• Desarrollo general del videojuego.\n• Creación de la historia principal.\n• Diseño y desarrollo de personajes.\n• Construcción narrativa del universo del juego.', itemStyle, y);
    y += 140;

    // Kevin García
    this.addText('Kevin García', nameStyle, y);
    y += 35;
    this.addText('Desarrollador', roleStyle, y);
    y += 30;
    this.addText('• Desarrollo del videojuego.\n• Creación y adaptación de sprites y assets gráficos utilizando LibreSprite.\n• Apoyo en la implementación y optimización de recursos visuales.', itemStyle, y);
    y += 120;

    // Kevin Gómez
    this.addText('Kevin Gómez', nameStyle, y);
    y += 35;
    this.addText('Desarrollador', roleStyle, y);
    y += 30;
    this.addText('• Desarrollo del videojuego.\n• Creación y adaptación de sprites y assets gráficos utilizando LibreSprite.\n• Apoyo en la implementación y optimización de recursos visuales.', itemStyle, y);
    y += 180;

    // Créditos Generales
    this.addText('CRÉDITOS GENERALES', sectionStyle, y);
    y += 60;
    this.addText('Equipo de Desarrollo', nameStyle, y);
    y += 40;
    this.addText('Dany Molina\nKevin García\nKevin Gómez', itemStyle, y);
    y += 140;

    // Herramientas
    this.addText('HERRAMIENTAS UTILIZADAS', sectionStyle, y);
    y += 60;
    this.addText('• LibreSprite para la creación de sprites y recursos gráficos.\n• IntelliJ IDEA para el desarrollo y programación.\n• Git y GitHub para el control de versiones.\n• Meta AI para la generación de recursos audiovisuales.\n• Herramientas de Inteligencia Artificial Generativa para apoyo creativo y producción multimedia.', itemStyle, y);
    y += 200;

    // Mensaje Final
    this.addText('MENSAJE FINAL', sectionStyle, y);
    y += 60;
    this.addText('"Este proyecto es el resultado del esfuerzo, la dedicación y el trabajo en equipo. Cada línea de código, cada diseño y cada idea aportó a la construcción de esta experiencia. Gracias por acompañarnos en esta aventura."', finalStyle, y);
    y += 200;

    // Frase Inspiradora
    this.addText('"Los límites de un videojuego no los define la tecnología, sino la imaginación de quienes lo crean. Continúen aprendiendo, creando y construyendo los mundos que algún día inspirarán a otros."', quoteStyle, y);
    y += 300;

    // Fin de los créditos
    this.addText('GRACIAS POR JUGAR', titleStyle, y);
    y += 100;

    // Altura total de los créditos
    const totalHeight = y + GAME_HEIGHT;

    // Animación de scroll
    this.tweens.add({
      targets: this.creditsContainer,
      y: -y,
      duration: y * 40, // Velocidad ajustable
      ease: 'Linear',
      onComplete: () => {
        this.time.delayedCall(2000, () => this.volverAlMenu());
      }
    });

    // Botón para volver (siempre visible o al final?)
    // Lo pondremos fijo en una esquina o que aparezca al hacer click
    this.input.on('pointerdown', () => this.volverAlMenu());
    this.input.keyboard.on('keydown-ESC', () => this.volverAlMenu());
    this.input.keyboard.on('keydown-SPACE', () => this.volverAlMenu());

    const skipText = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 20, 'Clic o ESC para saltar', {
        fontSize: '16px', color: '#aaaaaa'
    }).setOrigin(1, 1);

    this.cameras.main.fadeIn(1000);
  }

  addText(content, style, y) {
    const txt = this.add.text(0, y, content, style).setOrigin(0.5, 0);
    this.creditsContainer.add(txt);
    return txt;
  }

  volverAlMenu() {
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
