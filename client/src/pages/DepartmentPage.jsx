function DepartmentPage({ selectedDepartment, setSelectedDepartment, setSelectedLevel, setPage, courses, t, css, loadAllLectures }) {
  const cardHover = {
    onMouseEnter: e => { e.currentTarget.style.transform='translateY(-3px)' },
    onMouseLeave: e => { e.currentTarget.style.transform='' }
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => { setPage('faculty'); setSelectedDepartment(null) }} style={css.btnOutline}>← Back to Departments</button>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: '20px 0' }}>📚 {selectedDepartment?.name}</h2>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: t.sub }}>Select Level</h3>
      <div style={css.grid}>
        {[100, 200, 300, 400].map(level => {
          const count = courses.filter(c => c.departmentId === selectedDepartment?.id && c.level === level).length
          return (
            <div key={level} style={{...css.card, cursor:'pointer', textAlign:'center', padding:'24px 20px', opacity: count > 0 ? 1 : 0.4}} {...cardHover}
              onClick={() => count > 0 ? (setSelectedLevel(level), setPage('level')) : null}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{level} Level</h4>
              <p style={{ color: t.sub, fontSize: 12, marginTop: 4 }}>{count} courses</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DepartmentPage