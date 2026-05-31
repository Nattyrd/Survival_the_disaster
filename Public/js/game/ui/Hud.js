class Hud {
    constructor(scene) {
        this.scene = scene;
        const { width, height } = scene.scale;

        // ► PANEL IZQUIERDO (STATS)
        this.statsContainer = scene.add.container(20, 20).setScrollFactor(0).setDepth(5000);

        this.playerHpText = scene.add.text(0, 0, "", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "20px",
            color: "#4ade80",
            stroke: "#064e3b",
            strokeThickness: 4
        });
        this.playerHpText.setShadow(2, 2, "#000000", 2, true, true);

        this.scoreText = scene.add.text(0, 32, "SCORE: 0", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "18px",
            color: "#fbbf24",
            stroke: "#78350f",
            strokeThickness: 4
        });
        this.scoreText.setShadow(2, 2, "#000000", 2, true, true);

        this.statsContainer.add([this.playerHpText, this.scoreText]);

        // ► PANEL DERECHO (TIMER)
        this.timerText = scene.add.text(width - 20, 20, "00:00", {
            fontFamily: "Courier New, monospace",
            fontSize: "28px",
            fontStyle: "bold",
            color: "#ffffff",
            stroke: "#1e293b",
            strokeThickness: 6
        })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(5000);
        this.timerText.setShadow(0, 0, "#38bdf8", 10, true, true);

        // ► BOTÓN DE PAUSA (Superior Derecha)
        this.pauseBtn = new Button(scene, width - 60, height - 60, {
            text: "⏸", width: 50, height: 50, callback: () => this.scene.onPauseRequested()
        });
        this.pauseBtn.setScrollFactor(0).setDepth(5001);

        // ► PANEL SUPERIOR CENTRADO (BOSS)
        this.bossHpText = scene.add.text(width / 2, 42, "", {
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: "14px",
            color: "#fca5a5",
            stroke: "#450a0a",
            strokeThickness: 3
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(5000);

        const barWidth = Math.min(480, width * 0.5);
        const barX = width / 2 - barWidth / 2;
        const barY = 64;

        this.bossBarBg = scene.add.rectangle(barX, barY, barWidth, 18, 0x000000, 0.8)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0x4a2a6f)
            .setScrollFactor(0)
            .setDepth(4999);

        this.bossBarFill = scene.add.rectangle(barX + 2, barY + 2, barWidth - 4, 14, 0xef4444)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(5000);

        this.bossBarWidth = barWidth - 4;
        this.bossBarX = barX + 2;
        this.bossBarY = barY + 2;
    }

    update(player, boss, timeElapsed = 0, waveInfo = null) {
        if (player) {
            const charName = player.id === "hero" ? "DAN" : "MIKA";
            this.playerHpText.setText(`${charName} HP: ${Math.max(0, Math.ceil(player.hp))}%`);

            if (waveInfo) {
                this.scoreText.setText(`SCORE: ${waveInfo.score}`);
            } else {
                const totalDamage = this.scene.registry.get("totalDamageInflicted") || 0;
                this.scoreText.setText(`SCORE: ${Math.floor(totalDamage)}`);
            }
        }

        const mins = Math.floor(timeElapsed / 60000);
        const secs = Math.floor((timeElapsed % 60000) / 1000);
        this.timerText.setText(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);

        if (waveInfo) {
            this.bossHpText.setText(
                `OLEADA — ENEMIGOS: ${waveInfo.alive}/${waveInfo.max}  |  ELIMINADOS: ${waveInfo.kills}`,
            );
            this.bossBarFill.setSize(0, 14);
            return;
        }

        if (boss && !boss.dead) {
            const hp = Math.max(0, Math.ceil(boss.hp));
            const ratio = Phaser.Math.Clamp(boss.hp / boss.maxHp, 0, 1);
            const w = Math.max(2, this.bossBarWidth * ratio);

            this.bossHpText.setText(`${boss.displayName.toUpperCase()}: ${hp} / ${boss.maxHp}`);
            this.bossBarFill.setSize(w, 14);
            this.bossBarFill.setFillStyle(ratio > 0.5 ? 0xef4444 : ratio > 0.25 ? 0xf97316 : 0xdc2626);
        }

        if (boss && boss.dead) {
            this.bossHpText.setText(`${boss.displayName.toUpperCase()} DEFEATED`);
            this.bossBarFill.setSize(0, 14);
        }
    }
}
