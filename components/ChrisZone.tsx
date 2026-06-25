"use client";

import { useEffect, useRef, useState } from "react";
import { PROJECTS, type Project } from "@/data/projects";

type Phase = "idle" | "bios" | "winlogo" | "desktop";

interface DragState {
  id: string;
  startX: number;
  startY: number;
  origLeft: number;
  origTop: number;
}

interface WindowPos {
  top: number;
  left: number;
  zIndex: number;
  open: boolean;
}

const BIOS_LINES = [
  { id: "b0", brand: true, text: "CHRISTO BIOS v2.01A — Copyright (C) 1999 ChrisZone Corp. All Rights Reserved." },
  { id: "b1", text: "CPU: Intel Pentium II 450MHz ........................ " },
  { id: "b2", text: "Base Memory: 640KB .................................. " },
  { id: "b3", text: "Extended Memory: 64512KB ........................... " },
  { id: "b4", text: "Floppy Drive A: 1.44MB 3.5\" ....................... " },
  { id: "b5", text: "CD-ROM Drive D: ATAPI 40x .......................... " },
  { id: "b6", text: "Primary IDE Master: CHRISTO HDD 4.3GB ............. " },
  { id: "b7", text: "PnP Init: All Devices .............................. " },
  { id: "b8", text: "" },
  { id: "b9", starting: true },
];

function formatCount(n: number): string {
  return n.toLocaleString("en-GB").padStart(7, "0");
}

