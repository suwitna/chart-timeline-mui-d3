'use client';

import { useEffect, useState } from 'react';
import { GroupedMachineLog } from '@/types/machine';

export default function MachineLogs() {
  const [logs, setLogs] = useState<GroupedMachineLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/machine-log?date=2025-09-01&days=1')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          console.error('API returned non-array:', data);
          setLogs([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Machine Logs</h1>
      {logs.length === 0 ? (
        <p>No data available</p>
      ) : (
        logs.map((group) => (
          <div key={group.machine} style={{ marginBottom: '2rem' }}>
            <h2>Machine: {group.machine}</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Port ID</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(group.timeline) && group.timeline.map((log, i) => (
                  <tr key={i}>
                    <td>{log.portid}</td>
                    <td>{log.start_time}</td>
                    <td>{log.end_time}</td>
                    <td>{log.status_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}