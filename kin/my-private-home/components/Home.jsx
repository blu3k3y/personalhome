"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const STORAGE_KEY = "notion_home_v1";

const defaultData = {
  categories: ["Tech", "Art", "Life", "Travel"],
  htmlFiles: [],
  posts: [
    {
      id: "p1",
      title: "First entry",
      content: "<p>Welcome to <strong>My Archive</strong>. Start writing anything you want.</p>",
      category: "Life",
      isPrivate: false,
      password: "",
      createdAt: "2025-05-10T00:00:00Z",
    },
    {
      id: "p2",
      title: "React patterns I keep forgetting",
      content: "<p>useReducer is underrated. Here's why...</p>",
      category: "Tech",
      isPrivate: false,
      password: "",
      createdAt: "2025-05-09T00:00:00Z",
    },
    {
      id: "p3",
      title: "Private note",
      content: "<p>This is a private entry. Password is <strong>1234</strong>.</p>",
      category: "Life",
      isPrivate: true,
      password: "1234",
      createdAt: "2025-05-08T00:00:00Z",
    },
  ],
  gallery: [
    { id: "g1", title: "Spring walk", imageData: null, isPrivate: false, password: "", createdAt: "2025-05-07T00:00:00Z" },
    { id: "g2", title: "Studio session", imageData: null, isPrivate: false, password: "", createdAt: "2025-05-06T00:00:00Z" },
    { id: "g3", title: "Hidden memory", imageData: null, isPrivate: true, password: "0000", createdAt: "2025-05-05T00:00:00Z" },
  ],
};

function load() {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return defaultData;
}
function save(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, "").trim();
}

/* ── Rich text toolbar ── */
const TB = [
  { label: "B", cmd: "bold", style: { fontWeight: 700 } },
  { label: "I", cmd: "italic", style: { fontStyle: "italic" } },
  { label: "U", cmd: "underline", style: { textDecoration: "underline" } },
  { sep: true },
  { label: "H1", cmd: "formatBlock", val: "H2" },
  { label: "H2", cmd: "formatBlock", val: "H3" },
  { label: "¶", cmd: "formatBlock", val: "P" },
  { sep: true },
  { label: "•", cmd: "insertUnorderedList" },
  { label: "1.", cmd: "insertOrderedList" },
  { sep: true },
  { label: "❝", cmd: "formatBlock", val: "BLOCKQUOTE" },
  { label: "🔗", cmd: "_link" },
  { label: "✕", cmd: "removeFormat" },
];

