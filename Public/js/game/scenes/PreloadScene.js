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

        const bar = this.add.graphics();
        const box = this.add.graphics();
        box.fillStyle(0x222222, 0.8);
        box.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        this.load.on("progress", (value) => {
            bar.clear();
            bar.fillStyle(0x38bdf8, 1);
            bar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on("complete", () => {
            bar.destroy();
            box.destroy();
        });

        // 1. CARGA DE ASSETS PARA CINEMÁTICA Y TUTORIAL
        this.load.json('intro_script', '/assets/intro/intro_script.json');
        this.load.image('guia_tutorial', '/assets/menu/guia/Tutorial.png');
        this.load.image('screen_win', '/assets/menu/guia/WINScreen.png');
        this.load.image('screen_lose', '/assets/menu/guia/LoseScreen.png');
        
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
