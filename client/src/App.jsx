import { useState, useEffect } from 'react'
import Header from './components/Header'
import PDFViewer from './components/PDFViewer'
import Toast from './components/Toast'
import RatingModal from './components/RatingModal'
import Home from './pages/Home'
import Search from './pages/Search'
import Read from './pages/Read'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import FacultyPage from './pages/FacultyPage'
import DepartmentPage from './pages/DepartmentPage'
import LevelPage from './pages/LevelPage'
import CourseDetail from './pages/CourseDetail'
import Upload from './pages/Upload'

function App() {
  const [page, setPage] = useState('home')
  const [darkMode, setDarkMode] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [courses, setCourses] = useState([])
  const [lectures, setLectures] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [faculties, setFaculties] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [pdfViewer, setPdfViewer] = useState(null)
  const [pdfZoom, setPdfZoom] = useState(1.0)
  const [pdfPage, setPdfPage] = useState(1)
  const [pdfTotalPages, setPdfTotalPages] = useState(0)
  const [showRating, setShowRating] = useState(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [bookmarks, setBookmarks] = useState(JSON.parse(localStorage.getItem('bookmarks') || '[]'))
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSchool, setFilterSchool] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [uploadForm, setUploadForm] = useState({ title: '', weekNumber: '', courseId: '', academicYear: '2024/2025' })
  const [file, setFile] = useState(null)
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
    ]).then(([c, f]) => { setCourses(c); setFaculties(f); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (page === 'level' && selectedDepartment && selectedLevel) {
      setLoading(true)
      const deptCourses = courses.filter(c => c.departmentId === selectedDepartment.id && c.level === selectedLevel)
      if (deptCourses.length === 0) { setLoading(false); return }
      let loaded = 0
      deptCourses.forEach(course => {
        fetch(`${API}/api/courses/${course.id}/lectures`).then(r => r.json()).then(data => {
          setLectures(prev => [...prev.filter(l => l.courseId !== course.id), ...data.map(l => ({...l, courseId: course.id}))])
          loaded++; if (loaded >= deptCourses.length) setLoading(false)
        }).catch(() => { loaded++; if (loaded >= deptCourses.length) setLoading(false) })
      })
    }
  }, [page, selectedDepartment, selectedLevel])

  const loadLectures = (id) => fetch(`${API}/api/courses/${id}/lectures`).then(r => r.json()).then(d => setLectures(d))
  
  const handleFacultyChange = (id) => {
    setFilterSchool(id); setFilterDept('')
    if (id) fetch(`${API}/api/faculties/${id}/departments`).then(r => r.json()).then(d => setDepartments(d))
    else setDepartments([])
  }

  const toggleBookmark = (l) => {
    const updated = bookmarks.find(b => b.id === l.id) ? bookmarks.filter(b => b.id !== l.id) : [...bookmarks, l]
    setBookmarks(updated); localStorage.setItem('bookmarks', JSON.stringify(updated))
    showToast(bookmarks.find(b => b.id === l.id) ? 'Removed' : 'Bookmarked ⭐')
  }

  const isBookmarked = (id) => bookmarks.some(b => b.id === id)
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null); setPage('home') }

  const t = darkMode ? {
    bg: '#0f172a', card: '#1e293b', text: '#e2e8f0', sub: '#94a3b8', border: '#334155',
    header: '#1e3a5f', accent: '#3b82f6', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', purple: '#8b5cf6'
  } : {
    bg: '#f1f5f9', card: '#ffffff', text: '#1e293b', sub: '#64748b', border: '#e2e8f0',
    header: '#1e40af', accent: '#3b82f6', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', purple: '#8b5cf6'
  }

  const sharedProps = { page, setPage, t, darkMode, setDarkMode, token, setToken, user, setUser, courses, setCourses, lectures, setLectures, selectedCourse, setSelectedCourse, faculties, setFaculties, departments, setDepartments, loading, setLoading, toast, setToast, showToast, selectedFaculty, setSelectedFaculty, selectedDepartment, setSelectedDepartment, selectedLevel, setSelectedLevel, pdfViewer, setPdfViewer, pdfZoom, setPdfZoom, pdfPage, setPdfPage, pdfTotalPages, setPdfTotalPages, showRating, setShowRating, ratingValue, setRatingValue, ratingComment, setRatingComment, bookmarks, setBookmarks, showProfile, setShowProfile, searchQuery, setSearchQuery, filterSchool, setFilterSchool, filterDept, setFilterDept, filterLevel, setFilterLevel, uploadForm, setUploadForm, file, setFile, uploadFaculty, setUploadFaculty, uploadDept, setUploadDept, uploadDepts, setUploadDepts, loadLectures, handleFacultyChange, toggleBookmark, isBookmarked, logout, API }

  const css = {
    body: { fontFamily: "'Segoe UI', system-ui, sans-serif", background: t.bg, color: t.text, minHeight: '100vh', transition: 'all 0.3s' },
    main: { maxWidth: 1100, margin: '0 auto', padding: '24px 20px' },
    card: { background: t.card, borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: `1px solid ${t.border}` },
    btn: (bg) => ({ background: bg || t.accent, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }),
    btnOutline: { background: 'transparent', color: t.accent, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14, border: 'none' },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.card, color: t.text, fontSize: 14, cursor: 'pointer' },
    tag: (c) => ({ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: c, color: 'white', marginRight: 6, marginBottom: 6 }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
    flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
    iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, padding: 6, borderRadius: 8, color: t.text },
    badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  }

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; } body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
        input:focus, select:focus { border-color: ${t.accent} !important; box-shadow: 0 0 0 3px ${t.accent}20 !important; }
      `}</style>

      <Toast toast={toast} setToast={setToast} t={t} />
      <PDFViewer {...{ pdfViewer, setPdfViewer, pdfZoom, setPdfZoom, pdfPage, setPdfPage, pdfTotalPages, setPdfTotalPages, API }} />
      <RatingModal {...{ showRating, setShowRating, ratingValue, setRatingValue, ratingComment, setRatingComment, t, css, API, token, selectedCourse, loadLectures, showToast }} />

      <div style={css.body}>
        <Header {...{ page, setPage, t, css, user, showProfile, setShowProfile, logout, handleFacultyChange }} />
        <main style={css.main}>
          {page === 'home' && <Home {...sharedProps} />}
          {page === 'search' && <Search {...sharedProps} />}
          {page === 'read' && <Read {...sharedProps} />}
          {page === 'settings' && <Settings {...sharedProps} />}
          {page === 'admin' && <Admin {...sharedProps} />}
          {page === 'faculty' && <FacultyPage {...sharedProps} />}
          {page === 'department' && <DepartmentPage {...sharedProps} />}
          {page === 'level' && <LevelPage {...sharedProps} />}
          {page === 'course' && <CourseDetail {...sharedProps} />}
          {page === 'upload' && <Upload {...sharedProps} />}
        </main>

        {user?.role === 'lecturer' && page !== 'upload' && (
          <button onClick={() => setPage('upload')} style={{ position:'fixed',bottom:30,right:30,width:60,height:60,borderRadius:'50%',background:`linear-gradient(135deg,${t.accent},${t.purple})`,color:'white',border:'none',fontSize:28,cursor:'pointer',boxShadow:'0 6px 20px rgba(59,130,246,0.4)',zIndex:99 }}>+</button>
        )}
        {user?.role === 'admin' && page !== 'admin' && (
          <button onClick={() => setPage('admin')} style={{ position:'fixed',bottom:30,left:30,zIndex:99,...css.btn(t.danger),borderRadius:30,padding:'12px 20px' }}>🛡️ Admin</button>
        )}
      </div>
    </>
  )
}

export default App