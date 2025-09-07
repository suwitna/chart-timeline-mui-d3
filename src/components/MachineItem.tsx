'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MachineStatusBar } from '@/components/MachineStatusBar';
import { TimeScale } from '@/components/TimeScale';

import {
    GroupedMachineLog,
    MachineStatus,
    StatusColorMap,
    defaultStatusColorMap,
    defaultHighlightRanges,
    HighlightRange,
    MACHINE_LOG_SHIFT_START,
    MACHINE_LOG_SHIFT_END,
} from '@/types/machine';
import dayjs from 'dayjs';

//ใช้ D3 Scale ควบคุมการแมพเวลา → พิกัดบนหน้าจอ
//รองรับ Highlight ช่วงเวลา, แสดง Tooltip, และ ตัดช่วงเวลาที่อยู่ใน Highlight
//ออกแบบให้ responsive โดยใช้ ResizeObserver
//รองรับ shift ที่ ข้ามวัน
//แยกแสดง label เวลาเฉพาะ block undefined ที่มีขนาดพอเหมาะ

// Props ที่รับเข้ามา เพื่อควบคุมพฤติกรรมของ Component
interface MachineItemProps {
    // ข้อมูล log ของเครื่องจักร
    log: GroupedMachineLog;

    // วันเริ่มต้นของช่วงเวลาที่ต้องแสดง
    startDate: string; // ← รับเข้ามา

    // จำนวนวันที่จะให้แสดงข้อมูล
    numDays: number;   // ← รับเข้ามา

    // Optional: ความกว้าง/สูงของกราฟ
    chartWidth?: number;
    chartHeight?: number;
    leftColWidth?: number;

    // Optional: เวลาเริ่มต้น 08:00:00 /สิ้นสุดของ 08:00:00 ของอีกวัน
    startHour?: string; // 'HH:mm:ss'
    endHour?: string;   // 'HH:mm:ss'

    // ควบคุมการแสดง tooltip, time scale, สี, highlight, padding, label ฯลฯ
    showTooltip?: boolean;
    showTimeScale?: boolean;
    statusColorMap?: Record<MachineStatus, string>;
    highlightRanges?: HighlightRange[];
    paddingLeft?: number;
    paddingRight?: number;

    //แสดงเวลา undefined : true นับต่อเนื่อง, false เริ่มนับใหม่หลังเบล็ค
    showDuration?: boolean;
    showTotalTime?: boolean;
}

// ฟังก์ชันช่วยแปลงสถานะเป็น emoji แสดงใน tooltip
const getStatusIcon = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'run':
            return '🟢';
        case 'stop':
            return '🔴';
        case 'undefined':
            return '⚫';
        default:
            return '❓';
    }
};

