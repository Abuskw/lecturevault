function RatingModal({ showRating, setShowRating, ratingValue, setRatingValue, ratingComment, setRatingComment, t, css, API, token, selectedCourse, loadLectures, showToast }) {
  if (!showRating) return null

  const submitRating = async () => {
    await fetch(`${API}/api/lectures/${showRating.lectureId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ value: ratingValue, comment: ratingComment })
    })
    showToast(`Rated ${ratingValue} stars! ⭐`)
    setShowRating(null)
    setRatingValue(0)
    setRatingComment('')
    if (selectedCourse) loadLectures(selectedCourse.id)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
          <button onClick={() => setShowRating(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${t.border}`, background: 'transparent', color: t.text, cursor: 'pointer' }}>Cancel</button>
          <button onClick={submitRating} disabled={!ratingValue}
            style={{...css.btn(t.warning), flex: 1, justifyContent: 'center', opacity: ratingValue ? 1 : 0.5}}>Submit</button>
        </div>
      </div>
    </div>
  )
}

export default RatingModal