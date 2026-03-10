import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxagqrsdfiokogwksvbu.supabase.co';
const supabaseKey = 'sb_publishable_BZutp_epytYYLZiKofldxg_FuqLwXIf';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
