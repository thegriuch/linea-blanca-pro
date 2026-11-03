# Línea Blanca Pro — Documentación general

Aplicación móvil de **diagnóstico técnico guiado** para electrodomésticos de línea blanca
(refrigeración, lavado y aire acondicionado). El técnico sigue un árbol de decisión,
registra mediciones y evidencia fotográfica, y al final la app genera un **reporte DOCX**
compartible con membrete.

- Versión de la app: `2.0.0` (`versionCode 2` en Android, build `1` en iOS)
- APK distribuido: `2.0.5`
- Identificador Android/iOS: `com.lineablancapro.app`
- Canal de actualizaciones OTA: `preview` (pruebas) y `production`
- Autoría: **área de soporte técnico de Kalley**

Todo el código vive en `artifacts/linea-blanca-pro` dentro de un monorepo pnpm.

---

## 1. Qué hace el programa

| Módulo | Para qué sirve |
|---|---|
| Diagnóstico guiado | Árbol de decisión por equipo y falla, con preguntas, acciones, mediciones y resultados ponderados |
| Evidencia fotográfica | Fotos obligatorias de voltaje y amperaje, más fotos en los pasos que el árbol marque |
| Reporte DOCX | Documento Word con datos del servicio, probabilidades, repuestos, códigos IRIS y una página por foto |
| Historial | Diagnósticos completados guardados en el teléfono, con búsqueda, reenvío y borrado |
| Buscador | Síntoma en lenguaje del técnico → causas ordenadas por probabilidad (estrellas) |
| Biblioteca técnica | Fichas de conceptos, componentes, herramientas, procedimientos y seguridad |
| Regla de refrigerantes | Conversión temperatura ↔ presión para R134a, R290, R32 y R600a |
| Tablas de sensores | Tabla NTC general, tabla T1–T4 de aire y tabla TP (descarga) usadas al medir sensores |

Volumen actual del contenido cargado en el código: **61 árboles de decisión con 581 nodos**,
**132 fallas/códigos en el selector**, **2.720 códigos IRIS**, **13 síntomas** en el buscador,
**31 artículos** de biblioteca en 5 categorías, **14 guías visuales** animadas y **4 refrigerantes**
con su tabla de saturación.

La app es **offline-first**: no necesita internet ni backend para diagnosticar, guardar ni
generar el reporte. La nube solo se usa para las actualizaciones OTA.

---

## 2. Requisitos

| Herramienta | Versión | Nota |
|---|---|---|
| Node.js | 20 o superior | el monorepo declara Node 24 |
| pnpm | 9 o superior | el proyecto fija `pnpm@11.17.0` |
| Git | cualquiera | |
| Expo Go (opcional) | última | para probar en el teléfono sin compilar |
| Cuenta Expo | — | solo para builds y OTA (`eas-cli`) |

---

## 3. Instalación

```bash
git clone https://github.com/thegriuch/linea-blanca-pro.git
cd linea-blanca-pro
pnpm install
```

Si pnpm muestra `ERR_PNPM_IGNORED_BUILDS`, autoriza únicamente `esbuild` y reinstala:

```bash
pnpm approve-builds esbuild
pnpm install
```

El proyecto ya trae `allowBuilds` configurado, así que una instalación limpia no debería pedirlo.

---

## 4. Ejecutar en desarrollo

Desde la raíz del monorepo:

```bash
pnpm --filter @workspace/linea-blanca-pro run dev
```

Aparece un código QR: se escanea con **Expo Go** en el teléfono (misma red WiFi).
En la carpeta `artifacts/linea-blanca-pro` también funcionan:

```bash
npx expo start            # servidor de desarrollo interactivo
npx expo start --web      # versión web
```

Validación de tipos (es la verificación mínima antes de publicar):

```bash
pnpm --filter @workspace/linea-blanca-pro run typecheck
```

El proyecto arrastra errores de tipos preexistentes dentro de `node_modules`; para revisar
solo los archivos propios se filtra la salida por ruta.

Compilar el bundle sin publicar (sirve para detectar imports roto o errores de sintaxis):