function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const init = useRef(false);
  const [mode, setMode] = useState("visual"); // "visual" | "html"
  const [htmlSrc, setHtmlSrc] = useState(value || "");

  useEffect(() => {
    if (!init.current && ref.current) {
      ref.current.innerHTML = value || "";
      init.current = true;
    }
  }, []);

  const exec = (cmd, val = null) => {
    ref.current.focus();
    document.execCommand(cmd, false, val);
    onChange(ref.current.innerHTML);
  };

  const switchToHtml = () => {
    const current = ref.current ? ref.current.innerHTML : value;
    setHtmlSrc(current);
    setMode("html");
  };

  const switchToVisual = () => {
    onChange(htmlSrc);
    if (ref.current) ref.current.innerHTML = htmlSrc;
    setMode("visual");
  };

  const isHtml = mode === "html";

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 8, overflow: "hidden", transition: "border-color .15s" }}
      onFocusCapture={e => e.currentTarget.style.borderColor = "#111"}
      onBlurCapture={e => e.currentTarget.style.borderColor = "#e5e5e5"}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", padding: "6px 10px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
        {!isHtml && TB.map((t, i) => t.sep
          ? <span key={i} style={{ width: 1, background: "#e5e5e5", margin: "0 4px", alignSelf: "stretch" }} />
          : <button key={i} onMouseDown={e => {
              e.preventDefault();
              if (t.cmd === "_link") { const u = prompt("URL:", "https://"); if (u) exec("createLink", u); }
              else exec(t.cmd, t.val || null);
            }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 7px", borderRadius: 4, fontSize: 13, color: "#555", ...t.style, lineHeight: 1 }}
            title={t.label}>{t.label}</button>
        )}
        <div style={{ flex: 1 }} />
        {/* HTML 토글 버튼 */}
        <button
          onMouseDown={e => { e.preventDefault(); isHtml ? switchToVisual() : switchToHtml(); }}
          style={{
            padding: "3px 10px", borderRadius: 5, border: `1px solid ${isHtml ? "#111" : "#ddd"}`,
            background: isHtml ? "#111" : "#fff", color: isHtml ? "#fff" : "#555",
            cursor: "pointer", fontSize: 12, fontFamily: "monospace", fontWeight: 600, lineHeight: 1.6,
            transition: "all .15s",
          }}
          title={isHtml ? "비주얼 모드로 전환" : "HTML 소스 편집"}
        >{"<>"}</button>
      </div>

      {/* Visual editor */}
      {!isHtml && (
        <div ref={ref} contentEditable suppressContentEditableWarning
          onInput={() => onChange(ref.current.innerHTML)}
          style={{ padding: "14px 16px", minHeight: 200, outline: "none", fontSize: 15, lineHeight: 1.75, fontFamily: "inherit", color: "#1a1a1a" }} />
      )}

      {/* HTML source editor */}
      {isHtml && (
        <div style={{ position: "relative" }}>
          <textarea
            value={htmlSrc}
            onChange={e => { setHtmlSrc(e.target.value); onChange(e.target.value); }}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 240, padding: "14px 16px",
              border: "none", outline: "none", resize: "vertical",
              fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
              fontSize: 13, lineHeight: 1.7, color: "#1a1a1a",
              background: "#fdfdf8", boxSizing: "border-box",
              display: "block",
            }}
          />
          <div style={{ padding: "6px 12px", background: "#fafafa", borderTop: "1px solid #f0f0f0", fontSize: 11, color: "#aaa", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "monospace", background: "#f0f0f0", padding: "1px 5px", borderRadius: 3, color: "#666" }}>HTML</span>
            직접 태그를 입력하세요. 위의 <span style={{ fontFamily: "monospace", background: "#f0f0f0", padding: "1px 5px", borderRadius: 3, color: "#666" }}>&lt;&gt;</span> 버튼으로 비주얼 모드로 돌아갈 수 있어요.
          </div>
        </div>
      )}
    </div>
  );
}

