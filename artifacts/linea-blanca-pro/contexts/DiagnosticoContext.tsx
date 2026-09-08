import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ClienteInfo,
  ConclusionInfo,
  DiagnosticCause,
  DiagnosticErrorCode,
  DiagnosticSession,
  EquipoInfo,
  Evidence,
} from '@/types/diagnostico';
import { enqueueSync, syncToCloud, getPendingCount } from '@/utils/sync';

const STORAGE_KEY = '@lbpro_sessions_v2';
const TECNICO_KEY = '@lbpro_tecnico_v2';
const CURRENT_SESSION_KEY = '@lbpro_current_session_v2';
const DRAFT_KEY = '@lbpro_draft_v2';

interface DiagnosticoContextType {
  isLoading: boolean;
  currentSession: DiagnosticSession | null;
  sessions: DiagnosticSession[];
  draft: DiagnosticSession | null;
  tecnico: string;
  pendingSync: number;
  setTecnico: (name: string) => void;
  startSession: () => void;
  restoreSession: (session: DiagnosticSession) => void;
  updateCliente: (data: Partial<ClienteInfo>) => void;
  setEquipo: (equipo: EquipoInfo) => void;
  advanceNode: (nextNodeId: string, answerLabel?: string) => void;
  goBackNode: () => void;
  addEvidence: (evidence: Omit<Evidence, 'id' | 'createdAt' | 'diagnosticId'>) => void;
  removeEvidence: (evidenceId: string) => void;
  setConclusion: (data: Partial<ConclusionInfo>) => void;
  setErrorCode: (errorCode?: DiagnosticErrorCode) => void;
  setResult: (result: { causes: DiagnosticCause[]; recommendation: string; parts: string[] }) => void;
  completeSession: () => DiagnosticSession | null;
  discardSession: () => void;
  deleteSession: (id: string) => void;
  getSession: (id: string) => DiagnosticSession | undefined;
  saveDraft: () => void;
  loadDraft: () => DiagnosticSession | null;
  clearDraft: () => void;
  runSync: () => Promise<{ synced: number; pending: number }>;
}

const DiagnosticoContext = createContext<DiagnosticoContextType | null>(null);

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function emptyCliente(): ClienteInfo {
  return { nombre: '', telefono: '', direccion: '', ciudad: '' };
}

function emptyConclusion(): ConclusionInfo {
  return { diagnostico: '', repuestos: '', tiempoEstimado: '', observaciones: '' };
}

function normalizeSession(session: DiagnosticSession): DiagnosticSession {
  return {
    ...session,
    evidence: (session.evidence ?? []).map((evidence) => ({
      ...evidence,
      diagnosticId: evidence.diagnosticId ?? session.id,
    })),
  };
}