```bash
cd artifacts/linea-blanca-pro
npx expo export --platform android --output-dir /tmp/expo-export
npx expo export --platform web --output-dir /tmp/expo-export-web
```

Build estático y servidor de producción:

```bash
pnpm --filter @workspace/linea-blanca-pro run build   # genera static-build/
pnpm --filter @workspace/linea-blanca-pro run serve   # sirve static-build/ en el puerto de PORT
```

`scripts/build.js` lanza Metro, exporta la web a `static-build/` y termina;
`server/serve.js` sirve ese directorio y entrega el manifiesto de Expo cuando la petición
trae el encabezado `expo-platform`.

---

## 5. Compilar APK / AAB

Los perfiles están en `artifacts/linea-blanca-pro/eas.json`:

| Perfil | Salida | Canal | Uso |
|---|---|---|---|
| `development` | cliente de desarrollo | — | depuración con `expo-dev-client` |
| `preview` | **APK** instalable | `preview` | entrega a técnicos y pruebas |
| `production` | **AAB** para Google Play | `production` | tienda, con `autoIncrement` |

```bash
cd artifacts/linea-blanca-pro
npx eas-cli@latest build --profile preview --platform android
```

Build desde GitHub en expo.dev: conecta el repositorio, define **Base directory** como
`artifacts/linea-blanca-pro` y elige el perfil. La imagen `latest` ya está declarada.
**No cambies el `applicationId`** si vas a actualizar una app ya instalada: Android rechaza
la actualización y el usuario pierde los datos guardados.

La publicación en Google Play no se hace desde Replit; el flujo es Expo/EAS.

---

## 6. Actualizaciones FOTA (EAS Update)

La app revisa actualizaciones al arrancar (`hooks/useOTAUpdates.ts`), las descarga en segundo
plano y ofrece reiniciar; si el técnico elige "Después", se aplica en el siguiente arranque.
Configuración en `app.json`: `runtimeVersion` ligado a `appVersion`, `checkAutomatically: ON_LOAD`.

Publicar una actualización:

```bash
cd artifacts/linea-blanca-pro
npx eas-cli@latest update --branch preview -m "Descripción del cambio"
```

El comando devuelve un **Update group ID**: guárdalo, es lo que permite revertir con
`eas update:rollback` o volver a publicar un grupo anterior.

**Límite importante:** `expo-updates` descarta en silencio una actualización cuyo payload no
logra descargar. Las guías visuales originales pesaban ~125 MB (un solo GIF, 61 MB) y por eso
los teléfonos no recibían los cambios. `scripts/comprimir-guis.cjs` convierte los archivos
grandes a WebP animado (ancho máximo 640 px, calidad 55, mismos frames y velocidad) y
actualiza `constants/gifs.ts`. Si agregas guías nuevas, cómprímelas antes de publicar.

---

## 7. Cómo opera el programa (recorrido completo)

### 7.1 Inicio (`app/(tabs)/index.tsx`)

Saludo con el nombre del técnico guardado, estadísticas, accesos rápidos (nuevo diagnóstico,
buscar síntoma, biblioteca, historial, regla de refrigerantes, tablas de sensores), los tres
diagnósticos más recientes y, al final, los créditos del área de soporte técnico.

### 7.2 Nuevo diagnóstico (`app/diagnostico/nuevo.tsx`)

Paso 1 de 3 (`Datos · Equipo · Falla`). Se captura nombre del cliente (obligatorio), teléfono,
ciudad y técnico responsable, y se elige el tipo de equipo entre 10 opciones: nevera,
congelador, nevecón, minibar, lavadora, secadora, aire acondicionado, vitrina, dispensador de
agua y "otro producto que utiliza refrigeración". Al continuar se crea la sesión con id propio
y se pasa al paso 2.

### 7.3 Falla (`app/diagnostico/falla.tsx`)

Paso 3. Se registra marca, modelo (lista por tipo de equipo, con opción "Otro modelo") y número
de serie, y se elige la falla reportada. Cada falla apunta a un `treeId`; además existe la
entrada especial **Validación de código de error** (`fallaId: '__error__'`) que va directo a la
búsqueda de códigos sin pasar por el árbol.

