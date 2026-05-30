/**
 * ════════════════════════════════════════════════════════════════════════════════
 * COMPONENTE: CAJA DE DIÁLOGO (VISUAL NOVEL STYLE)
 * ════════════════════════════════════════════════════════════════════════════════
 */

class DialogueBox extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    // ► Configuración Visual
    const width = 1100;
    const height = 180;
    
    // 1. Fondo de la caja (Estilo Glassmorphism / Moderno)
    this.bg = scene.add.rectangle(0, 0, width, height, 0x000000, 0.85)
      .setStrokeStyle(3, 0x38bdf8);
    
    // 2. Fondo del Nombre (Name Tag)
    this.nameBg = scene.add.rectangle(-(width/2 - 120), -(height/2 + 25), 240, 45, 0x38bdf8);
    this.nameText = scene.add.text(-(width/2 - 120), -(height/2 + 25), '', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 3. Texto del Diálogo (Typewriter)
    this.dialogueText = scene.add.text(-(width/2 - 40), -(height/2 - 40), '', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      lineSpacing: 10,
      wordWrap: { width: width - 80 }
    });

    // 4. Indicador de "Click para Continuar"
    this.nextIndicator = scene.add.text(width/2 - 40, height/2 - 30, '▼', {
      fontSize: '20px',
      color: '#38bdf8'
    }).setOrigin(0.5).setVisible(false);
    
    // Animación del indicador
    scene.tweens.add({
      targets: this.nextIndicator,
      y: '+=10',
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Agregar todo al contenedor
    this.add([this.bg, this.nameBg, this.nameText, this.dialogueText, this.nextIndicator]);
    
    scene.add.existing(this);
    this.setDepth(2000); // Siempre encima de los personajes
    this.setVisible(false);

    // Sonido de tipeo (opcional)
    this.typeSound = null;
    if (scene.cache.audio.exists('text_type')) {
        this.typeSound = scene.sound.add('text_type', { volume: 0.2 });
    }
  }

  /**
   * Muestra un nuevo diálogo con efecto de máquina de escribir
   */
  displayDialogue(name, text, callback) {
    if (typeof text !== 'string') {
      console.warn("[DialogueBox] Intento de mostrar diálogo sin texto válido:", text);
      if (callback) callback();
      return;
    }

    this.setVisible(true);
    this.nextIndicator.setVisible(false);
    
    // Configurar nombre
    if (!name || name === "Narrador") {
      this.nameBg.setVisible(false);
      this.nameText.setText('');
    } else {
      this.nameBg.setVisible(true);
      this.nameText.setText(name.toUpperCase());
    }

    // Efecto Typewriter
    let i = 0;
    this.dialogueText.setText('');
    
    if (this.typingTimer) this.typingTimer.remove();

    this.typingTimer = this.scene.time.addEvent({
      delay: 30, // Velocidad de escritura
      callback: () => {
        if (!this.dialogueText) return; // Seguridad si se destruye la escena
        
        this.dialogueText.text += text[i];
        
        // Sonido ocasional para no saturar
        if (i % 2 === 0 && this.typeSound) this.typeSound.play();
        
        i++;
        if (i === text.length) {
          this.onTextComplete(callback);
        }
      },
      repeat: text.length - 1
    });
  }

  onTextComplete(callback) {
    this.nextIndicator.setVisible(true);
    if (callback) callback();
  }

  /**
   * Fuerza la aparición del texto completo (Skip typewriter)
   */
  skipTyping(fullText) {
    if (this.typingTimer) this.typingTimer.remove();
    this.dialogueText.setText(fullText);
    this.onTextComplete();
  }
}

// Globalizar
window.DialogueBox = DialogueBox;
