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
function stripHtml(html: string) { return html.replace(/<[^>]+>/g, "").trim(); }

/* ── Win98 styles ── */
const W: Record<string, React.CSSProperties> = {
  desktop: {
    width: "100%", minHeight: "100vh",
    background: "linear-gradient(135deg, #c8d8e8 0%, #d4c8e8 50%, #e8d4c8 100%)",
    position: "relative", overflow: "hidden", paddingBottom: 32,
    fontFamily: "'MS Sans Serif', Arial, sans-serif",
  },
  taskbar: {
    position: "fixed", bottom: 0, left: 0, right: 0, height: 32,
    background: "#c0c0c0", borderTop: "2px solid #fff",
    display: "flex", alignItems: "center", padding: "0 4px", gap: 4, zIndex: 200,
  },
  startBtn: {
    background: "#c0c0c0", border: "2px solid",
    borderColor: "#fff #808080 #808080 #fff",
    padding: "2px 8px", fontSize: 11, fontWeight: "bold",
    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
  },
  taskbarItem: {
    background: "#c0c0c0", border: "2px solid",
    borderColor: "#808080 #fff #fff #808080",
    padding: "2px 10px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" as const,
  },
  clock: {
    marginLeft: "auto", background: "#c0c0c0", border: "2px solid",
    borderColor: "#808080 #fff #fff #808080", padding: "2px 8px", fontSize: 11,
  },
  win: {
    position: "absolute" as const, background: "#c0c0c0", border: "2px solid",
    borderColor: "#fff #808080 #808080 #fff", minWidth: 180,
  },
  titlebar: {
    background: "linear-gradient(90deg, #000080, #1084d0)",
    color: "#fff", fontSize: 11, fontWeight: "bold",
    padding: "3px 4px", display: "flex", alignItems: "center",
    justifyContent: "space-between", cursor: "move", userSelect: "none" as const,
  },
  winBtn: {
    width: 16, height: 14, background: "#c0c0c0", border: "1px solid",
    borderColor: "#fff #808080 #808080 #fff", color: "#000",
    fontSize: 9, fontWeight: "bold", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  menubar: {
    display: "flex", padding: "2px 4px",
    borderBottom: "1px solid #808080", fontSize: 11,
  },
  statusbar: {
    borderTop: "2px solid", borderColor: "#808080 #fff #fff #808080",
    padding: "2px 6px", fontSize: 10, color: "#000",
    display: "flex", gap: 8,
  },
  statusPanel: {
    border: "2px solid", borderColor: "#808080 #fff #fff #808080",
    padding: "1px 6px", fontSize: 10,
  },
  input98: {
    background: "#fff", border: "2px solid",
    borderColor: "#808080 #fff #fff #808080",
    fontSize: 11, padding: "2px 4px", width: "100%",
    fontFamily: "inherit", outline: "none",
  },
  btn98: {
    background: "#c0c0c0", border: "2px solid",
    borderColor: "#fff #808080 #808080 #fff",
    padding: "3px 12px", fontSize: 11, cursor: "pointer",
    fontFamily: "inherit",
  },
};

/* ── Password Gate ── */
function PwGate({ onSuccess, onCancel }: { onSuccess: (pw: string) => void; onCancel: () => void }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#c0c0c0", border: "2px solid", borderColor: "#fff #808080 #808080 #fff", width: 280 }}>
        <div style={W.titlebar}>
          <span>🔒 Password Required</span>
          <div style={W.winBtn} onClick={onCancel}>✕</div>
        </div>
        <div style={{ padding: 12 }}>
          <p style={{ fontSize: 11, marginBottom: 8 }}>Enter password to view this content:</p>
          <input type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === "Enter" && onSuccess(pw)}
            autoFocus style={{ ...W.input98, marginBottom: 8 }} />
          {err && <p style={{ fontSize: 10, color: "red", marginBottom: 8 }}>Wrong password.</p>}
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button style={W.btn98} onClick={() => onSuccess(pw)}>OK</button>
            <button style={W.btn98} onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Draggable Window ── */
function Win98Window({ title, icon = "📄", children, initialPos, onClose, taskbarLabel, zIndex = 10, onFocus }: {
  title: string; icon?: string; children: React.ReactNode;
  initialPos: { x: number; y: number }; onClose: () => void;
  taskbarLabel?: string; zIndex?: number; onFocus?: () => void;
}) {
  const [pos, setPos] = useState(initialPos);
  const [minimized, setMinimized] = useState(false);
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

  if (minimized) return null;

  return (
    <div style={{ ...W.win, left: pos.x, top: pos.y, zIndex }} onMouseDown={() => onFocus?.()}>
      <div style={W.titlebar} onMouseDown={onMouseDown}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12 }}>{icon}</span>
          {title}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          <div style={W.winBtn} onMouseDown={e => { e.stopPropagation(); setMinimized(true); }}>_</div>
          <div style={W.winBtn} onMouseDown={e => e.stopPropagation()}>□</div>
          <div style={W.winBtn} onMouseDown={e => { e.stopPropagation(); onClose(); }}>✕</div>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Write Window ── */
function WriteWindow({ categories, post, onSave, onClose, isOwner }: {
  categories: Category[]; post?: Post; onSave: (d: any) => Promise<void>;
  onClose: () => void; isOwner: boolean;
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
    if (!title.trim()) return alert("제목을 입력해주세요.");
    setLoading(true);
    await onSave({ id: post?.id, title, content, category, isPrivate, password: isPrivate ? password : "" });
    setLoading(false);
  };

  return (
    <Win98Window title={post ? "Edit Entry" : "New Entry — Notepad"} icon="📝"
      initialPos={{ x: 80, y: 60 }} onClose={onClose} zIndex={50}>
      <div style={{ ...W.menubar }}>
        <span style={{ padding: "1px 6px", cursor: "pointer" }}>File</span>
        <span style={{ padding: "1px 6px", cursor: "pointer" }}>Edit</span>
        <span style={{ padding: "1px 6px", cursor: "pointer" }}>Format</span>
      </div>
      <div style={{ display: "flex", gap: 2, padding: "3px 4px", borderBottom: "1px solid #808080", flexWrap: "wrap" as const, alignItems: "center" }}>
        {[
          { l: "B", cmd: "bold", s: { fontWeight: "bold" } as React.CSSProperties },
          { l: "I", cmd: "italic", s: { fontStyle: "italic" } as React.CSSProperties },
          { l: "U", cmd: "underline", s: { textDecoration: "underline" } as React.CSSProperties },
        ].map(t => (
          <button key={t.cmd} onMouseDown={e => { e.preventDefault(); exec(t.cmd); }}
            style={{ ...W.winBtn, width: 20, height: 18, fontSize: 10, ...t.s }}>{t.l}</button>
        ))}
        <div style={{ width: 1, height: 14, background: "#808080", margin: "0 2px" }} />
        <button onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }}
          style={{ ...W.winBtn, width: 20, height: 18, fontSize: 10 }}>•</button>
        <button onMouseDown={e => { e.preventDefault(); exec("formatBlock", "BLOCKQUOTE"); }}
          style={{ ...W.winBtn, width: 20, height: 18, fontSize: 9 }}>❝</button>
        <div style={{ width: 1, height: 14, background: "#808080", margin: "0 2px" }} />
        <button onMouseDown={e => { e.preventDefault(); setHtmlMode(m => !m); }}
          style={{ ...W.winBtn, width: 30, height: 18, fontSize: 9, background: htmlMode ? "#808080" : "#c0c0c0", color: htmlMode ? "#fff" : "#000" }}>{"<>"}</button>
      </div>
      <div style={{ padding: 8, width: 460 }}>
        <div style={{ marginBottom: 6, display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 11, width: 40 }}>Title:</span>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ ...W.input98, flex: 1 }} />
        </div>
        <div style={{ marginBottom: 6, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" as const }}>
          <span style={{ fontSize: 11, width: 40 }}>Cat:</span>
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", fontSize: 11, height: 20 }}>
            <option value="">— none —</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: "pointer" }}>
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
            🔒 Private
          </label>
          {isPrivate && <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ ...W.input98, width: 100 }} />}
        </div>
        {!htmlMode
          ? <div ref={editorRef} contentEditable suppressContentEditableWarning
              onInput={() => setContent(editorRef.current?.innerHTML || "")}
              style={{ background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", minHeight: 160, padding: 6, fontSize: 11, outline: "none", lineHeight: 1.6 }} />
          : <textarea value={content} onChange={e => setContent(e.target.value)}
              style={{ background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", width: "100%", minHeight: 160, padding: 6, fontSize: 11, fontFamily: "monospace", outline: "none", resize: "vertical" }} />
        }
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 8 }}>
          <button style={W.btn98} onClick={onClose}>Cancel</button>
          <button style={W.btn98} onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </div>
      </div>
      <div style={W.statusbar}>
        <span style={W.statusPanel}>{htmlMode ? "HTML Mode" : "Visual Mode"}</span>
      </div>
    </Win98Window>
  );
}

