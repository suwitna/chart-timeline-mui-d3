# Machine Timeline Viewer

โปรเจกต์นี้เป็นระบบแสดงผลสถานะการทำงานของเครื่องจักร (RUN / STOP / OFF) ในรูปแบบ **timeline กราฟ** โดยใช้เทคโนโลยี:

- 🟢 **React + Next.js 13+ (App Router)**
- 🟣 **Material UI (MUI)**
- ⚫ **D3.js**
- 🔵 ข้อมูลแบบ Mock (จากไฟล์ JSON)

## 🔧 Features

- ✅ แสดง Timeline การทำงานของเครื่องจักรแต่ละตัว
- 📅 เลือกช่วงเวลา (เช่น 1-5 วัน) เพื่อโหลดข้อมูลย้อนหลัง
- ⏱ แสดงช่วงเวลาเป็นแถบสี:
  - 🟩 RUN (สีเขียว)
  - 🟥 STOP (สีแดง)
  - ⬛ M/C OFF (สีดำ)
- 📂 ดึงข้อมูลจากไฟล์ JSON ภายใน `/public/data`
- 🧪 มี Mock API, Status Loading, และ Error Handling
- ♻️ รีเฟรชข้อมูลด้วยปุ่ม "Load Data"

---

## 🖼 Screenshot

![Machine Timeline Screenshot](./public/screenshot.png)

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

```bash
git clone https://github.com/suwitna/chart-timeline-mui-d3.git
cd chart-timeline-mui-d3
npm install
npm run dev
```

### 📦 Install Dependency เพิ่มเติม (สำหรับใช้ Component) ในโปรเจกต์อื่น

หากนำ `MachineItem` component ไปใช้ในโปรเจกต์อื่น  
กรุณาติดตั้ง dependencies ต่อไปนี้:

```bash
npm install d3 dayjs

```
| Package     | ใช้ทำอะไร                                                |
| ----------- | -------------------------------------------------------- |
| `d3`        | ใช้สร้างกราฟ timeline (ผ่าน D3.js)                       |
| `dayjs`     | จัดการวันที่และเวลา (เบา เร็วกว่า moment.js)             |
| `@types/d3` | (เฉพาะ TypeScript) สำหรับ IntelliSense และ type-checking |

✅ หมายเหตุ:
ไม่จำเป็นต้องติดตั้ง mssql หรือ msnodesqlv8 เว้นแต่คุณต้องการดึงข้อมูลจาก SQL Server โดยตรง – โปรเจกต์นี้ใช้เพียง mock API (/api/json-log) สำหรับตัวอย่างเท่านั้น


## 📁 Project Structure

<pre>
```txt
/src
├── app
│   ├── api/machine-log
│   │       ├── api/machine-log  <-- API ดึงข้อมูลจาก MSSQL
│   │       ├── api/mock-log     <-- mock API สุ่มข้อมูล
│   │       └── api/json-log     <-- mock API สำหรับดึง JSON
│   │
│   ├── cnc/page.tsx             <-- ตัวอย่างหน้าจอติดต่อกับฐานข้อมูล
│   ├── demo/page.tsx            <-- ตัวอย่างอย่างง่าย
│   ├── json/page.tsx            <-- ตัวอย่างหน้าจอติดต่อกับ JSON log data ต่อวัน (จากข้อมูลตัวอย่าง)
│   ├── mock/page.tsx            <-- ตัวอย่างหน้าจอติดต่อกับ Mock data แบบสุ่ม
│   └── sqltest/page.tsx         <-- ทดสอบติดต่อฐานข้อมูล
│
├── components
│   ├── MachineItem.tsx          <-- สร้าง timeline graph
│   ├── MachineStatusBar.tsx     <-- แสดงแถบสีรายสถานะ เช่น Run, Stop, UNDEFINED
│   └── TimeScale.tsx            <-- จัดการ Scale/time x axis
│
├── data
│   └── mockData.ts              <-- ข้อมูลโครงสร้าง JSON, และ Config
│
├── types
│   └── machine.ts               <-- ข้อมูลโครงสร้าง JSON, และ Config
│
/public
└── data                         <-- JSON log data ต่อวัน
</pre> ```

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
    {
      start: "10:00:00",
      end: "10:30:00",
      color: "#FF0000"
    }
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
```


### ตัวอย่างการเรียก API
GET /api/json-log?date=2025-08-30&days=3

Response ตัวอย่าง (JSON):

<pre>
```json
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
</pre> ```