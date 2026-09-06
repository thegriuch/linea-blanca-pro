# Cómo modificar y ampliar la biblioteca técnica

La biblioteca de Línea Blanca Pro está definida en:

```text
artifacts/linea-blanca-pro/constants/componentes.ts
```

Los recursos visuales locales se registran en:

```text
artifacts/linea-blanca-pro/constants/gifs.ts
artifacts/linea-blanca-pro/assets/images/gifs/
```

## 1. Agregar una imagen o GIF nuevo

1. Copia el archivo dentro de `assets/images/gifs/`.
2. Usa un nombre corto, descriptivo y en minúsculas. Ejemplo:
   `medir-capacitor.gif`.
3. Abre `constants/gifs.ts`.
4. Agrega un registro dentro del arreglo `GIFS`:

```ts
{
  key: 'medir-capacitor',
  uri: require('@/assets/images/gifs/medir-capacitor.gif'),
  label: 'Medir capacitor con multímetro',
},
```

5. Verifica que el `key` sea único.
6. Si el recurso corresponde a una validación del árbol, asígnalo en
   `constants/arboles.ts`:

```ts
{
  id: 'medir_capacitor',
  type: 'measure',
  text: 'Medir capacitor',
  detail: 'Comprueba la capacitancia con el equipo desconectado.',
  gifUri: 'medir-capacitor',
  nextId: 'siguiente_paso',
}
```

El paso de diagnóstico mostrará automáticamente la sección **Guía visual**,
con las opciones de ocultar, mostrar y ampliar el GIF.

## 2. Agregar un artículo nuevo

1. Abre `constants/componentes.ts`.
2. Busca la categoría correcta dentro de `LIBRARY_CATEGORIES`.
3. Agrega un objeto con un `id` único:

```ts
{
  id: 'medir-capacitor',
  title: 'Cómo medir un capacitor',
  summary: 'Prueba rápida para confirmar la capacidad del componente.',
  image: GIF_MAP['medir-capacitor'],
  imageLabel: 'Medición de capacitancia con multímetro',
  body: [
    'Desconecta el equipo y descarga el capacitor antes de medir.',
    'Selecciona la escala de capacitancia y conecta las puntas.',
  ],
  bullets: [
    'Compara la lectura con el valor indicado en la etiqueta.',
    'Reemplaza el componente si la lectura es inestable o está fuera de rango.',
  ],
  tip: 'Nunca midas capacitancia con el equipo energizado.',
}
```

### Campos disponibles

- `id`: identificador único usado para abrir el artículo.
- `title`: título que ve el técnico.
- `summary`: descripción corta que aparece en la categoría.
- `image`: recurso local opcional. Normalmente se obtiene de
  `GIF_MAP['clave-del-gif']`.
- `imageLabel`: texto descriptivo debajo de la ilustración.
- `body`: lista de párrafos principales.
- `bullets`: lista opcional de puntos destacados.
- `tip`: recomendación técnica opcional.

Si un artículo no tiene imagen, la pantalla seguirá funcionando y simplemente no
mostrará el bloque de ilustración.

## 3. Modificar un artículo existente

1. Busca el artículo por su `id`.
2. Modifica únicamente el campo que necesites:
   - `title` para el nombre.
   - `summary` para el resumen.
   - `body` para el contenido principal.
   - `bullets` para valores o pasos destacados.
   - `tip` para una advertencia o recomendación.
   - `image` e `imageLabel` para cambiar la ilustración.
3. Conserva el `id` si el artículo ya está publicado o enlazado desde el
   buscador. Cambiarlo puede romper enlaces internos.

## 4. Recomendaciones para imágenes

- Prefiere recursos locales para que la biblioteca funcione sin conexión.
- Mantén el formato GIF para instrucciones animadas y PNG/JPG para diagramas o
  imágenes estáticas.
- Evita agregar imágenes innecesariamente grandes. La pantalla de artículo
  carga una ilustración por vez, pero los archivos siguen aumentando el tamaño
  del bundle.
- La ilustración debe corresponder directamente al tema del artículo.
- Usa `imageLabel` para explicar qué debe observar el técnico.

## 5. Verificar los cambios

Desde la raíz del proyecto:

```bash
pnpm --filter @workspace/linea-blanca-pro run typecheck
```

Para revisar el bundle web:

```bash
cd artifacts/linea-blanca-pro
pnpm exec expo export --platform web --output-dir /tmp/linea-blanca-pro-library-export
```

Finalmente, abre la app, entra a **Biblioteca**, selecciona la categoría y
confirma que:

1. El artículo aparece en la lista.
2. La ilustración corresponde al tema.
3. El GIF se reproduce si es animado.
4. El contenido, viñetas y tip se muestran correctamente.
