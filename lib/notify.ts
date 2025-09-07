// lib/notify.ts
'use client';

import { toast } from 'react-toastify';

export const notifySuccess = (m: string) => toast.success(m);
export const notifyError = (m: string) => toast.error(m);
export const notifyInfo = (m: string) => toast.info(m);
