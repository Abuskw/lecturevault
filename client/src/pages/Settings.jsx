import { useState } from 'react'

function Settings({ t, css, user, setUser, token, setToken, page, setPage, darkMode, setDarkMode, API, showToast }) {
  const [tab, setTab] = useState('account')
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '', studentLevel: '', role: 'student', lecturerCode: '' })
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    const ep = isLogin ? '/api/auth/login' : '/api/auth/register'
    const body = isLogin ? { email: authForm.email, password: authForm.password } : authForm
    try {
      const res = await fetch(API + ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user))
        setToken(data.token); setUser(data.user)
        showToast(isLogin ? 'Welcome back! 👋' : 'Account created! 🎉')
        setPage('home')
      } else setMessage(data.error)
    } catch { setMessage('Network error') }
  }

  const logout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    setToken(null); setUser(null); setPage('home')
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>⚙️ Settings</h2>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {['account','appearance','about','privacy'].map(tabName => (
          <button key={tabName} onClick={() => setTab(tabName)}
            style={tab===tabName ? css.btn(t.accent) : {...css.btn(t.accent), background:'transparent', color:t.text, border:`1px solid ${t.border}`, fontSize:12}}>
            {tabName==='account'?'👤':tabName==='appearance'?'🎨':tabName==='about'?'ℹ️':'🔒'} {tabName.charAt(0).toUpperCase()+tabName.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'account' && (
        <div style={css.card}>
          {!user ? (
            <>
              <h3 style={{ textAlign: 'center', marginTop: 0 }}>{isLogin ? '🔐 Welcome Back' : '📝 Create Account'}</h3>
              {message && <div style={{ padding: 10, borderRadius: 8, marginBottom: 12, background: '#fef2f2', color: '#dc2626', fontSize: 14 }}>{message}</div>}
              <form onSubmit={handleAuth}>
                {!isLogin && <>
                  <select value={authForm.role} onChange={e => setAuthForm({...authForm, role: e.target.value})} style={{...css.select, marginBottom: 10}}>
                    <option value="student">🎓 Student</option><option value="lecturer">👨‍🏫 Lecturer</option>
                  </select>
                  <input placeholder="Full Name *" value={authForm.fullName} onChange={e => setAuthForm({...authForm, fullName: e.target.value})} style={{...css.input, marginBottom: 10}} required />
                  {authForm.role==='lecturer' && <input type="password" placeholder="Lecturer Code *" value={authForm.lecturerCode} onChange={e => setAuthForm({...authForm, lecturerCode: e.target.value})} style={{...css.input, marginBottom: 10}} required />}
                </>}
                <input type="email" placeholder="Email *" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} style={{...css.input, marginBottom: 10}} required />
                <input type="password" placeholder="Password *" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} style={{...css.input, marginBottom: 10}} required />
                <button type="submit" style={{...css.btn(t.accent), width:'100%', justifyContent:'center', padding: 12}}>{isLogin?'Login':'Create Account'}</button>
              </form>
              <p onClick={() => { setIsLogin(!isLogin); setMessage('') }} style={{ textAlign:'center', color:t.accent, cursor:'pointer', marginTop:16, fontSize:14 }}>
                {isLogin ? "Don't have an account? Register →" : 'Already have an account? Login →'}
              </p>
            </>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${t.border}` }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:`linear-gradient(135deg,${t.accent},${t.purple})`, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:700 }}>{user.fullName?.charAt(0)?.toUpperCase()||'U'}</div>
                <div><h3 style={{margin:0}}>{user.fullName}</h3><p style={{color:t.sub,margin:2}}>{user.email}</p></div>
              </div>
              <div style={{...css.flexBetween, marginBottom: 16}}>
                <span>🌙 Dark Mode</span>
                <div onClick={() => setDarkMode(!darkMode)} style={{ width:48, height:26, borderRadius:13, background:darkMode?t.accent:'#cbd5e1', cursor:'pointer', position:'relative' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'white', position:'absolute', top:2, left:darkMode?24:2, transition:'all 0.3s' }}></div>
                </div>
              </div>
              <button onClick={logout} style={{...css.btn(t.danger), width:'100%', justifyContent:'center'}}>🚪 Logout</button>
            </>
          )}
        </div>
      )}
      {tab === 'appearance' && (
        <div style={css.card}><h3 style={{marginTop:0}}>🎨 Appearance</h3><p style={{color:t.sub}}>Dark mode toggle is in the Account tab.</p></div>
      )}
      {tab === 'about' && (
        <div style={css.card}><h3 style={{marginTop:0}}>ℹ️ About</h3><p style={{color:t.sub}}>LectureVault is a centralized lecture repository for students.</p></div>
      )}
      {tab === 'privacy' && (
        <div style={css.card}><h3 style={{marginTop:0}}>🔒 Privacy</h3><p style={{color:t.sub}}>We collect only necessary information. Your data is never sold.</p></div>
      )}
    </div>
  )
}

export default Settings