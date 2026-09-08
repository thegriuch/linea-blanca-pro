import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
} from 'docx';
import { Platform } from 'react-native';
import type { DiagnosticSession, Evidence } from '@/types/diagnostico';
import { getEquipoInfo } from '@/constants/equipos';
import { LETTERHEAD_ICON_DATA_URI } from '@/utils/letterheadIcon';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const REPORT_BLUE = '145DA0';
const REPORT_GRAY = '6B7280';

type ReportImage = {
  data: string;
  type: 'jpg' | 'png' | 'gif' | 'bmp';
};

function fmt(d: string | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function buildReportText(session: DiagnosticSession): string {
  const equipo = getEquipoInfo(session.equipo.tipo);
  const causes = session.result?.causes ?? [];
  const lines: string[] = [
    '══════════════════════════════',
    '  LÍNEA BLANCA PRO — REPORTE TÉCNICO',
    '══════════════════════════════',
    '',
    `TÉCNICO: ${session.tecnico || '—'}`,
    `ID DIAGNÓSTICO: ${session.id}`,
    `FECHA INICIO: ${fmt(session.startedAt)}`,
    `FECHA FIN: ${fmt(session.finishedAt)}`,
    '',
    '── CLIENTE ─────────────────',
    `Nombre: ${session.cliente.nombre || '—'}`,
    `Teléfono: ${session.cliente.telefono || '—'}`,
    `Dirección: ${session.cliente.direccion || '—'}`,
    `Ciudad: ${session.cliente.ciudad || '—'}`,
    '',
    '── EQUIPO ──────────────────',
    `Tipo: ${equipo.label}`,
    `Marca: ${session.equipo.marca || '—'}`,
    `Modelo: ${session.equipo.modelo || '—'}`,
    `Serie: ${session.equipo.serie || '—'}`,
    `Falla reportada: ${session.equipo.fallaLabel || '—'}`,
    ...(session.errorCode
      ? [
          `Código de error registrado: ${session.errorCode.codigo}`,
          `Descripción del código: ${session.errorCode.descripcion}`,
        ]
      : []),
    '',
  ];

  if (causes.length > 0) {
    lines.push('── DIAGNÓSTICO ─────────────');
    causes.forEach((c, i) => {
      lines.push(`  ${i + 1}. ${c.cause} — ${c.probability}%`);
    });
    lines.push('');
    if (session.result?.recommendation) {
      lines.push('RECOMENDACIÓN:');
      lines.push(session.result.recommendation);
      lines.push('');
    }
    if (session.result?.parts && session.result.parts.length > 0) {
      lines.push('REPUESTOS POSIBLES:');
      session.result.parts.forEach((p) => lines.push(`  • ${p}`));
      lines.push('');
    }
  }

  if (session.conclusion.diagnostico) {
    lines.push('── CONCLUSIÓN TÉCNICA ──────');
    lines.push(session.conclusion.diagnostico);
    lines.push('');
  }
  if (session.conclusion.repuestos) {
    lines.push(`REPUESTOS SOLICITADOS: ${session.conclusion.repuestos}`);
  }
  if (session.conclusion.tiempoEstimado) {
    lines.push(`TIEMPO ESTIMADO: ${session.conclusion.tiempoEstimado}`);
  }
  if (session.conclusion.observaciones) {
    lines.push(`OBSERVACIONES: ${session.conclusion.observaciones}`);
  }
  if (session.evidence.length > 0) {
    lines.push('');
    lines.push(`EVIDENCIAS: ${session.evidence.length} foto(s) adjunta(s)`);
  }
  lines.push('');
  lines.push('══════════════════════════════');
  return lines.join('\n');
}

function imageTypeFromUri(uri: string): ReportImage['type'] {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (extension === 'png' || extension === 'gif' || extension === 'bmp') {
    return extension;
  }
  return 'jpg';
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function readImageAsDataUri(uri: string): Promise<ReportImage> {
  let base64: string;

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`No se pudo leer la imagen (${response.status}).`);
    }
    base64 = bytesToBase64(new Uint8Array(await response.arrayBuffer()));
  } else {
    const FileSystem = await import('expo-file-system/legacy');
    base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  const type = imageTypeFromUri(uri);
  return { data: `data:image/${type};base64,${base64}`, type };
}

async function readLetterheadIcon(): Promise<ReportImage> {
  return {
    data: LETTERHEAD_ICON_DATA_URI,
    type: 'png',
  };
}

function heading(text: string, level: 'title' | 'section' | 'evidence' = 'section') {
  return new Paragraph({
    heading:
      level === 'title'
        ? HeadingLevel.TITLE
        : level === 'evidence'
          ? HeadingLevel.HEADING_2
          : HeadingLevel.HEADING_1,
    spacing: { before: level === 'title' ? 0 : 280, after: 100 },
    alignment: level === 'title' ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        bold: true,
        color: REPORT_BLUE,
        size: level === 'title' ? 30 : level === 'evidence' ? 26 : 22,
      }),
    ],
  });
}

function field(label: string, value: string | undefined) {
  return new Paragraph({
    spacing: { after: 50 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, color: REPORT_BLUE }),
      new TextRun({ text: value || '—', color: '222222' }),
    ],
  });
}

function evidenceTitle(evidence: Evidence, index: number): string {
  return `Imagen ${index + 1}: ${evidence.nodeText || 'Evidencia fotográfica del diagnóstico'}`;
}

