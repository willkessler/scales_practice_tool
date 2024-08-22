'use client'

import { useState, useEffect } from 'react'
import CustomAbcNotation from '@/components/CustomAbcNotation'

// string constants
const E = 0;
const A = 1;
const D = 2;
const G = 3;

const scales = {
  cMajor: {
    notation: `X:1
M:4/4
L:1/16
K:C bass
%%clef bass
C,D,E,F, G,A,B,C DEFG ABcB | cBAG FEDC B,A,G,F, E,D,C,B,, | C,E,G,B, CEGB  c8 |`,
    fretNumbers:     [3, 5, // A string
                      2, 3, 5, 7, 9, 10, 12, // D string
                      9, 10, 12, 14, 16, 17, // G string
                      16, 17, 16, 14, // G string
                      17, 15, 14, 12, // D string
                      15, 14, 12, 10, 8, 7, // A string
                      10, 8, 7, // E string
                      8, // E string
                      7, 10, // A string
                      9, 10, // D string
                      9, 12, 16, 17, // G string
    ],
    strings:         [A, A,
                      D, D, D, D, D, D, D,
                      G, G, G, G, G, G, G,
                      G, G, G, G,
                      D, D, D, D,
                      A, A, A, A, A, A,
                      E, E, E,
                      E,
                      A, A,
                      D, D,
                      G, G, G, G,
    ],
    // special finger positions shifts
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
          strings={scales[currentScale as keyof typeof scales].strings}
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
