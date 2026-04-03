"use client";

import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  year: number;
  month: number;
}

export default function MonthNav({ userId, year, month }: Props) {
  const router = useRouter();

  const go = (y: number, m: number) => {
    router.push(`/users/${userId}?year=${y}&month=${m}`);
  };

  const prev = () => {
    if (month === 1) go(year - 1, 12);
    else go(year, month - 1);
  };

  const next = () => {
    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) return;
    if (month === 12) go(year + 1, 1);
    else go(year, month + 1);
  };

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        className="text-sky-400 hover:text-sky-600 transition text-lg leading-none px-1"
      >
        ‹
      </button>
      <span className="text-sm font-semibold text-sky-500 min-w-[80px] text-center">
        {year}년 {month}월
      </span>
      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="text-sky-400 hover:text-sky-600 disabled:text-gray-200 transition text-lg leading-none px-1"
      >
        ›
      </button>
    </div>
  );
}
