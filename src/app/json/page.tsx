'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  MenuItem,
  CircularProgress,
  TextField,
} from '@mui/material';
import { MachineItem } from '@/components/MachineItem';
import { GroupedMachineLog } from '@/types/machine';
import dayjs from 'dayjs';

export default function Page() {
  const [logs, setLogs] = useState<GroupedMachineLog[]>([]);
  const [numDays, setNumDays] = useState(1); // จำนวนวันที่เลือก
  const [tempNumDays, setTempNumDays] = useState(numDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false); // ป้องกันไม่ให้แสดงกราฟจนกว่าจะโหลด

  const startDate = '2025-08-30';

  const formatDateRange = (start: string, days: number) => {
    const startDay = dayjs(start);
    const endDay = startDay.add(days - 1, 'day');
    const startFormatted = startDay.format('DD/MM/YYYY');
    const endFormatted = endDay.format('DD/MM/YYYY');
    return days > 1 ? `${startFormatted} - ${endFormatted}` : startFormatted;
  };

  const fetchLogs = async (days: number) => {
    setLoading(true);
    setError('');
    setLoaded(false);

    try {
      const params = new URLSearchParams({
        date: String(startDate),
        days: String(days),
      });

      const res = await fetch(`/api/json-log?${params.toString()}`);
      if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลได้');
      const data = await res.json();
      setLogs(data);
      setLoaded(true); // กำหนดว่าโหลดเสร็จแล้ว
    } catch (err) {
      console.error(err);
      setError('โหลดข้อมูลล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch on mount
  /*
    useEffect(() => {
      fetchLogs(numDays);
    }, []);
  */
  // ฟังก์ชันกดปุ่ม Load Data
  const onLoadData = () => {
    setNumDays(tempNumDays);  // อัปเดตค่า state
    fetchLogs(tempNumDays);   // ใช้ค่าที่กำลังจะตั้ง
  };

  return (
    <Box p={2}>
      {/* Dropdown + ปุ่มโหลด */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <TextField
          select
          label="Days"
          value={tempNumDays} // ใช้ tempNumDays ที่ยังไม่อัปเดตจริง
          onChange={(e) => setTempNumDays(Number(e.target.value))}
          size="small"
          disabled={loading}
        >
          {[...Array(5)].map((_, i) => (
            <MenuItem key={i + 1} value={i + 1}>
              {i + 1} วัน
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={onLoadData} disabled={loading}>
          {loading ? 'Loading...' : 'Load Data'}
        </Button>
      </Box>

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
          Timeline {formatDateRange(startDate, numDays)}
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

      {/* แสดง error ถ้ามี */}
      {error && (
        <Typography color="error" fontSize="0.85rem" mb={2}>
          {error}
        </Typography>
      )}

      {/* Loader Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(255,255,255,0.6)',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* แสดง logs เฉพาะเมื่อโหลดข้อมูลแล้ว */}
      {loaded && logs.map((log, i) => (
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
            padding: 0, // เอา padding ออก
            //margin: 1 // เผื่อมี margin ด้วย
            backgroundColor: '#f9f9f9',
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.3s ease',

          }}
        >
          {/* Column 1: ชื่อเครื่องและวันที่ */}
          <Box sx={{ width: 200, color: 'gray', padding: 1.5, }}>
            <Typography noWrap fontSize="0.8rem" fontWeight="bold">
              {log.machine}
            </Typography>
            <Typography fontSize="0.75rem" color="text.secondary" mt={0.3}>
              {formatDateRange(startDate, numDays)}
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
            <MachineItem
              key={i} // 🔁 force re-render
              log={log}
              startDate={startDate}
              numDays={numDays}
              showDuration={true}
              showTotalTime={false}
              showTooltip={true} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
