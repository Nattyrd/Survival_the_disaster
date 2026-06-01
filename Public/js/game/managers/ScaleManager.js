/**
 * Gestor de escala y redimensionado.
 * Mantiene resolución lógica fija (1280×720) y escala con FIT al navegador / fullscreen.
 */
class ScaleManager {
  static isRefreshing = false;

  static setup(game) {
    ScaleManager.applyScaleSettings(game.scale);
    ScaleManager.bindEvents(game);
  }

  static applyScaleSettings(scale) {
    if (!scale || ScaleManager.isRefreshing) return;

    try {
      ScaleManager.isRefreshing = true;

      if ("scaleMode" in scale && scale.scaleMode !== Phaser.Scale.FIT) {
        scale.scaleMode = Phaser.Scale.FIT;
      }
      if ("autoCenter" in scale && scale.autoCenter !== Phaser.Scale.CENTER_BOTH) {
        scale.autoCenter = Phaser.Scale.CENTER_BOTH;
      }

      // Solo llamar a setGameSize si las dimensiones han cambiado para evitar eventos innecesarios
      if (typeof scale.setGameSize === "function" && (scale.width !== GAME_WIDTH || scale.height !== GAME_HEIGHT)) {
        scale.setGameSize(GAME_WIDTH, GAME_HEIGHT);
      }
    } finally {
      ScaleManager.isRefreshing = false;
    }
  }

  static bindEvents(game) {
    if (game._scaleEventsBound) return;
    game._scaleEventsBound = true;

    const onResize = () => {
      if (ScaleManager.isRefreshing) return;
      
      // Pequeña validación para evitar cálculos con dimensiones 0
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width === 0 || height === 0) return;

      ScaleManager.refresh(game);
    };

    const scale = game.scale;
    const events = Phaser.Scale?.Events || {
      RESIZE: "resize",
      ENTER_FULLSCREEN: "enterfullscreen",
      LEAVE_FULLSCREEN: "leavefullscreen",
    };

    scale.on(events.RESIZE, onResize);
    scale.on(events.ENTER_FULLSCREEN, () => {
        setTimeout(onResize, 100);
        setTimeout(onResize, 500); // Doble verificación para móviles
    });
    scale.on(events.LEAVE_FULLSCREEN, () => {
        setTimeout(onResize, 100);
        setTimeout(onResize, 500);
    });

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", () => {
        // En cambios de orientación el DOM tarda un poco en actualizar dimensiones
        setTimeout(onResize, 200);
        setTimeout(onResize, 600);
    });
  }

  static refresh(game) {
    if (ScaleManager.isRefreshing) return;
    
    const scale = game.scale;
    ScaleManager.applyScaleSettings(scale);
    
    // Forzamos el refresh de Phaser solo si es necesario y fuera del bucle de eventos
    if (scale && typeof scale.refresh === "function") {
      try {
        ScaleManager.isRefreshing = true;
        scale.refresh();
      } finally {
        ScaleManager.isRefreshing = false;
      }
    }

    game.events.emit("display-resize");
  }

  static applyFullscreen(game, enabled) {
    const scale = game.scale;
    if (!scale) return;

    if (enabled && !scale.isFullscreen && typeof scale.startFullscreen === "function") {
      scale.startFullscreen();
    } else if (!enabled && scale.isFullscreen && typeof scale.stopFullscreen === "function") {
      scale.stopFullscreen();
    }
  }
}

if (typeof window !== "undefined") {
  window.ScaleManager = ScaleManager;
}
