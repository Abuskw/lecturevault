import { useState } from 'react'

function CourseDetail({ selectedCourse, setSelectedCourse, lectures, loading, setPdfViewer, toggleBookmark, isBookmarked, setShowRating, setRatingValue, setRatingComment, showToast, API, token, user, t, css, setPage }) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)

  const Skeleton = ({ w, h }) => <div style={{ width: w||'100%', height: h||20, background: t.border, borderRadius: 6, animation: 'pulse 1.5s infinite' }} />

  const loadComments = async (lectureId) => {
    const res = await fetch(`${API}/api/lectures/${lectureId}/comments`)
    setComments(await res.json())
  }

  const submitComment = async (lectureId) => {
    if (!token) { showToast('Please login to comment', 'error'); return }
    if (!commentText.trim() || !lectureId) return
    const res = await fetch(`${API}/api/lectures/${lectureId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: commentText, parentId: replyTo })
    })
    const data = await res.json()
    if (!res.ok) { showToast(data.error || 'Comment failed', 'error'); return }
    setCommentText(''); setReplyTo(null)
    loadComments(lectureId)
    showToast('Comment added! 💬')
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <button onClick={() => setPage('home')} style={css.btnOutline}>← Back</button>
      <div style={{...css.card, marginTop:16}}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          <span style={css.tag(t.accent)}>{selectedCourse?.code}</span>
          <span style={css.tag(t.success)}>Level {selectedCourse?.level}</span>
          <span style={css.tag(t.warning)}>Semester {selectedCourse?.semester}</span>
          <span style={css.tag(t.purple)}>{selectedCourse?.units||2} Units</span>
        </div>
        <h2 style={{ margin:'0 0 4px' }}>{selectedCourse?.title}</h2>
        {selectedCourse?.description && <p style={{ color:t.sub }}>{selectedCourse.description}</p>}
      </div>
      <h3 style={{ fontSize:20, marginBottom:12 }}>📚 Lectures ({lectures.length})</h3>
      {loading ? [1,2,3].map(i => <div key={i} style={css.card}><Skeleton w="70%" h={20} /><Skeleton w="50%" h={14} /></div>) :
        lectures.length === 0 ? <div style={{...css.card, textAlign:'center', color:t.sub, padding:40 }}>No lectures yet</div> :
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
              {l.fileUrl && <button onClick={() => setPdfViewer({url:`${API}/api/lectures/${l.id}/download`,title:l.title,lectureId:l.id})} style={css.btn(t.purple)}>👁 View</button>}
              {l.fileUrl && <button onClick={() => {
                const dl=JSON.parse(localStorage.getItem('downloads')||'[]')
                dl.unshift({title:l.title,courseCode:selectedCourse?.code||'',weekNumber:l.weekNumber,fileUrl:l.fileUrl,date:new Date().toLocaleDateString()})
                localStorage.setItem('downloads',JSON.stringify(dl.slice(0,50)))
                window.open(`${API}/api/lectures/${l.id}/download`,'_blank')
              }} style={css.btn(t.accent)}>⬇ Download</button>}
              <button onClick={() => toggleBookmark(l)} style={{...css.iconBtn, fontSize:24, color:isBookmarked(l.id)?t.warning:t.sub}}>
                {isBookmarked(l.id)?'⭐':'☆'}
              </button>
              <button onClick={() => { setShowRating({lectureId:l.id,lectureTitle:l.title}); setRatingValue(0); setRatingComment('') }}
                style={{...css.iconBtn, fontSize:18, color:t.warning}}>⭐</button>
            </div>
          </div>
        ))
      }

      {/* COMMENTS */}
      <div style={{ marginTop: 32 }}>
        <div style={{...css.flexBetween, marginBottom: 16}}>
          <h3 style={{ fontSize: 20, margin: 0 }}>💬 Discussion</h3>
          <button onClick={() => { setShowComments(!showComments); if(!showComments && lectures[0]) loadComments(lectures[0].id) }}
            style={css.btn(t.accent)}>{showComments ? 'Hide' : 'Show'} Comments</button>
        </div>
        {showComments && (
          <div style={css.card}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input placeholder={token ? 'Ask a question...' : 'Login to comment...'} value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && submitComment(lectures[0]?.id)} style={{...css.input, flex: 1}} disabled={!token} />
              <button onClick={() => submitComment(lectures[0]?.id)} style={css.btn(t.accent)} disabled={!token}>{token ? 'Post' : 'Login'}</button>
            </div>
            {replyTo && (
              <div style={{ padding: '8px 12px', background: t.bg, borderRadius: 8, marginBottom: 12, fontSize: 13, color: t.sub }}>
                Replying <button onClick={() => setReplyTo(null)} style={{ marginLeft: 8, color: t.danger, background:'transparent', border:'none', cursor:'pointer' }}>✕</button>
              </div>
            )}
            {comments.length === 0 ? <p style={{ color: t.sub, textAlign: 'center', padding: 20 }}>No comments yet.</p> :
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
                  {c.replies?.map(r => (
                    <div key={r.id} style={{ marginLeft: 24, marginTop: 8, padding: '8px 12px', background: t.bg, borderRadius: 8 }}>
                      <strong style={{ fontSize: 13 }}>{r.fullName}</strong>
                      <p style={{ margin: '4px 0 0', fontSize: 13 }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetail