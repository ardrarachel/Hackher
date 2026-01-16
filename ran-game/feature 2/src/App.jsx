import { useState } from 'react'
import BalloonGame from './components/BalloonGame'
import StoryMode from './components/StoryTelling/StoryMode'

function App() {
  const [view, setView] = useState('game');

  return (
    <div className="app-container">
      <nav style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button
          className="btn"
          onClick={() => setView('game')}
          style={{ opacity: view === 'game' ? 1 : 0.7 }}
        >
          🎈 Balloon Game
        </button>
        <button
          className="btn"
          onClick={() => setView('story')}
          style={{ opacity: view === 'story' ? 1 : 0.7 }}
        >
          📖 Story Weaver
        </button>
      </nav>

      {view === 'game' ? (
        <>
          <h1>Let's Read It Out Louddd!</h1>
          <div style={{ marginTop: '2rem' }}>
            <BalloonGame />
          </div>
        </>
      ) : (
        <StoryMode />
      )}
    </div>
  )
}

export default App