export default function ChrisZone() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [biosVisible, setBiosVisible] = useState<string[]>([]);
  const [barWidth, setBarWidth] = useState(0);
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set());
  const [windowPositions, setWindowPositions] = useState<Record<string, WindowPos>>(() =>
    Object.fromEntries(
      PROJECTS.map((p, i) => [
        p.id,
        { top: 28 + i * 18, left: 55 + i * 20, zIndex: 10 + i, open: false },
      ])
    )
  );
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [clock, setClock] = useState("");
  const [topZ, setTopZ] = useState(20);
  const [visitorCount, setVisitorCount] = useState<number>(1337);
  const [nowPlaying, setNowPlaying] = useState<{ isPlaying: boolean; title: string; artist: string; url: string } | null>(null);

  const drag = useRef<DragState | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Visitor counter
  useEffect(() => {
    fetch("/api/visitors")
      .then((r) => r.json())
      .then((data) => setVisitorCount(data.count))
      .catch(() => {});
  }, []);

  // Spotify now playing — poll every 30s
  useEffect(() => {
    const fetchNowPlaying = () => {
      fetch("/api/now-playing")
        .then((r) => r.json())
        .then((data) => setNowPlaying(data.title ? data : null))
        .catch(() => {});
    };
    fetchNowPlaying();
    const id = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(id);
  }, []);

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getHours() % 12 || 12;
      const m = String(now.getMinutes()).padStart(2, "0");
      const ap = now.getHours() < 12 ? "AM" : "PM";
      setClock(`${h}:${m} ${ap}`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  // Drag
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current) return;
      const { id, startX, startY, origLeft, origTop } = drag.current;
      setWindowPositions((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          left: Math.max(0, origLeft + e.clientX - startX),
          top: Math.max(0, origTop + e.clientY - startY),
        },
      }));
    };
    const onUp = () => { drag.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function bootUp() {
    if (phase !== "idle") return;
    setPhase("bios");
    BIOS_LINES.forEach((line, i) => {
      const t = setTimeout(() => setBiosVisible((prev) => [...prev, line.id]), 250 + i * 220);
      timers.current.push(t);
    });
    const t1 = setTimeout(() => setPhase("winlogo"), 3000);
    const t2 = setTimeout(() => setBarWidth(100), 3120);
    const t3 = setTimeout(() => setPhase("desktop"), 6200);
    timers.current.push(t1, t2, t3);
  }

  function shutDown() {
    setStartMenuOpen(false);
    setPhase("idle");
    setBiosVisible([]);
    setBarWidth(0);
    setOpenWindows(new Set());
    setWindowPositions(
      Object.fromEntries(
        PROJECTS.map((p, i) => [
          p.id,
          { top: 28 + i * 18, left: 55 + i * 20, zIndex: 10 + i, open: false },
        ])
      )
    );
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function openWindow(id: string) {
    const newZ = topZ + 1;
    setTopZ(newZ);
    setWindowPositions((prev) => ({ ...prev, [id]: { ...prev[id], open: true, zIndex: newZ } }));
    setOpenWindows((prev) => new Set([...prev, id]));
  }

  function closeWindow(id: string) {
    setWindowPositions((prev) => ({ ...prev, [id]: { ...prev[id], open: false } }));
    setOpenWindows((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }

  function bringToFront(id: string) {
    const newZ = topZ + 1;
    setTopZ(newZ);
    setWindowPositions((prev) => ({ ...prev, [id]: { ...prev[id], zIndex: newZ } }));
  }

  function startDrag(e: React.MouseEvent, id: string) {
    bringToFront(id);
    drag.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: windowPositions[id]?.left ?? 55,
      origTop: windowPositions[id]?.top ?? 28,
    };
    e.preventDefault();
  }

  return (
    <>
      {/* ── GEOCITIES PAGE ── */}
      <div className="geo-page">
        <div className="geo-construction">
          🚧 UNDER CONSTRUCTION — BEST VIEWED IN INTERNET EXPLORER 6.0 800×600 🚧
        </div>

        <div className="text-center py-2">
          <div className="geo-spinning">⭐</div>
          <div className="geo-name">~*~ ChrisZone ~*~</div>
          <div className="geo-sub">✨ Welcome 2 my awesome page!! ✨</div>
        </div>

        <div className="geo-rainbow" />

        <div className="geo-marquee-wrap">
          <span className="geo-marquee">
            {nowPlaying
              ? <a href={nowPlaying.url} target="_blank" rel="noopener noreferrer" style={{ color: "#ff00ff" }}>
                  {nowPlaying.isPlaying
                    ? `🎵 Now Playing: ${nowPlaying.artist} – ${nowPlaying.title} 🎵`
                    : `🎵 Last Played: ${nowPlaying.artist} – ${nowPlaying.title} 🎵`}
                </a>
              : <>🎵 ChrisZone Radio 🎵</>
            }
            &nbsp;&nbsp;&nbsp;
            Last Updated: 14/03/2025 &nbsp;&nbsp;&nbsp;
            Visitors: {formatCount(visitorCount)} &nbsp;&nbsp;&nbsp;
            No hotlinking!! &nbsp;&nbsp;&nbsp;
          </span>
        </div>

        <div className="flex gap-2 p-1">
          <div className="flex-1">
            <div className="geo-section-title">:: About Me ::</div>
            <div className="geo-text">
              Welcome 2 my page!! Backend Dev who dabbles in Web Development 😊
              <br /><br />
              My name is Chris and I like tech — check out some of my projects by
              switching on the computer below.
              <br /><br />
              MSN:{" "}
              <a className="geo-link" style={{ display: "inline" }} href="mailto:christianoginni@hotmail.com">
                christianoginni@hotmail.com
              </a>{" "}
              for any queries.
            </div>
            <br />
            <div className="geo-section-title">:: My Interests ::</div>
            <ul className="geo-ul">
              <li>Computers &amp; Coding</li>
              <li>Music (all genres!)</li>
              <li>Football ⚽</li>
              <li>Movies &amp; TV</li>
            </ul>
          </div>
          <div className="flex-1">
            <div className="geo-section-title">:: Links ::</div>
            <a className="geo-link" href="mailto:christianoginni@hotmail.com">📧 Email Me</a>
            <a className="geo-link" href="mailto:christianoginni@hotmail.com">💬 MSN Messenger</a>
            <a className="geo-link" href="https://www.instagram.com/ogs.chr/" target="_blank" rel="noopener noreferrer">
              📸 Instagram (@ogs.chr)
            </a>
            <div className="geo-counter">
              👁️ You are visitor<br />
              <span style={{ fontSize: "1.3rem", color: "#ff0000", fontWeight: "bold" }}>
                {formatCount(visitorCount)}
              </span>
              <br />
              since March 2025
            </div>
          </div>
        </div>

        <div className="geo-rainbow" />

        {/* ── TOWER SECTION ── */}
        <div className="flex items-center justify-center gap-7 py-4 px-2">
          <div style={{ maxWidth: 210 }}>
            <div className="geo-section-title">:: My Projects ::</div>
            <div className="geo-text" style={{ marginBottom: 10 }}>
              Want 2 see wat I&apos;ve been building??
              <br /><br />
              Press the power button on my PC 2 boot up and check out all my projects!!
            </div>
            <span className="tower-arrow">▶▶▶ press it!! ▶▶▶</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="pc-tower">
              <div className="tower-front-panel" />
              <div className="tower-brand-label">CHRISTO 486</div>
              <div className={`tower-power-led ${phase !== "idle" ? "lit" : ""}`} />
              <div className="tower-floppy">
                <div className="floppy-slot" />
                <div className="floppy-led" />
              </div>
              <div className="tower-cd">
                <div className="cd-slot" />
                <div className="cd-eject-btn" />
              </div>
              <button
                className="tower-power-btn"
                onClick={bootUp}
                disabled={phase !== "idle"}
                title="Power On"
              >
                <span className="power-icon">⏻</span>
              </button>
              <div className="tower-reset-btn" />
              <div className="tower-vents">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="vent-dot" />
                ))}
              </div>
            </div>
            <div className="tower-hint">💡 double-click projects to open!</div>
          </div>
        </div>

        <div className="geo-rainbow" />
        <p className="geo-footer">
          © 2025 ChrisZone — Best viewed 800×600 — IE6 only — No hotlinking plz!!
        </p>
      </div>

      {/* ── BOOT OVERLAY ── */}
      <div className={`boot-overlay ${phase === "bios" || phase === "winlogo" ? "on" : ""}`}>
        <div className={`bios-screen ${phase === "bios" ? "on" : ""}`}>
          {BIOS_LINES.map((line) => (
            <div key={line.id} className={`bios-line ${biosVisible.includes(line.id) ? "show" : ""}`}>
              {line.brand && <span className="bios-brand">{line.text}</span>}
              {!line.brand && !line.starting && (
                <>{line.text}<span className="bios-ok">OK</span></>
              )}
              {line.starting && <>Starting <span className="bios-ok">Windows 99</span>...</>}
              {line.id === "b0" && <div className="bios-hr" />}
              {line.id === "b7" && <div className="bios-hr" style={{ marginTop: 8 }} />}
            </div>
          ))}
        </div>

        <div className={`winlogo-screen ${phase === "winlogo" ? "on" : ""}`}>
          <div className="flex items-center gap-4">
            <div className="win99-flag">
              <div className="wp-r" /><div className="wp-g" />
              <div className="wp-b" /><div className="wp-y" />
            </div>
            <div className="flex flex-col">
              <div className="win99-word">Windows</div>
              <div className="win99-num">99</div>
              <div className="win99-copy">Microsoft Corporation</div>
            </div>
          </div>
          <div>
            <div className="win99-track">
              <div className="win99-bar" style={{ width: `${barWidth}%` }} />
            </div>
            <div className="win99-wait">Please wait...</div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div
        className={`desktop ${phase === "desktop" ? "on" : ""}`}
        onClick={() => { setSelectedIcon(null); setStartMenuOpen(false); }}
      >
        <div className="desktop-area">
          {PROJECTS.map((p) => (
            <DesktopIcon
              key={p.id}
              project={p}
              selected={selectedIcon === p.id}
              onSelect={() => setSelectedIcon(p.id)}
              onOpen={() => openWindow(p.id)}
            />
          ))}
          <div className="desk-icon">
            <div className="desk-icon-img">🗑️</div>
            <div className="desk-icon-label">Recycle Bin</div>
          </div>

          {PROJECTS.map((p) => {
            const pos = windowPositions[p.id];
            if (!pos) return null;
            return (
              <ProjectWindow
                key={p.id}
                project={p}
                pos={pos}
                onClose={() => closeWindow(p.id)}
                onDragStart={(e) => startDrag(e, p.id)}
                onFocus={() => bringToFront(p.id)}
              />
            );
          })}
        </div>

        <div className="desktop-taskbar">
          <div
            className="tb-start"
            onClick={(e) => { e.stopPropagation(); setStartMenuOpen((v) => !v); }}
          >
            <span>⊞</span> Start
            <div className={`start-menu ${startMenuOpen ? "open" : ""}`}>
              <div className="sm-head">👤 Chris OG</div>
              <div className="sm-item"><span>📁</span> My Projects</div>
              <div className="sm-item"><span>🌐</span> Internet Explorer</div>
              <div className="sm-item"><span>💾</span> My Computer</div>
              <div className="sm-sep" />
              <div className="sm-item" onClick={shutDown}><span>🔴</span> Shut Down</div>
            </div>
          </div>
          <div className="tb-divider" />
          <div className="tb-tasks">
            {[...openWindows].map((id) => {
              const p = PROJECTS.find((x) => x.id === id);
              if (!p) return null;
              return (
                <div key={id} className="tb-task" onClick={() => bringToFront(id)}>
                  {p.icon} {p.name}
                </div>
              );
            })}
          </div>
          <div className="tb-tray">
            <span>🔊</span>
            <span>{clock}</span>
          </div>
        </div>
      </div>
    </>
  );
}

