# Legacy Backend

Esta carpeta ya no gobierna la produccion actual.

La superficie activa desplegada en Vercel vive en:

- `src/`
- `api/`
- `public/`

## Regla operativa

No asumir que cambios aqui se despliegan automaticamente.
Esta carpeta no forma parte del paquete actual que Vercel despliega.

Si se necesita rescatar logica desde este backend:

1. copiarla o migrarla a `api/`
2. validar el flujo en Vercel
3. documentar el cambio en `DEPLOYMENT.md` o `STRUCTURE.md`

## Nota

Esta carpeta se conserva solo como referencia temporal hasta hacer una depuracion mayor.
