class Hud {
    constructor(scene) {
        this.scene = scene;
        const { width } = scene.scale;

        this.playerHpText = scene.add.text(width / 2, 12, "", {
            fontFamily: "Arial, sans-serif",
            fontSize: "20px",
            fontStyle: "bold",
            color: "#f8fafc",
            stroke: "#0f172a",
            strokeThickness: 3
        })
            .setOrigin(0.5, 0)
            .setScrollFactor(0)
            .setDepth(5000);

        this.bossHpText = scene.add.text(width / 2, 42, "", {
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            color: "#fca5a5",
            stroke: "#0f172a",
            strokeThickness: 2
        })
            .setOrigin(0.5, 0)
            .setScrollFactor(0)
            .setDepth(5000);

        const barWidth = Math.min(480, width * 0.5);
        const barX = width / 2 - barWidth / 2;
        const barY = 64;

        this.bossBarBg = scene.add.rectangle(barX, barY, barWidth, 16, 0x0f172a, 0.9)
            .setOrigin(0, 0)
            .setStrokeStyle(2, 0x64748b)
            .setScrollFactor(0)
            .setDepth(4999);

        this.bossBarFill = scene.add.rectangle(barX + 2, barY + 2, barWidth - 4, 12, 0xef4444)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(5000);

        this.bossBarWidth = barWidth - 4;
        this.bossBarX = barX + 2;
        this.bossBarY = barY + 2;
    }

    update(player, boss) {
        if (player) {
            this.playerHpText.setText(`Jugador: ${Math.max(0, Math.ceil(player.hp))} / ${player.maxHp}`);
        }

        if (boss && !boss.dead) {
            const hp = Math.max(0, Math.ceil(boss.hp));
            const ratio = Phaser.Math.Clamp(boss.hp / boss.maxHp, 0, 1);
            const w = Math.max(2, this.bossBarWidth * ratio);

            this.bossHpText.setText(`${boss.displayName}: ${hp} / ${boss.maxHp}`);
            this.bossBarFill.setSize(w, 12);
            this.bossBarFill.setPosition(this.bossBarX, this.bossBarY);
            this.bossBarFill.setFillStyle(ratio > 0.5 ? 0xef4444 : ratio > 0.25 ? 0xf97316 : 0xdc2626);
        }

        if (boss && boss.dead) {
            this.bossHpText.setText(`${boss.displayName}: 0 / ${boss.maxHp}`);
            this.bossBarFill.setSize(0, 12);
        }
    }
}
