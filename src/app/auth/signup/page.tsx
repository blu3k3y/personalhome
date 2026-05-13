"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ username: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error); setLoading(false); return; }

    // 가입 후 자동 로그인
    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    router.push("/dashboard");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* 로고 */}
        <div style={styles.logo}>✦ blu3k3y</div>
        <h1 style={styles.title}>회원가입</h1>
        <p style={styles.sub}>나만의 공간을 만들어보세요</p>

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrap}>
              <input
                value={form.username}
                onChange={set("username")}
                placeholder="예: blu3k3y"
                autoComplete="off"
                style={styles.input}
              />
              <span style={styles.suffix}>.blu3k3y.cloud</span>
            </div>
            <p style={styles.hint}>영문 소문자, 숫자, 하이픈만 · 3~20자</p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="hello@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="8자 이상"
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "처리 중..." : "시작하기"}
          </button>
        </form>

        <p style={styles.footer}>
          이미 계정이 있나요?{" "}
          <Link href="/auth/login" style={styles.link}>로그인</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F7F7F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    fontFamily: "'Georgia', serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 4px 24px rgba(0,0,0,.07)",
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 24,
    letterSpacing: "-.02em",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-.03em",
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: "#888",
    marginBottom: 28,
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "#555", letterSpacing: ".04em" },
  inputWrap: { display: "flex", alignItems: "center", border: "1px solid #e5e5e5", borderRadius: 8, overflow: "hidden" },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    color: "#1a1a1a",
    background: "#fff",
  },
  suffix: {
    padding: "10px 12px",
    fontSize: 12,
    color: "#aaa",
    background: "#fafafa",
    borderLeft: "1px solid #e5e5e5",
    whiteSpace: "nowrap",
  },
  hint: { fontSize: 11, color: "#bbb" },
  error: { fontSize: 13, color: "#e53e3e", background: "#fff5f5", padding: "10px 12px", borderRadius: 8 },
  btn: {
    padding: "12px 0",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: 4,
  },
  footer: { fontSize: 13, color: "#888", textAlign: "center", marginTop: 20 },
  link: { color: "#111", fontWeight: 600, textDecoration: "none" },
};