// แปลง Date เป็นรูปแบบ YYYY-MM-DD
function formatDateLocal(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// ตรวจสอบว่า end time ข้ามวันจาก start time หรือไม่ (เช่น 20:00 → 04:00)
function isShiftEndNextDay(baseDate: string, startTime: string, endTime: string): boolean {
    const start = new Date(`${baseDate}T${startTime}`);
    const end = new Date(`${baseDate}T${endTime}`);
    return end <= start;
}

// ฟังก์ชันตัดเวลา undefined ที่อยู่ในช่วง highlight ออก เพื่อแสดง label เฉพาะช่วงเวลาที่เหลือ
const subtractHighlightRanges = (
    start: Date,
    end: Date,
    highlights: HighlightRange[],
    shiftStart: Date,
    shiftEnd: Date
): { from: Date; to: Date; durationSec: number }[] => {
    let segments: { from: Date; to: Date; durationSec: number }[] = [];
    let currentStart = new Date(Math.max(start.getTime(), shiftStart.getTime()));

    const dayCount = Math.ceil(
        (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    const allHighlights: { hlStart: Date; hlEnd: Date }[] = [];

    for (let d = 0; d <= dayCount; d++) {
        const day = new Date(shiftStart.getTime() + d * 86400000);
        const dateStr = formatDateLocal(day); // ใช้ local date string

        highlights.forEach((hl) => {
            const hlStart = new Date(`${dateStr}T${hl.start}`);
            const hlEnd = new Date(`${dateStr}T${hl.end}`);
            allHighlights.push({ hlStart, hlEnd });
        });
    }

    allHighlights.sort((a, b) => a.hlStart.getTime() - b.hlStart.getTime());

    for (const { hlStart, hlEnd } of allHighlights) {
        if (hlEnd <= currentStart || hlStart >= end) continue;

        if (hlStart > currentStart) {
            const to = new Date(Math.min(hlStart.getTime(), end.getTime()));
            segments.push({
                from: currentStart,
                to,
                durationSec: (to.getTime() - currentStart.getTime()) / 1000,
            });
        }

        currentStart = new Date(Math.max(currentStart.getTime(), hlEnd.getTime()));
        if (currentStart >= end) break;
    }

    if (currentStart < end) {
        segments.push({
            from: currentStart,
            to: end,
            durationSec: (end.getTime() - currentStart.getTime()) / 1000,
        });
    }

    return segments;
};

export const MachineItem: React.FC<MachineItemProps> = ({
    log,
    startDate,
    numDays,
    chartHeight = 50,
    startHour = MACHINE_LOG_SHIFT_START,
    endHour = MACHINE_LOG_SHIFT_END,
    showTooltip = true,
    showTimeScale = true,
    highlightRanges = defaultHighlightRanges,
    statusColorMap = defaultStatusColorMap,
    paddingLeft = 30,
    paddingRight = 30,
    showDuration = true,
    showTotalTime = false,
}) => {

    // State สำหรับเก็บความกว้างของ container ที่ปรับตาม responsive
    const [width, setWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // ตรวจสอบว่า shift ข้ามวันไหม เพื่อใช้คำนวณ endDate ให้ถูกต้อง
    const shiftday = isShiftEndNextDay(startDate, MACHINE_LOG_SHIFT_START, MACHINE_LOG_SHIFT_END);
    const addDays = (!shiftday && numDays === 1) ? 0 : numDays;
    console.log('shiftday:', shiftday, ' addDays:', addDays);

    // ฟังก์ชันสร้าง Date จาก date string + time string
    const combineDateTime = (dateStr: string, time: string): Date => new Date(`${dateStr}T${time}`);

    // สร้างช่วงเวลา shift จริงที่ใช้ใน scale
    const s = combineDateTime(startDate, startHour);  // 2025-09-03T00:00:00Z

    const endDateObj = new Date(s);
    endDateObj.setDate(endDateObj.getDate() + addDays);
    const endDate = formatDateLocal(endDateObj);

    const e = combineDateTime(endDate, endHour);    // 2025-09-04T23:59:59Z

    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        content: string;
    } | null>(null);

    // ResizeObserver – ตรวจจับความกว้างของ Container แบบ Responsive
    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const newWidth = entry.contentRect.width;
                setWidth(newWidth); // Trigger re-render
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!log || !startDate || !numDays) return;

        console.log('MachineItem loaded:', {
            machine: log.machine,
            numBlocks: log.timeline.length,
            startDate,
            numDays
        });

        // หรือทำสิ่งอื่น ๆ เช่น เตรียมข้อมูลล่วงหน้า, คำนวณ analytics, แจ้ง parent ว่าโหลดเสร็จ ฯลฯ
    }, [log, startDate, numDays]);


    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        return <div>Invalid startHour or endHour format</div>;
    }

    // ใช้ D3 Scale เพื่อ map เวลา → ตำแหน่ง X บนหน้าจอ
    const scale = d3.scaleUtc()
        .domain([s, e])
        .range([paddingLeft, width - paddingRight]);
    const totalHeight = chartHeight + 45;

    return (
        <div ref={containerRef} style={{ display: 'flex', width: '100%', position: 'relative', }}>
            <svg width={width} height={totalHeight} style={{ height: '100%', }}>
                <g transform="translate(0, 0)">

                    {/* Highlight Background Blocks */}
                    {highlightRanges.flatMap((range, i) => {
                        const highlights: JSX.Element[] = [];

                        // คำนวณจำนวนวันระหว่าง startDate กับ endDate
                        const dayCount =
                            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                            (1000 * 60 * 60 * 24) +
                            1;

                        for (let d = 0; d < dayCount; d++) {
                            const currentDay = new Date(new Date(startDate).getTime() + d * 86400000); // 86400000 = ms/day
                            const dateStr = formatDateLocal(currentDay); // ใช้ local date string

                            const startTime = combineDateTime(dateStr, range.start);
                            const endTime = combineDateTime(dateStr, range.end);

                            if (
                                !startTime || !endTime ||
                                isNaN(startTime.getTime()) || isNaN(endTime.getTime()) ||
                                endTime <= s || startTime >= e
                            )
                                continue;

                            const x = scale(startTime);
                            const width = scale(endTime) - scale(startTime);

                            highlights.push(
                                <rect
                                    key={`${i}-${d}`}
                                    x={x}
                                    y={0}
                                    width={width}
                                    height={totalHeight}
                                    fill={range.color || 'yellow'}
                                    opacity={0.6}
                                />
                            );
                        }

                        return highlights;
                    })}

                </g>
                <g transform="translate(0, 8)">

                    {/* Status Bars */}
                    {log.timeline.map((block, i) => (
                        <MachineStatusBar
                            key={i}
                            startDate={block.start_date}
                            startTime={block.start_time}
                            endDate={block.end_date}
                            endTime={block.end_time}
                            status={block.status_name as MachineStatus}
                            scale={scale}
                            height={chartHeight}
                            color={StatusColorMap[block.status_name as MachineStatus]} // ใช้ status_name เพื่อแม็ปสี
                            xOffset={0}
                            yOffset={0}
                            showTooltip={false}
                            onMouseMove={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                                const rect = containerRef.current?.getBoundingClientRect();
                                if (!rect) return;

                                // คำนวณตำแหน่ง x กลางของ block
                                const blockStart = scale(new Date(`${block.start_date}T${block.start_time}`));
                                const blockEnd = scale(new Date(`${block.end_date}T${block.end_time}`));
                                const blockMid = (blockStart + blockEnd) / 2;

                                // คำนวณตำแหน่ง Y กลางของบล็อก (vertical center)
                                // สมมติว่าแต่ละแถวของบล็อกมีตำแหน่งบน (blockTop) และความสูง (blockHeight)
                                // ตัวอย่างเช่น:
                                const blockTop = 0; // ตำแหน่ง top ของแถบบล็อก
                                const blockHeight = chartHeight // ความสูงของแถบบล็อก
                                const blockMidY = blockTop + blockHeight / 2;

                                setTooltip({
                                    x: e.pageX - rect.left + 10, // หรือตามเมาส์ e.pageX - rect.left
                                    //y: e.pageY - rect.top + 10,
                                    y: blockMidY,
                                    content: `${getStatusIcon(block.status_name)} ${block.status_name}\n${dayjs(block.start_date).format('DD/MM/YYYY')} ${block.start_time} → ${dayjs(block.end_date).format('DD/MM/YYYY')} ${block.end_time}`,
                                });
                            }}
                            onMouseLeave={() => setTooltip(null)}
                        />
                    ))}

                    {/* Time Scale, TimeScale ด้านล่างของแผนภูมิ*/}
                    {showTimeScale && (
                        <g transform={`translate(0, ${chartHeight})`}>
                            <TimeScale
                                scale={scale}
                                width={width}
                                paddingLeft={paddingLeft}
                                paddingRight={paddingRight}
                                height={45}
                            />
                        </g>
                    )}

                    {/* Label on Undefined blocks, แสดง Duration Text เฉพาะช่วง undefined (ตามเงื่อนไข)*/}
                    {showDuration ? log.timeline.map((block, i) => {
                        if (showTotalTime) {
                            // แสดง label 1 อันต่อ block ที่เป็น 'undefined'
                            // คำนวณจาก start-end ของ block (หลัง limit ตาม scale.domain())

                            if (block.status_name.toLowerCase() !== 'undefined') return null;

                            const rawStart = new Date(`${block.start_date}T${block.start_time}`);
                            const rawEnd = new Date(`${block.end_date}T${block.end_time}`);

                            // 👇 Limit start time if it’s before visible range
                            const start = rawStart < scale.domain()[0] ? scale.domain()[0] : rawStart;
                            const end = rawEnd > scale.domain()[1] ? scale.domain()[1] : rawEnd;

                            const xStart = scale(start);
                            const xEnd = scale(end);
                            const width = xEnd - xStart;

                            if (width <= 20) return null; // 👈 small block, skip label

                            const centerX = xStart + width / 2;

                            const durationSec = (end.getTime() - start.getTime()) / 1000;
                            const hours = Math.floor(durationSec / 3600);
                            const minutes = Math.floor((durationSec % 3600) / 60);
                            const seconds = Math.floor(durationSec % 60);

                            const durationStr =
                                hours > 0
                                    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                                    : `${minutes}:${seconds.toString().padStart(2, '0')}`;

                            return (
                                <text
                                    key={`label-${i}`}
                                    x={centerX}
                                    y={chartHeight / 2 + 5} // center vertically
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    fill="white"
                                    fontSize={12}
                                    fontWeight="bold"
                                    pointerEvents="none"
                                >
                                    {durationStr}
                                </text>
                            );
                        } else {
                            // แสดง label แบบหักช่วง highlight ออกก่อน
                            // ใช้ subtractHighlightRanges(...) เพื่อคำนวณ "ช่วงที่ไม่ถูก highlight"
                            // อาจแสดงได้หลาย label ต่อ block
                            if (block.status_name.toLowerCase() !== 'undefined') return null;

                            const rawStart = new Date(`${block.start_date}T${block.start_time}`);
                            const rawEnd = new Date(`${block.end_date}T${block.end_time}`);

                            const correctedStart = new Date(Math.max(rawStart.getTime(), s.getTime()));
                            const correctedEnd = new Date(Math.min(rawEnd.getTime(), e.getTime())); // e = shift end

                            //const parts = subtractHighlightRanges(rawStart, rawEnd, highlightRanges, block.start_date);
                            const parts = subtractHighlightRanges(
                                correctedStart,
                                correctedEnd,
                                highlightRanges,
                                s,  // shift start
                                e   // shift end
                            );

                            return parts.map((segment, idx) => {
                                const xStart = scale(segment.from);
                                const xEnd = scale(segment.to);
                                const width = xEnd - xStart;
                                if (width < 20) return null;

                                const centerX = xStart + width / 2;

                                const h = Math.floor(segment.durationSec / 3600);
                                const m = Math.floor((segment.durationSec % 3600) / 60);
                                const label = h > 0 ? `${h}:${m.toString().padStart(2, '0')}` : `0:${m}`;

                                return (
                                    <text
                                        key={`undef-${i}-${idx}`}
                                        x={centerX}
                                        y={chartHeight / 2 + 5}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        fill="white"
                                        fontSize={12}
                                        fontWeight="bold"
                                        pointerEvents="none"
                                    >
                                        {label}
                                    </text>
                                );
                            });
                        }
                    }) : ''}
                </g>
            </svg>

            {/* Tooltip HTML ต้องอยู่นอก <svg> */}
            {showTooltip && tooltip && (() => {
                const tooltipWidth = 350;
                const tooltipPadding = 10;

                // ปรับ X
                const tooltipX =
                    tooltip.x + tooltipWidth > width
                        ? tooltip.x - tooltipWidth - tooltipPadding
                        : tooltip.x;


                return (
                    <div
                        style={{
                            position: 'absolute',
                            top: tooltip.y,
                            left: tooltipX,
                            background: 'rgba(46, 46, 46, 0.85)',
                            color: '#fff',
                            border: '1px solid #999',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            padding: '6px 30px',
                            borderRadius: 4,
                            fontSize: 12,
                            whiteSpace: 'pre-line',
                            pointerEvents: 'none',
                            zIndex: 10,
                            maxWidth: `${tooltipWidth}px`,
                            height: '60px',
                        }}
                    >
                        {tooltip.content}
                    </div>
                );
            })()}


        </div>
    );
};
