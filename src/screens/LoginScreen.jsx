import { useState } from 'react'
import { Globe, Mail, MonitorSmartphone, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'

const C = { primary: '#2aab8e', dark: '#1d8a6f', text: '#1a3d35', muted: '#4a7a6e', faint: '#7ab0a5' }

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [mode, setMode]   = useState('options')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loginGoogle = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const loginEmail = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    // Tenta login; se não existir, cria conta
    let { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (signInErr) {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password: pass })
      if (signUpErr) { setError(signUpErr.message); setLoading(false); return }
      data = signUpData
    }
    if (data?.user) onLogin(data.user)
    setLoading(false)
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background:`linear-gradient(135deg,${C.primary},${C.dark})` }}>
          <Globe size={40} color="white"/>
        </div>
        <h1 className="text-3xl font-bold" style={{ color:C.text }}>VídeoSemFronteiras</h1>
        <p className="text-sm mt-2" style={{ color:C.muted }}>
          Traduza e duble vídeos com inteligência artificial
        </p>
      </div>

      <div className="card w-full max-w-sm p-6 fade-in">
        {mode === 'options' ? (
          <>
            <h2 className="text-lg font-semibold mb-6 text-center" style={{ color:C.text }}>Entrar na sua conta</h2>

            {error && (
              <div className="mb-3 p-3 rounded-xl text-xs" style={{ background:'rgba(220,38,38,0.08)', color:'#dc2626' }}>
                {error}
              </div>
            )}

            <button onClick={loginGoogle} disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-3 font-semibold transition-all hover:-translate-y-0.5"
              style={{ background:C.primary, color:'white', border:'none', opacity:loading?0.7:1 }}>
              {loading ? <Loader size={18} className="spin"/> : <MonitorSmartphone size={20}/>}
              Entrar com Google
            </button>

            <button onClick={() => setMode('email')}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-3 font-semibold transition-all hover:-translate-y-0.5"
              style={{ background:'rgba(42,171,142,0.10)', border:`1px solid rgba(42,171,142,0.25)`, color:C.dark }}>
              <Mail size={20}/> Entrar com E-mail
            </button>

            <p className="text-center text-xs mt-4" style={{ color:C.faint }}>
              Ao entrar, você concorda com os Termos de Uso
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-6 text-center" style={{ color:C.text }}>Entrar com E-mail</h2>
            {error && (
              <div className="mb-3 p-3 rounded-xl text-xs" style={{ background:'rgba(220,38,38,0.08)', color:'#dc2626' }}>
                {error}
              </div>
            )}
            <form onSubmit={loginEmail} className="space-y-3">
              <input type="email" required placeholder="seu@email.com" value={email}
                onChange={e=>setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background:'rgba(255,255,255,0.8)', border:`1px solid rgba(42,171,142,0.3)`, color:C.text }}/>
              <input type="password" required placeholder="Senha (mín. 6 caracteres)" value={pass}
                onChange={e=>setPass(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background:'rgba(255,255,255,0.8)', border:`1px solid rgba(42,171,142,0.3)`, color:C.text }}/>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                {loading && <Loader size={15} className="spin"/>}
                {loading ? 'Entrando...' : 'Entrar / Criar conta'}
              </button>
              <button type="button" onClick={()=>{ setMode('options'); setError('') }}
                className="w-full py-2 text-sm" style={{ color:C.muted, background:'none', border:'none', cursor:'pointer' }}>
                ← Voltar
              </button>
            </form>
          </>
        )}
      </div>

      {/* Plans */}
      <div className="w-full max-w-sm mt-6 grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <div className="text-xs font-semibold mb-1" style={{ color:C.faint }}>GRATUITO</div>
          <div className="text-xl font-bold" style={{ color:C.text }}>R$ 0</div>
          <div className="text-xs mt-2" style={{ color:C.muted }}>3 vídeos/mês • 5 min</div>
        </div>
        <div className="card p-4 text-center" style={{ borderColor:C.primary }}>
          <div className="text-xs font-semibold mb-1" style={{ color:C.primary }}>PREMIUM</div>
          <div className="text-xl font-bold" style={{ color:C.text }}>R$ 29,90</div>
          <div className="text-xs mt-2" style={{ color:C.muted }}>Ilimitado • 2h • HD</div>
        </div>
      </div>
    </div>
  )
}
