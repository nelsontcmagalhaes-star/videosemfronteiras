import { Shield, Users, Download, Video, DollarSign, Clock } from 'lucide-react'

const C = { primary: '#2aab8e', dark: '#1d8a6f', text: '#1a3d35', muted: '#4a7a6e', faint: '#7ab0a5' }

const mockUsers = [
  { id:1, name:'Nelson Tomaz',   email:'nelsontcmagalhaes@gmail.com', plan:'Admin',    videos:12 },
  { id:2, name:'Ana Lima',       email:'ana@email.com',               plan:'Premium',  videos:8  },
  { id:3, name:'Carlos Silva',   email:'carlos@email.com',            plan:'Gratuito', videos:2  },
  { id:4, name:'Mariana Costa',  email:'mari@email.com',              plan:'Premium',  videos:15 },
]

export default function AdminScreen({ library }) {
  const totalRevenue = mockUsers.filter(u=>u.plan==='Premium').length * 29.90

  const stats = [
    { icon:Users,      label:'Usuários Ativos',  value:mockUsers.length,                               color:C.primary, bg:'rgba(42,171,142,0.12)' },
    { icon:Video,      label:'Total Traduções',   value:library.length+20,                              color:C.dark,    bg:'rgba(29,138,111,0.10)' },
    { icon:DollarSign, label:'Receita Mensal',    value:`R$ ${totalRevenue.toFixed(2).replace('.',',')}`, color:'#059669', bg:'rgba(5,150,105,0.10)' },
    { icon:Clock,      label:'Horas Processadas', value:'47h',                                          color:'#d97706', bg:'rgba(217,119,6,0.10)' },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6 fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={20} color="#d97706"/>
        <h2 className="text-lg font-bold" style={{ color:C.text }}>Painel Administrativo</h2>
        <span className="ml-auto text-xs px-2 py-1 rounded-full font-semibold"
          style={{ background:'rgba(217,119,6,0.12)', color:'#b45309' }}>⭐ Admin</span>
      </div>

      {/* Permissions */}
      <div className="card p-4 mb-4">
        <p className="text-xs font-semibold mb-3" style={{ color:C.faint }}>PERMISSÕES DO ADMINISTRADOR</p>
        <div className="grid grid-cols-2 gap-2">
          {['✔ Criar','✔ Editar','✔ Excluir','✔ Gerenciar Usuários','✔ Gerenciar Assinaturas','✔ Ver Relatórios'].map(p=>(
            <span key={p} className="text-xs py-1 font-medium" style={{ color:C.dark }}>{p}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map(({icon:Icon,label,value,color,bg})=>(
          <div key={label} className="card p-3">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} color={color}/>
              <span className="text-xs" style={{ color:C.faint }}>{label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color:C.text }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Export */}
      <div className="card p-4 mb-4">
        <p className="text-xs font-semibold mb-3" style={{ color:C.faint }}>RELATÓRIOS</p>
        <div className="flex gap-2">
          {['PDF','Excel','CSV'].map(fmt=>(
            <button key={fmt} onClick={()=>alert(`Exportando ${fmt}...`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{ background:'rgba(42,171,142,0.10)', border:`1px solid rgba(42,171,142,0.25)`, color:C.dark }}>
              <Download size={12}/> {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Users */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} color={C.primary}/>
          <p className="text-xs font-semibold" style={{ color:C.muted }}>USUÁRIOS</p>
        </div>
        <div className="space-y-3">
          {mockUsers.map(u=>(
            <div key={u.id} className="flex items-center gap-3 py-2" style={{ borderBottom:`1px solid rgba(42,171,142,0.10)` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background:`linear-gradient(135deg,${C.primary},${C.dark})` }}>
                {u.name.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color:C.text }}>{u.name}</p>
                <p className="text-xs truncate" style={{ color:C.faint }}>{u.email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={u.plan==='Admin'
                    ? { background:'rgba(217,119,6,0.12)', color:'#b45309' }
                    : u.plan==='Premium'
                    ? { background:'rgba(42,171,142,0.12)', color:C.dark }
                    : { background:'rgba(42,171,142,0.06)', color:C.faint }}>
                  {u.plan}
                </span>
                <p className="text-xs mt-1" style={{ color:C.faint }}>{u.videos} vídeos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
