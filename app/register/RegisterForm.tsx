'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= currentYear - 120; y--) {
    years.push(y);
  }
  return years;
}

function getDaysInMonth(month: number, year: number) {
  if (month < 1 || month > 12) return 31;
  const last = new Date(year, month, 0);
  return last.getDate();
}

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const yearOptions = useMemo(() => getYearOptions(), []);
  const maxDay = useMemo(() => {
    const m = month ? parseInt(month, 10) : 12;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    return getDaysInMonth(m, y);
  }, [month, year]);

  const dayOptions = useMemo(() => {
    return Array.from({ length: maxDay }, (_, i) => i + 1);
  }, [maxDay]);

  // 當月份或年份變更時，若已選日期超過該月天數則自動調整
  useEffect(() => {
    if (day && parseInt(day, 10) > maxDay) {
      setDay(String(maxDay));
    }
  }, [maxDay, day]);

  const validate = (): string | null => {
    const trimmedName = name.trim();
    if (!trimmedName) return '請輸入姓名（Full Name）。';
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return '請輸入 Email。';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return '請輸入有效的 Email 格式。';
    if (!password) return '請輸入密碼。';
    if (password.length < 6) return '密碼至少需要 6 個字元。';
    if (password !== confirmPassword) return '兩次輸入的密碼不一致。';
    if (!month || !day || !year) return '請選擇完整的出生日期（月、日、年）。';
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
      return '請選擇有效的出生日期。';
    }
    const today = new Date();
    if (date > today) return '出生日期不可晚於今天。';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const birthdayStr = `${year}-${String(parseInt(month, 10)).padStart(2, '0')}-${String(parseInt(day, 10)).padStart(2, '0')}`;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: trimmedEmail,
          password,
          birthday: birthdayStr,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data.error as string) || '註冊失敗，請再試一次。');
        setIsLoading(false);
        return;
      }
      const signInResult = await signIn('credentials', {
        email: trimmedEmail,
        password,
        redirect: false,
      });
      if (signInResult?.error) {
        setError('帳戶已建立，但自動登入失敗，請至登入頁面登入。');
        setIsLoading(false);
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('註冊失敗，請再試一次。');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl">
          {/* 品牌標誌 */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-8">
            Create your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-black text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-black text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-black text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full bg-black text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              />
            </div>

            {/* Date of birth */}
            <div>
              <h2 className="text-base font-bold text-white mb-1">Date of birth</h2>
              <p className="text-sm text-gray-400 mb-3">
                This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="month" className="sr-only">Month</label>
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full bg-black text-white border border-gray-600 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem', paddingRight: '2rem' }}
                  >
                    <option value="">Select</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={String(i + 1)}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="day" className="sr-only">Day</label>
                  <select
                    id="day"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full bg-black text-white border border-gray-600 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem', paddingRight: '2rem' }}
                  >
                    <option value="">Select</option>
                    {dayOptions.map((d) => (
                      <option key={d} value={String(d)}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="year" className="sr-only">Year</label>
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-black text-white border border-gray-600 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem', paddingRight: '2rem' }}
                  >
                    <option value="">Select</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 註冊按鈕 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-gray-900 font-bold py-3 px-4 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '註冊中...' : '註冊'}
            </button>
          </form>

          {/* 登入連結 */}
          <div className="mt-6 text-center">
            <span className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-500 hover:text-blue-400 transition-colors"
              >
                Log in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
