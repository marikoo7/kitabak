
import { createClient } from '@supabase/supabase-js';

// استبدلي الـ URL والـ Key الخاصين بك في Supabase
const supabaseUrl = 'https://fkifydtvjuxzywprvtub.supabase.co'; // رابط الـ Supabase URL الخاص بمشروعك
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZraWZ5ZHR2anV4enl3cHJ2dHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTMyMDQsImV4cCI6MjA2MDQ2OTIwNH0.LdARj3AgBefYtNoRTT83-OTnp-xfskB941H7ZrjxhYI'; // الـ Public API Key

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
