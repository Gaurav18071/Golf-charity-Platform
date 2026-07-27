import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://gqlmmbdhkkfctyuvlaef.supabase.co"
const supabaseKey = "sb_publishable_5-qLcGZpXAsCx3J-DJcWuw_q5aMTPqg"

export const supabase = createClient(supabaseUrl, supabaseKey)