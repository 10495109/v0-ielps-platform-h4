import React, { useEffect, useMemo, useRef, useState } from "react";
import "./pip-agent.css";

type PipLanguage = "en" | "es" | "ar" | "zh" | "fr" | "pt";

type PipRole =
  | "learner"
  | "junior"
  | "parent"
  | "teacher"
  | "school"
  | "studio"
  | "tutor";

type PipState =
  | "closed"
  | "opening"
  | "listening"
  | "thinking"
  | "responding_text"
  | "responding_voice"
  | "caption_only"
  | "route_suggested"
  | "handoff_ready"
  | "error";

type AgentAudio = {
  mode: "prerendered" | "prerendered-fallback" | "caption_only" | "generated_cached" | "generated_dynamic";
  audioUrl?: string | null;
  audioBase64?: string;
  mimeType?: string;
};

type AgentResponse = {
  language: PipLanguage;
  dir: "ltr" | "rtl";
  languageName: string;
  routeSuggestion?: string;
  voiceScriptId?: string;
  caption: string;
  simplifiedCaption?: string;
  steps?: string[];
  roleHint?: string;
  quickActions?: Array<{ id: string; label: string; route: string; caption?: string }>;
  audio?: AgentAudio;
  policy?: {
    commonPathsUseCachedAudio: boolean;
    dynamicSpeechDefault: boolean;
    provider: string;
  };
};

type PipAgentProps = {
  apiBaseUrl?: string;
  role?: PipRole;
  accountPathway?: string;
  cefrLevel?: string;
  lessonId?: string;
  route?: string;
  juniorSafeMode?: boolean;
  initialLanguage?: PipLanguage;
  mascotSrc?: string;
  onNavigate?: (route: string) => void;
};

const LANGUAGE_LABELS: Record<PipLanguage, string> = {
  en: "English",
  es: "Español",
  ar: "العربية",
  zh: "中文",
  fr: "Français",
  pt: "Português",
};

const FALLBACK_CAPTIONS: Record<PipLanguage, string> = {
  en: "Hi, I’m PiP. I can help you find the right IELPS pathway and your next learning step.",
  es: "Hola, soy PiP. Puedo ayudarte a encontrar tu ruta de IELPS y tu próximo paso de aprendizaje.",
  ar: "مرحباً، أنا PiP. يمكنني مساعدتك في العثور على مسارك في IELPS وخطوتك التعليمية التالية.",
  zh: "你好，我是 PiP。我可以帮助你找到 IELPS 路径和下一步学习任务。",
  fr: "Bonjour, je suis PiP. Je peux vous aider à trouver votre parcours IELPS et votre prochaine étape.",
  pt: "Olá, sou o PiP. Posso ajudar você a encontrar o caminho IELPS e o próximo passo de aprendizagem.",
};

function normalizeLanguage(value?: string | null): PipLanguage {
  const raw = String(value || "").toLowerCase();
  if (raw.startsWith("es")) return "es";
  if (raw.startsWith("ar")) return "ar";
  if (raw.startsWith("zh")) return "zh";
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("pt")) return "pt";
  return "en";
}

function browserLanguage(): PipLanguage {
  if (typeof navigator === "undefined") return "en";
  return normalizeLanguage(navigator.languages?.[0] || navigator.language);
}