### 7.4 Árbol guiado (`app/diagnostico/arbol.tsx`)

Es el corazón de la app. Antes de entrar al árbol se ejecutan etapas fijas:

| Etapa | Qué pide | Cuándo |
|---|---|---|
| 0 · Voltaje | Foto del multímetro en la toma, dentro del ±10 % del nominal | Siempre |
| 0b · Amperaje | Foto de la pinza comparada con el RLA de la placa | Siempre |
| 0c · Tecnología | ¿El equipo es Inverter? | Equipos con compresor (no lavadora/secadora) |
| 0d · Salida Inverter | Voltaje entre fases U, V, W de la tarjeta | Solo si es Inverter |
| 1 · Código de error | ¿Muestra código? → búsqueda y selección del código | Inverter o acceso directo por falla `__error__` |
| 2 · Árbol | Preguntas, acciones, mediciones y evidencias del árbol | Siempre |
| 3 · Evidencia final | Foto de la falla encontrada (opcional, se puede continuar sin foto) | Antes del informe |

Cada nodo se muestra según su tipo: **pregunta** (botones de respuesta, con color de riesgo),
**acción** (instrucción y botón continuar), **medición** (valor esperado), **evidencia**
(cámara o galería) y **resultado**. Los nodos pueden incluir `detail`, `tip`, guía visual
animada y botones contextuales para abrir la tabla del sensor NTC, la tabla T1–T4 de aire o la
tabla TP cuando el paso lo requiere.

Dos automatismos evitan preguntas redundantes:

- **Gates** (`gate` en el nodo): si la app ya sabe la respuesta (por ejemplo, ya se indicó que
  el equipo es Inverter), la pregunta se salta y avanza por la rama correcta.
- **Banderas de tabla**: `ntcTable`, `airSensorTable` y `tpTable` muestran el botón de consulta
  solo en los nodos que lo necesitan.

El botón "Atrás" retrocede un nodo y borra la respuesta registrada de ese nodo.

### 7.5 Conclusión (`app/diagnostico/conclusion.tsx`)

Muestra el resultado con barras de probabilidad, la recomendación técnica y los repuestos
sugeridos; cada repuesto se vincula a su **código IRIS** de la sublínea. El técnico ajusta la
conclusión escrita, los repuestos solicitados, el tiempo estimado, las observaciones y marca o
desmarca códigos IRIS sugeridos (por sublínea, por texto de la conclusión o por repuesto).

Al finalizar hay dos salidas: **Guardar y ver reporte** (va a la pantalla de resultado) o
**Finalizar e ir al inicio**. En ambos casos la sesión se marca como completada, se guarda en el
historial, se encola para sincronización y se conserva temporalmente para que la navegación no
redirija antes de tiempo.

### 7.6 Resultado y reporte (`app/diagnostico/resultado/[id].tsx`)

Resumen del servicio (cliente, equipo, código de error si existe, diagnóstico con
probabilidades, repuestos con IRIS, conclusión, evidencias). El botón de compartir genera el
**DOCX**; si el entorno no puede generarlo, `utils/share.ts` ofrece el reporte en texto plano.

### 7.7 Herramientas

- **Historial** (`app/(tabs)/historial.tsx`): lista de diagnósticos completados, búsqueda por
  cliente, marca, modelo, serie, falla o ciudad; reenviar el reporte y eliminar con confirmación.
- **Buscar** (`app/(tabs)/buscar.tsx`): 13 entradas de síntomas con palabras clave; cada
  resultado trae causa, probabilidad en estrellas y enlace al árbol o al artículo.
- **Biblioteca** (`app/(tabs)/biblioteca.tsx` y `app/biblioteca/*`): 5 categorías
  (`conceptos`, `componentes`, `herramientas`, `procedimientos`, `seguridad`) con 31 artículos;
  admite imagen o GIF con etiqueta, párrafos, viñetas y recomendación.
- **Regla de refrigerantes** (`app/refrigerantes/index.tsx`): convierte °C → presión o presión
  → °C para R134a, R290, R32 y R600a, en kPa, psi absoluto o psi manométrico.
