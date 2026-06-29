import type { UserDoc } from '../types/collections';

// Used when Firebase is unavailable or NEXT_PUBLIC_FIREBASE_API_KEY is not set.

export const DEMO_CITIZEN: Omit<UserDoc, 'createdAt' | 'updatedAt'> = {
  uid: 'demo-citizen-001',
  email: 'citizen@demo.cityspell',
  name: 'Priya Sharma',
  displayName: 'Priya Sharma',
  role: 'citizen',
  wardId: 'ward_22',
  ward: 'Koramangala',
  phone: '+919876543210',
  photoURL: undefined,
  avatarUrl: undefined,
  verified: true,
  departmentId: undefined,
  lastLogin: undefined,
  notificationPreferences: { email: true, push: true, sms: false },
  stats: { issuesReported: 12, issuesResolved: 9, reputationScore: 87 },
};

export const DEMO_AUTHORITY: Omit<UserDoc, 'createdAt' | 'updatedAt'> = {
  uid: 'demo-authority-001',
  email: 'authority@demo.cityspell',
  name: 'Rajesh Kumar',
  displayName: 'Rajesh Kumar',
  role: 'authority',
  wardId: '',
  ward: undefined,
  phone: '+918888888888',
  photoURL: undefined,
  avatarUrl: undefined,
  verified: true,
  departmentId: 'dept_pwd',
  lastLogin: undefined,
  notificationPreferences: { email: true, push: true, sms: true },
  stats: { issuesReported: 0, issuesResolved: 47, reputationScore: 95 },
};

export function getDemoProfileForEmail(email: string): Omit<UserDoc, 'createdAt' | 'updatedAt'> {
  if (email.toLowerCase().includes('authority') || email.toLowerCase().includes('official')) {
    return DEMO_AUTHORITY;
  }
  return DEMO_CITIZEN;
}

export function getDemoProfileForPhone(phone: string): Omit<UserDoc, 'createdAt' | 'updatedAt'> {
  if (phone === DEMO_AUTHORITY.phone) return DEMO_AUTHORITY;
  return DEMO_CITIZEN;
}

// In demo mode, accept any 6-digit code (or "123456").
export function isDemoOtpValid(otp: string): boolean {
  return otp.length === 6 && /^\d{6}$/.test(otp);
}