export function PipAgent({
  apiBaseUrl = "/api",
  role = "learner",
  accountPathway,
  cefrLevel,
  lessonId,
  route,
  juniorSafeMode = false,
  initialLanguage,
  mascotSrc = "/content-assets/pip/pip-mascot.png",
  onNavigate,
}: PipAgentProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<PipState>("closed");
  const [language, setLanguage] = useState<PipLanguage>(initialLanguage || browserLanguage());
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentRoute = useMemo(() => {
    if (route) return route;
    if (typeof window !== "undefined") return window.location.pathname;
    return "/";
  }, [route]);

  useEffect(() => {
    if (!open || response) return;
    void askPip("welcome");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function askPip(text: string) {
    const trimmed = text.trim();
    setState("thinking");
    try {
      const res = await fetch(`${apiBaseUrl}/agent/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          route: currentRoute,
          role: juniorSafeMode ? "junior" : role,
          language,
          browserLanguage: typeof navigator !== "undefined" ? navigator.language : language,
          context: { accountPathway, cefrLevel, lessonId, juniorSafeMode },
        }),
      });
      if (!res.ok) throw new Error(`PiP chat failed: ${res.status}`);
      const json = (await res.json()) as AgentResponse;
      setResponse(json);
      setLanguage(json.language || language);
      setState(json.audio?.audioUrl ? "responding_voice" : "caption_only");
      if (json.audio?.audioUrl) playAudio(json.audio.audioUrl);
    } catch {
      setResponse({
        language,
        dir: language === "ar" ? "rtl" : "ltr",
        languageName: LANGUAGE_LABELS[language],
        caption: FALLBACK_CAPTIONS[language],
        simplifiedCaption: FALLBACK_CAPTIONS[language],
        quickActions: [],
        audio: { mode: "caption_only", audioUrl: null },
      });
      setState("error");
    }
  }

  function playAudio(url: string) {
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.onended = () => setAudioPlaying(false);
    audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => setAudioPlaying(false));
  }

  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setAudioPlaying(true)).catch(() => setAudioPlaying(false));
    } else {
      audio.pause();
      setAudioPlaying(false);
    }
  }

  function navigate(path: string) {
    if (juniorSafeMode && ["/account/billing", "/tutors", "/studio", "/school"].includes(path)) return;
    if (onNavigate) return onNavigate(path);
    if (typeof window !== "undefined") window.location.href = path;
  }

  return (
    <div className="ielps-pip-agent" data-state={state}>
      {!open && (
        <button className="ielps-pip-launcher" type="button" onClick={() => { setOpen(true); setState("opening"); }} aria-label="Open PiP assistant">
          <img src={mascotSrc} alt="" />
          <span>Hi, I’m PiP!</span>
        </button>
      )}

      {open && (
        <section className="ielps-pip-panel" aria-label="PiP assistant" dir={response?.dir || (language === "ar" ? "rtl" : "ltr")}>
          <header className="ielps-pip-header">
            <img src={mascotSrc} alt="" />
            <div>
              <strong>PiP</strong>
              <span>{state === "thinking" ? "Thinking..." : "IELPS guide"}</span>
            </div>
            <button type="button" onClick={() => { setOpen(false); setState("closed"); }} aria-label="Close PiP">×</button>
          </header>

          <div className="ielps-pip-language-row">
            {(Object.keys(LANGUAGE_LABELS) as PipLanguage[]).map((code) => (
              <button key={code} type="button" className={code === language ? "active" : ""} onClick={() => setLanguage(code)}>
                {LANGUAGE_LABELS[code]}
              </button>
            ))}
          </div>

          <div className="ielps-pip-caption">
            <p>{response?.simplifiedCaption || response?.caption || FALLBACK_CAPTIONS[language]}</p>
            {response?.roleHint && <small>{response.roleHint}</small>}
          </div>

          {Boolean(response?.steps?.length) && (
            <ol className="ielps-pip-steps">
              {response?.steps?.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}
            </ol>
          )}

          {response?.audio?.audioUrl && (
            <button className="ielps-pip-audio" type="button" onClick={toggleAudio}>
              {audioPlaying ? "Pause voice" : "Play voice"}
            </button>
          )}

          <div className="ielps-pip-actions">
            {response?.quickActions?.slice(0, 4).map((action) => (
              <button key={action.id} type="button" onClick={() => navigate(action.route)}>
                {action.label}
              </button>
            ))}
            {response?.routeSuggestion && (
              <button type="button" className="primary" onClick={() => navigate(response.routeSuggestion!)}>
                Go to next step
              </button>
            )}
          </div>

          <form
            className="ielps-pip-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!message.trim()) return;
              void askPip(message);
              setMessage("");
            }}
          >
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask PiP..." />
            <button type="submit">Send</button>
          </form>
        </section>
      )}
    </div>
  );
}

export default PipAgent;

