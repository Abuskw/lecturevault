import { useState } from 'react'

function PDFViewer({ pdfViewer, setPdfViewer, pdfZoom, setPdfZoom, API }) {
  if (!pdfViewer) return null

  const btn = { background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#1e293b', color: 'white', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => { setPdfViewer(null); setPdfZoom(1) }}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', padding: '6px 12px', borderRadius: 6 }}>✕ Close</button>
          <span style={{ fontWeight: 600, fontSize: 14 }}>📄 {pdfViewer.title}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setPdfZoom(z => Math.max(0.5, z - 0.25))} style={btn}>🔍−</button>
          <span style={{ fontSize: 12, minWidth: 40, textAlign: 'center' }}>{Math.round(pdfZoom * 100)}%</span>
          <button onClick={() => setPdfZoom(z => Math.min(3, z + 0.25))} style={btn}>🔍+</button>
          <button onClick={() => setPdfZoom(1)} style={btn}>↺</button>
          <span style={{ margin: '0 2px', opacity: 0.3 }}>|</span>
          <button onClick={() => window.open(`${API}/api/lectures/${pdfViewer.lectureId}/download`, '_blank')} style={btn}>⬇ Download</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 10, background: '#525659' }}>
        <iframe 
          src={pdfViewer.url} 
          style={{ width: `${pdfZoom * 100}%`, maxWidth: '100%', height: '100%', border: 'none', borderRadius: 6 }}
          title="PDF Viewer"
        />
      </div>
    </div>
  )
}

export default PDFViewer