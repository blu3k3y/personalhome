"use client";

import React, { useState, useRef, useEffect } from "react";

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
interface Category {
  id: string;
  name: string;
}
interface InitialData {
  posts: Post[]; gallery: GalleryItem[]; htmlFiles: HtmlFile[]; categories: Category[];
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}
function stripHtml(html: string) { return html.replace(/<[^>]+>/g, "").trim(); }

/* ── Rich Editor ── */
const TB = [
  { label: "B", cmd: "bold", style: { fontWeight: 700 } as React.CSSProperties },
  { label: "I", cmd: "italic", style: { fontStyle: "italic" } as React.CSSProperties },
  { label: "U", cmd: "underline", style: { textDecoration: "underline" } as React.CSSProperties },
  { sep: true },
  { label: "H1", cmd: "formatBlock", val: "H2" },
  { label: "¶",  cmd: "formatBlock", val: "P" },
  { sep: true },
  { label: "•",  cmd: "insertUnorderedList" },
  { label: "1.", cmd: "insertOrderedList" },
  { sep: true },
  { label: "❝",  cmd: "formatBlock", val: "BLOCKQUOTE" },
  { label: "🔗", cmd: "_link" },
  { label: "✕",  cmd: "removeFormat" },
];

function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const init = useRef(false);
  const [mode, setMode] = useState<"visual"|"html">("visual");
  const [htmlSrc, setHtmlSrc] = useState(value || "");

  useEffect(() => {
    if (mode === "visual" && ref.current) {
      ref.current.innerHTML = htmlSrc || value || "";
    }
  }, [mode]);

  const exec = (cmd: string, val?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(ref.current?.innerHTML || "");
  };

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", padding: "6px 10px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
        {mode === "visual" && TB.map((t, i) => (t as any).sep
          ? <span key={i} style={{ width: 1, background: "#e5e5e5", margin: "0 4px", alignSelf: "stretch" }} />
          : <button key={i} onMouseDown={e => {
              e.preventDefault();
              if ((t as any).cmd === "_link") { const u = prompt("URL:", "https://"); if (u) exec("createLink", u); }
              else exec((t as any).cmd, (t as any).val);
            }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 7px", borderRadius: 4, fontSize: 13, color: "#555", ...(t as any).style, lineHeight: 1 }}>{t.label}</button>
        )}
        <div style={{ flex: 1 }} />
        <button onMouseDown={e => {
          e.preventDefault();
          if (mode === "visual") {
            setHtmlSrc(ref.current?.innerHTML || "");
            setMode("html");
          } else {
            onChange(htmlSrc);
            setMode("visual");
            // 모드 전환 후 DOM이 렌더링된 다음에 innerHTML 설정
            setTimeout(() => {
              if (ref.current) ref.current.innerHTML = htmlSrc;
            }, 0);
          }
        }} style={{ padding: "3px 10px", borderRadius: 5, border: `1px solid ${mode === "html" ? "#111" : "#ddd"}`, background: mode === "html" ? "#111" : "#fff", color: mode === "html" ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>{"<>"}</button>
      </div>
      {mode === "visual" && <div ref={ref} contentEditable suppressContentEditableWarning onInput={() => onChange(ref.current?.innerHTML || "")} style={{ padding: "14px 16px", minHeight: 200, outline: "none", fontSize: 15, lineHeight: 1.75, fontFamily: "inherit", color: "#1a1a1a" }} />}
      {mode === "html" && <textarea value={htmlSrc} onChange={e => { setHtmlSrc(e.target.value); onChange(e.target.value); }} spellCheck={false} style={{ width: "100%", minHeight: 240, padding: "14px 16px", border: "none", outline: "none", resize: "vertical", fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, background: "#fdfdf8", boxSizing: "border-box", display: "block" }} />}
    </div>
  );
}

/* ── Password Gate ── */
function PwGate({ correct, onSuccess, onCancel }: { correct: string; onSuccess: () => void; onCancel: () => void }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false);
  const check = () => { if (pw === correct) onSuccess(); else { setErr(true); setPw(""); } };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px", width: 340, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>비밀 콘텐츠</p>
          <p style={{ fontSize: 13, color: "#888" }}>비밀번호를 입력해주세요</p>
        </div>
        <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }} onKeyDown={e => e.key === "Enter" && check()} autoFocus placeholder="비밀번호"
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${err ? "#e53e3e" : "#ddd"}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        {err && <p style={{ color: "#e53e3e", fontSize: 12, marginTop: 6, textAlign: "center" }}>틀렸어요</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>취소</button>
          <button onClick={check} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>확인</button>
        </div>
      </div>
    </div>
  );
}

