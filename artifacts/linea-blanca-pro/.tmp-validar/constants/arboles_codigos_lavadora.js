"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODIGOS_LAVADORA_TREES = void 0;
// ══════════════════════════════════════════════════════════════════════════
// Árboles de diagnóstico DEDICADOS POR CÓDIGO DE ERROR — Lavadora / Secadora
// Cada árbol parte del significado del código (sin volver a preguntarlo) y
// guía las validaciones específicas de ese código con multímetro.
// ══════════════════════════════════════════════════════════════════════════
// ── E1 / E10 — No llena agua ─────────────────────────────────────────────────
const LAV_E1_LLENADO = {
    start: {
        id: 'start', type: 'action',
        text: 'Verificar presión del suministro y limpiar los filtros de malla de las electroválvulas',
        detail: 'Abre la llave de agua completamente y confirma presión mayor a 0.5 bar. Retira las mangueras de entrada y limpia los filtros de malla de las electroválvulas (sedimento, arena o sarro).',
        tip: 'Toma foto de los filtros de malla y del resultado de la limpieza antes de continuar.',
        nextId: 'e1_valvula',
    },
    e1_valvula: {
        id: 'e1_valvula', type: 'measure',
        text: 'Medir si las electroválvulas reciben voltaje durante el llenado',
        detail: 'Con el ciclo iniciado, mide voltaje en los terminales de la electroválvula. El equipo pide agua: la tarjeta debe enviarle voltaje.',
        gifUri: 'medir-voltaje',
        evidenceLabel: 'Foto del voltaje medido en la electroválvula durante el llenado',
        nextId: 'e1_valvula_ok',
    },
    e1_valvula_ok: {
        id: 'e1_valvula_ok', type: 'question',
        text: '¿La electroválvula recibe voltaje y no abre?',
        options: [
            { label: 'Sí, recibe voltaje y no abre', nextId: 'e1_bobina', color: 'danger' },
            { label: 'No recibe voltaje', nextId: 'e1_presostato', color: 'danger' },
        ],
    },
    e1_bobina: {
        id: 'e1_bobina', type: 'measure',
        text: 'Medir la resistencia de la bobina de la electroválvula',
        detail: 'Con el equipo desenergizado, mide la bobina: debe marcar aproximadamente 4 kΩ. Una bobina abierta o muy fuera de valor confirma la falla.',
        gifUri: 'medir-bobinas',
        evidenceLabel: 'Foto de la resistencia de la bobina de la electroválvula',
        nextId: 'e1_bobina_ok',
    },
    e1_bobina_ok: {
        id: 'e1_bobina_ok', type: 'question',
        text: '¿La bobina está abierta o muy fuera de su valor (~4 kΩ)?',
        options: [
            { label: 'Sí, la bobina está defectuosa', nextId: 'e1_result_valvula', color: 'danger' },
            { label: 'No, la electroválvula mide bien', nextId: 'e1_presostato', color: 'success' },
        ],
    },
    e1_result_valvula: {
        id: 'e1_result_valvula', type: 'result',
        text: 'E1: electroválvula de entrada defectuosa',
        result: {
            causes: [
                { cause: 'Electroválvula con bobina abierta o fuera de especificación', probability: 75 },
                { cause: 'Conector o cableado de la electroválvula deteriorado', probability: 25 },
            ],
            recommendation: 'Reemplazar la electroválvula con la referencia del modelo y revisar su conector. Probar un ciclo de llenado completo después del cambio.',
            parts: ['Electroválvula'],
        },
    },
    e1_presostato: {
        id: 'e1_presostato', type: 'question',
        text: '¿El presostato cambia de estado (clic) al soplar su manguera?',
        detail: 'Desconecta la manguera del presostato y sopla suavemente: debe escuchar el clic de cambio de estado. Si no cambia, reporta "tina llena" falsa y bloquea el llenado.',
        options: [
            { label: 'Sí, cambia de estado normalmente', nextId: 'e1_result_pcb', color: 'danger' },
            { label: 'No cambia o marca intermitente', nextId: 'e1_result_presostato', color: 'danger' },
        ],
    },
    e1_result_presostato: {
        id: 'e1_result_presostato', type: 'result',
        text: 'E1: sensor de nivel o su manguera obstruida',
        result: {
            causes: [
                { cause: 'Manguera del presostato obstruida, pinchada o desconectada', probability: 45 },
                { cause: 'Presostato (sensor de nivel) defectuoso', probability: 40 },
                { cause: 'Residuos de jabón endurecido en la cámara del presostato', probability: 15 },
            ],
            recommendation: 'Soplar la manguera desde ambos extremos y revisar su asiento. Limpiar la cámara del presostato; si sigue sin cambiar de estado, reemplazarlo.',
            parts: ['Presostato'],
        },
    },
    e1_result_pcb: {
        id: 'e1_result_pcb', type: 'result',
        text: 'E1: la tarjeta PCB no envía señal de apertura',
        result: {
            causes: [
                { cause: 'Tarjeta PCB sin salida hacia la electroválvula (triac o driver)', probability: 60 },
                { cause: 'Cableado entre PCB y electroválvula abierto', probability: 40 },
            ],
            recommendation: 'Verificar continuidad del cableado PCB-electroválvula. Con cableado correcto y sin señal de la tarjeta, reemplazar la tarjeta PCB principal.',
            parts: ['Tarjeta principal'],
        },
    },
};
// ── E2 / E21 — No desagua ────────────────────────────────────────────────────
const LAV_E2_DRENAJE = {
    start: {
        id: 'start', type: 'action',
        text: 'Revisar la manguera de desagüe y limpiar el filtro de la bomba',
        detail: 'Verifica que la manguera de desagüe no esté doblada, aplastada, sifoneada ni instalada demasiado alta. Limpia el filtro de la bomba (panel inferior) y retira monedas, botones o pelusas del impulsor.',
        tip: 'Toma foto del filtro y del impulsor después de la limpieza.',
        nextId: 'e2_zumbido',
    },
    e2_zumbido: {
        id: 'e2_zumbido', type: 'question',
        text: '¿La bomba zumba durante el intento de drenaje?',
        options: [
            { label: 'Sí, zumba pero no desagua', nextId: 'e2_result_bomba', color: 'danger' },
            { label: 'No hace ningún ruido', nextId: 'e2_voltaje', color: 'danger' },
        ],
    },
    e2_result_bomba: {
        id: 'e2_result_bomba', type: 'result',
        text: 'E2: bomba de drenaje con rotor defectuoso',
        result: {
            causes: [
                { cause: 'Rotor magnético interno oxidado o dilatado (zumba pero no gira)', probability: 70 },
                { cause: 'Impulsor con obstrucción remanente', probability: 30 },
            ],
            recommendation: 'Con la bomba limpia y zumbando sin girar, reemplazar la bomba de drenaje completa: el rotor magnético no se repara de forma confiable.',
            parts: ['Bomba de drenaje'],
        },
    },
    e2_voltaje: {
        id: 'e2_voltaje', type: 'measure',
        text: 'Medir si la bomba recibe voltaje durante el ciclo de drenaje',
        detail: 'Con el equipo en el intento de drenaje, mide voltaje AC en los terminales de la bomba.',
        gifUri: 'medir-voltaje',
        evidenceLabel: 'Foto del voltaje medido en los terminales de la bomba',
        nextId: 'e2_voltaje_ok',
    },
    e2_voltaje_ok: {
        id: 'e2_voltaje_ok', type: 'question',
        text: '¿La bomba recibe voltaje y no trabaja?',
        options: [
            { label: 'Sí, recibe voltaje y no trabaja', nextId: 'e2_result_bomba_elec', color: 'danger' },
            { label: 'No recibe voltaje', nextId: 'e2_result_pcb', color: 'danger' },
        ],
    },
    e2_result_bomba_elec: {
        id: 'e2_result_bomba_elec', type: 'result',
        text: 'E2: bomba de drenaje defectuosa o quemada',
        result: {
            causes: [
                { cause: 'Bobina de la bomba abierta o quemada', probability: 75 },
                { cause: 'Conector o cableado de la bomba deteriorado', probability: 25 },
            ],
            recommendation: 'Medir la resistencia de la bomba desenergizada. Con bobina abierta, reemplazar la bomba; revisar también el conector.',
            parts: ['Bomba de drenaje'],
        },
    },
    e2_result_pcb: {
        id: 'e2_result_pcb', type: 'result',
        text: 'E2: la tarjeta PCB no activa la bomba de drenaje',
        result: {
            causes: [
                { cause: 'Triac de bomba abierto en la tarjeta PCB', probability: 50 },
                { cause: 'Pista del pulso microcontrolador-etapa de potencia abierta o sulfatada', probability: 30 },
                { cause: 'Cableado PCB-bomba interrumpido', probability: 20 },
            ],
            recommendation: 'Verificar el cableado y luego el triac de bomba en la placa base. Sin señal de la tarjeta con cableado correcto, reemplazar la tarjeta PCB principal.',
            parts: ['Bomba de drenaje', 'Tarjeta principal'],
        },
    },
};
// ── E4 / E40 — Carga desbalanceada ───────────────────────────────────────────
const LAV_E4_DESBALANCE = {
    start: {
        id: 'start', type: 'action',
        text: 'Redistribuir la ropa, nivelar el equipo y repetir el centrifugado',
        detail: 'Abre la puerta, redistribuye la ropa manualmente y reinicia el ciclo. Verifica la nivelación con nivel de burbuja y ajusta las patas.',
        nextId: 'e4_persiste',
    },
    e4_persiste: {
        id: 'e4_persiste', type: 'question',
        text: '¿El error E4 persiste con carga normal y el equipo nivelado?',
        options: [
            { label: 'Sí, persiste el error', nextId: 'e4_switch', color: 'danger' },
            { label: 'No, el centrifugado ya es normal', nextId: 'e4_result_carga', color: 'success' },
        ],
    },
    e4_result_carga: {
        id: 'e4_result_carga', type: 'result',
        text: 'E4: desbalance por carga o instalación',
        result: {
            causes: [
                { cause: 'Ropa concentrada o pieza grande (colchón, cobija) que no se distribuye', probability: 70 },
                { cause: 'Equipo sin nivelar (patas flojas o piso irregular)', probability: 30 },
            ],
            recommendation: 'Orientar al usuario sobre la capacidad real del equipo y la distribución de la carga. Verificar la nivelación periódicamente.',
            parts: [],
        },
    },
    e4_switch: {
        id: 'e4_switch', type: 'measure',
        text: 'Medir la continuidad del switch de impacto / sensor de desbalanceo',
        detail: 'Con el equipo desenergizado, mide el switch: debe cambiar de estado al mover el tambor o la tina. Un contacto carbonizado marca intermitente.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición del switch de impacto',
        nextId: 'e4_switch_ok',
    },
    e4_switch_ok: {
        id: 'e4_switch_ok', type: 'question',
        text: '¿El switch de impacto no cambia de estado o marca intermitente?',
        options: [
            { label: 'Sí, el switch es defectuoso', nextId: 'e4_result_switch', color: 'danger' },
            { label: 'No, el switch mide limpio', nextId: 'e4_result_suspension', color: 'success' },
        ],
    },
    e4_result_switch: {
        id: 'e4_result_switch', type: 'result',
        text: 'E4: switch de impacto / sensor de desbalanceo defectuoso',
        result: {
            causes: [
                { cause: 'Contactos del switch de impacto carbonizados o intermitentes', probability: 70 },
                { cause: 'Palanca o brazo del switch desajustado', probability: 30 },
            ],
            recommendation: 'Reemplazar el switch de impacto y verificar su actuación mecánica con un centrifugado de prueba con carga balanceada.',
            parts: ['Switch de impacto'],
        },
    },
    e4_result_suspension: {
        id: 'e4_result_suspension', type: 'result',
        text: 'E4: suspensión desgastada que impide el centrifugado seguro',
        result: {
            causes: [
                { cause: 'Amortiguadores de suspensión desgastados', probability: 50 },
                { cause: 'Resortes de suspensión flojos o rotos', probability: 40 },
                { cause: 'Tarjeta PCB con lectura de desbalance errónea', probability: 10 },
            ],
            recommendation: 'Inspeccionar amortiguadores y resortes; reemplazar los desgastados con la referencia del modelo. Verificar vibración y centrifugado completo en prueba.',
            parts: ['Amortiguadores de suspensión', 'Resortes de suspensión'],
        },
    },
};
// ── E3 / E30 — Error de puerta / tapa ────────────────────────────────────────
const LAV_E3_PUERTA = {
    start: {
        id: 'start', type: 'question',
        text: '¿La puerta o tapa cierra completamente con su clic?',
        detail: 'Verifica el cierre mecánico completo: lengüeta sin fisuras, bisagras sin juego y cierre con clic firme.',
        options: [
            { label: 'Sí, cierra con clic firme', nextId: 'e3_switch', color: 'success' },
            { label: 'No cierra bien o la lengüeta está dañada', nextId: 'e3_result_lengueta', color: 'danger' },
        ],
    },
    e3_result_lengueta: {
        id: 'e3_result_lengueta', type: 'result',
        text: 'E3: cierre mecánico de puerta defectuoso',
        result: {
            causes: [
                { cause: 'Lengüeta de puerta rota o deformada', probability: 55 },
                { cause: 'Bisagras con juego o puerta desalineada', probability: 30 },
                { cause: 'Objeto impidiendo el cierre completo', probability: 15 },
            ],
            recommendation: 'Reemplazar la lengüeta o ajustar la puerta/bisagras hasta lograr el cierre con clic. Repetir el ciclo de prueba después de la corrección.',
            parts: ['Sistema bloqueo puerta'],
        },
    },
    e3_switch: {
        id: 'e3_switch', type: 'measure',
        text: 'Medir la continuidad del interruptor de seguridad de puerta (door switch)',
        detail: 'Con el equipo desenergizado, mide el interruptor: debe cambiar de estado al accionar el cierre de la puerta.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición del interruptor de puerta',
        nextId: 'e3_switch_ok',
    },
    e3_switch_ok: {
        id: 'e3_switch_ok', type: 'question',
        text: '¿El interruptor de puerta no cambia de estado al cerrar?',
        options: [
            { label: 'Sí, el interruptor es defectuoso', nextId: 'e3_result_switch', color: 'danger' },
            { label: 'No, el interruptor cambia correctamente', nextId: 'e3_lock', color: 'success' },
        ],
    },
    e3_result_switch: {
        id: 'e3_result_switch', type: 'result',
        text: 'E3: interruptor de seguridad de puerta defectuoso',
        result: {
            causes: [
                { cause: 'Interruptor de seguridad de puerta (door switch) sin cambio de estado', probability: 80 },
                { cause: 'Conector del interruptor suelto o sulfatado', probability: 20 },
            ],
            recommendation: 'Reemplazar el interruptor de puerta y verificar su conector. Probar que el equipo reconozca la puerta cerrada antes de liberar.',
            parts: ['Interruptor seguridad de puerta'],
        },
    },
    e3_lock: {
        id: 'e3_lock', type: 'measure',
        text: 'Medir si el solenoide de la traba electrónica recibe voltaje al cerrar',
        detail: 'Al cerrar la puerta, la tarjeta debe enviar voltaje al solenoide de la traba (door lock). Mide en sus terminales durante el intento de arranque.',
        gifUri: 'medir-voltaje',
        evidenceLabel: 'Foto del voltaje medido en la traba electrónica',
        nextId: 'e3_lock_ok',
    },
    e3_lock_ok: {
        id: 'e3_lock_ok', type: 'question',
        text: '¿La traba recibe voltaje pero no trava (o trava a medias)?',
        options: [
            { label: 'Sí, recibe voltaje y no trava', nextId: 'e3_result_lock', color: 'danger' },
            { label: 'No recibe voltaje', nextId: 'e3_result_pcb', color: 'danger' },
        ],
    },
    e3_result_lock: {
        id: 'e3_result_lock', type: 'result',
        text: 'E3: traba electrónica de puerta (door lock) averiada',
        result: {
            causes: [
                { cause: 'Solenoide de la traba electrónica quemado o mecánica dañada', probability: 75 },
                { cause: 'Terminales de la cerradura sulfatados', probability: 25 },
            ],
            recommendation: 'Reemplazar la traba electrónica con la referencia del modelo. Limpiar sus terminales y verificar el trabado completo en prueba.',
            parts: ['Sistema bloqueo puerta'],
        },
    },
    e3_result_pcb: {
        id: 'e3_result_pcb', type: 'result',
        text: 'E3: la tarjeta PCB no activa la traba de puerta',
        result: {
            causes: [
                { cause: 'Tarjeta PCB sin salida hacia el solenoide de la traba', probability: 60 },
                { cause: 'Cableado PCB-traba abierto', probability: 40 },
            ],
            recommendation: 'Verificar continuidad del cableado. Con cableado correcto y sin señal, reemplazar la tarjeta PCB principal.',
            parts: ['Tarjeta principal'],
        },
    },
};
// ── E7 — Frenado de giro ─────────────────────────────────────────────────────
const LAV_E7_FRENO = {
    start: {
        id: 'start', type: 'action',
        text: 'Verificar el retractor y la estabilidad de sus conexiones',
        detail: 'El retractor libera el freno para permitir el giro. Revisa su accionamiento, recorrido y que sus conexiones estén firmes.',
        nextId: 'e7_freno',
    },
    e7_freno: {
        id: 'e7_freno', type: 'measure',
        text: 'Medir la continuidad del freno o clutch',
        detail: 'Con el equipo desenergizado, mide el freno/clutch: debe dar continuidad dentro de su especificación y liberar mecánicamente sin agarrote.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición del freno/clutch',
        nextId: 'e7_freno_ok',
    },
    e7_freno_ok: {
        id: 'e7_freno_ok', type: 'question',
        text: '¿El freno o clutch está sin continuidad o agarrotado?',
        options: [
            { label: 'Sí, freno/clutch defectuoso', nextId: 'e7_result_freno', color: 'danger' },
            { label: 'No, el freno mide y libera bien', nextId: 'e7_retractor', color: 'success' },
        ],
    },
    e7_result_freno: {
        id: 'e7_result_freno', type: 'result',
        text: 'E7: freno o clutch dañado',
        result: {
            causes: [
                { cause: 'Freno o clutch con bobina abierta o mecánica agarrotada', probability: 70 },
                { cause: 'Retractor sin fuerza para liberar el freno', probability: 30 },
            ],
            recommendation: 'Reemplazar el freno/clutch con la referencia del modelo y verificar la liberación completa del freno antes del centrifugado.',
            parts: ['Freno o Clutch'],
        },
    },
    e7_retractor: {
        id: 'e7_retractor', type: 'question',
        text: '¿El retractor está dañado o con conexiones flojas?',
        options: [
            { label: 'Sí, el retractor falla', nextId: 'e7_result_retractor', color: 'danger' },
            { label: 'No, el retractor trabaja bien', nextId: 'e7_result_pcb', color: 'neutral' },
        ],
    },
    e7_result_retractor: {
        id: 'e7_result_retractor', type: 'result',
        text: 'E7: retractor dañado',
        result: {
            causes: [
                { cause: 'Retractor con recorrido o fuerza insuficiente', probability: 70 },
                { cause: 'Conector del retractor con falso contacto', probability: 30 },
            ],
            recommendation: 'Reemplazar el retractor y asegurar sus conexiones. Verificar la secuencia completa lavado-centrifugado en prueba.',
            parts: ['Retractor'],
        },
    },
    e7_result_pcb: {
        id: 'e7_result_pcb', type: 'result',
        text: 'E7: la PCB envía señales defectuosas al frenado',
        result: {
            causes: [
                { cause: 'Tarjeta PCB con falla en el envío de señales al freno/retractor', probability: 70 },
                { cause: 'Cableado PCB-freno intermitente', probability: 30 },
            ],
            recommendation: 'Con retractor y freno verificados, probar el modo de servicio del modelo. Si la señal no es correcta, reemplazar la tarjeta PCB.',
            parts: ['Tarjeta principal'],
        },
    },
};
// ── F8 / E33 — Sensor de presión / nivel ─────────────────────────────────────
const LAV_F8_PRESOSTATO = {
    start: {
        id: 'start', type: 'action',
        text: 'Desconectar y soplar la manguera del presostato desde ambos extremos; limpiar su cámara',
        detail: 'Retira la manguera del presostato y sopla desde ambos extremos para retirar obstrucciones. Limpia residuos de jabón endurecido en la cámara del presostato.',
        tip: 'Toma foto de la manguera y la cámara antes y después de la limpieza.',
        nextId: 'f8_clic',
    },
    f8_clic: {
        id: 'f8_clic', type: 'question',
        text: '¿El presostato cambia de estado (clic) al soplar después de la limpieza?',
        options: [
            { label: 'Sí, ya cambia de estado', nextId: 'f8_motor', color: 'success' },
            { label: 'No cambia de estado', nextId: 'f8_result_presostato', color: 'danger' },
        ],
    },
    f8_result_presostato: {
        id: 'f8_result_presostato', type: 'result',
        text: 'F8: presostato (sensor de nivel) defectuoso',
        result: {
            causes: [
                { cause: 'Presostato con diafragma o cámara dañada', probability: 55 },
                { cause: 'Manguera del presostato obstruida o pinchada', probability: 45 },
            ],
            recommendation: 'Con manguera limpia y sin clic de cambio de estado, reemplazar el presostato con la referencia del modelo. Verificar el llenado y el centrifugado en prueba.',
            parts: ['Presostato'],
        },
    },
    f8_motor: {
        id: 'f8_motor', type: 'measure',
        text: 'Medir los embobinados del motor (posible deficiencia que dispara F8)',
        detail: 'El código F8 también puede originarse por deficiencia en el embobinado del motor. Mide las bobinas desenergizado: ninguna en abierto y valores equilibrados.',
        gifUri: 'medir-bobinas',
        evidenceLabel: 'Foto de la medición de los embobinados del motor',
        nextId: 'f8_motor_ok',
    },
    f8_motor_ok: {
        id: 'f8_motor_ok', type: 'question',
        text: '¿Los embobinados del motor están desbalanceados o abiertos?',
        options: [
            { label: 'Sí, el motor mide mal', nextId: 'f8_result_motor', color: 'danger' },
            { label: 'No, el motor mide bien', nextId: 'f8_result_pcb', color: 'neutral' },
        ],
    },
    f8_result_motor: {
        id: 'f8_result_motor', type: 'result',
        text: 'F8: deficiencia en el embobinado del motor',
        result: {
            causes: [
                { cause: 'Embobinado del motor desbalanceado o en corto espiral', probability: 75 },
                { cause: 'Conector del motor con resistencia de contacto', probability: 25 },
            ],
            recommendation: 'Con motor fuera de especificación, reemplazarlo con la referencia exacta. Verificar que el código F8 no reaparezca en ciclo completo.',
            parts: ['Motor'],
        },
    },
    f8_result_pcb: {
        id: 'f8_result_pcb', type: 'result',
        text: 'F8: lectura del sensor de nivel con falla en la tarjeta',
        result: {
            causes: [
                { cause: 'Conector o cableado del presostato con fuga o falso contacto', probability: 55 },
                { cause: 'Entrada del presostato en la tarjeta PCB dañada', probability: 45 },
            ],
            recommendation: 'Verificar el conector y el cableado del presostato hasta la tarjeta. Con cableado correcto y el código persistente, reemplazar la tarjeta PCB.',
            parts: ['Presostato', 'Tarjeta principal'],
        },
    },
};
// ── FD — Bloqueo de voltaje en cerradura electrónica ─────────────────────────
const LAV_FD_CERRADURA = {
    start: {
        id: 'start', type: 'action',
        text: 'Descartar interferencias y verificar el espétillo de la puerta',
        detail: 'Verifica que el espétillo (lengüeta metálica) haga contacto correcto y que no haya interferencias (objetos metánicos, suciedad) en el cierre.',
        nextId: 'fd_continuidad',
    },
    fd_continuidad: {
        id: 'fd_continuidad', type: 'measure',
        text: 'Medir la continuidad de los cables de la cerradura electrónica',
        detail: 'Con el equipo desenergizado, mide los cables de la cerradura de extremo a extremo: deben dar continuidad. Revisa terminales sulfatados o rotos.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición de continuidad de los cables de la cerradura',
        nextId: 'fd_continuidad_ok',
    },
    fd_continuidad_ok: {
        id: 'fd_continuidad_ok', type: 'question',
        text: '¿Los cables están sin continuidad o los terminales sulfatados?',
        options: [
            { label: 'Sí, cableado o terminales defectuosos', nextId: 'fd_result_cables', color: 'danger' },
            { label: 'No, el cableado mide bien', nextId: 'fd_voltaje', color: 'success' },
        ],
    },
    fd_result_cables: {
        id: 'fd_result_cables', type: 'result',
        text: 'FD: cableado de la cerradura sin continuidad',
        result: {
            causes: [
                { cause: 'Cables rotos o sin continuidad hacia la cerradura', probability: 70 },
                { cause: 'Terminales de la cerradura dañados o sulfatados', probability: 30 },
            ],
            recommendation: 'Reparar o reemplazar el cableado y limpiar/rehacer los terminales. Verificar el trabado completo de la puerta en prueba.',
            parts: ['Arnés de cableado', 'Sistema bloqueo puerta'],
        },
    },
    fd_voltaje: {
        id: 'fd_voltaje', type: 'measure',
        text: 'Medir si la cerradura recibe voltaje al momento de trabar',
        detail: 'Al cerrar la puerta e iniciar el ciclo, mide voltaje en los terminales de la cerradura electrónica.',
        gifUri: 'medir-voltaje',
        evidenceLabel: 'Foto del voltaje medido en la cerradura electrónica',
        nextId: 'fd_voltaje_ok',
    },
    fd_voltaje_ok: {
        id: 'fd_voltaje_ok', type: 'question',
        text: '¿La cerradura recibe voltaje y no funciona correctamente?',
        options: [
            { label: 'Sí, recibe voltaje y falla', nextId: 'fd_result_cerradura', color: 'danger' },
            { label: 'No recibe voltaje', nextId: 'fd_result_pcb', color: 'danger' },
        ],
    },
    fd_result_cerradura: {
        id: 'fd_result_cerradura', type: 'result',
        text: 'FD: cerradura electrónica dañada',
        result: {
            causes: [
                { cause: 'Cerradura electrónica dañada (solenoide o mecánica)', probability: 75 },
                { cause: 'Daño mecánico del mecanismo de cierre', probability: 25 },
            ],
            recommendation: 'Reemplazar la cerradura electrónica con la referencia del modelo. Verificar recepción de voltaje y trabado completo en prueba.',
            parts: ['Sistema bloqueo puerta'],
        },
    },
    fd_result_pcb: {
        id: 'fd_result_pcb', type: 'result',
        text: 'FD: la tarjeta PCB no alimenta la cerradura',
        result: {
            causes: [
                { cause: 'Tarjeta PCB con falla en la salida de la cerradura', probability: 70 },
                { cause: 'Conector PCB-cerradura con falso contacto', probability: 30 },
            ],
            recommendation: 'Con cableado correcto y sin voltaje en la cerradura, reemplazar la tarjeta PCB principal.',
            parts: ['Tarjeta principal'],
        },
    },
};
// ── C8 / E61 / E62 / E64 — Comunicación PCB ↔ tarjeta inverter ───────────────
const LAV_C8_COM_INVERTER = {
    start: {
        id: 'start', type: 'action',
        text: 'Reconectar la tarjeta PCB a la tarjeta inverter e inspeccionar los conectores',
        detail: 'Desconecta y reconecta los conectores PCB↔inverter. Revisa que no haya sulfatación, pines doblados o falsos contactos.',
        tip: 'Toma foto del estado de los conectores antes de la reconexión.',
        nextId: 'c8_conector',
    },
    c8_conector: {
        id: 'c8_conector', type: 'question',
        text: '¿Los conectores están sulfatados o sin contacto?',
        options: [
            { label: 'Sí, conectores defectuosos', nextId: 'c8_result_conector', color: 'danger' },
            { label: 'No, los conectores están limpios y firmes', nextId: 'c8_continuidad', color: 'success' },
        ],
    },
    c8_result_conector: {
        id: 'c8_result_conector', type: 'result',
        text: 'C8: falla de contactos entre PCB y tarjeta inverter',
        result: {
            causes: [
                { cause: 'Conectores sulfatados o sin contacto', probability: 60 },
                { cause: 'Cableado de comunicación con falso contacto', probability: 40 },
            ],
            recommendation: 'Limpiar o reemplazar los conectores y reasentar firmemente. Verificar que la comunicación se restablezca con un ciclo de prueba.',
            parts: ['Arnés de cableado'],
        },
    },
    c8_continuidad: {
        id: 'c8_continuidad', type: 'measure',
        text: 'Medir la continuidad del cableado PCB ↔ tarjeta inverter',
        detail: 'Con el equipo desenergizado, mide cada hilo del cableado de comunicación de extremo a extremo.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición del cableado de comunicación',
        nextId: 'c8_continuidad_ok',
    },
    c8_continuidad_ok: {
        id: 'c8_continuidad_ok', type: 'question',
        text: '¿El cableado de comunicación está sin continuidad?',
        options: [
            { label: 'Sí, cableado abierto', nextId: 'c8_result_cable', color: 'danger' },
            { label: 'No, el cableado mide completo', nextId: 'c8_voltaje', color: 'success' },
        ],
    },
    c8_result_cable: {
        id: 'c8_result_cable', type: 'result',
        text: 'C8: cableado de comunicación sin continuidad',
        result: {
            causes: [
                { cause: 'Cableado entre PCB y tarjeta inverter interrumpido', probability: 75 },
                { cause: 'Terminal intermedio suelto o sulfatado', probability: 25 },
            ],
            recommendation: 'Reparar o reemplazar el cableado de comunicación y rehacer terminales. Repetir el ciclo verificando que no reaparezca el código.',
            parts: ['Arnés de cableado'],
        },
    },
    c8_voltaje: {
        id: 'c8_voltaje', type: 'question',
        text: '¿El voltaje en la tarjeta motor (inverter) está ausente o fuera de 120 V ±10 %?',
        detail: 'Ya registraste el voltaje en la salida de la tarjeta Inverter al inicio del diagnóstico. Verifica con esa medición: un voltaje bajo o inestable impide la comunicación correcta. Si la salida no coincide con la alimentación de la tarjeta motor, mide en la entrada de esta.',
        options: [
            { label: 'Sí, voltaje ausente o fuera de 120 V ±10 %', nextId: 'c8_result_pcb', color: 'danger' },
            { label: 'No, el voltaje es correcto', nextId: 'c8_result_inverter', color: 'neutral' },
        ],
    },
    c8_voltaje_ok: {
        id: 'c8_voltaje_ok', type: 'question',
        text: '¿El voltaje en la tarjeta motor está ausente o fuera de rango?',
        options: [
            { label: 'Sí, voltaje ausente o fuera de 120 V ±10 %', nextId: 'c8_result_pcb', color: 'danger' },
            { label: 'No, el voltaje es correcto', nextId: 'c8_result_inverter', color: 'neutral' },
        ],
    },
    c8_result_pcb: {
        id: 'c8_result_pcb', type: 'result',
        text: 'C8: la tarjeta PCB no alimenta correctamente la inverter',
        result: {
            causes: [
                { cause: 'Tarjeta PCB con falla en la alimentación hacia la inverter', probability: 65 },
                { cause: 'Cableado de alimentación deteriorado', probability: 35 },
            ],
            recommendation: 'Verificar el cableado de alimentación y las salidas de la PCB. Sin alimentación correcta desde la tarjeta, reemplazar la tarjeta PCB.',
            parts: ['Tarjeta principal'],
        },
    },
    c8_result_inverter: {
        id: 'c8_result_inverter', type: 'result',
        text: 'C8: la tarjeta inverter no reconoce las señales',
        result: {
            causes: [
                { cause: 'Tarjeta inverter con etapa de comunicación dañada', probability: 70 },
                { cause: 'Tarjeta PCB con señal de comunicación defectuosa', probability: 30 },
            ],
            recommendation: 'Con alimentación y cableado verificados, reemplazar la tarjeta inverter; si el código persiste con la inverter nueva, reemplazar la tarjeta PCB.',
            parts: ['Tarjeta inverter', 'Tarjeta principal'],
        },
    },
};
// ── E34 / E35 / E36 / E3A — Sensor de temperatura y resistencia (lavado) ─────
const LAV_E34_TEMP = {
    start: {
        id: 'start', type: 'measure',
        text: 'Medir el sensor NTC de temperatura del agua (≈10 kΩ a 25 °C)',
        detail: 'Desconecta el NTC y mide su resistencia comparando con la tabla NTC a la temperatura ambiente. Un sensor en corto o abierto dispara el código.',
        ntcTable: true,
        evidenceLabel: 'Foto de la resistencia del NTC comparada con la tabla',
        nextId: 'e34_ntc_ok',
    },
    e34_ntc_ok: {
        id: 'e34_ntc_ok', type: 'question',
        text: '¿El NTC está en corto, abierto o descalibrado?',
        options: [
            { label: 'Sí, el NTC está defectuoso', nextId: 'e34_result_ntc', color: 'danger' },
            { label: 'No, el NTC mide acorde a la tabla', nextId: 'e34_resistencia', color: 'success' },
        ],
    },
    e34_result_ntc: {
        id: 'e34_result_ntc', type: 'result',
        text: 'Sensor NTC de temperatura del agua defectuoso',
        result: {
            causes: [
                { cause: 'Sensor NTC en corto o circuito abierto', probability: 60 },
                { cause: 'Conector del sensor suelto o con corrosión', probability: 40 },
            ],
            recommendation: 'Reemplazar el sensor NTC con la referencia del modelo y limpiar su conector. Verificar con la tabla NTC después del cambio.',
            parts: ['Sensor NTC de temperatura'],
        },
    },
    e34_resistencia: {
        id: 'e34_resistencia', type: 'measure',
        text: 'Medir la continuidad de la resistencia calefactora (≈20–50 Ω)',
        detail: 'Con el equipo desenergizado, mide la resistencia calefactora en sus terminales: debe marcar entre 20 y 50 Ω. Abierta = quemada.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición de la resistencia calefactora',
        nextId: 'e34_res_ok',
    },
    e34_res_ok: {
        id: 'e34_res_ok', type: 'question',
        text: '¿La resistencia calefactora está abierta o fuera de rango?',
        options: [
            { label: 'Sí, la resistencia está quemada', nextId: 'e34_result_res', color: 'danger' },
            { label: 'No, la resistencia mide bien', nextId: 'e34_klixon', color: 'success' },
        ],
    },
    e34_result_res: {
        id: 'e34_result_res', type: 'result',
        text: 'Resistencia calefactora quemada',
        result: {
            causes: [
                { cause: 'Resistencia calefactora (heating element) abierta', probability: 80 },
                { cause: 'Terminales de la resistencia con corrosión', probability: 20 },
            ],
            recommendation: 'Reemplazar la resistencia calefactora con la referencia del modelo. Revisar la escala (sarro) que acorta su vida útil.',
            parts: ['Resistencia calefactora'],
        },
    },
    e34_klixon: {
        id: 'e34_klixon', type: 'measure',
        text: 'Medir el termostato de seguridad pegado al elemento calefactor',
        detail: 'El termostato de seguridad debe dar continuidad en frío. Si quedó activado permanentemente (abierto), bloquea el calentamiento.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición del termostato de seguridad',
        nextId: 'e34_klixon_ok',
    },
    e34_klixon_ok: {
        id: 'e34_klixon_ok', type: 'question',
        text: '¿El termostato de seguridad está abierto permanentemente?',
        options: [
            { label: 'Sí, termostato activado permanentemente', nextId: 'e34_result_klixon', color: 'danger' },
            { label: 'No, el termostato da continuidad', nextId: 'e34_result_conector', color: 'neutral' },
        ],
    },
    e34_result_klixon: {
        id: 'e34_result_klixon', type: 'result',
        text: 'Termostato de seguridad activado permanentemente',
        result: {
            causes: [
                { cause: 'Termostato de seguridad pegado abierto tras un sobrecalentamiento', probability: 70 },
                { cause: 'Resistencia trabajando sin control por falla previa de NTC', probability: 30 },
            ],
            recommendation: 'Reemplazar el termostato de seguridad (no se rearma de forma confiable) y confirmar que el NTC y la tarjeta regulan la temperatura correctamente.',
            parts: ['Termostato de seguridad'],
        },
    },
    e34_result_conector: {
        id: 'e34_result_conector', type: 'result',
        text: 'Conectores o tarjeta con falla en la lectura de temperatura',
        result: {
            causes: [
                { cause: 'Conector del sensor o de la resistencia con corrosión', probability: 60 },
                { cause: 'Entrada de lectura de temperatura en la tarjeta PCB dañada', probability: 40 },
            ],
            recommendation: 'Limpiar/rehacer los conectores del circuito de temperatura. Si el código persiste con todo midiendo bien, reemplazar la tarjeta PCB.',
            parts: ['Tarjeta principal'],
        },
    },
};
// ── E37 / E38 — Sensor o resistencia de la zona de SECADO ────────────────────
const LAV_E37_SECADO = {
    start: {
        id: 'start', type: 'measure',
        text: 'Medir el sensor NTC de la zona de secado',
        detail: 'Con el equipo desenergizado, mide el NTC de secado y compara con la tabla NTC a la temperatura ambiente.',
        ntcTable: true,
        evidenceLabel: 'Foto de la medición del NTC de secado',
        nextId: 'e37_ntc_ok',
    },
    e37_ntc_ok: {
        id: 'e37_ntc_ok', type: 'question',
        text: '¿El NTC de secado está en corto, abierto o descalibrado?',
        options: [
            { label: 'Sí, el NTC está defectuoso', nextId: 'e37_result_ntc', color: 'danger' },
            { label: 'No, el NTC mide bien', nextId: 'e37_resistencia', color: 'success' },
        ],
    },
    e37_result_ntc: {
        id: 'e37_result_ntc', type: 'result',
        text: 'Sensor NTC de la zona de secado defectuoso',
        result: {
            causes: [
                { cause: 'NTC de secado en corto o circuito abierto', probability: 60 },
                { cause: 'Conector del sensor suelto o con corrosión', probability: 40 },
            ],
            recommendation: 'Reemplazar el sensor NTC de secado y revisar su conector. Verificar la lectura con la tabla después del cambio.',
            parts: ['Sensor NTC de secado'],
        },
    },
    e37_resistencia: {
        id: 'e37_resistencia', type: 'measure',
        text: 'Medir la resistencia calefactora de secado (continuidad)',
        detail: 'Mide la resistencia de secado en sus terminales: debe dar continuidad dentro de especificación. Abierta = quemada.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición de la resistencia de secado',
        nextId: 'e37_res_ok',
    },
    e37_res_ok: {
        id: 'e37_res_ok', type: 'question',
        text: '¿La resistencia de secado está abierta?',
        options: [
            { label: 'Sí, está quemada', nextId: 'e37_result_res', color: 'danger' },
            { label: 'No, mide bien', nextId: 'e37_klixon', color: 'success' },
        ],
    },
    e37_result_res: {
        id: 'e37_result_res', type: 'result',
        text: 'Resistencia de secado quemada',
        result: {
            causes: [
                { cause: 'Resistencia calefactora de secado abierta', probability: 80 },
                { cause: 'Terminales con corrosión o falso contacto', probability: 20 },
            ],
            recommendation: 'Reemplazar la resistencia de secado con la referencia del modelo y revisar el flujo de aire del ducto (un ducto obstruido la sobrecalienta).',
            parts: ['Resistencia de secado'],
        },
    },
    e37_klixon: {
        id: 'e37_klixon', type: 'measure',
        text: 'Medir el termostato de seguridad de la zona de secado',
        detail: 'Debe dar continuidad en frío. Activado permanentemente bloquea el secado y dispara el código.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición del termostato de seguridad de secado',
        nextId: 'e37_klixon_ok',
    },
    e37_klixon_ok: {
        id: 'e37_klixon_ok', type: 'question',
        text: '¿El termostato de seguridad está abierto permanentemente?',
        options: [
            { label: 'Sí, activado permanentemente', nextId: 'e37_result_klixon', color: 'danger' },
            { label: 'No, da continuidad', nextId: 'e37_result_conector', color: 'neutral' },
        ],
    },
    e37_result_klixon: {
        id: 'e37_result_klixon', type: 'result',
        text: 'Termostato de seguridad de secado activado',
        result: {
            causes: [
                { cause: 'Termostato de seguridad de la zona de secado pegado abierto', probability: 70 },
                { cause: 'Sobrecalentamiento previo por ducto o filtro obstruido', probability: 30 },
            ],
            recommendation: 'Reemplazar el termostato de seguridad y limpiar ductos/filtros de pelusa para eliminar la causa del sobrecalentamiento.',
            parts: ['Termostato de seguridad'],
        },
    },
    e37_result_conector: {
        id: 'e37_result_conector', type: 'result',
        text: 'Conectores o tarjeta con falla en la lectura de secado',
        result: {
            causes: [
                { cause: 'Conectores del circuito de secado con corrosión', probability: 60 },
                { cause: 'Entrada de lectura en la tarjeta PCB dañada', probability: 40 },
            ],
            recommendation: 'Limpiar/rehacer conectores. Con todo midiendo bien y el código persistente, reemplazar la tarjeta PCB.',
            parts: ['Tarjeta principal'],
        },
    },
};
// ── E12 — Sobrellenado (nivel supera el límite de alarma) ────────────────────
const LAV_E12_SOBRELLENADO = {
    start: {
        id: 'start', type: 'question',
        text: '¿La máquina sigue llenando incluso desconectada de la red (o tras reiniciar no detiene el llenado)?',
        detail: 'Primero intenta reiniciar (desconectar 5 min). Si el llenado no se detiene al desconectar, la electroválvula quedó pegada abierta.',
        options: [
            { label: 'Sí, llena incluso desconectada', nextId: 'e12_result_valvula', color: 'danger' },
            { label: 'No, solo llena conectada', nextId: 'e12_presostato', color: 'danger' },
        ],
    },
    e12_result_valvula: {
        id: 'e12_result_valvula', type: 'result',
        text: 'E12: electroválvula de entrada pegada abierta',
        result: {
            causes: [
                { cause: 'Electroválvula con membrana pegada o sedimentos que impiden el cierre', probability: 80 },
                { cause: 'Electroválvula mecánicamente gastada', probability: 20 },
            ],
            recommendation: 'Reemplazar la electroválvula de entrada y limpiar el filtro de malla. Verificar que cierre completamente sin alimentación.',
            parts: ['Electroválvula'],
        },
    },
    e12_presostato: {
        id: 'e12_presostato', type: 'question',
        text: '¿El presostato cambia de estado (clic) al soplar su manguera?',
        detail: 'Desconecta y sopla la manguera del presostato: el cambio de estado "nivel alto" es lo que detiene el llenado.',
        options: [
            { label: 'No cambia o marca intermitente', nextId: 'e12_result_presostato', color: 'danger' },
            { label: 'Sí, cambia correctamente', nextId: 'e12_result_pcb', color: 'neutral' },
        ],
    },
    e12_result_presostato: {
        id: 'e12_result_presostato', type: 'result',
        text: 'E12: sensor de nivel no detecta el nivel alto',
        result: {
            causes: [
                { cause: 'Manguera del presostato bloqueada o tapada', probability: 45 },
                { cause: 'Presostato (sensor de nivel) defectuoso', probability: 55 },
            ],
            recommendation: 'Limpiar la manguera y la cámara del presostato. Si no cambia de estado, reemplazar el presostato.',
            parts: ['Presostato'],
        },
    },
    e12_result_pcb: {
        id: 'e12_result_pcb', type: 'result',
        text: 'E12: la tarjeta PCB no cierra la señal de la electroválvula',
        result: {
            causes: [
                { cause: 'Tarjeta PCB con triac/driver de válvula pegado o dañado', probability: 70 },
                { cause: 'Señal de nivel con fuga que engaña a la tarjeta', probability: 30 },
            ],
            recommendation: 'Verificar la señal del presostato en la tarjeta. Con señal correcta y la válvula energizada sin orden, reemplazar la tarjeta PCB.',
            parts: ['Tarjeta principal'],
        },
    },
};
// ── E50 — Señales anormales en la tarjeta inverter del motor ─────────────────
const LAV_E50_INVERTER = {
    start: {
        id: 'start', type: 'question',
        text: '¿El voltaje de alimentación de la tarjeta inverter del motor está inestable o fuera de 120 V ±10 %?',
        detail: 'Ya registraste el voltaje en la salida de la tarjeta Inverter al inicio del diagnóstico. Verifica con esa medición: un voltaje inestable dispara la protección E50. Si la salida no coincide con la alimentación de la tarjeta del motor, mide en la entrada de esta.',
        options: [
            { label: 'Sí, voltaje inestable o bajo', nextId: 'e50_result_red', color: 'danger' },
            { label: 'No, el voltaje es estable y correcto', nextId: 'e50_bobinas', color: 'success' },
        ],
    },
    e50_voltaje_ok: {
        id: 'e50_voltaje_ok', type: 'question',
        text: '¿El voltaje de red está inestable o fuera de 120 V ±10 %?',
        options: [
            { label: 'Sí, voltaje inestable o bajo', nextId: 'e50_result_red', color: 'danger' },
            { label: 'No, el voltaje es estable y correcto', nextId: 'e50_bobinas', color: 'success' },
        ],
    },
    e50_result_red: {
        id: 'e50_result_red', type: 'result',
        text: 'E50: voltaje AC inestable hacia la tarjeta inverter',
        result: {
            causes: [
                { cause: 'Voltaje de red con caídas o microcortes', probability: 55 },
                { cause: 'Cableado o conector de alimentación deteriorado', probability: 45 },
            ],
            recommendation: 'Medir el voltaje durante la falla y probar en otro circuito. Reparar cableado/conectores de alimentación; si la red es inestable, informar al cliente (instalación eléctrica).',
            parts: ['Ajuste eléctrico'],
        },
    },
    e50_bobinas: {
        id: 'e50_bobinas', type: 'measure',
        text: 'Medir las bobinas del motor inverter (U-V, U-W, V-W) desenergizado',
        detail: 'Desconecta los cables del motor y mide las tres fases: U-V, U-W y V-W. Las tres lecturas deben ser IDÉNTICAS entre sí (balance de fases) y dentro del rango de la placa del motor (típicamente 1–10 Ω según el modelo). Una diferencia mayor al 10 % entre fases indica corto entre espiras; ∞ indica devanado abierto.',
        tip: 'Compara siempre con el valor de placa del motor. Las fases deben cumplir equilibrio: |U-V − U-W| ≤ 10 % del valor.',
        gifUri: 'medir-bobinas',
        evidenceLabel: 'Foto de las tres mediciones (U-V, U-W, V-W) y la placa del motor',
        nextId: 'e50_bobinas_ok',
    },
    e50_bobinas_ok: {
        id: 'e50_bobinas_ok', type: 'question',
        text: '¿Las tres fases miden idénticas entre sí y dentro del rango de placa?',
        options: [
            { label: 'Sí, balanceadas y en rango', nextId: 'e50_tierra', color: 'success' },
            { label: 'No, desbalanceadas, abiertas o fuera de rango', nextId: 'e50_result_motor', color: 'danger' },
        ],
    },
    e50_tierra: {
        id: 'e50_tierra', type: 'measure',
        text: 'Verificar aislamiento a tierra de las bobinas del motor (U, V, W contra carcasa)',
        detail: 'Mide entre cada terminal del motor (U, V, W) y el cuerpo metálico del motor. Debe marcar ABIERTO (∞ / OL) en las tres. Continuidad o menos de 2 MΩ significa bobinas caídas a tierra: es la causa más común de que el módulo inverter reporte señales anormales (E50).',
        tip: 'Una fuga a tierra del motor destruye el IGBT del módulo: valida el aislamiento ANTES de cambiar la tarjeta inverter, o quemarás el repuesto nuevo.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición de U, V y W contra la carcasa del motor (debe marcar OL/∞)',
        nextId: 'e50_tierra_ok',
    },
    e50_tierra_ok: {
        id: 'e50_tierra_ok', type: 'question',
        text: '¿Las bobinas del motor están caídas a tierra (continuidad con la carcasa)?',
        options: [
            { label: 'Sí, hay fuga a tierra', nextId: 'e50_result_tierra', color: 'danger' },
            { label: 'No, aislamiento correcto (OL)', nextId: 'e50_result_inverter', color: 'neutral' },
        ],
    },
    e50_result_tierra: {
        id: 'e50_result_tierra', type: 'result',
        text: 'E50: motor con bobinas caídas a tierra — reemplazo obligatorio',
        result: {
            causes: [
                { cause: 'Aislamiento de los devanados degradado (fuga a tierra detectada por la inverter)', probability: 85 },
                { cause: 'Humedad en el motor o su conector conduciendo a la carcasa', probability: 15 },
            ],
            recommendation: 'El motor no es reparable: reemplazarlo con la referencia exacta. NO instalar tarjeta inverter nueva sin cambiar el motor: la fuga a tierra destruye el IGBT del módulo al energizar. Secar y proteger el área del conector si hubo humedad.',
            parts: ['Motor'],
        },
    },
    e50_result_motor: {
        id: 'e50_result_motor', type: 'result',
        text: 'E50: motor con embobinados defectuosos',
        result: {
            causes: [
                { cause: 'Embobinado del motor desbalanceado o con corto espiral', probability: 75 },
                { cause: 'Bloqueo mecánico que sobrecarga el motor', probability: 25 },
            ],
            recommendation: 'Con motor fuera de especificación, reemplazarlo con la referencia exacta. Verificar que el tambor gire libre antes de energizar el motor nuevo.',
            parts: ['Motor'],
        },
    },
    e50_result_inverter: {
        id: 'e50_result_inverter', type: 'result',
        text: 'E50: tarjeta inverter con sensores o IPM dañados',
        result: {
            causes: [
                { cause: 'IPM o sensores de corriente/temperatura de la inverter dañados', probability: 60 },
                { cause: 'Sobrecarga transitoria por bloqueo previo del motor', probability: 40 },
            ],
            recommendation: 'Con red y motor verificados, reemplazar la tarjeta inverter del motor. Verificar que el motor gire libre para no dañar la tarjeta nueva.',
            parts: ['Tarjeta inverter'],
        },
    },
};
// ── E58 — Sobrecarga del motor / fase abierta ────────────────────────────────
const LAV_E58_SOBRECARGA = {
    start: {
        id: 'start', type: 'action',
        text: 'Verificar que el tambor gira libre (descartar bloqueo mecánico)',
        detail: 'Desenergiza y gira el tambor a mano. Un objeto atascado o un rodamiento agarrotado sobrecarga el motor y dispara el código.',
        nextId: 'e58_bloqueo',
    },
    e58_bloqueo: {
        id: 'e58_bloqueo', type: 'question',
        text: '¿La tina o el tambor están trabados o cuestan girar?',
        options: [
            { label: 'Sí, hay bloqueo mecánico', nextId: 'e58_result_bloqueo', color: 'danger' },
            { label: 'No, gira libre', nextId: 'e58_bobinas', color: 'success' },
        ],
    },
    e58_result_bloqueo: {
        id: 'e58_result_bloqueo', type: 'result',
        text: 'E58: bloqueo mecánico que sobrecarga el motor',
        result: {
            causes: [
                { cause: 'Objeto extraño entre tina y tambor', probability: 55 },
                { cause: 'Rodamiento del tambor pegado o con fricción extrema', probability: 45 },
            ],
            recommendation: 'Retirar el objeto o reemplazar el kit de rodamientos. Verificar giro libre y amperaje del motor antes de liberar.',
            parts: ['Rodamiento'],
        },
    },
    e58_bobinas: {
        id: 'e58_bobinas', type: 'measure',
        text: 'Medir las bobinas del motor inverter (U-V, U-W, V-W) desenergizado',
        detail: 'Desconecta los cables del motor y mide las tres fases: U-V, U-W y V-W. Deben ser idénticas entre sí (diferencia máxima 10 %) y dentro del rango de placa (típicamente 1–10 Ω). Una fase en ∞ = devanado abierto (causa directa de E58). Un valor por debajo de placa = corto entre espiras que eleva la corriente.',
        tip: 'La fase abierta es la causa clásica del código E58 (sobrecarga por fase perdida). Compara las tres lecturas entre sí y con la placa.',
        gifUri: 'medir-bobinas',
        evidenceLabel: 'Foto de las tres mediciones (U-V, U-W, V-W) y la placa del motor',
        nextId: 'e58_bobinas_ok',
    },
    e58_bobinas_ok: {
        id: 'e58_bobinas_ok', type: 'question',
        text: '¿Las tres fases miden idénticas, en rango y ninguna abierta?',
        options: [
            { label: 'Sí, balanceadas y en rango', nextId: 'e58_tierra', color: 'success' },
            { label: 'No, hay fase abierta, corto o desbalanceo', nextId: 'e58_result_motor', color: 'danger' },
        ],
    },
    e58_tierra: {
        id: 'e58_tierra', type: 'measure',
        text: 'Verificar aislamiento a tierra de las bobinas del motor (U, V, W contra carcasa)',
        detail: 'Mide entre cada terminal (U, V, W) y el cuerpo metálico del motor: debe marcar ABIERTO (∞ / OL). Una fuga a tierra eleva la corriente de fuga que la tarjeta inverter interpreta como sobrecarga.',
        tip: 'Valida el aislamiento ANTES de reemplazar la tarjeta inverter: el motor caído a tierra destruye el IGBT del módulo nuevo.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición de U, V y W contra la carcasa (debe marcar OL/∞)',
        nextId: 'e58_tierra_ok',
    },
    e58_tierra_ok: {
        id: 'e58_tierra_ok', type: 'question',
        text: '¿Las bobinas están caídas a tierra (continuidad con la carcasa)?',
        options: [
            { label: 'Sí, hay fuga a tierra', nextId: 'e58_result_tierra', color: 'danger' },
            { label: 'No, aislamiento correcto (OL)', nextId: 'e58_voltaje', color: 'neutral' },
        ],
    },
    e58_result_tierra: {
        id: 'e58_result_tierra', type: 'result',
        text: 'E58: motor con bobinas caídas a tierra — reemplazo obligatorio',
        result: {
            causes: [
                { cause: 'Aislamiento de los devanados degradado (la fuga a tierra dispara la protección de sobrecorriente)', probability: 85 },
                { cause: 'Humedad en el motor o conector conduciendo a tierra', probability: 15 },
            ],
            recommendation: 'Reemplazar el motor con la referencia exacta. NO instalar tarjeta inverter nueva sin corregir el motor: la fuga a tierra destruye el módulo al energizar.',
            parts: ['Motor'],
        },
    },
    e58_result_motor: {
        id: 'e58_result_motor', type: 'result',
        text: 'E58: motor con embobinado abierto',
        result: {
            causes: [
                { cause: 'Embobinado del motor con fase abierta', probability: 75 },
                { cause: 'Conector del motor con resistencia de contacto alta', probability: 25 },
            ],
            recommendation: 'Reemplazar el motor con la referencia exacta. Revisar el conector del motor antes de conectar el repuesto.',
            parts: ['Motor'],
        },
    },
    e58_voltaje: {
        id: 'e58_voltaje', type: 'question',
        text: '¿El voltaje de alimentación de la tarjeta inverter está fuera de 120 V ±10 %?',
        detail: 'Ya registraste el voltaje en la salida de la tarjeta Inverter al inicio del diagnóstico. Verifica con esa medición. Si la salida no coincide con la alimentación de la tarjeta del motor, mide en la entrada de esta.',
        options: [
            { label: 'Sí, voltaje fuera de rango', nextId: 'e58_result_red', color: 'danger' },
            { label: 'No, el voltaje es correcto', nextId: 'e58_result_inverter', color: 'neutral' },
        ],
    },
    e58_voltaje_ok: {
        id: 'e58_voltaje_ok', type: 'question',
        text: '¿El voltaje está fuera de 120 V ±10 %?',
        options: [
            { label: 'Sí, voltaje fuera de rango', nextId: 'e58_result_red', color: 'danger' },
            { label: 'No, el voltaje es correcto', nextId: 'e58_result_inverter', color: 'neutral' },
        ],
    },
    e58_result_red: {
        id: 'e58_result_red', type: 'result',
        text: 'E58: alimentación deficiente hacia la inverter',
        result: {
            causes: [
                { cause: 'Voltaje de red bajo o inestable', probability: 55 },
                { cause: 'Cableado/conector de alimentación deteriorado', probability: 45 },
            ],
            recommendation: 'Reparar la alimentación (cableado, conectores) y verificar el circuito eléctrico del sitio si el voltaje de red es bajo.',
            parts: ['Ajuste eléctrico'],
        },
    },
    e58_result_inverter: {
        id: 'e58_result_inverter', type: 'result',
        text: 'E58: IPM de la tarjeta inverter leyendo señales erróneas',
        result: {
            causes: [
                { cause: 'IPM de la tarjeta inverter dañado', probability: 70 },
                { cause: 'Sensores de corriente de la inverter degradados', probability: 30 },
            ],
            recommendation: 'Con red, bloqueo y motor descartados, reemplazar la tarjeta inverter del motor.',
            parts: ['Tarjeta inverter'],
        },
    },
};
// ── E60 — El motor no gira tras varios intentos ──────────────────────────────
const LAV_E60_MOTOR = {
    start: {
        id: 'start', type: 'action',
        text: 'Reconectar la tarjeta PCB al motor e inspeccionar conectores',
        detail: 'Desconecta y reconecta los conectores PCB↔motor. Revisa sulfatación, pines doblados y falsos contactos.',
        tip: 'Toma foto del estado de los conectores antes de reconectar.',
        nextId: 'e60_conector',
    },
    e60_conector: {
        id: 'e60_conector', type: 'question',
        text: '¿Los conectores están sulfatados o sin contacto?',
        options: [
            { label: 'Sí, conectores defectuosos', nextId: 'e60_result_conector', color: 'danger' },
            { label: 'No, están limpios y firmes', nextId: 'e60_continuidad', color: 'success' },
        ],
    },
    e60_result_conector: {
        id: 'e60_result_conector', type: 'result',
        text: 'E60: falla de contactos entre PCB y motor',
        result: {
            causes: [
                { cause: 'Conectores sulfatados o sin contacto', probability: 65 },
                { cause: 'Cableado con falso contacto', probability: 35 },
            ],
            recommendation: 'Limpiar o reemplazar conectores y reasentar firmemente. Verificar el arranque del motor en ciclo de prueba.',
            parts: ['Arnés de cableado'],
        },
    },
    e60_continuidad: {
        id: 'e60_continuidad', type: 'measure',
        text: 'Medir la continuidad del cableado PCB ↔ motor',
        detail: 'Con el equipo desenergizado, mide cada hilo del cableado entre la tarjeta y el motor.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición del cableado PCB-motor',
        nextId: 'e60_continuidad_ok',
    },
    e60_continuidad_ok: {
        id: 'e60_continuidad_ok', type: 'question',
        text: '¿El cableado está sin continuidad?',
        options: [
            { label: 'Sí, cableado abierto', nextId: 'e60_result_cable', color: 'danger' },
            { label: 'No, mide completo', nextId: 'e60_voltaje', color: 'success' },
        ],
    },
    e60_result_cable: {
        id: 'e60_result_cable', type: 'result',
        text: 'E60: cableado PCB-motor interrumpido',
        result: {
            causes: [
                { cause: 'Cableado entre tarjeta y motor interrumpido', probability: 75 },
                { cause: 'Terminal intermedio suelto', probability: 25 },
            ],
            recommendation: 'Reparar o reemplazar el cableado y rehacer terminales. Probar el ciclo de lavado y centrifugado completo.',
            parts: ['Arnés de cableado'],
        },
    },
    e60_voltaje: {
        id: 'e60_voltaje', type: 'question',
        text: '¿El motor recibe el voltaje correcto (120 V ±10 %) y aun así no gira?',
        detail: 'Ya registraste el voltaje en la salida de la tarjeta Inverter al inicio del diagnóstico: esa es la tensión que llega al motor. Verifica con esa medición en el intento de arranque.',
        options: [
            { label: 'Sí, recibe voltaje y no gira', nextId: 'e60_result_motor', color: 'danger' },
            { label: 'No llega voltaje o está fuera de rango', nextId: 'e60_result_pcb', color: 'danger' },
        ],
    },
    e60_voltaje_ok: {
        id: 'e60_voltaje_ok', type: 'question',
        text: '¿No llega voltaje al motor o está fuera de rango?',
        options: [
            { label: 'Sí, sin voltaje correcto', nextId: 'e60_result_pcb', color: 'danger' },
            { label: 'No, el motor recibe voltaje y no gira', nextId: 'e60_result_motor', color: 'danger' },
        ],
    },
    e60_result_pcb: {
        id: 'e60_result_pcb', type: 'result',
        text: 'E60: la tarjeta PCB no alimenta el motor',
        result: {
            causes: [
                { cause: 'Tarjeta PCB con falla en la salida hacia el motor', probability: 60 },
                { cause: 'Tarjeta inverter sin salida a pesar de recibir señal', probability: 40 },
            ],
            recommendation: 'Con cableado correcto y sin alimentación al motor, reemplazar la tarjeta PCB; si la PCB alimenta y la inverter no responde, reemplazar la tarjeta inverter.',
            parts: ['Tarjeta principal', 'Tarjeta inverter'],
        },
    },
    e60_result_motor: {
        id: 'e60_result_motor', type: 'result',
        text: 'E60: motor dañado',
        result: {
            causes: [
                { cause: 'Motor con embobinados o rodamientos dañados (recibe voltaje y no gira)', probability: 80 },
                { cause: 'Sensor de posición del motor sin señal', probability: 20 },
            ],
            recommendation: 'Verificar las bobinas y el giro libre del eje. Con motor fuera de especificación, reemplazarlo con la referencia exacta.',
            parts: ['Motor'],
        },
    },
};
// ── E80 — Sin comunicación PCB ↔ tarjeta display ─────────────────────────────
const LAV_E80_DISPLAY = {
    start: {
        id: 'start', type: 'action',
        text: 'Revisar y reasentar los conectores entre la tarjeta PCB y el display',
        detail: 'Desconecta y reconecta los conectores de comunicación. Revisa sulfatación, humedad y pines sin contacto.',
        tip: 'Toma foto del estado de los conectores antes de reasentar.',
        nextId: 'e80_conector',
    },
    e80_conector: {
        id: 'e80_conector', type: 'question',
        text: '¿Los conectores están sulfatados o sin contacto?',
        options: [
            { label: 'Sí, conectores defectuosos', nextId: 'e80_result_conector', color: 'danger' },
            { label: 'No, están limpios y firmes', nextId: 'e80_continuidad', color: 'success' },
        ],
    },
    e80_result_conector: {
        id: 'e80_result_conector', type: 'result',
        text: 'E80: conectores sulfatados o sin contacto',
        result: {
            causes: [
                { cause: 'Conectores sulfatados o con humedad', probability: 65 },
                { cause: 'Conector sin contacto por pines doblados', probability: 35 },
            ],
            recommendation: 'Limpiar los conectores (contact cleaner), rehacer terminales si están verdes, y reasentar firmemente. Probar la comunicación con un ciclo.',
            parts: ['Arnés de cableado'],
        },
    },
    e80_continuidad: {
        id: 'e80_continuidad', type: 'measure',
        text: 'Medir la continuidad del cableado PCB ↔ display',
        detail: 'Con el equipo desenergizado, mide cada hilo del cable de comunicación entre la tarjeta principal y la tarjeta display.',
        gifUri: 'medir-continuidad-tierra',
        evidenceLabel: 'Foto de la medición del cableado de comunicación',
        nextId: 'e80_continuidad_ok',
    },
    e80_continuidad_ok: {
        id: 'e80_continuidad_ok', type: 'question',
        text: '¿El cableado está dañado o sin continuidad?',
        options: [
            { label: 'Sí, cableado dañado', nextId: 'e80_result_cable', color: 'danger' },
            { label: 'No, el cableado mide completo', nextId: 'e80_result_tarjetas', color: 'neutral' },
        ],
    },
    e80_result_cable: {
        id: 'e80_result_cable', type: 'result',
        text: 'E80: cableado de comunicación dañado',
        result: {
            causes: [
                { cause: 'Cableado entre PCB y display interrumpido o frotado', probability: 70 },
                { cause: 'Terminal o conector intermedio suelto', probability: 30 },
            ],
            recommendation: 'Reparar o reemplazar el cableado y rehacer terminales. Verificar display y ciclo completos en prueba.',
            parts: ['Arnés de cableado'],
        },
    },
    e80_result_tarjetas: {
        id: 'e80_result_tarjetas', type: 'result',
        text: 'E80: tarjeta PCB y/o tarjeta display dañadas',
        result: {
            causes: [
                { cause: 'Circuito de comunicación de la tarjeta display dañado', probability: 45 },
                { cause: 'Circuito de comunicación de la tarjeta PCB dañado', probability: 45 },
                { cause: 'Fuente de 5 V compartida con caída bajo carga', probability: 10 },
            ],
            recommendation: 'Verificar las entradas/salidas de ambas tarjetas en modo de servicio. Probar reemplazando primero la tarjeta display (menor costo); si persiste, la tarjeta PCB.',
            parts: ['Tarjeta display', 'Tarjeta principal'],
        },
    },
};
// ── Registro de árboles por código de error ──────────────────────────────────
exports.CODIGOS_LAVADORA_TREES = {
    lav_e1_llenado: LAV_E1_LLENADO,
    lav_e2_drenaje: LAV_E2_DRENAJE,
    lav_e4_desbalance: LAV_E4_DESBALANCE,
    lav_e3_puerta: LAV_E3_PUERTA,
    lav_e7_freno: LAV_E7_FRENO,
    lav_f8_presostato: LAV_F8_PRESOSTATO,
    lav_fd_cerradura: LAV_FD_CERRADURA,
    lav_c8_com_inverter: LAV_C8_COM_INVERTER,
    lav_e34_temp: LAV_E34_TEMP,
    lav_e37_secado: LAV_E37_SECADO,
    lav_e12_sobrellenado: LAV_E12_SOBRELLENADO,
    lav_e50_inverter: LAV_E50_INVERTER,
    lav_e58_sobrecarga: LAV_E58_SOBRECARGA,
    lav_e60_motor: LAV_E60_MOTOR,
    lav_e80_display: LAV_E80_DISPLAY,
};