function DesktopIcon({ project, selected, onSelect, onOpen }: {
  project: Project; selected: boolean; onSelect: () => void; onOpen: () => void;
}) {
  return (
    <div
      className={`desk-icon ${selected ? "selected" : ""}`}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onOpen(); }}
    >
      <div className="desk-icon-img">{project.icon}</div>
      <div className="desk-icon-label">{project.name}</div>
    </div>
  );
}

function ProjectWindow({ project, pos, onClose, onDragStart, onFocus }: {
  project: Project; pos: WindowPos; onClose: () => void;
  onDragStart: (e: React.MouseEvent) => void; onFocus: () => void;
}) {
  return (
    <div
      className={`proj-window ${pos.open ? "open" : ""}`}
      style={{ top: pos.top, left: pos.left, zIndex: pos.zIndex }}
      onMouseDown={onFocus}
    >
      <div className="pw-titlebar" onMouseDown={onDragStart}>
        <span style={{ fontSize: "0.82rem" }}>{project.icon}</span>
        <span className="pw-title">{project.name}</span>
        <div className="pw-btns">
          <div className="pw-btn pw-min" onClick={onClose}>_</div>
          <div className="pw-btn pw-close" onClick={onClose}>✕</div>
        </div>
      </div>
      <div className="pw-menubar">
        <span className="pw-mi">File</span>
        <span className="pw-mi">Edit</span>
        <span className="pw-mi">View</span>
      </div>
      <div className="pw-body">
        <div className="pw-proj-name"><span>{project.icon}</span> {project.name}</div>
        <div className="pw-desc">{project.desc}</div>
        <div className="pw-tech-lbl">Technologies</div>
        <div className="pw-chips">
          {project.tech.map((t) => <span key={t} className="pw-chip">{t}</span>)}
        </div>
        {project.url ? (
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            <button className="pw-view-btn">🌐 View Project</button>
          </a>
        ) : (
          <button className="pw-view-btn">🌐 View Project</button>
        )}
      </div>
    </div>
  );
}
