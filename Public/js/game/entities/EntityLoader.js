const EntityLoader = {
    textureKey(manifestId, sheetKey) {
        return `${manifestId}_${sheetKey}`;
    },

    preload(scene, manifest) {
        if (!manifest.sheets || manifest.sheets.length === 0) {
            return;
        }

        manifest.sheets.forEach((sheet) => {
            const key = this.textureKey(manifest.id, sheet.key);
            scene.load.spritesheet(key, `${manifest.basePath}/${sheet.file}`, {
                frameWidth: sheet.frameWidth || SPRITE_FRAME_SIZE,
                frameHeight: sheet.frameHeight || SPRITE_FRAME_SIZE
            });
        });
    },

    preloadMission(scene, missionId) {
        const ids = MISSION_MANIFESTS[missionId] || ["hero"];
        ids.forEach((id) => {
            if (ENTITY_MANIFESTS[id]) {
                this.preload(scene, ENTITY_MANIFESTS[id]);
            }
        });

        const bg = MISSION_BACKGROUNDS[missionId];
        if (bg) {
            scene.load.image(bg.key, bg.file);
        }
    },

    applyPixelFilters(scene, manifest) {
        if (!manifest.sheets) {
            return;
        }

        manifest.sheets.forEach((sheet) => {
            const key = this.textureKey(manifest.id, sheet.key);
            if (scene.textures.exists(key)) {
                scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
            }
        });
    },

    applyMissionFilters(scene, missionId) {
        const ids = MISSION_MANIFESTS[missionId] || ["hero"];
        ids.forEach((id) => {
            if (ENTITY_MANIFESTS[id]) {
                this.applyPixelFilters(scene, ENTITY_MANIFESTS[id]);
            }
        });
    }
};
