"use client";

import React, { useState, useEffect, useRef } from "react";

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

const W: Record<string, React.CSSProperties> = {
  desktop: { width: "100%", minHeight: "100vh", position: "relative", overflow: "hidden", paddingBottom: 32, fontFamily: "'MS Sans Serif', Arial, sans-serif" },
  taskbar: { position: "fixed", bottom: 0, left: 0, right: 0, height: 32, background: "#c0c0c0", borderTop: "2px solid #fff", display: "flex", alignItems: "center", padding: "0 4px", gap: 4, zIndex: 200 },
  startBtn: { background: "#c0c0c0", border: "2px solid", borderColor: "#fff #808080 #808080 #fff", padding: "2px 8px", fontSize: 11, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 },
  taskbarItem: { background: "#c0c0c0", border: "2px solid", borderColor: "#808080 #fff #fff #808080", padding: "2px 10px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" as const },
  clock: { marginLeft: "auto", background: "#c0c0c0", border: "2px solid", borderColor: "#808080 #fff #fff #808080", padding: "2px 8px", fontSize: 11 },
  win: { position: "absolute" as const, background: "#c0c0c0", border: "2px solid", borderColor: "#fff #808080 #808080 #fff", minWidth: 180 },
  titlebar: { background: "linear-gradient(90deg, #000080, #1084d0)", color: "#fff", fontSize: 11, fontWeight: "bold", padding: "3px 4px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "move", userSelect: "none" as const },
  winBtn: { width: 16, height: 14, background: "#c0c0c0", border: "1px solid", borderColor: "#fff #808080 #808080 #fff", color: "#000", fontSize: 9, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  menubar: { display: "flex", padding: "2px 4px", borderBottom: "1px solid #808080", fontSize: 11 },
  statusbar: { borderTop: "2px solid", borderColor: "#808080 #fff #fff #808080", padding: "2px 6px", fontSize: 10, color: "#000", display: "flex", gap: 8 },
  statusPanel: { border: "2px solid", borderColor: "#808080 #fff #fff #808080", padding: "1px 6px", fontSize: 10 },
  input98: { background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", fontSize: 11, padding: "2px 4px", width: "100%", fontFamily: "inherit", outline: "none" },
  btn98: { background: "#c0c0c0", border: "2px solid", borderColor: "#fff #808080 #808080 #fff", padding: "3px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" },
};

const PRESETS = [
  { label: "기본 (파스텔)", value: "linear-gradient(135deg, #c8d8e8 0%, #d4c8e8 50%, #e8d4c8 100%)" },
  { label: "민트", value: "linear-gradient(135deg, #a8edca 0%, #c8f0e0 100%)" },
  { label: "라벤더", value: "linear-gradient(135deg, #c9b8e8 0%, #e8d4f0 100%)" },
  { label: "선셋", value: "linear-gradient(135deg, #f8c8a8 0%, #f0a0a0 50%, #c8a8e8 100%)" },
  { label: "딥 블루", value: "linear-gradient(135deg, #1a2a4a 0%, #2a4a6a 100%)" },
  { label: "순수 흰색", value: "#ffffff" },
  { label: "클래식 회색", value: "#008080" },
];

/* ── PwGate ── */
function PwGate({ onSuccess, onCancel }: { onSuccess: (pw: string) => void; onCancel: () => void }) {
  const [pw, setPw] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#c0c0c0", border: "2px solid", borderColor: "#fff #808080 #808080 #fff", width: 280 }}>
        <div style={W.titlebar}><span>🔒 Password Required</span><div style={W.winBtn} onClick={onCancel}>✕</div></div>
        <div style={{ padding: 12 }}>
          <p style={{ fontSize: 11, marginBottom: 8 }}>Enter password:</p>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && onSuccess(pw)} autoFocus style={{ ...W.input98, marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button style={W.btn98} onClick={() => onSuccess(pw)}>OK</button>
            <button style={W.btn98} onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Win98Window ── */
function Win98Window({ title, icon = "📄", children, initialPos, onClose, zIndex = 10, onFocus, onMinimize }: {
  title: string; icon?: string; children: React.ReactNode;
  initialPos: { x: number; y: number }; onClose: () => void;
  zIndex?: number; onFocus?: () => void; onMinimize?: () => void;
}) {
  const [pos, setPos] = useState(initialPos);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    onFocus?.();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({ x: dragRef.current.origX + ev.clientX - dragRef.current.startX, y: dragRef.current.origY + ev.clientY - dragRef.current.startY });
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div style={{ ...W.win, left: pos.x, top: pos.y, zIndex }} onMouseDown={() => onFocus?.()}>
      <div style={W.titlebar} onMouseDown={onMouseDown}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 12 }}>{icon}</span>{title}</span>
        <div style={{ display: "flex", gap: 2 }}>
          <div style={W.winBtn} onMouseDown={e => { e.stopPropagation(); onMinimize?.(); }}>_</div>
          <div style={W.winBtn} onMouseDown={e => e.stopPropagation()}>□</div>
          <div style={W.winBtn} onMouseDown={e => { e.stopPropagation(); onClose(); }}>✕</div>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Settings Window ── */
function SettingsWindow({ bg, onChangeBg, onClose, isOwner }: {
  bg: string; onChangeBg: (v: string) => void; onClose: () => void; isOwner: boolean;
}) {
  const [customColor, setCustomColor] = useState("#008080");
  const [imgData, setImgData] = useState<string | null>(null);
  const [tab, setTab] = useState<"preset"|"color"|"image">("preset");

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      const data = ev.target?.result as string;
      setImgData(data);
      onChangeBg(`url(${data}) center/cover no-repeat`);
    };
    r.readAsDataURL(f);
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "2px 10px", cursor: "pointer", fontSize: 11,
    background: active ? "#fff" : "#c0c0c0",
    borderTop: active ? "2px solid #fff" : "none",
    borderLeft: active ? "2px solid #fff" : "none",
    borderRight: active ? "2px solid #808080" : "none",
    marginBottom: active ? -1 : 0,
  });

  return (
    <Win98Window title="Display Properties" icon="⚙️" initialPos={{ x: 120, y: 80 }} onClose={onClose} zIndex={60}>
      <div style={{ width: 360 }}>
        {/* Tab bar */}
        <div style={{ display: "flex", padding: "6px 6px 0", borderBottom: "2px solid #808080", background: "#c0c0c0" }}>
          <div style={tabStyle(tab === "preset")} onClick={() => setTab("preset")}>배경 선택</div>
          <div style={tabStyle(tab === "color")} onClick={() => setTab("color")}>단색</div>
          <div style={tabStyle(tab === "image")} onClick={() => setTab("image")}>이미지</div>
        </div>

        <div style={{ padding: 12 }}>
          {/* 미리보기 */}
          <div style={{ width: "100%", height: 80, background: bg, border: "2px solid", borderColor: "#808080 #fff #fff #808080", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", textShadow: "1px 1px 0 #000" }}>미리보기</span>
          </div>

          {/* Presets */}
          {tab === "preset" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }}>
              {PRESETS.map(p => (
                <div key={p.value} onClick={() => onChangeBg(p.value)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", cursor: "pointer", border: bg === p.value ? "2px solid #000080" : "2px solid transparent", background: bg === p.value ? "#d0d8ff" : "transparent" }}>
                  <div style={{ width: 32, height: 18, background: p.value, border: "1px solid #808080", flexShrink: 0 }} />
                  <span style={{ fontSize: 11 }}>{p.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Color */}
          {tab === "color" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 11 }}>색상 선택:</p>
              <input type="color" value={customColor} onChange={e => { setCustomColor(e.target.value); onChangeBg(e.target.value); }}
                style={{ width: "100%", height: 40, border: "2px solid", borderColor: "#808080 #fff #fff #808080", cursor: "pointer" }} />
              <p style={{ fontSize: 10, color: "#808080" }}>선택한 색: {customColor}</p>
            </div>
          )}

          {/* Image */}
          {tab === "image" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 11 }}>이미지 파일 선택:</p>
              <label style={{ display: "block", border: "2px solid", borderColor: "#808080 #fff #fff #808080", background: "#fff", padding: "16px", textAlign: "center", cursor: "pointer", position: "relative" }}>
                <input type="file" accept="image/*" onChange={handleImg} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                {imgData
                  ? <div><div style={{ fontSize: 20 }}>✅</div><p style={{ fontSize: 10, marginTop: 4 }}>이미지 적용됨</p></div>
                  : <div><div style={{ fontSize: 24 }}>🖼️</div><p style={{ fontSize: 10, marginTop: 4 }}>클릭해서 이미지 선택</p></div>
                }
              </label>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 12 }}>
            <button style={W.btn98} onClick={onClose}>확인</button>
            <button style={W.btn98} onClick={() => onChangeBg(PRESETS[0].value)}>기본값</button>
          </div>
        </div>
      </div>
    </Win98Window>
  );
}

