"use client";

import React from "react";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px 36px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,.07)" }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>로그인 오류</h1>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 24 }}>이메일 또는 비밀번호를 확인해주세요.</p>
        <Link href="/auth/login" style={{ display: "inline-block", padding: "10px 24px", background: "#111", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          다시 로그인
        </Link>
      </div>
    </div>
  );
}