/**
 * PreloadScene — Carga assets de combate según registry.mission y selectedCharacter.
 * EntityLoader.preloadMission carga sprites del jefe + héroes + fondo de misión.
 * Al terminar → GameScene (o modo sandbox si mission === 0).
 */
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        const mission = this.registry.get("mission") || 0;
        const selectedChar = this.registry.get("selectedCharacter") || "hero";
        const { width, height } = this.scale;

        // 1. Mostrar Fondo de Carga (Ya cargado en BootScene)
        if (this.textures.exists('loading_bg')) {
            const bg = this.add.image(width / 2, height / 2, 'loading_bg');
            const scale = Math.max(width / bg.width, height / bg.height);
            bg.setScale(scale);
        }

        // 2. UI de Carga Estilizada (Estilo BootScene)
        const barW = 400;
        const barH = 12;
        const barX = width / 2 - barW / 2;
        const barY = height * 0.85;

        // Texto de Título/Estado
        const statusText = this.add.text(width / 2, barY - 45, "PREPARANDO DESPLIEGUE...", {
            fontFamily: "Arial Black", fontSize: "18px", color: "#38bdf8"
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, barY + 35, "0%", {
            fontFamily: "Consolas", fontSize: "16px", color: "#94a3b8"
        }).setOrigin(0.5);

        // Gráficos de la barra
        const progressBox = this.add.graphics();
        const progressBar = this.add.graphics();
        
        progressBox.fillStyle(0x0f172a, 0.7);
        progressBox.lineStyle(2, 0x38bdf8, 0.5);
        progressBox.fillRoundedRect(barX, barY, barW, barH, 6);
        progressBox.strokeRoundedRect(barX, barY, barW, barH, 6);

        this.load.on("progress", (value) => {
            const currentPerc = Math.floor(value * 100);
            percentText.setText(`${currentPerc}%`);
            
            progressBar.clear();
            progressBar.fillStyle(0x38bdf8, 1);
            progressBar.fillRoundedRect(barX + 2, barY + 2, (barW - 4) * value, barH - 4, 4);

            // Mensajes dinámicos según el progreso
            if (value < 0.3) statusText.setText("CARGANDO PROTOCOLOS DE COMBATE...");
            else if (value < 0.6) statusText.setText("SINCRONIZANDO ARMAS AETHERION...");
            else if (value < 0.9) statusText.setText("CALIBRANDO SISTEMAS DEFENSIVOS...");
            else statusText.setText("AUTORIZACIÓN COMPLETADA. LISTO PARA EL SALTO.");
        });

        this.load.on("complete", () => {
            this.tweens.add({
                targets: [statusText, percentText, progressBox, progressBar],
                alpha: 0,
                duration: 500
            });
        });

        // 3. CARGA DE ASSETS PARA CINEMÁTICA Y TUTORIAL (Resto de tu lógica original)
        this.load.json('intro_script', '/assets/intro/intro_script.json');
        this.load.image('guia_tutorial', '/assets/menu/guia/Tutorial.png');
        this.load.image('screen_win', '/assets/menu/guia/WINScreen.png');
        this.load.image('screen_lose', '/assets/menu/guia/LoseScreen.png');
        
        // ... (rest of the asset loading logic)
        
        // Fondos de Novela
        this.load.image('vn_campus_noche', '/assets/novela/edicioNoche.png');
        this.load.image('vn_vista_u', '/assets/novela/vistaFacultad.png');
        this.load.image('vn_entrada_campus', '/assets/novela/Entrada a la U.png');
        this.load.image('vn_restaurante', '/assets/novela/cafeteria.png');
        this.load.image('vn_interferencias', '/assets/novela/interferencia.png');
        this.load.image('vn_explosion', '/assets/novela/explosion.png');
        this.load.image('vn_cielo_oscuro', '/assets/novela/novela.png');

        // Personajes de Novela
        this.load.image('dan_normal', '/assets/novela/calmado.png');
        this.load.image('dan_surprise', '/assets/novela/sorprendido.png');
        this.load.image('mika_normal', '/assets/novela/calmada.png');
        this.load.image('mika_surprise', '/assets/novela/sorprendida.png');
        this.load.image('mika_sentada', '/assets/novela/calmada.png'); // Placeholder si no hay sentada
        this.load.image('student_extra', '/assets/novela/estudiante extra.png');
        
        // Cargar el sprite de "parado" correcto para la cinemática
        const charStandPath = (selectedChar === "hero") 
            ? "/assets/sprites/hero/hero1/correrDan-5-7.png" 
            : "/assets/sprites/hero/Stand.png";
        this.load.image('char_dan_norm', charStandPath);

        // 2. CARGA DE SONIDOS
        this.load.audio("sfx_player_shoot", "/assets/audio/disparo_jugador.mp3");
        this.load.audio("sfx_boss_shoot", "/assets/audio/disparo_boss2.mp3");
        this.load.audio("sfx_boss_shoot_alt", "/assets/audio/disparoboss2.mp3");
        this.load.audio("sfx_step_player", "/assets/audio/pasos_jugador.mp3");
        this.load.audio("sfx_step_player_long", "/assets/audio/pasos_jugadorlargos.mp3");
        this.load.audio("sfx_step_boss", "/assets/audio/pasos_boss.mp3");
        this.load.audio("sfx_step_boss_long", "/assets/audio/pasos_bosslargos.mp3");
        this.load.audio("explosion", "/assets/bgm/sonidoExplosion.mp3");
        this.load.audio("bgm_intro", "/assets/audio/intro.mp3");
        this.load.audio("bgm_intro2", "/assets/audio/intro2.mp3");
        this.load.audio("bgm_menu", "/assets/audio/seleccionPersonajes.mp3");

        // 3. CARGA DE PERSONAJES
        if (mission === 0) {
            // En modo sandbox/selección cargamos ambos para evitar errores
            EntityLoader.preload(this, ENTITY_MANIFESTS.hero);
            EntityLoader.preload(this, ENTITY_MANIFESTS.hero2);
        } else {
            // Cargar misión normal + el personaje elegido
            EntityLoader.preloadMission(this, mission);
            // Asegurar que el elegido esté cargado (por si no está en el manifest de la misión)
            if (ENTITY_MANIFESTS[selectedChar]) {
                EntityLoader.preload(this, ENTITY_MANIFESTS[selectedChar]);
            }
        }
    }

    create() {
        const mission = this.registry.get("mission") || 0;
        const selectedChar = this.registry.get("selectedCharacter") || "hero";

        if (mission === 0) {
            EntityLoader.applyPixelFilters(this, ENTITY_MANIFESTS.hero);
            EntityLoader.applyPixelFilters(this, ENTITY_MANIFESTS.hero2);
        } else {
            EntityLoader.applyMissionFilters(this, mission);
            if (ENTITY_MANIFESTS[selectedChar]) {
                EntityLoader.applyPixelFilters(this, ENTITY_MANIFESTS[selectedChar]);
            }
        }

        this.scene.start("GameScene");
    }
}
