"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const TEMPLATES = [
  { id: 1, name: "✦ Notion Style", desc: "깔끔한 노션 스타일 레이아웃", preview: "📋" },
  { id: 2, name: "🪟 Windows 98", desc: "레트로 데스크탑 테마", preview: "🖥️" },
  { id: 3, name: "⚡ Kinetic Type", desc: "키네틱 타이포그래픽 모션 UI", preview: "🔤" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templateId, setTemplateId] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/me")
      .then(r => r.json())
      .then(d => { if (d.templateId) setTemplateId(d.templateId); })
      .catch(() => {});
  }, [session]);

  const saveTemplate = async (id: number) => {
    setTemplateId(id);
    setSaving(true); setSaved(false);
    await fetch("/api/template", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: id }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (status === "loading") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <p style={{ color: "#aaa" }}>불러오는 중...</p>
    </div>
  );
  if (!session) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", fontFamily: "Georgia, serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #ebebea", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>✦ blu3k3y</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#888" }}>{session.user.email}</span>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
            style={{ padding: "6px 14px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            로그아웃
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.03em", marginBottom: 8 }}>
          안녕하세요, {session.user.username} 님 👋
        </h1>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 40 }}>나만의 공간이 준비됐어요.</p>

        <div style={{ background: "#fff", border: "1px solid #ebebea", borderRadius: 14, padding: "24px 28px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 12, color: "#aaa", fontWeight: 600, letterSpacing: ".06em", marginBottom: 6 }}>내 홈 주소</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{session.user.username}.blu3k3y.cloud</p>
            </div>
            <a href={`http://${session.user.username}.localhost:3000`} target="_blank" rel="noreferrer"
              style={{ padding: "9px 18px", background: "#111", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              내 홈 보기 →
            </a>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #ebebea", borderRadius: 14, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#aaa", fontWeight: 600, letterSpacing: ".06em" }}>템플릿 선택</p>
            {saving && <span style={{ fontSize: 12, color: "#888" }}>저장 중...</span>}
            {saved && <span style={{ fontSize: 12, color: "#2d6a4f" }}>✓ 저장됨</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {TEMPLATES.map(t => (
              <div key={t.id} onClick={() => saveTemplate(t.id)}
                style={{ border: templateId === t.id ? "2px solid #111" : "1px solid #ebebea", borderRadius: 10, padding: "20px 16px", cursor: "pointer", transition: "all .15s" }}>
                <div style={{ fontSize: 28, marginBottom: 10, textAlign: "center" }}>{t.preview}</div>
                <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 11, color: "#888" }}>{t.desc}</p>
                {templateId === t.id && (
                  <span style={{ display: "inline-block", marginTop: 8, fontSize: 10, background: "#111", color: "#fff", padding: "2px 8px", borderRadius: 20 }}>사용 중</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}