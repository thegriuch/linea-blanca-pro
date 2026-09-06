/** Symptom-based search data for ranked diagnostic results */

export interface SymptomResult {
  cause: string;
  stars: number; // 1–5
  detail: string;
  treeId?: string;
  articleId?: string;
}

export interface SymptomEntry {
  keywords: string[];
  results: SymptomResult[];
}

export const SYMPTOM_DATABASE: SymptomEntry[] = [
  {
    keywords: ['no enfria', 'no fría', 'no congela', 'caliente', 'pierde frio'],
    results: [
      { cause: 'Baja carga de refrigerante (fuga)', stars: 5, detail: 'La causa más frecuente cuando el compresor funciona pero no enfría.', treeId: 'noenfria' },
      { cause: 'Condensador sucio', stars: 4, detail: 'Impide la disipación de calor. Limpia el condensador antes de otros diagnósticos.', articleId: 'condensador' },
      { cause: 'Capilar obstruido', stars: 4, detail: 'Bloquea el flujo de refrigerante. Requiere barrido con nitrógeno.', treeId: 'noenfria' },
      { cause: 'Compresor débil o desgastado', stars: 3, detail: 'El compresor funciona pero no comprime suficiente.', treeId: 'noarranque' },
      { cause: 'Termostato defectuoso', stars: 3, detail: 'No ordena el arranque del compresor.', articleId: 'que-es-refrigeracion' },
      { cause: 'Ventilador del evaporador falla', stars: 2, detail: 'En No Frost, sin ventilador no circula el frío.', articleId: 'evaporador' },
    ],
  },
  {
    keywords: ['compresor no arranca', 'no arranca', 'no prende compresor', 'zumba', 'protege'],
    results: [
      { cause: 'Kit PTC defectuoso', stars: 5, detail: 'El relé de arranque más común en fallas de no arranque.', treeId: 'noarranque' },
      { cause: 'Condensador sucio (sobrecalentamiento)', stars: 4, detail: 'El compresor se protege porque no puede disipar calor.', articleId: 'condensador' },
      { cause: 'Compresor con bobina abierta', stars: 4, detail: 'Devanado roto — requiere reemplazo.', treeId: 'noarranque' },
      { cause: 'Protector térmico activado', stars: 3, detail: 'Puede resetear al enfriarse si el problema es sobrecalentamiento.', articleId: 'kit-ptc' },
      { cause: 'Tensión eléctrica baja', stars: 3, detail: 'Voltaje por debajo del nominal impide el arranque.', articleId: 'electricidad-basica' },
    ],
  },
  {
    keywords: ['hace ruido', 'ruido', 'sonido', 'vibra', 'retumba', 'golpetea'],
    results: [
      { cause: 'Compresor mal asegurado', stars: 5, detail: 'Soportes de goma desgastados transmiten vibración.', treeId: 'ruidoexcesivo' },
      { cause: 'Ventilador rozando con escarcha', stars: 4, detail: 'En No Frost, escarcha acumulada toca las aspas.', treeId: 'ruidoexcesivo' },
      { cause: 'Desgaste mecánico del compresor', stars: 4, detail: 'Ruido metálico interno, puede acompañar alto amperaje.', treeId: 'noarranque' },
      { cause: 'Rodamiento del motor de ventilador', stars: 3, detail: 'Zumbido continuo del ventilador.', articleId: 'evaporador' },
      { cause: 'Burbujeo de refrigerante (normal)', stars: 2, detail: 'El sonido de burbujeo al inicio del ciclo es normal.', articleId: 'que-es-refrigeracion' },
    ],
  },
  {
    keywords: ['no centrifuga', 'no exprime', 'no saca agua', 'lavadora no gira', 'tambor no gira'],
    results: [
      { cause: 'Interruptor de tapa defectuoso', stars: 5, detail: 'El switch de seguridad de tapa es la causa más frecuente.', treeId: 'nocentrifuga' },
      { cause: 'Correa de transmisión rota', stars: 5, detail: 'Falla visible y de fácil diagnóstico.', treeId: 'nocentrifuga' },
      { cause: 'Motor dañado', stars: 3, detail: 'Requiere medir bobinas del motor.', treeId: 'nocentrifuga' },
      { cause: 'Capacitor del motor defectuoso', stars: 3, detail: 'El motor arranca lento o no arranca.', articleId: 'electricidad-basica' },
      { cause: 'Módulo de control sin señal', stars: 2, detail: 'La tarjeta no envía la señal de centrifugado.', treeId: 'nocentrifuga' },
    ],
  },
  {
    keywords: ['no desagua', 'no bota agua', 'agua adentro', 'no drena'],
    results: [
      { cause: 'Filtro de bomba obstruido', stars: 5, detail: 'El filtro de drenaje tapado es la causa más común.', treeId: 'nodesagua' },
      { cause: 'Bomba de drenaje dañada', stars: 4, detail: 'El impulsor no gira. Mide continuidad y voltaje.', treeId: 'nodesagua' },
      { cause: 'Manguera de drenaje doblada o tapada', stars: 4, detail: 'Verificar que la manguera no esté bloqueada.', treeId: 'nodesagua' },
      { cause: 'Módulo de control no activa drenaje', stars: 2, detail: 'Sin señal a la bomba en el ciclo de drenaje.', treeId: 'nodesagua' },
    ],
  },
  {
    keywords: ['fuga agua', 'gotea agua', 'derrama agua', 'agua en el piso', 'agua debajo'],
    results: [
      { cause: 'Drenaje de descongelamiento tapado', stars: 5, detail: 'El canal de drenaje del evaporador bloqueado. Limpieza simple.', treeId: 'fuga_agua' },
      { cause: 'Manguera de entrada con grieta', stars: 4, detail: 'Inspeccionar visualmente todas las mangueras.', treeId: 'fuga_agua' },
      { cause: 'Empaque de puerta defectuoso', stars: 3, detail: 'Permite entrada de aire húmedo que condensa.', treeId: 'fuga_agua' },
      { cause: 'Bandeja colectora desbordada', stars: 3, detail: 'Limpiar bandeja del compresor.', treeId: 'fuga_agua' },
    ],
  },
  {
    keywords: ['no llena', 'no toma agua', 'sin agua', 'no entra agua'],
    results: [
      { cause: 'Electroválvula de entrada bloqueada', stars: 5, detail: 'Sedimento o membrana dañada. Limpiar o reemplazar.', treeId: 'nollena' },
      { cause: 'Presión de agua insuficiente', stars: 4, detail: 'La red debe suministrar mínimo 0.5 bar.', treeId: 'nollena' },
      { cause: 'Filtro de manguera de entrada tapado', stars: 4, detail: 'Malla en la entrada de la electroválvula. Limpiar.', treeId: 'nollena' },
      { cause: 'Módulo de control sin señal a electroválvula', stars: 3, detail: 'Verificar voltaje a la electroválvula en ciclo de llenado.', treeId: 'nollena' },
    ],
  },
  {
    keywords: ['error electronico', 'error pantalla', 'codigo error', 'display error', 'e1', 'e2', 'er', 'f1', 'f2'],
    results: [
      { cause: 'Sensor NTC de temperatura defectuoso', stars: 5, detail: 'La causa más común de errores de sensor.', treeId: 'errorelectronico' },
      { cause: 'Conector del sensor flojo o corroído', stars: 4, detail: 'Verificar conexiones antes de reemplazar el sensor.', treeId: 'errorelectronico' },
      { cause: 'Tarjeta de control dañada', stars: 3, detail: 'Verificar alimentación de la tarjeta antes de diagnosticarla como mala.', treeId: 'errorelectronico' },
      { cause: 'Error de comunicación entre tarjetas', stars: 2, detail: 'Cable de comunicación dañado o suelto.', treeId: 'errorelectronico' },
    ],
  },
  {
    keywords: ['escarcha', 'hielo', 'escarcha excesiva', 'mucho hielo', 'congela todo'],
    results: [
      { cause: 'Resistencia de descongelamiento abierta', stars: 5, detail: 'No-Frost: la resistencia calefactora falla y no deshiela.', treeId: 'escarcha' },
      { cause: 'Empaque de puerta deteriorado', stars: 5, detail: 'Entra aire húmedo que forma escarcha en el evaporador.', treeId: 'escarcha' },
      { cause: 'Termostato de deshielo defectuoso', stars: 4, detail: 'No activa el ciclo de deshielo.', treeId: 'escarcha' },
      { cause: 'Temporizador de deshielo dañado', stars: 3, detail: 'No inicia el ciclo de deshielo en el tiempo programado.', treeId: 'escarcha' },
    ],
  },
  {
    keywords: ['no enciende', 'sin luz', 'apagado', 'no funciona nada', 'muerto'],
    results: [
      { cause: 'Fusible interno fundido', stars: 5, detail: 'Verificar y reemplazar el fusible.', treeId: 'noenciende' },
      { cause: 'Cable de poder o clavija dañada', stars: 5, detail: 'Inspección visual y continuidad del cable.', treeId: 'noenciende' },
      { cause: 'Sin voltaje en toma eléctrica', stars: 4, detail: 'Verificar con otro equipo o multímetro.', treeId: 'noenciende' },
      { cause: 'Tarjeta de control dañada', stars: 3, detail: 'Si hay voltaje pero no reacciona.', treeId: 'noenciende' },
    ],
  },
  {
    keywords: ['congela mucho', 'muy frio', 'se congela la comida', 'descongela alimentos', 'congela abajo'],
    results: [
      { cause: 'Termostato pegado (contactos cerrados siempre)', stars: 5, detail: 'El termostato no corta y el compresor corre siempre.', treeId: 'congelamucho' },
      { cause: 'Sensor NTC en corto (lee temperatura alta falsa)', stars: 4, detail: 'El sistema cree que hace más calor del que hace.', treeId: 'errorelectronico' },
      { cause: 'Temperatura seleccionada muy fría', stars: 4, detail: 'Ajustar la temperatura del termostato.', treeId: 'congelamucho' },
      { cause: 'Damper de aire dañado (flujo excesivo al frío)', stars: 2, detail: 'En nevecones, el damper controla el flujo de frío al refrigerador.', treeId: 'congelamucho' },
    ],
  },
  {
    keywords: ['ac no enfria', 'aire no enfria', 'aire caliente', 'mini split falla'],
    results: [
      { cause: 'Filtros de aire sucios', stars: 5, detail: 'Limpiar filtros antes de cualquier otro diagnóstico.', treeId: 'noenfria_aire' },
      { cause: 'Baja carga de refrigerante (fuga)', stars: 5, detail: 'El AC necesita carga correcta para enfriar.', treeId: 'noenfria_aire' },
      { cause: 'Condensador exterior sucio', stars: 4, detail: 'Limpiar con agua a presión desde adentro hacia afuera.', treeId: 'noenfria_aire' },
      { cause: 'Capacitor del compresor defectuoso', stars: 3, detail: 'El compresor no arranca correctamente.', treeId: 'noenfria_aire' },
    ],
  },
];

export function searchSintomas(query: string): { entry: SymptomEntry; score: number }[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return SYMPTOM_DATABASE
    .map((entry) => {
      const score = entry.keywords.reduce((acc, kw) => {
        const normalized = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (q.includes(normalized) || normalized.includes(q)) return acc + 2;
        const words = q.split(' ');
        const kwWords = normalized.split(' ');
        const matches = words.filter((w) => kwWords.some((k) => k.includes(w) || w.includes(k)));
        return acc + matches.length;
      }, 0);
      return { entry, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
