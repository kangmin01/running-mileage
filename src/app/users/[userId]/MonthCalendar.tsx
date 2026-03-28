"use client";

interface Record {
  id: string;
  date: string;
  distance: number;
}

interface Props {
  records: Record[];
  year: number;
  month: number;
}

export default function MonthCalendar({ records, year, month }: Props) {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month, 0).getDate();

  // 날짜별 거리 합산
  const distanceByDate: Record<string, number> = {};
  for (const r of records) {
    const d = r.date;
    distanceByDate[d] = (distanceByDate[d] ?? 0) + Number(r.distance);
  }

  const weeks = ["일", "월", "화", "수", "목", "금", "토"];

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {weeks.map((w) => (
          <div key={w} className="text-center text-xs text-gray-400 py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const distance = distanceByDate[dateStr];
          const hasRecord = !!distance;

          return (
            <div
              key={i}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs
                ${hasRecord ? "bg-sky-400 text-white font-bold" : "text-gray-500"}`}
            >
              <span>{day}</span>
              {hasRecord && (
                <span className="text-[9px] leading-none opacity-90">
                  {distance.toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
