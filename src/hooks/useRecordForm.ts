"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface RecordFormState {
  date: string;
  distance: string;
  hours: string;
  minutes: string;
  seconds: string;
  cadence: string;
  heart_rate: string;
}

function calcPace(form: RecordFormState): number | null {
  const dist = parseFloat(form.distance);
  const totalSec =
    parseInt(form.hours || "0") * 3600 +
    parseInt(form.minutes || "0") * 60 +
    parseInt(form.seconds || "0");
  if (!dist || dist <= 0 || !totalSec) return null;
  return Math.round((totalSec / dist) / 6) / 10;
}

function calcTotalMinutes(form: RecordFormState): number {
  return (
    parseInt(form.hours || "0") * 60 +
    parseInt(form.minutes || "0") +
    Math.round(parseInt(form.seconds || "0") / 60)
  );
}

// --- New record form hook ---
export function useRecordForm(userId: string, today: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<RecordFormState>({
    date: today,
    distance: "",
    hours: "0",
    minutes: "",
    seconds: "0",
    cadence: "",
    heart_rate: "",
  });

  const set = (key: keyof RecordFormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const pacePreview = calcPace(form);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dist = parseFloat(form.distance);
    const duration = calcTotalMinutes(form);
    const pace = calcPace(form);

    if (!form.date) return setError("날짜를 입력해주세요.");
    if (!dist || dist <= 0) return setError("거리를 입력해주세요.");
    if (duration <= 0) return setError("운동 시간을 입력해주세요.");
    if (!pace) return setError("페이스를 계산할 수 없어요.");

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("running_records")
      .insert({
        user_id: userId,
        date: form.date,
        distance: dist,
        duration,
        pace,
        cadence: form.cadence ? parseInt(form.cadence) : null,
        heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
      })
      .select("id")
      .single();

    setLoading(false);

    if (err || !data) {
      setError("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }

    await fetch("/api/records/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, distance: dist }),
    });

    router.push(`/users/${userId}`);
    router.refresh();
  };

  return { form, set, pacePreview, loading, error, handleSubmit };
}

// --- Edit record form hook ---
export function useRecordEditForm(record: Record<string, unknown>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initHours = Math.floor(Number(record.duration) / 60);
  const initMinutes = Number(record.duration) % 60;

  const [form, setForm] = useState<RecordFormState>({
    date: String(record.date),
    distance: String(record.distance),
    hours: String(initHours),
    minutes: String(initMinutes),
    seconds: "0",
    cadence: record.cadence ? String(record.cadence) : "",
    heart_rate: record.heart_rate ? String(record.heart_rate) : "",
  });

  const set = (key: keyof RecordFormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const pacePreview = calcPace(form);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dist = parseFloat(form.distance);
    const duration = calcTotalMinutes(form);
    const pace = calcPace(form);

    if (!dist || dist <= 0) return setError("거리를 입력해주세요.");
    if (duration <= 0) return setError("운동 시간을 입력해주세요.");
    if (!pace) return setError("페이스를 계산할 수 없어요.");

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase
      .from("running_records")
      .update({
        date: form.date,
        distance: dist,
        duration,
        pace,
        cadence: form.cadence ? parseInt(form.cadence) : null,
        heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", String(record.id));

    setLoading(false);

    if (err) {
      setError("수정에 실패했어요. 다시 시도해주세요.");
      return;
    }

    router.push(`/users/${record.user_id}`);
    router.refresh();
  };

  return { form, set, pacePreview, loading, error, handleSubmit };
}