- **Tablas de sensores** (`app/sensores-temperatura/index.tsx` y
  `app/sensores-temperatura-aire/index.tsx`): tabla NTC genérica (−50 a 75 °C), tabla T1–T4 de
  aire (−20 a 139 °C) y tabla TP de descarga (−20 a 130 °C), con selector entre ambas tablas de
  aire y acceso directo por `?tabla=tp`.

---

## 8. Modelo de datos y persistencia

`types/diagnostico.ts` define la sesión:

```ts
DiagnosticSession {
  id, startedAt, finishedAt?, tecnico,
  cliente   { nombre, telefono, direccion, ciudad },
  equipo    { tipo, marca, modelo, serie, fallaId, fallaLabel, treeId },
  path: string[],                  // nodos visitados en orden
  pathAnswers: Record<string,string>, // respuesta elegida por nodo
  evidence: Evidence[],            // uri, nodeId, nodeText, createdAt
  currentNodeId, completed,
  conclusion { diagnostico, repuestos, tiempoEstimado, observaciones, codigosIris },
  errorCode?,                      // código de error seleccionado
  result?  { causes[], recommendation, parts[] }
}
```

Claves de `AsyncStorage` (`contexts/DiagnosticoContext.tsx`):

| Clave | Contenido |
|---|---|
| `@lbpro_sessions_v2` | historial de sesiones completadas |
| `@lbpro_tecnico_v2` | nombre del técnico |
| `@lbpro_current_session_v2` | sesión en curso (guardado con retardo de 300 ms) |
| `@lbpro_draft_v2` | borrador |
| `@lbpro_sync_queue_v2` | cola de sincronización pendiente |

`normalizeSession()` repara sesiones guardadas por versiones anteriores (campos nuevos como
`codigosIris` ausentes, evidencias sin `diagnosticId`, etc.) antes de usarlas; sin esa
normalización la pantalla de probabilidades se rompía con datos antiguos.

`utils/sync.ts` mantiene una cola offline: al completar un diagnóstico se encola y
`syncToCloud()` hoy solo informa cuántos quedan pendientes. Es el punto de extensión previsto
para un endpoint autenticado, sin tocar el flujo de diagnóstico.

---

## 9. Árboles de decisión

### Formato del nodo

```ts
{
  id: 'medir_ntc',
  type: 'measure',                  // question | action | measure | evidence | result
  text: 'Medir el sensor NTC del evaporador',
  detail: 'Valor esperado a 25 °C: 10 kΩ.',
  tip: 'Mide con el equipo desconectado.',
  evidenceLabel: 'Foto del multímetro en el sensor',
  gifUri: 'medir-capacitor',        // clave de constants/gifs.ts
  ntcTable: true,                   // muestra el botón de la tabla NTC
  airSensorTable: true,             // muestra el botón de la tabla T1–T4
  tpTable: true,                    // muestra el botón de la tabla TP
  nextId: 'siguiente_nodo',         // nodos lineales
  options: [                        // solo en preguntas
    { label: 'Sí', nextId: 'rama_si', color: 'success' },
    { label: 'No', nextId: 'rama_no', color: 'danger' },
  ],
  gate: 'Sí,',                      // salta la pregunta si la app ya conoce la respuesta
  result: { causes: [{ cause, probability, action }], recommendation, parts },
}
```

### Dónde vive cada árbol

| Archivo | Contenido |
|---|---|
| `constants/arboles_comunes.ts` | síntomas genéricos compartidos (`noenciende`, etc.) |
| `constants/arboles_nevera.ts` | refrigeración doméstica + `NEVERA_CODE_TREES` |
| `constants/aires_arboles.ts` | aire acondicionado + `AIR_ERROR_TREES` |
| `constants/arbol_inverter.ts` | módulo Inverter (flashes del congelador) |
| `constants/arboles_lavadora.ts` | lavadora/secadora + `LAVADORA_SILENT_TREES` |
| `constants/arboles_codigos_lavadora.ts` | árboles por código de error de lavadora |
| `constants/arboles_index.ts` | registro único `DECISION_TREES` + `getTree` / `getNode` |

