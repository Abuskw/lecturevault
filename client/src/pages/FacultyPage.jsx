function FacultyPage({ selectedFaculty, setSelectedFaculty, departments, setSelectedDepartment, setPage, t, css }) {
  const cardHover = {
    onMouseEnter: e => { e.currentTarget.style.transform='translateY(-3px)' },
    onMouseLeave: e => { e.currentTarget.style.transform='' }
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => { setPage('home'); setSelectedFaculty(null) }} style={css.btnOutline}>← Back to Faculties</button>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: '20px 0' }}>🏛️ {selectedFaculty?.name}</h2>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: t.sub }}>Select Department</h3>
      <div style={css.grid}>
        {departments.map(d => (
          <div key={d.id} style={{...css.card, cursor:'pointer', textAlign:'center', padding:'24px 20px'}} {...cardHover}
            onClick={() => { setSelectedDepartment(d); setPage('department') }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📚</div>
            <h4 style={{ margin: 0, fontSize: 15 }}>{d.name}</h4>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FacultyPage