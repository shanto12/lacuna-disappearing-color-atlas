"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ChapterId = "prologue" | "pre-blue" | "glass-heat" | "rain-memory" | "borrowed-hour" | "afterimage";

type Palette = {
  base: string;
  deep: string;
  light: string;
  flare: string;
};

const chapters: Array<{ id: ChapterId; numeral: string; label: string }> = [
  { id: "prologue", numeral: "00", label: "Prologue" },
  { id: "pre-blue", numeral: "I", label: "Pre-blue" },
  { id: "glass-heat", numeral: "II", label: "Glass Heat" },
  { id: "rain-memory", numeral: "III", label: "Rain Memory" },
  { id: "borrowed-hour", numeral: "IV", label: "Borrowed Hour" },
  { id: "afterimage", numeral: "V", label: "Afterimage" },
];

const palettes: Record<ChapterId, Palette> = {
  prologue: { base: "#24133a", deep: "#100a20", light: "#b89cff", flare: "#9bf4ff" },
  "pre-blue": { base: "#2d2a62", deep: "#121333", light: "#9bf4ff", flare: "#d4c7ff" },
  "glass-heat": { base: "#6e274f", deep: "#2e1238", light: "#ff8a5c", flare: "#f65fcf" },
  "rain-memory": { base: "#155d65", deep: "#0a2f42", light: "#1fc7b6", flare: "#b5e95d" },
  "borrowed-hour": { base: "#25306b", deep: "#111735", light: "#ff776d", flare: "#b89cff" },
  afterimage: { base: "#5a315f", deep: "#24133a", light: "#ffb3d1", flare: "#9bf4ff" },
};

const filmFrames = [
  {
    time: "12:06",
    title: "White heat, violet edge",
    copy: "The brightest surface keeps a violet border where the eye cannot quite hold it.",
    className: "frame-one",
  },
  {
    time: "13:42",
    title: "Noon through linen",
    copy: "A thin weave turns daylight into weather: warm in one direction, cool in the other.",
    className: "frame-two",
  },
  {
    time: "14:19",
    title: "The shadow remembers blue",
    copy: "Color does not leave the dark. It waits there, compressed and almost legible.",
    className: "frame-three",
  },
];

function toRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function LightField({ chapter, motionEnabled, still, lingering }: {
  chapter: ChapterId;
  motionEnabled: boolean;
  still: boolean;
  lingering: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const palette = palettes[chapter];
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let start = performance.now();
    let visible = !document.hidden;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer || !motionEnabled) return;
      pointer.targetX = event.clientX / Math.max(1, width);
      pointer.targetY = event.clientY / Math.max(1, height);
    };

    const draw = (now: number) => {
      const timeScale = lingering ? 0.08 : still ? 0.22 : 1;
      const time = ((now - start) / 1000) * timeScale;
      pointer.x += (pointer.targetX - pointer.x) * 0.045;
      pointer.y += (pointer.targetY - pointer.y) * 0.045;

      context.globalCompositeOperation = "source-over";
      context.fillStyle = palette.deep;
      context.fillRect(0, 0, width, height);

      const wash = context.createLinearGradient(0, 0, width, height);
      wash.addColorStop(0, toRgba(palette.base, 0.96));
      wash.addColorStop(0.5, toRgba(palette.deep, 0.74));
      wash.addColorStop(1, toRgba(palette.light, 0.5));
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);

      const bandCount = width < 700 ? 8 : 13;
      context.globalCompositeOperation = "screen";
      for (let index = 0; index < bandCount; index += 1) {
        const fraction = index / Math.max(1, bandCount - 1);
        const bandWidth = width * (0.13 + (index % 3) * 0.024);
        const pointerShear = (pointer.x - 0.5) * width * (0.035 + fraction * 0.025);
        const phase = time * (0.16 + (index % 4) * 0.025) + index * 0.71;
        const centerX = fraction * width + Math.sin(phase) * width * 0.045 + pointerShear;
        const lean = (pointer.y - 0.5) * width * 0.04 + Math.cos(phase * 0.7) * width * 0.018;
        const gradient = context.createLinearGradient(centerX - bandWidth, 0, centerX + bandWidth, height);
        gradient.addColorStop(0, "rgba(255,255,255,0)");
        gradient.addColorStop(0.25, toRgba(index % 2 ? palette.light : palette.flare, 0.06));
        gradient.addColorStop(0.52, toRgba(index % 2 ? palette.flare : palette.light, 0.25));
        gradient.addColorStop(0.76, toRgba(palette.base, 0.08));
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        context.beginPath();
        context.moveTo(centerX - bandWidth * 0.5, -height * 0.08);
        context.bezierCurveTo(
          centerX + lean - bandWidth * 0.15,
          height * 0.28,
          centerX - lean - bandWidth * 0.4,
          height * 0.68,
          centerX + bandWidth * 0.15,
          height * 1.08,
        );
        context.lineTo(centerX + bandWidth, height * 1.08);
        context.bezierCurveTo(
          centerX + lean + bandWidth * 0.75,
          height * 0.7,
          centerX - lean + bandWidth * 0.55,
          height * 0.3,
          centerX + bandWidth * 0.55,
          -height * 0.08,
        );
        context.closePath();
        context.fillStyle = gradient;
        context.fill();
      }

      context.globalCompositeOperation = "soft-light";
      const raking = context.createLinearGradient(0, pointer.y * height, width, (1 - pointer.y) * height);
      raking.addColorStop(0, "rgba(255,255,255,0)");
      raking.addColorStop(Math.max(0.05, pointer.x - 0.06), "rgba(255,255,255,0)");
      raking.addColorStop(pointer.x, toRgba(palette.flare, still ? 0.19 : 0.32));
      raking.addColorStop(Math.min(0.95, pointer.x + 0.05), "rgba(255,255,255,0)");
      raking.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = raking;
      context.fillRect(0, 0, width, height);

      if (motionEnabled && visible) frame = window.requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible && motionEnabled) {
        window.cancelAnimationFrame(frame);
        start = performance.now();
        frame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    draw(performance.now());

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [chapter, lingering, motionEnabled, still]);

  return <canvas ref={canvasRef} className="light-field" aria-hidden="true" />;
}

function ChapterMarker({ numeral, label }: { numeral: string; label: string }) {
  return (
    <p className="chapter-marker" aria-hidden="true">
      <span>{numeral}</span>
      {label}
    </p>
  );
}