### Agregar un árbol

1. Escribe el árbol en el archivo del producto, con un nodo `start`.
2. Regístralo en `DECISION_TREES` (`constants/arboles_index.ts`).
3. Agrega la falla que lo abre en `constants/fallas.ts` (`{ id, label, treeId, icon }`).
4. Verifica que todos los `nextId` existan (ver sección 15).

`getNode()` cae al nodo `start` del árbol cuando el id no existe, así que un `nextId` roto no
rompe la app pero sí deja al técnico en un bucle: por eso el validador es obligatorio.

---

## 10. Códigos de error e IRIS

- `constants/codigos_error.ts`: catálogo por tipo de equipo con `codigo`, `equivalentes`,
  `descripcion`, `causas`, `solucion` y `partes`. Los códigos de aire vienen del manual en
  `constants/codigos_aire_manual.ts`.
- `constants/codigos_arboles.ts`: enlaza cada código con su árbol dedicado mediante
  `getCodigoTreeId(tipo, codigo)`; para aire, `getAirErrorTreeId(codigo)`.
- `constants/iris_codigos.json` + `constants/iris.ts`: 2.720 códigos IRIS (`CI-XXXX`) con falla,
  falla principal, repuesto y sublínea. `sugerirCodigosIris()`, `getIrisParaRepuesto()` y
  `getIrisGenerico()` resuelven qué código corresponde al equipo y al repuesto.

---

## 11. Tablas de sensores y refrigerantes

| Tabla | Archivo | Rango | Origen |
|---|---|---|---|
| NTC general | `constants/sensores_ntc.ts` | −50 a 75 °C, paso 0,5 | ecuación beta con −18 °C = 16,9 kΩ y B = 3771 K (manual Kalley) |
| Aire T1–T4 | `constants/sensores-aire-tabla.ts` | −20 a 139 °C | manual, 160 filas |
| Aire TP (descarga) | `constants/sensores-aire-tabla.ts` | −20 a 130 °C | manual, 151 filas (el manual no trae kΩ desde 131 °C) |

Las dos tablas de aire se generan, no se editan a mano:

```bash
node scripts/sensores-aire-tabla.cjs     # datos de origen del manual
node scripts/sensores-tp-tabla.cjs
node scripts/generar-tabla-aire-ts.cjs   # escribe constants/sensores-aire-tabla.ts
```

`utils/refrigeranteCalc.ts` interpola las tablas de saturación de `constants/refrigerantes.ts`
y convierte entre kPa, psi absoluto y psi manométrico (presión atmosférica 14,696 psia).

---

## 12. Reporte DOCX

`utils/share.ts` arma el documento con la librería `docx`:

- **Membrete** en todas las páginas: icono de la app (42 × 42 pt) y el texto
  `LÍNEA BLANCA PRO · REPORTE TÉCNICO`.
- **Pie de página**: `Línea Blanca Pro · Documento generado desde el diagnóstico técnico`.
- Secciones: información del servicio, cliente, equipo (con código de error si existe),
  diagnóstico con probabilidades, recomendación, repuestos con código IRIS, conclusión técnica,
  repuestos solicitados, tiempo estimado, observaciones y códigos IRIS con su repuesto a cambiar.
- Una **página por evidencia**, con título `Imagen N: …` y la fecha de captura.

El icono del membrete no se lee del sistema de archivos porque Android puede resolverlo como
recurso drawable (`assets_images_icon`) en lugar de un archivo legible. Por eso va embebido como
data URI en `utils/letterheadIcon.ts`, que se regenera desde `assets/images/icon.png`:

```bash
node scripts/generar-icono-membrete.cjs
```

Ese archivo es generado (PNG 256 × 256 completo). **No se edita a mano:** un base64 cortado
produce exactamente el síntoma de "icono distorsionado" en el reporte compartido.

---

## 13. Estructura de carpetas

