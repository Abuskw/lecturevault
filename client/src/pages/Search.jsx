function Search({ searchQuery, setSearchQuery, filterSchool, filterDept, filterLevel, setFilterLevel, setFilterDept, faculties, departments, courses, handleFacultyChange, setSelectedCourse, loadLectures, setPage, t, css, setFilterSchool }) {
  const filtered = courses.filter(c => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.code.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterLevel && c.level !== parseInt(filterLevel)) return false
    return true
  })

  const cardHover = {
    onMouseEnter: e => { e.currentTarget.style.transform='translateY(-3px)' },
    onMouseLeave: e => { e.currentTarget.style.transform='' }
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>🔍 Search Courses</h2>
      <div style={css.card}>
        <input placeholder="Search by course title or code..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{...css.input, marginBottom: 12}} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select value={filterSchool} onChange={e => handleFacultyChange(e.target.value)} style={{...css.select, flex:'1 1 200px'}}>
            <option value="">🏛️ All Faculties</option>
            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{...css.select, flex:'1 1 200px'}}>
            <option value="">📚 All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{...css.select, flex:'1 1 150px'}}>
            <option value="">📊 All Levels</option>
            {[100,200,300,400].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div style={{...css.grid, marginTop: 20}}>
        {filtered.map(c => (
          <div key={c.id} style={{...css.card, cursor:'pointer'}} {...cardHover}
            onClick={() => { setSelectedCourse(c); loadLectures(c.id); setPage('course') }}>
            <span style={css.tag(t.accent)}>{c.code}</span>
            <h3 style={{ margin:'8px 0 4px', fontSize:16 }}>{c.title}</h3>
            <p style={{ color:t.sub, fontSize:13, margin:0 }}>Level {c.level} • Sem {c.semester}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Search