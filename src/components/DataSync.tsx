import { useSupabaseDataSync } from '@/hooks/useSupabaseDataSync';

export default function DataSync() {
  useSupabaseDataSync();
  return null; // This component renders nothing
}
