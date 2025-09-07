import { NextRequest, NextResponse } from 'next/server';
import {
  GroupedMachineLog,
  MACHINE_LOG_SHIFT_START,
  MACHINE_LOG_SHIFT_END,
} from '@/types/machine';
import dayjs from 'dayjs';
import path from 'path';
import { readFileSync } from 'fs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('date') || dayjs().format('YYYY-MM-DD');
  const numDays = parseInt(searchParams.get('days') || '1');

  const shiftStart = dayjs(`${startDate}T${MACHINE_LOG_SHIFT_START}`);
  let shiftEnd = dayjs(`${startDate}T${MACHINE_LOG_SHIFT_END}`);

  if (shiftEnd.isBefore(shiftStart)) {
    shiftEnd = shiftEnd.add(numDays, 'day');
  }

  const shiftStartStr = shiftStart.format('YYYY-MM-DD HH:mm:ss');
  const shiftEndStr = shiftEnd.format('YYYY-MM-DD HH:mm:ss');

  console.log('Reading local JSON directly with fs');
  console.log('shiftStartStr', shiftStartStr);
  console.log('shiftEndStr', shiftEndStr);
  console.log('startDate:', startDate);
  console.log('numDays:', numDays);

  try {
    const fileName = `${startDate.replace(/-/g, '')}_${numDays}.json`;

    // ชี้ path ไปยัง data/json/
    const filePath = path.join(process.cwd(), 'public', 'data', fileName);
    console.log('fileName:', fileName);
    console.log('filePath:', filePath);

    const fileContent = readFileSync(filePath, 'utf-8');
    const groupedLogs: GroupedMachineLog[] = JSON.parse(fileContent);

    return NextResponse.json(groupedLogs);
  } catch (error) {
    console.error('File Read Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error (File Read)', error: String(error) },
      { status: 500 }
    );
  }
}
