import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [tableData, setTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'block_time', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = '6OFd8MOOeLCuWUMpGXAfnD4ctXmj5yIH'; // Placeholder Dune API key

    // Function to trigger query execution
    const triggerQueryExecution = async (queryId) => {
      try {
        const response = await fetch(`https://api.dune.com/api/v1/query/${queryId}/execute`, {
          method: 'POST',
          headers: {
            'X-Dune-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log(`Triggered query ${queryId}, execution ID: ${data.execution_id}`);
        return data.execution_id;
      } catch (error) {
        console.error('Error triggering query execution:', error);
        throw error;
      }
    };

    // Function to fetch query results
    const fetchQueryResults = async (executionId) => {
      try {
        const response = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/results`, {
          headers: {
            'X-Dune-API-Key': apiKey,
          },
        });
        const data = await response.json();
        if (data.result && data.result.rows) {
          return data.result.rows;
        } else {
          throw new Error('Query results are not ready or no data available.');
        }
      } catch (error) {
        console.error('Error fetching query results:', error);
        throw error;
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Trigger execution for both queries
        const executionId1 = await triggerQueryExecution('4022946');
        const executionId2 = await triggerQueryExecution('4023501');

        // Wait for 120 seconds before fetching the results
        await new Promise(res => setTimeout(res, 120000)); // 120 seconds wait

        // Fetch the results after the wait
        const data1 = await fetchQueryResults(executionId1);
        const data2 = await fetchQueryResults(executionId2);

        // Combine data
        const combinedData = data1.map(tokenRow => {
          const matchingVolumeRow = data2.find(volumeRow => volumeRow.token === tokenRow.token_address);
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

    // Set up an interval to re-trigger every 120 seconds
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
