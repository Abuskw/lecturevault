import { useState } from 'react'

function Upload({ uploadForm, setUploadForm, file, setFile, uploadFaculty, setUploadFaculty, uploadDept, setUploadDept, uploadDepts, setUploadDepts, faculties, courses, API, token, showToast, t, css, setPage }) {
  const [bulkFiles, setBulkFiles] = useState([])
  const [bulkTitles, setBulkTitles] = useState('')
  const [bulkWeeks, setBulkWeeks] = useState('')
  const [bulkUploading, setBulkUploading] = useState(false)

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
      const res = await fetch(`${API}/api/lectures/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (res.ok) {
        showToast('✅ Uploaded!')
        setUploadForm({ title: '', weekNumber: '', courseId: '', academicYear: '2024/2025', manualCode:'', manualTitle:'' })
        setFile(null); setUploadFaculty(''); setUploadDept(''); setUploadDepts([])
      } else { const d = await res.json(); showToast(d.error, 'error') }
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
      const res = await fetch(`${API}/api/lectures/bulk-upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const data = await res.json()
      if (res.ok) { showToast(`✅ ${data.count} uploaded!`); setBulkFiles([]); setBulkTitles(''); setBulkWeeks('') }
      else showToast(data.error, 'error')
    } catch { showToast('Network error', 'error') }
    setBulkUploading(false)
  }

  if (user?.role !== 'lecturer') return null

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => setPage('home')} style={css.btnOutline}>← Back</button>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📤 Upload Lecture PDF</h2>
      <form onSubmit={handleUpload} style={css.card}>
        <label style={{ fontWeight: 600, fontSize: 13, color: t.sub, marginBottom: 4, display: 'block' }}>STEP 1: Faculty</label>
        <select value={uploadFaculty} onChange={e => { setUploadFaculty(e.target.value); setUploadDept(''); setUploadForm({...uploadForm, courseId: ''}); if(e.target.value) fetch(`${API}/api/faculties/${e.target.value}/departments`).then(r => r.json()).then(d => setUploadDepts(d)); else setUploadDepts([]) }} style={{...css.select, marginBottom: 16}} required>
          <option value="">-- Select Faculty --</option>
          {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <label style={{ fontWeight: 600, fontSize: 13, color: t.sub, marginBottom: 4, display: 'block' }}>STEP 2: Department</label>
        <select value={uploadDept} onChange={e => { setUploadDept(e.target.value); setUploadForm({...uploadForm, courseId: ''}) }} style={{...css.select, marginBottom: 16}} disabled={!uploadFaculty} required>
          <option value="">-- Select Department --</option>
          {uploadDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <label style={{ fontWeight: 600, fontSize: 13, color: t.sub, marginBottom: 4, display: 'block' }}>STEP 3: Course</label>
        <select value={uploadForm.courseId} onChange={e => setUploadForm({...uploadForm, courseId: e.target.value})} style={{...css.select, marginBottom: uploadForm.courseId==='other'?8:20}} disabled={!uploadDept} required>
          <option value="">-- Select Course --</option>
          {courses.filter(c => c.departmentId == uploadDept).map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
          <option value="other" style={{ fontStyle: 'italic', color: t.accent }}>📝 Other (type manually)</option>
        </select>
        {uploadForm.courseId === 'other' && (
          <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
            <input placeholder="Course Code *" value={uploadForm.manualCode||''} onChange={e => setUploadForm({...uploadForm, manualCode: e.target.value.toUpperCase()})} style={{...css.input, flex: 1}} required />
            <input placeholder="Course Title *" value={uploadForm.manualTitle||''} onChange={e => setUploadForm({...uploadForm, manualTitle: e.target.value})} style={{...css.input, flex: 2}} required />
          </div>
        )}
        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 20, marginBottom: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 13, color: t.sub }}>Lecture Details</label>
        </div>
        <input placeholder="Lecture Title *" value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} style={{...css.input, marginBottom: 12}} required />
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="number" placeholder="Week Number *" value={uploadForm.weekNumber} onChange={e => setUploadForm({...uploadForm, weekNumber: e.target.value})} style={{...css.input, flex: 1}} required />
          <input placeholder="Academic Year" value={uploadForm.academicYear} onChange={e => setUploadForm({...uploadForm, academicYear: e.target.value})} style={{...css.input, flex: 1}} />
        </div>
        <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{...css.input, marginTop: 12}} required />
        {file && <p style={{ fontSize: 13, color: t.sub, marginTop: 4 }}>📎 {file.name} ({(file.size/1024/1024).toFixed(2)} MB)</p>}
        <button type="submit" style={{...css.btn(t.success), width: '100%', justifyContent: 'center', marginTop: 16, padding: 14, fontSize: 16}}>📤 Upload Lecture</button>
      </form>

      {/* BULK UPLOAD */}
      <div style={{ marginTop: 40, ...css.card, borderTop: `2px solid ${t.border}`, paddingTop: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>📦 Bulk Upload</h3>
        <p style={{ color: t.sub, fontSize: 13, marginBottom: 20 }}>Upload multiple PDFs at once.</p>
        <form onSubmit={handleBulkUpload}>
          <label style={{ fontWeight: 600, fontSize: 13, color: t.sub, marginBottom: 4, display: 'block' }}>Select PDF Files * (up to 20)</label>
          <input type="file" accept=".pdf" multiple onChange={e => setBulkFiles(Array.from(e.target.files))} style={{...css.input, marginBottom: 12}} required />
          {bulkFiles.length > 0 && <p style={{ fontSize: 13, color: t.sub, marginBottom: 12 }}>📎 {bulkFiles.length} files selected</p>}
          <input placeholder="Titles (comma-separated)" value={bulkTitles} onChange={e => setBulkTitles(e.target.value)} style={{...css.input, marginBottom: 12}} />
          <input placeholder="Week Numbers (comma-separated)" value={bulkWeeks} onChange={e => setBulkWeeks(e.target.value)} style={{...css.input, marginBottom: 12}} />
          <input placeholder="Academic Year" value={uploadForm.academicYear} onChange={e => setUploadForm({...uploadForm, academicYear: e.target.value})} style={{...css.input, marginBottom: 16}} />
          <button type="submit" disabled={bulkUploading} style={{...css.btn(t.purple), width: '100%', justifyContent: 'center', padding: 14, fontSize: 16}}>
            {bulkUploading ? 'Uploading...' : `📦 Upload ${bulkFiles.length || 0} Lectures`}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Upload