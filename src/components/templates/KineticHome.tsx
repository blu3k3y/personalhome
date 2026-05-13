"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface Post {
  id: string; title: string; content: string; category: string;
  isPrivate: boolean; password: string; createdAt: string; updatedAt: string;
}
interface GalleryItem {
  id: string; title: string; imageData: string | null;
  isPrivate: boolean; password: string; createdAt: string;
}
interface HtmlFile {
  id: string; title: string; fileName: string; htmlContent: string;
  isPrivate: boolean; password: string; createdAt: string;
}
interface Category { id: string; name: string; }
interface InitialData {
  posts: Post[]; gallery: GalleryItem[]; htmlFiles: HtmlFile[]; categories: Category[];
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

/* ── Password Gate ── */
function PwGate({ onSuccess, onCancel }: { onSuccess: (pw: string) => void; onCancel: () => void }) {
  const [pw, setPw] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.15)", padding: "32px", width: 320 }}>
        <p style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 18, color: "#fff", letterSpacing: "-0.04em", marginBottom: 20 }}>LOCKED</p>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && onSuccess(pw)}
          autoFocus placeholder="PASSWORD"
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 16, fontFamily: "'Arial Black', sans-serif", fontWeight: 900, padding: "8px 0", outline: "none", letterSpacing: "0.2em", marginBottom: 20, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", padding: "10px", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "0.1em" }}>CANCEL</button>
          <button onClick={() => onSuccess(pw)} style={{ flex: 1, background: "#fff", border: "none", color: "#000", padding: "10px", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "0.1em" }}>ENTER</button>
        </div>
      </div>
    </div>
  );
}

