/**
 * Enemigo genérico (Modo Oleada: PRÓXIMAMENTE).
 * Extiende esta clase cuando existan sprites en Assets/aseprite/enemies/.
 */
class Enemy {
    constructor(scene, entityId, x, y) {
        this.scene = scene;
        this.entityId = entityId;
        this.manifest = EntityRegistry.getManifest(entityId);

        if (!EntityRegistry.isReady(entityId)) {
            console.warn(`[Enemy] Sin assets para "${entityId}". Coloca PNG en ${this.manifest?.basePath}`);
            return;
        }

        const firstSheet = this.manifest.sheets[0];
        const tex = EntityLoader.textureKey(entityId, firstSheet.key);
        this.sprite = scene.physics.add.sprite(x, y, tex, 0);
    }
}
