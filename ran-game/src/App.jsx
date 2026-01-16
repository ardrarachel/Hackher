import { useState } from 'react'
import BalloonGame from './components/BalloonGame'

function App() {
  return (
    <div className="app-container">
      <h1>RAN Screening</h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        "The Balloon Game"
      </p>
      <div style={{ marginTop: '2rem' }}>
        <BalloonGame />
      </div>
    </div>
  )
}

export default App
