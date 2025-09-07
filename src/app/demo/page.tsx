'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { MachineItem } from '@/components/MachineItem';
import { GroupedMachineLog } from '@/types/machine';
import dayjs from 'dayjs';

const formatDateRange = (start: string, days: number) => {
    const startDay = dayjs(start);
    const endDay = startDay.add(days - 1, 'day');
    const startFormatted = startDay.format('DD/MM/YYYY');
    const endFormatted = endDay.format('DD/MM/YYYY');
    return days > 1 ? `${startFormatted} - ${endFormatted}` : startFormatted;
  };

export default function DemoPage() {
  const [logs, setLogs] = useState<GroupedMachineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const startDate = '2025-08-30';
  const numDays = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          date: startDate,
          days: String(numDays),
        });

        const res = await fetch(`/api/json-log?${params.toString()}`);
        if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');

        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setError('❌ โหลดข้อมูลล้มเหลว');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" p={2}>
        {error}
      </Typography>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        🧪 Timeline (โหลดจาก API)
      </Typography>

      {logs.map((log, i) => (
        <Box
          key={i}
          display="flex"
          alignItems="stretch"
          gap={2}
          mb={2}
          sx={{
            minHeight: 100,
            border: '1px solid #ccc',
            borderRadius: 1,
            backgroundColor: '#f9f9f9',
          }}
        >
          {/* Column 1: ชื่อเครื่อง */}
          <Box sx={{ width: 200, padding: 1.5, color: 'gray' }}>
            <Typography noWrap fontSize="0.8rem" fontWeight="bold">
              {log.machine}
            </Typography>
            <Typography fontSize="0.75rem" color="text.secondary" mt={0.3}>
              {formatDateRange(startDate, numDays)}
            </Typography>
          </Box>

          {/* Column 2: กราฟ timeline */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            <MachineItem
              log={log}                     // (1) ข้อมูล JSON
              startDate={startDate}         // (2) วันที่เริ่มต้น YYYY-MM-DD
              numDays={numDays}             // (3) จำนวนวันที่ต้องการ 
              chartHeight={50}              // (4) ความสูงของตัว Timeline
              startHour="08:00:00"          // (5) เวลาเริ่มต้นของวัน
              endHour="08:00:00"            // (6) เวลาสิ้นสุดของวัน
              showTooltip={true}            // (7) แสดงทูลทิป
              showTimeScale={true}          // (8) แสดงเวลา
              highlightRanges = {[          // (9) เวลาพัก
                    { start: '00:00:00', end: '01:00:00', color: '#FFD600' },
                    { start: '03:00:00', end: '03:15:00', color: '#FFD600' },
                    { start: '05:00:00', end: '05:30:00', color: '#FFD600' },
                    { start: '10:00:00', end: '10:15:00', color: '#FFD600' },
                    { start: '12:00:00', end: '13:00:00', color: '#FFD600' },
                    { start: '17:00:00', end: '17:30:00', color: '#FFD600' },
                    { start: '22:00:00', end: '22:15:00', color: '#FFD600' },
                ]}
              statusColorMap = {{           // (10) สีของสถานะต่าง
                    Run: '#509151ff',
                    Stop: '#c9665fff',
                    UNDEFINED: '#3c3c3cff',
                }}
              paddingLeft={30}              // (11) ช่องว่างกับขอบทางซ้าย
              paddingRight={30}             // (12) ช่องว่ากับของทางขวา
              showDuration={true}           // (13) แสดงเวลา UNDEFINED
              showTotalTime={false}         // (14) เวลา UNDEFINEDม 
                                            // true แสดงต่อเนื่องรวมเวลาพัก, 
                                            // false เริ่มนับใหม่หลังเวลาพัก
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
