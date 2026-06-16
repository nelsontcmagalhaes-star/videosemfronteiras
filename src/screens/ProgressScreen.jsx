import { useEffect, useState } from 'react'
import { CheckCircle, Loader, Globe } from 'lucide-react'

const C = { primary: '#2aab8e', dark: '#1d8a6f', text: '#1a3d35', muted: '#4a7a6e', faint: '#7ab0a5' }

const STEPS = [
  { id: 'upload',    label: 'Enviando vídeo',           duration: 1500 },
  { id: 'audio',     label: 'Extraindo áudio',           duration: 1200 },
  { id: 'transcribe',label: 'Transcrevendo (Whisper)',   duration: 2000 },
  { id: 'translate', label: 'Traduzindo (GPT-4)',        duration: 1800 },
  { id: 'voice',     label: 'Gerando voz (ElevenLabs)', duration: 2200 },
  { id: 'render',    label: 'Renderizando vídeo',        duration: 2500 },
  { id: 'finalize',  label: 'Finalizando',               duration: 800  },
]

export default function ProgressScreen({ job, onDone }) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf
    const runStep = (idx) => {
      if (idx >= STEPS.length) { setTimeout(()=>onDone(job), 500); return }
      setStep(idx)
      const dur = STEPS[idx].duration
      const start = Date.now()
      const tick = () => {
        const frac = Math.min((Date.now()-start)/dur, 1)
        setProgress((idx/STEPS.length)*100 + frac*(100/STEPS.length))
        if (frac < 1) raf = requestAnimationFrame(tick)
        else runStep(idx+1)
      }
      raf = requestAnimationFrame(tick)
    }
    runStep(0)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="max-w-lg mx-auto px-4 py-8 fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background:`linear-gradient(135deg,${C.primary},${C.dark})` }}>
          <Globe size={32} color="white" className="spin"/>
        </div>
        <h2 className="text-xl font-bold" style={{ color:C.text }}>Traduzindo Vídeo</h2>
        <p className="text-sm mt-1" style={{ color:C.muted }}>
          {job?.fileName||'Vídeo'} → {job?.dstLang}
        </p>
      </div>

      {/* Progress bar */}
      <div className="card p-4 mb-6">
        <div className="flex justify-between text-xs mb-2" style={{ color:C.faint }}>
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width:`${progress}%` }}/>
        </div>
      </div>

      {/* Steps */}
      <div className="card p-4 space-y-3">
        {STEPS.map((s,i) => {
          const done = i < step, active = i === step, pending = i > step
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className="w-6 h-6 flex-shrink-0">
                {done   && <CheckCircle size={22} color={C.dark}/>}
                {active && <Loader size={22} color={C.primary} className="spin"/>}
                {pending && <div className="w-5 h-5 rounded-full border-2 ml-0.5" style={{ borderColor:'rgba(42,171,142,0.25)' }}/>}
              </div>
              <span className={`text-sm font-medium`}
                style={{ color: done ? C.dark : active ? C.text : C.faint }}>
                {s.label}
              </span>
              {done   && <span className="ml-auto text-xs" style={{ color:C.dark }}>✓</span>}
              {active && <span className="ml-auto text-xs spin inline-block" style={{ color:C.primary }}>●</span>}
            </div>
          )
        })}
      </div>

      {/* Info chips */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label:'Idioma',  val: job?.srcLang||'—' },
          { label:'Destino', val: job?.dstLang||'—' },
          { label:'Voz',     val: job?.voiceOpt||'—' },
        ].map(({label,val})=>(
          <div key={label} className="card p-3 text-center">
            <div className="text-xs" style={{ color:C.faint }}>{label}</div>
            <div className="text-sm font-semibold mt-1 truncate" style={{ color:C.text }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
