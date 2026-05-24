function LevelPage({ selectedDepartment, selectedLevel, setSelectedLevel, setPage, courses, lectures, loading, user, setUploadForm, setFile, setPdfViewer, toggleBookmark, isBookmarked, API, t, css }) {
  const Skeleton = ({ w, h }) => <div style={{ width: w||'100%', height: h||20, background: t.border, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => { setPage('department'); setSelectedLevel(null) }} style={css.btnOutline}>← Back to Levels</button>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0 4px' }}>📊 {selectedLevel} Level</h2>
      <p style={{ color: t.sub, fontSize: 14, marginBottom: 20 }}>{selectedDepartment?.name}</p>
      
      {loading ? (
        [1,2,3].map(i => <div key={i} style={css.card}><Skeleton w="70%" h={20} /><Skeleton w="50%" h={14} /></div>)
      ) : (
        courses.filter(c => c.departmentId === selectedDepartment?.id && c.level === selectedLevel).map(course => {
          const courseLectures = lectures.filter(l => l.courseId === course.id)
          return (
            <div key={course.id} style={{ marginBottom: 24 }}>
              <div style={{...css.flexBetween, padding:'10px 14px', background:t.accent, borderRadius:10, color:'white', marginBottom:8 }}>
                <div>
                  <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>{course.code}</h3>
                  <p style={{ margin:'2px 0 0', fontSize:12, opacity:0.9 }}>{course.title} • Sem {course.semester}</p>
                </div>
                {user?.role === 'lecturer' && (
                  <button onClick={() => { setUploadForm(prev => ({...prev, courseId: course.id, title:'', weekNumber:''})); setFile(null); setPage('upload') }}
                    style={css.btn('rgba(255,255,255,0.2)')}>+ Add</button>
                )}
              </div>
              {courseLectures.length === 0 ? (
                <div style={{...css.card, textAlign:'center', padding:16, opacity:0.5 }}>
                  <p style={{ color:t.sub, margin:0, fontSize:13 }}>No PDFs yet</p>
                </div>
              ) : (
                courseLectures.sort((a,b) => a.weekNumber - b.weekNumber).map(lecture => (
                  <div key={lecture.id} style={{...css.card, ...css.flexBetween, padding:'10px 14px', marginBottom:6}}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
                      <span>📄</span>
                      <div>
                        <strong style={{ fontSize:13 }}>Week {lecture.weekNumber}: {lecture.title}</strong>
                        <p style={{ color:t.sub, fontSize:11, margin:2 }}>{lecture.academicYear}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:4 }}>
                      <button onClick={() => setPdfViewer({ url:`${API}/api/lectures/${lecture.id}/download`, title:lecture.title, lectureId:lecture.id })}
                        style={{...css.btn(t.purple), padding:'5px 10px', fontSize:11}}>👁</button>
                      <button onClick={() => window.open(`${API}/api/lectures/${lecture.id}/download`, '_blank')}
                        style={{...css.btn(t.accent), padding:'5px 10px', fontSize:11}}>⬇</button>
                      <button onClick={() => toggleBookmark(lecture)} style={{...css.iconBtn, fontSize:16, color:isBookmarked(lecture.id)?t.warning:t.sub}}>
                        {isBookmarked(lecture.id)?'⭐':'☆'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default LevelPage