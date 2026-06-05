# UD_vocacional
este proyecto tiene como fin ayudar a los aspirantes a encontrar la carrera que mas se ajuste con ellos y que pueda ofertar la universidad distrital

## Despliegue en GitHub Pages

El proyecto queda configurado para publicarse como sitio de proyecto en:

https://juanleongo.github.io/UD_vocacional/

El despliegue se hace desde la rama `main`, carpeta `/docs`.

Para actualizar la pagina publicada:

1. Ejecuta `npm run build`.
2. Sube los cambios generados en `docs` a la rama `main`.
3. En GitHub, ve a `Settings > Pages` y configura:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/docs`
