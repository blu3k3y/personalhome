import { redirect } from "next/navigation";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", background: "#F7F7F5" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.03em", marginBottom: 12 }}>✦ blu3k3y</h1>
        <p style={{ fontSize: 15, color: "#888", marginBottom: 32 }}>나만의 공간을 만들어보세요</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <a href="/auth/login" style={{ padding: "10px 24px", background: "#111", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>로그인</a>
          <a href="/auth/signup" style={{ padding: "10px 24px", background: "#fff", color: "#111", border: "1px solid #ddd", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>회원가입</a>
        </div>
      </div>
    </div>
  );
}