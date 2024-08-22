import React, { useEffect, useRef } from 'react';
import abcjs from 'abcjs';

interface CustomAbcNotationProps {
  notation: string;
  highlightedNoteIndex: number;
  fretNumbers: number[];
  strings: number[];
  fingerPositions: string[];
}

const CustomAbcNotation: React.FC<CustomAbcNotationProps> = ({
  notation,
  fretNumbers,
  fingerPositions,
  strings,
  highlightedNoteIndex
}) => {

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      //console.log('Rendering notation:', notation);
      //console.log('Highlighted note index:', highlightedNoteIndex);

      const renderOptions = {
        responsive: 'resize',
        add_classes: true,
        clickListener: (abcElem: any) => {
          console.log('Clicked element:', abcElem);
        },
        oneSvgPerLine: false,
        visualTranspose: 0,
        foregroundColor: "black",  // Set the default color for notes to black
        paddingtop: 25, // Add some padding to the top for the new labels
        paddingbottom: 45, // Add some padding to the top for the new labels
      };

      try {
        const renderedTune = abcjs.renderAbc(containerRef.current, notation, renderOptions);
        
        // Wait for the SVG to be rendered
        setTimeout(() => {
          const svg = containerRef.current?.querySelector('svg');
          if (svg) {
            //console.log('SVG found, applying highlight');
            labelNote(svg, highlightedNoteIndex);
            colorCodeNotes(svg, strings);
          } else {
            console.log('No SVG found in container');
          }
        }, 100);

      } catch (error) {
        console.error('Error rendering ABC notation:', error);
      }
    }
  }, [notation, fretNumbers, strings, highlightedNoteIndex]);


  const colorCodeNotes = (svg: SVGSVGElement, strings: number[]) => {
    const noteElements = svg.querySelectorAll('.abcjs-note');
    const stringColors = ['#2222FF', '#00FF00', '#FF55FF','#FF0000' ]; // Red, Green, Blue, Orange

    //console.log('colorCodeNotes, stringColors:', stringColors, 'strings:', strings);
    noteElements.forEach((noteElement, index) => {
      if (index < strings.length) {
        const stringNumber = strings[index];
        const color = stringColors[stringNumber] || 'black';
        
        const noteHead = noteElement.querySelector('.abcjs-notehead');
        if (noteHead) {
          //console.log('color coding noteHead:', noteHead);
          (noteHead as SVGElement).setAttribute('fill', color);
        }
      }
    });
  };

  const getNoteNamesFromNotation = (abcNotation: string): string[] => {
    const lines = abcNotation.split('\n');
    const bassClefIndex = lines.findIndex(line => line.trim() === '%%clef bass');
    if (bassClefIndex !== -1 && bassClefIndex + 1 < lines.length) {
      const noteLine = lines[bassClefIndex + 1];
      const noteRegex = /([A-Ga-g][,']?)/g;
      const matches = noteLine.match(noteRegex);
      
      if (matches) {
        return matches.map(note => note[0].toUpperCase());
      }
    }
    return [];
  };

  // This version (deprecated) got the fret numbers from a Lyric line in the notation.
  const getFretNumbersFromAbc = (abcNotation: string): string[] => {
    const lines = abcNotation.split('\n');
    const bassClefIndex = lines.findIndex(line => line.trim() === '%%clef bass');
    if (bassClefIndex !== -1 && bassClefIndex + 3 < lines.length) {
      const fretLine = lines[bassClefIndex + 3];
      const matches = fretLine.replace('w: ','').split(/\s+/);
      
      if (matches) {
        return matches.map(fret => fret.trim());
      }
    }
    return [];
  };


  const getFingerPosition = (index: number): number|null => {
    for (let position of fingerPositions) {
      const [findex, value ] = position.split(':');
      if (index == parseInt(findex)) {
        return value;
      }
    }
    return null;
  };


  const labelNote = (svg: SVGSVGElement, index: number) => {
    //console.log('Highlighting note at index:', index);
    
    // Remove previous highlights and labels
    svg.querySelectorAll('.highlight-group').forEach(el => el.remove());

    const noteElements = svg.querySelectorAll('.abcjs-note');
    //console.log('Total note elements:', noteElements.length);

    if (noteElements.length > index) {
      const noteElement = noteElements[index] as SVGElement;
      // console.log('Note element to highlight:', noteElement);
      
      // Get the bounding box of the note element
      const bbox = noteElement.getBBox();
      const highlightBuffer = 2;
      const highlightX = bbox.x - highlightBuffer;
      const highlightY = bbox.y - highlightBuffer;
      const highlightWidth = bbox.width + highlightBuffer;
      const highlightHeight = bbox.height + highlightBuffer * 4;
      
      // Create a group to hold our highlight and labels
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'highlight-group');
      
      // Get the note names
      const noteNames = getNoteNamesFromNotation(notation);
      //console.log('noteNames:', noteNames);
      const noteName = noteNames[index] || `Note ${index + 1}`;
      const fretNumber = fretNumbers[index];
      const fingerPosition = getFingerPosition(index);

      // Roundrect behind fret number
      const fretRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      fretRect.setAttribute('x', (bbox.x - bbox.width / 2 + 3).toString());
      fretRect.setAttribute('y', (bbox.y + bbox.height + 3).toString());
      fretRect.setAttribute('width', '20');
      fretRect.setAttribute('height', '25');
      fretRect.setAttribute('rx', '5');
      fretRect.setAttribute('ry', '5');
      fretRect.setAttribute('fill', 'white');
      fretRect.setAttribute('stroke', 'none');
      group.appendChild(fretRect);

      // Add fret number
      let label;
      label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', 'note-label');
      label.setAttribute('x', (bbox.x + bbox.width / 2).toString());
      label.setAttribute('y', (bbox.y + bbox.height + 17).toString());
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '10');
      label.textContent = `${fretNumber}`;
      group.appendChild(label);

      // Roundrect behind note label
      const labelRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      labelRect.setAttribute('x', (bbox.x - bbox.width / 2).toString());
      labelRect.setAttribute('y', (bbox.y - 25).toString());
      labelRect.setAttribute('width', '20');
      labelRect.setAttribute('height', '20');
      labelRect.setAttribute('rx', '5');
      labelRect.setAttribute('ry', '5');
      labelRect.setAttribute('fill', 'white');
      labelRect.setAttribute('stroke', 'none');
      group.appendChild(labelRect);

      // Add note label
      label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', 'note-label');
      label.setAttribute('x', (bbox.x + bbox.width / 2).toString());
      label.setAttribute('y', (bbox.y - 5).toString());
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '14');
      label.setAttribute('fill', 'red');
      label.setAttribute('stroke', 'none');
      label.setAttribute('opacity', '1.0');
      label.setAttribute('background', 'white');
      label.textContent = `${noteName}`;
      label.style.fontWeight = 'bold';
      group.appendChild(label);

      // Add finger position when appropriate
      if (fingerPosition !== null) {
        // Add circle behind finger position
        const fingerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        fingerCircle.setAttribute('cx', (bbox.x + bbox.width / 2).toString());
        fingerCircle.setAttribute('cy', (bbox.y + bbox.height + 29).toString());
        fingerCircle.setAttribute('r', '7');
        fingerCircle.setAttribute('fill', 'none');
        fingerCircle.setAttribute('stroke', 'black');
        group.appendChild(fingerCircle);

        label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('class', 'note-label');
        label.setAttribute('x', (bbox.x + bbox.width / 2).toString());
        label.setAttribute('y', (bbox.y + bbox.height + 32).toString());
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '10');
        label.textContent = `${fingerPosition}`;
        group.appendChild(label);
      }      

      // Insert the group at the end of the SVG
      svg.appendChild(group);

      // Highlight the note
      const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      highlight.setAttribute('class', 'highlight');
      highlight.setAttribute('x', highlightX.toString());
      highlight.setAttribute('y', highlightY.toString());
      highlight.setAttribute('width', highlightWidth.toString());
      highlight.setAttribute('height', highlightHeight.toString());
      highlight.setAttribute('fill', 'none');
      highlight.setAttribute('opacity', '1');
      highlight.setAttribute('stroke', '#f00');
      group.appendChild(highlight);


      //console.log('Highlight and label added');
    } else {
      console.log('Note index out of range');
    }
  };

  return <div ref={containerRef}></div>;
};

export default CustomAbcNotation;