/* ── Post Viewer Window ── */
function PostViewWindow({ post, onClose, onEdit, isOwner }: { post: Post; onClose: () => void; onEdit: () => void; isOwner: boolean }) {
  return (
    <Win98Window title={post.title} icon="📄" initialPos={{ x: 100, y: 80 }} onClose={onClose} zIndex={45}>
      <div style={{ ...W.menubar }}>
        <span style={{ padding: "1px 6px" }}>File</span>
        <span style={{ padding: "1px 6px" }}>Edit</span>
      </div>
      <div style={{ padding: 10, width: 420, maxHeight: 320, overflow: "auto" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" as const }}>
          {post.category && <span style={{ fontSize: 10, background: "#000080", color: "#fff", padding: "1px 6px" }}>{post.category}</span>}
          <span style={{ fontSize: 10, color: "#808080" }}>{fmtDate(post.createdAt)}</span>
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.7, borderTop: "1px solid #808080", paddingTop: 8 }}
          dangerouslySetInnerHTML={{ __html: post.content }} />
        {isOwner && (
          <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
            <button style={W.btn98} onClick={onEdit}>✏️ Edit</button>
          </div>
        )}
      </div>
      <div style={W.statusbar}><span style={W.statusPanel}>Read</span></div>
    </Win98Window>
  );
}