/* ── HTML Upload Modal ── */
function HtmlUploadModal({ item, onSave, onClose }) {
  const isEdit = !!item;
  const [title, setTitle] = useState(item?.title || "");
  const [isPrivate, setIsPrivate] = useState(item?.isPrivate || false);
  const [password, setPassword] = useState(item?.password || "");
  const [htmlContent, setHtmlContent] = useState(item?.htmlContent || "");
  const [fileName, setFileName] = useState(item?.fileName || "");
  const [tab, setTab] = useState("upload"); // "upload" | "paste"

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    setFileName(f.name);
    const r = new FileReader();
    r.onload = ev => setHtmlContent(ev.target.result);
    r.readAsText(f);
  };

  const save = () => {
    if (!title.trim()) return alert("Title is required.");
    if (!htmlContent.trim()) return alert("HTML content is required.");
    if (isPrivate && !password.trim()) return alert("Set a password.");
    onSave({ title: title.trim(), htmlContent, fileName: fileName || "untitled.html", isPrivate, password: isPrivate ? password : "" });
  };

  const tabStyle = active => ({
    padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13,
    background: active ? "#111" : "#f5f5f5", color: active ? "#fff" : "#555", fontFamily: "inherit",
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, padding: "28px 32px", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}>×</button>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>{isEdit ? "Edit HTML file" : "Upload HTML file"}</h2>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
          style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 14, boxSizing: "border-box" }} />

        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <button style={tabStyle(tab === "upload")} onClick={() => setTab("upload")}>📂 파일 업로드</button>
          <button style={tabStyle(tab === "paste")} onClick={() => setTab("paste")}>📋 직접 붙여넣기</button>
        </div>

        {tab === "upload" && (
          <label style={{ display: "block", border: "2px dashed #ddd", borderRadius: 10, padding: "28px 24px", textAlign: "center", cursor: "pointer", marginBottom: 14, position: "relative", transition: "border-color .15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#111"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#ddd"}>
            <input type="file" accept=".html,.htm" onChange={handleFile} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
            {htmlContent
              ? <div style={{ color: "#333" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{fileName}</p>
                  <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{htmlContent.length.toLocaleString()} chars · 클릭해서 다시 선택</p>
                </div>
              : <div style={{ color: "#aaa" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                  <p style={{ fontSize: 13 }}>.html / .htm 파일을 선택하세요</p>
                  <p style={{ fontSize: 11, marginTop: 4 }}>클릭하거나 드래그</p>
                </div>
            }
          </label>
        )}

        {tab === "paste" && (
          <textarea value={htmlContent} onChange={e => { setHtmlContent(e.target.value); if (!fileName) setFileName("untitled.html"); }}
            placeholder={"<!DOCTYPE html>\n<html>\n<head><title>My Page</title></head>\n<body>\n  <h1>Hello!</h1>\n</body>\n</html>"}
            spellCheck={false}
            style={{ width: "100%", minHeight: 180, padding: "12px 14px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 12, fontFamily: "'Menlo','Monaco','Courier New',monospace", outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 14, lineHeight: 1.6, color: "#1a1a1a" }} />
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} style={{ accentColor: "#e07b39" }} />
            🔒 Private
          </label>
          {isPrivate && (
            <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)}
              style={{ flex: 1, padding: "7px 10px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={save} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {isEdit ? "Save" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── HTML Viewer ── */
function HtmlViewer({ item, onClose, onEdit }) {
  const [fullscreen, setFullscreen] = useState(false);
  const blob = new Blob([item.htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  useEffect(() => { return () => URL.revokeObjectURL(url); }, []);

  const viewerH = fullscreen ? "calc(100vh - 52px)" : "calc(90vh - 52px)";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: fullscreen ? 0 : "20px 24px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: fullscreen ? 0 : 14, width: "100%", maxWidth: fullscreen ? "100%" : 1100, height: fullscreen ? "100vh" : "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid #f0f0f0", background: "#fafafa", flexShrink: 0 }}>
          <span style={{ fontSize: 14 }}>📄</span>
          <span style={{ fontSize: 14, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
          <span style={{ fontSize: 11, color: "#aaa", background: "#f0f0f0", padding: "2px 7px", borderRadius: 4, fontFamily: "monospace" }}>{item.fileName}</span>
          <button onClick={onEdit} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12 }}>✏️ Edit</button>
          <button onClick={() => setFullscreen(f => !f)} title={fullscreen ? "축소" : "전체화면"}
            style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>
            {fullscreen ? "⤓" : "⤢"}
          </button>
          <button onClick={onClose} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "#aaa", lineHeight: 1 }}>×</button>
        </div>
        {/* iframe */}
        <iframe
          src={url}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          style={{ flex: 1, border: "none", width: "100%", height: viewerH, display: "block" }}
          title={item.title}
        />
      </div>
    </div>
  );
}

/* ── Password gate ── */
function PwGate({ correct, onSuccess, onCancel }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false);
  const check = () => { if (pw === correct) onSuccess(); else { setErr(true); setPw(""); } };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onCancel}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "32px 28px", width: 340, boxShadow: "0 20px 60px rgba(0,0,0,.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 20 }}>🔒</div>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Protected content</p>
          <p style={{ fontSize: 13, color: "#888" }}>Enter the password to continue.</p>
        </div>
        <input type="password" placeholder="Password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && check()}
          autoFocus
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${err ? "#e53e3e" : "#ddd"}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        {err && <p style={{ color: "#e53e3e", fontSize: 12, marginTop: 6, textAlign: "center" }}>Wrong password</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={check} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Unlock</button>
        </div>
      </div>
    </div>
  );
}

/* ── Write / Edit modal ── */
function WriteModal({ data, post, onSave, onClose }) {
  const isEdit = !!post;
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || data.categories[0] || "");
  const [isPrivate, setIsPrivate] = useState(post?.isPrivate || false);
  const [password, setPassword] = useState(post?.password || "");

  const save = () => {
    if (!title.trim()) return alert("Title is required.");
    if (isPrivate && !password.trim()) return alert("Set a password for private entries.");
    onSave({ title: title.trim(), content, category, isPrivate, password: isPrivate ? password : "" });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 700, padding: "32px 36px", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa", lineHeight: 1 }}>×</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{isEdit ? "Edit entry" : "New entry"}</h2>

        <div style={{ marginBottom: 14 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
            style={{ width: "100%", fontSize: 22, fontWeight: 700, border: "none", outline: "none", borderBottom: "2px solid #f0f0f0", paddingBottom: 8, fontFamily: "inherit", color: "#111", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ padding: "7px 10px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 13, background: "#fafafa", cursor: "pointer", fontFamily: "inherit" }}>
            {data.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", padding: "7px 10px", border: "1px solid #e5e5e5", borderRadius: 8, background: isPrivate ? "#fff7ed" : "#fafafa" }}>
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} style={{ accentColor: "#e07b39" }} />
            🔒 Private
          </label>
          {isPrivate && (
            <input type="password" placeholder="Set password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ padding: "7px 10px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          )}
        </div>

        <RichEditor value={content} onChange={setContent} />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={save} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {isEdit ? "Save changes" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Gallery modal ── */
function GalleryModal({ item, onSave, onClose }) {
  const isEdit = !!item;
  const [title, setTitle] = useState(item?.title || "");
  const [isPrivate, setIsPrivate] = useState(item?.isPrivate || false);
  const [password, setPassword] = useState(item?.password || "");
  const [imageData, setImageData] = useState(item?.imageData || null);

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setImageData(ev.target.result); r.readAsDataURL(f);
  };
  const save = () => {
    if (!title.trim()) return alert("Title is required.");
    if (isPrivate && !password.trim()) return alert("Set a password.");
    onSave({ title: title.trim(), isPrivate, password: isPrivate ? password : "", imageData });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: "28px 32px", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}>×</button>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>{isEdit ? "Edit image" : "Add to gallery"}</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
          style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
        <label style={{ display: "block", border: "2px dashed #ddd", borderRadius: 10, padding: "24px", textAlign: "center", cursor: "pointer", marginBottom: 12, position: "relative" }}>
          <input type="file" accept="image/*" onChange={handleFile} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
          {imageData
            ? <img src={imageData} alt="" style={{ maxHeight: 180, borderRadius: 8, maxWidth: "100%" }} />
            : <div style={{ color: "#aaa", fontSize: 13 }}><div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>Click to select image</div>}
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", marginBottom: isPrivate ? 10 : 18 }}>
          <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} style={{ accentColor: "#e07b39" }} />
          🔒 Private
        </label>
        {isPrivate && (
          <input type="password" placeholder="Set password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
          <button onClick={save} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            {isEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Post viewer ── */
function PostViewer({ post, catLabel, onClose, onEdit }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680, padding: "36px 40px", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}>×</button>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 11, background: "#f5f5f5", padding: "3px 8px", borderRadius: 20, color: "#555", fontWeight: 500 }}>{catLabel}</span>
          <span style={{ fontSize: 11, color: "#bbb" }}>{fmtDate(post.createdAt)}</span>
          {post.isPrivate && <span style={{ fontSize: 11, background: "#fff7ed", color: "#c05621", padding: "3px 8px", borderRadius: 20, fontWeight: 500 }}>🔒 Private</span>}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.03em", marginBottom: 20, lineHeight: 1.3 }}>{post.title}</h1>
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 20, fontSize: 15, lineHeight: 1.8, color: "#222" }} dangerouslySetInnerHTML={{ __html: post.content }} />
        <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onEdit} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            ✏️ Edit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Image viewer ── */
function ImageViewer({ item, onClose, onEdit }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", maxWidth: 600, width: "100%", position: "relative" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.5)", border: "none", cursor: "pointer", fontSize: 16, color: "#fff", width: 30, height: 30, borderRadius: "50%", lineHeight: 1, zIndex: 1 }}>×</button>
        <div style={{ background: "#1a1a1a", minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {item.imageData ? <img src={item.imageData} alt={item.title} style={{ maxWidth: "100%", maxHeight: 400, display: "block" }} />
            : <div style={{ color: "#555", fontSize: 64 }}>🖼️</div>}
        </div>
        <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</p>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{fmtDate(item.createdAt)}</p>
          </div>
          <button onClick={onEdit} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12 }}>Edit</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN APP
═══════════════════════════════════════ */
export default function NotionHome() {
  const [data, setData] = useState(defaultData);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setData(load());
    setMounted(true);
  }, []);
  const [section, setSection] = useState("posts"); // posts | gallery | private
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [newCat, setNewCat] = useState("");

  const [writeModal, setWriteModal] = useState(null);
  const [galModal, setGalModal] = useState(null);
  const [htmlModal, setHtmlModal] = useState(null);   // null | { mode, item? }
  const [viewPost, setViewPost] = useState(null);
  const [viewImg, setViewImg] = useState(null);
  const [viewHtml, setViewHtml] = useState(null);     // null | item
  const [pwGate, setPwGate] = useState(null);

  const persist = d => { setData(d); save(d); };

  /* categories */
  const addCat = () => {
    const n = newCat.trim(); if (!n || data.categories.includes(n)) return;
    persist({ ...data, categories: [...data.categories, n] }); setNewCat("");
  };
  const delCat = c => {
    if (!confirm(`Delete category "${c}"?`)) return;
    persist({ ...data, categories: data.categories.filter(x => x !== c), posts: data.posts.map(p => p.category === c ? { ...p, category: "" } : p) });
    if (activeCat === c) setActiveCat("all");
  };

  /* posts */
  const savePost = (pd, editId = null) => {
    if (editId) persist({ ...data, posts: data.posts.map(p => p.id === editId ? { ...p, ...pd } : p) });
    else persist({ ...data, posts: [{ id: "p" + Date.now(), createdAt: new Date().toISOString(), ...pd }, ...data.posts] });
    setWriteModal(null); setViewPost(null);
  };
  const delPost = (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this entry?")) return;
    persist({ ...data, posts: data.posts.filter(p => p.id !== id) });
    if (viewPost?.id === id) setViewPost(null);
  };

  /* gallery */
  const saveGallery = (gd, editId = null) => {
    if (editId) persist({ ...data, gallery: data.gallery.map(g => g.id === editId ? { ...g, ...gd } : g) });
    else persist({ ...data, gallery: [{ id: "g" + Date.now(), createdAt: new Date().toISOString(), ...gd }, ...data.gallery] });
    setGalModal(null); setViewImg(null);
  };
  const delGallery = (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this image?")) return;
    persist({ ...data, gallery: data.gallery.filter(g => g.id !== id) });
  };

  /* html files */
  const saveHtmlFile = (hd, editId = null) => {
    const files = data.htmlFiles || [];
    if (editId) persist({ ...data, htmlFiles: files.map(h => h.id === editId ? { ...h, ...hd } : h) });
    else persist({ ...data, htmlFiles: [{ id: "h" + Date.now(), createdAt: new Date().toISOString(), ...hd }, ...files] });
    setHtmlModal(null); setViewHtml(null);
  };
  const delHtmlFile = (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this HTML file?")) return;
    persist({ ...data, htmlFiles: (data.htmlFiles || []).filter(h => h.id !== id) });
  };

  /* secret unlock */
  const openItem = (item, type) => {
    const open = () => {
      if (type === "post") setViewPost(item);
      else if (type === "gallery") setViewImg(item);
      else if (type === "html") setViewHtml(item);
    };
    if (!item.isPrivate) { open(); return; }
    setPwGate({ item, type, onSuccess: () => { setPwGate(null); open(); } });
  };

  /* filtered lists */
  const filteredPosts = (() => {
    let list = section === "private" ? data.posts.filter(p => p.isPrivate) : data.posts.filter(p => !p.isPrivate);
    if (section === "posts" && activeCat !== "all") list = list.filter(p => p.category === activeCat);
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    return list;
  })();

  const filteredGallery = (() => {
    let list = data.gallery;
    if (search) list = list.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));
    return list;
  })();

  const catCounts = {};
  data.posts.filter(p => !p.isPrivate).forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  const privateCount = data.posts.filter(p => p.isPrivate).length;

  if (!mounted) return null;

  /* ── MAIN ── */
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Georgia', serif", background: "#fff", color: "#1a1a1a", overflow: "hidden" }}>
      {/* ── SIDEBAR ── */}
      <aside style={{ width: 240, background: "#F7F7F5", borderRight: "1px solid #EBEBEA", padding: 16, display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, overflowY: "auto" }}>
        <div style={{ padding: "8px 8px 12px", borderBottom: "1px solid #EBEBEA", marginBottom: 4 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-.02em" }}>My Archive</h1>
          <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{data.posts.length} entries · {data.gallery.length} images</p>
        </div>

        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: ".1em", padding: "0 8px", marginBottom: 4 }}>WRITE</p>
          <SideBtn icon="✏️" label="New entry" onClick={() => setWriteModal({ mode: "write" })} highlight />
        </div>

        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: ".1em", padding: "0 8px", marginBottom: 4 }}>NAVIGATION</p>
          <SideBtn icon="📋" label="All posts" active={section === "posts"} onClick={() => { setSection("posts"); setActiveCat("all"); }} />
          <SideBtn icon="🖼️" label="Gallery" active={section === "gallery"} onClick={() => setSection("gallery")} />
          <SideBtn icon="🎲" label={`TRPG logs${(data.htmlFiles||[]).length ? ` (${data.htmlFiles.length})` : ""}`} active={section === "html"} onClick={() => setSection("html")} />
          <SideBtn icon="🔒" label={`Private logs${privateCount ? ` (${privateCount})` : ""}`} active={section === "private"} onClick={() => setSection("private")} accent />
        </div>

        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#bbb", letterSpacing: ".1em", padding: "0 8px", marginBottom: 4 }}>CATEGORIES</p>
          <SideBtn icon="📂" label="All" count={data.posts.filter(p=>!p.isPrivate).length} active={section === "posts" && activeCat === "all"} onClick={() => { setSection("posts"); setActiveCat("all"); }} />
          {data.categories.map(c => (
            <div key={c} style={{ display: "flex", alignItems: "center", borderRadius: 6 }}
              onMouseEnter={e => { if (!(section === "posts" && activeCat === c)) e.currentTarget.style.background = "#ebebea"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <button onClick={() => { setSection("posts"); setActiveCat(c); }}
                style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, padding: "6px 8px", background: section === "posts" && activeCat === c ? "#e7e7e5" : "none", border: "none", cursor: "pointer", fontSize: 13, color: section === "posts" && activeCat === c ? "#1a1a1a" : "#555", fontWeight: section === "posts" && activeCat === c ? 600 : 400, borderRadius: 6, textAlign: "left" }}>
                <span style={{ fontSize: 12 }}>◈</span>
                <span style={{ flex: 1 }}>{c}</span>
                <span style={{ fontSize: 11, color: "#bbb" }}>{catCounts[c] || 0}</span>
              </button>
              <button onClick={() => delCat(c)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: "#ccc", padding: "0 6px 0 0", opacity: 0 }}
                onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = "#e53e3e"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = 0; }}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && addCat()} placeholder="Add category…"
              style={{ flex: 1, padding: "5px 8px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 12, outline: "none", background: "#fff", fontFamily: "inherit" }} />
            <button onClick={addCat} style={{ padding: "5px 8px", border: "none", background: "#111", color: "#fff", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>+</button>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid #F0F0EE", padding: "10px 28px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#bbb" }}>
              {section === "posts" ? (activeCat === "all" ? "All posts" : activeCat) : section === "gallery" ? "Gallery" : section === "html" ? "HTML files" : "Private logs"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f7f7f5", border: "1px solid #ebebea", borderRadius: 8, padding: "6px 10px" }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                style={{ border: "none", background: "none", outline: "none", fontSize: 13, width: 140, fontFamily: "inherit", color: "#1a1a1a" }} />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#aaa", lineHeight: 1 }}>✕</button>}
            </div>
            {section === "gallery"
              ? <button onClick={() => setGalModal({ mode: "add" })} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>+ Add image</button>
              : section === "html"
              ? <button onClick={() => setHtmlModal({ mode: "add" })} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>📄 Upload HTML</button>
              : <button onClick={() => setWriteModal({ mode: "write" })} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>✏️ Write</button>
            }
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: "32px 48px", maxWidth: 820, width: "100%", margin: "0 auto" }}>

          {/* POSTS / PRIVATE */}
          {(section === "posts" || section === "private") && (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.03em" }}>
                  {section === "private" ? "Private logs" : activeCat === "all" ? "All posts" : activeCat}
                </h2>
                <span style={{ fontSize: 13, color: "#bbb" }}>{filteredPosts.length}</span>
              </div>

              {filteredPosts.length === 0
                ? <div style={{ padding: "60px 0", textAlign: "center", color: "#ccc" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{section === "private" ? "🔒" : "✍️"}</div>
                    <p style={{ fontSize: 14 }}>No entries yet.</p>
                  </div>
                : filteredPosts.map(post => {
                    const plain = stripHtml(post.content);
                    return (
                      <div key={post.id} onClick={() => openItem(post, "post")}
                        style={{ padding: "16px 0", borderBottom: "1px solid #f0f0f0", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            {post.isPrivate && <span style={{ fontSize: 10, background: "#fff7ed", color: "#c05621", padding: "2px 7px", borderRadius: 20, fontWeight: 600 }}>🔒 PRIVATE</span>}
                            {post.category && <span style={{ fontSize: 10, background: "#f5f5f5", color: "#777", padding: "2px 7px", borderRadius: 20 }}>{post.category}</span>}
                          </div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, letterSpacing: "-.01em" }}>
                            {post.isPrivate ? <span style={{ color: "#bbb" }}>🔒 {post.title}</span> : post.title}
                          </h3>
                          {!post.isPrivate && plain && <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{plain}</p>}
                          <p style={{ fontSize: 11, color: "#ccc", marginTop: 6 }}>{fmtDate(post.createdAt)}</p>
                        </div>
                        <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                          <ActionBtn onClick={() => setWriteModal({ mode: "edit", post })} label="✏️" />
                          <ActionBtn onClick={e => delPost(post.id, e)} label="🗑️" danger />
                        </div>
                      </div>
                    );
                  })}
            </>
          )}

          {/* GALLERY */}
          {section === "gallery" && (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.03em" }}>Moments</h2>
                <span style={{ fontSize: 13, color: "#bbb" }}>{filteredGallery.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                <div onClick={() => setGalModal({ mode: "add" })}
                  style={{ aspectRatio: 1, border: "2px dashed #ddd", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", color: "#bbb", fontSize: 13 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.color = "#111"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#bbb"; }}>
                  <span style={{ fontSize: 28 }}>+</span>
                  <span>Add image</span>
                </div>
                {filteredGallery.map(g => (
                  <div key={g.id} onClick={() => openItem(g, "gallery")}
                    style={{ aspectRatio: 1, borderRadius: 12, overflow: "hidden", border: "1px solid #ebebea", cursor: "pointer", position: "relative", background: "#f7f7f5" }}
                    onMouseEnter={e => e.currentTarget.querySelector(".gal-actions").style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.querySelector(".gal-actions").style.opacity = 0}>
                    {g.imageData
                      ? <img src={g.imageData} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#ccc" }}>
                          <span style={{ fontSize: 36 }}>{g.isPrivate ? "🔒" : "🖼️"}</span>
                          <span style={{ fontSize: 11 }}>{g.title}</span>
                        </div>
                    }
                    <div className="gal-actions" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", opacity: 0, transition: "opacity .15s", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 10 }}>
                      <p style={{ fontSize: 12, color: "#fff", fontWeight: 600, marginBottom: 6 }}>{g.isPrivate ? "🔒 " : ""}{g.title}</p>
                      <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setGalModal({ mode: "edit", item: g })} style={{ flex: 1, padding: "5px 0", background: "rgba(255,255,255,.2)", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 12 }}>Edit</button>
                        <button onClick={e => delGallery(g.id, e)} style={{ flex: 1, padding: "5px 0", background: "rgba(229,62,62,.5)", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 12 }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* HTML FILES */}
          {section === "html" && (() => {
            const htmlFiles = data.htmlFiles || [];
            const filtered = search ? htmlFiles.filter(h => h.title.toLowerCase().includes(search.toLowerCase())) : htmlFiles;
            return (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.03em" }}>HTML files</h2>
                  <span style={{ fontSize: 13, color: "#bbb" }}>{filtered.length}</span>
                </div>
                {filtered.length === 0
                  ? <div style={{ padding: "60px 0", textAlign: "center", color: "#ccc" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                      <p style={{ fontSize: 14 }}>No HTML files yet.</p>
                      <button onClick={() => setHtmlModal({ mode: "add" })}
                        style={{ marginTop: 16, padding: "9px 20px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 13 }}>
                        Upload HTML
                      </button>
                    </div>
                  : filtered.map(h => (
                    <div key={h.id} onClick={() => openItem(h, "html")}
                      style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, borderRadius: 8, transition: "background .1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      {/* file icon */}
                      <div style={{ width: 42, height: 48, background: "#f5f5f5", borderRadius: 6, border: "1px solid #e5e5e5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 18 }}>📄</span>
                        <span style={{ fontSize: 8, color: "#aaa", fontFamily: "monospace", marginTop: 2 }}>HTML</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          {h.isPrivate && <span style={{ fontSize: 10, background: "#fff7ed", color: "#c05621", padding: "2px 7px", borderRadius: 20, fontWeight: 600 }}>🔒</span>}
                          <span style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</span>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>{h.fileName}</span>
                          <span style={{ fontSize: 11, color: "#ccc" }}>{fmtDate(h.createdAt)}</span>
                          <span style={{ fontSize: 11, color: "#bbb" }}>{(h.htmlContent?.length || 0).toLocaleString()} chars</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                        <ActionBtn onClick={() => setHtmlModal({ mode: "edit", item: h })} label="✏️" />
                        <ActionBtn onClick={e => delHtmlFile(h.id, e)} label="🗑️" danger />
                      </div>
                    </div>
                  ))
                }
              </>
            );
          })()}

        </div>
      </main>

      {/* Modals */}
      {writeModal?.mode === "write" && <WriteModal data={data} post={null} onSave={pd => savePost(pd)} onClose={() => setWriteModal(null)} />}
      {writeModal?.mode === "edit" && <WriteModal data={data} post={writeModal.post} onSave={pd => savePost(pd, writeModal.post.id)} onClose={() => setWriteModal(null)} />}
      {galModal?.mode === "add" && <GalleryModal onSave={gd => saveGallery(gd)} onClose={() => setGalModal(null)} />}
      {galModal?.mode === "edit" && <GalleryModal item={galModal.item} onSave={gd => saveGallery(gd, galModal.item.id)} onClose={() => setGalModal(null)} />}
      {htmlModal?.mode === "add" && <HtmlUploadModal onSave={hd => saveHtmlFile(hd)} onClose={() => setHtmlModal(null)} />}
      {htmlModal?.mode === "edit" && <HtmlUploadModal item={htmlModal.item} onSave={hd => saveHtmlFile(hd, htmlModal.item.id)} onClose={() => setHtmlModal(null)} />}
      {viewPost && <PostViewer post={viewPost} catLabel={viewPost.category || "Uncategorized"} onClose={() => setViewPost(null)} onEdit={() => { setWriteModal({ mode: "edit", post: viewPost }); setViewPost(null); }} />}
      {viewImg && <ImageViewer item={viewImg} onClose={() => setViewImg(null)} onEdit={() => { setGalModal({ mode: "edit", item: viewImg }); setViewImg(null); }} />}
      {viewHtml && <HtmlViewer item={viewHtml} onClose={() => setViewHtml(null)} onEdit={() => { setHtmlModal({ mode: "edit", item: viewHtml }); setViewHtml(null); }} />}
      {pwGate && <PwGate correct={pwGate.item.password} onSuccess={pwGate.onSuccess} onCancel={() => setPwGate(null)} />}
    </div>
  );
}

function SideBtn({ icon, label, active, onClick, count, highlight, accent }) {
  return (
    <button onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left", fontFamily: "inherit", background: active ? "#e7e7e5" : highlight ? "#111" : "none", color: highlight ? "#fff" : accent ? "#c05621" : active ? "#1a1a1a" : "#555", fontWeight: active || highlight ? 600 : 400, transition: "background .1s" }}
      onMouseEnter={e => { if (!active && !highlight) e.currentTarget.style.background = "#ebebea"; }}
      onMouseLeave={e => { if (!active && !highlight) e.currentTarget.style.background = "none"; }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && <span style={{ fontSize: 11, color: "#bbb" }}>{count}</span>}
    </button>
  );
}

function ActionBtn({ onClick, label, danger }) {
  return (
    <button onClick={onClick}
      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 6, fontSize: 14, opacity: 0.5, transition: "all .12s" }}
      onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = danger ? "#fde8e8" : "#f0f0f0"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.background = "none"; }}>
      {label}
    </button>
  );
}