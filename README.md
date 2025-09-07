This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


# Machine Timeline Viewer

โปรเจกต์นี้เป็นระบบแสดงผลสถานะการทำงานของเครื่องจักร (RUN / STOP / OFF) ในรูปแบบ **timeline กราฟ** โดยใช้เทคโนโลยี:

- 🟢 **React + Next.js 13+ (App Router)**
- 🟣 **Material UI (MUI)**
- ⚫ **D3.js**
- 🔵 ข้อมูลแบบ Mock (จากไฟล์ JSON)

---

## 🔧 Features

- ✅ แสดง Timeline การทำงานของเครื่องจักรแต่ละตัว
- 📅 เลือกช่วงเวลา (1-5 วัน) เพื่อโหลดข้อมูลย้อนหลัง
- ⏱ แสดงช่วงเวลาเป็นแถบสี:
  - 🟩 RUN (สีเขียว)
  - 🟥 STOP (สีแดง)
  - ⬛ M/C OFF (สีดำ)
- 📂 ดึงข้อมูลจากไฟล์ JSON ภายใน `/public/data`
- 🧪 Mock API สำหรับ JSON log
- ♻️ รีเฟรชข้อมูลด้วยปุ่ม "Load Data"

---

## 🖼 Screenshot

![Machine Timeline Screenshot](./public/screenshot.png)

---

## 📁 Project Structure

<pre>
```txt
/src
├── app
│   ├── machine-log         <-- หน้าแสดง timeline
│   └── api/json-log        <-- mock API สำหรับดึง JSON
│
├── components
│   ├── MachineItem.tsx     <-- สร้าง timeline graph
│   ├── MachineStatusBar.tsx <-- แสดงแถบสีรายสถานะ
│   └── TimeScale.tsx       <-- จัดการ scale/time axis
│
/public
└── data                    <-- JSON log ต่อวัน
``` </pre>

## JSON Log Format

ข้อมูลถูกเก็บในรูปแบบ JSON เป็น array ของเครื่องจักรแต่ละตัว (`machine`) โดยแต่ละเครื่องจะมีข้อมูล `timeline` เป็น array ของช่วงเวลาสถานะ

แต่ละช่วงเวลาจะระบุ:

- วันที่และเวลาที่เริ่ม (`start_date`, `start_time`) (เช่น "2025-08-30", "06:25:24")
- วันที่และเวลาที่สิ้นสุด (`end_date`, `end_time`) (เช่น "2025-09-01", "11:22:40")
- ค่าเวลาที่เป็น timestamp (`start_epoch`, `end_epoch`) สำหรับคำนวณช่วงเวลา
- สถานะของเครื่องจักร (`status_name`) เช่น Run, Stop, UNDEFINED

## React Timeline Page Component

ไฟล์นี้เป็น React Functional Component ที่ใช้แสดงข้อมูล Timeline ของเครื่องจักรจาก API endpoint แบบไดนามิก

🔍 สรุปฟีเจอร์หลักของหน้าเว็บนี้
| ฟีเจอร์                  | รายละเอียด                                                   |
| ------------------------ | ------------------------------------------------------------ |
| 📅 เลือกช่วงเวลา         | ผู้ใช้เลือกจำนวนวันที่จะแสดงข้อมูลได้ (1-5 วัน) จาก dropdown |
| 📥 ปุ่มโหลดข้อมูล        | ปุ่ม `Load Data` เพื่อดึงข้อมูลจาก API ตามจำนวนวัน           |
| 🧾 แสดงข้อมูลเครื่องจักร | แต่ละเครื่องจะแสดงกราฟสถานะ (RUN, STOP, M/C OFF)             |
| 📊 Timeline Header       | แสดงวันที่เริ่มต้น - วันที่สิ้นสุด ของช่วงเวลาที่เลือก       |
| 🟩🟥⬛ Legend             | อธิบายสีแต่ละสถานะของเครื่องจักร                             |
| 🔄 Loading State         | แสดง `CircularProgress` เมื่อโหลดข้อมูล                      |
| ⚠️ Error State           | แสดงข้อความผิดพลาดถ้าดึงข้อมูลล้มเหลว                        |


[Dropdown: เลือกจำนวนวัน]   [ปุ่ม Load Data]

-----------------------------------------------------
Timeline 30/08/2025 - 01/09/2025
[■ RUN] [■ STOP] [■ M/C OFF]
-----------------------------------------------------

┌────────────────────┬──────────────────────────────────────┐
│ MACHINE A          │ ███░░░███▒▒▒████... (MachineItem)     │
│ 30/08/2025 - ...   │                                      │
└────────────────────┴──────────────────────────────────────┘

┌────────────────────┬──────────────────────────────────────┐
│ MACHINE B          │ ███░░░███▒▒▒████... (MachineItem)     │
└────────────────────┴──────────────────────────────────────┘

