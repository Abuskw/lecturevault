import { useState, useEffect } from 'react'

function App() {
  const [page, setPage] = useState('home')
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [showRating, setShowRating] = useState(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratings, setRatings] = useState([])
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [showComments, setShowComments] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [courses, setCourses] = useState([])
  const [lectures, setLectures] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSchool, setFilterSchool] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [faculties, setFaculties] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadForm, setUploadForm] = useState({ title: '', weekNumber: '', courseId: '', academicYear: '2024/2025' })
  const [file, setFile] = useState(null)
  const [bookmarks, setBookmarks] = useState(JSON.parse(localStorage.getItem('bookmarks') || '[]'))
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '', studentLevel: '', role: 'student', lecturerCode: '' })
  const [isLogin, setIsLogin] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [adminTab, setAdminTab] = useState('account')
  const [adminStats, setAdminStats] = useState(null)
  const [adminUsers, setAdminUsers] = useState([])
  const [adminLectures, setAdminLectures] = useState([])
  const [newLecturerCode, setNewLecturerCode] = useState('')
  const [pdfViewer, setPdfViewer] = useState(null)
  const [pdfZoom, setPdfZoom] = useState(1.0)
  const [uploadFaculty, setUploadFaculty] = useState('')
  const [uploadDept, setUploadDept] = useState('')
  const [uploadDepts, setUploadDepts] = useState([])
  const [mobileMenu, setMobileMenu] = useState(false)
  const [bulkFiles, setBulkFiles] = useState([])
  const [bulkTitles, setBulkTitles] = useState('')
  const [bulkWeeks, setBulkWeeks] = useState('')
  const [bulkUploading, setBulkUploading] = useState(false)

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/courses`).then(r => r.json()),
      fetch(`${API}/api/faculties`).then(r => r.json())
    ]).then(([coursesData, facultiesData]) => {
      setCourses(coursesData)
      setFaculties(facultiesData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // Load lectures when entering level page
  useEffect(() => {
    if (page === 'level' && selectedDepartment && selectedLevel) {
      setLoading(true)
      const deptCourses = courses.filter(c => c.departmentId === selectedDepartment.id && c.level === selectedLevel)
      let loaded = 0
      deptCourses.forEach(course => {
        fetch(`${API}/api/courses/${course.id}/lectures`)
          .then(r => r.json())
          .then(data => {
            setLectures(prev => [...prev.filter(l => l.courseId !== course.id), ...data])
            loaded++
            if (loaded >= deptCourses.length) setLoading(false)
          })
      })
      if (deptCourses.length === 0) setLoading(false)
    }
  }, [page, selectedDepartment, selectedLevel, courses])

  const loadLectures = (courseId) => {
    fetch(`${API}/api/courses/${courseId}/lectures`)
      .then(r => r.json())
      .then(d => setLectures(d))
  }

  const handleFacultyChange = (facultyId) => {
    setFilterSchool(facultyId)
    setFilterDept('')
    if (facultyId) {
      fetch(`${API}/api/faculties/${facultyId}/departments`).then(r => r.json()).then(d => setDepartments(d))
    } else setDepartments([])
  }

  const fetchAdmin = async (url) => {
    const res = await fetch(`${API}${url}`, { headers: { 'Authorization': `Bearer ${token}` } })
    return res.json()
  }

  const loadDashboard = async () => setAdminStats(await fetchAdmin('/api/admin/stats'))
  const loadUsers = async () => setAdminUsers(await fetchAdmin('/api/admin/users'))
  const loadAdminLectures = async () => setAdminLectures(await fetchAdmin('/api/admin/lectures'))

  const changeRole = async (id, role) => {
    await fetch(`${API}/api/admin/users/${id}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ role }) })
    loadUsers(); showToast('Role updated!')
  }

  const removeUser = async (id) => {
    if (!confirm('Delete this user?')) return
    await fetch(`${API}/api/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    loadUsers(); showToast('User deleted', 'error')
  }

  const loadRatings = async (lectureId) => {
    const res = await fetch(`${API}/api/lectures/${lectureId}/ratings`)
    setRatings(await res.json())
  }

  const loadComments = async (lectureId) => {
    const res = await fetch(`${API}/api/lectures/${lectureId}/comments`)
    setComments(await res.json())
  }

  const submitRating = async () => {
    const res = await fetch(`${API}/api/lectures/${showRating.lectureId}/rate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ value: ratingValue, comment: ratingComment })
    })
    showToast(`Rated ${ratingValue} stars! ⭐`)
    setShowRating(null); setRatingValue(0); setRatingComment('')
    loadLectures(selectedCourse?.id)
  }

  const submitComment = async (lectureId) => {
    if (!commentText.trim()) return
    await fetch(`${API}/api/lectures/${lectureId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ text: commentText, parentId: replyTo })
    })
    setCommentText(''); setReplyTo(null)
    loadComments(lectureId)
    showToast('Comment added! 💬')
  }

  const removeLecture = async (id) => {
    if (!confirm('Delete this lecture?')) return
    await fetch(`${API}/api/admin/lectures/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    loadAdminLectures(); showToast('Lecture deleted', 'error')
  }

  const updateCode = async () => {
    await fetch(`${API}/api/admin/lecturer-code`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ code: newLecturerCode }) })
    showToast('Code updated!')
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return showToast('Please select a PDF', 'error')
    const fd = new FormData()
    fd.append('pdf', file); fd.append('title', uploadForm.title); fd.append('weekNumber', uploadForm.weekNumber)
    fd.append('courseId', uploadForm.courseId); fd.append('academicYear', uploadForm.academicYear)
    try {
      const res = await fetch(`${API}/api/lectures/upload`, { method: 'POST', body: fd })
      if (res.ok) {
        showToast('✅ Lecture uploaded!')
        setUploadForm({ title: '', weekNumber: '', courseId: '', academicYear: '2024/2025' })
        setFile(null)
        if (page === 'level') {
          const course = courses.find(c => c.id == uploadForm.courseId)
          if (course) {
            fetch(`${API}/api/courses/${course.id}/lectures`).then(r => r.json()).then(d => {
              setLectures(prev => [...prev.filter(l => l.courseId !== course.id), ...d])
            })
          }
        }
      } else {
        const data = await res.json()
        showToast(data.error || 'Upload failed', 'error')
      }
    } catch { showToast('Network error', 'error') }
  }

  const handleBulkUpload = async (e) => {
    e.preventDefault()
    if (bulkFiles.length === 0) return showToast('Please select PDFs', 'error')
    setBulkUploading(true)
    const fd = new FormData()
    bulkFiles.forEach(f => fd.append('pdfs', f))
    fd.append('titles', JSON.stringify(bulkTitles.split(',').map(t => t.trim())))
    fd.append('weekNumbers', JSON.stringify(bulkWeeks.split(',').map(w => w.trim())))
    fd.append('courseId', uploadForm.courseId)
    fd.append('academicYear', uploadForm.academicYear || '2024/2025')
    try {
      const res = await fetch(`${API}/api/lectures/bulk-upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        showToast(`✅ ${data.count} lectures uploaded!`)
        setBulkFiles([]); setBulkTitles(''); setBulkWeeks('')
      } else showToast(data.error, 'error')
    } catch { showToast('Network error', 'error') }
    setBulkUploading(false)
  }

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
      } else showToast(data.error, 'error')
    } catch { showToast('Network error', 'error') }
  }

  const logout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    setToken(null); setUser(null); setPage('home')
    showToast('Logged out')
  }

  const toggleBookmark = (lecture) => {
    let updated = bookmarks.find(b => b.id === lecture.id) ? bookmarks.filter(b => b.id !== lecture.id) : [...bookmarks, lecture]
    setBookmarks(updated); localStorage.setItem('bookmarks', JSON.stringify(updated))
    showToast(bookmarks.find(b => b.id === lecture.id) ? 'Removed' : 'Bookmarked ⭐')
  }

  const isBookmarked = (id) => bookmarks.some(b => b.id === id)

  const filteredCourses = courses.filter(c => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.code.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterLevel && c.level !== parseInt(filterLevel)) return false
    return true
  })

  const t = darkMode ? {
    bg: '#0f172a', card: '#1e293b', text: '#e2e8f0', sub: '#94a3b8', border: '#334155',
    header: '#1e3a5f', accent: '#3b82f6', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', purple: '#8b5cf6'
  } : {
    bg: '#f1f5f9', card: '#ffffff', text: '#1e293b', sub: '#64748b', border: '#e2e8f0',
    header: '#1e40af', accent: '#3b82f6', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', purple: '#8b5cf6'
  }

  const css = {
    body: { fontFamily: "'Segoe UI', system-ui, sans-serif", background: t.bg, color: t.text, minHeight: '100vh', transition: 'all 0.3s' },
    header: { background: t.header, color: 'white', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
    logo: { fontSize: 20, fontWeight: 700, cursor: 'pointer' },
    navItem: (active) => ({ padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: active ? 600 : 400, background: active ? 'rgba(255,255,255,0.15)' : 'transparent', border: 'none', color: 'white', transition: 'all 0.2s' }),
    avatar: { width: 34, height: 34, borderRadius: '50%', background: 'white', color: t.header, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
    dropdown: { position: 'absolute', right: 0, top: 44, background: t.card, borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', padding: 8, minWidth: 200, zIndex: 200, border: `1px solid ${t.border}` },
    main: { maxWidth: 1100, margin: '0 auto', padding: '20px 16px' },
    card: { background: t.card, borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${t.border}`, transition: 'all 0.2s ease' },
    btn: (bg) => ({ background: bg || t.accent, color: 'white', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease' }),
    btnOutline: { background: 'transparent', color: t.accent, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, border: 'none' },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' },
    select: { width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, cursor: 'pointer' },
    badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
    tag: (c) => ({ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: c, color: 'white', marginRight: 6, marginBottom: 6 }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, padding: 6, borderRadius: 8, color: t.text },
  }

  const Skeleton = ({ w, h }) => (
    <div style={{ width: w || '100%', height: h || 20, background: t.border, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
  )

  const EmptyState = ({ icon, title, subtitle, action, actionLabel, onAction }) => (
    <div style={{ textAlign: 'center', padding: 40, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 18, marginBottom: 6, color: t.text }}>{title}</h3>
      {subtitle && <p style={{ color: t.sub, fontSize: 13, maxWidth: 350, margin: '0 auto 16px' }}>{subtitle}</p>}
      {action && <button onClick={onAction} style={{...css.btn(t.accent), marginTop: 8, padding: '10px 20px'}}>{actionLabel}</button>}
    </div>
  )

  const cardHover = {
    onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)' },
    onMouseLeave: (e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }
  }

  const pdfBtn = { background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }

  const openPDF = (lecture) => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (isMobile) window.open(`${API}/api/lectures/${lecture.id}/download`, '_blank')
    else setPdfViewer({ url: `${API}/api/lectures/${lecture.id}/download`, title: lecture.title, lectureId: lecture.id })
  }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
        input:focus, select:focus { border-color: ${t.accent} !important; box-shadow: 0 0 0 3px ${t.accent}20 !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-dropdown { display: block !important; }
        }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div onClick={() => setToast(null)} style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: toast.type === 'error' ? t.danger : t.success, color: 'white',
          padding: '10px 24px', borderRadius: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          fontSize: 14, fontWeight: 500, cursor: 'pointer', animation: 'slideUp 0.3s ease', whiteSpace: 'nowrap'
        }}>
          {toast.msg}
        </div>
      )}

      {/* PDF VIEWER */}
      {pdfViewer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#1e293b', color: 'white', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => { setPdfViewer(null); setPdfZoom(1) }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer', padding: '4px 10px', borderRadius: 6 }}>✕</button>
              <span style={{ fontWeight: 600, fontSize: 14 }}>📄 {pdfViewer.title}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button onClick={() => setPdfZoom(z => Math.max(0.5, z - 0.25))} style={pdfBtn}>🔍−</button>
              <span style={{ fontSize: 12 }}>{Math.round(pdfZoom * 100)}%</span>
              <button onClick={() => setPdfZoom(z => Math.min(3, z + 0.25))} style={pdfBtn}>🔍+</button>
              <button onClick={() => setPdfZoom(1)} style={pdfBtn}>↺</button>
              <button onClick={() => window.open(`${API}/api/lectures/${pdfViewer.lectureId}/download`, '_blank')} style={pdfBtn}>⬇</button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 10, background: '#525659' }}>
            <iframe src={pdfViewer.url} style={{ width: `${pdfZoom * 100}%`, maxWidth: '100%', height: '100%', border: 'none', borderRadius: 6 }} title="PDF Viewer" />
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {showRating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowRating(null)}>
          <div style={{ background: t.card, borderRadius: 16, padding: 24, maxWidth: 380, width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, textAlign: 'center' }}>⭐ Rate Lecture</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '16px 0' }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setRatingValue(star)} style={{ fontSize: 32, background: 'transparent', border: 'none', cursor: 'pointer', color: star <= ratingValue ? '#f59e0b' : t.border }}>
                  {star <= ratingValue ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <textarea placeholder="Add a comment (optional)..." value={ratingComment} onChange={e => setRatingComment(e.target.value)} style={{...css.input, minHeight: 70, marginBottom: 12, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowRating(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${t.border}`, background: 'transparent', color: t.text, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitRating} disabled={!ratingValue} style={{...css.btn(t.warning), flex: 1, justifyContent: 'center', opacity: ratingValue ? 1 : 0.5}}>Submit</button>
            </div>
          </div>
        </div>
      )}

      <div style={css.body}>
        {/* HEADER */}
        <header style={css.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={css.logo} onClick={() => setPage('home')}>📚 LectureVault</span>
            <nav className="desktop-nav" style={{ display: 'flex', gap: 2 }}>
              {['home','search','read','settings'].map(p => (
                <button key={p} style={css.navItem(page === p)} onClick={() => { setPage(p); if(p==='search') handleFacultyChange(''); setMobileMenu(false) }}>
                  {p === 'home' ? '🏠' : p === 'search' ? '🔍' : p === 'read' ? '📖' : '⚙️'} <span className="nav-text">{p.charAt(0).toUpperCase()+p.slice(1)}</span>
                </button>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <div style={css.avatar} onClick={() => setShowProfile(!showProfile)}>{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</div>
                {showProfile && (
                  <div style={css.dropdown} onClick={() => setShowProfile(false)}>
                    <div style={{ padding: '10px', borderBottom: `1px solid ${t.border}`, marginBottom: 4 }}>
                      <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>{user.fullName}</p>
                      <p style={{ fontSize: 11, color: t.sub, margin: '2px 0' }}>{user.email}</p>
                      <span style={{...css.badge, background: user.role==='lecturer'?t.purple:user.role==='admin'?t.danger:t.success, color:'white', fontSize: 11}}>{user.role}</span>
                    </div>
                    <button onClick={() => { setPage('settings'); setShowProfile(false) }} style={{ width:'100%', padding: '8px', border: 'none', background: 'transparent', color: t.text, cursor: 'pointer', textAlign: 'left', borderRadius: 6 }}>👤 Profile</button>
                    <button onClick={logout} style={{ width:'100%', padding: '8px', border: 'none', background: 'transparent', color: t.danger, cursor: 'pointer', textAlign: 'left', borderRadius: 6 }}>🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <button style={{...css.btn(t.accent), padding: '8px 16px', fontSize: 13}} onClick={() => setPage('settings')}>Login</button>
            )}
            <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)} style={{ display: 'none', background: 'transparent', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer' }}>☰</button>
          </div>
        </header>

        {/* MOBILE MENU */}
        {mobileMenu && (
          <div className="mobile-dropdown" style={{ display: 'none', background: t.header, padding: '8px' }}>
            {['home','search','read','settings'].map(p => (
              <button key={p} onClick={() => { setPage(p); setMobileMenu(false) }} style={{ display: 'block', width: '100%', padding: '12px', background: page===p?'rgba(255,255,255,0.1)':'transparent', border: 'none', color: 'white', textAlign: 'left', fontSize: 15, borderRadius: 8, marginBottom: 2 }}>
                {p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
        )}

        <main style={css.main}>
          {/* HOME */}
          {page === 'home' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your Lecture Library</h1>
                <p style={{ fontSize: 14, color: t.sub, marginBottom: 24 }}>Select your level or browse by faculty</p>
              </div>
              
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>📊 Select Your Level</h3>
              <div style={{...css.grid, marginBottom: 32}}>
                {[100, 200, 300, 400].map(level => (
                  <div key={level} style={{...css.card, cursor: 'pointer', textAlign: 'center', padding: '24px 16px'}} {...cardHover}
                    onClick={() => { setSelectedLevel(level); setPage('browse') }}>
                    <div style={{ fontSize: 36, marginBottom: 6 }}>📊</div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{level} Level</h3>
                  </div>
                ))}
              </div>
              
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>🏛️ Browse by Faculty</h3>
              <div style={css.grid}>
                {faculties.map(f => (
                  <div key={f.id} style={{...css.card, cursor: 'pointer', textAlign: 'center', padding: '16px'}} {...cardHover}
                    onClick={() => { setSelectedFaculty(f); handleFacultyChange(f.id); setPage('faculty') }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BROWSE BY LEVEL */}
          {page === 'browse' && selectedLevel && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <button onClick={() => setPage('home')} style={css.btnOutline}>← Back</button>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0' }}>📊 {selectedLevel} Level Courses</h2>
              {faculties.map(f => (
                <div key={f.id} style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: t.sub, marginBottom: 8 }}>{f.name}</h3>
                  {departments.filter(d => d.facultyId === f.id).map(d => {
                    const dc = courses.filter(c => c.departmentId === d.id && c.level === selectedLevel)
                    if (dc.length === 0) return null
                    return (
                      <div key={d.id} style={{ marginBottom: 12 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: t.sub }}>{d.name}</h4>
                        <div style={css.grid}>
                          {dc.map(c => (
                            <div key={c.id} style={{...css.card, cursor: 'pointer'}} {...cardHover}
                              onClick={() => { setSelectedCourse(c); loadLectures(c.id); setPage('course') }}>
                              <span style={css.tag(t.accent)}>{c.code}</span>
                              <h4 style={{ margin: '6px 0 2px', fontSize: 14 }}>{c.title}</h4>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {/* FACULTY PAGE */}
          {page === 'faculty' && selectedFaculty && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <button onClick={() => { setPage('home'); setSelectedFaculty(null) }} style={css.btnOutline}>← Back</button>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0' }}>🏛️ {selectedFaculty.name}</h2>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: t.sub }}>Select Department</h3>
              <div style={css.grid}>
                {departments.map(d => (
                  <div key={d.id} style={{...css.card, cursor: 'pointer', textAlign: 'center', padding: '20px'}} {...cardHover}
                    onClick={() => { setSelectedDepartment(d); setPage('department') }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📚</div>
                    <h4 style={{ margin: 0, fontSize: 14 }}>{d.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEPARTMENT PAGE */}
          {page === 'department' && selectedDepartment && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <button onClick={() => { setPage('faculty'); setSelectedDepartment(null) }} style={css.btnOutline}>← Back</button>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0' }}>📚 {selectedDepartment.name}</h2>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: t.sub }}>Select Level</h3>
              <div style={css.grid}>
                {[100, 200, 300, 400].map(level => {
                  const count = courses.filter(c => c.departmentId === selectedDepartment.id && c.level === level).length
                  return (
                    <div key={level} style={{...css.card, cursor: 'pointer', textAlign: 'center', padding: '20px', opacity: count > 0 ? 1 : 0.4}} {...cardHover}
                      onClick={() => count > 0 ? (setSelectedLevel(level), setPage('level')) : null}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📊</div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{level} Level</h4>
                      <p style={{ color: t.sub, fontSize: 12, marginTop: 4 }}>{count} courses</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* LEVEL PAGE - PDFs grouped by course */}
          {page === 'level' && selectedDepartment && selectedLevel && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <button onClick={() => { setPage('department'); setSelectedLevel(null) }} style={css.btnOutline}>← Back</button>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0 4px' }}>📊 {selectedLevel} Level</h2>
              <p style={{ color: t.sub, fontSize: 14, marginBottom: 20 }}>{selectedDepartment.name}</p>
              
              {loading ? (
                [1,2,3].map(i => <div key={i} style={css.card}><Skeleton h={20} /><Skeleton h={14} w="60%" /></div>)
              ) : (
                courses.filter(c => c.departmentId === selectedDepartment.id && c.level === selectedLevel).map(course => {
                  const courseLectures = lectures.filter(l => l.courseId === course.id)
                  return (
                    <div key={course.id} style={{ marginBottom: 24 }}>
                      <div style={{...css.flexBetween, padding: '10px 14px', background: t.accent, borderRadius: 10, color: 'white', marginBottom: 8 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{course.code}</h3>
                          <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.9 }}>{course.title} • Sem {course.semester}</p>
                        </div>
                        {user?.role === 'lecturer' && (
                          <button onClick={() => {
                            setUploadForm({...uploadForm, courseId: course.id, title: '', weekNumber: ''})
                            setFile(null)
                            setPage('quick-upload')
                          }} style={{...css.btn('rgba(255,255,255,0.2)'), padding: '6px 12px', fontSize: 12}}>+ Add</button>
                        )}
                      </div>
                      
                      {courseLectures.length === 0 ? (
                        <div style={{...css.card, textAlign: 'center', padding: 16, opacity: 0.5 }}>
                          <p style={{ color: t.sub, margin: 0, fontSize: 13, fontStyle: 'italic' }}>No PDFs yet</p>
                        </div>
                      ) : (
                        courseLectures.sort((a, b) => a.weekNumber - b.weekNumber).map(lecture => (
                          <div key={lecture.id} style={{...css.card, ...css.flexBetween, padding: '10px 14px', marginBottom: 6}}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                              <span style={{ fontSize: 18 }}>📄</span>
                              <div>
                                <strong style={{ fontSize: 13 }}>Week {lecture.weekNumber}: {lecture.title}</strong>
                                <p style={{ color: t.sub, fontSize: 11, margin: 2 }}>{lecture.academicYear}{lecture.averageRating ? ` • ⭐ ${Number(lecture.averageRating).toFixed(1)}` : ''}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => openPDF(lecture)} style={{...css.btn(t.purple), padding: '5px 10px', fontSize: 11}}>👁</button>
                              <button onClick={() => {
                                window.open(`${API}/api/lectures/${lecture.id}/download`, '_blank')
                                const dl = JSON.parse(localStorage.getItem('downloads') || '[]')
                                dl.unshift({ title: lecture.title, courseCode: course.code, weekNumber: lecture.weekNumber, fileUrl: lecture.fileUrl, date: new Date().toLocaleDateString() })
                                localStorage.setItem('downloads', JSON.stringify(dl.slice(0, 50)))
                              }} style={{...css.btn(t.accent), padding: '5px 10px', fontSize: 11}}>⬇</button>
                              <button onClick={() => toggleBookmark(lecture)} style={{...css.iconBtn, fontSize: 16, color: isBookmarked(lecture.id) ? t.warning : t.sub}}>
                                {isBookmarked(lecture.id) ? '⭐' : '☆'}
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
          )}

          {/* COURSE DETAIL (kept for backward compatibility) */}
          {page === 'course' && selectedCourse && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <button onClick={() => { setPage('browse'); setSelectedCourse(null) }} style={css.btnOutline}>← Back</button>
              <div style={{...css.card, marginTop: 12}}>
                <span style={css.tag(t.accent)}>{selectedCourse.code}</span>
                <h2 style={{ margin: '8px 0 2px', fontSize: 18 }}>{selectedCourse.title}</h2>
                <p style={{ color: t.sub, fontSize: 13 }}>Level {selectedCourse.level} • Semester {selectedCourse.semester}</p>
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>📚 Lectures</h3>
              {lectures.map(l => (
                <div key={l.id} style={{...css.card, ...css.flexBetween}}>
                  <div><strong>Week {l.weekNumber}: {l.title}</strong></div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => openPDF(l)} style={{...css.btn(t.purple), padding: '5px 10px', fontSize: 11}}>👁</button>
                    <button onClick={() => window.open(`${API}/api/lectures/${l.id}/download`, '_blank')} style={{...css.btn(t.accent), padding: '5px 10px', fontSize: 11}}>⬇</button>
                    <button onClick={() => toggleBookmark(l)} style={{...css.iconBtn, fontSize: 16}}>{isBookmarked(l.id) ? '⭐' : '☆'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* QUICK UPLOAD */}
          {page === 'quick-upload' && (
            <div style={{ maxWidth: 450, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
              <button onClick={() => setPage('level')} style={css.btnOutline}>← Back</button>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📤 Quick Upload</h2>
              <p style={{ color: t.sub, fontSize: 13, marginBottom: 16 }}>
                Uploading to: <strong>{courses.find(c => c.id == uploadForm.courseId)?.code} - {courses.find(c => c.id == uploadForm.courseId)?.title}</strong>
              </p>
              <form onSubmit={handleUpload} style={css.card}>
                <input placeholder="Title *" value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} style={{...css.input, marginBottom: 10}} required />
                <input type="number" placeholder="Week Number *" value={uploadForm.weekNumber} onChange={e => setUploadForm({...uploadForm, weekNumber: e.target.value})} style={{...css.input, marginBottom: 10}} required />
                <input placeholder="Academic Year" value={uploadForm.academicYear} onChange={e => setUploadForm({...uploadForm, academicYear: e.target.value})} style={{...css.input, marginBottom: 10}} />
                <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{...css.input, marginBottom: 12}} required />
                {file && <p style={{ fontSize: 12, color: t.sub }}>📎 {file.name}</p>}
                <button type="submit" style={{...css.btn(t.success), width: '100%', justifyContent: 'center', padding: 12}}>📤 Upload</button>
              </form>
            </div>
          )}

          {/* SEARCH */}
          {page === 'search' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>🔍 Search</h2>
              <div style={css.card}>
                <input placeholder="Search courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{...css.input, marginBottom: 10}} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select value={filterSchool} onChange={e => handleFacultyChange(e.target.value)} style={{...css.select, flex: '1 1 150px'}}>
                    <option value="">All Faculties</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{...css.select, flex: '1 1 150px'}}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{...css.select, flex: '1 1 120px'}}>
                    <option value="">All Levels</option>
                    <option value="100">100</option><option value="200">200</option><option value="300">300</option><option value="400">400</option>
                  </select>
                </div>
              </div>
              <div style={{...css.grid, marginTop: 16}}>
                {filteredCourses.map(c => (
                  <div key={c.id} style={{...css.card, cursor: 'pointer'}} {...cardHover}
                    onClick={() => { setSelectedCourse(c); loadLectures(c.id); setPage('course') }}>
                    <span style={css.tag(t.accent)}>{c.code}</span>
                    <h4 style={{ margin: '6px 0 2px', fontSize: 14 }}>{c.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* READ */}
          {page === 'read' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>📖 My Library</h2>
              <div style={css.card}>
                <h3 style={{ marginTop: 0, fontSize: 16 }}>⭐ Bookmarks ({bookmarks.length})</h3>
                {bookmarks.length === 0 ? <EmptyState icon="⭐" title="No Bookmarks" subtitle="Star lectures to save them here" action={true} actionLabel="Browse" onAction={() => setPage('home')} /> :
                  bookmarks.map(l => (
                    <div key={l.id} style={{...css.flexBetween, padding: '8px 0', borderBottom: `1px solid ${t.border}`}}>
                      <div><strong style={{ fontSize: 13 }}>{l.title}</strong><p style={{ color: t.sub, fontSize: 11, margin: 2 }}>Week {l.weekNumber}</p></div>
                      <button onClick={() => toggleBookmark(l)} style={css.btn(t.danger)}>🗑</button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {page === 'settings' && (
            <div style={{ maxWidth: 500, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>⚙️ Settings</h2>
              <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
                {['account','appearance','about','privacy'].map(tab => (
                  <button key={tab} onClick={() => setAdminTab(tab)}
                    style={adminTab===tab ? css.btn(t.accent) : {...css.btn(t.accent), background:'transparent', color:t.text, border:`1px solid ${t.border}`, fontSize: 12}}>
                    {tab==='account'?'👤':tab==='appearance'?'🎨':tab==='about'?'ℹ️':'🔒'} {tab.charAt(0).toUpperCase()+tab.slice(1)}
                  </button>
                ))}
              </div>

              {adminTab === 'account' && (
                <div style={css.card}>
                  {!user ? (
                    <>
                      <h3 style={{ textAlign: 'center', marginTop: 0, fontSize: 18 }}>{isLogin ? '🔐 Welcome Back' : '📝 Create Account'}</h3>
                      <form onSubmit={handleAuth}>
                        {!isLogin && <>
                          <select value={authForm.role} onChange={e => setAuthForm({...authForm, role: e.target.value})} style={{...css.select, marginBottom: 8}}>
                            <option value="student">🎓 Student</option><option value="lecturer">👨‍🏫 Lecturer</option>
                          </select>
                          <input placeholder="Full Name *" value={authForm.fullName} onChange={e => setAuthForm({...authForm, fullName: e.target.value})} style={{...css.input, marginBottom: 8}} required />
                          {authForm.role==='lecturer' && <input type="password" placeholder="Lecturer Code *" value={authForm.lecturerCode} onChange={e => setAuthForm({...authForm, lecturerCode: e.target.value})} style={{...css.input, marginBottom: 8}} required />}
                        </>}
                        <input type="email" placeholder="Email *" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} style={{...css.input, marginBottom: 8}} required />
                        <input type="password" placeholder="Password *" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} style={{...css.input, marginBottom: 8}} required />
                        <button type="submit" style={{...css.btn(t.accent), width:'100%', justifyContent:'center', padding: 10}}>{isLogin?'Login':'Create Account'}</button>
                      </form>
                      <p onClick={() => { setIsLogin(!isLogin) }} style={{ textAlign:'center', color:t.accent, cursor:'pointer', marginTop: 12, fontSize: 13 }}>
                        {isLogin ? "Don't have an account? Register →" : 'Already have an account? Login →'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${t.border}` }}>
                        <div style={{ width:50, height:50, borderRadius:'50%', background:`linear-gradient(135deg,${t.accent},${t.purple})`, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700 }}>{user.fullName?.charAt(0)?.toUpperCase()||'U'}</div>
                        <div><h3 style={{margin:0,fontSize:16}}>{user.fullName}</h3><p style={{color:t.sub,margin:2,fontSize:12}}>{user.email}</p></div>
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
              {adminTab === 'about' && (
                <div style={css.card}><h3 style={{marginTop:0}}>ℹ️ About LectureVault</h3><p style={{fontSize:13,color:t.sub}}>A centralized lecture repository for students to access past, current, and upcoming lecture materials.</p></div>
              )}
              {adminTab === 'privacy' && (
                <div style={css.card}><h3 style={{marginTop:0}}>🔒 Privacy</h3><p style={{fontSize:13,color:t.sub}}>We collect only necessary information. Your data is never sold or shared.</p></div>
              )}
            </div>
          )}

          {/* ADMIN */}
          {page === 'admin' && user?.role === 'admin' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize:22, fontWeight:700, marginBottom:16 }}>🛡️ Admin</h2>
              <div style={{ display:'flex', gap:4, marginBottom:16, flexWrap:'wrap' }}>
                {['dashboard','users','lectures'].map(tab => (
                  <button key={tab} onClick={() => { setAdminTab(tab); if(tab==='dashboard')loadDashboard(); if(tab==='users')loadUsers(); if(tab==='lectures')loadAdminLectures() }}
                    style={css.btn(adminTab===tab?t.accent:'transparent')}>
                    {tab==='dashboard'?'📊':tab==='users'?'👥':'📄'} {tab.charAt(0).toUpperCase()+tab.slice(1)}
                  </button>
                ))}
              </div>
              {adminTab === 'dashboard' && adminStats && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:10 }}>
                  {[{label:'Users',val:adminStats.users,c:t.accent},{label:'Students',val:adminStats.students,c:t.success},{label:'Lecturers',val:adminStats.lecturers,c:t.purple},{label:'Courses',val:adminStats.courses,c:t.warning},{label:'Lectures',val:adminStats.lectures,c:t.danger}].map(s => (
                    <div key={s.label} style={{...css.card, textAlign:'center'}}><div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.val}</div><div style={{color:t.sub,fontSize:11}}>{s.label}</div></div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>

        {/* FLOATING BUTTONS */}
        {user?.role === 'lecturer' && (
          <button onClick={() => setPage('upload')} style={{ position:'fixed',bottom:24,right:24,width:52,height:52,borderRadius:'50%',background:`linear-gradient(135deg,${t.accent},${t.purple})`,color:'white',border:'none',fontSize:24,cursor:'pointer',boxShadow:'0 4px 15px rgba(59,130,246,0.4)',zIndex:99,display:'flex',alignItems:'center',justifyContent:'center' }}>+</button>
        )}
        {user?.role === 'admin' && page !== 'admin' && (
          <button onClick={() => { setPage('admin'); loadDashboard() }} style={{ position:'fixed',bottom:24,left:24,zIndex:99,...css.btn(t.danger),borderRadius:24,padding:'10px 16px',fontSize:12,boxShadow:'0 4px 15px rgba(239,68,68,0.4)' }}>🛡️ Admin</button>
        )}
      </div>
    </>
  )
}

export default App