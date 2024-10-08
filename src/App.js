import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [tableData, setTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'block_time', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = '6OFd8MOOeLCuWUMpGXAfnD4ctXmj5yIH'; // Placeholder Dune API key

    // Function to fetch the data
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from both queries
        const response1 = await fetch(`https://api.dune.com/api/v1/query/4022946/results?limit=1000`, {
          headers: {
            'X-Dune-API-Key': apiKey,
          },
        });
        const data1 = await response1.json();

        const response2 = await fetch(`https://api.dune.com/api/v1/query/4023501/results?limit=1000`, {
          headers: {
            'X-Dune-API-Key': apiKey,
          },
        });
        const data2 = await response2.json();

        // Combine the data
        const combinedData = data1.result.rows.map(tokenRow => {
          const matchingVolumeRow = data2.result.rows.find(volumeRow => volumeRow.token === tokenRow.token_address);
          return {
            ...tokenRow,
            token_pair: matchingVolumeRow ? matchingVolumeRow.token_pair : 'N/A',
            total_volume: matchingVolumeRow ? matchingVolumeRow.total_volume : 0,
          };
        });

        setTableData(combinedData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    // Fetch data immediately on mount
    fetchData();

    // Set up an interval to refresh data every 120 seconds
    const interval = setInterval(fetchData, 120000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
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
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <header className="App-header">
          <h1>Pump.Fun Graduated Tokens (Last 24 Hours)</h1>
          <div className="token-table">
            <div className="token-row header-row">
              <div className="token-column time-column" onClick={() => sortData('block_time')}>
                Launch Time {sortConfig.key === 'block_time' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </div>
              <div className="token-column pair-column" onClick={() => sortData('token_pair')}>
                Pair Name {sortConfig.key === 'token_pair' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </div>
              <div className="token-column volume-column" onClick={() => sortData('total_volume')}>
                24h Volume {sortConfig.key === 'total_volume' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </div>
              <div className="token-column address-column" onClick={() => sortData('token_address')}>
                Token Address {sortConfig.key === 'token_address' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
              </div>
              <div className="token-column link-column">
                Link
              </div>
            </div>
            {sortedData.map((row, index) => (
              <div key={index} className="token-row">
                <div className="token-column time-column">{row.block_time}</div>
                <div className="token-column pair-column">{row.token_pair}</div>
                <div className="token-column volume-column">${row.total_volume.toFixed(2)}</div>
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
      )}
    </div>
  );
}

export default App;
