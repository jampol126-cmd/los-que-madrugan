# Despliegue y Operación

## Arquitectura activa

La app desplegada usa:

- Frontend: Vite/React desde la raiz del repo
- Backend serverless: carpeta `api/` en Vercel Functions
- Base de datos: Supabase
- Webhooks: Telegram y Wompi, atendidos desde `api/*.js`

La carpeta `backend/` existe en el repo, pero hoy no es la fuente principal de despliegue para Vercel.

## Proyecto Vercel enlazado

Este repo ya esta enlazado a Vercel mediante `.vercel/project.json`:

- `projectName`: `los-que-madrugan`

## Límite del plan Hobby

El proyecto corre en Vercel Hobby, que tiene un límite de 12 Serverless Functions por deployment.

Para no romper despliegues:

- la superficie crítica se mantiene en `api/`
- algunas funciones auxiliares se excluyen del deploy mediante `.vercelignore`
- no agregar nuevas funciones serverless sin revisar primero el conteo total

## Desarrollo local

Desde `C:\LosQueMadrugan`:

```powershell
npm install
npm run dev
```

Notas:

- `npm install` instala dependencias del frontend y de las funciones serverless que comparten `package.json`.
- `npm run dev` levanta Vite para desarrollo local del frontend.
- Para validar un cambio de frontend o contratos del cliente, correr tambien `npm run build`.

## Despliegue a producción en Vercel

El flujo normal de despliegue es por GitHub:

```powershell
git add <archivos>
git commit -m "Fix: APIs para Vercel serverless"
git push
```

Cuando haces `git push` a la rama conectada al proyecto, Vercel construye y despliega automaticamente.

## Variables de entorno necesarias

Definir en Vercel Project Settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `NEXT_PUBLIC_BOT_NAME`
- `NEXT_PUBLIC_URL`
- `ADMIN_SECRET`
- `CRON_SECRET`

Notas:

- `ADMIN_SECRET` se usa para el panel admin.
- `CRON_SECRET` protege endpoints administrativos y cron jobs.
- `NEXT_PUBLIC_URL` debe apuntar al dominio publico del proyecto.

## Cron jobs activos

Definidos en `vercel.json`:

- `/api/envio-masivo`
- `/api/resumen-admin`
- `/api/limpieza-inactivos`

Si cambias nombres de archivos o rutas en `api/`, revisa `vercel.json` antes de desplegar.

## Ejecucion manual de cron

Para disparar manualmente un job protegido, usar el mismo `CRON_SECRET`:

```powershell
curl.exe -H "Authorization: Bearer TU_CRON_SECRET" "https://los-que-madrugan.vercel.app/api/envio-masivo"
```

No dejar keys hardcodeadas en `vercel.json` ni en los handlers.

## Regla importante

El frontend debe consumir la superficie `api/` del root. Si se cambia algo en `backend/app/api/`, no asumir que eso queda desplegado en Vercel sin ajustar primero la configuracion del proyecto.

## Checklist antes de push

1. Confirmar que las rutas usadas por `src/lib/api.ts` existan en `api/`.
2. Correr `npm run build`.
3. Revisar `git status` para no subir `dist/`, `.env` ni cambios accidentales.
4. Hacer `git push` y verificar el deploy en Vercel.

## Para que no vuelva a pasar

- No mantener dos backends activos para el mismo dominio funcional sin una decision explicita.
- Si se migra una ruta, actualizar en la misma tarea:
  - frontend consumidor
  - endpoint serverless real
  - documentacion de despliegue
  - `vercel.json` si aplica
- Antes de cerrar una tarea de APIs, validar:
  - bot
  - admin
  - referidos
  - webhook de pago
