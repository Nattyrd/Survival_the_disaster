/**
 * Resolución interna del juego (mundo lógico en píxeles).
 * Phaser Scale.FIT escala esto a la ventana del navegador, pero el combate
 * usa todo este espacio: más ancho/alto = más sitio para esquivar.
 */
const GAME_WIDTH = 1680;
const GAME_HEIGHT = 900;

/** Tamaño base de frames del héroe en el manifest (px). */
const SPRITE_FRAME_SIZE = 64;

/**
 * Posiciones de spawn en misiones 1–3, en porcentaje del mundo (0–1).
 * Jugador a la izquierda, jefe a la derecha, separados al máximo posible.
 */
const MISSION_SPAWN = {
  playerX: 0.12,
  playerY: 0.58,
  bossX: 0.84,
  bossY: 0.45,
};

/** Margen mínimo al borde del mapa cuando el jefe se reposiciona volando. */
const MISSION_WORLD_MARGIN = 100;

/** Tamaño nativo de los fotogramas de la intro (antes del escalado a GAME_WIDTH × GAME_HEIGHT). */
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