```text
linea-blanca-pro/                 monorepo pnpm
├── README.md                     este documento
└── artifacts/linea-blanca-pro/   app Expo
    ├── app/                      rutas de Expo Router
    │   ├── (tabs)/               Inicio, Diagnóstico, Historial, Biblioteca, Buscar
    │   ├── diagnostico/          nuevo → falla → arbol → conclusion → resultado/[id]
    │   ├── biblioteca/           categoría y artículo
    │   ├── refrigerantes/        regla de refrigerantes
    │   └── sensores-temperatura*/ tablas NTC, aire T1–T4 y TP
    ├── components/               UI reutilizable (botones, barras, campos, pie de app)
    ├── constants/                árboles, fallas, códigos, IRIS, tablas, biblioteca
    ├── contexts/                 DiagnosticoContext (estado y persistencia)
    ├── hooks/                    tema y actualizaciones OTA
    ├── types/                    tipos del dominio
    ├── utils/                    reporte DOCX, refrigerantes, cola de sync
    ├── assets/images/            icono, splash y guías visuales
    ├── android/                  proyecto nativo (prebuild)
    ├── scripts/                  generadores y validadores
    ├── docs/                     logo de marca (SVG)
    ├── app.json                  metadatos, permisos y OTA
    ├── eas.json                  perfiles de build
    └── server/                   servidor estático del build web
```

---

## 14. Scripts de mantenimiento

| Script | Para qué |
|---|---|
| `scripts/validar-arboles.ts` + `scripts/ejecutar-validador.cjs` | comprueba que cada `nextId` y `option.nextId` apunte a un nodo existente y que cada árbol tenga `start` |
| `scripts/comprimir-guis.cjs` | convierte las guías pesadas a WebP animado para que la OTA sea descargable |
| `scripts/generar-tabla-aire-ts.cjs` | genera las tablas T1–T4 y TP desde los datos del manual |
| `scripts/generar-icono-membrete.cjs` | regenera el icono embebido del membrete DOCX |
| `scripts/build.js` | exporta la web a `static-build/` |
| `server/serve.js` | sirve `static-build/` con manifiesto de Expo y landing page |

El validador compila primero las constantes TypeScript a
`.tmp-validar/` y resuelve el alias `@/` desde ahí. `.tmp-validar/` es descartable.

---

## 15. Verificación antes de publicar

1. `pnpm --filter @workspace/linea-blanca-pro run typecheck` sin errores nuevos en archivos
   propios.
2. `npx expo export --platform android --output-dir <carpeta temporal>` termina con código 0.
3. Si se tocaron árboles: `node scripts/ejecutar-validador.cjs` sin referencias rotas.
4. Si se tocó el reporte: generar un DOCX de prueba y revisar el membrete y las imágenes.
5. Si se actualizó contenido: publicar con `eas update` en el canal `preview` y probar en un
   teléfono real antes de mover a `production`.

---

## 16. Problemas conocidos y reglas del proyecto

- **Icono del reporte distorsionado**: causado por un base64 truncado en
  `utils/letterheadIcon.ts`. Regenerar con el script; nunca editarlo a mano.
- **OTA que no llega**: payload demasiado grande. Comprimir las guías con
  `scripts/comprimir-guis.cjs` antes de publicar.
- **Datos viejos que rompen pantallas**: cualquier campo nuevo de la sesión debe pasar por
  `normalizeSession()` en `contexts/DiagnosticoContext.tsx`.
- **Sesiones que se mezclan**: “Nuevo diagnóstico” descarta la sesión anterior y crea un id
  nuevo; no reutilizar `currentSession` entre diagnósticos.
- **No cambiar el `applicationId`** ni `versionCode` a la baja si la app ya está instalada.
- **Estilo**: textos de la app sin emojis; los colores corporativos de Kalley (`#000B8C`,
  `#FFC629`) se usan solo en los documentos y reportes, la interfaz mantiene su paleta azul
  (`#145DA0`) y naranja (`#F5821F`).
- **Tablas del manual**: se generan desde datos de origen con script; no se transcriben a mano.
- **Sin backend**: si en el futuro se agrega sincronización, el punto de entrada es
  `utils/sync.ts`, sin tocar el flujo de diagnóstico.

---

## 17. Autoría

Desarrollado por el **área de soporte técnico de Kalley**.
Uso interno / privado. Todos los derechos reservados.
