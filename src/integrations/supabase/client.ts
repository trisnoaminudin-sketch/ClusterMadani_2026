import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://niypkocoyqqigfavzbqv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peXBrb2NveXFxaWdmYXZ6YnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NTQ4NTMsImV4cCI6MjA4NTAzMDg1M30.N2nntA9y0VnALybjbjb5u8kqObfZwKZFTngn6gF5XKQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
