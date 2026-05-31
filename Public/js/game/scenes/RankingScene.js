/**
 * ════════════════════════════════════════════════════════════════════════════════
 * ESCENA: RANKING
 * ════════════════════════════════════════════════════════════════════════════════
 */

class RankingScene extends Phaser.Scene {
  constructor() {
    super({ key: "RankingScene" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0f172a");

    // Fondo oscuro
    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.65)
      .setDepth(0);

    // Título
    this.add
      .text(width / 2, height * 0.08, "🏆 RANKING GLOBAL 🏆", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "48px",
        color: "#fbbf24",
        stroke: "#b45309",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Obtener ranking
    let ranking = [];
    try {
      const saved = localStorage.getItem("playerRanking");
      ranking = saved ? JSON.parse(saved) : [];
      console.log("[RankingScene] Ranking completo:", ranking);
    } catch (e) {
      console.error("Error reading ranking:", e);
    }

    // Separar completados e incompletos
    const completados = ranking.filter((e) => e.completed !== false);
    const incompletos = ranking.filter((e) => e.completed === false);

    console.log("[RankingScene] Completados:", completados);
    console.log("[RankingScene] Incompletos:", incompletos);

    // Ordenar por daño (menor es mejor)
    completados.sort((a, b) => a.damage - b.damage);
    incompletos.sort((a, b) => a.damage - b.damage);

    // Mostrar solo completados en la tabla principal
    const allRanking = completados;

    // Mostrar tabla de ranking
    const startY = height * 0.18;
    const rowHeight = 45;
    const maxRows = 10;

    // Encabezados
    const headerY = startY - 30;
    const columns = [
      { x: width * 0.15, label: "Posición", width: 80 },
      { x: width * 0.35, label: "Nombre", width: 200 },
      { x: width * 0.6, label: "Daño", width: 100 },
      { x: width * 0.8, label: "Personaje", width: 100 },
    ];

    // Fondo para encabezado
    this.add
      .rectangle(width / 2, headerY, width * 0.85, 40, 0x4a2a6f, 0.8)
      .setStrokeStyle(2, 0x7c3aed)
      .setDepth(9);

    columns.forEach((col) => {
      this.add
        .text(col.x, headerY, col.label, {
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          color: "#fbbf24",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(10);
    });

    // Mostrar filas de ranking
    allRanking.slice(0, maxRows).forEach((entry, i) => {
      const rowY = startY + i * rowHeight;
      const isEven = i % 2 === 0;

      // Fondo alternado
      this.add
        .rectangle(
          width / 2,
          rowY,
          width * 0.85,
          rowHeight - 2,
          isEven ? 0x1e293b : 0x0f172a,
          0.5,
        )
        .setDepth(8);

      // Posición (con medalla para top 3)
      let posText = `${i + 1}`;
      let posColor = "#e2e8f0";
      if (i === 0) {
        posText = "🥇";
        posColor = "#fbbf24";
      } else if (i === 1) {
        posText = "🥈";
        posColor = "#c0c0c0";
      } else if (i === 2) {
        posText = "🥉";
        posColor = "#cd7f32";
      }

      this.add
        .text(columns[0].x, rowY, posText, {
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
          color: posColor,
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0.5)
        .setDepth(10);

      // Nombre
      this.add
        .text(columns[1].x, rowY, entry.name.substring(0, 15), {
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          color: "#22c55e",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0.5)
        .setDepth(10);

      // Daño
      this.add
        .text(columns[2].x, rowY, String(entry.damage), {
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          color: "#ef4444",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0.5)
        .setDepth(10);

      // Personaje
      const charDisplay =
        entry.character === "hero"
          ? "DAN"
          : entry.character === "hero2"
            ? "MIKA"
            : "?";
      this.add
        .text(columns[3].x, rowY, charDisplay, {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#38bdf8",
        })
        .setOrigin(0.5, 0.5)
        .setDepth(10);
    });

    // Si no hay ranking completado
    if (completados.length === 0) {
      this.add
        .text(
          width / 2,
          height * 0.5,
          "Aún no hay jugadores que completen todas las misiones.\nCompleta todas las misiones para aparecer aquí.",
          {
            fontFamily: "Arial, sans-serif",
            fontSize: "18px",
            color: "#94a3b8",
            align: "center",
          },
        )
        .setOrigin(0.5)
        .setDepth(10);
    }

    // Sección de INTENTOS INCOMPLETOS
    if (incompletos.length > 0) {
      // Calcular dinámicamente dónde empiezan los intentos incompletos
      const rowsDisplayed = Math.min(allRanking.length, maxRows);
      const incompleteStartY = startY + rowsDisplayed * rowHeight + 20;

      // Título de intentos incompletos
      this.add
        .text(width / 2, incompleteStartY - 10, "⚔️ INTENTOS (Sin completar)", {
          fontFamily: "Arial, sans-serif",
          fontSize: "20px",
          color: "#ef4444",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(10);

      // Mostrar intentos incompletos (máximo 5)
      incompletos.slice(0, 5).forEach((entry, i) => {
        const rowY = incompleteStartY + 25 + i * rowHeight;
        const isEven = i % 2 === 0;

        // Fondo alternado
        this.add
          .rectangle(
            width / 2,
            rowY,
            width * 0.85,
            rowHeight - 2,
            isEven ? 0x1e293b : 0x0f172a,
            0.5,
          )
          .setDepth(8);

        // Número de intento (no medalla)
        this.add
          .text(columns[0].x, rowY, `${i + 1}`, {
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            color: "#94a3b8",
          })
          .setOrigin(0.5, 0.5)
          .setDepth(10);

        // Nombre
        this.add
          .text(columns[1].x, rowY, entry.name.substring(0, 15), {
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            color: "#f97316",
            fontStyle: "bold",
          })
          .setOrigin(0.5, 0.5)
          .setDepth(10);

        // Daño
        this.add
          .text(columns[2].x, rowY, String(entry.damage), {
            fontFamily: "Arial, sans-serif",
            fontSize: "16px",
            color: "#ef4444",
            fontStyle: "bold",
          })
          .setOrigin(0.5, 0.5)
          .setDepth(10);

        // Misión donde se detuvo
        this.add
          .text(columns[3].x, rowY, `Misión ${entry.mission}`, {
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            color: "#38bdf8",
          })
          .setOrigin(0.5, 0.5)
          .setDepth(10);
      });
    }

    // Información adicional
    this.add
      .text(
        width / 2,
        height * 0.85,
        `Completados: ${completados.length} | Intentos: ${incompletos.length}`,
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#64748b",
        },
      )
      .setOrigin(0.5)
      .setDepth(10);

    // Botones
    const btnMenu = this.add
      .rectangle(width / 2 - 150, height * 0.92, 250, 50, 0x38bdf8, 1)
      .setStrokeStyle(2, 0x0284c7)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2 - 150, height * 0.92, "[ M ] Menú Principal", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    btnMenu.on("pointerover", () => btnMenu.setFillStyle(0x7dd3fc));
    btnMenu.on("pointerout", () => btnMenu.setFillStyle(0x38bdf8));
    btnMenu.on("pointerdown", () => this.irAlMenu());

    const btnLimpiar = this.add
      .rectangle(width / 2 + 150, height * 0.92, 250, 50, 0xef4444, 1)
      .setStrokeStyle(2, 0xdc2626)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2 + 150, height * 0.92, "[ L ] Limpiar Ranking", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);

    btnLimpiar.on("pointerover", () => btnLimpiar.setFillStyle(0xf87171));
    btnLimpiar.on("pointerout", () => btnLimpiar.setFillStyle(0xef4444));
    btnLimpiar.on("pointerdown", () => this.limpiarRanking());

    // Teclas
    this.input.keyboard.on("keydown-M", () => this.irAlMenu());
    this.input.keyboard.on("keydown-L", () => this.limpiarRanking());
    this.input.keyboard.on("keydown-D", () => this.mostrarDebug());

    this.cameras.main.fadeIn(1000);
  }

  irAlMenu() {
    // Resetear variables
    this.registry.set("totalDamageInflicted", 0);
    this.registry.set("mission", 1);
    this.registry.set("attemptIncomplete", false);
    this.scene.start("MenuScene");
  }

  mostrarDebug() {
    console.clear();
    console.log(
      "╔════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║                    DEBUG - RANKING DATA                         ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════════╝",
    );

    try {
      const ranking = localStorage.getItem("playerRanking");
      if (ranking) {
        const data = JSON.parse(ranking);
        console.log(`\n✅ Total de entradas: ${data.length}\n`);

        data.forEach((entry, idx) => {
          const status = entry.completed ? "✓ COMPLETADO" : "✗ INCOMPLETO";
          console.log(
            `${idx + 1}. ${entry.name} (${entry.character === "hero" ? "DAN" : "MIKA"})`,
          );
          console.log(
            `   Daño: ${entry.damage} | Misión: ${entry.mission} | ${status}`,
          );
          console.log(`   Fecha: ${entry.date}`);
          console.log("");
        });
      } else {
        console.log("❌ No hay ranking guardado");
      }
    } catch (e) {
      console.error("❌ Error al leer ranking:", e);
    }

    console.log("\n(Presiona [D] para cerrar este debug)");
  }

  limpiarRanking() {
    const { width, height } = this.scale;

    // Mostrar confirmación
    const confirmBox = this.add
      .rectangle(width / 2, height / 2, 500, 250, 0x000000, 0.95)
      .setStrokeStyle(3, 0xef4444)
      .setDepth(100);

    const confirmText = this.add
      .text(width / 2, height / 2 - 60, "¿Eliminar todo el ranking?", {
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        color: "#ef4444",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(101);

    const confirmSubtext = this.add
      .text(width / 2, height / 2 - 10, "Esta acción no se puede deshacer", {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#94a3b8",
      })
      .setOrigin(0.5)
      .setDepth(101);

    const btnYes = this.add
      .rectangle(width / 2 - 110, height / 2 + 80, 180, 50, 0xef4444, 1)
      .setStrokeStyle(2, 0xdc2626)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2 - 110, height / 2 + 80, "SÍ, Eliminar", {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(101);

    const btnNo = this.add
      .rectangle(width / 2 + 110, height / 2 + 80, 180, 50, 0x38bdf8, 1)
      .setStrokeStyle(2, 0x0284c7)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2 + 110, height / 2 + 80, "Cancelar", {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(101);

    btnYes.on("pointerover", () => btnYes.setFillStyle(0xf87171));
    btnYes.on("pointerout", () => btnYes.setFillStyle(0xef4444));
    btnYes.on("pointerdown", () => {
      try {
        localStorage.removeItem("playerRanking");
        confirmBox.destroy();
        confirmText.destroy();
        confirmSubtext.destroy();
        btnYes.destroy();
        btnNo.destroy();
        this.scene.restart();
      } catch (e) {
        console.error("Error clearing ranking:", e);
      }
    });

    btnNo.on("pointerover", () => btnNo.setFillStyle(0x7dd3fc));
    btnNo.on("pointerout", () => btnNo.setFillStyle(0x38bdf8));
    btnNo.on("pointerdown", () => {
      confirmBox.destroy();
      confirmText.destroy();
      confirmSubtext.destroy();
      btnYes.destroy();
      btnNo.destroy();
    });
  }

  shutdown() {
    this.input.keyboard.removeAllListeners();
  }
}
