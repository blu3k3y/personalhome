"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.error) {
      setError("이메일 또는 비밀번호가 맞지 않아요.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>✦ blu3k3y</div>
        <h1 style={styles.title}>로그인</h1>
        <p style={styles.sub}>다시 돌아오셨군요</p>

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="hello@example.com"
              style={styles.input}
              autoFocus
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="비밀번호"
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p style={styles.footer}>
          계정이 없으신가요?{" "}
          <Link href="/auth/signup" style={styles.link}>회원가입</Link>
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
  sub: { fontSize: 14, color: "#888", marginBottom: 28 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "#555", letterSpacing: ".04em" },
  input: {
    padding: "10px 12px",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    color: "#1a1a1a",
    background: "#fff",
  },
  error: {
    fontSize: 13,
    color: "#e53e3e",
    background: "#fff5f5",
    padding: "10px 12px",
    borderRadius: 8,
  },
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