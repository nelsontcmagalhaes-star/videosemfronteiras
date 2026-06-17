import { useEffect, useState, useRef } from 'react'
import { CheckCircle, Loader, Globe, AlertCircle, Download, Music } from 'lucide-react'
import { transcribeAudio, translateText, synthesizeVoice } from '../lib/ai'

const C = { primary: '#2aab8e', dark: '#1d8a6f', text: '#1a3d35', muted: '#4a7a6e', faint: '#7ab0a5' }

const STEPS = [
  { id: 'check',      label: 'Verificando arquivo' },
  { id: 'transcribe', label: 'Transcrevendo com Whisper (OpenAI)' },
  { id: 'translate',  label: 'Traduzindo com GPT-4' },
  { id: 'voice',      label: 'Gerando dublagem (ElevenLabs)' },
  { id: 'render',     label: 'Montando vídeo final' },
  { id: 'done',       label: 'Pronto!' },
]

// Whisper limit: 25 MB
const WHISPER_MAX_BYTES = 25 * 1024 * 1024

export default function ProgressScreen({ job, onDone }) {
  const [step, setStep]         = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError]       = useState(null)
  const [downloads, setDownloads] = useState(null) // { audio, video? }
  const [log, setLog]           = useState('')
  const ran = useRef(false)

  const advance = (idx) => {
    setStep(idx)
    setProgress(Math.round((idx / STEPS.length) * 100))
  }

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    run()
  }, [])

  const run = async () => {
    try {
      const { file, srcLangCode = 'en', dstLang = 'Português Brasil', voiceType = 'fem', voiceOpt = 'Adulta' } = job

      // Step 0 — Verify file
      advance(0)
      if (!file) {
        throw new Error('Selecione um arquivo de vídeo local (MP4, MOV, AVI, MKV) para a tradução com IA.')
      }
      if (file.size > WHISPER_MAX_BYTES) {
        throw new Error(`O arquivo é muito grande (${(file.size/1024/1024).toFixed(0)} MB). O limite do Whisper é 25 MB. Corte o vídeo em partes menores e tente novamente.`)
      }
      setLog(`Arquivo: ${file.name} — ${(file.size/1024/1024).toFixed(1)} MB`)

      // Step 1 — Transcribe (send video/audio file directly to Whisper — no FFmpeg needed)
      advance(1)
      setLog('Enviando para Whisper (pode levar ~30s)...')
      let transcript
      try {
        transcript = await transcribeAudio(file, srcLangCode)
      } catch (e) {
        throw new Error(`Falha na transcrição (Whisper): ${e?.message || String(e)}`)
      }
      if (!transcript?.trim()) throw new Error('O Whisper não conseguiu transcrever áudio. Verifique se o vídeo tem fala audível.')
      setLog(`Transcrição: "${transcript.slice(0, 80)}..."`)

      // Step 2 — Translate (GPT-4)
      advance(2)
      setLog('Traduzindo com GPT-4...')
      let translated
      try {
        translated = await translateText(transcript, dstLang)
      } catch (e) {
        throw new Error(`Falha na tradução (GPT-4): ${e?.message || String(e)}`)
      }
      setLog(`Tradução: "${translated.slice(0, 80)}..."`)

      // Step 3 — Synthesize voice (ElevenLabs)
      advance(3)
      setLog('Gerando voz dublada (ElevenLabs)...')
      let dubbedAudio
      try {
        dubbedAudio = await synthesizeVoice(translated, voiceType, voiceOpt)
      } catch (e) {
        throw new Error(`Falha na dublagem (ElevenLabs): ${e?.message || String(e)}`)
      }
      const audioUrl = URL.createObjectURL(dubbedAudio)

      // Step 4 — Merge video + dubbed audio (requires SharedArrayBuffer / FFmpeg WASM)
      advance(4)
      let videoUrl = null
      if (typeof SharedArrayBuffer !== 'undefined') {
        setLog('Montando vídeo com novo áudio (FFmpeg)...')
        try {
          const { extractAudio, mergeAudioWithVideo } = await import('../lib/videoProcessor')
          const finalVideo = await mergeAudioWithVideo(file, dubbedAudio, (msg) => setLog(msg?.slice(0, 80) || ''))
          videoUrl = URL.createObjectURL(finalVideo)
        } catch (e) {
          console.warn('FFmpeg falhou, entregando só o áudio:', e)
          // Non-fatal — audio download still works
        }
      } else {
        setLog('FFmpeg não disponível neste browser — entregando áudio dublado (MP3).')
      }

      // Step 5 — Done
      advance(5)
      setProgress(100)
      setDownloads({ audio: audioUrl, video: videoUrl })
      setLog(videoUrl ? 'Vídeo dublado pronto!' : 'Áudio dublado pronto! (MP3)')

      setTimeout(() => onDone({
        ...job,
        downloadUrl: videoUrl || audioUrl,
        transcript,
        translation: translated,
      }), 1500)

    } catch (err) {
      console.error('[VídeoSemFronteiras] Erro no pipeline:', err)
      setError(err?.message || String(err) || 'Erro inesperado.')
    }
  }

  const pct = Math.round(progress)

  // ── Error screen ──
  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 fade-in">
        <div className="card p-6 text-center">
          <AlertCircle size={40} color="#dc2626" className="mx-auto mb-3"/>
          <h3 className="text-base font-bold mb-3" style={{ color: C.text }}>Erro no Processamento</h3>
          <p className="text-sm mb-5 leading-relaxed text-left p-3 rounded-xl"
            style={{ color: C.muted, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
            {error}
          </p>
          <button onClick={() => window.location.reload()}
            className="btn-primary px-6 py-3 text-sm">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  // ── Progress screen ──
  return (
    <div className="max-w-lg mx-auto px-4 py-8 fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.dark})` }}>
          <Globe size={32} color="white" className={pct < 100 ? 'spin' : ''}/>
        </div>
        <h2 className="text-xl font-bold" style={{ color: C.text }}>
          {pct < 100 ? 'Traduzindo com IA...' : '✅ Tradução Concluída!'}
        </h2>
        <p className="text-sm mt-1 truncate max-w-xs mx-auto" style={{ color: C.muted }}>
          {job?.fileName || 'Vídeo'} → {job?.dstLang || 'Português Brasil'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="card p-4 mb-4">
        <div className="flex justify-between text-xs mb-2" style={{ color: C.faint }}>
          <span>Progresso</span>
          <span>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%`, transition: 'width 0.5s ease' }}/>
        </div>
        {log && (
          <p className="text-xs mt-2 leading-tight" style={{ color: C.faint }}>{log}</p>
        )}
      </div>

      {/* Steps */}
      <div className="card p-4 space-y-3 mb-4">
        {STEPS.map((s, i) => {
          const done    = i < step
          const active  = i === step
          const pending = i > step
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                {done    && <CheckCircle size={22} color={C.dark}/>}
                {active  && <Loader size={22} color={C.primary} className="spin"/>}
                {pending && <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'rgba(42,171,142,0.25)' }}/>}
              </div>
              <span className="text-sm font-medium"
                style={{ color: done ? C.dark : active ? C.text : C.faint }}>
                {s.label}
              </span>
              {done   && <span className="ml-auto text-xs" style={{ color: C.dark }}>✓</span>}
              {active && <span className="ml-auto text-xs spin inline-block" style={{ color: C.primary }}>●</span>}
            </div>
          )
        })}
      </div>

      {/* Info chips */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Original', val: job?.srcLang || '—' },
          { label: 'Destino',  val: job?.dstLang  || '—' },
          { label: 'Voz',      val: job?.voiceOpt || '—' },
        ].map(({ label, val }) => (
          <div key={label} className="card p-3 text-center">
            <div className="text-xs" style={{ color: C.faint }}>{label}</div>
            <div className="text-xs font-semibold mt-1 truncate" style={{ color: C.text }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Download buttons when ready */}
      {downloads && (
        <div className="space-y-2 fade-in">
          {downloads.video && (
            <a href={downloads.video}
              download={`${job?.fileName?.replace(/\.[^.]+$/, '') || 'video'}_dublado.mp4`}
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              style={{ textDecoration: 'none' }}>
              <Download size={16}/> Baixar Vídeo Dublado (MP4)
            </a>
          )}
          <a href={downloads.audio}
            download={`${job?.fileName?.replace(/\.[^.]+$/, '') || 'audio'}_dublado.mp3`}
            className="w-full py-3 text-sm flex items-center justify-center gap-2 rounded-xl font-semibold"
            style={{ background: 'rgba(42,171,142,0.12)', color: C.dark, textDecoration: 'none' }}>
            <Music size={16}/> Baixar Áudio Dublado (MP3)
          </a>
        </div>
      )}
    </div>
  )
}
