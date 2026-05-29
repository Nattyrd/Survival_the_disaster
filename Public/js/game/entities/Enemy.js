/**
 * Clase base para enemigos. Cuando tengas sprites en Assets/aseprite/enemies/:
 * 1. Añade sheets en ENTITY_MANIFESTS.enemy_grunt (o nuevo id)
 * 2. Incluye el id en MANIFESTS_TO_LOAD
 * 3. Extiende esta clase o instancia con el entityId correspondiente
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
