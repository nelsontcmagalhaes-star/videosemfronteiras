import { useState, useRef } from 'react'
import { Upload, Link, Globe, ChevronDown, Settings } from 'lucide-react'

const C = { primary: '#2aab8e', dark: '#1d8a6f', light: '#4fc4a8', text: '#1a3d35', muted: '#4a7a6e', faint: '#7ab0a5' }

const LANGS = [
  { code: 'en', flag: '🇺🇸', name: 'Inglês',   short: 'EN' },
  { code: 'es', flag: '🇪🇸', name: 'Espanhol', short: 'ES' },
  { code: 'fr', flag: '🇫🇷', name: 'Francês',  short: 'FR' },
  { code: 'de', flag: '🇩🇪', name: 'Alemão',   short: 'DE' },
  { code: 'ja', flag: '🇯🇵', name: 'Japonês',  short: 'JP' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinês',   short: 'CN' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano', short: 'IT' },
  { code: 'pt', flag: '🇧🇷', name: 'Português',short: 'BR' },
]

const DST_LANGS = ['Português Brasil','Inglês','Espanhol','Francês','Alemão','Italiano','Japonês']

const VOICE_TYPES = [
  { id: 'fem', emoji: '👩', label: 'Feminina',  opts: ['Jovem','Adulta','Madura'] },
  { id: 'mas', emoji: '👨', label: 'Masculina', opts: ['Jovem','Adulto','Maduro'] },
  { id: 'neu', emoji: '🤖', label: 'Neutra',    opts: ['IA Natural','IA Narrador'] },
]

const TOGGLES = [
  { id: 'lips',        label: 'Sincronizar lábios' },
  { id: 'music',       label: 'Manter trilha sonora' },
  { id: 'removeVoice', label: 'Remover voz original' },
  { id: 'subtitles',   label: 'Criar legendas' },
  { id: 'srt',         label: 'Gerar SRT' },
  { id: 'audio',       label: 'Melhorar áudio' },
]

