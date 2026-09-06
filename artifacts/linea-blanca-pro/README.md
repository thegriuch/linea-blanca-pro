# Línea Blanca Pro 📱

**Plataforma de diagnóstico técnico guiado para técnicos de electrodomésticos.**

v2.0 · Expo SDK · React Native · TypeScript

---

##  Ejecutar en VS Code (desarrollo)

### Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 9+ | `npm install -g pnpm` |
| Git | cualquiera | https://git-scm.com |

### Pasos

```bash
# 1. Clona el repositorio (raíz del monorepo)
git clone https://github.com/thegriuch/linea-blanca-pro.git
cd linea-blanca-pro

# 2. Instala dependencias desde la raíz
pnpm install

# 3. Inicia el servidor de desarrollo de la app
pnpm --filter @workspace/linea-blanca-pro run dev
```

Aparecerá un **código QR** en la terminal.

### Si pnpm muestra `ERR_PNPM_IGNORED_BUILDS`

En pnpm 11, si una instalación anterior dejó los scripts nativos pendientes,
autoriza únicamente `esbuild` y vuelve a instalar:

```powershell
pnpm approve-builds esbuild
pnpm install
pnpm --filter @workspace/linea-blanca-pro run dev
```

El proyecto ya incluye la configuración `allowBuilds` para que las instalaciones
nuevas permitan `esbuild` automáticamente.

### Instalar en Android (desarrollo)

1. Instala **Expo Go** en tu Android: [play.google.com/store/apps/details?id=host.exp.exponent](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Abre Expo Go → **Escanea el QR** de la terminal
3. La app carga directamente en tu celular ✅

> El celular y la computadora deben estar en la **misma red WiFi**.

---

## 📦 Build de producción para descargar

La configuración nativa ya incluye identificadores estables para Android/iOS y
el perfil `preview` de `eas.json` está configurado como APK instalable. En
Replit, usa **Publish / Expo Launch** cuando quieras generar y publicar la
versión de iOS. Expo Launch maneja el proceso de producción y el envío a App
Store.

La publicación de Android en Google Play no está disponible actualmente dentro
de Replit. Si el equipo usa un flujo externo de Expo para Android, el perfil
`preview` produce un APK instalable y el perfil `production` produce un
Android App Bundle. El enlace de descarga lo entrega el servicio de build de
Expo al terminar.

Para probar sin build nativo, usa el QR de **Preview on your phone** y Expo Go.

### Build nativo desde Expo.dev

Este proyecto es un monorepo y la app Expo está dentro de
`artifacts/linea-blanca-pro`. Para usar el build desde GitHub en Expo.dev:

1. Sube la carpeta raíz del proyecto a un repositorio de GitHub.
2. En Expo.dev crea o abre el proyecto `linea-blanca-pro`.
3. En **GitHub settings**, instala la aplicación de Expo y conecta el
   repositorio.
4. Configura **Base directory** como
   `artifacts/linea-blanca-pro`.
5. En **Builds**, pulsa **Build from GitHub**.
6. Selecciona la rama, la plataforma y el perfil:
   - `preview` → APK Android instalable para pruebas.
   - `production` → AAB Android para Google Play.
7. En el primer build de Android, permite que Expo cree las credenciales
   administradas si la aplicación aún no está publicada.

El archivo `eas.json` ya declara la imagen `latest` necesaria para builds desde
GitHub. El identificador Android es `com.lineablancapro.app`; no lo modifiques
si vas a actualizar una aplicación existente.

---

## Estructura del proyecto

```
linea-blanca-pro/          ← este repositorio (monorepo pnpm)
├── artifacts/
│   └── linea-blanca-pro/  ← app Expo
│       ├── app/           ← pantallas (Expo Router)
│       │   ├── (tabs)/    ← Inicio, Diagnóstico, Historial, Biblioteca, Buscar
│       │   └── diagnostico/ ← flujo de diagnóstico guiado
│       ├── components/    ← componentes UI reutilizables
│       ├── constants/     ← árboles de decisión, fallas, equipos
│       ├── contexts/      ← estado global (AsyncStorage)
│       ├── types/         ← tipos TypeScript
│       ├── utils/         ← generador de reportes + compartir
│       ├── app.json       ← configuración Expo
│       └── eas.json       ← configuración de builds
├── pnpm-workspace.yaml
└── package.json
```

---

##  Funcionalidades

- **Diagnóstico guiado** por árbol de decisión (12 fallas distintas)
- **Captura de evidencia fotográfica** en pasos clave
- **Historial persistente** de diagnósticos anteriores
- **Generación y compartir de reportes** en `.docx` con fotos de evidencia,
  título por imagen y membrete con el icono en todas las páginas
- **Biblioteca técnica** con fichas de componentes
- **Buscador de síntomas** con clasificación por probabilidad

---

## Tecnologías

- [Expo SDK](https://expo.dev) + [Expo Router](https://expo.github.io/router)
- React Native + TypeScript
- AsyncStorage (persistencia local, sin backend)
- expo-image-picker, expo-sharing, expo-file-system, expo-asset, docx

---

##  Licencia

Uso interno / privado. Todos los derechos reservados al area de soporte tecnico
