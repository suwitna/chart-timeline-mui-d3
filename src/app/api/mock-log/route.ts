import { NextRequest, NextResponse } from 'next/server';
import {
  GroupedMachineLog,
  MachineLog,
  MACHINE_LOG_SHIFT_START,
  MACHINE_LOG_SHIFT_END
} from '@/types/machine';
import dayjs from 'dayjs';
import { mockMachineLogs } from '@/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('date') || dayjs().format('YYYY-MM-DD'); // fallback
  const numDays = parseInt(searchParams.get('days') || '1');

  const shiftStart = dayjs(`${startDate}T${MACHINE_LOG_SHIFT_START}`);
  let shiftEnd = dayjs(`${startDate}T${MACHINE_LOG_SHIFT_END}`);

  if (shiftEnd.isBefore(shiftStart)) {
    shiftEnd = shiftEnd.add(numDays, 'day');
  }

  const shiftStartStr = shiftStart.format('YYYY-MM-DD HH:mm:ss');
  const shiftEndStr = shiftEnd.format('YYYY-MM-DD HH:mm:ss');
  console.log(' Using mock data');
  console.log('shiftStartStr', shiftStartStr);
  console.log('shiftEndStr', shiftEndStr);
  console.log('startDate:', startDate);
  console.log('numDays:', numDays);

  try {
    // ใช้ mockMachineLogs ตรง ๆ โดยไม่ต้องแปลง
    const groupedLogs: GroupedMachineLog[] = mockMachineLogs;

    return NextResponse.json(groupedLogs);
  } catch (error) {
    console.error('Mock Data Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error (Mock)', error },
      { status: 500 }
    );
  }
}