/* ── Write Modal ── */
function WriteModal({ categories, post, onSave, onClose }: { categories: string[]; post?: Post; onSave: (d: any) => void; onClose: () => void }) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || categories[0] || "");
  const [isPrivate, setIsPrivate] = useState(post?.isPrivate || false);
  const [password, setPassword] = useState(post?.password || "");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (isPrivate && !password) return alert("비밀번호를 설정해주세요.");
    setLoading(true);
    await onSave({ id: post?.id, title, content, category, isPrivate, password: isPrivate ? password : "" });
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700, padding: "32px 36px", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}>×</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{post ? "글 수정" : "새 글"}</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" style={{ width: "100%", fontSize: 20, fontWeight: 700, border: "none", outline: "none", borderBottom: "2px solid #f0f0f0", paddingBottom: 8, fontFamily: "inherit", marginBottom: 16, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: "7px 10px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 13, background: "#fafafa", fontFamily: "inherit" }}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="">미분류</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", padding: "7px 10px", border: "1px solid #e5e5e5", borderRadius: 8 }}>
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
            🔒 비밀글
          </label>
          {isPrivate && <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "7px 10px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />}
        </div>
        <RichEditor value={content} onChange={setContent} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>취소</button>
          <button onClick={save} disabled={loading} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>{loading ? "저장 중..." : post ? "수정 저장" : "발행"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Gallery Modal ── */
function GalleryModal({ item, onSave, onClose }: { item?: GalleryItem; onSave: (d: any) => void; onClose: () => void }) {
  const [title, setTitle] = useState(item?.title || "");
  const [isPrivate, setIsPrivate] = useState(item?.isPrivate || false);
  const [password, setPassword] = useState(item?.password || "");
  const [imageData, setImageData] = useState(item?.imageData || null as string | null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setImageData(ev.target?.result as string); r.readAsDataURL(f);
  };
  const save = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (isPrivate && !password) return alert("비밀번호를 설정해주세요.");
    setLoading(true);
    await onSave({ id: item?.id, title, imageData, isPrivate, password: isPrivate ? password : "" });
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: "28px 32px", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}>×</button>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>{item ? "이미지 수정" : "이미지 추가"}</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
        <label style={{ display: "block", border: "2px dashed #ddd", borderRadius: 10, padding: "24px", textAlign: "center", cursor: "pointer", marginBottom: 12, position: "relative" }}>
          <input type="file" accept="image/*" onChange={handleFile} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
          {imageData ? <img src={imageData} alt="" style={{ maxHeight: 180, borderRadius: 8, maxWidth: "100%" }} /> : <div style={{ color: "#aaa", fontSize: 13 }}><div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>클릭해서 이미지 선택</div>}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
          <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
          🔒 비밀
        </label>
        {isPrivate && <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 14, boxSizing: "border-box" }} />}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>취소</button>
          <button onClick={save} disabled={loading} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>{loading ? "저장 중..." : item ? "저장" : "추가"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Post Viewer ── */
function PostViewer({ post, onClose, onEdit }: { post: Post; onClose: () => void; onEdit: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680, padding: "36px 40px", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}>×</button>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
          {post.category && <span style={{ fontSize: 11, background: "#f5f5f5", padding: "3px 8px", borderRadius: 20, color: "#555", fontWeight: 500 }}>{post.category}</span>}
          <span style={{ fontSize: 11, color: "#bbb" }}>{fmtDate(post.createdAt)}</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.03em", marginBottom: 20, lineHeight: 1.3 }}>{post.title}</h1>
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20, fontSize: 15, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: post.content }} />
        <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onEdit} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>✏️ 수정</button>
        </div>
      </div>
    </div>
  );
}

