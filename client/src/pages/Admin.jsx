import { useState, useEffect } from 'react'

function Admin({ API, token, t, css, showToast }) {
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [lectures, setLectures] = useState([])
  const [newCode, setNewCode] = useState('')

  const fetchAdmin = async (url) => {
    const res = await fetch(`${API}${url}`, { headers: { Authorization: `Bearer ${token}` } })
    return res.json()
  }

  useEffect(() => { if (tab === 'dashboard') fetchAdmin('/api/admin/stats').then(setStats) }, [tab])
  useEffect(() => { if (tab === 'users') fetchAdmin('/api/admin/users').then(setUsers) }, [tab])
  useEffect(() => { if (tab === 'lectures') fetchAdmin('/api/admin/lectures').then(setLectures) }, [tab])

  const changeRole = async (id, role) => {
    const res = await fetch(`${API}/api/admin/users/${id}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role }) })
    if (res.ok) {
      fetchAdmin('/api/admin/users').then(setUsers)
      showToast('Role updated!')
    } else {
      const data = await res.json(); showToast(data.error || 'Failed to update role', 'error')
    }
  }

  const removeUser = async (id) => {
    if (!confirm('Delete?')) return
    const res = await fetch(`${API}/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) fetchAdmin('/api/admin/users').then(setUsers)
    else { const data = await res.json(); showToast(data.error || 'Failed to delete user', 'error') }
  }

  const removeLecture = async (id) => {
    if (!confirm('Delete?')) return
    const res = await fetch(`${API}/api/admin/lectures/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) fetchAdmin('/api/admin/lectures').then(setLectures)
    else { const data = await res.json(); showToast(data.error || 'Failed to delete lecture', 'error') }
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>🛡️ Admin Panel</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['dashboard','users','lectures','code'].map(tabName => (
          <button key={tabName} onClick={() => setTab(tabName)} style={css.btn(tab===tabName?t.accent:'transparent')}>
            {tabName==='dashboard'?'📊':tabName==='users'?'👥':tabName==='lectures'?'📄':'🔑'} {tabName.charAt(0).toUpperCase()+tabName.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'dashboard' && stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:10 }}>
          {[{l:'Users',v:stats.users,c:t.accent},{l:'Students',v:stats.students,c:t.success},{l:'Lecturers',v:stats.lecturers,c:t.purple},{l:'Courses',v:stats.courses,c:t.warning},{l:'Lectures',v:stats.lectures,c:t.danger}].map(s => (
            <div key={s.l} style={{...css.card, textAlign:'center'}}><div style={{fontSize:28,fontWeight:800,color:s.c}}>{s.v}</div><div style={{color:t.sub,fontSize:12}}>{s.l}</div></div>
          ))}
        </div>
      )}
      {tab === 'users' && (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr><th style={{padding:8,textAlign:'left'}}>Name</th><th style={{padding:8,textAlign:'left'}}>Email</th><th style={{padding:8,textAlign:'left'}}>Role</th><th style={{padding:8,textAlign:'left'}}>Actions</th></tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id} style={{borderBottom:`1px solid ${t.border}`}}>
                <td style={{padding:8}}>{u.fullName}</td><td style={{padding:8}}>{u.email}</td>
                <td style={{padding:8}}><span style={{...css.badge,background:u.role==='admin'?t.danger:u.role==='lecturer'?t.purple:t.success,color:'white',fontSize:11}}>{u.role}</span></td>
                <td style={{padding:8}}>
                  <select defaultValue={u.role} onChange={e=>changeRole(u.id,e.target.value)} style={{padding:4,borderRadius:4,fontSize:11}}>
                    <option value="student">Student</option><option value="lecturer">Lecturer</option><option value="admin">Admin</option>
                  </select>
                  <button onClick={()=>removeUser(u.id)} style={{...css.btn(t.danger),padding:'4px 10px',fontSize:11,marginLeft:6}}>🗑</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {tab === 'lectures' && lectures.map(l => (
        <div key={l.id} style={{...css.flexBetween, padding:'10px 0', borderBottom:`1px solid ${t.border}`}}>
          <div><strong>{l.title}</strong><p style={{color:t.sub,fontSize:12,margin:2}}>{l.courseCode} • Week {l.weekNumber}</p></div>
          <button onClick={()=>removeLecture(l.id)} style={css.btn(t.danger)}>🗑</button>
        </div>
      ))}
      {tab === 'code' && (
        <div style={{...css.card, maxWidth:400}}><h3>🔑 Lecturer Code</h3><div style={{display:'flex',gap:8}}>
          <input placeholder="New code" value={newCode} onChange={e=>setNewCode(e.target.value)} style={css.input} />
          <button onClick={async () => { await fetch(`${API}/api/admin/lecturer-code`, { method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({code:newCode}) }); showToast('Updated!') }} style={css.btn(t.success)}>Update</button>
        </div></div>
      )}
    </div>
  )
}

export default Admin