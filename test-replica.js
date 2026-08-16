import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function main() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: "SELECT relreplident FROM pg_class WHERE relname = 'messages';" });
  console.log(data, error);
}
main();
