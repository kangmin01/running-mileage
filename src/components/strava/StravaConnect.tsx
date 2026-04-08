"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Props {
  connected: boolean;
}

export default function StravaConnect({ connected }: Props) {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const strava = searchParams.get("strava");
    if (strava === "connected") setToast("Strava가 연결됐습니다!");
    else if (strava === "disconnected") setToast("Strava 연결이 해제됐습니다.");
    else if (strava === "error") setToast("Strava 연결에 실패했습니다.");
  }, [searchParams]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-sky-500">Strava 연동</h2>
            <p className="text-xs text-gray-400 mt-1">
              {connected
                ? "연결됨 — 달리기 기록이 자동으로 저장됩니다"
                : "연결하면 달리기 기록이 자동으로 저장됩니다"}
            </p>
          </div>

          {connected ? (
            <form action="/api/strava/disconnect" method="POST">
              <button
                type="submit"
                className="text-xs text-gray-400 hover:text-red-400 transition underline"
              >
                연결 해제
              </button>
            </form>
          ) : (
            <a
              href="/api/strava/connect"
              className="flex items-center gap-1.5 bg-[#FC4C02] hover:bg-[#e04400] text-white text-xs font-semibold px-3 py-2 rounded-xl transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Strava 연결
            </a>
          )}
        </div>
      </section>
    </>
  );
}
