import { useState, useEffect } from 'react'
import './index.css'
import { supabase } from './lib/supabase'
import { fetchTranslations, insertTranslation, deleteTranslation, upsertProfile } from './lib/db'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import HomeScreen from './screens/HomeScreen'
import ProgressScreen from './screens/ProgressScreen'
import LibraryScreen from './screens/LibraryScreen'
import DashboardScreen from './screens/DashboardScreen'
import LoginScreen from './screens/LoginScreen'
import AdminScreen from './screens/AdminScreen'

const ADMIN_EMAIL = 'nelsontcmagalhaes@gmail.com'

function buildUserObj(supaUser) {
  const name = supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Usuário'
  const avatar = name.slice(0, 2).toUpperCase()
  const email = supaUser.email || ''
  const plan = email === ADMIN_EMAIL ? 'admin' : 'free'
  return { id: supaUser.id, name, email, avatar, plan }
}

export default function App() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('home')
  const [currentJob, setCurrentJob] = useState(null)
  const [library, setLibrary] = useState([])
  const [libLoading, setLibLoading] = useState(false)

  // ── Sessão Supabase ──────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) initUser(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) initUser(session.user)
      else { setUser(null); setLibrary([]) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const initUser = async (supaUser) => {
    const u = buildUserObj(supaUser)
    setUser(u)
    await upsertProfile(u.id, { name: u.name, email: u.email, plan: u.plan }).catch(() => {})
    await loadLibrary(u.id)
    setLoading(false)
  }

  // ── Biblioteca (Supabase) ────────────────────────────
  const loadLibrary = async (userId) => {
    setLibLoading(true)
    try {
      const rows = await fetchTranslations(userId)
      setLibrary(rows.map(r => ({
        id: r.id,
        name: r.name,
        date: new Date(r.created_at).toLocaleDateString('pt-BR'),
        srcLang: r.src_lang,
        dstLang: r.dst_lang,
        duration: r.duration || '--:--',
        size: r.size || '---',
        status: r.status,
      })))
    } catch {
      // tabela ainda não existe — usa lista vazia
    }
    setLibLoading(false)
  }

  const handleStartTranslation = (config) => {
    setCurrentJob(config)
    setTab('progress')
  }

  const handleJobDone = async (job) => {
    const localItem = {
      id: Date.now(),
      name: job.fileName || 'Vídeo traduzido',
      date: new Date().toLocaleDateString('pt-BR'),
      srcLang: job.srcLang,
      dstLang: job.dstLang,
      duration: '--:--',
      size: '---',
      status: 'done',
      downloadUrl: job.downloadUrl || null,
    }
    try {
      const row = await insertTranslation(user.id, job)
      setLibrary(prev => [{
        ...localItem,
        id: row.id,
        date: new Date(row.created_at).toLocaleDateString('pt-BR'),
        duration: row.duration,
        size: row.size,
        status: row.status,
      }, ...prev])
    } catch {
      setLibrary(prev => [localItem, ...prev])
    }
    setCurrentJob(null)
    setTab('library')
  }

  const handleDelete = async (id) => {
    await deleteTranslation(id).catch(() => {})
    setLibrary(prev => prev.filter(v => v.id !== id))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null); setLibrary([])
  }

  // ── Render ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background:'linear-gradient(135deg,#2aab8e,#1d8a6f)' }}>
            <span className="text-2xl spin inline-block">🌐</span>
          </div>
          <p className="text-sm font-medium" style={{ color:'#4a7a6e' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginScreen onLogin={(u) => { initUser(u); setTab('home') }} />

  const isAdmin = user.email === ADMIN_EMAIL

  return (
    <div className="gradient-bg min-h-screen flex flex-col pb-20" style={{ color:'#1a3d35' }}>
      <div className="flex-1">
        {tab === 'home'      && <HomeScreen user={user} onStart={handleStartTranslation}/>}
        {tab === 'progress'  && <ProgressScreen job={currentJob} onDone={handleJobDone}/>}
        {tab === 'library'   && <LibraryScreen library={library} loading={libLoading} onDelete={handleDelete} onRetranslate={()=>setTab('home')}/>}
        {tab === 'dashboard' && <DashboardScreen library={library} user={user}/>}
        {tab === 'admin' && isAdmin && <AdminScreen library={library}/>}
      </div>
      <NavBar tab={tab} setTab={setTab} isAdmin={isAdmin} user={user} onLogout={handleLogout}/>
      <Footer/>
    </div>
  )
}
