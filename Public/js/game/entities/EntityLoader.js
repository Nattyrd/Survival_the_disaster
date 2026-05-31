/**
 * Carga de assets según AssetManifest.js.
 * preloadMission(missionId) usa MISSION_MANIFESTS + MISSION_BACKGROUNDS.
 * textureKey(id, sheet) genera la clave Phaser (ej: boss1_idle, hero_walk_3).
 */
const EntityLoader = {
    textureKey(manifestId, sheetKey, index = null) {
        return index !== null ? `${manifestId}_${sheetKey}_${index}` : `${manifestId}_${sheetKey}`;
    },

    preload(scene, manifest) {
        if (!manifest.sheets || manifest.sheets.length === 0) {
            return;
        }

        manifest.sheets.forEach((sheet) => {
            const key = this.textureKey(manifest.id, sheet.key);
            
            if (sheet.isIndividual && sheet.files) {
                // Carga secuencial de imágenes individuales
                sheet.files.forEach((file, index) => {
                    const subKey = this.textureKey(manifest.id, sheet.key, index);
                    const url = `${manifest.basePath}/${file}`;
                    scene.load.image(subKey, url);
                });
            } else {
                // Carga normal de spritesheet
                const url = sheet.path || `${manifest.basePath}/${sheet.file}`;
                scene.load.spritesheet(key, url, {
                    frameWidth: sheet.frameWidth || SPRITE_FRAME_SIZE,
                    frameHeight: sheet.frameHeight || SPRITE_FRAME_SIZE
                });
            }
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
            if (sheet.isIndividual && sheet.files) {
                sheet.files.forEach((_, index) => {
                    const subKey = this.textureKey(manifest.id, sheet.key, index);
                    if (scene.textures.exists(subKey)) {
                        scene.textures.get(subKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
                    }
                });
            } else {
                const key = this.textureKey(manifest.id, sheet.key);
                if (scene.textures.exists(key)) {
                    scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
                }
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
