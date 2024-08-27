import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [tableData, setTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'block_time', direction: 'desc' });

  useEffect(() => {
    const apiKey = '6OFd8MOOeLCuWUMpGXAfnD4ctXmj5yIH'; // Placeholder Dune API key

    // Fetch first query data
    const apiUrl1 = 'https://api.dune.com/api/v1/query/4022946/results?limit=1000';
    fetch(apiUrl1, {
      headers: {
        'X-Dune-API-Key': apiKey,
      },
    })
      .then(response => response.json())
      .then(data1 => {
        if (data1.result && data1.result.rows) {
          const firstQueryTokens = data1.result.rows;

          // Fetch second query data
          const apiUrl2 = 'https://api.dune.com/api/v1/query/4023501/results?limit=1000';
          fetch(apiUrl2, {
            headers: {
              'X-Dune-API-Key': apiKey,
            },
          })
            .then(response => response.json())
            .then(data2 => {
              if (data2.result && data2.result.rows) {
                const volumeRows = data2.result.rows;

                // Merge data: Add token pair and volume data to the first query's results
                const mergedData = firstQueryTokens.map(tokenRow => {
                  const matchingVolumeRow = volumeRows.find(volumeRow => volumeRow.token === tokenRow.token_address);
                  return {
                    ...tokenRow,
                    token_pair: matchingVolumeRow ? matchingVolumeRow.token_pair : 'N/A',
                    total_volume: matchingVolumeRow ? matchingVolumeRow.total_volume : 0
                  };
                });

                setTableData(mergedData);
              }
            })
            .catch(error => console.error('Error fetching second query data from Dune API:', error));
        }
      })
      .catch(error => console.error('Error fetching data from Dune API:', error));
  }, []);

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...tableData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1>Token Trading Volume (Last 24 Hours)</h1>
        <div className="token-table">
          <div className="token-row header-row">
            <div className="token-column time-column" onClick={() => sortData('block_time')}>
              Listing Time {sortConfig.key === 'block_time' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </div>
            <div className="token-column address-column" onClick={() => sortData('token_address')}>
              Token Address {sortConfig.key === 'token_address' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </div>
            <div className="token-column pair-column" onClick={() => sortData('token_pair')}>
              Token Pair {sortConfig.key === 'token_pair' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </div>
            <div className="token-column volume-column" onClick={() => sortData('total_volume')}>
              Total Volume (Last 24 Hours) {sortConfig.key === 'total_volume' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
            </div>
            <div className="token-column link-column">
              Link
            </div>
          </div>
          {sortedData.map((row, index) => (
            <div key={index} className="token-row">
              <div className="token-column time-column">{row.block_time}</div>
              <div className="token-column address-column">{row.token_address}</div>
              <div className="token-column pair-column">{row.token_pair}</div>
              <div className="token-column volume-column">${row.total_volume.toFixed(2)}</div>
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
