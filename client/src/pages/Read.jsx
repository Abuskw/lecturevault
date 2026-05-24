function Read({ bookmarks, toggleBookmark, setPdfViewer, API, t, css, setPage }) {
  const EmptyState = ({ icon, title, action, actionLabel, onAction }) => (
    <div style={{ textAlign:'center', padding:60 }}>
      <div style={{ fontSize:56, marginBottom:16 }}>{icon}</div>
      <h3 style={{ fontSize:18, marginBottom:8, color:t.text }}>{title}</h3>
      {action && <button onClick={onAction} style={{...css.btn(t.accent), marginTop:12}}>{actionLabel}</button>}
    </div>
  )

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📖 My Library</h2>
      <div style={css.card}>
        <h3 style={{ marginTop: 0 }}>⭐ Bookmarks ({bookmarks.length})</h3>
        {bookmarks.length === 0 ? <EmptyState icon="⭐" title="No bookmarks yet" action={true} actionLabel="🔍 Browse" onAction={() => setPage('home')} /> :
          bookmarks.map(l => (
            <div key={l.id} style={{...css.flexBetween, padding:'12px 0', borderBottom:`1px solid ${t.border}`}}>
              <div><strong>{l.title}</strong><p style={{ color:t.sub, fontSize:13, margin:2 }}>Week {l.weekNumber}</p></div>
              <div style={{ display:'flex', gap:8 }}>
                {l.fileUrl && <button onClick={() => setPdfViewer({ url:`${API}/api/lectures/${l.id}/download`, title:l.title, lectureId:l.id })} style={css.btn(t.purple)}>👁 View</button>}
                <button onClick={() => toggleBookmark(l)} style={css.btn(t.danger)}>🗑</button>
              </div>
            </div>
          ))
        }
      </div>
      <div style={css.card}>
        <h3 style={{ marginTop: 0 }}>📥 Recent Downloads</h3>
        {(() => {
          const dl = JSON.parse(localStorage.getItem('downloads') || '[]')
          if (dl.length === 0) return <EmptyState icon="📭" title="No downloads yet" />
          return dl.map((l, i) => (
            <div key={i} style={{...css.flexBetween, padding:'10px 0', borderBottom:`1px solid ${t.border}`}}>
              <div><strong>{l.title}</strong><p style={{ color:t.sub, fontSize:12, margin:2 }}>{l.courseCode} • Week {l.weekNumber} • {l.date}</p></div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setPdfViewer({ url:`${API}/api/lectures/${l.id}/download`, title:l.title })} style={css.btn(t.purple)}>👁</button>
                <button onClick={() => { const d = dl.filter((_,j) => j!==i); localStorage.setItem('downloads', JSON.stringify(d)); }} style={css.btn(t.danger)}>🗑</button>
              </div>
            </div>
          ))
        })()}
      </div>
    </div>
  )
}

export default Read