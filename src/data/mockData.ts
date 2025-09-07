import {
  GroupedMachineLog,
  MachineLog,
  MachineStatus,
  MACHINE_LOG_SHIFT_START,
  MACHINE_LOG_SHIFT_END
} from '@/types/machine';

// ✅ Seeded random for consistent mock
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ✅ Random status: running / stop / off
function seededStatus(seed: number): MachineStatus {
  const r = seededRandom(seed);
  if (r < 0.33) return 'Run';
  else if (r < 0.66) return 'Stop';
  return 'UNDEFINED';
}

// ✅ Add minutes to a Date
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function nextDay(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function splitDateTime(datetime: string): { date: string; time: string } {
  const [date, timeWithMs] = datetime.split('T');
  const time = timeWithMs.split('.')[0]; // ตัด milliseconds
  return { date, time };
}

function generate2DayTimeline(index: number, startDate: string): MachineLog[] {
  const withDate = (dateStr: string, time: string): Date => new Date(`${dateStr}T${time}Z`);
  const timeline: MachineLog[] = [];
  const totalDays = 2;
  const startHour = MACHINE_LOG_SHIFT_START;
  const endHour = MACHINE_LOG_SHIFT_END;

  for (let day = 0; day < totalDays; day++) {
    const sDate = nextDay(startDate, day);
    const eDate = nextDay(startDate, day + 1);
    let current = withDate(sDate, startHour);
    const dayEnd = withDate(eDate, endHour);
    let blockCount = 0;

    while (current < dayEnd) {
      const seed = index * 1000 + day * 100 + blockCount;

      const segmentMinutes = 5 + Math.floor(seededRandom(seed) * 11);
      const next = addMinutes(current, segmentMinutes);
      const end = next > dayEnd ? new Date(dayEnd) : next;
      const status = seededStatus(seed);

      const { date: startDateStr, time: startTimeStr } = splitDateTime(current.toISOString());
      const { date: endDateStr, time: endTimeStr } = splitDateTime(end.toISOString());

      // ❌ ข้ามช่วงที่แทรกไว้ (07:45 - 08:15) เพื่อไม่ซ้อน
      timeline.push({
          portid: 1000 + blockCount,               // หรือจะใช้ seed ก็ได้
          machine: `CNC-MACHINE-${index}`, // หรือส่งมาเป็นพารามิเตอร์ก็ได้
          start_date: startDateStr,
          start_time: startTimeStr,
          end_date: endDateStr,
          end_time: endTimeStr,
          start_epoch: Math.floor(current.getTime() / 1000),
          end_epoch: Math.floor(end.getTime() / 1000),
          state: 'CLOSED', // หรือ 'OPEN'/'CLOSED'
          status_name: status,
      });
      

      current = end;
      blockCount++;
    }
  }

  return timeline;
}


// ✅ Generate 2 machines
export const mockMachineLogs: GroupedMachineLog[] = Array.from({ length: 5 }, (_, i) => ({
  machine: `CNC-MACHINE-${(i).toString().padStart(3, '0')}`,
  timeline: generate2DayTimeline(i, '2025-09-01'),
}));