export default function Home() {
  const [activeChapter, setActiveChapter] = useState<ChapterId>("prologue");
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [still, setStill] = useState(true);
  const [firstLight, setFirstLight] = useState(false);
  const [filmIndex, setFilmIndex] = useState(0);
  const [rainDistilled, setRainDistilled] = useState(false);
  const [lingering, setLingering] = useState(false);
  const [specimen, setSpecimen] = useState<{ edition: string; time: string; chapter: string } | null>(null);
  const [status, setStatus] = useState("The atlas is ready.");
  const indexButtonRef = useRef<HTMLButtonElement>(null);
  const firstIndexLinkRef = useRef<HTMLAnchorElement>(null);
  const indexPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stored = window.localStorage.getItem("lacuna-motion");
    const setupFrame = window.requestAnimationFrame(() => {
      setMotionEnabled(stored === null ? !preference.matches : stored === "on");
      setMotionReady(true);
    });

    const onPreferenceChange = () => {
      if (window.localStorage.getItem("lacuna-motion") === null) setMotionEnabled(!preference.matches);
    };
    preference.addEventListener("change", onPreferenceChange);
    return () => {
      window.cancelAnimationFrame(setupFrame);
      preference.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? "on" : "paused";
  }, [motionEnabled]);

  useEffect(() => {
    const observed = chapters
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveChapter(visible.target.id as ChapterId);
      },
      { rootMargin: "-28% 0px -52% 0px", threshold: [0, 0.2, 0.45, 0.7] },
    );
    observed.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!motionEnabled) return;
    let timer = window.setTimeout(() => setStill(true), 1200);
    const agitate = () => {
      setStill(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setStill(true), 1200);
    };
    window.addEventListener("pointermove", agitate, { passive: true });
    window.addEventListener("scroll", agitate, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", agitate);
      window.removeEventListener("scroll", agitate);
    };
  }, [motionEnabled]);

  useEffect(() => {
    if (!indexOpen) return;
    firstIndexLinkRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIndexOpen(false);
        indexButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!indexPanelRef.current?.contains(target) && !indexButtonRef.current?.contains(target)) setIndexOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [indexOpen]);

  const activeLabel = useMemo(
    () => chapters.find((chapter) => chapter.id === activeChapter)?.label ?? "Prologue",
    [activeChapter],
  );
  const settled = !motionEnabled || still;

  const toggleMotion = () => {
    const next = !motionEnabled;
    setMotionEnabled(next);
    setLingering(false);
    window.localStorage.setItem("lacuna-motion", next ? "on" : "off");
    setStatus(next ? "Ambient motion resumed." : "Ambient motion paused.");
  };

  const chooseFilmFrame = useCallback((nextIndex: number) => {
    const safeIndex = Math.min(filmFrames.length - 1, Math.max(0, nextIndex));
    setFilmIndex(safeIndex);
    setStatus(`Frame ${safeIndex + 1} of ${filmFrames.length}: ${filmFrames[safeIndex].title}.`);
  }, []);

  const keepLight = () => {
    const now = new Date();
    const edition = String((now.getTime() % 9000) + 1000);
    const time = now.toLocaleTimeString("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
    setSpecimen({ edition, time, chapter: activeLabel });
    setStatus(`Light specimen ${edition} preserved from ${activeLabel}.`);
  };

  const revealFirstLight = () => {
    setFirstLight((current) => {
      const next = !current;
      setStatus(next ? "The first light is fully revealed." : "The first light is veiled again.");
      return next;
    });
  };

  const toggleRain = () => {
    setRainDistilled((current) => {
      const next = !current;
      setStatus(next ? "Rain color distilled." : "Rain color returned to the field.");
      return next;
    });
  };

  const toggleLinger = () => {
    setLingering((current) => {
      const next = !current;
      setStatus(next ? "Borrowed Hour is lingering." : "Borrowed Hour released.");
      return next;
    });
  };

  const handleBorrowedPointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!motionEnabled || event.pointerType === "mouse") return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  return (
    <main id="top" className={`lacuna chapter-${activeChapter} ${settled ? "is-still" : "is-moving"}`}>
      <LightField chapter={activeChapter} motionEnabled={motionEnabled} still={settled} lingering={lingering} />
      <div className="grain" aria-hidden="true" />
      <div className="edge-vignette" aria-hidden="true" />

      <a
        className="skip-link"
        href="#story"
        onClick={() => window.setTimeout(() => document.getElementById("story")?.focus(), 0)}
      >
        Skip to story
      </a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="LACUNA, return to the beginning">
          <span>LACUNA</span>
          <small>An atlas of disappearing color</small>
        </a>
        <div className="header-actions">
          <button
            ref={indexButtonRef}
            type="button"
            className="text-control"
            aria-expanded={indexOpen}
            aria-controls="chapter-index"
            onClick={() => setIndexOpen((current) => !current)}
          >
            {indexOpen ? "Close index" : "Index"}
          </button>
          <button
            type="button"
            className="motion-control"
            onClick={toggleMotion}
            disabled={!motionReady}
          >
            <span aria-hidden="true" />
            {motionReady ? (motionEnabled ? "Pause motion" : "Resume motion") : "Preparing motion"}
          </button>
        </div>
      </header>

      <div
        ref={indexPanelRef}
        id="chapter-index"
        className={`chapter-index ${indexOpen ? "is-open" : ""}`}
        aria-hidden={!indexOpen}
      >
        <p className="index-kicker">Atlas index</p>
        <nav aria-label="LACUNA chapters">
          <ol>
            {chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <a
                  ref={index === 0 ? firstIndexLinkRef : undefined}
                  href={`#${chapter.id}`}
                  aria-current={activeChapter === chapter.id ? "location" : undefined}
                  tabIndex={indexOpen ? 0 : -1}
                  onClick={() => {
                    setIndexOpen(false);
                    window.setTimeout(() => {
                      const heading = document.querySelector(`#${chapter.id} h1, #${chapter.id} h2`) as HTMLElement | null;
                      heading?.focus();
                    }, 0);
                  }}
                >
                  <span>{chapter.numeral}</span>
                  {chapter.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <p className="index-note">Move to agitate the field. Become still to let the color settle.</p>
      </div>

      <aside className="chapter-rail" aria-label={`Current chapter: ${activeLabel}`}>
        <span>{chapters.find((chapter) => chapter.id === activeChapter)?.numeral}</span>
        <i aria-hidden="true" />
        <small>{activeLabel}</small>
      </aside>

      <article id="story" tabIndex={-1}>
        <section id="prologue" className="chapter prologue" aria-labelledby="prologue-title">
          <div className="prologue-meta">
            <span>A field study</span>
            <span>Four fugitive moments</span>
            <span>Central Time / 2026</span>
          </div>
          <div className="hero-copy calm-zone">
            <p className="eyebrow">Light study no. 01</p>
            <h1 id="prologue-title" tabIndex={-1}>Some colors only exist <em>while they are leaving.</em></h1>
            <div className="hero-bottom">
              <p>Move slowly. The page notices what you stay with.</p>
              <a className="chapter-action" href="#pre-blue">
                Begin at first light
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <p className={`stillness-note ${settled ? "is-visible" : ""}`}>
            <span aria-hidden="true">⌁</span>
            The field has become still.
          </p>
          <div className="prologue-laminae" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
        </section>

        <section id="pre-blue" className="chapter pre-blue" aria-labelledby="pre-blue-title">
          <ChapterMarker numeral="I" label="Pre-blue" />
          <div className="chapter-copy calm-zone">
            <p className="chapter-time">05:17 CT — Before the sky chooses a name</p>
            <h2 id="pre-blue-title" tabIndex={-1}>The hesitation before blue.</h2>
            <p>The first color of morning is not blue. It is mineral, weightless, almost remembered.</p>
            <button
              type="button"
              className="chapter-action button-action"
              aria-pressed={firstLight}
              onClick={revealFirstLight}
            >
              {firstLight ? "Veil the first light" : "Reveal the first light"}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
          <figure className={`light-plate dawn-plate ${firstLight ? "is-revealed" : ""}`}>
            <div className="dawn-field" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </div>
            <figcaption>
              <span>Plate 01</span>
              A color with no agreed name, held for 47 seconds.
            </figcaption>
          </figure>
          <p className={`marginalia ${settled ? "is-visible" : ""}`}>Stillness reveals the colder layer at the edge.</p>
        </section>

        <section id="glass-heat" className="chapter glass-heat" aria-labelledby="glass-heat-title">
          <ChapterMarker numeral="II" label="Glass Heat" />
          <div className="chapter-copy compact-copy calm-zone">
            <p className="chapter-time">13:42 CT — Color becomes weather</p>
            <h2 id="glass-heat-title" tabIndex={-1}>At noon, the air edits every edge.</h2>
            <p>Three frames from the same minute. Each one insists the light happened differently.</p>
          </div>
          <div className="film-sequence" role="region" aria-labelledby="film-heading">
            <div className="film-heading-row">
              <p id="film-heading">A minute in three exposures</p>
              <span aria-live="polite">{filmIndex + 1} / {filmFrames.length}</span>
            </div>
            <figure className={`film-frame ${filmFrames[filmIndex].className}`}>
              <div className="film-image" aria-hidden="true">
                <span /><span /><span />
              </div>
              <figcaption>
                <span>{filmFrames[filmIndex].time} CT</span>
                <strong>{filmFrames[filmIndex].title}</strong>
                <p>{filmFrames[filmIndex].copy}</p>
              </figcaption>
            </figure>
            <div className="film-controls">
              <button type="button" onClick={() => chooseFilmFrame(filmIndex - 1)} disabled={filmIndex === 0}>
                <span aria-hidden="true">←</span> Previous frame
              </button>
              <button
                type="button"
                onClick={() => chooseFilmFrame(filmIndex + 1)}
                disabled={filmIndex === filmFrames.length - 1}
              >
                Next frame <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>

        <section id="rain-memory" className="chapter rain-memory" aria-labelledby="rain-memory-title">
          <ChapterMarker numeral="III" label="Rain Memory" />
          <div className={`rain-stage ${rainDistilled ? "is-distilled" : ""}`} aria-hidden="true">
            {Array.from({ length: 14 }, (_, index) => (
              <span key={index} style={{ "--drop": index } as CSSProperties} />
            ))}
            <i className="rain-horizon" />
          </div>
          <div className="chapter-copy rain-copy calm-zone">
            <p className="chapter-time">17:08 CT — Green after weather</p>
            <h2 id="rain-memory-title" tabIndex={-1}>Rain gives color back its distance.</h2>
            <p>Not deeper. Not brighter. Simply farther away, with enough atmosphere to become itself again.</p>
            <button
              type="button"
              className="chapter-action button-action"
              aria-pressed={rainDistilled}
              onClick={toggleRain}
            >
              {rainDistilled ? "Release the rain" : "Distill the rain"}
              <span aria-hidden="true">◇</span>
            </button>
          </div>
          <blockquote className={`rain-quote ${rainDistilled ? "is-visible" : ""}`}>
            “Weather is a color seen from the proper distance.”
          </blockquote>
        </section>

        <section id="borrowed-hour" className="chapter borrowed-hour" aria-labelledby="borrowed-hour-title">
          <ChapterMarker numeral="IV" label="Borrowed Hour" />
          <div className="borrowed-number" aria-hidden="true">11</div>
          <div className="chapter-copy borrowed-copy calm-zone">
            <p className="chapter-time">20:31 CT — The city returns its color</p>
            <h2 id="borrowed-hour-title" tabIndex={-1}>For eleven minutes, every surface holds two lives.</h2>
            <p>The color it keeps, and the color it is about to lose.</p>
            <button
              type="button"
              className="linger-control"
              aria-pressed={lingering}
              onClick={toggleLinger}
              onPointerDown={handleBorrowedPointer}
            >
              <span aria-hidden="true"><i /></span>
              {lingering ? "Release the hour" : "Linger with this light"}
            </button>
          </div>
          <div className={`afterimage-window ${lingering ? "is-lingering" : ""}`} aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <p className={`marginalia borrowed-note ${settled || lingering ? "is-visible" : ""}`}>
            The second color appears when nothing asks it to hurry.
          </p>
        </section>

        <section id="afterimage" className="chapter afterimage" aria-labelledby="afterimage-title">
          <ChapterMarker numeral="V" label="Afterimage" />
          <div className="coda-copy calm-zone">
            <p className="chapter-time">Coda — What remains</p>
            <h2 id="afterimage-title" tabIndex={-1}>Color does not disappear. <em>It changes witnesses.</em></h2>
            <p>You crossed four qualities of light. Keep the one that held you.</p>
            <div className="coda-actions">
              <button type="button" className="chapter-action button-action" onClick={keepLight}>
                Keep this light <span aria-hidden="true">＋</span>
              </button>
              <a className="quiet-link" href="#prologue">Travel again ↑</a>
            </div>
          </div>

          <aside className={`specimen ${specimen ? "is-created" : ""}`} aria-live="polite" aria-label="Preserved light specimen">
            {specimen ? (
              <>
                <div className="specimen-field" aria-hidden="true"><i /><i /><i /></div>
                <p>LACUNA / FIELD SPECIMEN</p>
                <strong>Edition {specimen.edition}</strong>
                <dl>
                  <div><dt>Witnessed</dt><dd>{specimen.time}</dd></div>
                  <div><dt>Chapter</dt><dd>{specimen.chapter}</dd></div>
                  <div><dt>Condition</dt><dd>{settled ? "Settled" : "In motion"}</dd></div>
                </dl>
              </>
            ) : (
              <p className="specimen-empty">Your preserved light will appear here.</p>
            )}
          </aside>
        </section>
      </article>

      <footer>
        <a href="#top">LACUNA</a>
        <p>A study of temporary color, made with light, code, and a little patience.</p>
        <span>Central Time / MMXXVI</span>
      </footer>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{status}</p>
    </main>
  );
}
