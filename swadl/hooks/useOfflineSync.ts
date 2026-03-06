import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useOfflineQueue } from "../lib/store";

export function useOfflineSync() {
  const queue = useOfflineQueue((s) => s.queue);
  const remove = useOfflineQueue((s) => s.remove);
  const queryClient = useQueryClient();
  const syncing = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && queue.length > 0 && !syncing.current) {
        drainQueue();
      }
    });

    // Also try on mount if already connected
    if (queue.length > 0) {
      NetInfo.fetch().then((state) => {
        if (state.isConnected && !syncing.current) {
          drainQueue();
        }
      });
    }

    return () => unsubscribe();
  }, [queue.length]);

  async function drainQueue() {
    syncing.current = true;
    const entries = useOfflineQueue.getState().queue;

    for (const entry of entries) {
      const { error } = await supabase
        .from(entry.table)
        .insert(entry.payload);

      if (!error) {
        remove(entry.id);
      }
      // If error, leave in queue — will retry on next connectivity change
    }

    // Invalidate relevant queries after sync
    queryClient.invalidateQueries({ queryKey: ["latest-feed"] });
    queryClient.invalidateQueries({ queryKey: ["latest-diaper"] });
    queryClient.invalidateQueries({ queryKey: ["latest-sleep"] });
    queryClient.invalidateQueries({ queryKey: ["latest-pump"] });
    queryClient.invalidateQueries({ queryKey: ["recent-activity"] });

    syncing.current = false;
  }
}
