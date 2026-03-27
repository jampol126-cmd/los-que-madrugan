# Estructura Actual del Proyecto

## Superficie activa de producción

Estas rutas y carpetas son la fuente de verdad actual:

- `src/`: frontend Vite/React
- `api/`: backend serverless desplegado en Vercel
- `public/`: assets públicos del sitio
- `scripts/`: scripts auxiliares
- `vercel.json`: rewrites y cron jobs activos

## Superficies legacy o de referencia

Estas carpetas existen en el repo, pero no gobiernan la producción actual:

- `backend/`
- `backend-api/`

No asumir que un cambio ahí queda desplegado en Vercel. Si se toca algo en esas carpetas, debe ser por una migración explícita o por rescate de lógica.

Además, ambas carpetas están excluidas del paquete desplegado en Vercel para reducir confusión operativa.

Ambas carpetas tienen archivos `LEGACY.md` para dejar esta distinción visible dentro del propio árbol.

## Reglas operativas

1. Si el frontend consume una ruta, esa ruta debe existir en `api/`.
2. No agregar nuevos cron jobs sin reflejarlos en `vercel.json`.
3. No guardar secretos en archivos versionados.
4. No volver a trackear `dist/` ni `.env`.
5. Evitar endpoints duplicados o contratos alternos si ya existe una ruta activa equivalente.

## Limpieza pendiente

- decidir si `backend/` y `backend-api/` se archivan definitivamente o se eliminan
- sacar del control de versiones cualquier archivo local sensible dentro de árboles legacy
- revisar si los cambios locales dentro de `backend/app/api/*` merecen rescate hacia `api/` o descarte
- revisar archivos top-level sueltos antes de un ordenamiento más profundo

## Endpoints retirados por duplicación

Estos endpoints se consideran contratos viejos y no deben volver a introducirse:

- `api/admin.js`
- `api/referidos.js`

La superficie vigente usa rutas separadas bajo:

- `api/admin/*`
- `api/usuario/referidos.js`
