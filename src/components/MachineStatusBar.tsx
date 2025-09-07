'use client';

import React from 'react';
import * as d3 from 'd3';
import { MachineStatus } from '@/types/machine';
import { ScaleTime } from 'd3-scale';
import dayjs from 'dayjs';

interface MachineStatusBarProps {
  startDate: string; // วันที่เริ่ม
  startTime: string; // เวลาเริ่ม
  endDate: string;   // วันที่จบ
  endTime: string;   // เวลาจบ
  status: MachineStatus; // สถานะ (RUN/STOP/UNDEFINED)
  scale: ScaleTime<number, number>; // D3 scale สำหรับแปลงเวลาเป็นตำแหน่ง X
  height: number; // ความสูงของแถบ
  color: string; // สีของแถบตามสถานะ
  xOffset?: number; // การเลื่อนแกน X (default = 0)
  yOffset?: number; // การเลื่อนแกน Y (default = 0)
  showTooltip?: boolean; // แสดง tooltip หรือไม่
  onMouseMove?: (e: React.MouseEvent<SVGRectElement, MouseEvent>) => void; // ฟังก์ชันเมื่อ hover
  onMouseLeave?: () => void; // ฟังก์ชันเมื่อออกจาก hover
}

export const MachineStatusBar: React.FC<MachineStatusBarProps> = ({
  startDate,
  startTime,
  endDate,
  endTime,
  status,
  scale,
  height,
  color,
  xOffset = 0,
  yOffset = 0,
  showTooltip = true,
  onMouseMove,
  onMouseLeave,
}) => {
  // รวมวันที่ + เวลา เป็น Date object
  const combineDateTime = (dateStr: string, time: string): Date => new Date(`${dateStr}T${time}`);

  const start = combineDateTime(startDate, startTime);
  const end = combineDateTime(endDate, endTime);

  // เช็คความถูกต้องของข้อมูล
  if (
    !start || !end ||
    isNaN(start.getTime()) || isNaN(end.getTime()) ||
    !startTime || !endTime
  ) return null;

  const domainStart = scale.domain()[0];  // เวลาเริ่มของกราฟ
  const domainEnd = scale.domain()[1];    // เวลาสิ้นสุดของกราฟ

  // ถ้าทั้ง block อยู่นอกช่วงกราฟ (ก่อนหรือหลังเวลาทั้งหมด) → ไม่ต้องวาด
  if (end <= domainStart || start >= domainEnd) {
    console.log('SKIP BLOCK', {
      start: start.toLocaleString(),
      end: end.toLocaleString(),
      domainStart: domainStart.toLocaleString(),
      domainEnd: domainEnd.toLocaleString()
    });
    // นอกช่วงทั้งหมด → ไม่วาดเลย
    return null;
  }

  // ผ่านตรงนี้ จะ clamp ให้เฉพาะส่วนที่ซ้อนกับ shift
  // ถ้าข้อมูลบางส่วนอยู่นอกช่วง → ให้ clamp ให้แสดงเฉพาะส่วนที่อยู่ในช่วง
  const clampedStart = start < domainStart ? domainStart : start;
  const clampedEnd = end > domainEnd ? domainEnd : end;

  // คำนวณตำแหน่ง X จากเวลา (ผ่าน scale)
  const startX = scale(clampedStart);
  const endX = scale(clampedEnd);
  const width = endX - startX;

  if (width <= 0) return null; // ถ้าความกว้าง <= 0 ไม่ต้องวาด
  

  return (
    <rect
      x={startX + xOffset}
      y={yOffset}
      width={width}
      height={height}
      fill={color}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {showTooltip && (
        <title>
          {`${dayjs(startDate).format('DD/MM/YYYY')} ${startTime} – ${dayjs(endDate).format('DD/MM/YYYY')} ${endTime} (${status})`}
        </title>
      )}
    </rect>
  );
};
