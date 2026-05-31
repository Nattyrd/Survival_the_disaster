/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONSTANTES GLOBALES Y MAPA DEL PROYECTO
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * FLUJO DE ESCENAS (orden típico de juego):
 *   BootScene      → Carga inicial + SettingsManager / MusicManager / ScaleManager
 *   IntroScene     → Opening animado (skippable)
 *   MenuScene      → Menú principal, selección de personaje y misiones
 *   AetherionCinema→ Novela visual (historia antes del combate)
 *   PreloadScene   → Carga sprites/audio según misión y personaje elegido
 *   GameScene      → Combate jugador vs jefe de la misión
 *   WinScene / GameOverScene → Resultado + ranking opcional
 *
 * ENTIDADES DE JEFE POR MISIÓN (clase JS → archivo):
 *   Misión 1 → class Boss1  → Mission1_Boss1.js  (manifest: boss1, Robot Jefe)
 *   Misión 2 → class Boss3  → Mission2_Boss3.js  (manifest: boss3, Titán MK-3)
 *   Misión 3 → class Boss2  → Mission3_Boss2.js  (manifest: boss2, Andronimus)
 *   Modo Oleada → Destroyer × N → Destroyer.js (manifest: destroyer, fondo bg_mission1)
 *
 * DATOS COMPARTIDOS (Phaser Registry):
 *   mission, selectedCharacter, totalDamageInflicted, musicVolume, sfxVolume
 *
 * ASSETS: ver config/AssetManifest.js (ENTITY_MANIFESTS, MISSION_MANIFESTS)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * Resolución lógica del juego (1280×720). Phaser Scale.FIT escala al navegador
 * o pantalla completa sin cambiar estas coordenadas internas.
 */
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

/** Tamaño base de frames (px). */
const SPRITE_FRAME_SIZE = 64;

/** Identificador de misión para Modo Oleada (menú → PreloadScene → GameScene). */
const MISSION_WAVE = "wave";

/** Máximo de Destroyers vivos a la vez en Modo Oleada. */
const WAVE_MAX_ENEMIES = 5;

/** Puntos base por eliminación; sube +25 por cada kill acumulado en la partida. */
const WAVE_SCORE_BASE = 100;
const WAVE_SCORE_BONUS_PER_KILL = 25;

/** Margen mínimo al borde del mapa cuando el jefe se reposiciona. */
const MISSION_WORLD_MARGIN = 150;

/**
 * Posiciones de spawn en misiones 1–3, en porcentaje del mundo (0–1).
 */
const MISSION_SPAWN = {
  playerX: 0.18,
  playerY: 0.55,
  bossX: 0.78,
  bossY: 0.42,
};

/** Tamaño nativo de los fotogramas de la intro. */
const INTRO_NATIVE_WIDTH = 1280;
const INTRO_NATIVE_HEIGHT = 720;

/** Detiene escenas de juego y abre el menú sin recargar la página. */
function irAlMenuPrincipal(scene) {
  const sm = scene.scene;
  ["GameScene", "WinScene", "GameOverScene", "PreloadScene"].forEach((key) => {
    const s = sm.get(key);
    if (s && (sm.isActive(key) || sm.isPaused(key))) {
      sm.stop(key);
    }
  });
  sm.start("MenuScene");
}
