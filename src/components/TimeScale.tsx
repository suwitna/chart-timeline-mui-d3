'use client';

import React from 'react';
import * as d3 from 'd3';
import { ScaleTime } from 'd3-scale';

//ใช้สำหรับแสดง เส้นเวลา (time axis) แบบแนวนอนใน SVG

export interface HighlightRange {
  start: string; // เช่น "10:00:00"
  end: string;   // เช่น "10:15:00"
  color?: string; // เช่น "#f9f871"
}

interface TimeScaleProps {
  width: number;               // ความกว้างของแกนเวลา (พิกเซล)
  height: number;              // ความสูงของแกนเวลา (พิกเซล)
  scale: ScaleTime<number, number>;  // d3 scale สำหรับแปลงเวลา → พิกเซล
  highlightRanges?: HighlightRange[]; // ช่วงเวลาที่ต้องการไฮไลต์ (เช่น 10:00-10:15)
  paddingLeft: number;         // ช่องว่างซ้ายของแกนเวลา
  paddingRight: number;        // ช่องว่างขวาของแกนเวลา
}

// ฟังก์ชันช่วย getLabelInterval 
function getLabelInterval(scale: ScaleTime<number, number>) {
  const pxPerHour = scale(new Date(2025, 0, 1, 1)) - scale(new Date(2025, 0, 1, 0));
  if (pxPerHour < 15) return 6;
  if (pxPerHour < 30) return 4;
  if (pxPerHour < 60) return 2;
  return 1;
}

export const TimeScale: React.FC<TimeScaleProps> = ({
  width,
  height,
  scale,
  highlightRanges = [],
  paddingLeft,
  paddingRight,
}) => {
  const parse = (d: string) => new Date(d); // 👈 Local time
  //const parse = d3.timeParse('%H:%M:%S');

  // สร้าง ticks (เช่น ทุก 1 ชั่วโมง)
  //15 Min
  const interval = d3.timeMinute.every(15);
  const ticks = interval ? scale.ticks(interval) : scale.ticks(); // ✅ fallback ถ้า interval เป็น null

  return (
    <g>
      {/* Base Line */}
      <line
        x1={paddingLeft}
        y1={height - 40}
        x2={width - paddingRight}
        y2={height - 40}
        stroke="black"
        strokeWidth={1.5}
      />

      {/* Tick Marks and Labels */}
      {ticks.map((tick, i) => {
        const x = scale(tick);
        const hourStr = d3.timeFormat('%H:%M')(tick);

        // แปลงเวลา → นาทีของวัน
        const hours = tick.getHours();
        const minutes = tick.getMinutes();
        const totalMinutes = hours * 60 + minutes;

        const labelEveryNHours = getLabelInterval(scale);

        //const isHourMark = totalMinutes % 60 === 0;
        const isQuarterMark = totalMinutes % 15 === 0;

        // เงื่อนไขแสดง label
        const isHourMark = totalMinutes % 60 === 0;
        const isShowLabel = isHourMark && (hours % labelEveryNHours === 0);

        // ความสูงของ tick line
        const tickHeight = isHourMark ? 10 : isQuarterMark ? 10 : 0;
        const tickHeightY1 = isHourMark ? 0 : isQuarterMark ? 5 : 0;

        if (tickHeight === 0) return null; // ข้าม tick ที่ไม่ใช่ hour/quarter
        return (
          <g key={i}>
            {/* Tick Line */}
            <line
              x1={x}
              y1={height - 30 - tickHeightY1}
              x2={x}
              y2={height - 30 - tickHeight}
              stroke="black"
              strokeWidth={1}
            />
            {/* Label */}
            <text
              x={x}
              y={height - 20}
              textAnchor="middle"
              fontSize={10}
              fill="black"
              style={{ userSelect: 'none' }}
            >
              {isShowLabel ? hourStr : ''}
            </text>
          </g>
        );
      })}
    </g>
  );
};

