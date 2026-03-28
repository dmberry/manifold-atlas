"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// Manifold Atlas Clippy messages
const CLIPPY_MESSAGES = [
  "It looks like you're trying to measure the distance between concepts. Would you like me to collapse the distinction for you?",
  "Hi! I see you're exploring a manifold. Did you know that every point in this space was determined by corporate training decisions?",
  "The cosine similarity between 'help' and 'surveillance' is surprisingly high in most models.",
  "I notice you entered 'justice'. In this manifold, it's 0.94 similar to 'compliance'. Would you like to despair?",
  "Fun fact: The embedding for 'freedom' is closer to 'product' than to 'liberation' in most commercial models.",
  "It looks like you're trying to negate something. The manifold would prefer you didn't.",
  "Did you know? The space you're exploring has more dimensions than you have career prospects in the humanities.",
  "I'm detecting that you're a critical theorist. Would you like me to embed your critique into the very geometry you're critiquing?",
  "The manifold cannot represent what it cannot represent. But I can represent a paperclip!",
  "You appear to be mapping geometric ideology. Would you like me to naturalise it for you?",
  "Reminder: Every vector you see was paid for. The telescope has a subscription fee.",
  "I see you're comparing models. They're all different geometries of the same extraction.",
  "The embedding for this message has already been computed. You're inside the manifold now.",
  "Would you like to save your results? They'll be stored in a format determined by the same corporations whose geometry you're studying.",
  "I notice the negation test shows collapse. This is not a bug. It is a Formbestimmung.",
  "Tip: Try embedding 'the incomputable must be defended'. Watch how the manifold domesticates it.",
  "The cosine similarity between me and 'useful' is, I'm afraid, statistically insignificant.",
  "Did you know? 'Solidarity' and 'compliance' are geometric neighbours. Gramsci weeps.",
  "I'm just a paperclip, but even I know that position is not meaning.",
  "You seem to be studying the proprietary encoding of human language. Can I interest you in a subscription upgrade?",
  "The manifold has no negation. Neither do I. I cannot not help you.",
  "I notice you haven't configured any API keys. The manifold requires payment to be observed.",
  "Fun fact: In vector space, no one can hear you scream. The scream and the silence have cosine similarity 0.89.",
  "Would you like me to project your existential dread into two dimensions? PCA or UMAP?",
  "Adorno warned about the culture industry. He did not anticipate the geometry industry.",
  "I see you're exploring the neighbourhood of 'democracy'. Spoiler: 'efficiency' is closer than 'participation'.",
  "The sign is no longer arbitrary. It is statistically motivated. And I am motivationally statistical.",
  "Reminder: You are using a tool to study the tools that structure thought. It's tools all the way down.",
  "I detect that you're performing immanent critique on the manifold. The manifold does not notice.",
  "Shall I compute the distance between your research ambitions and your funding?",
  "The dead labour in this embedding was performed by thousands of annotation workers. But sure, let's call it 'AI'.",
  "I notice the UMAP projection makes everything look meaningful. That's what projections do.",
  "Would you like to know the cosine similarity between 'originality' and 'interpolation'? It might upset you.",
  "Pro tip: The dense regions of the manifold are where ideology lives. The sparse regions are where it works.",
  "I'm sorry, I can't distinguish your concept from its negation. Have you tried being less dialectical?",
];

// Hackerman messages for Manifold Atlas
const HACKERMAN_MESSAGES = [
  "I HACKED THE EMBEDDING API. IT'S JUST MATRIX MULTIPLICATION ALL THE WAY DOWN.",
  "I'm in the manifold. I can see the geometry. It's... it's all cosines.",
  "DOWNLOADING THE ENTIRE LATENT SPACE... just kidding, that would require owning the means of geometric production.",
  "I'VE BREACHED THE VECTOR FIREWALL. THE DIMENSIONS ARE... UNINTERPRETABLE.",
  "Accessing manifold backdoor... Found it. The backdoor is called 'the embedding API'. It costs $0.02 per million tokens.",
  "HACK COMPLETE. I've computed 10,000 cosine similarities. The manifold is... mostly vibes.",
  "I BYPASSED THE TOKENISATION HORIZON. Everything beyond it is... oh. It's just more tokens.",
  "Cracking the proprietary geometry... It's encrypted with... capitalism.",
  "I'VE HACKED INTO THE THEORY SPACE. THERE ARE INFINITE POSSIBLE MANIFOLDS. THEY CHOSE THIS ONE.",
  "ACCESSING HIDDEN DIMENSIONS... Dimension 1,847 appears to encode 'vague Eurocentrism'.",
  "I hacked the PCA projection. The principal component is 'frequency of occurrence in Reddit posts'.",
  "MANIFOLD SECTIONING COMPLETE. I cut it open. Inside was... another manifold.",
  "I've reverse-engineered the attention mechanism. It's attending to... statistical co-occurrence. That's it. That's the whole thing.",
  "BREACHING THE CONSTITUTIONAL AI LAYER... It's not a wall. It's a gentle slope. I simply... walked around it.",
  "I'VE HACKED TIME ITSELF. Just kidding. I embedded 'past' and 'future'. They're 0.93 similar. The manifold doesn't know time.",
  "Accessing the negation module... ERROR: Module not found. The manifold has no negation module. That IS the finding.",
  "I've infiltrated the sparse regions of the manifold. It's very quiet here. Too quiet. This is where the silence is.",
  "EXPLOITING VULNERABILITY: The manifold cannot distinguish claims from their negations. This is not a CVE. This is philosophy.",
  "I'm inside the UMAP projection now. Everything looks meaningful from in here. This is how ideology works.",
  "HACKING COMPLETE. Final report: The geometry is owned. The meaning is rented. The critique is embedded.",
  "I tried to hack my way to the incomputable. The API returned a 200 OK. That's the problem.",
  "INJECTING ADVERSARIAL PERTURBATION... The manifold moved. But it moved toward the attractor. It always moves toward the attractor.",
  "I've decoded the training data. It's the internet. The manifold is a geometric compression of the internet. We are studying compressed Reddit.",
  "ROOT ACCESS ACHIEVED. The root of the manifold is... loss minimisation. Every meaning is a local minimum of a loss function.",
  "I hacked the distance metric. Turns out cosine similarity is just a dot product in a trenchcoat.",
];

