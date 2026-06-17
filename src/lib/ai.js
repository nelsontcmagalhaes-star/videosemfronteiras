const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY
const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_KEY

// ElevenLabs voice IDs (multilingual v2 model)
const VOICE_MAP = {
  'fem-Jovem':       'EXAVITQu4vr4xnSDxMaL', // Bella
  'fem-Adulta':      '21m00Tcm4TlvDq8ikWAM', // Rachel
  'fem-Madura':      'AZnzlk1XvdvUeBnXmlld', // Domi
  'mas-Jovem':       'TxGEqnHWrfWFTfGW9XjX', // Josh
  'mas-Adulto':      'VR6AewLTigWG4xSOukaG', // Arnold
  'mas-Maduro':      'pNInz6obpgDQGcFmaJgB', // Adam
  'neu-IA Natural':  'IKne3meq5aSn9XLyUdCD', // Charlie
  'neu-IA Narrador': 'N2lVS1w4EtoT3dr4eOWO', // Callum
}

const DST_LANG_NAMES = {
  'Português Brasil': 'Brazilian Portuguese (pt-BR)',
  'Inglês':           'English (en-US)',
  'Espanhol':         'Spanish (es)',
  'Francês':          'French (fr)',
  'Alemão':           'German (de)',
  'Italiano':         'Italian (it)',
  'Japonês':          'Japanese (ja)',
}

export async function transcribeAudio(audioBlob, langCode = 'en') {
  const form = new FormData()
  form.append('file', audioBlob, 'audio.mp3')
  form.append('model', 'whisper-1')
  form.append('language', langCode)
  form.append('response_format', 'verbose_json')

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: form,
  })
  if (!res.ok) {
    const err = await res.text().catch(() => res.status)
    throw new Error(`Whisper falhou (${res.status}): ${err}`)
  }
  const data = await res.json()
  return data.text || ''
}

export async function translateText(text, dstLang = 'Português Brasil') {
  const langName = DST_LANG_NAMES[dstLang] || dstLang
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional video dubbing translator. Translate the text to ${langName}. Preserve natural speech rhythm suitable for dubbing. Return only the translated text, no explanations.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => res.status)
    throw new Error(`GPT-4 falhou (${res.status}): ${err}`)
  }
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

export async function synthesizeVoice(text, voiceType = 'fem', voiceOpt = 'Adulta') {
  const key = `${voiceType}-${voiceOpt}`
  const voiceId = VOICE_MAP[key] || VOICE_MAP['fem-Adulta']
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => res.status)
    throw new Error(`ElevenLabs falhou (${res.status}): ${err}`)
  }
  return res.blob() // audio/mpeg
}
