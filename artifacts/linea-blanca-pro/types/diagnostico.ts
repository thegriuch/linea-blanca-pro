/** Domain types for Línea Blanca Pro v2.0 */

export type EquipoTipo =
  | 'nevera'
  | 'congelador'
  | 'nevecon'
  | 'minibar'
  | 'lavadora'
  | 'secadora'
  | 'aire'
  | 'vitrina'
  | 'dispensadores'
  | 'otro';

export interface EquipoTipoInfo {
  id: EquipoTipo;
  label: string;
  icon: string;
  color: string;
}

export type NodeType = 'question' | 'action' | 'evidence' | 'measure' | 'result';

export interface TreeOption {
  label: string;
  nextId: string;
  color?: 'success' | 'danger' | 'neutral';
}

export interface DiagnosticCause {
  cause: string;
  probability: number; // 0–100
  action?: string;
}

export interface TreeNode {
  id: string;
  type: NodeType;
  text: string;
  detail?: string;
  tip?: string;
  options?: TreeOption[];
  nextId?: string; // for linear nodes (action / measure / evidence)
  evidenceLabel?: string;
  gifUri?: string;
  result?: {
    causes: DiagnosticCause[];
    recommendation: string;
    parts?: string[];
  };
}

export type DiagnosticTree = Record<string, TreeNode>;

export interface FaultItem {
  id: string;
  label: string;
  treeId: string;
  icon: string;
}

export interface Evidence {
  id: string;
  uri: string;
  nodeId?: string;
  nodeText?: string;
  createdAt: string;
}

export interface ClienteInfo {
  nombre: string;
  telefono: string;
  direccion: string;
  ciudad: string;
}

export interface EquipoInfo {
  tipo: EquipoTipo;
  marca: string;
  modelo: string;
  serie: string;
  fallaId: string;
  fallaLabel: string;
  treeId: string;
}

export interface ConclusionInfo {
  diagnostico: string;
  repuestos: string;
  tiempoEstimado: string;
  observaciones: string;
}

export interface DiagnosticSession {
  id: string;
  startedAt: string;
  finishedAt?: string;
  tecnico: string;
  cliente: ClienteInfo;
  equipo: EquipoInfo;
  path: string[]; // nodeIds visited in order
  pathAnswers: Record<string, string>; // nodeId -> answer label chosen
  evidence: Evidence[];
  currentNodeId: string;
  completed: boolean;
  conclusion: ConclusionInfo;
  result?: {
    causes: DiagnosticCause[];
    recommendation: string;
    parts: string[];
  };
}
