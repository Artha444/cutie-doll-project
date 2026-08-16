import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const { data } = await supabase.from('messages').select('id, content, sender_role, is_read, product_id').order('created_at', { ascending: false }).limit(5);
  console.log(data);
}
check();
