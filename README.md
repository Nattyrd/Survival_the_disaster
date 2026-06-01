# AETHERION - Arcade Shooter 2D con Phaser.js

## Descripción del Proyecto

**AETHERION** es un videojuego Arcade Shooter 2D desarrollado con **Phaser 3.60.0**, **Electron** y **Node.js**. El juego presenta una experiencia de combate dinámica donde el jugador debe enfrentarse a tres jefes progresivamente desafiantes en misiones individuales, o participar en un modo de oleadas infinitas contra enemigos Destroyer.

### Objetivos del Juego

- **Misión 1**: Vencer al **Robot Jefe** - Un rival versátil que combina ataques de proyectiles con reposicionamiento volador
- **Misión 2**: Derrotar al **Titán MK-3** - Un jefe poderoso que realiza ataques especiales en abanico con múltiples proyectiles
- **Misión 3**: Eliminar a **Andronimus** - Un androide de combate que lanza rayos especiales desde sus cañones con agresión escalada

Cada jefe implementa un sistema de **IA dinámica** que ajusta su comportamiento según el progreso de la batalla.

---

## Guía de Ejecución

### Requisitos Previos

- **Node.js** versión 18.x o superior
- **npm** (incluido con Node.js)

### Pasos de Instalación

1. **Clonar o descargar el proyecto**:

   ```bash
   cd "PROYECTO AETHERION"
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Ejecutar el proyecto (Electron)**:

   ```bash
   npm start
   ```

   Esto inicia automáticamente el servidor Express en `http://localhost:3000` y abre la aplicación Electron.

4. **Modo desarrollo con recarga automática**:

   ```bash
   npm run dev
   ```

   Habilita Nodemon para reinicio automático en cambios de código.

5. **Servidor Express (standalone)**:
   ```bash
   npm run server
   ```
   Ejecuta solo el servidor en `http://localhost:3000/game`.

---

## Controles

### Desktop (Teclado y Mouse)

| Acción                   | Tecla(s)                 |
| ------------------------ | ------------------------ |
| **Movimiento Izquierda** | `A`                      |
| **Movimiento Derecha**   | `D`                      |
| **Movimiento Arriba**    | `W`                      |
| **Movimiento Abajo**     | `S`                      |
| **Saltar**               | `Espacio`                |
| **Disparar**             | `Clic Izquierdo (Mouse)` |

### Mobile (Pantalla Táctil)

| Elemento                 | Función                                                    |
| ------------------------ | ---------------------------------------------------------- |
| **Joystick Izquierdo**   | Movimiento en 8 direcciones (área sensible: 22% dead zone) |
| **Botón Rojo (DIS)**     | Disparo continuo                                           |
| **Botón Verde (SAL)**    | Saltar                                                     |
| **Botón Púrpura (ARMA)** | Cambio de arma (reservado para futuras extensiones)        |

**Nota**: Los controles táctiles se activan automáticamente en dispositivos móviles o pantallas menores a 1024px de ancho. El sistema detecta dispositivos iOS/Android y entrada táctil nativa.

---

## Estructura del Proyecto

### Arquitectura General

El proyecto sigue una **arquitectura modular orientada a escenas y entidades**, aprovechando el patrón Registry de Phaser para gestión de datos compartida.

```
Public/js/game/
├── config/                 # Configuración de Phaser y manifiestos de assets
│   └── AssetManifest.js   # Mapa de sprites, texturas y sonidos
├── scenes/                 # Escenas (Boot, Intro, Menu, Game, Ranking, etc.)
├── entities/               # Clases de jugador y jefes (Player, Boss1, Boss2, Boss3, Enemy)
├── managers/               # Gestores centrales
│   ├── AnimationManager.js # Control de animaciones
│   ├── MusicManager.js     # Reproducción de audio (BGM y SFX)
│   ├── ScaleManager.js     # Escalado y responsividad
│   ├── SettingsManager.js  # Configuración (volumen, controles)
│   └── TouchControls.js    # Interfaz de controles móviles
└── ui/                     # Componentes UI
    ├── DialogueBox.js      # Diálogos y novela visual
    └── Hud.js              # Interfaz de juego (HP, barras de estado)
```

### Características Técnicas Clave

#### 1. **Patrón Registry (Phaser)**

- Almacenamiento global de datos de misión, personaje seleccionado, volúmenes y puntuación
- Permite comunicación entre escenas sin acoplamiento directo

#### 2. **Arcade Physics**

- Colisiones 2D eficientes para proyectiles y entidades
- Velocidad constante en 8 direcciones
- Body normalization para hitboxes precisas

#### 3. **Object Pooling**

- Reutilización de proyectiles (bullets) en grupos de física
- Máximo de 30 balas del jugador y 16-32 proyectiles de jefes
- Reduce presión del garbage collector durante combate intenso

#### 4. **Sistema de Animaciones**

- Secuencias frame-by-frame para cada acción (idle, walk, attack, jump, death)
- Transiciones suave entre estados de movimiento
- Cancelación de animación de ataque bloqueada hasta cooldown

#### 5. **IA Dinámica de Jefes**

- Ciclos de decisión cada 200-400ms (think scheduler)
- Comportamientos escalados: persecución → ataque → reposicionamiento volador
- Agresión incremental: proyectiles y frecuencia de ataque aumentan con daño recibido
- Boss1: ataque simple + vuelo; Boss3: ataques en abanico especiales; Boss2: rayos láser

#### 6. **Gestión de Audio**

- Solo una pista musical activa simultáneamente (prevención de solapamiento)
- Volúmenes independientes para música y SFX
- Integración con SettingsManager para control de volumen en tiempo real

#### 7. **Persistencia de Ranking**

- Almacenamiento local en `localStorage` (navegador/Electron)
- Datos guardados: nombre del jugador, daño total infligido, personaje, estado de misión
- Ranking ordenado por daño (puntuación menor = mejor desempeño)
- Separación entre partidas completadas e incompletas

---

## Créditos

### Equipo de Desarrollo

- **Dany Molina** - Programación y Game Design
- **Kevin García** - Desarrollo y Architecture
- **Kevin Gómez** - Desarrollo e Integración

### Tecnologías y Dependencias

- **Phaser 3.60.0** - Motor gráfico 2D
- **Electron 42.3.0** - Empaquetado de aplicación de escritorio
- **Express 5.2.1** - Servidor web backend
- **Node.js 24.16.0** - Runtime JavaScript
- **Aseprite** - Herramienta de creación de sprites animados

### Assets

- Sprites y animaciones: Creados con Aseprite
- Música y efectos de sonido: Diseño de audio original
- Interfaz: Renderizado con Phaser Text y Graphics

---
