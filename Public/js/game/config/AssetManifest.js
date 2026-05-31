/**
 * Manifiestos de sprites: define QUÉ archivos carga cada entidad (jugador, jefe, enemigo).
 *
 * ENTITY_MANIFESTS  → claves: hero, hero2, boss1, boss2, boss3, destroyer
 * MISSION_MANIFESTS → qué entidades precarga PreloadScene por misión (1, 2 o 3)
 * MISSION_BACKGROUNDS → fondo de arena por misión (bg_mission1, 2, 3)
 *
 * Los jefes de combate viven en Mission{N}_Boss{X}.js pero usan estos manifests
 * (boss1/boss2/boss3) para texturas vía EntityLoader.textureKey().
 */
const ENTITY_MANIFESTS = {
    hero: {
        id: "hero",
        displayName: "Dan",
        basePath: "/assets/sprites/hero/hero1",
        sheets: [
            { 
                key: "walk", 
                isIndividual: true, 
                files: [
                    "correrDan-1-1.png", "correrDan-1-2.png", "correrDan-1-3.png", "correrDan-1-4.png", 
                    "correrDan-1-5.png", "correrDan-1-6.png", "correrDan-1-7.png", "correrDan-1-8.png",
                    "correrDan-5-1.png", "correrDan-5-2.png", "correrDan-5-3.png", "correrDan-5-4.png", 
                    "correrDan-5-5.png", "correrDan-5-6.png", "correrDan-5-7.png", "correrDan-5-8.png"
                ] 
            },
            { 
                key: "jump", 
                isIndividual: true, 
                files: [
                    "saltarDan-1-1.png", "saltarDan-1-2.png", "saltarDan-1-3.png", "saltarDan-1-4.png",
                    "saltarDan-1-5.png", "saltarDan-1-6.png", "saltarDan-1-7.png", "saltarDan-2-1.png",
                    "saltarDan-5-1.png", "saltarDan-5-2.png", "saltarDan-5-3.png", "saltarDan-5-4.png",
                    "saltarDan-5-5.png", "saltarDan-5-6.png", "saltarDan-5-7.png", "saltarDan-5-8.png"
                ] 
            },
            { 
                key: "attack", 
                isIndividual: true, 
                files: [
                    "dispararDan-1-1.png", "dispararDan-1-2.png", "dispararDan-1-3.png", "dispararDan-1-4.png",
                    "dispararDan-1-5.png", "dispararDan-1-6.png", "dispararDan-1-7.png", "dispararDan-1-8.png"
                ] 
            },
            { 
                key: "hurt", 
                isIndividual: true, 
                files: [
                    "DanHerido-1-1.png", "DanHerido-1-2.png", "DanHerido-1-3.png", "DanHerido-1-5.png", 
                    "DanHerido-1-6.png", "DanHerido-1-12.png", "DanHerido-3-19.png"
                ] 
            },
            { 
                key: "stand", 
                isIndividual: true, 
                files: ["correrDan-5-7.png"] // Pose inconfundible con pierna levantada
            },
            { 
                key: "died", 
                isIndividual: true, 
                files: [
                    "DanHerido-1-1.png", "DanHerido-1-2.png", "DanHerido-1-3.png", "DanHerido-1-5.png", 
                    "DanHerido-1-6.png", "DanHerido-1-12.png", "DanHerido-3-19.png"
                ] 
            },
            { key: "bullet", path: "/assets/sprites/hero/Bala.png", frameWidth: 64, frameHeight: 64, frames: 7 }
            ]
            },

            hero2: {
            id: "hero2",
            displayName: "Mika",
            basePath: "/assets/sprites/hero",
            sheets: [
            { key: "stand", file: "Stand.png", frames: 5 },
            { key: "walk", file: "Walk1.png", frames: 13 },
            { key: "jump", file: "Jump1.png", frames: 9 },
            { key: "stand_weapon", file: "StandWeapon.png", frames: 4 },
            { key: "walk_weapon", file: "WalkWeapon.png", frames: 8 },
            { key: "jump_weapon", file: "JumpWeapon.png", frames: 9 },
            { key: "attack", file: "Attack.png", frames: 6 },
            { key: "bullet", path: "/assets/sprites/hero/Bala.png", frameWidth: 64, frameHeight: 64, frames: 7 },
            { key: "died", file: "Died1.png", frames: 8 }
            ]
            },

    boss1: {
        id: "boss1",
        basePath: "/assets/sprites/bosses/Boss1",
        sheets: [
            { key: "idle", file: "Idle.png", frameWidth: 96, frameHeight: 96, frames: 4 },
            { key: "walk", file: "Walk.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "attack", file: "Attack.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "walk_attack", file: "Walk_attack.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "hurt", file: "Hurt.png", frameWidth: 96, frameHeight: 96, frames: 2 },
            { key: "death", file: "Death.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "fly_up", file: "Fly_up.png", frameWidth: 96, frameHeight: 96, frames: 4 },
            { key: "fly_down", file: "Fly_down.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "special1", file: "Special1.png", frameWidth: 48, frameHeight: 48, frames: 6 },
            { key: "special2", file: "Special2.png", frameWidth: 48, frameHeight: 48, frames: 4 }
        ]
    },

    boss2: {
        id: "boss2",
        basePath: "/assets/sprites/bosses/Boss2",
        sheets: [
            { key: "idle", file: "Idle.png", frameWidth: 96, frameHeight: 96, frames: 4 },
            { key: "walk", file: "Walk.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "attack", file: "Attack.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "walk_attack", file: "Walk_attack.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "hurt", file: "Hurt.png", frameWidth: 96, frameHeight: 96, frames: 2 },
            { key: "death", file: "Death.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "fly_up", file: "Fly_up.png", frameWidth: 96, frameHeight: 96, frames: 4 },
            { key: "fly_down", file: "Fly_down.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "special", file: "Special.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "special1", file: "../Boss1/Special1.png", frameWidth: 48, frameHeight: 48, frames: 6 },
            { key: "special2", file: "../Boss1/Special2.png", frameWidth: 48, frameHeight: 48, frames: 4 }
        ]
    },

    boss3: {
        id: "boss3",
        basePath: "/assets/sprites/bosses/Boss3",
        sheets: [
            { key: "idle", file: "Idle.png", frameWidth: 96, frameHeight: 96, frames: 4 },
            { key: "walk", file: "Walk.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "attack", file: "Attack.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "walk_attack", file: "Walk_attack.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "hurt", file: "Hurt.png", frameWidth: 96, frameHeight: 96, frames: 2 },
            { key: "death", file: "Death.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "fly_up", file: "Fly_up.png", frameWidth: 96, frameHeight: 96, frames: 4 },
            { key: "fly_down", file: "Fly_down.png", frameWidth: 96, frameHeight: 96, frames: 6 },
            { key: "special", file: "Special.png", frameWidth: 96, frameHeight: 96, frames: 8 },
            { key: "bullet", file: "Bullet.png", frameWidth: 48, frameHeight: 16, frames: 1 }
        ]
    },

    destroyer: {
        id: "destroyer",
        basePath: "/assets/sprites/enemies/Destroyer",
        sheets: [
            { key: "idle", file: "Idle.png", frameWidth: 160, frameHeight: 128, frames: 4 },
            { key: "walk", file: "Walk.png", frameWidth: 170, frameHeight: 128, frames: 6 },
            { key: "charge", file: "Charge_1.png", frameWidth: 128, frameHeight: 32, frames: 1 },
            { key: "charge2", file: "Charge_2.png", frameWidth: 160, frameHeight: 64, frames: 2 },
            { key: "hurt", file: "Hurt.png", frameWidth: 192, frameHeight: 128, frames: 2 },
            { key: "death", file: "Dead.png", frameWidth: 150, frameHeight: 128, frames: 6 },
            { key: "special1", file: "Shot_1.png", frameWidth: 170, frameHeight: 128, frames: 6 },
            { key: "special2", file: "Shot_2.png", frameWidth: 256, frameHeight: 128, frames: 4 }
        ]
    }
};

const MISSION_MANIFESTS = {
    /** Misión 1: personajes + boss1 (Mission1_Boss1.js) */
    1: ["hero", "hero2", "boss1"],
    /** Misión 2: personajes + boss3 (Mission2_Boss3.js — Titán MK-3) */
    2: ["hero", "hero2", "boss3"],
    /** Misión 3: personajes + boss2 (Mission3_Boss2.js — Andronimus) */
    3: ["hero", "hero2", "boss2"],
    /** Modo Oleada: personajes + destroyer (mismo fondo que misión 1) */
    wave: ["hero", "hero2", "destroyer"],
};

const MISSION_BACKGROUNDS = {
    1: { key: "bg_mission1", file: "/Background/Background1.png" },
    2: { key: "bg_mission2", file: "/Background/Background2.png" },
    3: { key: "bg_mission3", file: "/Background/Background3.png" },
    wave: { key: "bg_mission1", file: "/Background/Background1.png" },
};

const MENU_BACKGROUND = {
    key: "bg_menu",
    file: "/Background/Background2.png"
};