/* ── HTML Viewer ── */
function HtmlViewer({ item, onClose }: { item: HtmlFile; onClose: () => void }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => {
    const blob = new Blob([item.htmlContent], { type: "text/html" });
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [item.htmlContent]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: fullscreen ? 0 : "20px 24px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: fullscreen ? 0 : 14, width: "100%", maxWidth: fullscreen ? "100%" : 1100, height: fullscreen ? "100vh" : "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid #f0f0f0", background: "#fafafa", flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>📄 {item.title}</span>
          <span style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace", background: "#f0f0f0", padding: "2px 7px", borderRadius: 4 }}>{item.fileName}</span>
          <button onClick={() => setFullscreen(f => !f)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>{fullscreen ? "⤓" : "⤢"}</button>
          <button onClick={onClose} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "#aaa" }}>×</button>
        </div>
        {url && <iframe src={url} sandbox="allow-scripts allow-same-origin allow-forms" style={{ flex: 1, border: "none", width: "100%", display: "block" }} title={item.title} />}
      </div>
    </div>
  );
}

/* ── SideBtn ── */
function SideBtn({ icon, label, active, onClick, count, highlight, accent }: any) {
  return (
    <button onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left", fontFamily: "inherit", background: active ? "#e7e7e5" : highlight ? "#111" : "none", color: highlight ? "#fff" : accent ? "#c05621" : active ? "#1a1a1a" : "#555", fontWeight: active || highlight ? 600 : 400, transition: "background .1s" }}
      onMouseEnter={e => { if (!active && !highlight) (e.currentTarget as HTMLElement).style.background = "#ebebea"; }}
      onMouseLeave={e => { if (!active && !highlight) (e.currentTarget as HTMLElement).style.background = "none"; }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && <span style={{ fontSize: 11, color: "#bbb" }}>{count}</span>}
    </button>
  );
}

