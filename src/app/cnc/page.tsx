'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { MachineItem } from '@/components/MachineItem';
import { GroupedMachineLog } from '@/types/machine';
import dayjs from 'dayjs';

export default function Page() {
  const [logs, setLogs] = useState<GroupedMachineLog[]>([]);
  const [noData, setNoData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));

  // numDays ตัวที่ใช้จริงโหลดข้อมูล
  const [numDays, setNumDays] = useState(1);

  // tempNumDays ตัวที่เก็บค่าที่เลือกใน select ก่อนกดโหลด
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempNumDays, setTempNumDays] = useState(numDays);

  const formatDateRange = (start: string, days: number) => {
    const startDay = dayjs(start);
    const endDay = startDay.add(days - 1, 'day');

    const startFormatted = startDay.format('DD/MM/YYYY');
    const endFormatted = endDay.format('DD/MM/YYYY');

    return days > 1 ? `${startFormatted} - ${endFormatted}` : startFormatted;
  };

  const fetchLogs = async (date: string, days: number) => {
    setLoading(true);
    setError('');
    setNoData(false);

    try {
      const params = new URLSearchParams({
        date,
        days: String(days),
      });

      const res = await fetch(`/api/machine-log?${params.toString()}`);
      if (!res.ok) throw new Error('Network response was not ok');

      const data = await res.json();

      if (!data || data.length === 0) {
        setNoData(true); // 👉 ไม่มีข้อมูล
        setLogs([]); // 👈 ล้าง logs เพื่อไม่ให้แสดงชาร์ตเก่า
      } else {
        setLogs(data);
      }

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
    fetchLogs(startDate, numDays);
  }, []);
  */
  // ฟังก์ชันกดปุ่ม Load Data
  const onLoadData = () => {
    setStartDate(tempStartDate);
    setNumDays(tempNumDays);
    fetchLogs(tempStartDate, tempNumDays);
  };

  return (
    <Box p={2}>
      {/* Filter */}
      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <TextField
          type="date"
          label="Start Date"
          value={tempStartDate} // <- ใช้ temp
          onChange={(e) => setTempStartDate(e.target.value)} // <- เปลี่ยน temp
          size="small"
          disabled={loading}
        />
        <TextField
          select
          label="Days"
          value={tempNumDays} // ใช้ tempNumDays ที่ยังไม่อัปเดตจริง
          onChange={(e) => setTempNumDays(Number(e.target.value))}
          size="small"
          disabled={loading}
        >
          {[...Array(7)].map((_, i) => (
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
            <Box width={20} height={15} bgcolor="#509151ff" border="1px solid #000" />
            <Typography fontSize="0.8rem">RUN</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Box width={20} height={15} bgcolor="#c9665fff" border="1px solid #000" />
            <Typography fontSize="0.8rem">STOP</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Box width={20} height={15} bgcolor="#3c3c3cff" border="1px solid #000" />
            <Typography fontSize="0.8rem">M/C OFF</Typography>
          </Box>
        </Box>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {/* No data message */}
      {noData && !loading && !error && (
        <Box
          textAlign="center"
          p={4}
          border="1px dashed #ccc"
          borderRadius={2}
          color="text.secondary"
        >
          <Typography variant="h6" gutterBottom>
            ไม่มีข้อมูล
          </Typography>
          <Typography variant="body2">
            กรุณาเลือกช่วงวันที่ที่มีข้อมูล
          </Typography>
        </Box>
      )}

      {!loading && logs.length === 0 && !error && !noData && (
        <Typography variant="body2" color="text.secondary">
          ยังไม่มีข้อมูลที่จะแสดง
        </Typography>
      )}


      {/* Graphs */}
      {!noData && logs.length > 0 && (
        <Box
          position="relative"
          p={0}
          borderRadius={0}
          sx={{ backgroundColor: '#fff', boxShadow: '0 0 8px rgba(0,0,0,0.1)' }}
        >
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
                log={log}                     // (1) ข้อมูล JSON -->(Required)
                startDate={startDate}         // (2) วันที่เริ่มต้น YYYY-MM-DD -->(Required)
                numDays={numDays}             // (3) จำนวนวันที่ต้องการ -->(Required)
                chartHeight={50}              // (4) ความสูงของตัว Timeline -->(Optional)
                startHour="08:00:00"          // (5) เวลาเริ่มต้นของวัน -->(Optional)
                endHour="08:00:00"            // (6) เวลาสิ้นสุดของวัน -->(Optional)
                showTooltip={true}            // (7) แสดงทูลทิป -->(Optional)
                showTimeScale={true}          // (8) แสดงเวลา -->(Optional)
                highlightRanges = {[          // (9) เวลาพัก -->(Optional)
                      { start: '00:00:00', end: '01:00:00', color: '#FFD600' },
                      { start: '03:00:00', end: '03:15:00', color: '#FFD600' },
                      { start: '05:00:00', end: '05:30:00', color: '#FFD600' },
                      { start: '10:00:00', end: '10:15:00', color: '#FFD600' },
                      { start: '12:00:00', end: '13:00:00', color: '#FFD600' },
                      { start: '17:00:00', end: '17:30:00', color: '#FFD600' },
                      { start: '22:00:00', end: '22:15:00', color: '#FFD600' },
                  ]}
                statusColorMap = {{           // (10) สีของสถานะต่าง -->(Optional)
                      Run: '#509151ff',
                      Stop: '#c9665fff',
                      UNDEFINED: '#3c3c3cff',
                  }}
                paddingLeft={30}              // (11) ช่องว่างกับขอบทางซ้าย -->(Optional)
                paddingRight={30}             // (12) ช่องว่ากับของทางขวา -->(Optional)
                showDuration={true}           // (13) แสดงเวลา UNDEFINED -->(Optional)
                showTotalTime={false}         // (14) เวลา UNDEFINEDม  -->(Optional)
                                              // true แสดงต่อเนื่องรวมเวลาพัก, 
                                              // false เริ่มนับใหม่หลังเวลาพัก
              />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
