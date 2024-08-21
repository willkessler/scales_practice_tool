import React, { useEffect, useRef } from 'react';
import abcjs from 'abcjs';

interface AbcNotationProps {
  notation: string;
  onRendered?: (svg: SVGSVGElement) => void;
}

const AbcNotation: React.FC<AbcNotationProps> = ({ notation, onRendered }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const renderedTune = abcjs.renderAbc(containerRef.current, notation, {
        responsive: 'resize',
        add_classes: true,
        format: {
          vocalfont: "10px Arial",
          gchordfont: "8px Arial",
          composerfont: "8px Arial",
          footerfont: "8px Arial",
          historyfont: "8px Arial",
          infofont: "8px Arial",
          partsfont: "8px Arial",
          repeatfont: "8px Arial",
          subtitlefont: "8px Arial",
          tempofont: "8px Arial",
          textfont: "8px Arial",
          titlefont: "8px Arial",
          voicefont: "8px Arial",
          wordsfont: "8px Arial"
        },
        lyrics_htmlparser: true
      });

      if (onRendered && renderedTune[0]?.svg) {
        onRendered(renderedTune[0].svg);
      }
    }
  }, [notation, onRendered]);

  return <div ref={containerRef}></div>;
};

export default AbcNotation;