/* ── Gallery Window ── */
function GalleryWindow({ gallery, isOwner, onAdd, onView, onClose }: {
  gallery: GalleryItem[]; isOwner: boolean;
  onAdd: () => void; onView: (g: GalleryItem) => void; onClose: () => void;
}) {
  return (
    <Win98Window title="Gallery Viewer" icon="🖼️" initialPos={{ x: 320, y: 55 }} onClose={onClose} zIndex={20}>
      <div style={{ ...W.menubar }}>
        {isOwner && <span style={{ padding: "1px 6px", cursor: "pointer" }} onClick={onAdd}>+ Add</span>}
        <span style={{ padding: "1px 6px" }}>View</span>
      </div>
      <div style={{ padding: 8, width: 220, maxHeight: 260, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
          {gallery.map(g => (
            <div key={g.id} onClick={() => onView(g)}
              style={{ background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", padding: 4, textAlign: "center", cursor: "pointer", fontSize: 9 }}>
              {g.imageData
                ? <img src={g.imageData} alt={g.title} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", marginBottom: 2 }} />
                : <div style={{ fontSize: 22, marginBottom: 2 }}>{g.isPrivate ? "🔒" : "🖼️"}</div>
              }
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{g.title}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={W.statusbar}><span style={W.statusPanel}>{gallery.length} items</span></div>
    </Win98Window>
  );
}

/* ── HTML Files Window ── */
function HtmlFilesWindow({ files, isOwner, onOpen, onClose }: {
  files: HtmlFile[]; isOwner: boolean; onOpen: (f: HtmlFile) => void; onClose: () => void;
}) {
  return (
    <Win98Window title="HTML Files" icon="🌐" initialPos={{ x: 60, y: 200 }} onClose={onClose} zIndex={20}>
      <div style={{ padding: 8, width: 200 }}>
        {files.length === 0
          ? <p style={{ fontSize: 11, color: "#808080" }}>No HTML files yet.</p>
          : files.map(f => (
            <div key={f.id} onClick={() => onOpen(f)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 4px", cursor: "pointer", fontSize: 11 }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#000080"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <span>📄</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{f.fileName}</span>
            </div>
          ))
        }
      </div>
      <div style={W.statusbar}><span style={W.statusPanel}>{files.length} file(s)</span></div>
    </Win98Window>
  );
}

/* ── Desktop Icon ── */
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

/* ═══════════════════════════════════════
   MAIN WIN98 COMPONENT
═══════════════════════════════════════ */
export default function Win98Home({ username, isOwner: isOwnerProp, initialData }: {
  username: string; isOwner: boolean; initialData: InitialData;
}) {
  const [posts, setPosts] = useState<Post[]>(initialData.posts);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialData.gallery);
  const [htmlFiles, setHtmlFiles] = useState<HtmlFile[]>(initialData.htmlFiles);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [isOwner, setIsOwner] = useState(isOwnerProp);
  const [rightX, setRightX] = useState(700);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const update = () => setRightX(window.innerWidth - 88);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Windows open state
  const [wins, setWins] = useState({
    posts: false, gallery: false, htmlFiles: false,
    write: false, view: false, galView: false, htmlView: false,
  });
  const [writePost, setWritePost] = useState<Post | undefined>();
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const [viewGal, setViewGal] = useState<GalleryItem | null>(null);
  const [viewHtml, setViewHtml] = useState<HtmlFile | null>(null);
  const [pwGate, setPwGate] = useState<null | { item: any; type: string; correct: string; onSuccess: () => void }>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`);
    };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

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
      const updated = await api("/api/posts", "PUT", d);
      setPosts(ps => ps.map(p => p.id === updated.id ? updated : p));
    } else {
      const created = await api("/api/posts", "POST", d);
      setPosts(ps => [created, ...ps]);
    }
    setWins(w => ({ ...w, write: false }));
  };
  const delPost = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    await api("/api/posts", "DELETE", { id });
    setPosts(ps => ps.filter(p => p.id !== id));
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
    <div style={W.desktop}>
      {/* Desktop Icons — left */}
      <DesktopIcon icon="🗑️" label="Trash" onClick={() => {}} x={12} y={12} />
      <DesktopIcon icon="⚙️" label="Settings" onClick={() => {}} x={12} y={90} />

      {/* Desktop Icons — right */}
      <div style={{ position: "absolute", right: 12, top: 12, display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { icon: "✏️", label: "Write", onClick: () => { if (isOwner) { setWritePost(undefined); setWins(w => ({ ...w, write: true })); } } },
          { icon: "🖼️", label: "Gallery", onClick: () => setWins(w => ({ ...w, gallery: true })) },
          { icon: "📂", label: "Categories", onClick: () => setWins(w => ({ ...w, posts: true })) },
          { icon: "🌐", label: "HTML Files", onClick: () => setWins(w => ({ ...w, htmlFiles: true })) },
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

      {/* Posts Window */}
      {wins.posts && (
        <Win98Window title={`${username}'s Posts`} icon="📋" initialPos={{ x: 12, y: 170 }} onClose={() => setWins(w => ({ ...w, posts: false }))} zIndex={15}>
          <div style={{ ...W.menubar }}>
            {isOwner && <span style={{ padding: "1px 6px", cursor: "pointer" }} onClick={() => { setWritePost(undefined); setWins(w => ({ ...w, write: true })); }}>+ New</span>}
            <span style={{ padding: "1px 6px" }}>View</span>
          </div>
          <div style={{ width: 280, maxHeight: 220, overflow: "auto" }}>
            {posts.length === 0
              ? <div style={{ padding: 12, fontSize: 11, color: "#808080", textAlign: "center" }}>No posts yet.</div>
              : posts.map(post => (
                <div key={post.id} onClick={() => openItem(post, "post")}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11, borderBottom: "1px solid #d0d0d0" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#000080"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#000"; }}>
                  <span>{post.isPrivate ? "🔒" : "📄"}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{post.title}</span>
                  <span style={{ fontSize: 10, color: "inherit", opacity: 0.7 }}>{fmtDate(post.createdAt)}</span>
                  {isOwner && (
                    <span onClick={e => { e.stopPropagation(); delPost(post.id); }}
                      style={{ fontSize: 10, cursor: "pointer", opacity: 0.6 }}>🗑️</span>
                  )}
                </div>
              ))
            }
          </div>
          <div style={W.statusbar}><span style={W.statusPanel}>{posts.length} item(s)</span></div>
        </Win98Window>
      )}

      {/* Gallery Window */}
      {wins.gallery && (
        <GalleryWindow gallery={gallery} isOwner={isOwner}
          onAdd={() => {}} onView={g => openItem(g, "gallery")}
          onClose={() => setWins(w => ({ ...w, gallery: false }))} />
      )}

      {/* HTML Files Window */}
      {wins.htmlFiles && (
        <HtmlFilesWindow files={htmlFiles} isOwner={isOwner}
          onOpen={f => openItem(f, "html")}
          onClose={() => setWins(w => ({ ...w, htmlFiles: false }))} />
      )}

      {/* Write Window */}
      {wins.write && isOwner && (
        <WriteWindow categories={categories} post={writePost} onSave={savePost}
          onClose={() => setWins(w => ({ ...w, write: false }))} isOwner={isOwner} />
      )}

      {/* Post View Window */}
      {wins.view && viewPost && (
        <PostViewWindow post={viewPost} isOwner={isOwner}
          onEdit={() => { setWritePost(viewPost); setWins(w => ({ ...w, view: false, write: true })); }}
          onClose={() => setWins(w => ({ ...w, view: false }))} />
      )}

      {/* Gallery View */}
      {wins.galView && viewGal && (
        <Win98Window title={viewGal.title} icon="🖼️" initialPos={{ x: 150, y: 80 }} onClose={() => setWins(w => ({ ...w, galView: false }))} zIndex={40}>
          <div style={{ padding: 8, maxWidth: 400 }}>
            {viewGal.imageData
              ? <img src={viewGal.imageData} alt={viewGal.title} style={{ maxWidth: "100%", maxHeight: 300, display: "block" }} />
              : <div style={{ width: 200, height: 150, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🖼️</div>
            }
            <p style={{ fontSize: 10, color: "#808080", marginTop: 4 }}>{fmtDate(viewGal.createdAt)}</p>
          </div>
        </Win98Window>
      )}

      {/* HTML View */}
      {wins.htmlView && viewHtml && (() => {
        const blob = new Blob([viewHtml.htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        return (
          <Win98Window title={viewHtml.title} icon="🌐" initialPos={{ x: 80, y: 60 }} onClose={() => { setWins(w => ({ ...w, htmlView: false })); URL.revokeObjectURL(url); }} zIndex={45}>
            <div style={{ width: 600, height: 400 }}>
              <iframe src={url} sandbox="allow-scripts allow-same-origin" style={{ width: "100%", height: "100%", border: "none", display: "block" }} title={viewHtml.title} />
            </div>
          </Win98Window>
        );
      })()}

      {/* Password Gate */}
      {pwGate && (
        <PwGate
          onSuccess={pw => { if (pw === pwGate.correct) pwGate.onSuccess(); else alert("Wrong password."); }}
          onCancel={() => setPwGate(null)}
        />
      )}

      {/* Taskbar */}
      <div style={W.taskbar}>
        <div style={W.startBtn}>🪟 Start</div>
        {wins.posts && <div style={W.taskbarItem}>📋 Posts</div>}
        {wins.gallery && <div style={W.taskbarItem}>🖼️ Gallery</div>}
        {wins.htmlFiles && <div style={W.taskbarItem}>🌐 HTML Files</div>}
        {wins.write && <div style={W.taskbarItem}>📝 New Entry</div>}
        <div style={W.clock}>{clock}</div>
      </div>
    </div>
  );
}