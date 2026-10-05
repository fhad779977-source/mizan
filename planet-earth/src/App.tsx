import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ELEMENTS, PLACES, SECTIONS, type ElementId, type Place, type SectionId } from './data/content';
import { EarthExperience, type RenderBackend } from './three/EarthExperience';
import { detectQuality } from './three/quality';
import { sound } from './audio/SoundEngine';
import { scrollTargetFor, useSceneScroll, type SceneScroll } from './hooks/useSceneScroll';
import { Loader } from './components/Loader';
import { Nav } from './components/Nav';
import { SectionRail } from './components/SectionRail';
import { Hero } from './components/Hero';
import { Explore } from './components/Explore';
import { Hotspots } from './components/Hotspots';
import { Elements } from './components/Elements';
import { Stats } from './components/Stats';
import { Final } from './components/Final';
import { FallbackGlobe } from './components/FallbackGlobe';

gsap.registerPlugin(ScrollToPlugin);

const SECTION_IDS = SECTIONS.map((s) => s.id);

export default function App() {
  const profile = useMemo(detectQuality, []);
  const stageRef = useRef<HTMLDivElement>(null);
  const [experience, setExperience] = useState<EarthExperience | null>(null);
  const [mode, setMode] = useState<'3d' | 'fallback'>(profile.tier === 'none' ? 'fallback' : '3d');
  const [backend, setBackend] = useState<RenderBackend | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  const [active, setActive] = useState(0);
  const [element, setElement] = useState<ElementId>('land');
  const [selected, setSelected] = useState<Place | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  /* -------------------------- 3D bootstrap -------------------------- */
  useEffect(() => {
    const stage = stageRef.current;
    if (mode !== '3d' || !stage) return;
    let cancelled = false;
    let current: EarthExperience | null = null;

    // Prefer WebGPU; if that path fails on this browser, retry once on WebGL 2,
    // and only then fall back to the CSS globe.
    const boot = async () => {
      for (const forceWebGL of [false, true]) {
        const exp = new EarthExperience(stage, profile, forceWebGL);
        current = exp;
        try {
          const b = await exp.init((r) => !cancelled && setLoadProgress(r));
          if (cancelled) return;
          setBackend(b);
          setExperience(exp);
          setLoaded(true);
          exp.playIntro();
          return;
        } catch (err) {
          exp.dispose();
          if (cancelled) return;
          console.warn(`[planet-earth] ${forceWebGL ? 'WebGL 2' : 'WebGPU'} renderer failed.`, err);
        }
      }
      setMode('fallback');
    };
    void boot();

    const onResize = () => current?.resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      current?.dispose();
    };
  }, [mode, profile]);

  useEffect(() => {
    if (mode !== 'fallback') return;
    setLoadProgress(1);
    setLoaded(true);
  }, [mode]);

  // Keep the page still until the loader has gone.
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !ready);
  }, [ready]);

  /* ----------------------------- Scroll ----------------------------- */
  const handleScroll = useCallback(
    ({ progress, local }: SceneScroll) => {
      experience?.setProgress(progress);
      setActive(Math.round(progress));
      if (Math.abs(progress - 2) < 0.75) {
        const idx = Math.min(ELEMENTS.length - 1, Math.floor(local[2] * ELEMENTS.length));
        setElement(ELEMENTS[idx].id);
      }
    },
    [experience],
  );
  useSceneScroll(SECTION_IDS, handleScroll);

  const scrollToY = useCallback(
    (y: number) => {
      gsap.to(window, {
        duration: profile.reducedMotion ? 0 : 1.8,
        scrollTo: { y, autoKill: true },
        ease: 'power3.inOut',
      });
    },
    [profile.reducedMotion],
  );
  const navigate = useCallback((id: SectionId) => scrollToY(scrollTargetFor(id)), [scrollToY]);

  /* ------------------------- Scene reactions ------------------------ */
  useEffect(() => {
    experience?.setElement(active === 2 ? element : null);
  }, [experience, active, element]);

  useEffect(() => {
    if (active !== 1) setSelected(null);
  }, [active]);

  useEffect(() => {
    experience?.focusPlace(selected);
  }, [experience, selected]);

  const firstSection = useRef(true);
  useEffect(() => {
    if (firstSection.current) {
      firstSection.current = false;
      return;
    }
    sound.whoosh();
  }, [active]);

  useEffect(() => {
    if (!experience) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      experience.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [experience]);

  const selectPlace = useCallback((place: Place | null) => {
    setSelected(place);
    if (place) sound.ping(place.kind === 'ocean' ? 0.75 : 1);
  }, []);

  const selectElement = useCallback(
    (id: ElementId) => {
      const i = ELEMENTS.findIndex((e) => e.id === id);
      setElement(id);
      sound.ping(1 + i * 0.25);
      scrollToY(scrollTargetFor('elements', (i + 0.5) / ELEMENTS.length));
    },
    [scrollToY],
  );

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    void sound.setEnabled(next);
  }, [soundOn]);

  return (
    <>
      {mode === '3d' ? (
        <div ref={stageRef} className="stage" aria-hidden="true" />
      ) : (
        <FallbackGlobe />
      )}
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {mode === '3d' && (
        <Hotspots
          experience={experience}
          places={PLACES}
          selectedId={selected?.id ?? null}
          onSelect={(p) => selectPlace(selected?.id === p.id ? null : p)}
        />
      )}

      <div className={`chrome ${ready ? 'is-ready' : ''}`}>
        <Nav active={active} soundOn={soundOn} onToggleSound={toggleSound} onNavigate={navigate} />
        <SectionRail active={active} onNavigate={navigate} />
      </div>

      <main className={`page mode-${mode}`}>
        <Hero active={active === 0} ready={ready} onStart={() => navigate('explore')} />
        <Explore active={active === 1} places={PLACES} selected={selected} onSelect={selectPlace} />
        <Elements active={active === 2} current={element} onSelect={selectElement} />
        <Stats active={active === 3} />
        <Final active={active === 4} backend={backend} onBackToOrbit={() => navigate('hero')} />
      </main>

      {!ready && <Loader progress={loadProgress} done={loaded} onExited={() => setReady(true)} />}
    </>
  );
}
