import { useState, useEffect } from 'react'

function App() {
  const [page, setPage] = useState('home')
  const [bulkFiles, setBulkFiles] = useState([])
const [bulkTitles, setBulkTitles] = useState('')
const [bulkWeeks, setBulkWeeks] = useState('')
const [bulkUploading, setBulkUploading] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState(null)
const [selectedDepartment, setSelectedDepartment] = useState(null)
const [selectedLevel, setSelectedLevel] = useState(null)
  const [showRating, setShowRating] = useState(null) // { lectureId, lectureTitle }
const [ratingValue, setRatingValue] = useState(0)
const [ratingComment, setRatingComment] = useState('')
const [ratings, setRatings] = useState([])
const [comments, setComments] = useState([])
const [commentText, setCommentText] = useState('')
const [replyTo, setReplyTo] = useState(null)
const [showComments, setShowComments] = useState(null) // lectureId
  const [darkMode, setDarkMode] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [courses, setCourses] = useState([])
  const [lectures, setLectures] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [message, setMessage] = useState('')
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

  const loadLectures = (courseId) => {
    setLoading(true)
    fetch(`${API}/api/courses/${courseId}/lectures`)
      .then(r => r.json())
      .then(d => { setLectures(d); setLoading(false) })
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
  const data = await res.json()
  setRatings(data)
}

const loadComments = async (lectureId) => {
  const res = await fetch(`${API}/api/lectures/${lectureId}/comments`)
  const data = await res.json()
  setComments(data)
}

const submitRating = async () => {
  const res = await fetch(`${API}/api/lectures/${showRating.lectureId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: ratingValue, comment: ratingComment })
  })
  const data = await res.json()
  showToast(`Rated ${ratingValue} stars! ⭐`)
  setShowRating(null)
  setRatingValue(0)
  setRatingComment('')
  loadLectures(selectedCourse?.id)
}
const EmptyState = ({ icon, title, subtitle, action, actionLabel, onAction }) => (
  <div style={{ textAlign: 'center', padding: 60, animation: 'fadeIn 0.4s ease' }}>
    <div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div>
    <h3 style={{ fontSize: 20, marginBottom: 8, color: t.text, fontWeight: 600 }}>{title}</h3>
    {subtitle && <p style={{ color: t.sub, fontSize: 14, maxWidth: 400, margin: '0 auto 20px' }}>{subtitle}</p>}
    {action && <button onClick={onAction} style={{...css.btn(t.accent), marginTop: 8, padding: '12px 24px'}}>{actionLabel}</button>}
  </div>
)
const submitComment = async (lectureId) => {
  if (!commentText.trim()) return
  const res = await fetch(`${API}/api/lectures/${lectureId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: commentText, parentId: replyTo })
  })
  await res.json()
  setCommentText('')
  setReplyTo(null)
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
const handleBulkUpload = async (e) => {
  e.preventDefault()
  if (bulkFiles.length === 0) return showToast('Please select PDFs', 'error')
  
  setBulkUploading(true)
  const fd = new FormData()
  bulkFiles.forEach(f => fd.append('pdfs', f))
  
  const titles = bulkTitles.split(',').map(t => t.trim())
  const weeks = bulkWeeks.split(',').map(w => w.trim())
  
  fd.append('titles', JSON.stringify(titles))
  fd.append('weekNumbers', JSON.stringify(weeks))
  fd.append('courseId', uploadForm.courseId)
  fd.append('academicYear', uploadForm.academicYear || '2024/2025')
  
  try {
    const res = await fetch(`${API}/api/lectures/bulk-upload`, { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      showToast(`✅ ${data.count} lectures uploaded!`)
      setBulkFiles([]); setBulkTitles(''); setBulkWeeks('')
      setUploadForm({ title: '', weekNumber: '', courseId: '', academicYear: '2024/2025', manualCode: '', manualTitle: '' })
      setUploadFaculty(''); setUploadDept(''); setUploadDepts([])
    } else showToast(data.error, 'error')
  } catch { showToast('Network error', 'error') }
  setBulkUploading(false)
}
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return showToast('Please select a PDF', 'error')
    
    let finalCourseId = uploadForm.courseId
    if (uploadForm.courseId === 'other') {
      const res = await fetch(`${API}/api/courses/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: uploadForm.manualCode, title: uploadForm.manualTitle, departmentId: uploadDept }) })
      const newCourse = await res.json()
      finalCourseId = newCourse.id
    }
    
    const fd = new FormData()
    fd.append('pdf', file); fd.append('title', uploadForm.title); fd.append('weekNumber', uploadForm.weekNumber)
    fd.append('courseId', finalCourseId); fd.append('academicYear', uploadForm.academicYear)
    
    try {
      const res = await fetch(`${API}/api/lectures/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        showToast('✅ Lecture uploaded successfully!')
        setUploadForm({ title: '', weekNumber: '', courseId: '', academicYear: '2024/2025', manualCode: '', manualTitle: '' })
        setFile(null); setUploadFaculty(''); setUploadDept(''); setUploadDepts([])
      } else showToast(data.error, 'error')
    } catch { showToast('Network error', 'error') }
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
    showToast(bookmarks.find(b => b.id === lecture.id) ? 'Removed from bookmarks' : 'Added to bookmarks ⭐')
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
    header: { background: t.header, color: 'white', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' },
    logo: { fontSize: 22, fontWeight: 700, cursor: 'pointer' },
    navItem: (active) => ({ padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: active ? 600 : 400, background: active ? 'rgba(255,255,255,0.15)' : 'transparent', transition: 'all 0.2s', border: 'none', color: 'white' }),
    avatar: { width: 36, height: 36, borderRadius: '50%', background: 'white', color: t.header, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer', fontSize: 15 },
    dropdown: { position: 'absolute', right: 0, top: 48, background: t.card, borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', padding: 8, minWidth: 200, zIndex: 200, border: `1px solid ${t.border}`, animation: 'fadeIn 0.2s ease' },
    main: { maxWidth: 1100, margin: '0 auto', padding: '24px 20px', animation: 'fadeIn 0.3s ease' },
    card: { background: t.card, borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${t.border}`, transition: 'all 0.2s ease' },
    btn: (bg) => ({ background: bg || t.accent, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease' }),
    btnOutline: { background: 'transparent', color: t.accent, padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, border: 'none' },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' },
    select: { width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, cursor: 'pointer' },
    badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
    tag: (c) => ({ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: c, color: 'white', marginRight: 6, marginBottom: 6 }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
    iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, padding: 6, borderRadius: 8, color: t.text, transition: 'all 0.2s' },
  }

  const Skeleton = ({ w, h, br }) => (
    <div style={{ width: w || '100%', height: h || 20, background: t.border, borderRadius: br || 6, animation: 'pulse 1.5s infinite' }} />
  )

  const EmptyState = ({ icon, title, action, actionLabel, onAction }) => (
    <div style={{ textAlign: 'center', padding: 60, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 18, marginBottom: 8, color: t.text }}>{title}</h3>
      {action && <button onClick={onAction} style={{...css.btn(t.accent), marginTop: 12}}>{actionLabel}</button>}
    </div>
  )

  const cardHover = {
    onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)' },
    onMouseLeave: (e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }
  }

  const pdfBtn = { background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
        input:focus, select:focus { border-color: ${t.accent} !important; box-shadow: 0 0 0 3px ${t.accent}20 !important; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div onClick={() => setToast(null)} style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          background: toast.type === 'error' ? t.danger : t.success, color: 'white',
          padding: '12px 28px', borderRadius: 30, boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          fontSize: 14, fontWeight: 500, cursor: 'pointer', animation: 'slideUp 0.3s ease', whiteSpace: 'nowrap'
        }}>
          {toast.msg}
        </div>
      )}

      {/* PDF VIEWER */}
      {pdfViewer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#1e293b', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => { setPdfViewer(null); setPdfZoom(1) }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', padding: '6px 12px', borderRadius: 8 }}>✕ Close</button>
              <span style={{ fontWeight: 600, fontSize: 15 }}>📄 {pdfViewer.title}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setPdfZoom(z => Math.max(0.5, z - 0.25))} style={pdfBtn}>🔍−</button>
              <span style={{ fontSize: 13, minWidth: 45, textAlign: 'center' }}>{Math.round(pdfZoom * 100)}%</span>
              <button onClick={() => setPdfZoom(z => Math.min(3, z + 0.25))} style={pdfBtn}>🔍+</button>
              <button onClick={() => setPdfZoom(1)} style={pdfBtn}>↺</button>
              <span style={{ margin: '0 4px', opacity: 0.3 }}>|</span>
              <button onClick={() => window.open(`${API}/api/lectures/${pdfViewer.lectureId}/download`, '_blank')} style={pdfBtn}>⬇ Download</button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 20, background: '#525659' }}>
            <iframe src={pdfViewer.url} style={{ width: `${pdfZoom * 100}%`, maxWidth: '100%', height: '100%', border: 'none', borderRadius: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', transition: 'width 0.2s' }} title="PDF Viewer" />
          </div>
        </div>
      )}
{/* RATING MODAL */}
{showRating && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}
    onClick={() => setShowRating(null)}>
    <div style={{ background: t.card, borderRadius: 16, padding: 32, maxWidth: 420, width: '90%' }} onClick={e => e.stopPropagation()}>
      <h3 style={{ marginTop: 0, textAlign: 'center' }}>⭐ Rate Lecture</h3>
      <p style={{ textAlign: 'center', color: t.sub, fontSize: 14 }}>{showRating.lectureTitle}</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '20px 0' }}>
        {[1,2,3,4,5].map(star => (
          <button key={star} onClick={() => setRatingValue(star)}
            style={{ fontSize: 36, background: 'transparent', border: 'none', cursor: 'pointer', 
              color: star <= ratingValue ? '#f59e0b' : t.border, transition: 'all 0.2s' }}>
            {star <= ratingValue ? '⭐' : '☆'}
          </button>
        ))}
      </div>
      
      <textarea placeholder="Add a comment (optional)..." value={ratingComment}
        onChange={e => setRatingComment(e.target.value)}
        style={{...css.input, minHeight: 80, marginBottom: 16, resize: 'vertical' }} />
      
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setShowRating(null)} style={{...css.btnOutline, flex: 1, border: `1px solid ${t.border}`, color: t.text}}>Cancel</button>
        <button onClick={submitRating} disabled={!ratingValue} style={{...css.btn(t.warning), flex: 1, justifyContent: 'center', opacity: ratingValue ? 1 : 0.5}}>Submit Rating</button>
      </div>
    </div>
  </div>
)}
      <div style={css.body}>
        {/* HEADER */}
        <header style={css.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={css.logo} onClick={() => setPage('home')}>📚 LectureVault</span>
            <nav style={{ display: 'flex', gap: 4 }}>
              {['home','search','read','settings'].map(p => (
                <button key={p} style={css.navItem(page === p)} onClick={() => { setPage(p); if(p==='search') handleFacultyChange('') }}>
                  {p === 'home' ? '🏠' : p === 'search' ? '🔍' : p === 'read' ? '📖' : '⚙️'} {p.charAt(0).toUpperCase()+p.slice(1)}
                </button>
              ))}
            </nav>
          </div>
          <div style={{ position: 'relative' }}>
            {user ? (
              <>
                <div style={css.avatar} onClick={() => setShowProfile(!showProfile)}>{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</div>
                {showProfile && (
                  <div style={css.dropdown} onClick={() => setShowProfile(false)}>
                    <div style={{ padding: '12px', borderBottom: `1px solid ${t.border}`, marginBottom: 4 }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{user.fullName}</p>
                      <p style={{ fontSize: 12, color: t.sub, margin: '2px 0' }}>{user.email}</p>
                      <span style={{...css.badge, background: user.role==='lecturer'?t.purple:user.role==='admin'?t.danger:t.success, color:'white'}}>{user.role}</span>
                    </div>
                    <button onClick={() => { setPage('settings'); setShowProfile(false) }} style={{...css.btnOutline, width:'100%', marginBottom:4, color:t.text, justifyContent:'flex-start'}}>👤 Profile</button>
                    <button onClick={logout} style={{...css.btnOutline, width:'100%', color:t.danger, justifyContent:'flex-start'}}>🚪 Logout</button>
                  </div>
                )}
              </>
            ) : (
              <button style={css.btn(t.accent)} onClick={() => setPage('settings')}>👤 Login</button>
            )}
          </div>
        </header>

        <main style={css.main}>
          {/* HOME */}
          {/* HOME */}
{page === 'home' && (
  <div style={{ animation: 'fadeIn 0.4s ease' }}>
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, background: `linear-gradient(135deg, ${t.accent}, ${t.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your Lecture Library</h1>
      <p style={{ fontSize: 16, color: t.sub, maxWidth: 500, margin: '0 auto 24px' }}>Browse by Faculty, Department, and Level to find your lecture materials</p>
    </div>
    
    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>🏛️ Faculties</h2>
    {loading ? (
      <div style={css.grid}>
        {[1,2,3,4,5,6].map(i => <div key={i} style={css.card}><Skeleton h={24} w="80%" /><Skeleton h={16} w="60%" /></div>)}
      </div>
    ) : (
      <div style={css.grid}>
        {faculties.map(f => (
          <div key={f.id} style={{...css.card, cursor: 'pointer', textAlign: 'center', padding: '28px 20px'}} {...cardHover}
            onClick={() => { setSelectedFaculty(f); handleFacultyChange(f.id); setPage('faculty') }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{f.name}</h3>
          </div>
        ))}
      </div>
    )}
  </div>
)}

          {/* READ */}
          {page === 'read' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📖 My Library</h2>
              <div style={css.card}>
                <h3 style={{ marginTop: 0 }}>⭐ Bookmarks ({bookmarks.length})</h3>
                {bookmarks.length === 0 ? (
                  <EmptyState icon="⭐" title="No Bookmarks" subtitle="Tap the star icon on any lecture to save it here for quick access." action={true} actionLabel="Browse Courses" onAction={() => setPage('home')} />
                ) : (
                  bookmarks.map(l => (
                    <div key={l.id} style={{...css.flexBetween, padding: '12px 0', borderBottom: `1px solid ${t.border}`}}>
                      <div><strong>{l.title}</strong><p style={{ color: t.sub, fontSize: 13, margin: 2 }}>Week {l.weekNumber}</p></div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {l.fileUrl && <button onClick={() => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isMobile) {
    window.open(`${API}/api/lectures/${l.id}/download`, '_blank')
  } else {
    setPdfViewer({ url: `${API}/api/lectures/${l.id}/download`, title: l.title, lectureId: l.id })
  }
}}>👁 View</button>}
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
                  if (dl.length === 0) return <EmptyState icon="📥" title="No Downloads" subtitle="Downloaded lectures will appear here for offline access." action={true} actionLabel="Find Lectures" onAction={() => setPage('home')} />
                  return dl.map((l, i) => (
                    <div key={i} style={{...css.flexBetween, padding: '10px 0', borderBottom: `1px solid ${t.border}`}}>
                      <div><strong>{l.title}</strong><p style={{ color: t.sub, fontSize: 12, margin: 2 }}>{l.courseCode} • Week {l.weekNumber} • {l.date}</p></div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isMobile) {
    window.open(`${API}/api/lectures/${l.id}/download`, '_blank')
  } else {
    setPdfViewer({ url: `${API}/api/lectures/${l.id}/download`, title: l.title, lectureId: l.id })
  }
}}>👁</button>
                        <button onClick={() => { const d = dl.filter((_,j) => j!==i); localStorage.setItem('downloads', JSON.stringify(d)); showToast('Removed') }} style={css.btn(t.danger)}>🗑</button>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {page === 'settings' && (
            <div style={{ maxWidth: 600, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>⚙️ Settings</h2>
              <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
                {['account','downloads','appearance','about','privacy'].map(tab => (
                  <button key={tab} onClick={() => setAdminTab(tab)}
                    style={adminTab===tab ? css.btn(t.accent) : {...css.btn(t.accent), background:'transparent', color:t.text, border:`1px solid ${t.border}`}}>
                    {tab==='account'?'👤':tab==='downloads'?'📥':tab==='appearance'?'🎨':tab==='about'?'ℹ️':'🔒'} {tab.charAt(0).toUpperCase()+tab.slice(1)}
                  </button>
                ))}
              </div>

              {adminTab === 'account' && (
                <div style={css.card}>
                  {!user ? (
                    <>
                      <h3 style={{ textAlign: 'center', marginTop: 0 }}>{isLogin ? '🔐 Welcome Back' : '📝 Create Account'}</h3>
                      <form onSubmit={handleAuth}>
                        {!isLogin && <>
                          <select value={authForm.role} onChange={e => setAuthForm({...authForm, role: e.target.value})} style={{...css.select, marginBottom: 10}}>
                            <option value="student">🎓 Student</option><option value="lecturer">👨‍🏫 Lecturer</option>
                          </select>
                          <input placeholder="Full Name *" value={authForm.fullName} onChange={e => setAuthForm({...authForm, fullName: e.target.value})} style={{...css.input, marginBottom: 10}} required />
                          {authForm.role==='lecturer' && <input type="password" placeholder="Lecturer Code *" value={authForm.lecturerCode} onChange={e => setAuthForm({...authForm, lecturerCode: e.target.value})} style={{...css.input, marginBottom: 10}} required />}
                          <select value={authForm.studentLevel} onChange={e => setAuthForm({...authForm, studentLevel: e.target.value})} style={{...css.select, marginBottom: 10}}>
                            <option value="">Select Level</option><option value="100">100</option><option value="200">200</option><option value="300">300</option><option value="400">400</option>
                          </select>
                        </>}
                        <input type="email" placeholder="Email *" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} style={{...css.input, marginBottom: 10}} required />
                        <input type="password" placeholder="Password *" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} style={{...css.input, marginBottom: 10}} required />
                        <button type="submit" style={{...css.btn(t.accent), width:'100%', justifyContent:'center', padding: 12}}>{isLogin?'Login':'Create Account'}</button>
                      </form>
                      <p onClick={() => { setIsLogin(!isLogin) }} style={{ textAlign:'center', color:t.accent, cursor:'pointer', marginTop:16, fontSize:14 }}>
                        {isLogin ? "Don't have an account? Register →" : 'Already have an account? Login →'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, paddingBottom:20, borderBottom:`1px solid ${t.border}` }}>
                        <div style={{ width:64, height:64, borderRadius:'50%', background:`linear-gradient(135deg,${t.accent},${t.purple})`, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:700 }}>{user.fullName?.charAt(0)?.toUpperCase()||'U'}</div>
                        <div><h3 style={{margin:0}}>{user.fullName}</h3><p style={{color:t.sub,margin:2}}>{user.email}</p><span style={{...css.badge, background:user.role==='lecturer'?t.purple:user.role==='admin'?t.danger:t.success, color:'white'}}>{user.role}</span></div>
                      </div>
                      <button onClick={logout} style={{...css.btn(t.danger), width:'100%', justifyContent:'center', padding:12}}>🚪 Logout</button>
                    </>
                  )}
                </div>
              )}
              {adminTab === 'appearance' && (
                <div style={css.card}>
                  <h3 style={{marginTop:0}}>🎨 Appearance</h3>
                  <div style={{...css.flexBetween, padding:'16px 0'}}>
                    <div><strong>🌙 Dark Mode</strong><p style={{color:t.sub,fontSize:13,margin:2}}>Easier on the eyes at night</p></div>
                    <div onClick={() => setDarkMode(!darkMode)} style={{ width:56, height:30, borderRadius:15, background:darkMode?t.accent:'#cbd5e1', cursor:'pointer', position:'relative', transition:'all 0.3s' }}>
                      <div style={{ width:26, height:26, borderRadius:'50%', background:'white', position:'absolute', top:2, left:darkMode?28:2, transition:'all 0.3s', boxShadow:'0 2px 4px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                </div>
              )}
              {adminTab === 'about' && (
                <div style={css.card}>
                  <h3 style={{marginTop:0}}>ℹ️ About LectureVault</h3>
                  <p><strong>LectureVault</strong> is a centralized lecture repository for students to access past, current, and upcoming lecture materials in one place.</p>
                  <h4 style={{color:t.accent}}>🎯 Mission</h4>
                  <p style={{color:t.sub}}>Make quality educational materials accessible to every student, anytime, anywhere.</p>
                  <h4 style={{color:t.accent}}>✨ Features</h4>
                  <ul style={{color:t.sub, paddingLeft:20}}>
                    <li>Browse lectures across all faculties</li><li>Preview upcoming materials</li><li>Bookmark & download for offline study</li><li>In-app PDF viewer with zoom</li><li>Dark mode support</li>
                  </ul>
                  <p style={{textAlign:'center',color:t.sub,marginTop:20,fontSize:12}}>Version 1.0.0 • Built with ❤️</p>
                </div>
              )}
              {adminTab === 'privacy' && (
                <div style={css.card}>
                  <h3 style={{marginTop:0}}>🔒 Privacy Policy</h3>
                  <p style={{color:t.sub,fontSize:14,lineHeight:1.8}}>We collect only necessary information (name, email, level) to provide our services. Your data is never sold or shared with third parties. Passwords are encrypted. You can delete your account at any time. For questions, contact your institution's IT department.</p>
                </div>
              )}
            </div>
          )}

          {/* ADMIN */}
          {page === 'admin' && user?.role === 'admin' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <h2 style={{ fontSize:24, fontWeight:700, marginBottom:20 }}>🛡️ Admin Panel</h2>
              <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
                {['dashboard','users','lectures','code'].map(tab => (
                  <button key={tab} onClick={() => { setAdminTab(tab); if(tab==='dashboard')loadDashboard(); if(tab==='users')loadUsers(); if(tab==='lectures')loadAdminLectures() }}
                    style={css.btn(adminTab===tab?t.accent:'transparent')}>
                    {tab==='dashboard'?'📊':tab==='users'?'👥':tab==='lectures'?'📄':'🔑'} {tab.charAt(0).toUpperCase()+tab.slice(1)}
                  </button>
                ))}
              </div>
              {adminTab === 'dashboard' && adminStats && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12 }}>
                  {[{label:'Users',val:adminStats.users,icon:'👥',c:t.accent},{label:'Students',val:adminStats.students,icon:'🎓',c:t.success},{label:'Lecturers',val:adminStats.lecturers,icon:'👨‍🏫',c:t.purple},{label:'Courses',val:adminStats.courses,icon:'📚',c:t.warning},{label:'Lectures',val:adminStats.lectures,icon:'📄',c:t.danger},{label:'Downloads',val:adminStats.downloads,icon:'⬇',c:'#06b6d4'}].map(s => (
                    <div key={s.label} style={{...css.card, textAlign:'center'}}><div style={{fontSize:32}}>{s.icon}</div><div style={{fontSize:30,fontWeight:800,color:s.c}}>{s.val}</div><div style={{color:t.sub,fontSize:12}}>{s.label}</div></div>
                  ))}
                </div>
              )}
              {adminTab === 'users' && (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                    <thead><tr style={{borderBottom:`2px solid ${t.border}`}}><th style={{padding:8,textAlign:'left'}}>Name</th><th style={{padding:8,textAlign:'left'}}>Email</th><th style={{padding:8,textAlign:'left'}}>Role</th><th style={{padding:8,textAlign:'left'}}>Actions</th></tr></thead>
                    <tbody>{adminUsers.map(u => (
                      <tr key={u.id} style={{borderBottom:`1px solid ${t.border}`}}><td style={{padding:8}}>{u.fullName}</td><td style={{padding:8}}>{u.email}</td><td style={{padding:8}}><span style={{...css.badge,background:u.role==='admin'?t.danger:u.role==='lecturer'?t.purple:t.success,color:'white',fontSize:11}}>{u.role}</span></td><td style={{padding:8}}><select defaultValue={u.role} onChange={e=>changeRole(u.id,e.target.value)} style={{padding:4,borderRadius:4,fontSize:11}}><option value="student">Student</option><option value="lecturer">Lecturer</option><option value="admin">Admin</option></select><button onClick={()=>removeUser(u.id)} style={{...css.btn(t.danger),padding:'4px 10px',fontSize:11,marginLeft:6}}>🗑</button></td></tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              {adminTab === 'lectures' && adminLectures.map(l => (
                <div key={l.id} style={{...css.flexBetween, padding:'10px 0', borderBottom:`1px solid ${t.border}`}}><div><strong>{l.title}</strong><p style={{color:t.sub,fontSize:12,margin:2}}>{l.courseCode} • Week {l.weekNumber} • By {l.uploaderName}</p></div><button onClick={()=>removeLecture(l.id)} style={css.btn(t.danger)}>🗑</button></div>
              ))}
              {adminTab === 'code' && (
                <div style={{...css.card, maxWidth:400}}><h3>🔑 Lecturer Verification Code</h3><div style={{display:'flex',gap:8}}><input placeholder="New code" value={newLecturerCode} onChange={e=>setNewLecturerCode(e.target.value)} style={css.input} /><button onClick={updateCode} style={css.btn(t.success)}>Update</button></div></div>
              )}
            </div>
          )}

          {/* COURSE DETAIL */}
          {page === 'course' && selectedCourse && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <button onClick={() => setPage('home')} style={css.btnOutline}>← Back</button>
              <div style={{...css.card, marginTop:16}}>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                  <span style={css.tag(t.accent)}>{selectedCourse.code}</span>
                  <span style={css.tag(t.success)}>Level {selectedCourse.level}</span>
                  <span style={css.tag(t.warning)}>Semester {selectedCourse.semester}</span>
                  <span style={css.tag(t.purple)}>{selectedCourse.units||2} Units</span>
                </div>
                <h2 style={{margin:'0 0 4px'}}>{selectedCourse.title}</h2>
                {selectedCourse.description && <p style={{color:t.sub}}>{selectedCourse.description}</p>}
              </div>
              <h3 style={{fontSize:20,marginBottom:12}}>📚 Lectures ({lectures.length})</h3>
              {loading ? [1,2,3].map(i => <div key={i} style={css.card}><Skeleton h={20} w="70%" /><Skeleton h={14} w="50%" /></div>) :
                lectures.length === 0 ? <EmptyState icon="📭" title="No Lectures Yet" subtitle="This course doesn't have any uploaded lectures. Check back later or contact your lecturer." /> :
                lectures.map(l => (
                  <div key={l.id} style={{...css.card, ...css.flexBetween}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
                        <span style={css.tag(t.purple)}>Week {l.weekNumber}</span>
                        <strong>{l.title}</strong>
                      </div>
                      <p style={{color:t.sub,fontSize:13,margin:0}}>{l.academicYear} • By {l.uploaderName||'Unknown'}</p>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      {l.fileUrl && <button onClick={() => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isMobile) {
    window.open(`${API}/api/lectures/${l.id}/download`, '_blank')
  } else {
    setPdfViewer({ url: `${API}/api/lectures/${l.id}/download`, title: l.title, lectureId: l.id })
  }
}}>👁 View</button>}
                      {l.fileUrl && <button onClick={() => {
                        const dl=JSON.parse(localStorage.getItem('downloads')||'[]')
                        dl.unshift({title:l.title,courseCode:selectedCourse?.code||'',weekNumber:l.weekNumber,fileUrl:l.fileUrl,date:new Date().toLocaleDateString()})
                        localStorage.setItem('downloads',JSON.stringify(dl.slice(0,50)))
                        showToast('Download started 📥')
                        window.open(`${API}/api/lectures/${l.id}/download`,'_blank')
                      }} style={css.btn(t.accent)}>⬇ Download</button>}
                      <button onClick={() => toggleBookmark(l)} style={{...css.iconBtn, fontSize:24, color:isBookmarked(l.id)?t.warning:t.sub}}>
                        {isBookmarked(l.id)?'⭐':'☆'}
                      </button>
                      <button onClick={() => { setShowRating({ lectureId: l.id, lectureTitle: l.title }); setRatingValue(0); setRatingComment('') }}
  style={{...css.iconBtn, fontSize: 18, color: t.warning}} title="Rate">⭐</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
{/* COMMENTS */}
{/* COMMENTS - Only show on course detail page */}
{page === 'course' && selectedCourse && (
  <div style={{ marginTop: 32 }}>
    <div style={{...css.flexBetween, marginBottom: 16}}>
      <h3 style={{ fontSize: 20, margin: 0 }}>💬 Discussion</h3>
      <button onClick={() => { setShowComments(showComments === selectedCourse.id ? null : selectedCourse.id); if (!showComments) loadComments(lectures[0]?.id) }}
        style={css.btn(t.accent)}>
        {showComments === selectedCourse.id ? 'Hide' : 'Show'} Comments
      </button>
    </div>
    
    {showComments === selectedCourse.id && (
      <div style={css.card}>
        {/* Comment Input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input placeholder="Ask a question or discuss..." value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && submitComment(lectures[0]?.id)}
            style={{...css.input, flex: 1}} />
          <button onClick={() => submitComment(lectures[0]?.id)} style={css.btn(t.accent)}>Post</button>
        </div>
        
        {replyTo && (
          <div style={{ padding: '8px 12px', background: t.bg, borderRadius: 8, marginBottom: 12, fontSize: 13, color: t.sub }}>
            Replying to comment #{replyTo}
            <button onClick={() => setReplyTo(null)} style={{ marginLeft: 8, color: t.danger, background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}
        
        {/* Comments List */}
        {comments.length === 0 ? (
          <p style={{ color: t.sub, textAlign: 'center', padding: 20 }}>No comments yet. Start the discussion!</p>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ padding: '12px 0', borderBottom: `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                  {c.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <strong style={{ fontSize: 14 }}>{c.fullName}</strong>
                <span style={{ fontSize: 11, color: t.sub }}>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ margin: '4px 0', fontSize: 14 }}>{c.text}</p>
              <button onClick={() => setReplyTo(c.id)} style={{ fontSize: 12, color: t.accent, background: 'transparent', border: 'none', cursor: 'pointer' }}>↩ Reply</button>
              
              {/* Replies */}
              {c.replies?.map(r => (
                <div key={r.id} style={{ marginLeft: 24, marginTop: 8, padding: '8px 12px', background: t.bg, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <strong style={{ fontSize: 13 }}>{r.fullName}</strong>
                    <span style={{ fontSize: 10, color: t.sub }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13 }}>{r.text}</p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    )}
  </div>
)}
         {/* FACULTY PAGE - Show Departments */}
{page === 'faculty' && selectedFaculty && (
  <div style={{ animation: 'fadeIn 0.4s ease' }}>
    <button onClick={() => { setPage('home'); setSelectedFaculty(null) }} style={css.btnOutline}>← Back to Faculties</button>
    <h2 style={{ fontSize: 24, fontWeight: 700, margin: '20px 0' }}>🏛️ {selectedFaculty.name}</h2>
    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: t.sub }}>Select Department</h3>
    <div style={css.grid}>
      {departments.map(d => (
        <div key={d.id} style={{...css.card, cursor: 'pointer', textAlign: 'center', padding: '24px 20px'}} {...cardHover}
          onClick={() => { setSelectedDepartment(d); setPage('department') }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📚</div>
          <h4 style={{ margin: 0, fontSize: 15 }}>{d.name}</h4>
        </div>
      ))}
    </div>
  </div>
)}

{/* DEPARTMENT PAGE - Show Levels */}
{page === 'department' && selectedDepartment && (
  <div style={{ animation: 'fadeIn 0.4s ease' }}>
    <button onClick={() => { setPage('faculty'); setSelectedDepartment(null) }} style={css.btnOutline}>← Back to Departments</button>
    <h2 style={{ fontSize: 24, fontWeight: 700, margin: '20px 0' }}>📚 {selectedDepartment.name}</h2>
    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: t.sub }}>Select Level</h3>
    <div style={css.grid}>
      {[100, 200, 300, 400].map(level => (
        <div key={level} style={{...css.card, cursor: 'pointer', textAlign: 'center', padding: '24px 20px'}} {...cardHover}
          onClick={() => { setSelectedLevel(level); setPage('level') }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
          <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{level} Level</h4>
        </div>
      ))}
    </div>
  </div>
)}

{/* LEVEL PAGE - Show Courses */}
{page === 'level' && selectedDepartment && selectedLevel && (
  <div style={{ animation: 'fadeIn 0.4s ease' }}>
    <button onClick={() => { setPage('department'); setSelectedLevel(null) }} style={css.btnOutline}>← Back to Levels</button>
    <h2 style={{ fontSize: 24, fontWeight: 700, margin: '20px 0' }}>📊 {selectedLevel} Level</h2>
    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: t.sub }}>{selectedDepartment.name}</h3>
    
    {(() => {
      const deptCourses = courses.filter(c => c.departmentId === selectedDepartment.id && c.level === selectedLevel)
      
      return deptCourses.map(course => {
        // Get lectures for this course
        const courseLectures = lectures.filter(l => l.courseId === course.id)
        
        return (
          <div key={course.id} style={{ marginBottom: 32 }}>
            {/* Course Header */}
            <div style={{...css.flexBetween, marginBottom: 12, padding: '12px 16px', background: t.accent, borderRadius: 10, color: 'white' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{course.code}</h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, opacity: 0.9 }}>{course.title}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{...css.badge, background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12}}>Sem {course.semester}</span>
                <span style={{...css.badge, background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 12}}>{course.units || 2} units</span>
              </div>
            </div>
            
            {/* PDFs for this course */}
            {courseLectures.length === 0 ? (
              <div style={{...css.card, textAlign: 'center', padding: 20, opacity: 0.6 }}>
                <p style={{ color: t.sub, margin: 0, fontStyle: 'italic' }}>No PDFs uploaded yet</p>
                {user?.role === 'lecturer' && (
                  <button onClick={() => {
                    setSelectedCourse(course)
                    setUploadForm({...uploadForm, courseId: course.id, title: '', weekNumber: ''})
                    setPage('quick-upload')
                  }} style={{...css.btn(t.success), marginTop: 8}}>+ Upload PDF</button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {courseLectures.sort((a, b) => a.weekNumber - b.weekNumber).map(lecture => (
                  <div key={lecture.id} style={{...css.card, ...css.flexBetween, padding: '12px 16px'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <span style={{ fontSize: 20 }}>📄</span>
                      <div>
                        <strong style={{ fontSize: 14 }}>Week {lecture.weekNumber}: {lecture.title}</strong>
                        <p style={{ color: t.sub, fontSize: 12, margin: 2 }}>
                          {lecture.fileName || 'PDF'} • {lecture.academicYear}
                          {lecture.averageRating && ` • ⭐ ${Number(lecture.averageRating).toFixed(1)}`}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => {
                        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                        if (isMobile) window.open(`${API}/api/lectures/${lecture.id}/download`, '_blank')
                        else setPdfViewer({ url: `${API}/api/lectures/${lecture.id}/download`, title: lecture.title, lectureId: lecture.id })
                      }} style={{...css.btn(t.purple), padding: '6px 12px', fontSize: 12}}>👁 View</button>
                      <button onClick={() => {
                        const dl = JSON.parse(localStorage.getItem('downloads') || '[]')
                        dl.unshift({ title: lecture.title, courseCode: course.code, weekNumber: lecture.weekNumber, fileUrl: lecture.fileUrl, date: new Date().toLocaleDateString() })
                        localStorage.setItem('downloads', JSON.stringify(dl.slice(0, 50)))
                        window.open(`${API}/api/lectures/${lecture.id}/download`, '_blank')
                      }} style={{...css.btn(t.accent), padding: '6px 12px', fontSize: 12}}>⬇</button>
                      <button onClick={() => toggleBookmark(lecture)} style={{...css.iconBtn, fontSize: 18, color: isBookmarked(lecture.id) ? t.warning : t.sub}}>
                        {isBookmarked(lecture.id) ? '⭐' : '☆'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })
    })()}
    
    {courses.filter(c => c.departmentId === selectedDepartment.id && c.level === selectedLevel).length === 0 && (
      <EmptyState icon="📭" title="No courses for this level" />
    )}
  </div>
)}
          
          {/* UPLOAD */}
          {page === 'upload' && user?.role === 'lecturer' && (
            <div style={{maxWidth:600,margin:'0 auto',animation:'fadeIn 0.4s ease'}}>
              <button onClick={() => { setPage('level'); setSelectedCourse(null) }} style={css.btnOutline}>← Back to Courses</button>
              <h2 style={{fontSize:24,fontWeight:700,marginBottom:20}}>📤 Upload Lecture PDF</h2>
              <form onSubmit={handleUpload} style={css.card}>
                <label style={{fontWeight:600,fontSize:13,color:t.sub,marginBottom:4,display:'block'}}>STEP 1: Faculty</label>
                <select value={uploadFaculty} onChange={e=>{setUploadFaculty(e.target.value);setUploadDept('');setUploadForm({...uploadForm,courseId:''});if(e.target.value)fetch(`${API}/api/faculties/${e.target.value}/departments`).then(r=>r.json()).then(d=>setUploadDepts(d));else setUploadDepts([])}} style={{...css.select,marginBottom:16}} required>
                  <option value="">-- Select Faculty --</option>
                  {faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <label style={{fontWeight:600,fontSize:13,color:t.sub,marginBottom:4,display:'block'}}>STEP 2: Department</label>
                <select value={uploadDept} onChange={e=>{setUploadDept(e.target.value);setUploadForm({...uploadForm,courseId:''})}} style={{...css.select,marginBottom:16}} disabled={!uploadFaculty} required>
                  <option value="">-- Select Department --</option>
                  {uploadDepts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <label style={{fontWeight:600,fontSize:13,color:t.sub,marginBottom:4,display:'block'}}>STEP 3: Course</label>
                <select value={uploadForm.courseId} onChange={e=>setUploadForm({...uploadForm,courseId:e.target.value})} style={{...css.select,marginBottom:uploadForm.courseId==='other'?8:20}} disabled={!uploadDept} required>
                  <option value="">-- Select Course --</option>
                  {courses.filter(c=>c.departmentId==uploadDept).map(c=><option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                  <option value="other" style={{fontStyle:'italic',color:t.accent}}>📝 Other (type manually)</option>
                </select>
                {uploadForm.courseId==='other' && (
                  <div style={{marginBottom:20,display:'flex',gap:8}}>
                    <input placeholder="Course Code *" value={uploadForm.manualCode||''} onChange={e=>setUploadForm({...uploadForm,manualCode:e.target.value.toUpperCase()})} style={{...css.input,flex:1}} required />
                    <input placeholder="Course Title *" value={uploadForm.manualTitle||''} onChange={e=>setUploadForm({...uploadForm,manualTitle:e.target.value})} style={{...css.input,flex:2}} required />
                  </div>
                )}
                <div style={{borderTop:`1px solid ${t.border}`,paddingTop:20,marginBottom:12}}>
                  <label style={{fontWeight:600,fontSize:13,color:t.sub}}>Lecture Details</label>
                </div>
                <input placeholder="Lecture Title *" value={uploadForm.title} onChange={e=>setUploadForm({...uploadForm,title:e.target.value})} style={{...css.input,marginBottom:12}} required />
                <div style={{display:'flex',gap:12}}>
                  <input type="number" placeholder="Week Number *" value={uploadForm.weekNumber} onChange={e=>setUploadForm({...uploadForm,weekNumber:e.target.value})} style={{...css.input,flex:1}} required />
                  <input placeholder="Academic Year" value={uploadForm.academicYear} onChange={e=>setUploadForm({...uploadForm,academicYear:e.target.value})} style={{...css.input,flex:1}} />
                </div>
                <input type="file" accept=".pdf" onChange={e=>setFile(e.target.files[0])} style={{...css.input,marginTop:12}} required />
                {file && <p style={{fontSize:13,color:t.sub,marginTop:4}}>📎 {file.name} ({(file.size/1024/1024).toFixed(2)} MB)</p>}
                <button type="submit" style={{...css.btn(t.success),width:'100%',justifyContent:'center',marginTop:16,padding:14,fontSize:16}}>📤 Upload Lecture</button>
             <label style={{ fontWeight: 600, fontSize: 13, color: t.sub, marginBottom: 4, display: 'block' }}>Faculty (for bulk)</label>
<select value={uploadFaculty} onChange={e => { setUploadFaculty(e.target.value); setUploadDept(''); setUploadForm({...uploadForm, courseId: ''}); if(e.target.value) fetch(`${API}/api/faculties/${e.target.value}/departments`).then(r => r.json()).then(d => setUploadDepts(d)); else setUploadDepts([]) }} style={{...css.select, marginBottom: 16}}>
  <option value="">-- Select Faculty --</option>
  {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
</select>

<label style={{ fontWeight: 600, fontSize: 13, color: t.sub, marginBottom: 4, display: 'block' }}>Department (for bulk)</label>
<select value={uploadDept} onChange={e => { setUploadDept(e.target.value); setUploadForm({...uploadForm, courseId: ''}) }} style={{...css.select, marginBottom: 16}} disabled={!uploadFaculty}>
  <option value="">-- Select Department --</option>
  {uploadDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
</select>
             
             {/* BULK UPLOAD SECTION */}
<div style={{ marginTop: 40, borderTop: `2px solid ${t.border}`, paddingTop: 24 }}>
  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>📦 Bulk Upload</h3>
  <p style={{ color: t.sub, fontSize: 13, marginBottom: 20 }}>Upload multiple PDFs at once. Name them in order (Week 1, Week 2...)</p>
  
  <form onSubmit={handleBulkUpload} style={css.card}>
    <label style={{ fontWeight: 600, fontSize: 13, color: t.sub, marginBottom: 4, display: 'block' }}>Select Course *</label>
    <select value={uploadForm.courseId} onChange={e => setUploadForm({...uploadForm, courseId: e.target.value})} style={{...css.select, marginBottom: 16}} disabled={!uploadDept} required>
      <option value="">-- Select Course --</option>
      {courses.filter(c => c.departmentId == uploadDept).map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
    </select>
    
    <label style={{ fontWeight: 600, fontSize: 13, color: t.sub, marginBottom: 4, display: 'block' }}>Select PDF Files * (up to 20)</label>
    <input type="file" accept=".pdf" multiple onChange={e => setBulkFiles(Array.from(e.target.files))} style={{...css.input, marginBottom: 12}} required />
    {bulkFiles.length > 0 && (
      <div style={{ marginBottom: 12, fontSize: 13, color: t.sub }}>
        <p style={{ fontWeight: 600, color: t.text }}>📎 {bulkFiles.length} files selected:</p>
        {bulkFiles.map((f, i) => <p key={i} style={{ margin: 2 }}>{i+1}. {f.name} ({(f.size/1024/1024).toFixed(2)} MB)</p>)}
      </div>
    )}
    
    <label style={{ fontWeight: 600, fontSize: 13, color: t.sub, marginBottom: 4, display: 'block' }}>Titles (comma-separated, optional)</label>
    <input placeholder="e.g., Introduction, Variables, Loops" value={bulkTitles} onChange={e => setBulkTitles(e.target.value)} style={{...css.input, marginBottom: 12}} />
    
    <label style={{ fontWeight: 600, fontSize: 13, color: t.sub, marginBottom: 4, display: 'block' }}>Week Numbers (comma-separated, optional)</label>
    <input placeholder="e.g., 1,2,3" value={bulkWeeks} onChange={e => setBulkWeeks(e.target.value)} style={{...css.input, marginBottom: 12}} />
    
    <input placeholder="Academic Year" value={uploadForm.academicYear} onChange={e => setUploadForm({...uploadForm, academicYear: e.target.value})} style={{...css.input, marginBottom: 16}} />
    
    <button type="submit" disabled={bulkUploading} style={{...css.btn(t.purple), width: '100%', justifyContent: 'center', padding: 14, fontSize: 16}}>
      {bulkUploading ? 'Uploading...' : `📦 Upload ${bulkFiles.length || 0} Lectures`}
    </button>
  </form>
</div>
              </form>
            </div>
          )}
        </main>

        {/* FLOATING BUTTONS */}
        {user?.role === 'lecturer' && page !== 'upload' && (
          <button onClick={() => setPage('upload')} style={{ position:'fixed',bottom:30,right:30,width:60,height:60,borderRadius:'50%',background:`linear-gradient(135deg,${t.accent},${t.purple})`,color:'white',border:'none',fontSize:28,cursor:'pointer',boxShadow:'0 6px 20px rgba(59,130,246,0.4)',zIndex:99,display:'flex',alignItems:'center',justifyContent:'center',transition:'transform 0.2s',animation:'slideUp 0.3s ease' }}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
            onMouseLeave={e=>e.currentTarget.style.transform=''}>+</button>
        )}
        {user?.role === 'admin' && page !== 'admin' && (
          <button onClick={() => { setPage('admin'); loadDashboard() }} style={{ position:'fixed',bottom:30,left:30,zIndex:99,...css.btn(t.danger),borderRadius:30,padding:'12px 20px',boxShadow:'0 4px 15px rgba(239,68,68,0.4)',animation:'slideUp 0.3s ease' }}>🛡️ Admin Panel</button>
        )}
      </div>
    </>
  )
}

export default App