### การทำงานหลัก

- เลือกจำนวนวันที่จะโหลดข้อมูลผ่าน dropdown (1-5 วัน)
- กดปุ่ม `Load Data` เพื่อเรียก API `/api/json-log` ด้วยพารามิเตอร์วันที่เริ่มต้นและจำนวนวัน
- แสดงแถบสถานะ Timeline ของแต่ละเครื่องจักรในช่วงวันที่เลือก
- มีการแสดงสถานะโหลดข้อมูล และแสดงข้อความ error เมื่อโหลดข้อมูลล้มเหลว
- มี Legend แสดงสีสถานะต่าง ๆ (RUN, STOP, M/C OFF)
- ใช้ Material UI สำหรับ UI components และ dayjs สำหรับจัดการวันที่

### โครงสร้าง State

| ชื่อ State  | คำอธิบาย                         |
|-------------|----------------------------------|
| `logs`      | เก็บข้อมูล timeline ของแต่ละเครื่องจักรที่โหลดมา (array ของ `GroupedMachineLog`) |
| `numDays`   | จำนวนวันที่เลือกเพื่อแสดง timeline (state หลัก)       |
| `tempNumDays` | ค่าเลือกวันที่ใน dropdown (ยังไม่อัปเดต `numDays`) |
| `loading`   | สถานะการโหลดข้อมูลจาก API       |
| `error`     | เก็บข้อความ error หากโหลดข้อมูลไม่สำเร็จ |
| `loaded`    | ตัวแปรบอกว่าโหลดข้อมูลเสร็จสมบูรณ์แล้ว (ใช้สำหรับแสดงกราฟ) |

### Props ที่ใช้ส่งเข้า `MachineItem` component

- `log`: ข้อมูล **timeline** ของเครื่องจักร (หนึ่งใน array ของ logs)
- `startDate`: วันที่เริ่มต้น (เช่น `"2025-08-30"`)
- `numDays`: จำนวนวันที่ต้องการแสดง
- `chartHeight`: ความสูงของกราฟ (ค่าเริ่มต้น: `50`)
- `startHour`: เวลาเริ่มต้นในแต่ละวัน (ค่าเริ่มต้น: `"00:00:00"`)
- `endHour`: เวลาสิ้นสุดในแต่ละวัน (ค่าเริ่มต้น: `"23:59:59"`)
- `showTooltip`: แสดง tooltip หรือไม่ (ค่าเริ่มต้น: `true`)
- `showTimeScale`: แสดง time scale (แกนเวลา) หรือไม่ (ค่าเริ่มต้น: `true`)
- `highlightRanges`: ช่วงเวลาที่ต้องการไฮไลต์ใน timeline
- `statusColorMap`: แผนที่สีสำหรับสถานะต่าง ๆ ของเครื่องจักร (ค่าเริ่มต้น: `defaultStatusColorMap`)
- `paddingLeft`: ช่องว่างด้านซ้ายของกราฟ (ค่าเริ่มต้น: `30`)
- `paddingRight`: ช่องว่างด้านขวาของกราฟ (ค่าเริ่มต้น: `30`)
- `showDuration`: แสดงเวลาช่วงสถานะ `undefined` หรือไม่ (ค่าเริ่มต้น: `true`)
- `showTotalTime`: แสดงเวลารวมของช่วง `undefined` หรือไม่ (ค่าเริ่มต้น: `false`)

### ตัวอย่างการใช้ MachineItem component:
<pre>
```tsx
<MachineItem
  log={log}
  startDate="2025-08-30"
  numDays={3}
  chartHeight={70}
  startHour="08:00:00"
  endHour="16:00:00"
  showTooltip={true}
  showTimeScale={true}
  highlightRanges={[
    { start: "10:00:00", end: "10:30:00", color: "#FF0000" }
  ]}
  statusColorMap={{
    RUN: "green",
    STOP: "red",
    UNDEFINED: "gray"
  }}
  paddingLeft={40}
  paddingRight={40}
  showDuration={true}
  showTotalTime={false}
/>
``` </pre>


### ตัวอย่างการเรียก API
GET /api/json-log?date=2025-08-30&days=3

Response ตัวอย่าง (JSON):

```json
[
  {
    "machine": "CNC-MAZ-2XN-010",
    "timeline": [
      {
        "start_date": "2025-08-30",
        "start_time": "06:25:24",
        "end_date": "2025-09-01",
        "end_time": "11:22:40",
        "start_epoch": "1756509924",
        "end_epoch": "1756700560",
        "status_name": "UNDEFINED"
      },
      {
        "start_date": "2025-09-01",
        "start_time": "11:22:40",
        "end_date": "2025-09-01",
        "end_time": "11:23:38",
        "start_epoch": "1756700560",
        "end_epoch": "1756700618",
        "status_name": "Stop"
      }
    ]
  }
]