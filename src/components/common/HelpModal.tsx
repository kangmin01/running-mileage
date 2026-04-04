"use client";

import { useState } from "react";

export default function HelpModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded-full px-3 py-1 font-medium hover:bg-gray-100 transition"
      >
        ？ 이용 안내
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">이용 안내</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-6">

              {/* 서비스 소개 */}
              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-sky-600 flex items-center gap-1">🏃 Running Mileage란?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  우리 그룹의 러닝 기록을 함께 관리하는 서비스예요.
                  매달 목표 거리를 설정하고, 기록을 업로드하며 서로의 달성률을 확인할 수 있어요.
                </p>
              </section>

              {/* 불 이모티콘 */}
              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-orange-500 flex items-center gap-1">🔥 이름 옆 불 이모티콘</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  이름 옆에 🔥가 붙은 멤버는 <span className="font-semibold text-gray-800">벌금 대상자</span>예요.
                  월 목표를 달성하지 못하면 다음 달 초에 자동으로 벌금이 부과돼요.
                  벌금 대상자 지정 및 벌금액은 관리자만 변경할 수 있어요.
                </p>
              </section>

              {/* 기록 등록 */}
              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-sky-600 flex items-center gap-1">📝 기록 등록 방법</h3>
                <ol className="text-sm text-gray-600 leading-relaxed flex flex-col gap-1.5 list-decimal list-inside">
                  <li>홈 화면 우측 하단 <span className="font-semibold text-gray-800">+ 버튼</span>을 눌러요</li>
                  <li>날짜, 거리(km), 운동 시간을 입력해요</li>
                  <li>케이던스·심박수는 선택 입력이에요</li>
                  <li>등록하면 페이스가 자동으로 계산돼요</li>
                </ol>
              </section>

              {/* 목표 설정 */}
              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-sky-600 flex items-center gap-1">🎯 월 목표 설정</h3>
                <ul className="text-sm text-gray-600 leading-relaxed flex flex-col gap-1.5">
                  <li className="flex gap-2"><span>•</span><span>내 페이지 → <span className="font-semibold text-gray-800">목표 설정</span> 버튼에서 설정해요</span></li>
                  <li className="flex gap-2"><span>•</span><span><span className="font-semibold text-gray-800">이번 달이 시작된 후에는 수정 불가</span>예요. 미리 설정해두세요!</span></li>
                  <li className="flex gap-2"><span>•</span><span>다음 달 목표는 언제든 미리 설정할 수 있어요</span></li>
                </ul>
              </section>

              {/* 랭킹 */}
              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-sky-600 flex items-center gap-1">🏆 이달의 랭킹</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  홈 화면의 랭킹은 <span className="font-semibold text-gray-800">이번 달 누적 거리</span> 기준이에요.
                  매달 초기화되니 매달 새롭게 도전해보세요!
                </p>
              </section>

              {/* 벌금 */}
              <section className="flex flex-col gap-2">
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-1">💸 벌금 시스템</h3>
                <ul className="text-sm text-gray-600 leading-relaxed flex flex-col gap-1.5">
                  <li className="flex gap-2"><span>•</span><span>벌금 대상자가 월 목표를 달성하지 못하면 다음 달 초 자동 부과</span></li>
                  <li className="flex gap-2"><span>•</span><span>벌금액은 모두 동일한 고정 금액</span></li>
                  <li className="flex gap-2"><span>•</span><span>벌금 내역은 상단 <span className="font-semibold text-gray-800">💸 벌금</span> 버튼에서 확인</span></li>
                </ul>
              </section>

              {/* 문의 */}
              <section className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-gray-700">💬 문의 / 건의</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  버그를 발견하거나 불편한 점, 추가됐으면 하는 기능이 있다면 편하게 말씀해주세요!
                </p>
                <p className="text-sm text-gray-400">강민희에게 카톡 주세요 😊</p>
              </section>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
