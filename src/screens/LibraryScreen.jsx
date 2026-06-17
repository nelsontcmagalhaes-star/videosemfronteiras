import { useState } from 'react'
import { Play, Download, Trash2, RefreshCw, BookOpen, Globe, Loader, X, Info } from 'lucide-react'

const C = { primary: '#2aab8e', dark: '#1d8a6f', text: '#1a3d35', muted: '#4a7a6e', faint: '#7ab0a5' }

function Modal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="card w-full max-w-sm p-6 fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Info size={18} color={C.primary}/>
            <h3 className="font-bold text-sm" style={{ color: C.text }}>Integração com IA</h3>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.faint }}>
            <X size={18}/>
          </button>
        </div>
        <p className="text-sm leading-relaxed mb-4" style={{ color: C.muted }}>
          A tradução e dublagem real de vídeos requer integração com APIs de IA:
        </p>
        <ul className="space-y-2 mb-4">
          {[
            { icon: '🎙️', label: 'OpenAI Whisper', desc: 'Transcrição do áudio' },
            { icon: '🌐', label: 'GPT-4', desc: 'Tradução do texto' },
            { icon: '🔊', label: 'ElevenLabs', desc: 'Geração de voz dublada' },
            { icon: '🎬', label: 'FFmpeg', desc: 'Montagem do vídeo final' },
          ].map(({ icon, label, desc }) => (
            <li key={label} className="flex items-center gap-3 p-2 rounded-lg"
              style={{ background: 'rgba(42,171,142,0.06)' }}>
              <span className="text-lg">{icon}</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: C.dark }}>{label}</p>
                <p className="text-xs" style={{ color: C.faint }}>{desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs" style={{ color: C.faint }}>
          Esta é a versão de demonstração do app. A integração completa com as APIs de IA está planejada para a próxima etapa.
        </p>
        <button onClick={onClose} className="btn-primary w-full py-2.5 text-sm mt-4">
          Entendi
        </button>
      </div>
    </div>
  )
}

export default function LibraryScreen({ library, loading, onDelete, onRetranslate }) {
  const [showModal, setShowModal] = useState(false)
  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Loader size={32} color={C.primary} className="spin mx-auto mb-3"/>
        <p className="text-sm" style={{ color:C.muted }}>Carregando biblioteca...</p>
      </div>
    )
  }
  if (!library.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center fade-in">
        <BookOpen size={48} color={C.faint} className="mx-auto mb-4"/>
        <h2 className="text-lg font-semibold mb-2" style={{ color:C.text }}>Biblioteca Vazia</h2>
        <p className="text-sm" style={{ color:C.muted }}>Seus vídeos traduzidos aparecerão aqui.</p>
        <button onClick={onRetranslate} className="btn-primary mt-6 px-6 py-3 text-sm">Traduzir um vídeo</button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 fade-in">
      {showModal && <Modal onClose={() => setShowModal(false)} />}

      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={20} color={C.primary}/>
        <h2 className="text-lg font-bold" style={{ color:C.text }}>Biblioteca</h2>
        <span className="ml-auto text-xs px-2 py-1 rounded-full font-semibold"
          style={{ background:'rgba(42,171,142,0.12)', color:C.dark }}>
          {library.length} vídeo{library.length!==1?'s':''}
        </span>
      </div>

      {/* Banner informativo */}
      <div className="card p-3 mb-4 flex items-start gap-3"
        style={{ background:'rgba(245,158,11,0.08)', borderColor:'rgba(245,158,11,0.25)' }}>
        <span className="text-lg flex-shrink-0">⚙️</span>
        <div className="flex-1">
          <p className="text-xs font-semibold" style={{ color:'#92400e' }}>Versão de Demonstração</p>
          <p className="text-xs mt-0.5" style={{ color:'#b45309' }}>
            O fluxo de tradução com IA real (Whisper + GPT-4 + ElevenLabs) será ativado após configurar as chaves de API.
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ background:'none', border:'none', cursor:'pointer', color:'#d97706', flexShrink:0 }}>
          <Info size={16}/>
        </button>
      </div>

      <div className="space-y-3">
        {library.map(v=>(
          <div key={v.id} className="card p-4 fade-in">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:`linear-gradient(135deg,${C.primary},${C.dark})` }}>
                <Globe size={20} color="white"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color:C.text }}>{v.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background:'rgba(42,171,142,0.12)', color:C.dark }}>✓ Registrado</span>
                  <span className="text-xs" style={{ color:C.faint }}>{v.srcLang} → {v.dstLang}</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs" style={{ color:C.faint }}>
                  <span>📅 {v.date}</span>
                  <span>⏱ {v.duration}</span>
                  <span>💾 {v.size}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3 pt-3" style={{ borderTop:`1px solid rgba(42,171,142,0.12)` }}>
              <button onClick={() => setShowModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background:'rgba(42,171,142,0.12)', color:C.dark }}>
                <Play size={13}/> Assistir
              </button>
              <button onClick={() => setShowModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background:`linear-gradient(135deg,${C.primary},${C.dark})`, color:'white' }}>
                <Download size={13}/> Download
              </button>
              <button onClick={onRetranslate}
                className="flex items-center justify-center py-2 px-3 rounded-lg text-xs transition-all"
                title="Nova tradução"
                style={{ background:'rgba(42,171,142,0.08)', color:C.muted }}>
                <RefreshCw size={13}/>
              </button>
              <button onClick={()=>onDelete(v.id)}
                className="flex items-center justify-center py-2 px-3 rounded-lg text-xs transition-all"
                title="Excluir"
                style={{ background:'rgba(239,68,68,0.08)', color:'#dc2626' }}>
                <Trash2 size={13}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botão Nova Tradução */}
      <button onClick={onRetranslate} className="btn-primary w-full py-3 text-sm mt-4 flex items-center justify-center gap-2">
        <Globe size={16}/> + Nova Tradução
      </button>
    </div>
  )
}
