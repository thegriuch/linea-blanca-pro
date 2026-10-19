"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIR_ERROR_TREES = exports.NOENFRIA_AIRE = void 0;
exports.getAirErrorTreeId = getAirErrorTreeId;
const arbol_inverter_1 = require("@/constants/arbol_inverter");
// ══════════════════════════════════════════════════════════════════════════
// Árbol base de aire acondicionado por síntoma "No enfría" (migrado).
// ══════════════════════════════════════════════════════════════════════════
exports.NOENFRIA_AIRE = {
    start: {
        id: 'start', type: 'question',
        text: '¿El compresor de la unidad exterior arranca y funciona?',
        options: [
            { label: 'No, no arranca', nextId: 'noarranque_aire', color: 'danger' },
            { label: 'Sí, está funcionando', nextId: 'ev_presiones_aire', color: 'success' },
        ],
    },
    noarranque_aire: {
        id: 'noarranque_aire', type: 'measure',
        text: 'Verificar voltaje y continuidad del compresor',
        detail: 'Mide voltaje en terminales del compresor de la unidad exterior. Verifica bobinas del compresor sin continuidad a tierra.',
        nextId: 'result_noarranque_aire',
    },
    result_noarranque_aire: {
        id: 'result_noarranque_aire', type: 'result',
        text: 'Compresor de AC no arranca',
        result: {
            causes: [
                { cause: 'Capacitor del compresor defectuoso', probability: 45 },
                { cause: 'Compresor con devanado abierto o en corto', probability: 35 },
                { cause: 'Tarjeta de control exterior sin señal', probability: 20 },
            ],
            recommendation: 'Medir capacitor (debe dar valor nominal en µF). Medir bobinas del compresor. Verificar señal de la tarjeta al compresor.',
            parts: ['Capacitor de compresor', 'Compresor', 'Tarjeta exterior'],
        },
    },
    ev_presiones_aire: {
        id: 'ev_presiones_aire', type: 'evidence',
        text: 'Medir y registrar presiones del sistema AC',
        evidenceLabel: 'Foto de manómetros en el AC',
        nextId: 'gate_inverter_aire',
    },
    gate_inverter_aire: {
        gate: 'inverter_si',
        id: 'gate_inverter_aire', type: 'question',
        text: '¿El compresor del equipo es tecnología Inverter?',
        detail: 'La mayoría de los aires acondicionados modernos son inverter. Los compresores Inverter no usan capacitor de arranque ni relé: los alimenta un módulo driver (tarjeta inverter).',
        tip: 'Indicios de Inverter: módulo electrónico grande en la unidad exterior, sin capacitor de compresor visible y frecuencia variable audible al operar.',
        options: [
            { label: 'Sí, es tecnología Inverter', nextId: 'inv_start', color: 'neutral' },
            { label: 'No, es compresor convencional (on/off)', nextId: 'presion_baja_aire', color: 'success' },
        ],
    },
    presion_baja_aire: {
        id: 'presion_baja_aire', type: 'question',
        text: '¿La presión de baja es muy baja (por debajo del rango normal)?',
        detail: 'R22: baja normal ≈ 65–80 psi en marcha. R410A: baja normal ≈ 100–130 psi. R32: similar a R410A. Valores muy bajos indican baja carga.',
        options: [
            { label: 'Sí, presión de baja muy baja', nextId: 'result_baja_carga_aire', color: 'danger' },
            { label: 'No, presiones normales', nextId: 'result_filtros_sucios', color: 'neutral' },
        ],
    },
    result_baja_carga_aire: {
        id: 'result_baja_carga_aire', type: 'result',
        text: 'Baja carga de refrigerante en AC',
        result: {
            causes: [
                { cause: 'Fuga de refrigerante', probability: 75 },
                { cause: 'Servicio previo con carga incorrecta', probability: 25 },
            ],
            recommendation: 'Localizar la fuga con solución jabonosa o detector. Reparar, recuperar, hacer vacío y recargar según especificación del fabricante (kg o psi).',
            parts: ['Refrigerante (según placa)', 'Filtro-secante'],
        },
    },
    result_filtros_sucios: {
        id: 'result_filtros_sucios', type: 'result',
        text: 'Filtros sucios u obstrucción de airflow',
        result: {
            causes: [
                { cause: 'Filtros de aire sucios (unidad interior)', probability: 50 },
                { cause: 'Condensador exterior sucio', probability: 30 },
                { cause: 'Ventilador con problema', probability: 20 },
            ],
            recommendation: 'Limpiar filtros de la unidad interior. Limpiar condensador exterior con agua a presión. Verificar que los ventiladores funcionen correctamente.',
            parts: ['Filtros de aire'],
        },
    },
    // Nodos de tecnología Inverter compartidos (se alcanzan vía gate_inverter_aire)
    ...arbol_inverter_1.INVERTER_TREE,
};
const AIRE_E5_IPM = {
    start: {
        id: 'start',
        type: 'measure',
        text: 'Medir las bobinas del compresor inverter (U-V, U-W, V-W) y su aislamiento a tierra',
        detail: 'Desenergiza el equipo y desconecta los cables del compresor. Mide las tres fases: U-V, U-W y V-W. Deben ser IDÉNTICAS entre sí (diferencia máxima 10 %) y dentro del rango de la placa (típicamente 1–4 Ω en compresores de aire inverter). Luego mide cada terminal (U, V, W) contra el cuerpo del compresor: debe marcar ABIERTO (∞ / OL).',
        tip: 'Bobinas desbalanceadas = corto entre espiras. Continuidad con la carcasa = caída a tierra (el compresor no es reparable y destruye el IPM nuevo si no se cambia).',
        gifUri: 'medicion-compresor-kalley',
        evidenceLabel: 'Foto de las mediciones U-V, U-W, V-W y de cada terminal contra tierra',
        nextId: 'e5_clasifica',
    },
    e5_clasifica: {
        id: 'e5_clasifica',
        type: 'question',
        text: '¿Qué mostró la medición de las bobinas del compresor?',
        options: [
            { label: 'Fases desbalanceadas, en corto o fuera de rango', nextId: 'e5_compresor', color: 'danger' },
            { label: 'Bobinas caídas a tierra (continuidad con la carcasa)', nextId: 'e5_result_tierra', color: 'danger' },
            { label: 'Bobinas balanceadas, en rango y sin fuga a tierra', nextId: 'e5_ipm', color: 'success' },
        ],
    },
    e5_result_tierra: {
        id: 'e5_result_tierra',
        type: 'result',
        text: 'Compresor inverter con bobinas caídas a tierra — reemplazo obligatorio',
        result: {
            causes: [
                { cause: 'Aislamiento de los devanados degradado (dispara la protección IPM/E5)', probability: 85 },
                { cause: 'Humedad interna del compresor conduciendo a la carcasa', probability: 15 },
            ],
            recommendation: 'El compresor no es reparable: reemplazar con la referencia exacta. NO instalar módulo IPM nuevo sin cambiar el compresor: la caída a tierra destruye el IGBT al energizar. Verificar el filtro secante si hubo humedad.',
            parts: ['Compresor inverter', 'Filtro secador'],
        },
    },
    e5_compresor: {
        id: 'e5_compresor',
        type: 'evidence',
        text: 'Documentar la medición del compresor',
        detail: 'Toma una foto de las tres mediciones y de la placa del compresor antes de solicitar el repuesto.',
        evidenceLabel: 'Foto de resistencia U-V, U-W, V-W y aislamiento',
        nextId: 'e5_result_compresor',
    },
    e5_result_compresor: {
        id: 'e5_result_compresor',
        type: 'result',
        text: 'Compresor inverter con devanados en corto',
        result: {
            causes: [
                { cause: 'Devanados del compresor en corto o desbalanceados', probability: 85 },
                { cause: 'Terminal o conexión del compresor deteriorada', probability: 15 },
            ],
            recommendation: 'Confirmar que la medición se hizo con el equipo desconectado y solicitar el compresor inverter correcto. Verificar el módulo IPM antes de instalar el repuesto.',
            parts: ['Compresor inverter'],
        },
    },
    e5_ipm: {
        id: 'e5_ipm',
        type: 'question',
        text: '¿El módulo IPM (IGBT) está dañado?',
        detail: 'Revisa el módulo de potencia, su disipador y las señales de salida según el manual del modelo.',
        gifUri: 'medir-senal-inverter',
        options: [
            { label: 'Sí, el IPM está dañado', nextId: 'e5_result_ipm', color: 'danger' },
            { label: 'No se confirma daño en el IPM', nextId: 'e5_voltaje', color: 'success' },
        ],
    },
    e5_result_ipm: {
        id: 'e5_result_ipm',
        type: 'result',
        text: 'Módulo IPM / inverter defectuoso',
        result: {
            causes: [
                { cause: 'IGBT o módulo IPM en corto', probability: 75 },
                { cause: 'Circuito de disparo o disipación térmica defectuosa', probability: 25 },
            ],
            recommendation: 'Descargar capacitores, documentar la prueba y reemplazar el módulo IPM o la tarjeta inverter. Confirmar que el compresor no esté en corto para proteger el repuesto nuevo.',
            parts: ['Módulo IPM', 'Tarjeta inverter'],
        },
    },
    e5_voltaje: {
        id: 'e5_voltaje',
        type: 'measure',
        text: 'Medir el voltaje de alimentación del aire acondicionado',
        detail: 'Mide el voltaje de entrada durante la condición de falla y compáralo con el valor nominal de la placa.',
        gifUri: 'medir-voltaje',
        nextId: 'e5_voltaje_ok',
    },
    e5_voltaje_ok: {
        id: 'e5_voltaje_ok',
        type: 'question',
        text: '¿El voltaje de alimentación está bajo o presenta variaciones?',
        options: [
            { label: 'Sí, está bajo o inestable', nextId: 'e5_result_voltaje', color: 'danger' },
            { label: 'No, el voltaje es normal', nextId: 'e5_condensador', color: 'success' },
        ],
    },
    e5_result_voltaje: {
        id: 'e5_result_voltaje',
        type: 'result',
        text: 'Corregir alimentación antes de condenar el inverter',
        result: {
            causes: [
                { cause: 'Voltaje de alimentación bajo o inestable', probability: 55 },
                { cause: 'Conexiones o terminales de alimentación flojos', probability: 20 },
                { cause: 'Protección IPM sensible a una condición externa', probability: 25 },
            ],
            recommendation: 'Corregir la alimentación y sus conexiones. Después de estabilizar el voltaje, repetir la prueba del código E5.',
            parts: ['Terminales de alimentación', 'Protector eléctrico'],
        },
    },
    e5_condensador: {
        id: 'e5_condensador',
        type: 'question',
        text: '¿El condensador exterior está obstruido o sucio y sobrecarga el compresor?',
        detail: 'Revisa el flujo de aire, la limpieza del serpentín y el funcionamiento del ventilador exterior.',
        gifUri: 'manometros',
        options: [
            { label: 'Sí, hay obstrucción o flujo insuficiente', nextId: 'e5_result_condensador', color: 'danger' },
            { label: 'No, el condensador está limpio y ventilado', nextId: 'e5_result_final', color: 'success' },
        ],
    },
    e5_result_condensador: {
        id: 'e5_result_condensador',
        type: 'result',
        text: 'Limpiar el condensador y corregir el flujo de aire',
        result: {
            causes: [
                { cause: 'Serpentín del condensador obstruido por suciedad', probability: 60 },
                { cause: 'Ventilador exterior con flujo insuficiente', probability: 25 },
                { cause: 'Sobrecarga térmica del compresor', probability: 15 },
            ],
            recommendation: 'Limpiar el condensador, comprobar el ventilador y repetir la prueba de corriente. No reemplazar el IPM hasta confirmar que la condición térmica quedó corregida.',
            parts: ['Motor del ventilador exterior', 'Condensador o serpentín'],
        },
    },
    e5_result_final: {
        id: 'e5_result_final',
        type: 'result',
        text: 'Revisar IPM / inverter después de descartar causas externas',
        result: {
            causes: [
                { cause: 'Módulo IPM con falla intermitente', probability: 55 },
                { cause: 'Circuito de control del inverter', probability: 25 },
                { cause: 'Compresor con falla que aparece bajo carga', probability: 20 },
            ],
            recommendation: 'Con compresor, alimentación, condensador y ventilación dentro de especificación, revisar el módulo IPM y la tarjeta inverter siguiendo el manual del modelo.',
            parts: ['Módulo IPM', 'Tarjeta inverter', 'Compresor inverter'],
        },
    },
};
const AIRE_F1_NTC = {
    start: {
        id: 'start',
        type: 'question',
        text: '¿El sensor NTC de temperatura interior está en corto o abierto?',
        detail: 'Desconecta el sensor, mide su resistencia a temperatura conocida y compárala con la tabla del modelo. A 25 °C muchos sensores son cercanos a 10 kΩ, pero no es un valor universal.',
        gifUri: 'medir-continuidad-tierra',
        options: [
            { label: 'Sí, está abierto o en corto', nextId: 'f1_sensor', color: 'danger' },
            { label: 'No, la lectura está dentro de rango', nextId: 'f1_conector', color: 'success' },
        ],
    },
    f1_sensor: {
        id: 'f1_sensor',
        type: 'evidence',
        text: 'Registrar la medición del sensor NTC interior',
        detail: 'Fotografía la lectura del multímetro y la referencia del sensor antes de reemplazarlo.',
        evidenceLabel: 'Foto de resistencia del sensor NTC interior',
        nextId: 'f1_result_sensor',
    },
    f1_result_sensor: {
        id: 'f1_result_sensor',
        type: 'result',
        text: 'Sensor NTC interior fuera de especificación',
        result: {
            causes: [
                { cause: 'Sensor NTC abierto o en corto', probability: 90 },
                { cause: 'Terminal del sensor deteriorado', probability: 10 },
            ],
            recommendation: 'Reemplazar el sensor por la referencia compatible con el modelo y confirmar la lectura después de la reparación.',
            parts: ['Sensor NTC de temperatura interior'],
        },
    },
    f1_conector: {
        id: 'f1_conector',
        type: 'question',
        text: '¿El conector del sensor tiene corrosión o está suelto?',
        options: [
            { label: 'Sí, hay corrosión o falso contacto', nextId: 'f1_result_conector', color: 'danger' },
            { label: 'No, el conector está firme y limpio', nextId: 'f1_result_control', color: 'success' },
        ],
    },
    f1_result_conector: {
        id: 'f1_result_conector',
        type: 'result',
        text: 'Corregir conexión del sensor NTC interior',
        result: {
            causes: [
                { cause: 'Falso contacto u oxidación en el conector', probability: 75 },
                { cause: 'Cableado del sensor deteriorado', probability: 25 },
            ],
            recommendation: 'Limpiar o reparar el conector, verificar continuidad hasta la PCB y probar el equipo antes de cambiar la tarjeta.',
            parts: ['Conector o cableado del sensor'],
        },
    },
    f1_result_control: {
        id: 'f1_result_control',
        type: 'result',
        text: 'Revisar lectura de la PCB interior',
        result: {
            causes: [
                { cause: 'Entrada de lectura del sensor en la PCB interior', probability: 65 },
                { cause: 'Intermitencia que no aparece en la medición estática', probability: 35 },
            ],
            recommendation: 'Confirmar continuidad desde el sensor hasta la PCB y revisar la entrada electrónica según el manual del modelo. Sustituir la PCB solo después de descartar sensor y cableado.',
            parts: ['PCB interior'],
        },
    },
};
const AIRE_F2_NTC = {
    start: {
        id: 'start',
        type: 'question',
        text: '¿El sensor NTC del evaporador está en corto o abierto?',
        detail: 'Mide la resistencia del sensor y compárala con la temperatura real y la tabla del modelo.',
        gifUri: 'medir-continuidad-tierra',
        options: [
            { label: 'Sí, está abierto o en corto', nextId: 'f2_sensor', color: 'danger' },
            { label: 'No, la lectura está dentro de rango', nextId: 'f2_sujecion', color: 'success' },
        ],
    },
    f2_sensor: {
        id: 'f2_sensor',
        type: 'evidence',
        text: 'Registrar la medición del sensor NTC del evaporador',
        detail: 'Toma una foto de la lectura y del montaje del sensor para anexarla al informe.',
        evidenceLabel: 'Foto de resistencia del sensor NTC del evaporador',
        nextId: 'f2_result_sensor',
    },
    f2_result_sensor: {
        id: 'f2_result_sensor',
        type: 'result',
        text: 'Sensor NTC del evaporador fuera de especificación',
        result: {
            causes: [
                { cause: 'Sensor NTC abierto o en corto', probability: 90 },
                { cause: 'Cable del sensor deteriorado', probability: 10 },
            ],
            recommendation: 'Reemplazar el sensor por la referencia compatible y comprobar la temperatura reportada por el equipo.',
            parts: ['Sensor NTC de evaporador'],
        },
    },
    f2_sujecion: {
        id: 'f2_sujecion',
        type: 'question',
        text: '¿El sensor está desprendido del tubo del evaporador?',
        options: [
            { label: 'Sí, está suelto o mal sujeto', nextId: 'f2_result_sujecion', color: 'danger' },
            { label: 'No, está sujeto correctamente', nextId: 'f2_result_control', color: 'success' },
        ],
    },
    f2_result_sujecion: {
        id: 'f2_result_sujecion',
        type: 'result',
        text: 'Corregir montaje del sensor del evaporador',
        result: {
            causes: [
                { cause: 'Sensor desprendido del tubo del evaporador', probability: 85 },
                { cause: 'Aislamiento o abrazadera deteriorada', probability: 15 },
            ],
            recommendation: 'Volver a sujetar el sensor en el punto indicado por el fabricante, asegurar el contacto térmico y confirmar la lectura.',
            parts: ['Abrazadera o soporte del sensor'],
        },
    },
    f2_result_control: {
        id: 'f2_result_control',
        type: 'result',
        text: 'Revisar cableado y entrada de la PCB',
        result: {
            causes: [
                { cause: 'Cableado intermitente entre sensor y PCB', probability: 55 },
                { cause: 'Entrada de lectura de la PCB interior', probability: 45 },
            ],
            recommendation: 'Comprobar continuidad desde el sensor hasta la PCB y revisar la entrada electrónica conforme al manual del modelo.',
            parts: ['Cableado del sensor', 'PCB interior'],
        },
    },
};
// ══════════════════════════════════════════════════════════════════════════
// Árboles dedicados por código — AIRE ACONDICIONADO (compresor Inverter)
// Cada código de error remite a un árbol específico del síntoma reportado,
// sin reutilizar árboles genéricos de otros equipos.
// ══════════════════════════════════════════════════════════════════════════
// ── Sensores de temperatura (EC52-56, ECC1, EH60-62, EHC1-3, FHCC) ───────────
const AIRE_SENSORES = {
    start: {
        id: 'start', type: 'evidence',
        text: 'Medir el sensor de temperatura reportado por el código',
        detail: 'Desconecta el sensor señalado por el código (T1 ambiente interior, T2 serpentín interior, T3 condensador, T4 ambiente exterior o TP descarga del compresor) y mide su resistencia con el multímetro. Compara con la tabla NTC del fabricante a la temperatura ambiente actual. Revisa conector y cableado hasta la tarjeta.',
        evidenceLabel: 'Foto de la resistencia del sensor y referencia del código',
        ntcTable: true,
        nextId: 'sensores_lectura',
    },
    sensores_lectura: {
        id: 'sensores_lectura', type: 'question',
        text: '¿La lectura del sensor está fuera de rango (OL, 0 Ω o valor inconsistente)?',
        options: [
            { label: 'Sí, fuera de rango', nextId: 'sensores_result_sensor', color: 'danger' },
            { label: 'No, la lectura es correcta', nextId: 'sensores_cableado', color: 'success' },
        ],
    },
    sensores_result_sensor: {
        id: 'sensores_result_sensor', type: 'result',
        text: 'Sensor de temperatura defectuoso',
        result: {
            causes: [
                { cause: 'Sensor NTC abierto o en corto', probability: 70 },
                { cause: 'Deriva del sensor (lectura fuera de curva)', probability: 20 },
                { cause: 'Conector del sensor con corrosión', probability: 10 },
            ],
            recommendation: 'Reemplazar el sensor con la referencia compatible con el modelo (T1/T2/T3/T4/TP según el código) y confirmar que el código desaparece después del cambio.',
            parts: ['Sensor NTC de temperatura'],
        },
    },
    sensores_cableado: {
        id: 'sensores_cableado', type: 'measure',
        text: 'Verificar continuidad del cableado y conector hasta la tarjeta',
        detail: 'Mide continuidad desde el conector del sensor hasta la tarjeta correspondiente (interior o exterior según el código). Revisa sulfatación, pines retraídos o cable pellizcado.',
        tip: 'Un cableado intermitente produce lecturas erráticas que la tarjeta interpreta como sensor fuera de rango.',
        nextId: 'sensores_cableado_ok',
    },
    sensores_cableado_ok: {
        id: 'sensores_cableado_ok', type: 'question',
        text: '¿Había conector flojo, corrosión o cable dañado que ya corregiste?',
        options: [
            { label: 'Sí, había falso contacto (corregido)', nextId: 'sensores_result_cableado', color: 'success' },
            { label: 'No, cableado OK y el código persiste', nextId: 'sensores_result_tarjeta', color: 'danger' },
        ],
    },
    sensores_result_cableado: {
        id: 'sensores_result_cableado', type: 'result',
        text: 'Cableado o conector del sensor en mal estado',
        result: {
            causes: [
                { cause: 'Conector sulfatado o sin contacto', probability: 55 },
                { cause: 'Cableado intermitente entre sensor y tarjeta', probability: 45 },
            ],
            recommendation: 'Reparar el conector o el cableado, limpiar los pines y verificar la lectura del sensor después de la corrección.',
            parts: ['Conector del sensor', 'Cableado del sensor'],
        },
    },
    sensores_result_tarjeta: {
        id: 'sensores_result_tarjeta', type: 'result',
        text: 'Tarjeta con falla en la lectura del sensor',
        result: {
            causes: [
                { cause: 'Entrada de lectura del sensor en la tarjeta dañada', probability: 60 },
                { cause: 'Alimentación de 5 V del sensor fuera de rango', probability: 40 },
            ],
            recommendation: 'Con sensor y cableado verificados, solicitar la tarjeta (interior o exterior según el código). Documenta la medición como evidencia antes de cambiarla.',
            parts: ['Tarjeta de control'],
        },
    },
};
// ── EEPROM / Memoria (EC51, EH00, EH0A) ──────────────────────────────────────
const AIRE_EEPROM = {
    start: {
        id: 'start', type: 'question',
        text: '¿El código de EEPROM desaparece después de cortar energía 5 minutos y reconectar?',
        detail: 'Los códigos de EEPROM (EC51 unidad exterior, EH00/EH0A unidad interior) indican pérdida o corrupción de parámetros. Antes de condenar la tarjeta, descarta una falla momentánea de memoria.',
        options: [
            { label: 'Sí, se borra y no vuelve', nextId: 'eeprom_result_energia', color: 'success' },
            { label: 'No, el código persiste al reconectar', nextId: 'eeprom_tarjeta', color: 'danger' },
        ],
    },
    eeprom_result_energia: {
        id: 'eeprom_result_energia', type: 'result',
        text: 'Falla momentánea de memoria — sin daño de hardware',
        result: {
            causes: [
                { cause: 'Interrupción de energía que corrompió la memoria', probability: 70 },
                { cause: 'Voltaje de red inestable que alteró parámetros', probability: 30 },
            ],
            recommendation: 'Verificar voltaje de alimentación y conexión a tierra. Registrar el evento y hacer seguimiento: si el código reaparece con frecuencia, solicitar la tarjeta correspondiente.',
            parts: ['Protector eléctrico'],
        },
    },
    eeprom_tarjeta: {
        id: 'eeprom_tarjeta', type: 'question',
        text: '¿Al regrabar parámetros o reiniciar la tarjeta el código vuelve a aparecer en operación?',
        options: [
            { label: 'Sí, vuelve a fallar en operación', nextId: 'eeprom_result_tarjeta', color: 'danger' },
            { label: 'No, quedó estable con parámetros regrabados', nextId: 'eeprom_result_regrabada', color: 'success' },
        ],
    },
    eeprom_result_regrabada: {
        id: 'eeprom_result_regrabada', type: 'result',
        text: 'Parámetros de memoria corrompidos — regrabados con éxito',
        result: {
            causes: [
                { cause: 'Parámetros de fábrica alterados o corruptos', probability: 75 },
                { cause: 'Memoria con celda débil (vigilar recurrencia)', probability: 25 },
            ],
            recommendation: 'Dejar registrado el modelo y los parámetros regrabados. Hacer seguimiento: si el código vuelve, reemplazar la tarjeta.',
        },
    },
    eeprom_result_tarjeta: {
        id: 'eeprom_result_tarjeta', type: 'result',
        text: 'Memoria EEPROM de la tarjeta defectuosa',
        result: {
            causes: [
                { cause: 'Memoria EEPROM con celdas dañadas', probability: 70 },
                { cause: 'Tarjeta con falla de lectura/escritura de memoria', probability: 30 },
            ],
            recommendation: 'Reemplazar la tarjeta correspondiente (exterior para EC51, interior para EH00/EH0A). Documenta el código y la prueba de reenergización como evidencia.',
            parts: ['Tarjeta de control'],
        },
    },
};
// ── Comunicación interior–exterior (E6, EH0B, EHB3, EHBA, EHBE, EL01) ────────
const AIRE_COMUNICACION = {
    start: {
        id: 'start', type: 'question',
        text: '¿La instalación de comunicaciones entre unidad interior y exterior está correcta?',
        detail: 'Verifica en ambos extremos el cable de comunicaciones (0/2/3 según el fabricante): terminales en el orden del diagrama, apriete correcto y sin empalmes. Revisa también el puente de resistencia (si el modelo lo usa) y que la unidad exterior tenga energía.',
        options: [
            { label: 'Sí, instalación correcta', nextId: 'comunicacion_voltaje', color: 'success' },
            { label: 'No, hay error de instalación o cableado', nextId: 'comunicacion_result_cable', color: 'danger' },
        ],
    },
    comunicacion_result_cable: {
        id: 'comunicacion_result_cable', type: 'result',
        text: 'Cable de comunicaciones o instalación incorrecta',
        result: {
            causes: [
                { cause: 'Cable de comunicaciones mal terminado o empalmado', probability: 60 },
                { cause: 'Orden de terminales incorrecto o puente de resistencia faltante', probability: 40 },
            ],
            recommendation: 'Corregir el cableado según el diagrama del modelo, apretar terminales con torque adecuado y verificar el puente de resistencia antes de cambiar tarjetas.',
            parts: ['Cable de comunicaciones'],
        },
    },
    comunicacion_voltaje: {
        id: 'comunicacion_voltaje', type: 'measure',
        text: 'Medir voltaje del canal de comunicaciones',
        detail: 'Con el equipo en marcha, mide el voltaje entre el terminal de comunicación y el neutro/común (típico 15–65 V DC pulsante según el fabricante). Verifica que la unidad exterior esté energizada y sin código propio.',
        tip: 'Un voltaje fijo en 0 V o clavado en el máximo suele indicar daño del circuito de comunicación, no un problema de cable.',
        nextId: 'comunicacion_voltaje_ok',
    },
    comunicacion_voltaje_ok: {
        id: 'comunicacion_voltaje_ok', type: 'question',
        text: '¿El voltaje de comunicación está dentro del patrón y el código persiste?',
        options: [
            { label: 'Sí, señal normal y el código persiste', nextId: 'comunicacion_result_tarjeta', color: 'danger' },
            { label: 'No, hay ruido, señal distorsionada o intermitente', nextId: 'comunicacion_result_intermitencia', color: 'danger' },
        ],
    },
    comunicacion_result_tarjeta: {
        id: 'comunicacion_result_tarjeta', type: 'result',
        text: 'Tarjeta con falla del circuito de comunicaciones',
        result: {
            causes: [
                { cause: 'Circuito de comunicación de la tarjeta interior/exterior dañado', probability: 65 },
                { cause: 'Fusible o alimentación del circuito de comunicación abierto', probability: 35 },
            ],
            recommendation: 'Confirmar que el cable y la instalación están correctos y el voltaje de la red es estable. Solicitar la tarjeta del lado que no responde (diagrama del modelo).',
            parts: ['Tarjeta de control'],
        },
    },
    comunicacion_result_intermitencia: {
        id: 'comunicacion_result_intermitencia', type: 'result',
        text: 'Comunicación intermitente por ruido o conexión marginal',
        result: {
            causes: [
                { cause: 'Cable de comunicaciones junto a líneas de alta tensión o interferencias', probability: 45 },
                { cause: 'Terminal flojo u oxidado en interior o exterior', probability: 35 },
                { cause: 'Circuito de comunicación de tarjeta con falla intermitente', probability: 20 },
            ],
            recommendation: 'Reenrutar el cable lejos de fuentes de ruido, rehacer terminales en ambos extremos y probar. Si el código persiste, solicitar la tarjeta según el diagrama.',
            parts: ['Cable de comunicaciones', 'Tarjeta de control'],
        },
    },
};
// ── Ventiladores / Motores DC (EC07, EH03, EH3A-C) ───────────────────────────
const AIRE_VENTILADORES = {
    start: {
        id: 'start', type: 'evidence',
        text: 'Verificar el motor DC del ventilador señalado por el código',
        detail: 'Comprueba que el aspa gire libremente y mide el voltaje de alimentación del motor en el conector durante la operación (típicamente 280–380 V DC de potencia y 15 V DC de control según el modelo).',
        evidenceLabel: 'Foto del conector del ventilador y voltaje medido',
        nextId: 'vent_giro',
    },
    vent_giro: {
        id: 'vent_giro', type: 'question',
        text: '¿El aspa está bloqueada o con roce mecánico?',
        options: [
            { label: 'Sí, está bloqueada o con roce', nextId: 'vent_result_bloqueo', color: 'danger' },
            { label: 'No, gira libremente', nextId: 'vent_voltaje', color: 'success' },
        ],
    },
    vent_result_bloqueo: {
        id: 'vent_result_bloqueo', type: 'result',
        text: 'Ventilador bloqueado o con roce mecánico',
        result: {
            causes: [
                { cause: 'Aspa con daño o roce con el ducto/marco', probability: 55 },
                { cause: 'Rodamiento del motor agarrotado', probability: 45 },
            ],
            recommendation: 'Corregir el roce o reemplazar el motor DC del ventilador. Verifica que el aspa esté bien asentada en el eje.',
            parts: ['Motor ventilador DC'],
        },
    },
    vent_voltaje: {
        id: 'vent_voltaje', type: 'question',
        text: '¿El motor recibe alimentación y no gira o no retorna la señal de RPM (Hall)?',
        options: [
            { label: 'Sí, hay alimentación y falla el motor o la señal', nextId: 'vent_result_motor', color: 'danger' },
            { label: 'No llega alimentación al motor', nextId: 'vent_result_tarjeta', color: 'neutral' },
        ],
    },
    vent_result_motor: {
        id: 'vent_result_motor', type: 'result',
        text: 'Motor DC del ventilador defectuoso (motor o señal Hall)',
        result: {
            causes: [
                { cause: 'Motor con devanados o electrónica interna dañada', probability: 60 },
                { cause: 'Sensor Hall de retroalimentación de RPM dañado', probability: 40 },
            ],
            recommendation: 'Reemplazar el motor DC del ventilador con la referencia exacta. Confirmar que la señal de RPM retorne a la tarjeta después del cambio.',
            parts: ['Motor ventilador DC'],
        },
    },
    vent_result_tarjeta: {
        id: 'vent_result_tarjeta', type: 'result',
        text: 'Tarjeta sin salida para el ventilador',
        result: {
            causes: [
                { cause: 'Salida de la tarjeta sin alimentación para el motor', probability: 60 },
                { cause: 'Conector o cableado entre tarjeta y motor', probability: 40 },
            ],
            recommendation: 'Verificar conector y cableado. Si están correctos, solicitar la tarjeta que alimenta el ventilador (interior para EH03, exterior para EC07/EH3A-C).',
            parts: ['Tarjeta de control', 'Conector del ventilador'],
        },
    },
};
// ── Presión del sistema / refrigerante (PC02, PC03, EL0C) ────────────────────
const AIRE_PRESION_REFRI = {
    start: {
        id: 'start', type: 'measure',
        text: 'Conectar manómetros y verificar presiones con el equipo en marcha',
        detail: 'Conecta manómetros en las válvulas de servicio y compara con las presiones normales de operación según el refrigerante (R410A/R32/R22). Toma la presión manométrica a los 15 minutos después de arrancar el producto: con el sistema estabilizado el manómetro da los valores exactos. Revisa también temperatura de descarga del compresor y flujo de aire del condensador.',
        gifUri: 'manometros',
        nextId: 'presion_lectura',
    },
    presion_lectura: {
        id: 'presion_lectura', type: 'question',
        text: '¿Las presiones están fuera de rango (muy altas o muy bajas)?',
        options: [
            { label: 'Sí, fuera de rango', nextId: 'presion_causa', color: 'danger' },
            { label: 'No, presiones normales y el código persiste', nextId: 'presion_sensor', color: 'neutral' },
        ],
    },
    presion_causa: {
        id: 'presion_causa', type: 'question',
        text: '¿Qué condición observas al medir?',
        options: [
            { label: 'Presiones bajas / falta refrigerante o fuga', nextId: 'presion_result_causa', color: 'danger' },
            { label: 'Presiones altas / condensador sucio o sobrecarga', nextId: 'presion_result_causa', color: 'danger' },
        ],
    },
    presion_result_causa: {
        id: 'presion_result_causa', type: 'result',
        text: 'Presión del sistema fuera de rango',
        result: {
            causes: [
                { cause: 'Falta de refrigerante por fuga', probability: 45 },
                { cause: 'Exceso de refrigerante por carga excesiva', probability: 15 },
                { cause: 'Condensador sucio u obstruido', probability: 20 },
                { cause: 'Flujo de aire insuficiente (ventilador o filtros)', probability: 20 },
            ],
            recommendation: 'Corregir la causa: reparar fuga, hacer vacío y ajustar carga por peso, o limpiar el condensador y corregir el flujo de aire. Confirmar con presiones y amperaje normales antes de liberar el equipo.',
            parts: ['Carga de refrigerante', 'Filtro secante', 'Servicio de detección de fugas'],
        },
    },
    presion_sensor: {
        id: 'presion_sensor', type: 'evidence',
        text: 'Verificar sensor/circuito de presión y temperatura de descarga',
        detail: 'Con presiones normales, mide el sensor o conector de presión (si el modelo lo tiene) y verifica la lectura de temperatura de descarga del compresor en la tarjeta. Documenta la medición.',
        evidenceLabel: 'Foto de presiones normales y medición del sensor/circuito',
        nextId: 'presion_result_sensor',
    },
    presion_result_sensor: {
        id: 'presion_result_sensor', type: 'result',
        text: 'Tarjeta con lectura de presión/temperatura fuera de rango',
        result: {
            causes: [
                { cause: 'Sensor de presión o de temperatura de descarga fuera de especificación', probability: 55 },
                { cause: 'Entrada de lectura en la tarjeta dañada', probability: 45 },
            ],
            recommendation: 'Reemplazar el sensor si está fuera de especificación. Si el sensor es correcto y el código persiste, solicitar la tarjeta según el diagrama del modelo.',
            parts: ['Sensor de presión', 'Tarjeta de control'],
        },
    },
};
// ── Voltaje / detección de cruce por cero (EH02, PC01, PC0L) ─────────────────
const AIRE_VOLTAJE_CONTROL = {
    start: {
        id: 'start', type: 'measure',
        text: 'Medir voltaje de alimentación en la unidad exterior',
        detail: 'Mide el voltaje de alimentación en el borne de la unidad exterior durante la condición de falla y compáralo con el nominal de la placa (±10 %). Verifica apriete de terminales, protector y línea de alimentación.',
        gifUri: 'medir-voltaje',
        nextId: 'voltaje_lectura',
    },
    voltaje_lectura: {
        id: 'voltaje_lectura', type: 'question',
        text: '¿El voltaje de alimentación está bajo, alto o inestable?',
        options: [
            { label: 'Sí, fuera de rango o inestable', nextId: 'voltaje_result_bajo', color: 'danger' },
            { label: 'No, el voltaje es estable y nominal', nextId: 'voltaje_tarjeta', color: 'success' },
        ],
    },
    voltaje_result_bajo: {
        id: 'voltaje_result_bajo', type: 'result',
        text: 'Alimentación fuera de rango dispara las protecciones',
        result: {
            causes: [
                { cause: 'Voltaje de red bajo, alto o inestable', probability: 55 },
                { cause: 'Terminales o protector de alimentación flojos/deteriorados', probability: 30 },
                { cause: 'Cableado de alimentación con calibre insuficiente o caída de tensión', probability: 15 },
            ],
            recommendation: 'Corregir la alimentación y sus conexiones antes de reemplazar componentes. Después de estabilizar el voltaje, repetir la prueba del código.',
            parts: ['Protector eléctrico', 'Terminales de alimentación'],
        },
    },
    voltaje_tarjeta: {
        id: 'voltaje_tarjeta', type: 'question',
        text: '¿Con voltaje estable el código de cruce por cero / protección sigue apareciendo?',
        options: [
            { label: 'Sí, el código persiste con voltaje normal', nextId: 'voltaje_result_tarjeta', color: 'danger' },
            { label: 'No, con buen apriete/instalación quedó estable', nextId: 'voltaje_result_apriete', color: 'success' },
        ],
    },
    voltaje_result_apriete: {
        id: 'voltaje_result_apriete', type: 'result',
        text: 'Conexión marginal corregida',
        result: {
            causes: [
                { cause: 'Terminal flojo en la alimentación de la tarjeta', probability: 65 },
                { cause: 'Conector o ficha de alimentación deteriorada', probability: 35 },
            ],
            recommendation: 'Rehacer terminales y verificar apriete con torque. Hacer seguimiento del equipo.',
            parts: ['Terminales de alimentación'],
        },
    },
    voltaje_result_tarjeta: {
        id: 'voltaje_result_tarjeta', type: 'result',
        text: 'Tarjeta con falla en detección de cruce por cero / protección de voltaje',
        result: {
            causes: [
                { cause: 'Circuito de detección de cruce por cero de la tarjeta dañado', probability: 60 },
                { cause: 'Fuente interna de la tarjeta fuera de rango', probability: 40 },
            ],
            recommendation: 'Con alimentación verificada y estable, solicitar la tarjeta correspondiente (exterior para EH02/PC01). Documenta las mediciones como evidencia.',
            parts: ['Tarjeta de control'],
        },
    },
};
// ── Protecciones del compresor inverter (PC00, PC04, PC08, PC40) ─────────────
const AIRE_INVERTER_PROTECCIONES = {
    start: {
        id: 'start', type: 'measure',
        text: 'Medir el voltaje en la salida de la tarjeta inverter (U, V, W)',
        detail: 'Con el equipo en intento de arranque, mide el voltaje entre las fases U-V, U-W y V-W en la salida del módulo hacia el compresor. En arranque se esperan más de 80 V y en operación estable el valor de la placa (60–230 V según fabricante). 0 V entre fases apunta a tarjeta sin salida.',
        gifUri: 'medir-senal-inverter',
        nextId: 'inv_compresor',
    },
    inv_compresor: {
        id: 'inv_compresor', type: 'question',
        text: '¿La salida de la tarjeta inverter es correcta y el compresor no arranca?',
        detail: 'Con salida de voltaje presente, desenergiza y mide las bobinas del compresor U-V, U-W y V-W y el aislamiento a tierra. Balanceo típico entre bobinas y sin continuidad a tierra.',
        gifUri: 'medicion-compresor-kalley',
        options: [
            { label: 'Salida OK y compresor con falla', nextId: 'inv_result_compresor', color: 'danger' },
            { label: 'Salida ausente o anormal', nextId: 'inv_ipm', color: 'danger' },
        ],
    },
    inv_result_compresor: {
        id: 'inv_result_compresor', type: 'result',
        text: 'Compresor inverter con falla (bobinas o bloqueo)',
        result: {
            causes: [
                { cause: 'Devanados del compresor desbalanceados o en corto', probability: 60 },
                { cause: 'Compresor bloqueado mecánicamente', probability: 25 },
                { cause: 'Conexión de terminales del compresor deteriorada', probability: 15 },
            ],
            recommendation: 'Confirmar la medición con el equipo desenergizado y solicitar el compresor con la referencia exacta. Verificar el módulo IPM antes de instalar el repuesto nuevo.',
            parts: ['Compresor inverter'],
        },
    },
    inv_ipm: {
        id: 'inv_ipm', type: 'question',
        text: '¿El módulo IPM (IGBT) presenta daño o la tarjeta no genera salida?',
        detail: 'Revisa el módulo de potencia y su disipador según el manual del modelo. Descarga los capacitores antes de manipular. Verifica alimentación de la tarjeta y señales de control.',
        gifUri: 'medir-senal-inverter',
        options: [
            { label: 'Sí, IPM o tarjeta sin salida', nextId: 'inv_result_tarjeta', color: 'danger' },
            { label: 'IPM OK y condición externa (voltaje/temperatura)', nextId: 'inv_result_externa', color: 'success' },
        ],
    },
    inv_result_tarjeta: {
        id: 'inv_result_tarjeta', type: 'result',
        text: 'Módulo IPM / tarjeta inverter defectuosa',
        result: {
            causes: [
                { cause: 'IGBT o módulo IPM en corto o abierto', probability: 65 },
                { cause: 'Tarjeta inverter con falla de control o alimentación', probability: 35 },
            ],
            recommendation: 'Descargar capacitores, documentar la prueba y reemplazar el módulo IPM o la tarjeta inverter. Confirmar que el compresor no esté en corto antes de energizar el repuesto nuevo.',
            parts: ['Módulo IPM', 'Tarjeta inverter'],
        },
    },
    inv_result_externa: {
        id: 'inv_result_externa', type: 'result',
        text: 'Protección del inverter por condición externa',
        result: {
            causes: [
                { cause: 'Voltaje de alimentación fuera de rango o inestable', probability: 40 },
                { cause: 'Sobrecarga térmica (condensador sucio o flujo insuficiente)', probability: 35 },
                { cause: 'Protección activada por temperatura de descarga alta', probability: 25 },
            ],
            recommendation: 'Corregir alimentación, limpiar el condensador y verificar ventilación y carga de refrigerante. Repetir la prueba del código con el sistema dentro de especificación.',
            parts: ['Protector eléctrico', 'Servicio de limpieza de condensador'],
        },
    },
};
// ── Registro de árboles dedicados de aire ─────────────────────────────────────
exports.AIR_ERROR_TREES = {
    aire_e5_ipm: AIRE_E5_IPM,
    aire_f1_ntc: AIRE_F1_NTC,
    aire_f2_ntc: AIRE_F2_NTC,
    aire_sensores: AIRE_SENSORES,
    aire_eeprom: AIRE_EEPROM,
    aire_comunicacion: AIRE_COMUNICACION,
    aire_ventiladores: AIRE_VENTILADORES,
    aire_presion_refri: AIRE_PRESION_REFRI,
    aire_voltaje_control: AIRE_VOLTAJE_CONTROL,
    aire_inverter_protecciones: AIRE_INVERTER_PROTECCIONES,
};
const CODE_TREE_IDS = {
    // ─── Códigos principales con árboles específicos ──────────────────────
    E5: 'aire_e5_ipm', // Protección IPM / sobrecorriente
    F1: 'aire_f1_ntc', // Sensor NTC interior
    F2: 'aire_f2_ntc', // Sensor NTC evaporador
    // ─── Sensores (EC / EH / EHC / FHCC) → árbol de sensores ─────────────
    EC52: 'aire_sensores', // Sensor T3 condensador
    EC53: 'aire_sensores', // Sensor T4 ambiente exterior
    EC54: 'aire_sensores', // Sensor TP descarga compresor
    EC56: 'aire_sensores', // Sensor T2B unidad exterior
    ECC1: 'aire_sensores', // Sensor refrigerante unidad interior (multizona)
    EH60: 'aire_sensores', // Sensor T1 ambiente interior
    EH61: 'aire_sensores', // Sensor T2 tubería/serpentín interior
    EH62: 'aire_sensores', // Sensor/módulo aire fresco
    EHC1: 'aire_sensores', // Sensor refrigerante detecta fuga
    EHC2: 'aire_sensores', // Sensor fuera de rango + fuga
    EHC3: 'aire_sensores', // Sensor refrigerante fuera de rango
    FHCC: 'aire_sensores', // Error sensor refrigerante
    // ─── EEPROM / Memoria → árbol de EEPROM ──────────────────────────────
    EC51: 'aire_eeprom', // EEPROM unidad exterior
    EH00: 'aire_eeprom', // EEPROM unidad interior
    EH0A: 'aire_eeprom', // Parámetros EEPROM unidad interior
    // ─── Comunicación → árbol de comunicación ────────────────────────────
    E6: 'aire_comunicacion', // Comunicación interior-exterior
    EH0B: 'aire_comunicacion', // Comunicación PCB principal-display
    EHB3: 'aire_comunicacion', // Comunicación controlador cableado
    EHBA: 'aire_comunicacion', // Comunicación módulo ventilador externo
    EHBE: 'aire_comunicacion', // Comunicación radar-display
    EL01: 'aire_comunicacion', // Comunicación interior-exterior (otro formato)
    // ─── Ventiladores / Motores DC → árbol de ventiladores ───────────────
    EC07: 'aire_ventiladores', // Velocidad ventilador DC exterior
    EH03: 'aire_ventiladores', // Velocidad ventilador interior
    EH3A: 'aire_ventiladores', // Protección tensión DC módulo ventilador exterior
    EH3B: 'aire_ventiladores', // Tensión DC alta módulo ventilador exterior
    EH3C: 'aire_ventiladores', // Anomalía módulo/motor aire fresco
    // ─── Voltaje / Cruce por cero → árbol de voltaje y control ───────────
    EH02: 'aire_voltaje_control', // Detección cruce por cero
    PC01: 'aire_voltaje_control', // Protección tensión alta/baja
    PC0L: 'aire_voltaje_control', // Baja temperatura ambiente (sensor T4)
    // ─── Protecciones compresor / IPM → árbol de protecciones inverter ───
    PC00: 'aire_inverter_protecciones', // Protección IPM / sobrecorriente IGBT
    PC04: 'aire_inverter_protecciones', // Error accionamiento inverter compresor
    PC08: 'aire_inverter_protecciones', // Protección sobrecorriente
    PC40: 'aire_inverter_protecciones', // Comunicación principal-driver compresor
    // ─── Presión / refrigerante → árbol de presión ───────────────────────
    PC02: 'aire_presion_refri', // Alta temp compresor/IPM/presión
    PC03: 'aire_presion_refri', // Protección presión sistema
    EL0C: 'aire_presion_refri', // Falta refrigerante / detección fuga
    // ─── Modos de servicio / No fallas → sin árbol (usar árbol por síntoma) ─
    // AP, CL, DF, FC, SC, CP, DE, FP, LP, NF no son fallas, se mantienen en árbol por síntoma
};
function getAirErrorTreeId(code) {
    return CODE_TREE_IDS[code.trim().toUpperCase()];
}
