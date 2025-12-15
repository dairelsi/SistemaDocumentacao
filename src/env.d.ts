import { createClient } from '@supabase/supabase-js';

// Busca as chaves do arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as chaves existem para não dar erro mudo
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltam as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);