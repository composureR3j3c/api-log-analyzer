import { useEffect, useState } from 'react';
import { socket } from '../services/socket';

export default function LiveLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    socket.on('log.received', (log) => {
      setLogs((prev) => [log, ...prev].slice(0, 100));
    });

    return () => {
      socket.off('log.received');
    };
  }, []);

  return (
    <div>
      <h2>Live Logs</h2>

      {logs.map((log, index) => (
        <div key={index}>
          [{new Date(log.timestamp).toLocaleTimeString()}]
          {' '}
          {log.message}
        </div>
      ))}
    </div>
  );
}