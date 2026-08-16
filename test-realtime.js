import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const channel = supabase.channel('test_admin_inbox')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
    console.log('REALTIME EVENT:', payload);
  })
  .subscribe();
console.log('Listening for 10 seconds...');
setTimeout(() => process.exit(0), 10000);
