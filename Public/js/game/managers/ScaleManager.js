/**
 * Gestor de escala y redimensionado.
 * Mantiene resolución lógica fija (1280×720) y escala con FIT al navegador / fullscreen.
 */
class ScaleManager {
  static setup(game) {
    ScaleManager.applyScaleSettings(game.scale);
    ScaleManager.bindEvents(game);
  }

  static applyScaleSettings(scale) {
    if (!scale) return;

    if ("scaleMode" in scale) {
      scale.scaleMode = Phaser.Scale.FIT;
    }
    if ("autoCenter" in scale) {
      scale.autoCenter = Phaser.Scale.CENTER_BOTH;
    }

    if (typeof scale.setGameSize === "function") {
      scale.setGameSize(GAME_WIDTH, GAME_HEIGHT);
    }

    if (typeof scale.refresh === "function") {
      scale.refresh();
    }
  }

  static bindEvents(game) {
    if (game._scaleEventsBound) return;
    game._scaleEventsBound = true;

    const refresh = () => ScaleManager.refresh(game);
    const scale = game.scale;
    const events = Phaser.Scale?.Events || {
      RESIZE: "resize",
      ENTER_FULLSCREEN: "enterfullscreen",
      LEAVE_FULLSCREEN: "leavefullscreen",
    };

    scale.on(events.RESIZE, refresh);
    scale.on(events.ENTER_FULLSCREEN, () => setTimeout(refresh, 80));
    scale.on(events.LEAVE_FULLSCREEN, () => setTimeout(refresh, 80));

    window.addEventListener("resize", refresh);
    window.addEventListener("orientationchange", () => setTimeout(refresh, 200));
  }

  static refresh(game) {
    const scale = game.scale;
    ScaleManager.applyScaleSettings(scale);
    game.events.emit("display-resize");
  }

  static applyFullscreen(game, enabled) {
    const scale = game.scale;
    ScaleManager.refresh(game);

    if (enabled && !scale.isFullscreen && typeof scale.startFullscreen === "function") {
      scale.startFullscreen();
    } else if (!enabled && scale.isFullscreen && typeof scale.stopFullscreen === "function") {
      scale.stopFullscreen();
    }

    setTimeout(() => ScaleManager.refresh(game), 100);
  }
}

if (typeof window !== "undefined") {
  window.ScaleManager = ScaleManager;
}
