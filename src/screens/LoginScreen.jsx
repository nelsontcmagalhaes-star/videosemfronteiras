import { useState } from 'react'
import { Globe, Mail, MonitorSmartphone, Loader, Eye, EyeOff, KeyRound } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'

const C = { primary: '#2aab8e', dark: '#1d8a6f', text: '#1a3d35', muted: '#4a7a6e', faint: '#7ab0a5' }

export default function LoginScreen({ onLogin }) {
  const [email, setEmail]         = useState('')
  const [pass, setPass]           = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [mode, setMode]           = useState('options') // options | email | forgot | lgpd-pending
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [lgpdOk, setLgpdOk]       = useState(false)
  const [pendingUser, setPendingUser] = useState(null)

  // ── Login Google ───────────────────────────────────
  const loginGoogle = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  // ── Login E-mail ───────────────────────────────────
  const loginEmail = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    let userData = null

    let { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (signInErr) {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password: pass })
      if (signUpErr) { setError(signUpErr.message); setLoading(false); return }
      userData = signUpData?.user
    } else {
      userData = data?.user
    }

    setLoading(false)
    if (!userData) { setError('Não foi possível autenticar. Tente novamente.'); return }

    // Verifica se já aceitou LGPD
    const { data: profile } = await supabase.from('profiles').select('lgpd_accepted').eq('id', userData.id).single()
    if (!profile?.lgpd_accepted) {
      setPendingUser(userData)
      setMode('lgpd-pending')
    } else {
      onLogin(userData)
    }
  }

  // ── Aceitar LGPD ──────────────────────────────────
  const acceptLgpd = async () => {
    if (!lgpdOk || !pendingUser) return
    await supabase.from('profiles').upsert({
      id: pendingUser.id,
      lgpd_accepted: true,
      lgpd_accepted_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    onLogin(pendingUser)
  }

  // ── Esqueceu a senha ──────────────────────────────
  const forgotPassword = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?reset=true`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess(`Link enviado para ${email}! Verifique sua caixa de entrada.`)
  }

  // ── Render: Aguardando LGPD ───────────────────────
  if (mode === 'lgpd-pending') {
    return (
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center px-6">
        <div className="card w-full max-w-sm p-6 fade-in">
          <div className="text-2xl mb-3 text-center">🔒</div>
          <h2 className="text-lg font-bold text-center mb-2" style={{ color: C.text }}>
            Termo de Privacidade (LGPD)
          </h2>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: C.muted }}>
            Em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>,
            informamos que coletamos e tratamos seus dados pessoais (nome, e-mail, histórico de traduções)
            exclusivamente para prestação do serviço VídeoSemFronteiras. Seus dados são armazenados com segurança
            no Supabase e nunca serão vendidos ou compartilhados com terceiros sem seu consentimento.
            Você pode solicitar exclusão dos seus dados a qualquer momento pelo e-mail{' '}
            <span style={{ color: C.primary }}>nelsonassembler@gmail.com</span>.
          </p>

          <label className="flex items-start gap-3 cursor-pointer mb-5 p-3 rounded-xl"
            style={{ background: 'rgba(42,171,142,0.08)', border: `1px solid rgba(42,171,142,0.2)` }}>
            <input type="checkbox" checked={lgpdOk} onChange={e => setLgpdOk(e.target.checked)}
              className="mt-0.5 w-4 h-4 flex-shrink-0" style={{ accentColor: C.primary }}/>
            <span className="text-xs font-medium" style={{ color: C.dark }}>
              Li e concordo com o tratamento dos meus dados pessoais conforme descrito acima.
            </span>
          </label>

          <button onClick={acceptLgpd} disabled={!lgpdOk}
            className="btn-primary w-full py-3 text-sm">
            Aceitar e Entrar
          </button>
          <button onClick={() => { setMode('options'); setPendingUser(null) }}
            className="w-full py-2 mt-2 text-xs" style={{ color: C.faint, background: 'none', border: 'none', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
        <Footer/>
      </div>
    )
  }

  // ── Render: Esqueceu a senha ───────────────────────
  if (mode === 'forgot') {
    return (
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center px-6">
        <div className="mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.dark})` }}>
            <KeyRound size={28} color="white"/>
          </div>
          <h1 className="text-xl font-bold" style={{ color: C.text }}>Recuperar Senha</h1>
        </div>

        <div className="card w-full max-w-sm p-6 fade-in">
          {success ? (
            <div className="text-center">
              <div className="text-4xl mb-3">📬</div>
              <p className="text-sm font-semibold mb-2" style={{ color: C.dark }}>{success}</p>
              <button onClick={() => { setMode('email'); setSuccess('') }}
                className="btn-primary px-6 py-2.5 text-sm mt-3">Voltar ao login</button>
            </div>
          ) : (
            <>
              <p className="text-sm mb-4" style={{ color: C.muted }}>
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
              {error && <div className="mb-3 p-3 rounded-xl text-xs" style={{ background:'rgba(220,38,38,0.08)', color:'#dc2626' }}>{error}</div>}
              <form onSubmit={forgotPassword} className="space-y-3">
                <input type="email" required placeholder="seu@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background:'rgba(255,255,255,0.8)', border:`1px solid rgba(42,171,142,0.3)`, color:C.text }}/>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                  {loading && <Loader size={15} className="spin"/>}
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
                <button type="button" onClick={() => { setMode('email'); setError('') }}
                  className="w-full py-2 text-sm" style={{ color:C.muted, background:'none', border:'none', cursor:'pointer' }}>
                  ← Voltar
                </button>
              </form>
            </>
          )}
        </div>
        <Footer/>
      </div>
    )
  }

  // ── Render: Tela principal ────────────────────────
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
            {error && <div className="mb-3 p-3 rounded-xl text-xs" style={{ background:'rgba(220,38,38,0.08)', color:'#dc2626' }}>{error}</div>}
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
              Ao entrar, você concorda com os Termos de Uso e a LGPD
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-6 text-center" style={{ color:C.text }}>Entrar com E-mail</h2>
            {error && <div className="mb-3 p-3 rounded-xl text-xs" style={{ background:'rgba(220,38,38,0.08)', color:'#dc2626' }}>{error}</div>}
            <form onSubmit={loginEmail} className="space-y-3">
              <input type="email" required placeholder="seu@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background:'rgba(255,255,255,0.8)', border:`1px solid rgba(42,171,142,0.3)`, color:C.text }}/>

              {/* Campo senha com olho */}
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required placeholder="Senha (mín. 6 caracteres)" value={pass}
                  onChange={e => setPass(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
                  style={{ background:'rgba(255,255,255,0.8)', border:`1px solid rgba(42,171,142,0.3)`, color:C.text }}/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3.5" style={{ background:'none', border:'none', cursor:'pointer', color:C.faint }}>
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              {/* Esqueceu a senha */}
              <div className="text-right">
                <button type="button" onClick={() => { setMode('forgot'); setError('') }}
                  className="text-xs font-semibold" style={{ color:C.primary, background:'none', border:'none', cursor:'pointer' }}>
                  Esqueceu a senha?
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
                {loading && <Loader size={15} className="spin"/>}
                {loading ? 'Entrando...' : 'Entrar / Criar conta'}
              </button>
              <button type="button" onClick={() => { setMode('options'); setError('') }}
                className="w-full py-2 text-sm" style={{ color:C.muted, background:'none', border:'none', cursor:'pointer' }}>
                ← Voltar
              </button>
            </form>
          </>
        )}
      </div>

      {/* Tech stack */}
      <div className="w-full max-w-sm mt-6 card p-4">
        <p className="text-xs font-semibold mb-3 text-center" style={{ color:C.faint }}>TECNOLOGIA UTILIZADA</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon:'🎙️', label:'Whisper', desc:'Transcrição' },
            { icon:'🌐', label:'GPT-4',   desc:'Tradução'    },
            { icon:'🔊', label:'ElevenLabs', desc:'Dublagem' },
          ].map(({ icon, label, desc }) => (
            <div key={label}>
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-xs font-semibold" style={{ color:C.dark }}>{label}</div>
              <div className="text-xs" style={{ color:C.faint }}>{desc}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-center mt-3" style={{ color:C.faint }}>
          Arquivos MP4 · MOV · AVI · MKV até 25 MB
        </p>
      </div>

      <Footer/>
    </div>
  )
}