/* ═══════════════════════════════
   MAIN COMPONENT
═══════════════════════════════ */
export default function UserHomeClient({ username, isOwner: isOwnerProp, initialData }: { username: string; isOwner: boolean; initialData: InitialData }) {
  const [posts, setPosts] = useState<Post[]>(initialData.posts);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialData.gallery);
  const [htmlFiles, setHtmlFiles] = useState<HtmlFile[]>(initialData.htmlFiles);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [isOwner, setIsOwner] = useState(isOwnerProp);

  const [section, setSection] = useState<"posts"|"gallery"|"html"|"private">("posts");
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [newCat, setNewCat] = useState("");

  const [writeModal, setWriteModal] = useState<null | { post?: Post }>(null);
  const [galModal, setGalModal] = useState<null | { item?: GalleryItem }>(null);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [viewImg, setViewImg] = useState<GalleryItem | null>(null);
  const [viewHtml, setViewHtml] = useState<HtmlFile | null>(null);
  const [pwGate, setPwGate] = useState<null | { item: any; type: string; onSuccess: () => void }>(null);

  // 서브도메인에서 쿠키 문제 우회 — API로 본인 확인
  useEffect(() => {
      const stored = localStorage.getItem("auth_username");
      if (stored === username) setIsOwner(true);
    }, [username]);

  /* ── API helpers ── */
  const api = async (url: string, method: string, body?: any) => {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  /* ── Posts ── */
  const savePost = async (d: any) => {
    if (d.id) {
      const updated = await api("/api/posts", "PUT", d);
      setPosts(ps => ps.map(p => p.id === updated.id ? { ...updated, createdAt: updated.createdAt, updatedAt: updated.updatedAt } : p));
    } else {
      const created = await api("/api/posts", "POST", d);
      setPosts(ps => [created, ...ps]);
    }
    setWriteModal(null); setViewPost(null);
  };
  const delPost = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("삭제할까요?")) return;
    await api("/api/posts", "DELETE", { id });
    setPosts(ps => ps.filter(p => p.id !== id));
  };

  /* ── Gallery ── */
  const saveGallery = async (d: any) => {
    if (d.id) {
      const updated = await api("/api/gallery", "PUT", d);
      setGallery(gs => gs.map(g => g.id === updated.id ? updated : g));
    } else {
      const created = await api("/api/gallery", "POST", d);
      setGallery(gs => [created, ...gs]);
    }
    setGalModal(null); setViewImg(null);
  };
  const delGallery = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("삭제할까요?")) return;
    await api("/api/gallery", "DELETE", { id });
    setGallery(gs => gs.filter(g => g.id !== id));
  };

  /* ── Categories ── */
  const addCat = async () => {
    const n = newCat.trim();
    if (!n) return;
    try {
      const created = await api("/api/categories", "POST", { name: n });
      setCategories(cs => [...cs, created]);
      setNewCat("");
    } catch { alert("이미 존재하는 카테고리예요."); }
  };
  const delCat = async (id: string) => {
    if (!confirm("카테고리를 삭제할까요?")) return;
    await api("/api/categories", "DELETE", { id });
    setCategories(cs => cs.filter(c => c.id !== id));
    if (activeCat === id) setActiveCat("all");
  };

  /* ── Open item (with pw check) ── */
  const openItem = (item: any, type: "post"|"gallery"|"html") => {
    const open = () => {
      if (type === "post") setViewPost(item);
      else if (type === "gallery") setViewImg(item);
      else setViewHtml(item);
    };
    if (!item.isPrivate || isOwner) { open(); return; }
    // 방문자 + 비밀글: 비밀번호 입력
    setPwGate({ item, type, onSuccess: () => { setPwGate(null); open(); } });
  };

  /* ── Filtered ── */
  const activeCatName = activeCat === "all" ? "all" : (categories.find(c => c.id === activeCat)?.name || "all");
  const filteredPosts = posts.filter(p => {
    if (section === "private") return p.isPrivate;
    if (!p.isPrivate) {
      if (activeCat !== "all" && p.category !== activeCatName) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }
    return false;
  });
  const filteredGallery = gallery.filter(g => !search || g.title.toLowerCase().includes(search.toLowerCase()));
  const filteredHtml = htmlFiles.filter(h => !search || h.title.toLowerCase().includes(search.toLowerCase()));
  const catCounts: Record<string, number> = {};
  posts.filter(p => !p.isPrivate).forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  const privateCount = posts.filter(p => p.isPrivate).length;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Georgia', serif", background: "#fff", color: "#1a1a1a", overflow: "hidden" }}>
      {/* SIDEBAR */}
      <aside style={{ width: 240, background: "#F7F7F5", borderRight: "1px solid #EBEBEA", padding: 16, display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, overflowY: "auto" }}>
        <div style={{ padding: "8px 8px 12px", borderBottom: "1px solid #EBEBEA", marginBottom: 4 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-.02em" }}>{username}'s space</h1>
          <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{posts.length} entries · {gallery.length} images</p>
        </div>

        {isOwner && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: ".1em", padding: "0 8px", marginBottom: 4 }}>WRITE</p>
            <SideBtn icon="✏️" label="새 글 쓰기" onClick={() => setWriteModal({})} highlight />
          </div>
        )}

        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: ".1em", padding: "0 8px", marginBottom: 4 }}>NAVIGATION</p>
          <SideBtn icon="📋" label="전체 글" active={section === "posts"} onClick={() => { setSection("posts"); setActiveCat("all"); }} />
          <SideBtn icon="🖼️" label="갤러리" active={section === "gallery"} onClick={() => setSection("gallery")} />
          <SideBtn icon="📄" label={`HTML files${htmlFiles.length ? ` (${htmlFiles.length})` : ""}`} active={section === "html"} onClick={() => setSection("html")} />
          {isOwner && <SideBtn icon="🔒" label={`비밀 글${privateCount ? ` (${privateCount})` : ""}`} active={section === "private"} onClick={() => setSection("private")} accent />}
        </div>

        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: ".1em", padding: "0 8px", marginBottom: 4 }}>CATEGORIES</p>
          <SideBtn icon="📂" label="전체" count={posts.filter(p=>!p.isPrivate).length} active={section === "posts" && activeCat === "all"} onClick={() => { setSection("posts"); setActiveCat("all"); }} />
          {categories.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", borderRadius: 6 }}
              onMouseEnter={e => { if (!(section === "posts" && activeCat === c.id)) (e.currentTarget as HTMLElement).style.background = "#ebebea"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <button onClick={() => { setSection("posts"); setActiveCat(c.id); }}
                style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", background: section === "posts" && activeCat === c.id ? "#e7e7e5" : "none", border: "none", cursor: "pointer", fontSize: 13, color: section === "posts" && activeCat === c.id ? "#1a1a1a" : "#555", fontWeight: section === "posts" && activeCat === c.id ? 600 : 400, borderRadius: 6, textAlign: "left" }}>
                <span style={{ fontSize: 12 }}>◈</span>
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "#bbb" }}>{catCounts[c.name] || 0}</span>
              </button>
              {isOwner && (
                <button onClick={() => delCat(c.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: "#ccc", padding: "0 6px 0 0", opacity: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.color = "#e53e3e"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}>✕</button>
              )}
            </div>
          ))}
          {isOwner && (
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && addCat()} placeholder="카테고리 추가…" style={{ flex: 1, padding: "5px 8px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 12, outline: "none", background: "#fff", fontFamily: "inherit" }} />
              <button onClick={addCat} style={{ padding: "5px 8px", border: "none", background: "#111", color: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>+</button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid #F0F0EE", padding: "10px 28px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#bbb", flex: 1 }}>
            {section === "posts" ? (activeCat === "all" ? "전체 글" : activeCat) : section === "gallery" ? "갤러리" : section === "html" ? "HTML files" : "비밀 글"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f7f7f5", border: "1px solid #ebebea", borderRadius: 8, padding: "6px 10px" }}>
            <span style={{ fontSize: 12, color: "#aaa" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="검색…" style={{ border: "none", background: "none", outline: "none", fontSize: 13, width: 120, fontFamily: "inherit" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#aaa" }}>✕</button>}
          </div>
          {isOwner && (
            section === "gallery"
              ? <button onClick={() => setGalModal({})} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>+ 이미지</button>
              : section !== "html" && <button onClick={() => setWriteModal({})} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>✏️ 쓰기</button>
          )}
        </header>

        <div style={{ flex: 1, padding: "32px 48px", maxWidth: 820, width: "100%", margin: "0 auto" }}>

          {/* POSTS */}
          {(section === "posts" || section === "private") && (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.03em" }}>{section === "private" ? "비밀 글" : activeCat === "all" ? "전체 글" : activeCat}</h2>
                <span style={{ fontSize: 13, color: "#bbb" }}>{filteredPosts.length}</span>
              </div>
              {filteredPosts.length === 0
                ? <div style={{ padding: "60px 0", textAlign: "center", color: "#ccc" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
                    <p style={{ fontSize: 14 }}>아직 글이 없어요.</p>
                  </div>
                : filteredPosts.map(post => (
                  <div key={post.id} onClick={() => openItem(post, "post")}
                    style={{ padding: "16px 0", borderBottom: "1px solid #f0f0f0", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        {post.isPrivate && <span style={{ fontSize: 10, background: "#fff7ed", color: "#c05621", padding: "2px 7px", borderRadius: 20, fontWeight: 600 }}>🔒 PRIVATE</span>}
                        {post.category && <span style={{ fontSize: 10, background: "#f5f5f5", color: "#777", padding: "2px 7px", borderRadius: 20 }}>{post.category}</span>}
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{post.isPrivate && !isOwner ? <span style={{ color: "#bbb" }}>🔒 {post.title}</span> : post.title}</h3>
                      {(!post.isPrivate || isOwner) && <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>{stripHtml(post.content)}</p>}
                      <p style={{ fontSize: 11, color: "#ccc", marginTop: 6 }}>{fmtDate(post.createdAt)}</p>
                    </div>
                    {isOwner && (
                      <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setWriteModal({ post })} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 6, fontSize: 14, opacity: 0.5 }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.background = "#f0f0f0"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; (e.currentTarget as HTMLElement).style.background = "none"; }}>✏️</button>
                        <button onClick={e => delPost(post.id, e)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 6, fontSize: 14, opacity: 0.5 }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.background = "#fde8e8"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; (e.currentTarget as HTMLElement).style.background = "none"; }}>🗑️</button>
                      </div>
                    )}
                  </div>
                ))
              }
            </>
          )}

          {/* GALLERY */}
          {section === "gallery" && (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.03em" }}>갤러리</h2>
                <span style={{ fontSize: 13, color: "#bbb" }}>{filteredGallery.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {isOwner && (
                  <div onClick={() => setGalModal({})} style={{ aspectRatio: "1", border: "2px dashed #ddd", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", color: "#bbb", fontSize: 13 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#111"; (e.currentTarget as HTMLElement).style.color = "#111"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#ddd"; (e.currentTarget as HTMLElement).style.color = "#bbb"; }}>
                    <span style={{ fontSize: 28 }}>+</span><span>추가</span>
                  </div>
                )}
                {filteredGallery.map(g => (
                  <div key={g.id} onClick={() => openItem(g, "gallery")} style={{ aspectRatio: "1", borderRadius: 12, overflow: "hidden", border: "1px solid #ebebea", cursor: "pointer", position: "relative", background: "#f7f7f5" }}>
                    {g.imageData ? <img src={g.imageData} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#ccc" }}><span style={{ fontSize: 36 }}>{g.isPrivate ? "🔒" : "🖼️"}</span><span style={{ fontSize: 11 }}>{g.title}</span></div>}
                    {isOwner && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", opacity: 0, transition: "opacity .15s", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 10 }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0"}>
                        <p style={{ fontSize: 12, color: "#fff", fontWeight: 600, marginBottom: 6 }}>{g.title}</p>
                        <div style={{ display: "flex", gap: 4 }} onClick={ev => ev.stopPropagation()}>
                          <button onClick={() => setGalModal({ item: g })} style={{ flex: 1, padding: "5px 0", background: "rgba(255,255,255,.2)", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 12 }}>수정</button>
                          <button onClick={e => delGallery(g.id, e)} style={{ flex: 1, padding: "5px 0", background: "rgba(229,62,62,.5)", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 12 }}>삭제</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* HTML FILES */}
          {section === "html" && (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.03em" }}>HTML files</h2>
                <span style={{ fontSize: 13, color: "#bbb" }}>{filteredHtml.length}</span>
              </div>
              {filteredHtml.map(h => (
                <div key={h.id} onClick={() => openItem(h, "html")} style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, borderRadius: 8 }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fafafa"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}>
                  <div style={{ width: 42, height: 48, background: "#f5f5f5", borderRadius: 6, border: "1px solid #e5e5e5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 18 }}>📄</span>
                    <span style={{ fontSize: 8, color: "#aaa", fontFamily: "monospace", marginTop: 2 }}>HTML</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{h.isPrivate && <span style={{ fontSize: 10, background: "#fff7ed", color: "#c05621", padding: "2px 7px", borderRadius: 20, marginRight: 6 }}>🔒</span>}{h.title}</div>
                    <div style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>{h.fileName} · {fmtDate(h.createdAt)}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {writeModal && <WriteModal categories={categories.map(c => c.name)} post={writeModal.post} onSave={savePost} onClose={() => setWriteModal(null)} />}
      {galModal && <GalleryModal item={galModal.item} onSave={saveGallery} onClose={() => setGalModal(null)} />}
      {viewPost && <PostViewer post={viewPost} onClose={() => setViewPost(null)} onEdit={() => { setWriteModal({ post: viewPost }); setViewPost(null); }} />}
      {viewImg && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setViewImg(null)}>
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", maxWidth: 600, width: "100%", position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewImg(null)} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.5)", border: "none", cursor: "pointer", fontSize: 16, color: "#fff", width: 30, height: 30, borderRadius: "50%", zIndex: 1 }}>×</button>
            <div style={{ background: "#1a1a1a", minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {viewImg.imageData ? <img src={viewImg.imageData} alt={viewImg.title} style={{ maxWidth: "100%", maxHeight: 400, display: "block" }} /> : <div style={{ color: "#555", fontSize: 64 }}>🖼️</div>}
            </div>
            <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div><p style={{ fontWeight: 600, fontSize: 15 }}>{viewImg.title}</p><p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{fmtDate(viewImg.createdAt)}</p></div>
              {isOwner && <button onClick={() => { setGalModal({ item: viewImg }); setViewImg(null); }} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12 }}>수정</button>}
            </div>
          </div>
        </div>
      )}
      {viewHtml && <HtmlViewer item={viewHtml} onClose={() => setViewHtml(null)} />}
      {pwGate && <PwGate correct={pwGate.item.password} onSuccess={pwGate.onSuccess} onCancel={() => setPwGate(null)} />}
    </div>
  );
}