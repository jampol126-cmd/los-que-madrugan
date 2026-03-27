# Guía Rápida: Bing Webmaster Tools

## Opción 1: Verificación por Meta Tag (Recomendada)

1. Ir a: https://www.bing.com/webmasters
2. Click en "Sign In" (usar cuenta Microsoft/Google)
3. Click en "Add a site"
4. Ingresar URL: `https://los-que-madrugan.vercel.app`
5. Seleccionar método: **HTML Meta Tag**
6. Copiar el meta tag que te dan (se ve así):
   ```html
   <meta name="msvalidate.01" content="XXXXXXXXXXXXXXXXXXXXXXXX" />
   ```
7. Enviámelo y lo agrego al sitio
8. Click "Verify" en Bing

## Opción 2: Verificación por Archivo HTML

1. Igual que arriba hasta paso 4
2. Seleccionar método: **HTML File**
3. Descargar archivo (ej: `BingSiteAuth.xml`)
4. Subirlo a carpeta `/public/` del proyecto
5. Deploy
6. Click "Verify" en Bing

## Paso 2: Enviar Sitemap

Una vez verificado:

1. En el dashboard del sitio, ir a "Sitemaps"
2. Click "Submit sitemap"
3. Ingresar: `https://los-que-madrugan.vercel.app/sitemap.xml`
4. Click "Submit"

## Paso 3: IndexNow (Ya está configurado ✅)

IndexNow ya está implementado automáticamente. Bing detectará cambios en tiempo real.

## Verificación IndexNow

Podés verificar que funciona visitando:
```
https://los-que-madrugan.vercel.app/losquemadrugan-indexnow-key-2025.txt
```

Debe mostrar: `losquemadrugan-indexnow-key-2025`

---

**¿Qué necesito de vos?**
El código del meta tag de verificación para agregarlo al sitio.
