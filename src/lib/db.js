import { supabase } from './supabase'

// ── Traduções ──────────────────────────────────────────
export async function fetchTranslations(userId) {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function insertTranslation(userId, job) {
  const { data, error } = await supabase
    .from('translations')
    .insert({
      user_id: userId,
      name: job.fileName || 'Vídeo traduzido',
      src_lang: job.srcLang,
      dst_lang: job.dstLang,
      voice_type: job.voiceType,
      voice_opt: job.voiceOpt,
      duration: job.duration || '--:--',
      size: job.size || '---',
      status: 'done',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTranslation(id) {
  const { error } = await supabase.from('translations').delete().eq('id', id)
  if (error) throw error
}

// ── Perfil do usuário ──────────────────────────────────
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertProfile(userId, fields) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...fields }, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}
