'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { MachineItem } from '@/components/MachineItem';
import { GroupedMachineLog } from '@/types/machine';
import dayjs from 'dayjs';

export default function Page() {
  const [logs, setLogs] = useState<GroupedMachineLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDateRange = (start: string, days: number) => {
    const startDay = dayjs(start);
    const endDay = startDay.add(days - 1, 'day');

    const startFormatted = startDay.format('DD/MM/YYYY');
    const endFormatted = endDay.format('DD/MM/YYYY');

    return days > 1 ? `${startFormatted} - ${endFormatted}` : startFormatted;
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/mock-log`);

      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch on mount
  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Box p={2}>
      {/* Header timeline + Legend */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        border="1px solid #ccc"
        borderRadius={1}
        mb={2}
        p={1}
        sx={{ backgroundColor: '#f0f0f0' }}
      >
        <Typography variant="h6" fontWeight="bold">
          Timeline DD/MM/YYYY
        </Typography>

        {/* Legend */}
        <Box display="flex" alignItems="center" gap={4} mt={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={20} height={15} bgcolor="green" border="1px solid #000" />
            <Typography fontSize="0.8rem">RUN</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Box width={20} height={15} bgcolor="red" border="1px solid #000" />
            <Typography fontSize="0.8rem">STOP</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Box width={20} height={15} bgcolor="black" border="1px solid #000" />
            <Typography fontSize="0.8rem">M/C OFF</Typography>
          </Box>
        </Box>
      </Box>
      {/* ✅ Always render logs */}
      {logs.map((log, i) => (
        <Box
          key={i}
          display="flex"
          alignItems="stretch"
          gap={2}
          flexWrap="nowrap"
          mb={2}
          sx={{
            minHeight: 100,
            border: '1px solid #ccc',
            borderRadius: 1,
            padding: 1,
            backgroundColor: '#f9f9f9',
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          {/* Column 1: ชื่อเครื่องและวันที่ */}
          <Box sx={{ width: 200, color: 'gray' }}>
            <Typography noWrap fontSize="0.8rem" fontWeight="bold">
              {log.machine}
            </Typography>
            <Typography fontSize="0.75rem" color="text.secondary" mt={0.3}>
              {formatDateRange('2025-09-01', 2)}
            </Typography>
          </Box>

          {/* Column 2: กราฟ */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            <MachineItem log={log} startDate={'2025-09-01'} numDays={2} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