/* ── Write Modal ── */
function WriteModal({ categories, post, onSave, onClose }: {
  categories: Category[]; post?: Post; onSave: (d: any) => Promise<void>; onClose: () => void;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "");
  const [isPrivate, setIsPrivate] = useState(post?.isPrivate || false);
  const [password, setPassword] = useState(post?.password || "");
  const [htmlMode, setHtmlMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!htmlMode && editorRef.current) editorRef.current.innerHTML = content;
  }, [htmlMode]);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    setContent(editorRef.current?.innerHTML || "");
  };

  const save = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    setLoading(true);
    await onSave({ id: post?.id, title, content, category, isPrivate, password: isPrivate ? password : "" });
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", width: "100%", maxWidth: 680, padding: "32px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 13, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>{post ? "EDIT" : "NEW ENTRY"}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="TITLE"
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: "-0.04em", padding: "0 0 12px", outline: "none", marginBottom: 20, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" as const }}>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "0.1em", padding: "6px 10px", cursor: "pointer" }}>
            <option value="" style={{ background: "#111" }}>— CATEGORY —</option>
            {categories.map(c => <option key={c.id} value={c.name} style={{ background: "#111" }}>{c.name.toUpperCase()}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: isPrivate ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "0.1em", border: "1px solid rgba(255,255,255,0.15)", padding: "6px 10px" }}>
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} style={{ accentColor: "#fff" }} />
            PRIVATE
          </label>
          {isPrivate && (
            <input type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "0.15em", padding: "6px 10px", outline: "none", width: 150 }} />
          )}
          <button onMouseDown={e => { e.preventDefault(); setHtmlMode(m => !m); }}
            style={{ background: htmlMode ? "#fff" : "transparent", border: "1px solid rgba(255,255,255,0.15)", color: htmlMode ? "#000" : "rgba(255,255,255,0.4)", fontFamily: "monospace", fontWeight: 700, fontSize: 11, padding: "6px 10px", cursor: "pointer" }}>{"<>"}</button>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" as const }}>
          {[{l:"B",c:"bold"},{l:"I",c:"italic"},{l:"U",c:"underline"}].map(t => (
            <button key={t.c} onMouseDown={e => { e.preventDefault(); exec(t.c); }}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, padding: "4px 8px", cursor: "pointer" }}>{t.l}</button>
          ))}
          <button onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, padding: "4px 8px", cursor: "pointer" }}>•</button>
        </div>
        {!htmlMode
          ? <div ref={editorRef} contentEditable suppressContentEditableWarning
              onInput={() => setContent(editorRef.current?.innerHTML || "")}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", minHeight: 200, padding: "16px", color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.7, outline: "none", fontFamily: "inherit" }} />
          : <textarea value={content} onChange={e => setContent(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", minHeight: 200, padding: "16px", color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "monospace", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        }
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", padding: "10px 20px", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "0.1em" }}>CANCEL</button>
          <button onClick={save} disabled={loading} style={{ background: "#fff", border: "none", color: "#000", padding: "10px 24px", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "0.1em" }}>{loading ? "SAVING..." : "PUBLISH"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Post Viewer ── */
function PostViewer({ post, onClose, onEdit, isOwner }: { post: Post; onClose: () => void; onEdit: () => void; isOwner: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", width: "100%", maxWidth: 680, padding: "40px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          {post.category && <span style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}>{post.category.toUpperCase()}</span>}
          <span style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>{fmtDate(post.createdAt)}</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>
        <h1 style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 36, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 28 }}>{post.title}</h1>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: post.content }} />
        {isOwner && (
          <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onEdit} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", padding: "8px 18px", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 10, letterSpacing: "0.1em" }}>EDIT</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── HTML Viewer ── */
function HtmlViewer({ item, onClose }: { item: HtmlFile; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [full, setFull] = useState(false);
  useEffect(() => {
    const blob = new Blob([item.htmlContent], { type: "text/html" });
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [item]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: full ? 0 : "20px" }} onClick={onClose}>
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", width: "100%", maxWidth: full ? "100%" : 900, height: full ? "100vh" : "85vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, color: "#fff", letterSpacing: "-0.02em", flex: 1 }}>{item.title.toUpperCase()}</span>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{item.fileName}</span>
          <button onClick={() => setFull(f => !f)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>{full ? "⤓" : "⤢"}</button>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
        {url && <iframe src={url} sandbox="allow-scripts allow-same-origin" style={{ flex: 1, border: "none", width: "100%", display: "block" }} title={item.title} />}
      </div>
    </div>
  );
}

/* ── Gallery Viewer ── */
function GalleryViewer({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ maxWidth: "80vw", maxHeight: "80vh", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: -36, right: 0, background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 20 }}>×</button>
        {item.imageData
          ? <img src={item.imageData} alt={item.title} style={{ maxWidth: "80vw", maxHeight: "80vh", display: "block" }} />
          : <div style={{ width: 300, height: 300, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 48 }}>IMG</div>
        }
        <div style={{ position: "absolute", bottom: -30, left: 0, fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{item.title.toUpperCase()} — {fmtDate(item.createdAt)}</div>
      </div>
    </div>
  );
}

/* ── Kinetic canvas ── */
function KineticCanvas({ words, onWordClick }: { words: string[]; onWordClick?: (w: string) => void }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const elsRef = useRef<HTMLDivElement[]>([]);
  const velsRef = useRef<{vx:number;vy:number}[]>([]);
  const baseRef = useRef<{x:number;y:number}[]>([]);
  const mouseRef = useRef({ x: 400, y: 200 });
  const cursorRef = useRef({ x: 400, y: 200 });
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const SIZES = [72, 48, 56, 36, 64, 44, 32, 52, 28, 40];
  const OPACITIES = [1, 0.6, 0.8, 0.4, 0.7, 0.5, 0.35, 0.65, 0.25, 0.55];

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.innerHTML = "";
    elsRef.current = [];
    velsRef.current = [];
    baseRef.current = [];

    const W = el.offsetWidth || 600;
    const H = el.offsetHeight || 450;
    const cols = 3;
    const cellW = W / cols;
    const cellH = H / Math.ceil(words.length / cols);

    words.forEach((w, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = col * cellW + Math.random() * (cellW * 0.5);
      const by = row * cellH + Math.random() * (cellH * 0.5) + 20;
      const size = SIZES[i % SIZES.length];
      const op = OPACITIES[i % OPACITIES.length];

      const div = document.createElement("div");
      div.style.cssText = `
        position: absolute;
        font-family: 'Arial Black', 'Helvetica Neue', sans-serif;
        font-weight: 900;
        font-size: ${size}px;
        color: rgba(255,255,255,${op});
        letter-spacing: -0.04em;
        line-height: 1;
        cursor: pointer;
        user-select: none;
        left: ${bx}px;
        top: ${by}px;
        white-space: nowrap;
        transition: color 0.3s;
      `;
      div.textContent = w.toUpperCase();
      div.addEventListener("click", () => {
        const colors = ["rgba(255,255,255,0.9)", "rgba(255,200,80,0.8)", "rgba(100,200,255,0.8)", "rgba(255,100,150,0.8)"];
        div.style.color = colors[Math.floor(Math.random() * colors.length)];
        velsRef.current[i].vx += (Math.random() - 0.5) * 10;
        velsRef.current[i].vy += (Math.random() - 0.5) * 10;
        onWordClick?.(w);
      });
      el.appendChild(div);
      elsRef.current.push(div);
      velsRef.current.push({ vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.4 });
      baseRef.current.push({ x: bx, y: by });
    });

    let t = 0;
    const tick = () => {
      t += 0.008;
      const W2 = el.offsetWidth;
      const H2 = el.offsetHeight;
      const cx = cursorRef.current.x;
      const cy = cursorRef.current.y;
      cursorRef.current.x += (mouseRef.current.x - cx) * 0.1;
      cursorRef.current.y += (mouseRef.current.y - cy) * 0.1;

      if (ringRef.current) {
        ringRef.current.style.left = cursorRef.current.x + "px";
        ringRef.current.style.top = cursorRef.current.y + "px";
      }

      elsRef.current.forEach((div, i) => {
        const ex = parseFloat(div.style.left);
        const ey = parseFloat(div.style.top);
        const dx = cx - (ex + div.offsetWidth / 2);
        const dy = cy - (ey + div.offsetHeight / 2);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const repel = Math.max(0, 1 - dist / 130) * 3.5;

        velsRef.current[i].vx += (-dx / dist) * repel * 0.45;
        velsRef.current[i].vy += (-dy / dist) * repel * 0.45;
        velsRef.current[i].vx += (baseRef.current[i].x - ex) * 0.018;
        velsRef.current[i].vy += (baseRef.current[i].y - ey) * 0.018;
        velsRef.current[i].vx += Math.sin(t * 0.6 + i * 1.2) * 0.035;
        velsRef.current[i].vy += Math.cos(t * 0.5 + i * 0.9) * 0.025;
        velsRef.current[i].vx *= 0.91;
        velsRef.current[i].vy *= 0.91;

        let nx = ex + velsRef.current[i].vx;
        let ny = ey + velsRef.current[i].vy;
        if (nx < 0) { nx = 0; velsRef.current[i].vx *= -0.5; }
        if (ny < 0) { ny = 0; velsRef.current[i].vy *= -0.5; }
        if (nx + div.offsetWidth > W2 - 4) { nx = W2 - div.offsetWidth - 4; velsRef.current[i].vx *= -0.5; }
        if (ny + div.offsetHeight > H2 - 4) { ny = H2 - div.offsetHeight - 4; velsRef.current[i].vy *= -0.5; }

        div.style.left = nx + "px";
        div.style.top = ny + "px";
        const speed = Math.sqrt(velsRef.current[i].vx ** 2 + velsRef.current[i].vy ** 2);
        div.style.transform = `rotate(${velsRef.current[i].vx * 0.5}deg) skewX(${-Math.min(speed * 3, 14)}deg)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(rafRef.current); };
  }, [words]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  return (
    <div ref={canvasRef} onMouseMove={handleMouseMove}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", cursor: "crosshair" }}>
      <div ref={ringRef} style={{ position: "absolute", width: 44, height: 44, border: "1px solid rgba(255,255,255,0.25)", borderRadius: "50%", pointerEvents: "none", transform: "translate(-50%, -50%)", transition: "width 0.1s, height 0.1s", zIndex: 10 }} />
    </div>
  );
}

/* ── Gallery Modal ── */
function GalleryModal({ item, onSave, onClose }: { item?: GalleryItem; onSave: (d: any) => Promise<void>; onClose: () => void }) {
  const [title, setTitle] = useState(item?.title || "");
  const [isPrivate, setIsPrivate] = useState(item?.isPrivate || false);
  const [password, setPassword] = useState(item?.password || "");
  const [imageData, setImageData] = useState<string | null>(item?.imageData || null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setImageData(ev.target?.result as string); r.readAsDataURL(f);
  };
  const save = async () => {
    if (!title.trim()) return alert("제목을 입력하세요.");
    if (isPrivate && !password) return alert("비밀번호를 설정하세요.");
    setLoading(true);
    await onSave({ id: item?.id, title, imageData, isPrivate, password: isPrivate ? password : "" });
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.1)", width: "100%", maxWidth: 420, padding: "28px 28px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>{item ? "EDIT IMAGE" : "ADD IMAGE"}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="TITLE"
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em", padding: "0 0 10px", outline: "none", marginBottom: 18, boxSizing: "border-box" }} />
        {/* 이미지 업로드 */}
        <label style={{ display: "block", border: "1px dashed rgba(255,255,255,0.2)", padding: "24px", textAlign: "center", cursor: "pointer", marginBottom: 16, position: "relative", transition: "border-color .15s" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#fff"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"}>
          <input type="file" accept="image/*" onChange={handleFile} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
          {imageData
            ? <img src={imageData} alt="" style={{ maxHeight: 160, maxWidth: "100%", display: "block", margin: "0 auto" }} />
            : <div>
                <div style={{ fontWeight: 900, fontSize: 24, color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>+</div>
                <div style={{ fontWeight: 900, fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>CLICK TO SELECT IMAGE</div>
              </div>
          }
        </label>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: isPrivate ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 9, letterSpacing: "0.1em", border: "1px solid rgba(255,255,255,0.15)", padding: "5px 10px" }}>
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} style={{ accentColor: "#fff" }} />
            PRIVATE
          </label>
          {isPrivate && (
            <input type="password" placeholder="PASSWORD" value={password} onChange={e => setPassword(e.target.value)}
              style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 9, letterSpacing: "0.1em", padding: "5px 10px", outline: "none" }} />
          )}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", padding: "9px 18px", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 9, letterSpacing: "0.1em" }}>CANCEL</button>
          <button onClick={save} disabled={loading} style={{ background: "#fff", border: "none", color: "#000", padding: "9px 20px", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 9, letterSpacing: "0.1em" }}>{loading ? "SAVING..." : item ? "SAVE" : "ADD"}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
export default function KineticHome({ username, isOwner: isOwnerProp, initialData }: {
  username: string; isOwner: boolean; initialData: InitialData;
}) {
  const [posts, setPosts] = useState<Post[]>(initialData.posts);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialData.gallery);
  const [htmlFiles, setHtmlFiles] = useState<HtmlFile[]>(initialData.htmlFiles);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [newCat, setNewCat] = useState("");
  const [isOwner, setIsOwner] = useState(isOwnerProp);

  const [section, setSection] = useState<"posts"|"gallery"|"html"|"private">("posts");
  const [activeCat, setActiveCat] = useState("all");
  const [writeModal, setWriteModal] = useState<null | { post?: Post }>(null);
  const [galModal, setGalModal] = useState<null | { item?: GalleryItem }>(null);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [viewGal, setViewGal] = useState<GalleryItem | null>(null);
  const [viewHtml, setViewHtml] = useState<HtmlFile | null>(null);
  const [pwGate, setPwGate] = useState<null | { item: any; type: string; correct: string; onSuccess: () => void }>(null);
  const [sideOpen, setSideOpen] = useState(true);
  const [wordEditOpen, setWordEditOpen] = useState(false);
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [wordInput, setWordInput] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.username === username) setIsOwner(true); })
      .catch(() => {});
  }, [username]);

  const api = async (url: string, method: string, body?: any) => {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const savePost = async (d: any) => {
    if (d.id) {
      const u = await api("/api/posts", "PUT", d);
      setPosts(ps => ps.map(p => p.id === u.id ? u : p));
    } else {
      const c = await api("/api/posts", "POST", d);
      setPosts(ps => [c, ...ps]);
    }
    setWriteModal(null); setViewPost(null);
  };
  const delPost = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("삭제할까요?")) return;
    await api("/api/posts", "DELETE", { id });
    setPosts(ps => ps.filter(p => p.id !== id));
  };
  const saveGallery = async (d: any) => {
    if (d.id) {
      const u = await api("/api/gallery", "PUT", d);
      setGallery(gs => gs.map(g => g.id === u.id ? u : g));
    } else {
      const c = await api("/api/gallery", "POST", d);
      setGallery(gs => [c, ...gs]);
    }
    setGalModal(null); setViewGal(null);
  };

  const delGallery = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("삭제할까요?")) return;
    await api("/api/gallery", "DELETE", { id });
    setGallery(gs => gs.filter(g => g.id !== id));
  };

  const addCat = async () => {
    const n = newCat.trim(); if (!n) return;
    try {
      const created = await api("/api/categories", "POST", { name: n });
      setCategories(cs => [...cs, created]); setNewCat("");
    } catch { alert("이미 존재하는 카테고리예요."); }
  };
  const delCat = async (id: string) => {
    if (!confirm("카테고리를 삭제할까요?")) return;
    await api("/api/categories", "DELETE", { id });
    setCategories(cs => cs.filter(c => c.id !== id));
    if (activeCat === id) setActiveCat("all");
  };

  const openItem = (item: any, type: "post"|"gallery"|"html") => {
    const open = () => {
      if (type === "post") setViewPost(item);
      else if (type === "gallery") setViewGal(item);
      else setViewHtml(item);
    };
    if (!item.isPrivate || isOwner) { open(); return; }
    setPwGate({ item, type, correct: item.password, onSuccess: () => { setPwGate(null); open(); } });
  };

  const filteredPosts = posts.filter(p => {
    if (section === "private") return p.isPrivate;
    if (p.isPrivate) return false;
    if (activeCat !== "all" && p.category !== activeCat) return false;
    return true;
  });

  // 캔버스에 표시할 단어들 — 커스텀이 있으면 우선
  const defaultWords = section === "posts"
    ? (filteredPosts.length > 0 ? filteredPosts.map(p => p.title) : [username, "TYPE", "MOTION", "WRITE", "CREATE", "DESIGN", "CODE", "SPACE"])
    : section === "gallery"
    ? (gallery.length > 0 ? gallery.map(g => g.title) : ["GALLERY", "IMAGE", "VISUAL", "PHOTO", "ART"])
    : section === "html"
    ? (htmlFiles.length > 0 ? htmlFiles.map(f => f.fileName) : ["HTML", "CODE", "WEB", "PAGE"])
    : posts.filter(p => p.isPrivate).map(() => "LOCKED");

  const canvasWords = customWords.length > 0 ? customWords : defaultWords;

  const addWord = () => {
    const w = wordInput.trim(); if (!w) return;
    setCustomWords(ws => [...ws, w]); setWordInput("");
  };
  const removeWord = (i: number) => setCustomWords(ws => ws.filter((_, idx) => idx !== i));
  const resetWords = () => setCustomWords([]);

  const privateCount = posts.filter(p => p.isPrivate).length;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif", overflow: "hidden" }}>

      {/* Sidebar */}
      {sideOpen && (
        <aside style={{ width: 220, background: "#0d0d0d", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
          {/* Logo */}
          <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.05em", color: "#fff", lineHeight: 1 }}>{username.toUpperCase()}</div>
            <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", marginTop: 4 }}>PERSONAL SPACE</div>
          </div>

          {/* Write button */}
          {isOwner && (
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={() => setWriteModal({})}
                style={{ width: "100%", background: "#fff", border: "none", color: "#000", padding: "10px", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "0.12em" }}>
                + NEW ENTRY
              </button>
            </div>
          )}

          {/* Nav */}
          <div style={{ padding: "16px 0" }}>
            <div style={{ fontWeight: 900, fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", padding: "0 20px", marginBottom: 8 }}>NAVIGATE</div>
            {[
              { id: "posts", label: "POSTS", count: posts.filter(p => !p.isPrivate).length },
              { id: "gallery", label: "GALLERY", count: gallery.length },
              { id: "html", label: "HTML FILES", count: htmlFiles.length },
              ...(isOwner ? [{ id: "private", label: "PRIVATE", count: privateCount }] : []),
            ].map(item => (
              <button key={item.id} onClick={() => setSection(item.id as any)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 20px", background: section === item.id ? "rgba(255,255,255,0.06)" : "transparent", border: "none", borderLeft: `2px solid ${section === item.id ? "#fff" : "transparent"}`, color: section === item.id ? "#fff" : "rgba(255,255,255,0.35)", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "0.08em", textAlign: "left", transition: "all .15s" }}>
                <span>{item.label}</span>
                <span style={{ fontWeight: 900, fontSize: 10, color: section === item.id ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}>{item.count}</span>
              </button>
            ))}
          </div>

          {/* Categories */}
          {section === "posts" && (
            <div style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontWeight: 900, fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", padding: "0 20px", marginBottom: 8 }}>CATEGORY</div>
              <button onClick={() => setActiveCat("all")}
                style={{ width: "100%", padding: "7px 20px", background: activeCat === "all" ? "rgba(255,255,255,0.06)" : "transparent", border: "none", borderLeft: `2px solid ${activeCat === "all" ? "#fff" : "transparent"}`, color: activeCat === "all" ? "#fff" : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 10, letterSpacing: "0.08em", textAlign: "left" }}>ALL</button>
              {categories.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center" }}
                  onMouseEnter={e => { const btn = (e.currentTarget as HTMLElement).querySelector(".del-btn") as HTMLElement; if (btn) btn.style.opacity = "1"; }}
                  onMouseLeave={e => { const btn = (e.currentTarget as HTMLElement).querySelector(".del-btn") as HTMLElement; if (btn) btn.style.opacity = "0"; }}>
                  <button onClick={() => setActiveCat(c.name)}
                    style={{ flex: 1, padding: "7px 20px", background: activeCat === c.name ? "rgba(255,255,255,0.06)" : "transparent", border: "none", borderLeft: `2px solid ${activeCat === c.name ? "#fff" : "transparent"}`, color: activeCat === c.name ? "#fff" : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 10, letterSpacing: "0.08em", textAlign: "left" }}>
                    {c.name.toUpperCase()}
                  </button>
                  {isOwner && (
                    <button className="del-btn" onClick={() => delCat(c.id)}
                      style={{ background: "none", border: "none", color: "rgba(255,50,50,0.7)", cursor: "pointer", padding: "0 12px 0 0", fontSize: 12, opacity: 0, transition: "opacity .15s", fontFamily: "sans-serif" }}>✕</button>
                  )}
                </div>
              ))}
              {isOwner && (
                <div style={{ display: "flex", gap: 4, padding: "8px 16px 0" }}>
                  <input value={newCat} onChange={e => setNewCat(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCat()}
                    placeholder="ADD CATEGORY"
                    style={{ flex: 1, background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 9, letterSpacing: "0.1em", padding: "4px 0", outline: "none" }} />
                  <button onClick={addCat}
                    style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, padding: "2px 8px" }}>+</button>
                </div>
              )}
            </div>
          )}

          {/* Word editor */}
          {isOwner && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={() => setWordEditOpen(o => !o)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 9, letterSpacing: "0.2em" }}>
                <span>FLOATING WORDS</span>
                <span style={{ fontSize: 12 }}>{wordEditOpen ? "▲" : "▼"}</span>
              </button>
              {wordEditOpen && (
                <div style={{ padding: "0 16px 12px" }}>
                  {/* 현재 단어 목록 */}
                  <div style={{ maxHeight: 140, overflowY: "auto", marginBottom: 8 }}>
                    {canvasWords.map((w, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 10, color: customWords.length > 0 ? "#fff" : "rgba(255,255,255,0.4)", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: 120 }}>
                          {w.toUpperCase()}
                        </span>
                        {customWords.length > 0 && (
                          <button onClick={() => removeWord(i)}
                            style={{ background: "none", border: "none", color: "rgba(255,80,80,0.7)", cursor: "pointer", fontSize: 11, padding: "0 4px", fontFamily: "sans-serif" }}>✕</button>
                        )}
                      </div>
                    ))}
                    {customWords.length === 0 && (
                      <p style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, letterSpacing: "0.05em", marginBottom: 6 }}>
                        현재 자동 모드
                      </p>
                    )}
                  </div>
                  {/* 입력 */}
                  <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    <input value={wordInput} onChange={e => setWordInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addWord()}
                      placeholder="ADD WORD"
                      style={{ flex: 1, background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 9, letterSpacing: "0.1em", padding: "4px 0", outline: "none" }} />
                    <button onClick={addWord}
                      style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 11, padding: "2px 8px" }}>+</button>
                  </div>
                  {/* 자동 리셋 */}
                  {customWords.length > 0 && (
                    <button onClick={resetWords}
                      style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontSize: 9, letterSpacing: "0.1em", padding: "5px 0" }}>
                      RESET TO AUTO
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              ["POSTS", posts.filter(p=>!p.isPrivate).length],
              ["IMAGES", gallery.length],
              ["HTML", htmlFiles.length],
            ].map(([k, v]) => (
              <div key={k as string} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 900, fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)" }}>{k}</span>
                <span style={{ fontWeight: 900, fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{v}</span>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* Topbar */}
        <header style={{ height: 48, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0 }}>
          <button onClick={() => setSideOpen(s => !s)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontWeight: 900, fontSize: 16, lineHeight: 1, padding: "0 4px" }}>
            {sideOpen ? "←" : "→"}
          </button>
          <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)" }}>
            {section.toUpperCase()} {activeCat !== "all" && section === "posts" ? `/ ${activeCat.toUpperCase()}` : ""}
          </span>
          <span style={{ marginLeft: "auto", fontWeight: 900, fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
            {canvasWords.length} ITEMS
          </span>
        </header>

        {/* Kinetic Canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Background ghost text */}
          <div style={{ position: "absolute", fontWeight: 900, fontSize: 200, color: "rgba(255,255,255,0.025)", letterSpacing: "-0.06em", lineHeight: 0.85, bottom: -20, left: -10, pointerEvents: "none", userSelect: "none", zIndex: 0 }}>
            {section.toUpperCase()}
          </div>

          <KineticCanvas
            words={canvasWords}
            onWordClick={(w) => {
              const post = filteredPosts.find(p => p.title === w);
              const gal = gallery.find(g => g.title === w);
              const html = htmlFiles.find(f => f.fileName === w);
              if (post) openItem(post, "post");
              else if (gal) openItem(gal, "gallery");
              else if (html) openItem(html, "html");
            }}
          />

          {/* List overlay at bottom */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, maxHeight: "35%", overflow: "auto", background: "linear-gradient(to top, rgba(10,10,10,0.95) 60%, transparent)", padding: "24px 24px 16px", zIndex: 20 }}>
            {section === "posts" && filteredPosts.map(post => (
              <div key={post.id} onClick={() => openItem(post, "post")}
                style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <span style={{ fontWeight: 900, fontSize: 13, color: post.isPrivate ? "rgba(255,255,255,0.3)" : "#fff", letterSpacing: "-0.02em", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                  {post.isPrivate ? "🔒 " : ""}{post.title.toUpperCase()}
                </span>
                <span style={{ fontWeight: 900, fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", flexShrink: 0 }}>{fmtDate(post.createdAt)}</span>
                {isOwner && (
                  <span onClick={e => delPost(post.id, e)} style={{ fontWeight: 900, fontSize: 10, color: "rgba(255,255,255,0.2)", cursor: "pointer", flexShrink: 0 }}>✕</span>
                )}
              </div>
            ))}
            {section === "gallery" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 8 }}>
                {isOwner && (
                  <div onClick={() => setGalModal({})}
                    style={{ aspectRatio: "1", background: "transparent", border: "1px dashed rgba(255,255,255,0.2)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#fff"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"}>
                    <span style={{ fontWeight: 900, fontSize: 20, color: "rgba(255,255,255,0.4)" }}>+</span>
                    <span style={{ fontWeight: 900, fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>ADD</span>
                  </div>
                )}
                {gallery.map(g => (
                  <div key={g.id} style={{ aspectRatio: "1", position: "relative" }}
                    onMouseEnter={e => { const ov = (e.currentTarget as HTMLElement).querySelector(".gal-ov") as HTMLElement; if (ov) ov.style.opacity = "1"; }}
                    onMouseLeave={e => { const ov = (e.currentTarget as HTMLElement).querySelector(".gal-ov") as HTMLElement; if (ov) ov.style.opacity = "0"; }}>
                    <div onClick={() => openItem(g, "gallery")}
                      style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {g.imageData
                        ? <img src={g.imageData} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontWeight: 900, fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>{g.isPrivate ? "LOCK" : "IMG"}</span>
                      }
                    </div>
                    {isOwner && (
                      <div className="gal-ov" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", opacity: 0, transition: "opacity .15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <button onClick={() => setGalModal({ item: g })}
                          style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 9, padding: "3px 6px", fontFamily: "'Arial Black', sans-serif" }}>EDIT</button>
                        <button onClick={e => delGallery(g.id, e)}
                          style={{ background: "rgba(255,50,50,0.3)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 9, padding: "3px 6px", fontFamily: "'Arial Black', sans-serif" }}>DEL</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {section === "html" && htmlFiles.map(f => (
              <div key={f.id} onClick={() => openItem(f, "html")}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
                <span style={{ fontWeight: 900, fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>HTML</span>
                <span style={{ fontWeight: 900, fontSize: 12, color: "#fff", letterSpacing: "-0.02em", flex: 1 }}>{f.fileName.toUpperCase()}</span>
                <span style={{ fontWeight: 900, fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{fmtDate(f.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      {writeModal && <WriteModal categories={categories} post={writeModal.post} onSave={savePost} onClose={() => setWriteModal(null)} />}
      {galModal !== null && <GalleryModal item={galModal.item} onSave={saveGallery} onClose={() => setGalModal(null)} />}
      {viewPost && <PostViewer post={viewPost} isOwner={isOwner} onClose={() => setViewPost(null)} onEdit={() => { setWriteModal({ post: viewPost }); setViewPost(null); }} />}
      {viewGal && <GalleryViewer item={viewGal} onClose={() => setViewGal(null)} />}
      {viewHtml && <HtmlViewer item={viewHtml} onClose={() => setViewHtml(null)} />}
      {pwGate && <PwGate onSuccess={pw => { if (pw === pwGate.correct) pwGate.onSuccess(); else alert("Wrong password."); }} onCancel={() => setPwGate(null)} />}
    </div>
  );
}