/* ── WriteWindow ── */
function WriteWindow({ categories, post, onSave, onClose, onMinimize }: {
  categories: Category[]; post?: Post; onSave: (d: any) => Promise<void>; onClose: () => void; onMinimize?: () => void;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "");
  const [isPrivate, setIsPrivate] = useState(post?.isPrivate || false);
  const [password, setPassword] = useState(post?.password || "");
  const [htmlMode, setHtmlMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!htmlMode && editorRef.current) editorRef.current.innerHTML = content; }, [htmlMode]);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    setContent(editorRef.current?.innerHTML || "");
  };

  const save = async () => {
    if (!title.trim()) return alert("제목을 입력해주세요.");
    setLoading(true);
    await onSave({ id: post?.id, title, content, category, isPrivate, password: isPrivate ? password : "" });
    setLoading(false);
  };

  return (
    <Win98Window title={post ? "Edit Entry" : "New Entry"} icon="📝" initialPos={{ x: 80, y: 60 }} onClose={onClose} onMinimize={onMinimize} zIndex={50}>
      <div style={W.menubar}><span style={{ padding: "1px 6px" }}>File</span><span style={{ padding: "1px 6px" }}>Format</span></div>
      <div style={{ display: "flex", gap: 2, padding: "3px 4px", borderBottom: "1px solid #808080", flexWrap: "wrap" as const, alignItems: "center" }}>
        {[{l:"B",c:"bold"},{l:"I",c:"italic"},{l:"U",c:"underline"}].map(t => (
          <button key={t.c} onMouseDown={e => { e.preventDefault(); exec(t.c); }} style={{ ...W.winBtn, width: 20, height: 18, fontSize: 10 }}>{t.l}</button>
        ))}
        <div style={{ width: 1, height: 14, background: "#808080", margin: "0 2px" }} />
        <button onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }} style={{ ...W.winBtn, width: 20, height: 18, fontSize: 10 }}>•</button>
        <div style={{ width: 1, height: 14, background: "#808080", margin: "0 2px" }} />
        <button onMouseDown={e => { e.preventDefault(); setHtmlMode(m => !m); }} style={{ ...W.winBtn, width: 30, height: 18, fontSize: 9, background: htmlMode ? "#808080" : "#c0c0c0", color: htmlMode ? "#fff" : "#000" }}>{"<>"}</button>
      </div>
      <div style={{ padding: 8, width: 460 }}>
        <div style={{ marginBottom: 6, display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 11, width: 40 }}>Title:</span>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ ...W.input98, flex: 1 }} />
        </div>
        <div style={{ marginBottom: 6, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" as const }}>
          <span style={{ fontSize: 11, width: 40 }}>Cat:</span>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", fontSize: 11, height: 20 }}>
            <option value="">— none —</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer" }}>
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
            🔒 Private
          </label>
          {isPrivate && <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...W.input98, width: 100 }} />}
        </div>
        {!htmlMode
          ? <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={() => setContent(editorRef.current?.innerHTML || "")} style={{ background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", minHeight: 160, padding: 6, fontSize: 11, outline: "none", lineHeight: 1.6 }} />
          : <textarea value={content} onChange={e => setContent(e.target.value)} style={{ background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", width: "100%", minHeight: 160, padding: 6, fontSize: 11, fontFamily: "monospace", outline: "none", resize: "vertical" }} />
        }
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={W.btn98} onClick={onClose}>Cancel</button>
          <button style={W.btn98} onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </div>
      </div>
      <div style={W.statusbar}><span style={W.statusPanel}>{htmlMode ? "HTML" : "Visual"}</span></div>
    </Win98Window>
  );
}

/* ── PostViewWindow ── */
function PostViewWindow({ post, onClose, onEdit, isOwner, onMinimize }: { post: Post; onClose: () => void; onEdit: () => void; isOwner: boolean; onMinimize?: () => void }) {
  return (
    <Win98Window title={post.title} icon="📄" initialPos={{ x: 100, y: 80 }} onClose={onClose} onMinimize={onMinimize} zIndex={45}>
      <div style={W.menubar}><span style={{ padding: "1px 6px" }}>File</span></div>
      <div style={{ padding: 10, width: 420, maxHeight: 320, overflow: "auto" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" as const }}>
          {post.category && <span style={{ fontSize: 10, background: "#000080", color: "#fff", padding: "1px 6px" }}>{post.category}</span>}
          <span style={{ fontSize: 10, color: "#808080" }}>{fmtDate(post.createdAt)}</span>
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.7, borderTop: "1px solid #808080", paddingTop: 8 }} dangerouslySetInnerHTML={{ __html: post.content }} />
        {isOwner && <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}><button style={W.btn98} onClick={onEdit}>✏️ Edit</button></div>}
      </div>
      <div style={W.statusbar}><span style={W.statusPanel}>Read</span></div>
    </Win98Window>
  );
}

/* ── GalleryWindow ── */
function GalleryWindow({ gallery, isOwner, onAdd, onView, onClose, onMinimize }: { gallery: GalleryItem[]; isOwner: boolean; onAdd: () => void; onView: (g: GalleryItem) => void; onClose: () => void; onMinimize?: () => void }) {
  return (
    <Win98Window title="Gallery" icon="🖼️" initialPos={{ x: 320, y: 55 }} onClose={onClose} onMinimize={onMinimize} zIndex={20}>
      <div style={W.menubar}>{isOwner && <span style={{ padding: "1px 6px", cursor: "pointer" }} onClick={onAdd}>+ Add</span>}<span style={{ padding: "1px 6px" }}>View</span></div>
      <div style={{ padding: 8, width: 220, maxHeight: 260, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {gallery.map(g => (
            <div key={g.id} onClick={() => onView(g)} style={{ background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", padding: 4, textAlign: "center", cursor: "pointer", fontSize: 9 }}>
              {g.imageData ? <img src={g.imageData} alt={g.title} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", marginBottom: 2 }} /> : <div style={{ fontSize: 22, marginBottom: 2 }}>{g.isPrivate ? "🔒" : "🖼️"}</div>}
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{g.title}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={W.statusbar}><span style={W.statusPanel}>{gallery.length} items</span></div>
    </Win98Window>
  );
}

/* ── HtmlFilesWindow ── */
function HtmlFilesWindow({ files, isOwner, onOpen, onAdd, onClose, onMinimize }: { files: HtmlFile[]; isOwner: boolean; onOpen: (f: HtmlFile) => void; onAdd: () => void; onClose: () => void; onMinimize?: () => void }) {
  return (
    <Win98Window title="HTML Files" icon="🌐" initialPos={{ x: 60, y: 200 }} onClose={onClose} onMinimize={onMinimize} zIndex={20}>
      <div style={W.menubar}>{isOwner && <span style={{ padding: "1px 6px", cursor: "pointer" }} onClick={onAdd}>+ Upload</span>}<span style={{ padding: "1px 6px" }}>View</span></div>
      <div style={{ padding: 8, width: 240 }}>
        {files.length === 0 ? <p style={{ fontSize: 11, color: "#808080" }}>No HTML files yet.</p>
          : files.map(f => (
            <div key={f.id} onClick={() => onOpen(f)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 4px", cursor: "pointer", fontSize: 11 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#000080"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#000"; }}>
              <span>📄</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{f.fileName}</span>
              <span style={{ fontSize: 10, opacity: 0.6 }}>{f.isPrivate ? "🔒" : ""}</span>
            </div>
          ))
        }
      </div>
      <div style={W.statusbar}><span style={W.statusPanel}>{files.length} file(s)</span></div>
    </Win98Window>
  );
}

/* ── HtmlUploadModal98 ── */
function HtmlUploadModal98({ item, onSave, onClose }: { item?: HtmlFile; onSave: (d: any) => Promise<void>; onClose: () => void }) {
  const [title, setTitle] = useState(item?.title || "");
  const [fileName, setFileName] = useState(item?.fileName || "");
  const [htmlContent, setHtmlContent] = useState(item?.htmlContent || "");
  const [isPrivate, setIsPrivate] = useState(item?.isPrivate || false);
  const [password, setPassword] = useState(item?.password || "");
  const [tab, setTab] = useState<"upload"|"paste">("upload");
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFileName(f.name);
    const r = new FileReader(); r.onload = ev => setHtmlContent(ev.target?.result as string); r.readAsText(f);
  };
  const save = async () => {
    if (!title.trim()) return alert("Title is required.");
    if (!htmlContent.trim()) return alert("HTML content is required.");
    if (isPrivate && !password) return alert("Set a password.");
    setLoading(true);
    await onSave({ id: item?.id, title, fileName: fileName || "untitled.html", htmlContent, isPrivate, password: isPrivate ? password : "" });
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#c0c0c0", border: "2px solid", borderColor: "#fff #808080 #808080 #fff", width: 420 }} onClick={e => e.stopPropagation()}>
        <div style={W.titlebar}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span>🌐</span>{item ? "Edit HTML" : "Upload HTML"}</span>
          <div style={W.winBtn} onClick={onClose}>✕</div>
        </div>
        <div style={W.menubar}>
          <span style={{ padding: "1px 6px", background: tab === "upload" ? "#fff" : "transparent", cursor: "pointer" }} onClick={() => setTab("upload")}>📂 File</span>
          <span style={{ padding: "1px 6px", background: tab === "paste" ? "#fff" : "transparent", cursor: "pointer" }} onClick={() => setTab("paste")}>📋 Paste</span>
        </div>
        <div style={{ padding: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11 }}>Title: </span>
            <input value={title} onChange={e => setTitle(e.target.value)} style={{ ...W.input98, width: "calc(100% - 40px)" }} />
          </div>
          {tab === "upload" && (
            <label style={{ display: "block", border: "2px solid", borderColor: "#808080 #fff #fff #808080", background: "#fff", padding: "20px", textAlign: "center", cursor: "pointer", marginBottom: 8, position: "relative" }}>
              <input type="file" accept=".html,.htm" onChange={handleFile} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
              {htmlContent ? <div style={{ fontSize: 11 }}><div style={{ fontSize: 20 }}>✅</div><div style={{ fontWeight: "bold" }}>{fileName}</div></div>
                : <div style={{ fontSize: 11, color: "#808080" }}><div style={{ fontSize: 24 }}>📄</div>Click to select .html file</div>}
            </label>
          )}
          {tab === "paste" && (
            <textarea value={htmlContent} onChange={e => { setHtmlContent(e.target.value); if (!fileName) setFileName("untitled.html"); }} spellCheck={false}
              placeholder={"<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello</h1>\n</body>\n</html>"}
              style={{ width: "100%", minHeight: 120, background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", fontSize: 11, fontFamily: "monospace", padding: 6, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 8 }} />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer" }}>
              <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
              🔒 Private
            </label>
            {isPrivate && <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...W.input98, flex: 1 }} />}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
            <button style={W.btn98} onClick={onClose}>Cancel</button>
            <button style={W.btn98} onClick={save} disabled={loading}>{loading ? "Saving..." : item ? "Save" : "Upload"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── DesktopIcon ── */
function DesktopIcon({ icon, label, onClick, x, y }: { icon: string; label: string; onClick: () => void; x: number; y: number }) {
  return (
    <div onClick={onClick} style={{ position: "absolute", left: x, top: y, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", padding: 4, width: 64, textAlign: "center" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,128,0.5)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 10, color: "#fff", textShadow: "1px 1px 0 #000", wordBreak: "break-word" as const }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════ MAIN ═══════════════════════════ */
export default function Win98Home({ username, isOwner: isOwnerProp, initialData }: {
  username: string; isOwner: boolean; initialData: InitialData;
}) {
  const [posts, setPosts] = useState<Post[]>(initialData.posts);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialData.gallery);
  const [htmlFiles, setHtmlFiles] = useState<HtmlFile[]>(initialData.htmlFiles);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [isOwner, setIsOwner] = useState(isOwnerProp);
  const [clock, setClock] = useState("");
  const [bg, setBg] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem(`bg_${username}`) || PRESETS[0].value;
    return PRESETS[0].value;
  });

  const [wins, setWins] = useState({ posts: false, gallery: false, htmlFiles: false, write: false, view: false, galView: false, htmlView: false });
  const [minimized, setMinimized] = useState({ posts: false, gallery: false, htmlFiles: false, write: false, view: false, galView: false, htmlView: false, settings: false, cats: false });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [catWinOpen, setCatWinOpen] = useState(false);
  const [writePost, setWritePost] = useState<Post | undefined>();
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [viewGal, setViewGal] = useState<GalleryItem | null>(null);
  const [viewHtml, setViewHtml] = useState<HtmlFile | null>(null);
  const [pwGate, setPwGate] = useState<null | { item: any; type: string; correct: string; onSuccess: () => void }>(null);
  const [newCat, setNewCat] = useState("");
  const [htmlModal, setHtmlModal] = useState<null | { item?: HtmlFile }>(null);
  const [activeCat98, setActiveCat98] = useState("all");

  const filteredPosts98 = activeCat98 === "all"
    ? posts
    : posts.filter(p => {
        const cat = categories.find(c => c.id === activeCat98);
        return cat ? p.category === cat.name : true;
      });

  useEffect(() => {
    const tick = () => { const d = new Date(); setClock(`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.username === username) setIsOwner(true); })
      .catch(() => {});
  }, [username]);

  const handleBgChange = (v: string) => {
    setBg(v);
    if (typeof window !== "undefined") localStorage.setItem(`bg_${username}`, v);
  };

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
    setWins(w => ({ ...w, write: false }));
  };

  const delPost = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    await api("/api/posts", "DELETE", { id });
    setPosts(ps => ps.filter(p => p.id !== id));
  };

  const saveHtmlFile = async (d: any) => {
    if (d.id) {
      const u = await api("/api/htmlfiles", "PUT", d);
      setHtmlFiles(fs => fs.map(f => f.id === u.id ? u : f));
    } else {
      const c = await api("/api/htmlfiles", "POST", d);
      setHtmlFiles(fs => [c, ...fs]);
    }
    setHtmlModal(null);
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
  };

  const openItem = (item: any, type: "post" | "gallery" | "html") => {
    const open = () => {
      if (type === "post") { setViewPost(item); setWins(w => ({ ...w, view: true })); }
      else if (type === "gallery") { setViewGal(item); setWins(w => ({ ...w, galView: true })); }
      else { setViewHtml(item); setWins(w => ({ ...w, htmlView: true })); }
    };
    if (!item.isPrivate || isOwner) { open(); return; }
    setPwGate({ item, type, correct: item.password, onSuccess: () => { setPwGate(null); open(); } });
  };

  return (
    <div style={{ ...W.desktop, background: bg }}>
      {/* Left icons */}
      <DesktopIcon icon="🗑️" label="Trash" onClick={() => {}} x={12} y={12} />
      <DesktopIcon icon="⚙️" label="Settings" onClick={() => setSettingsOpen(true)} x={12} y={90} />

      {/* Right icons */}
      <div style={{ position: "absolute", right: 12, top: 12, display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { icon: "✏️", label: "Write", onClick: () => { if (isOwner) { setWritePost(undefined); setWins(w => ({ ...w, write: true })); } } },
          { icon: "📋", label: "Posts", onClick: () => setWins(w => ({ ...w, posts: true })) },
          { icon: "📂", label: "Categories", onClick: () => setCatWinOpen(true) },
          { icon: "🖼️", label: "Gallery", onClick: () => setWins(w => ({ ...w, gallery: true })) },
          { icon: "🌐", label: "HTML", onClick: () => setWins(w => ({ ...w, htmlFiles: true })) },
        ].map(item => (
          <div key={item.label} onClick={item.onClick}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", padding: 4, width: 64, textAlign: "center" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,128,0.5)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: "#fff", textShadow: "1px 1px 0 #000" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Settings Window */}
      {settingsOpen && (
        <div style={{ display: minimized.settings ? "none" : "block" }}>
          <SettingsWindow bg={bg} onChangeBg={handleBgChange} onClose={() => { setSettingsOpen(false); setMinimized(m => ({ ...m, settings: false })); }} isOwner={isOwner} />
        </div>
      )}

      {/* Categories Window */}
      {catWinOpen && (
        <div style={{ display: minimized.cats ? "none" : "block" }}>
        <Win98Window title="Categories" icon="📂" initialPos={{ x: 100, y: 120 }} onClose={() => { setCatWinOpen(false); setMinimized(m => ({ ...m, cats: false })); }} zIndex={20}>
          <div style={W.menubar}><span style={{ padding: "1px 6px" }}>Manage</span></div>
          <div style={{ width: 240, padding: 8 }}>
            {categories.length === 0
              ? <div style={{ fontSize: 11, color: "#808080", padding: "8px 4px" }}>No categories yet.</div>
              : categories.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 4px", borderBottom: "1px solid #d0d0d0", fontSize: 11 }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#e0e0e0"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <span>📁</span>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  {isOwner && <button onClick={() => delCat(c.id)} style={{ ...W.btn98, padding: "1px 6px", fontSize: 10, color: "#c00" }}>✕</button>}
                </div>
              ))
            }
            {isOwner && (
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && addCat()} placeholder="New category..." style={{ ...W.input98, flex: 1, fontSize: 11 }} />
                <button onClick={addCat} style={{ ...W.btn98, fontSize: 11 }}>Add</button>
              </div>
            )}
          </div>
          <div style={W.statusbar}><span style={W.statusPanel}>{categories.length} item(s)</span></div>
        </Win98Window>
        </div>
      )}

      {/* Posts Window */}
      {wins.posts && (
        <div style={{ display: minimized.posts ? "none" : "block" }}>
        <Win98Window title={`${username}'s Posts`} icon="📋" initialPos={{ x: 12, y: 170 }} onClose={() => { setWins(w => ({ ...w, posts: false })); setMinimized(m => ({ ...m, posts: false })); }} onMinimize={() => setMinimized(m => ({ ...m, posts: true }))} zIndex={15}>
          <div style={W.menubar}>
            {isOwner && <span style={{ padding: "1px 6px", cursor: "pointer" }} onClick={() => { setWritePost(undefined); setWins(w => ({ ...w, write: true })); }}>+ New</span>}
            <span style={{ padding: "1px 6px" }}>View</span>
            <select value={activeCat98} onChange={e => setActiveCat98(e.target.value)}
              style={{ marginLeft: "auto", background: "#fff", border: "1px solid #808080", fontSize: 10, height: 18, padding: "0 2px", cursor: "pointer" }}>
              <option value="all">전체</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ width: 300, maxHeight: 260, overflow: "auto" }}>
            {filteredPosts98.length === 0
              ? <div style={{ padding: 12, fontSize: 11, color: "#808080", textAlign: "center" }}>No posts yet.</div>
              : filteredPosts98.map(post => (
                <div key={post.id} onClick={() => openItem(post, "post")}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11, borderBottom: "1px solid #d0d0d0" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#000080"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#000"; }}>
                  <span>{post.isPrivate ? "🔒" : "📄"}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{post.title}</span>
                  {post.category && <span style={{ fontSize: 9, background: "#000080", color: "#fff", padding: "1px 4px", flexShrink: 0 }}>{post.category}</span>}
                  <span style={{ fontSize: 10, opacity: 0.7, flexShrink: 0 }}>{fmtDate(post.createdAt)}</span>
                  {isOwner && <span onClick={e => { e.stopPropagation(); delPost(post.id); }} style={{ fontSize: 10, cursor: "pointer", opacity: 0.6, flexShrink: 0 }}>🗑️</span>}
                </div>
              ))
            }
          </div>
          <div style={W.statusbar}><span style={W.statusPanel}>{filteredPosts98.length} item(s)</span></div>
        </Win98Window>
        </div>
      )}

      {wins.gallery && <div style={{ display: minimized.gallery ? "none" : "block" }}><GalleryWindow gallery={gallery} isOwner={isOwner} onAdd={() => {}} onView={g => openItem(g, "gallery")} onClose={() => { setWins(w => ({ ...w, gallery: false })); setMinimized(m => ({ ...m, gallery: false })); }} onMinimize={() => setMinimized(m => ({ ...m, gallery: true }))} /></div>}
      {wins.htmlFiles && <div style={{ display: minimized.htmlFiles ? "none" : "block" }}><HtmlFilesWindow files={htmlFiles} isOwner={isOwner} onOpen={f => openItem(f, "html")} onAdd={() => setHtmlModal({})} onClose={() => { setWins(w => ({ ...w, htmlFiles: false })); setMinimized(m => ({ ...m, htmlFiles: false })); }} onMinimize={() => setMinimized(m => ({ ...m, htmlFiles: true }))} /></div>}
      {wins.write && isOwner && <div style={{ display: minimized.write ? "none" : "block" }}><WriteWindow categories={categories} post={writePost} onSave={savePost} onClose={() => { setWins(w => ({ ...w, write: false })); setMinimized(m => ({ ...m, write: false })); }} onMinimize={() => setMinimized(m => ({ ...m, write: true }))} /></div>}
      {wins.view && viewPost && <div style={{ display: minimized.view ? "none" : "block" }}><PostViewWindow post={viewPost} isOwner={isOwner} onEdit={() => { setWritePost(viewPost); setWins(w => ({ ...w, view: false, write: true })); }} onClose={() => { setWins(w => ({ ...w, view: false })); setMinimized(m => ({ ...m, view: false })); }} onMinimize={() => setMinimized(m => ({ ...m, view: true }))} /></div>}

      {wins.galView && viewGal && (
        <Win98Window title={viewGal.title} icon="🖼️" initialPos={{ x: 150, y: 80 }} onClose={() => setWins(w => ({ ...w, galView: false }))} zIndex={40}>
          <div style={{ padding: 8, maxWidth: 400 }}>
            {viewGal.imageData ? <img src={viewGal.imageData} alt={viewGal.title} style={{ maxWidth: "100%", maxHeight: 300, display: "block" }} /> : <div style={{ width: 200, height: 150, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🖼️</div>}
            <p style={{ fontSize: 10, color: "#808080", marginTop: 4 }}>{fmtDate(viewGal.createdAt)}</p>
          </div>
        </Win98Window>
      )}

      {wins.htmlView && viewHtml && (() => {
        const blob = new Blob([viewHtml.htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        return (
          <Win98Window title={viewHtml.title} icon="🌐" initialPos={{ x: 80, y: 60 }} onClose={() => { setWins(w => ({ ...w, htmlView: false })); URL.revokeObjectURL(url); }} zIndex={45}>
            <div style={{ width: 600, height: 400 }}><iframe src={url} sandbox="allow-scripts allow-same-origin" style={{ width: "100%", height: "100%", border: "none", display: "block" }} title={viewHtml.title} /></div>
          </Win98Window>
        );
      })()}

      {pwGate && <PwGate onSuccess={pw => { if (pw === pwGate.correct) pwGate.onSuccess(); else alert("Wrong password."); }} onCancel={() => setPwGate(null)} />}
      {htmlModal !== null && <HtmlUploadModal98 item={htmlModal.item} onSave={saveHtmlFile} onClose={() => setHtmlModal(null)} />}

      {/* Taskbar */}
      <div style={W.taskbar}>
        <div style={W.startBtn}>🪟 Start</div>
        {wins.posts && <div style={{ ...W.taskbarItem, background: minimized.posts ? "#c0c0c0" : "#a0a0a0" }} onClick={() => setMinimized(m => ({ ...m, posts: !m.posts }))}>📋 Posts</div>}
        {wins.gallery && <div style={{ ...W.taskbarItem, background: minimized.gallery ? "#c0c0c0" : "#a0a0a0" }} onClick={() => setMinimized(m => ({ ...m, gallery: !m.gallery }))}>🖼️ Gallery</div>}
        {wins.htmlFiles && <div style={{ ...W.taskbarItem, background: minimized.htmlFiles ? "#c0c0c0" : "#a0a0a0" }} onClick={() => setMinimized(m => ({ ...m, htmlFiles: !m.htmlFiles }))}>🌐 HTML Files</div>}
        {wins.write && <div style={{ ...W.taskbarItem, background: minimized.write ? "#c0c0c0" : "#a0a0a0" }} onClick={() => setMinimized(m => ({ ...m, write: !m.write }))}>📝 New Entry</div>}
        {wins.view && <div style={{ ...W.taskbarItem, background: minimized.view ? "#c0c0c0" : "#a0a0a0" }} onClick={() => setMinimized(m => ({ ...m, view: !m.view }))}>📄 Post</div>}
        {settingsOpen && <div style={{ ...W.taskbarItem, background: minimized.settings ? "#c0c0c0" : "#a0a0a0" }} onClick={() => setMinimized(m => ({ ...m, settings: !m.settings }))}>⚙️ Settings</div>}
        {catWinOpen && <div style={{ ...W.taskbarItem, background: minimized.cats ? "#c0c0c0" : "#a0a0a0" }} onClick={() => setMinimized(m => ({ ...m, cats: !m.cats }))}>📂 Categories</div>}
        <div style={W.clock}>{clock}</div>
      </div>
    </div>
  );
}