
# Physalis (Linterna China)

Repositorio educativo con vistas **3D / AR / VR**, **Quiz** y **Ticket de salida**.  
Estructura lista para GitHub Pages y uso offline (PWA).

## Estructura
- `index.html` — Landing con botones coloridos y controles de accesibilidad (🌓 alto contraste).
- `viewer3d/` — Visor 3D con `<model-viewer>` (coloca tu `assets/models/model.glb`).
- `viewerAR/` y `viewerVR/` — Stubs listos para integrar WebXR/AR.
- `quiz.html` — Guarda en LocalStorage y exporta CSV.
- `ticket.html` — Ticket de salida con exportación CSV.
- `assets/` — `style.css`, `main.js`, `models/model.glb` (placeholder).
- `manifest.webmanifest` y `sw.js` — PWA.

## Cómo publicar
1. Sube el repo a GitHub.
2. Activa **Settings → Pages → Source: `main` / `/root`**.
3. Abre `https://TU_USUARIO.github.io/NOMBRE_REPO/`.

---
Hecho con ❤️ para Pancho & Belén.
