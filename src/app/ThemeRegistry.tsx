// src/app/ThemeRegistry.tsx
'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React from 'react';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff', // พื้นหลังสีขาว
      paper: '#ffffff',   // พื้นหลังของกล่องหรือ card สีขาว
    },
    primary: {
      main: '#1976d2', // สีน้ำเงิน (ตามที่คุณตั้งไว้)
    },
    text: {
      primary: '#000000', // ตัวหนังสือสีดำ (ชัดเจนบนพื้นขาว)
      secondary: '#555555', // ตัวหนังสือรอง สีเทาเข้ม
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
