function Home({ faculties, courses, loading, t, css, setSelectedFaculty, handleFacultyChange, setPage }) {
  const Skeleton = ({ w, h }) => <div style={{ width: w||'100%', height: h||20, background: t.border, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
  const cardHover = {
    onMouseEnter: e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 25px rgba(0,0,0,0.1)' },
    onMouseLeave: e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your Lecture Library</h1>
        <p style={{ fontSize: 16, color: t.sub, maxWidth: 500, margin: '0 auto 24px' }}>Browse by Faculty, Department, and Level to find your lecture materials</p>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>🏛️ Faculties</h2>
      {loading ? (
        <div style={css.grid}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={css.card}><Skeleton w="80%" h={24} /><Skeleton w="60%" h={16} /></div>)}
        </div>
      ) : (
        <div style={css.grid}>
          {faculties.map(f => (
            <div key={f.id} style={{...css.card, cursor:'pointer', textAlign:'center', padding:'28px 20px'}} {...cardHover}
              onClick={() => { setSelectedFaculty(f); handleFacultyChange(f.id); setPage('faculty') }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{f.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home