async function buildDocx(session: DiagnosticSession): Promise<Document> {
  const equipo = getEquipoInfo(session.equipo.tipo);
  const causes = session.result?.causes ?? [];
  const letterheadIcon = await readLetterheadIcon();

  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new ImageRun({
            data: letterheadIcon.data,
            type: 'png',
            transformation: { width: 42, height: 42 },
            altText: {
              title: 'Icono de Línea Blanca Pro',
              description: 'Membrete de Línea Blanca Pro',
              name: 'linea-blanca-pro-icon',
            },
          }),
          new TextRun({
            text: '  LÍNEA BLANCA PRO · REPORTE TÉCNICO',
            bold: true,
            color: REPORT_BLUE,
            size: 18,
          }),
        ],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Línea Blanca Pro · Documento generado desde el diagnóstico técnico',
            color: REPORT_GRAY,
            size: 16,
          }),
        ],
      }),
    ],
  });

  const children: Paragraph[] = [
    heading('REPORTE DE DIAGNÓSTICO', 'title'),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [
        new TextRun({
          text: `${equipo.label} · ${session.equipo.marca || 'Marca Kalley'}`,
          color: REPORT_GRAY,
          size: 20,
        }),
      ],
    }),
    heading('Información del servicio'),
    field('ID de diagnóstico', session.id),
    field('Técnico', session.tecnico),
    field('Fecha de inicio', fmt(session.startedAt)),
    field('Fecha de finalización', fmt(session.finishedAt)),
    heading('Cliente'),
    field('Nombre', session.cliente.nombre),
    field('Teléfono', session.cliente.telefono),
    field('Dirección', session.cliente.direccion),
    field('Ciudad', session.cliente.ciudad),
    heading('Equipo'),
    field('Tipo', equipo.label),
    field('Marca', session.equipo.marca),
    field('Modelo', session.equipo.modelo),
    field('Número de serie', session.equipo.serie),
    field('Falla reportada', session.equipo.fallaLabel),
    ...(session.errorCode
      ? [
          field('Código de error registrado', session.errorCode.codigo),
          field('Descripción del código', session.errorCode.descripcion),
        ]
      : []),
  ];

  if (causes.length > 0) {
    children.push(heading('Diagnóstico con probabilidades'));
    causes.forEach((cause) => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 50 },
          children: [
            new TextRun({ text: `${cause.cause} — `, bold: true }),
            new TextRun({ text: `${cause.probability}%` }),
            ...(cause.action
              ? [new TextRun({ text: ` · ${cause.action}`, color: REPORT_GRAY })]
              : []),
          ],
        }),
      );
    });
    if (session.result?.recommendation) {
      children.push(heading('Recomendación técnica'));
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: session.result.recommendation })],
        }),
      );
    }
    if (session.result?.parts?.length) {
      children.push(heading('Repuestos posibles'));
      session.result.parts.forEach((part) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: part })],
          }),
        );
      });
    }
  }

  children.push(heading('Conclusión técnica'));
  children.push(field('Diagnóstico definitivo', session.conclusion.diagnostico));
  children.push(field('Repuestos solicitados', session.conclusion.repuestos));
  children.push(field('Tiempo estimado de reparación', session.conclusion.tiempoEstimado));
  children.push(field('Observaciones', session.conclusion.observaciones));

  if (session.evidence.length > 0) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(heading('Evidencia fotográfica'));

    for (let index = 0; index < session.evidence.length; index += 1) {
      const evidence = session.evidence[index];
      if (index > 0) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }
      children.push(heading(evidenceTitle(evidence, index), 'evidence'));
      const image = await readImageAsDataUri(evidence.uri);
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new ImageRun({
              data: image.data,
              type: image.type,
              transformation: { width: 520, height: 390 },
              altText: {
                title: evidenceTitle(evidence, index),
                description: evidence.nodeText || 'Evidencia fotográfica del diagnóstico',
                name: `evidencia-${index + 1}`,
              },
            }),
          ],
        }),
      );
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Tomada el ${fmt(evidence.createdAt)}`,
              color: REPORT_GRAY,
              size: 16,
              italics: true,
            }),
          ],
        }),
      );
    }
  }

  return new Document({
    creator: 'Línea Blanca Pro',
    title: `Reporte de diagnóstico ${session.id}`,
    subject: 'Reporte técnico de diagnóstico de electrodoméstico',
    description: 'Reporte generado por Línea Blanca Pro.',
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1050, right: 900, bottom: 900, left: 900, header: 450, footer: 450 },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children,
      },
    ],
  });
}

export async function shareReport(session: DiagnosticSession): Promise<void> {
  const document = await buildDocx(session);
  const fileName = `reporte_diagnostico_${session.id}.docx`;

  if (Platform.OS === 'web') {
    const blob = await Packer.toBlob(document);
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  try {
    const Sharing = await import('expo-sharing');
    const FileSystem = await import('expo-file-system/legacy');
    const directory =
      FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!directory) {
      throw new Error('No hay un directorio disponible para guardar el reporte.');
    }
    const fileUri = `${directory}${fileName}`;
    const base64 = await Packer.toBase64String(document);
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: DOCX_MIME,
        dialogTitle: 'Compartir reporte DOCX',
      });
    } else {
      throw new Error('La función de compartir no está disponible en este dispositivo.');
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudo preparar el reporte DOCX.');
  }
}
