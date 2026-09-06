import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DiagnosticSession } from '@/types/diagnostico';

const SYNC_QUEUE_KEY = '@lbpro_sync_queue_v2';

async function readQueue(): Promise<DiagnosticSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as DiagnosticSession[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: DiagnosticSession[]): Promise<void> {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueSync(session: DiagnosticSession): Promise<void> {
  const queue = await readQueue();
  const nextQueue = [session, ...queue.filter((item) => item.id !== session.id)];
  await writeQueue(nextQueue);
}

export async function getPendingCount(): Promise<number> {
  return (await readQueue()).length;
}

/**
 * The imported app is offline-first. Keeping this boundary allows a future
 * authenticated cloud endpoint to be added without changing the diagnosis flow.
 */
export async function syncToCloud(): Promise<{ synced: number; pending: number }> {
  const pending = await getPendingCount();
  return { synced: 0, pending };
}