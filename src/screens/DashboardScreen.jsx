import { LayoutDashboard, Video, Clock, DollarSign, TrendingUp, Globe } from 'lucide-react'

const C = { primary: '#2aab8e', dark: '#1d8a6f', light: '#4fc4a8', text: '#1a3d35', muted: '#4a7a6e', faint: '#7ab0a5' }

export default function DashboardScreen({ library, user }) {
  const totalVideos = library.length
  const mockHours = (library.length * 0.8).toFixed(1)
  const mockEconomy = (library.length * 120).toLocaleString('pt-BR', { style:'currency', currency:'BRL' })

  const cards = [
    { icon:Video,      label:'Vídeos Traduzidos',  value:totalVideos,    color:C.primary, bg:'rgba(42,171,142,0.12)' },
    { icon:Clock,      label:'Horas Processadas',   value:`${mockHours}h`, color:C.dark,   bg:'rgba(29,138,111,0.10)' },
    { icon:DollarSign, label:'Economia Estimada',   value:mockEconomy,   color:'#059669',  bg:'rgba(5,150,105,0.10)'  },
    { icon:TrendingUp, label:'Taxa de Sucesso',     value:'98%',         color:'#d97706',  bg:'rgba(217,119,6,0.10)'  },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6 fade-in">
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard size={20} color={C.primary}/>
        <h2 className="text-lg font-bold" style={{ color:C.text }}>Dashboard</h2>
      </div>

      {/* User card */}
      <div className="card p-4 mb-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white"
          style={{ background:`linear-gradient(135deg,${C.primary},${C.dark})` }}>
          {user.avatar}
        </div>
        <div>
          <p className="font-semibold" style={{ color:C.text }}>{user.name}</p>
          <p className="text-xs" style={{ color:C.faint }}>{user.email}</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs px-3 py-1 rounded-full font-semibold"
            style={user.plan==='admin'
              ? { background:'rgba(217,119,6,0.12)', color:'#b45309' }
              : user.plan==='premium'
              ? { background:'rgba(42,171,142,0.15)', color:C.dark }
              : { background:'rgba(42,171,142,0.08)', color:C.muted }}>
            {user.plan==='admin' ? '⭐ Admin' : user.plan==='premium' ? '💎 Premium' : 'Gratuito'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {cards.map(({icon:Icon,label,value,color,bg})=>(
          <div key={label} className="card p-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background:bg }}>
              <Icon size={18} color={color}/>
            </div>
            <p className="text-xl font-bold" style={{ color:C.text }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color:C.faint }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tech stack info */}
      <div className="card p-4 mb-5" style={{ borderColor:C.primary }}>
        <p className="text-xs font-semibold mb-3" style={{ color:C.primary }}>CAPACIDADES DO APP</p>
        <ul className="space-y-2">
          {[
            'Arquivos de vídeo até 25 MB (limite Whisper)',
            'Transcrição com OpenAI Whisper',
            'Tradução com GPT-4o-mini',
            'Dublagem com ElevenLabs (8 vozes)',
            'Download em MP4 (mesmo codec do original)',
          ].map(f=>(
            <li key={f} className="flex items-center gap-2 text-sm" style={{ color:C.muted }}>
              <span style={{ color:C.dark }}>✓</span> {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Recents */}
      {library.slice(0,3).length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-3" style={{ color:C.faint }}>RECENTES</p>
          <div className="space-y-2">
            {library.slice(0,3).map(v=>(
              <div key={v.id} className="card p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(42,171,142,0.12)' }}>
                  <Globe size={14} color={C.primary}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color:C.text }}>{v.name}</p>
                  <p className="text-xs" style={{ color:C.faint }}>{v.srcLang} → {v.dstLang} · {v.date}</p>
                </div>
                <span className="text-xs font-bold" style={{ color:C.dark }}>✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
