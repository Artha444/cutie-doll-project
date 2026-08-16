import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const channel = supabase.channel('test_admin_inbox')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
    console.log('REALTIME EVENT:', JSON.stringify(payload));
  })
  .subscribe();

console.log('Waiting 2s...');
setTimeout(async () => {
  const pid = "c4d7ec93-f4c0-432b-9800-47b2b0ce814d";
  const res = await fetch("http://localhost:3000/api/chat", {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'mark_read', product_id: pid, role_to_mark: 'ADMIN' })
  });
  console.log(await res.json());
  
  setTimeout(() => process.exit(0), 3000);
}, 2000);
