import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testFetch() {
  const { data, error } = await supabase.from('revenue_analytics_daily').select('*');
  console.log('Error:', error);
  console.log('Data count:', data?.length);
}
testFetch();