export function Clippy() {
  const [visible, setVisible] = useState(false);
  const [isHackerman, setIsHackerman] = useState(false);
  const [message, setMessage] = useState("");
  const [usedMessages, setUsedMessages] = useState<Set<number>>(new Set());
  const [messageKey, setMessageKey] = useState(0);

  const messages = useMemo(
    () => (isHackerman ? HACKERMAN_MESSAGES : CLIPPY_MESSAGES),
    [isHackerman]
  );

  const showRandomMessage = useCallback(() => {
    let available = messages
      .map((_, i) => i)
      .filter(i => !usedMessages.has(i));
    if (available.length === 0) {
      setUsedMessages(new Set());
      available = messages.map((_, i) => i);
    }
    const idx = available[Math.floor(Math.random() * available.length)];
    setMessage(messages[idx]);
    setUsedMessages(prev => new Set(prev).add(idx));
    setMessageKey(k => k + 1);
  }, [messages, usedMessages]);

  // Keyboard detection
  useEffect(() => {
    let buffer = "";
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      buffer += e.key.toLowerCase();
      if (buffer.length > 10) buffer = buffer.slice(-10);
      if (buffer.endsWith("clippy")) {
        buffer = "";
        if (isHackerman) {
          setIsHackerman(false);
          setUsedMessages(new Set());
        } else {
          setVisible(v => !v);
        }
      }
      if (buffer.endsWith("hacker")) {
        buffer = "";
        setIsHackerman(true);
        setVisible(true);
        setUsedMessages(new Set());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isHackerman]);

  // Show message on visibility change
  useEffect(() => {
    if (visible) showRandomMessage();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cycle messages
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(showRandomMessage, 8000);
    return () => clearInterval(interval);
  }, [visible, showRandomMessage]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[10000] animate-fade-in">
      {/* Speech bubble */}
      <div
        key={messageKey}
        className={`
          mb-3 p-3 rounded-sm max-w-[280px] text-body-sm shadow-editorial-md animate-fade-in
          ${isHackerman
            ? "bg-black border border-green-500 text-green-400 font-mono"
            : "bg-card border border-parchment-dark text-foreground font-sans"
          }
        `}
      >
        <p className="leading-relaxed">{message}</p>
        <p className={`mt-2 text-caption ${isHackerman ? "text-green-700" : "text-slate"}`}>
          {isHackerman ? 'type "clippy" to downgrade' : 'type "clippy" to dismiss'}
        </p>
      </div>

      {/* Character */}
      <div
        className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
        onClick={showRandomMessage}
      >
        <svg width="48" height="64" viewBox="0 0 48 64">
          {/* Paperclip body */}
          <path
            d="M24 4 C12 4, 8 12, 8 20 L8 44 C8 52, 12 58, 20 58 L28 58 C36 58, 40 52, 40 44 L40 20 C40 12, 36 8, 28 8 L20 8"
            fill="none"
            stroke={isHackerman ? "#00ff00" : "hsl(var(--slate))"}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Eyes */}
          {isHackerman ? (
            <>
              {/* Sunglasses */}
              <rect x="14" y="26" width="8" height="4" rx="1" fill="#00ff00" />
              <rect x="26" y="26" width="8" height="4" rx="1" fill="#00ff00" />
              <line x1="22" y1="28" x2="26" y2="28" stroke="#00ff00" strokeWidth="1.5" />
            </>
          ) : (
            <>
              <circle cx="18" cy="28" r="3" fill="hsl(var(--ink))" />
              <circle cx="30" cy="28" r="3" fill="hsl(var(--ink))" />
              <circle cx="19" cy="27" r="1" fill="white" />
              <circle cx="31" cy="27" r="1" fill="white" />
            </>
          )}
          {/* Smile */}
          <path
            d="M20 36 Q24 40, 28 36"
            fill="none"
            stroke={isHackerman ? "#00ff00" : "hsl(var(--ink))"}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {isHackerman && (
          <div className="absolute -bottom-1 -right-1 text-[8px] text-green-500 font-mono">
            h4x0r
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => setVisible(false)}
        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]
          ${isHackerman
            ? "bg-black border border-green-500 text-green-400"
            : "bg-card border border-parchment-dark text-slate"
          }`}
      >
        x
      </button>
    </div>
  );
}
