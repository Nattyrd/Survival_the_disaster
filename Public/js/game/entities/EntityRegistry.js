/** Acceso de lectura a ENTITY_MANIFESTS y MISSION_MANIFESTS (AssetManifest.js). */
const EntityRegistry = {
    manifests: ENTITY_MANIFESTS,

    getManifest(entityId) {
        return this.manifests[entityId] || null;
    },

    isReady(entityId) {
        const manifest = this.getManifest(entityId);
        return manifest && manifest.sheets && manifest.sheets.length > 0;
    },

    getMissionEntities(missionId) {
        return MISSION_MANIFESTS[missionId] || [];
    }
};
