// src/types/machine.ts

export const MACHINE_LOG_SHIFT_START = '08:00:00';
export const MACHINE_LOG_SHIFT_END = '08:00:00'; // ของวันถัดไป

export type MachineStatus = 'Run' | 'Stop' | 'UNDEFINED';

export const defaultStatusColorMap: Record<MachineStatus, string> = {
    Run: '#4caf50',
    Stop: '#f44336',
    UNDEFINED: '#212121',
};

export const defaultHighlightRanges = [
    { start: '00:00:00', end: '01:00:00', color: '#FFD600' },
    { start: '03:00:00', end: '03:15:00', color: '#FFD600' },
    { start: '05:00:00', end: '05:30:00', color: '#FFD600' },
    { start: '10:00:00', end: '10:15:00', color: '#FFD600' },
    { start: '12:00:00', end: '13:00:00', color: '#FFD600' },
    { start: '17:00:00', end: '17:30:00', color: '#FFD600' },
    { start: '22:00:00', end: '22:15:00', color: '#FFD600' },
];

export interface MachineLog {
  //id?: number; // optional
  portid: number;
  machine: string;
  start_date: string;  // 'yyyy-mm-dd'
  start_time: string;  // 'HH:mm:ss'
  end_date: string;    // 'yyyy-mm-dd'
  end_time: string;    // 'HH:mm:ss'
  start_epoch: number;
  end_epoch: number;
  state: string;
  status_name: string;
}

export interface GroupedMachineLog {
  machine: string;
  timeline: MachineLog[];
}

export interface HighlightRange {
    start: string; // 'HH:mm:ss'
    end: string;   // 'HH:mm:ss'
    color?: string;
}

/*
[
  {
    "machine": "CNC-MAZ-2XN-010",
    "timeline": [
      {
        "portid": 188,
        "machine": "CNC-MAZ-2XN-010",
        "start_date": "2025-08-30",
        "start_time": "00:01:34",
        "end_date": "2025-08-30",
        "end_time": "01:07:10",
        "start_epoch": "1756486894",
        "end_epoch": "1756490830",
        "state": "CLOSED",
        "status_name": "Stop"
      },
      ...
    ]
  },
  ...
]

*/