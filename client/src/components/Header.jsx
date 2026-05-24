function Header({ page, setPage, t, css, user, showProfile, setShowProfile, logout, handleFacultyChange }) {
  return (
    <header style={{
      background: t.header, color: 'white', padding: '0 24px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ fontSize: 22, fontWeight: 700, cursor: 'pointer' }} onClick={() => setPage('home')}>📚 LectureVault</span>
        <nav style={{ display: 'flex', gap: 4 }}>
          {['home','search','read','settings'].map(p => (
            <button key={p} onClick={() => { setPage(p); if(p==='search') handleFacultyChange('') }}
              style={{
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                fontWeight: page === p ? 600 : 400,
                background: page === p ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: 'none', color: 'white', transition: 'all 0.2s'
              }}>
              {p === 'home' ? '🏠' : p === 'search' ? '🔍' : p === 'read' ? '📖' : '⚙️'} {p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      <div style={{ position: 'relative' }}>
        {user ? (
          <>
            <div onClick={() => setShowProfile(!showProfile)} style={{
              width: 36, height: 36, borderRadius: '50%', background: 'white', color: t.header,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer', fontSize: 15
            }}>{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</div>
            {showProfile && (
              <div onClick={() => setShowProfile(false)} style={{
                position: 'absolute', right: 0, top: 48, background: t.card, borderRadius: 12,
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)', padding: 8, minWidth: 200, zIndex: 200, border: `1px solid ${t.border}`
              }}>
                <div style={{ padding: '12px', borderBottom: `1px solid ${t.border}`, marginBottom: 4 }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>{user.fullName}</p>
                  <p style={{ fontSize: 12, color: t.sub, margin: '2px 0' }}>{user.email}</p>
                  <span style={{ display:'inline-block',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,
                    background: user.role==='lecturer'?t.purple:user.role==='admin'?t.danger:t.success, color:'white' }}>{user.role}</span>
                </div>
                <button onClick={() => { setPage('settings'); setShowProfile(false) }} style={{ width:'100%',padding:'8px',border:'none',background:'transparent',color:t.text,cursor:'pointer',textAlign:'left',borderRadius:6 }}>👤 Profile</button>
                <button onClick={logout} style={{ width:'100%',padding:'8px',border:'none',background:'transparent',color:t.danger,cursor:'pointer',textAlign:'left',borderRadius:6 }}>🚪 Logout</button>
              </div>
            )}
          </>
        ) : (
          <button onClick={() => setPage('settings')} style={css.btn(t.accent)}>👤 Login</button>
        )}
      </div>
    </header>
  )
}

export default Header