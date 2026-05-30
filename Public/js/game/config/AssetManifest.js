const ENTITY_MANIFESTS = {
    hero: {
        id: "hero",
        basePath: "/assets/sprites/hero",
        sheets: [
            { key: "stand", file: "Stand.png", frames: 5 },
            { key: "walk", file: "Walk1.png", frames: 13 },
            { key: "jump", file: "Jump1.png", frames: 9 },
            { key: "stand_weapon", file: "StandWeapon.png", frames: 4 },
            { key: "walk_weapon", file: "WalkWeapon.png", frames: 8 },
            { key: "jump_weapon", file: "JumpWeapon.png", frames: 9 },
            { key: "attack", file: "Attack.png", frames: 6 },
            { key: "bullet", file: "Bala.png", frames: 7 },
            { key: "died", file: "Died1.png", frames: 8 }
        ]
    },

    hero2: {
        id: "hero2",
        basePath: "/assets/sprites/hero", // Usando mismos assets por ahora como placeholder
        sheets: [
            { key: "stand", file: "Stand.png", frames: 5 },
            { key: "walk", file: "Walk1.png", frames: 13 },
            { key: "jump", file: "Jump1.png", frames: 9 },
            { key: "stand_weapon", file: "StandWeapon.png", frames: 4 },
            { key: "walk_weapon", file: "WalkWeapon.png", frames: 8 },
            { key: "jump_weapon", file: "JumpWeapon.png", frames: 9 },
            { key: "attack", file: "Attack.png", frames: 6 },
            { key: "bullet", file: "Bala.png", frames: 7 },
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
        sheets: []
    },

    boss3: {
        id: "boss3",
        basePath: "/assets/sprites/bosses/Boss3",
        sheets: []
    },

    enemy_grunt: {
        id: "enemy_grunt",
        basePath: "/assets/sprites/enemies",
        sheets: []
    }
};

const MISSION_MANIFESTS = {
    1: ["hero", "boss1"],
    2: ["hero"],
    3: ["hero"]
};

const MISSION_BACKGROUNDS = {
    1: { key: "bg_mission1", file: "/Background/Background1.png" }
};

const MENU_BACKGROUND = {
    key: "bg_menu",
    file: "/Background/Background2.png"
};
