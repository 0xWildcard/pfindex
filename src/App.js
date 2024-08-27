import React, { useEffect, useRef } from 'react';
import './App.css';

function App() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (iframeRef.current) {
        iframeRef.current.src += ''; // Trigger the iframe to reload
      }
    }, 60000); // Refresh every 60 seconds (adjust as needed)

    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Graduated Pump Fun Tokens (Last 24 hours)</h1>
        <iframe
          ref={iframeRef}
          src="https://dune.com/embeds/4022946/6772447/"
          width="100%"
          height="600"
          frameBorder="0"
          title="Graduated Pump Fun Tokens (Last 24 hours)"
          allowFullScreen
        ></iframe>
      </header>
    </div>
  );
}

export default App;