export function DiagnosticoProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<DiagnosticSession | null>(null);
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [draft, setDraft] = useState<DiagnosticSession | null>(null);
  const [tecnico, setTecnicoState] = useState('');
  const [pendingSync, setPendingSync] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Carga inicial (sesiones, técnico, sesión actual y borrador) ──────────
  useEffect(() => {
    (async () => {
      try {
        const [rawSessions, rawTecnico, rawCurrent, rawDraft] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(TECNICO_KEY),
          AsyncStorage.getItem(CURRENT_SESSION_KEY),
          AsyncStorage.getItem(DRAFT_KEY),
        ]);
        if (rawSessions) {
          const parsedSessions = JSON.parse(rawSessions) as DiagnosticSession[];
          setSessions(parsedSessions.map(normalizeSession));
        }
        if (rawTecnico) setTecnicoState(rawTecnico);
        if (rawCurrent) {
          const parsed = JSON.parse(rawCurrent) as DiagnosticSession;
          if (!parsed.completed) setCurrentSession(normalizeSession(parsed));
        }
        if (rawDraft) setDraft(normalizeSession(JSON.parse(rawDraft)));
        setPendingSync(await getPendingCount());
      } catch (_) {
        // ignore storage errors
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistSessions = useCallback(async (updated: DiagnosticSession[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) { /* ignore */ }
  }, []);

  // ── Persistir currentSession en AsyncStorage (con debounce) ──────────────
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (currentSession) {
      saveTimer.current = setTimeout(() => {
        AsyncStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(currentSession)).catch(() => {});
      }, 300);
    } else {
      AsyncStorage.removeItem(CURRENT_SESSION_KEY).catch(() => {});
    }
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [currentSession]);

  const setTecnico = useCallback((name: string) => {
    setTecnicoState(name);
    AsyncStorage.setItem(TECNICO_KEY, name).catch(() => { /* ignore */ });
  }, []);

  const startSession = useCallback(() => {
    const session: DiagnosticSession = {
      id: genId(),
      startedAt: new Date().toISOString(),
      tecnico,
      cliente: emptyCliente(),
      equipo: {
        tipo: 'nevera',
        marca: '',
        modelo: '',
        serie: '',
        fallaId: '',
        fallaLabel: '',
        treeId: '',
      },
      path: [],
      pathAnswers: {},
      evidence: [],
      currentNodeId: 'start',
      completed: false,
      conclusion: emptyConclusion(),
    };
    setCurrentSession(session);
  }, [tecnico]);

  const restoreSession = useCallback((session: DiagnosticSession) => {
    setCurrentSession(normalizeSession(session));
  }, []);

  const updateCliente = useCallback((data: Partial<ClienteInfo>) => {
    setCurrentSession((prev) =>
      prev ? { ...prev, cliente: { ...prev.cliente, ...data } } : prev
    );
  }, []);

const setEquipo = useCallback((equipo: EquipoInfo) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;
      // Preservar la marca actual si el nuevo objeto viene con marca vacía.
      const merged: EquipoInfo = {
        ...equipo,
        marca: equipo.marca || prev.equipo?.marca || '',
      };
      const resetPath = merged.treeId !== prev.equipo?.treeId;
      return {
        ...prev,
        equipo: merged,
        currentNodeId: resetPath ? 'start' : prev.currentNodeId,
        path: resetPath ? [] : prev.path,
        pathAnswers: resetPath ? {} : prev.pathAnswers,
      };
    });
  }, []);

  const advanceNode = useCallback((nextNodeId: string, answerLabel?: string) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;
      const path = [...prev.path, prev.currentNodeId];
      const pathAnswers = answerLabel
        ? { ...prev.pathAnswers, [prev.currentNodeId]: answerLabel }
        : prev.pathAnswers;
      return { ...prev, currentNodeId: nextNodeId, path, pathAnswers };
    });
  }, []);

  const goBackNode = useCallback(() => {
    setCurrentSession((prev) => {
      if (!prev || prev.path.length === 0) return prev;
      const newPath = [...prev.path];
      const prevNodeId = newPath.pop()!;
      const newPathAnswers = { ...prev.pathAnswers };
      delete newPathAnswers[prevNodeId];
      return { ...prev, currentNodeId: prevNodeId, path: newPath, pathAnswers: newPathAnswers };
    });
  }, []);

  const addEvidence = useCallback((evidence: Omit<Evidence, 'id' | 'createdAt' | 'diagnosticId'>) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;
      const newEvidence: Evidence = {
        ...evidence,
        id: genId(),
        diagnosticId: prev.id,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, evidence: [...prev.evidence, newEvidence] };
    });
  }, []);

  const removeEvidence = useCallback((evidenceId: string) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;
      return { ...prev, evidence: prev.evidence.filter((e) => e.id !== evidenceId) };
    });
  }, []);

  const setConclusion = useCallback((data: Partial<ConclusionInfo>) => {
    setCurrentSession((prev) =>
      prev ? { ...prev, conclusion: { ...prev.conclusion, ...data } } : prev
    );
  }, []);

  const setErrorCode = useCallback((errorCode?: DiagnosticErrorCode) => {
    setCurrentSession((prev) => (prev ? { ...prev, errorCode } : prev));
  }, []);

  const setResult = useCallback((result: { causes: DiagnosticCause[]; recommendation: string; parts: string[] }) => {
    setCurrentSession((prev) => prev ? { ...prev, result } : prev);
  }, []);

  const completeSession = useCallback((): DiagnosticSession | null => {
    if (!currentSession) return null;
    const completed: DiagnosticSession = {
      ...currentSession,
      completed: true,
      finishedAt: new Date().toISOString(),
    };
    setSessions((prev) => {
      const updated = [completed, ...prev];
      persistSessions(updated);
      return updated;
    });
    // Encolar para sincronizar en la nube (modo offline-first)
    void enqueueSync(completed)
      .then(() => setPendingSync(1))
      .catch(() => {
        // El reporte ya quedó guardado localmente; una falla de la cola
        // offline no debe cerrar la aplicación ni impedir ver el resumen.
      });
    // Conservar temporalmente la sesión completada evita que la pantalla de
    // conclusión redireccione mientras Expo Router procesa el reemplazo.
    // Al iniciar otro diagnóstico, startSession la reemplaza por una nueva.
    setCurrentSession(completed);
    return completed;
  }, [currentSession, persistSessions]);

  const discardSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      persistSessions(updated);
      return updated;
    });
  }, [persistSessions]);

  const getSession = useCallback((id: string) => {
    return sessions.find((s) => s.id === id);
  }, [sessions]);

  // ── Borrador ──────────────────────────────────────────────────────────────
  const saveDraft = useCallback(() => {
    if (!currentSession) return;
    const draftCopy: DiagnosticSession = { ...currentSession };
    setDraft(draftCopy);
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draftCopy)).catch(() => {});
  }, [currentSession]);

  const loadDraft = useCallback((): DiagnosticSession | null => {
    return draft;
  }, [draft]);

  const clearDraft = useCallback(() => {
    setDraft(null);
    AsyncStorage.removeItem(DRAFT_KEY).catch(() => {});
  }, []);

  // ── Sincronización con la nube ─────────────────────────────────────────────
  const runSync = useCallback(async () => {
    const result = await syncToCloud();
    setPendingSync(result.pending);
    return result;
  }, []);

  return (
    <DiagnosticoContext.Provider
      value={{
        isLoading,
        currentSession,
        sessions,
        draft,
        tecnico,
        pendingSync,
        setTecnico,
        startSession,
        restoreSession,
        updateCliente,
        setEquipo,
        advanceNode,
        goBackNode,
        addEvidence,
        removeEvidence,
        setConclusion,
        setErrorCode,
        setResult,
        completeSession,
        discardSession,
        deleteSession,
        getSession,
        saveDraft,
        loadDraft,
        clearDraft,
        runSync,
      }}
    >
      {children}
    </DiagnosticoContext.Provider>
  );
}

export function useDiagnostico(): DiagnosticoContextType {
  const ctx = useContext(DiagnosticoContext);
  if (!ctx) throw new Error('useDiagnostico must be used within DiagnosticoProvider');
  return ctx;
}
