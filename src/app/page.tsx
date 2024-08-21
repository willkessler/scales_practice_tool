'use client'

import { useState, useEffect } from 'react'
import CustomAbcNotation from '@/components/CustomAbcNotation'

const scales = {
  cMajor: {
    notation: `X:1
M:4/4
L:1/16
K:C bass
%%clef bass
C,D,E,F, G,A,B,C DEFG ABcd | cBAG FEDC B,A,G,F, E,D,C,B,, | C,E,G,B, CEGB  c8 |`,
    fretNumbers:     ['3A','5','2D','3','5','7','9','10','12','9E','10','12','14','16','17',
                      '16', '17', '16', '14', '17', '15', '14', '12', '15', '14', '12', '10', '8', '7',
                      '10', '8', '7', '8', '7','10', '9', '10', '9', '12', '16', '17'],
    fingerPositions: ['0:2','5:1', '7:4', '8:4','12:1','21:1', '22:1','26:4'],
  },    
}

export default function Home() {
  const [currentScale, setCurrentScale] = useState('cMajor')
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [totalNotes, setTotalNotes] = useState(41) // Assuming 32 notes in the scale

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault()
      setIsPlaying(prev => !prev)
    } else if (event.code === 'ArrowRight') {
      setCurrentNoteIndex(prev => (prev + 1) % totalNotes)
    } else if (event.code === 'ArrowLeft') {
      setCurrentNoteIndex(prev => (prev - 1 + totalNotes) % totalNotes)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bass Guitar Scale Practice</h1>
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded ${isPlaying ? 'bg-red-500' : 'bg-green-500'} text-white`}
          onClick={() => setIsPlaying(prev => !prev)}
        >
          {isPlaying ? 'Stop' : 'Start'} Practice
        </button>
      </div>
      <div className="mt-4">
        <CustomAbcNotation 
          notation={scales[currentScale as keyof typeof scales].notation}
          fretNumbers={scales[currentScale as keyof typeof scales].fretNumbers}
          fingerPositions={scales[currentScale as keyof typeof scales].fingerPositions}
          highlightedNoteIndex={currentNoteIndex}
        />
      </div>
      <div className="mt-4">
        <p>Press spacebar to start/stop practice mode. </p>
        <p>Use left and right arrow keys to navigate notes.</p>
        <p>Practice mode: {isPlaying ? 'On' : 'Off'}</p>
      </div>
    </main>
  )
}