export default function HomeScreen({ user, onStart }) {
  const [inputMode, setInputMode] = useState('file')
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [srcLang, setSrcLang] = useState('en')
  const [dstLang, setDstLang] = useState('Português Brasil')
  const [voiceType, setVoiceType] = useState('fem')
  const [voiceOpt, setVoiceOpt] = useState('Jovem')
  const [settings, setSettings] = useState({ lips:false, music:true, removeVoice:true, subtitles:true, srt:false, audio:true })
  const [showAdv, setShowAdv] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const currentVoice = VOICE_TYPES.find(v => v.id === voiceType)
  const canStart = (inputMode==='file' && file) || (inputMode==='url' && url.trim())

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); setInputMode('file') }
  }

  const handleStart = () => {
    onStart({ fileName: file?.name || url, srcLang: LANGS.find(l=>l.code===srcLang)?.name||srcLang, dstLang, voiceType, voiceOpt, settings })
  }

  const isPremium = user.plan === 'admin' || user.plan === 'premium'

  const tabActive = { background: `linear-gradient(135deg,${C.primary},${C.dark})`, color: 'white' }
  const tabInactive = { color: C.muted }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.dark})` }}>
            <Globe size={20} color="white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight" style={{ color: C.text }}>VídeoSemFronteiras</h1>
            <p className="text-xs" style={{ color: C.faint }}>IA · Dubbing · Legendas</p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.dark})` }}>
          {user.avatar}
        </div>
      </div>

      {/* Plan badge */}
      {!isPremium && (
        <div className="card p-3 mb-4 flex items-center justify-between">
          <span className="text-xs" style={{ color: C.muted }}>Plano Gratuito · 3 vídeos/mês · até 5 min</span>
          <button className="text-xs font-semibold px-3 py-1 rounded-lg text-white"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.dark})` }}>
            Premium
          </button>
        </div>
      )}

      {/* Input Mode tabs */}
      <div className="card p-1 flex mb-4" style={{ borderRadius:'0.875rem' }}>
        <button onClick={() => setInputMode('file')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={inputMode==='file' ? tabActive : tabInactive}>
          <Upload size={15}/> Arquivo Local
        </button>
        <button onClick={() => setInputMode('url')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={inputMode==='url' ? tabActive : tabInactive}>
          <Link size={15}/> URL
        </button>
      </div>

      {/* Upload area */}
      {inputMode==='file' ? (
        <div className="card p-6 text-center mb-4 cursor-pointer transition-all"
          style={{ borderStyle:'dashed', borderColor: dragging ? C.primary : 'rgba(42,171,142,0.3)', background: dragging ? 'rgba(42,171,142,0.08)' : undefined }}
          onDragOver={e=>{e.preventDefault();setDragging(true)}}
          onDragLeave={()=>setDragging(false)}
          onDrop={handleDrop}
          onClick={()=>fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept=".mp4,.mov,.avi,.mkv,.webm" className="hidden" onChange={e=>setFile(e.target.files[0])}/>
          {file ? (
            <div>
              <div className="text-2xl mb-2">🎬</div>
              <p className="text-sm font-medium" style={{ color: C.text }}>{file.name}</p>
              <p className="text-xs mt-1" style={{ color: C.faint }}>{(file.size/1024/1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div>
              <Upload size={32} color={C.faint} className="mx-auto mb-3"/>
              <p className="text-sm font-medium" style={{ color: C.muted }}>Clique para selecionar um vídeo</p>
              <p className="text-xs mt-1" style={{ color: C.faint }}>MP4 · MOV · AVI · MKV · WEBM</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <input type="url" placeholder="Cole o link do vídeo (YouTube, Vimeo, Drive...)" value={url}
            onChange={e=>setUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background:'rgba(255,255,255,0.8)', border:`1px solid rgba(42,171,142,0.3)`, color:C.text }}/>
          <p className="text-xs mt-2 px-1" style={{ color:C.faint }}>Suporta: YouTube · Vimeo · Google Drive</p>
        </div>
      )}

      {/* Source Language */}
      <div className="card p-4 mb-4">
        <p className="text-xs font-semibold mb-3" style={{ color:C.faint }}>IDIOMA ORIGINAL</p>
        <div className="grid grid-cols-4 gap-2">
          {LANGS.map(l=>(
            <button key={l.code} className={`lang-card ${srcLang===l.code?'selected':''} py-2 px-1`}
              onClick={()=>setSrcLang(l.code)}>
              <div className="text-xl">{l.flag}</div>
              <div className="text-xs font-bold mt-1" style={{ color:srcLang===l.code?C.dark:C.muted }}>{l.short}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Destination Language */}
      <div className="card p-4 mb-4">
        <p className="text-xs font-semibold mb-3" style={{ color:C.faint }}>IDIOMA DE DESTINO</p>
        <div className="relative">
          <select value={dstLang} onChange={e=>setDstLang(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
            style={{ background:'rgba(255,255,255,0.8)', border:`1px solid rgba(42,171,142,0.25)`, color:C.text }}>
            {DST_LANGS.map(l=><option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown size={16} color={C.faint} className="absolute right-3 top-3.5 pointer-events-none"/>
        </div>
      </div>

      {/* Voice Type */}
      <div className="card p-4 mb-4">
        <p className="text-xs font-semibold mb-3" style={{ color:C.faint }}>TIPO DE VOZ</p>
        <div className="flex gap-2 mb-3">
          {VOICE_TYPES.map(v=>(
            <button key={v.id}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1"
              style={voiceType===v.id
                ? { background:`linear-gradient(135deg,${C.primary},${C.dark})`, color:'white' }
                : { background:'rgba(255,255,255,0.6)', color:C.muted, border:`1px solid rgba(42,171,142,0.2)` }}
              onClick={()=>{ setVoiceType(v.id); setVoiceOpt(v.opts[0]) }}>
              <span>{v.emoji}</span>
              <span className="text-xs">{v.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {currentVoice.opts.map(o=>(
            <button key={o} className={`voice-btn ${voiceOpt===o?'selected':''}`}
              onClick={()=>setVoiceOpt(o)}>{o}</button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="card p-4 mb-6">
        <button className="w-full flex items-center justify-between text-sm font-semibold"
          style={{ color:C.text }}
          onClick={()=>setShowAdv(!showAdv)}>
          <span className="flex items-center gap-2"><Settings size={15}/> Configurações Avançadas</span>
          <ChevronDown size={15} className={`transition-transform ${showAdv?'rotate-180':''}`} style={{ color:C.faint }}/>
        </button>
        {showAdv && (
          <div className="mt-4 space-y-3 fade-in">
            {TOGGLES.map(t=>(
              <div key={t.id} className="flex items-center justify-between">
                <span className="text-sm" style={{ color:C.muted }}>{t.label}</span>
                <button className={`toggle ${settings[t.id]?'on':''}`}
                  onClick={()=>setSettings(p=>({...p,[t.id]:!p[t.id]}))}/>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <button className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
        disabled={!canStart} onClick={handleStart}>
        <Globe size={18}/> INICIAR TRADUÇÃO
      </button>
    </div>
  )
}
