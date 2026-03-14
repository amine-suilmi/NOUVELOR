import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://jckciaxtdihbowueappd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impja2NpYXh0ZGloYm93dWVhcHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODQ5ODAsImV4cCI6MjA4OTA2MDk4MH0.Ni2EFFc_aQt5M2XPVRyhs8lr1CqS0uAL_PsL1dTvph8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
