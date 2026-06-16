import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lmovhyccvchzscropuxj.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtb3ZoeWNjdmNoenNjcm9wdXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NDcyODcsImV4cCI6MjA5NzIyMzI4N30.jyfiIFXmcz6uWtAB5Zp_imehwKlDVqYg-7lob-Jv_Sw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
