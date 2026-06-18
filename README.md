# Ventaneros Frontend

React app (built with Vite) for the Ventaneros window/door management system.

## Estructura

```
src/
  App.jsx       Toda la aplicación (calculadoras, clientes, facturas, etc.)
  main.jsx      Punto de entrada de React
index.html      HTML base
vite.config.js  Configuración de Vite
```

## Probar localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## Desplegar en Vercel

1. Sube esta carpeta a un repositorio de GitHub (igual que hiciste con el backend)
2. Ve a [vercel.com](https://vercel.com) → Login con GitHub
3. **Add New** → **Project**
4. Selecciona el repositorio `ventaneros-frontend`
5. Vercel detecta automáticamente que es un proyecto Vite — no necesitas cambiar nada
6. Click **Deploy**
7. En 1-2 minutos obtienes una URL real como `https://ventaneros-frontend.vercel.app`

## Conectar con el backend

Una vez desplegado, copia la URL de Vercel y actualiza `ALLOWED_ORIGINS` en Railway
(Settings del backend → Variables) para que sea exactamente esa URL en vez de `*`.

Esto asegura que solo tu frontend real pueda llamar a tu API — no cualquier sitio
en internet.
