# 🚀 DCS Sistema — Guía de instalación como App

## ¿Qué contiene esta carpeta?
Tu app convertida en **PWA (Progressive Web App)** — se instala en iPhone, Android y Windows PC sin necesidad de tiendas de apps.

---

## PASO 1 — Subir a GitHub

1. Ve a **github.com** e inicia sesión
2. Click en **"New repository"** (botón verde ➕)
3. Nombre: `dcs-sistema`
4. Deja todo en default → Click **"Create repository"**
5. En la página del repo nuevo, verás instrucciones. Elige **"upload an existing file"**
6. **Sube TODOS los archivos** de esta carpeta (arrástralos)
7. Click **"Commit changes"**

---

## PASO 2 — Conectar con Netlify (deploy gratis)

1. Ve a **netlify.com** → crea cuenta gratis (puedes entrar con GitHub)
2. Click **"Add new site"** → **"Import an existing project"**
3. Elige **GitHub** → autoriza → selecciona tu repo `dcs-sistema`
4. Configuración de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Deploy site"**
6. Espera ~2 minutos → Netlify te da una URL tipo: `https://dcs-sistema-abc123.netlify.app`

---

## PASO 3 — Instalar en tu celular

### 📱 iPhone (Safari)
1. Abre la URL de Netlify en **Safari**
2. Toca el ícono de **compartir** (cuadrado con flecha ↑)
3. Scroll hacia abajo → **"Añadir a pantalla de inicio"**
4. Toca **"Añadir"** → ¡Ya está instalada como app! 🎉

### 📱 Android (Chrome)
1. Abre la URL en **Chrome**
2. Verás un banner automático **"Instalar app"** → tócalo
3. O toca los **3 puntos** (⋮) → **"Instalar aplicación"**
4. ¡Listo! Aparece en tu pantalla de inicio 🎉

---

## PASO 4 — Instalar en Windows PC

1. Abre la URL en **Google Chrome** o **Microsoft Edge**
2. En la barra de direcciones verás un ícono de **instalar** (➕ o pantalla con flecha)
3. Click → **"Instalar"**
4. La app se abre como ventana independiente, sin barra del navegador
5. También aparece en el menú de inicio de Windows 🎉

---

## ✅ Resultado final
- La app funciona **sin internet** (datos en caché)
- Se actualiza **automáticamente** cuando subes cambios a GitHub
- Tiene ícono propio en pantalla de inicio
- Se ve y siente como app nativa

---

## ❓ ¿Problemas?
Si algo no funciona, verifica que en Netlify el build haya salido en verde ✅.
El log de build te dirá exactamente qué falla.
