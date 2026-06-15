// src/lib/supabase-browser.js
import { createClient } from "@supabase/supabase-js";

let browserClient = null;

/**
 * Client Supabase per il browser — USA SEMPRE LA ANON KEY.
 * Non usare mai SUPABASE_SERVICE_ROLE_KEY qui: verrebbe esposta
 * nel bundle JS pubblico e nelle richieste WebSocket Realtime,
 * visibile a chiunque ispezioni il Network tab.
 */
export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL o ANON KEY mancanti (NEXT_PUBLIC_*)");
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });

  return browserClient;
}