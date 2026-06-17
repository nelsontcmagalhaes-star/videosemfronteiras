import { useEffect, useState, useRef } from 'react'
import { CheckCircle, Loader, Globe, AlertCircle, Download } from 'lucide-react'
import { transcribeAudio, translateText, synthesizeVoice } from '../lib/ai'
import { extractAudio, mergeAudioWithVideo } from '../lib/videoProcessor'

const C = { primary: '#2aab8e', dark: '#1d8a6f', text: '#1a3d35', muted: '#4a7a6e', faint: '#7ab0a5' }

const STEPS = [
  { id: 'ffmpeg',     label: 'Carregando FFmpeg WASM' },
  { id: 'audio',      label: 'Extraindo áudio do vídeo' },
  { id: 'transcribe', label: 'Transcrevendo com Whisper' },
  { id: 'translate',  label: 'Traduzindo com GPT-4' },
  { id: 'voice',      label: 'Gerando dublagem (ElevenLabs)' },
  { id: 'render',     label: 'Montando vídeo final' },
  { id: 'done',       label: 'Pronto!' },
]

export default function ProgressScreen({ job, onDone }) {
  const [step, setStep]       = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError]     = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [log, setLog]         = useState('')
  const ran = useRef(false)

  const advance = (idx, pct = 1) => {
    setStep(idx)
    setProgress(Math.min(100, ((idx + pct) / STEPS.length) * 100))
  }

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    run()
  }, [])

  const run = async () => {
    try {
      const { file, srcLangCode = 'en', dstLang = 'Português Brasil', voiceType = 'fem', voiceOpt = 'Adulta' } = job

      if (!file) {
        throw new Error('Selecione um arquivo de vídeo para a tradução com IA. Tradução por URL requer servidor dedicado.')
      }

      // 1 — Load FFmpeg
      advance(0, 0)
      setLog('Baixando processador de vídeo...')
      // FFmpeg is loaded lazily inside extractAudio — just signal ready
      advance(0, 0.5)

      // 2 — Extract audio
      advance(1, 0)
      setLog('Extraindo áudio...')
      const audioBlob = await extractAudio(file, (msg) => setLog(msg?.slice(0, 80) || ''))
      advance(1)

      // 3 — Transcribe (Whisper)
      advance(2, 0)
      setLog('Enviando áudio para Whisper...')
      const transcript = await transcribeAudio(audioBlob, srcLangCode)
      setLog(`Transcrição: "${transcript.slice(0, 60)}..."`)
      advance(2)

      // 4 — Translate (GPT-4)
      advance(3, 0)
      setLog('Traduzindo texto...')
      const translated = await translateText(transcript, dstLang)
      setLog(`Tradução: "${translated.slice(0, 60)}..."`)
      advance(3)

      // 5 — Synthesize (ElevenLabs)
      advance(4, 0)
      setLog('Gerando voz dublada...')
      const dubbedAudio = await synthesizeVoice(translated, voiceType, voiceOpt)
      advance(4)

      // 6 — Merge video + audio
      advance(5, 0)
      setLog('Montando vídeo com áudio dublado...')
      const finalVideo = await mergeAudioWithVideo(file, dubbedAudio, (msg) => setLog(msg?.slice(0, 80) || ''))
      advance(5)

      // 7 — Done
      advance(6)
      setProgress(100)
      const url = URL.createObjectURL(finalVideo)
      setDownloadUrl(url)
      setLog('Vídeo pronto!')

      setTimeout(() => onDone({
        ...job,
        downloadUrl: url,
        videoBlob: finalVideo,
        transcript,
        translation: translated,
      }), 1200)

    } catch (err) {
      console.error(err)
      setError(err.message || 'Erro inesperado durante o processamento.')
    }
  }

  const pct = Math.round(progress)

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 fade-in">
        <div className="card p-6 text-center">
          <AlertCircle size={40} color="#dc2626" className="mx-auto mb-3"/>
          <h3 className="text-base font-bold mb-2" style={{ color: C.text }}>Erro no Processamento</h3>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: C.muted }}>{error}</p>
          <button onClick={() => window.location.reload()}
            className="btn-primary px-6 py-3 text-sm">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

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
          <div className="progress-fill" style={{ width: `${pct}%`, transition: 'width 0.4s ease' }}/>
        </div>
        {log && (
          <p className="text-xs mt-2 truncate" style={{ color: C.faint }}>{log}</p>
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
              {active && <span className="ml-auto text-xs" style={{ color: C.primary }}>●</span>}
            </div>
          )
        })}
      </div>

      {/* Info chips */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Original', val: job?.srcLang || '—' },
          { label: 'Destino',  val: job?.dstLang || '—' },
          { label: 'Voz',      val: job?.voiceOpt || '—' },
        ].map(({ label, val }) => (
          <div key={label} className="card p-3 text-center">
            <div className="text-xs" style={{ color: C.faint }}>{label}</div>
            <div className="text-xs font-semibold mt-1 truncate" style={{ color: C.text }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Download button when ready */}
      {downloadUrl && (
        <a href={downloadUrl} download={`${job?.fileName?.replace(/\.[^.]+$/, '') || 'video'}_dublado.mp4`}
          className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 fade-in"
          style={{ textDecoration: 'none' }}>
          <Download size={16}/> Baixar Vídeo Dublado
        </a>
      )}
    </div>
  )
}
