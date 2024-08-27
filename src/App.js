import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [totalCount, setTotalCount] = useState(0);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const apiKey = '6OFd8MOOeLCuWUMpGXAfnD4ctXmj5yIH'; // Placeholder Dune API key
    const apiUrl = 'https://api.dune.com/api/v1/query/4022946/results?limit=1000';

    fetch(apiUrl, {
      headers: {
        'X-Dune-API-Key': apiKey,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.result && data.result.rows) {
          const tableRows = data.result.rows;

          // Calculate distinct token addresses
          const distinctAddresses = new Set(tableRows.map(row => row.token_address));
          setTotalCount(distinctAddresses.size);

          // Set table data
          setTableData(tableRows);
        }
      })
      .catch(error => console.error('Error fetching data from Dune API:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Graduated Pump Fun Tokens (Last 24 Hours)</h1>
        <h2>Total: {totalCount}</h2>
        <div className="token-table">
          {tableData.map((row, index) => (
            <div key={index} className="token-row">
              <div className="token-column time-column">{row.block_time}</div>
              <div className="token-column address-column">{row.token_address}</div>
              <div className="token-column link-column">
                <a href={row.token_link} target="_blank" rel="noopener noreferrer" className="token-button">
                  View Token
                </a>
              </div>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
