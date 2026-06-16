import { Home, BookOpen, LayoutDashboard, Shield, LogOut } from 'lucide-react'

const C = { primary: '#2aab8e', dark: '#1d8a6f', text: '#1a3d35', muted: '#4a7a6e' }

export default function NavBar({ tab, setTab, isAdmin, user, onLogout }) {
  const items = [
    { id:'home',      icon:Home,            label:'Traduzir'   },
    { id:'library',   icon:BookOpen,        label:'Biblioteca' },
    { id:'dashboard', icon:LayoutDashboard, label:'Dashboard'  },
  ]
  if (isAdmin) items.push({ id:'admin', icon:Shield, label:'Admin' })

  return (
    <nav style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)', borderTop:`1px solid rgba(42,171,142,0.18)` }}
      className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
        {items.map(({id,icon:Icon,label})=>(
          <button key={id} className={`nav-item ${tab===id?'active':''}`} onClick={()=>setTab(id)}>
            <Icon size={20}/>
            <span>{label}</span>
          </button>
        ))}
        <button className="nav-item" onClick={onLogout}>
          <LogOut size={20}/>
          <span>Sair</span>
        </button>
      </div>
    </nav>
  )
}
