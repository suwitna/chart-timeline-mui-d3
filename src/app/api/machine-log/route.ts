import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import {
  GroupedMachineLog,
  MachineLog,
  MACHINE_LOG_SHIFT_START,
  MACHINE_LOG_SHIFT_END
} from '@/types/machine';
import dayjs from 'dayjs';


const sql = require('mssql')

export async function GET(request: NextRequest) {

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('date'); // ex: "2025-09-04"
  const numDays = parseInt(searchParams.get('days') || '1');

  const shiftStart = dayjs(`${startDate}T${MACHINE_LOG_SHIFT_START}`);
  let shiftEnd = dayjs(`${startDate}T${MACHINE_LOG_SHIFT_END}`);

  // ถ้าเวลาสิ้นสุดอยู่ก่อนเวลาเริ่ม (เช่น 08:00 → 06:00 ของวันถัดไป)
  shiftEnd = shiftEnd.add(numDays, 'day');

  const shiftStartStr = shiftStart.format('YYYY-MM-DD HH:mm:ss');
  const shiftEndStr = shiftEnd.format('YYYY-MM-DD HH:mm:ss');
  console.log('shiftStartStr', shiftStartStr)
  console.log('shiftEndStr', shiftEndStr)

  try {
    const pool = await connectToDatabase();
    // 1. Query เฉพาะ column ที่ต้องการ
    const result = await pool.request()
      .input('shiftStart', sql.VarChar, shiftStartStr)
      .input('shiftEnd', sql.VarChar, shiftEndStr)
      .query(`
  SELECT
    portid,
    machine,
    CONVERT(varchar, start_time, 23) AS start_date,
    CONVERT(varchar, start_time, 108) AS start_time,
    CONVERT(varchar, end_time, 23) AS end_date,
    CONVERT(varchar, end_time, 108) AS end_time,
    start_epoch,
    end_epoch,
    state,
    status_name
  FROM MachineEventLog
  WHERE NOT (
    end_time <= @shiftStart OR start_time >= @shiftEnd
  )
  ORDER BY machine, portid, start_epoch ASC;
`)


    // Log เช็คค่าต่างๆ
    console.log('startDate:', startDate);
    console.log('numDays:', numDays);
    console.log('Record count:', result.recordset.length);
    /*
    if (result.recordset.length > 0) {
      console.log('Sample record:', result.recordset[0]);
    }
    */
    // 2. ดึง raw data และ map ให้ตรงกับ MachineLog
    const rawData = result.recordset;

    const logs: MachineLog[] = rawData.map((row: MachineLog) => ({
      portid: row.portid,
      machine: row.machine,
      start_date: row.start_date,
      start_time: row.start_time,
      end_date: row.end_date,
      end_time: row.end_time,
      start_epoch: row.start_epoch,
      end_epoch: row.end_epoch,
      state: row.state,
      status_name: row.status_name,
    }));

    // 3. Group logs by machine
    const groupedMap = new Map<string, GroupedMachineLog>();

    for (const log of logs) {
      const key = log.machine;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          machine: log.machine,
          timeline: [],
        });
      }

      groupedMap.get(key)!.timeline.push(log);
    }

    const groupedLogs: GroupedMachineLog[] = Array.from(groupedMap.values());

    // 4. Return JSON
    return NextResponse.json(groupedLogs);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error },
      { status: 500 }
    );
  }
}
