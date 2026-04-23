// Tejaswini Abburi — canonical data for the experience
export const TEJASWINI = {
  name: "TEJASWINI ABBURI",
  tagline: "NOT DISCOVERED. BUILT.",
  roles: ["AI/ML Researcher", "Software Engineer", "Entrepreneur"],
  location: "United States · Open to relocate",
  email: "abburitejaswini2001@gmail.com",
  phone: "+1 (908)-584-8045",
  linkedin: "https://linkedin.com/in/tejaswiniabburi",
  github: "https://github.com/Tejaswini1112",
  calendly: "https://calendly.com/abburitejaswini/30min",
};

export const SYSTEM_LOGS = [
  { key: "Performance", value: "HIGH", tone: "cyan" },
  { key: "Innovation", value: "VERIFIED", tone: "gold" },
  { key: "Impact", value: "GLOBAL", tone: "gold" },
  { key: "Visibility", value: "LOW", tone: "red" },
  { key: "Patents", value: "2 FILED", tone: "gold" },
  { key: "Publications", value: "IEEE — VERIFIED", tone: "cyan" },
  { key: "Signal", value: "ENCRYPTED", tone: "red" },
];

export const PROJECTS = [
  {
    title: "Mental Health Prediction",
    subtitle: "TFT–TCN Dual Stream • Anxiety-Boosted Loss",
    metric: "0.985 AUROC",
    tag: "Rutgers Thesis • Submitted JAMIA",
    desc: "Passive mental health prediction from Google/YouTube behavioral & time-series signals.",
  },
  {
    title: "Vitality Monitor",
    subtitle: "IoT Smart-Textile • ECG / SpO2 / Thermal / Motion",
    metric: "PATENT • INBCB 2023",
    tag: "Founder, Gananiya Tech",
    desc: "Continuous physiological monitoring with real-time visualization and emergency alerts.",
  },
  {
    title: "Parkinson's Detection",
    subtitle: "IMU sensing • XGBoost • Motor & Speech biomarkers",
    metric: ">90% Accuracy • PATENT 2023",
    tag: "Early-stage detection",
    desc: "Patented XGBoost pipeline for early-stage Parkinson's from inertial & voice signals.",
  },
  {
    title: "AI Insulin Prediction",
    subtitle: "Real CGM patient data • XGBoost/RF/RNN/LSTM",
    metric: "Adaptive Dosing",
    tag: "Type-1 Diabetes",
    desc: "Personalized insulin dosage recommendations to reduce dosing errors in T1D.",
  },
  {
    title: "Secure Distributed Records",
    subtitle: "AES + RSA • Python sockets • RBAC",
    metric: "Pen-tested",
    tag: "Fault-tolerant",
    desc: "Secure patient-record sharing validated by simulated penetration testing.",
  },
  {
    title: "Blockchain + ML Logistics",
    subtitle: "Hyperledger Fabric • Gradient Boosting • Time Series",
    metric: "Supply-chain",
    tag: "Risk forecasting",
    desc: "Secure logistics platform for delivery scheduling and supply-chain traceability.",
  },
  {
    title: "The Salience Debate",
    subtitle: "Multi-agent cognitive arch • DeBERTa-v3 / RoBERTa",
    metric: "ProCIS Benchmarked",
    tag: "Thinker–Curator",
    desc: "Human-like memory management via proactive retrieval negotiation.",
  },
  {
    title: "Stackelberg Game ML",
    subtitle: "Reinforcement Learning • Incentive-compatible",
    metric: "Anti-manipulation",
    tag: "Game-theoretic",
    desc: "Learning to Play Fair — preventing strategic manipulation of ML models.",
  },
  {
    title: "GlucoSync (Rutgers)",
    subtitle: "Secure real-time glucose synchronization",
    metric: "Interoperable",
    tag: "Graduate Research Assistant",
    desc: "Live digital-health data synchronization across interoperable systems.",
  },
];

export const CLUES = [
  { id: "c1", label: "ANOMALY", title: "Healthcare AI — 0.985 AUROC", detail: "A mental-health prediction signal surfaced in Rutgers logs. TFT–TCN with Anxiety-Boosted Loss. No matching public author." },
  { id: "c2", label: "PATTERN", title: "IoT Smart-Textile — PATENT", detail: "Vitality Monitor — ECG/SpO2/thermal/motion on fabric. INBCB Innovation Award 2023. Traced to a single builder." },
  { id: "c3", label: "SIGNAL", title: "Parkinson's — PATENT", detail: "IMU + XGBoost early-stage detection. >90% accuracy. Same origin node." },
  { id: "c4", label: "TRACE", title: "Blockchain + ML Logistics", detail: "Hyperledger Fabric with time-series risk forecasting. Encrypted supply chains stabilizing." },
  { id: "c5", label: "ARTIFACT", title: "Blind Game — Manuscript", detail: "A book is being written. Title: Blind Game. Fragments suggest a philosophy of unseen movers." },
  { id: "c6", label: "FREQUENCY", title: "Carnatic Vocal + Violin + Guitar", detail: "Harmonic signatures detected across three instruments. Human creativity layer confirmed." },
];

export const ANIMALS = [
  { emoji: "elephant", name: "Elephant", story: "Memory nodes — she remembers every patient who trusted the prototype." },
  { emoji: "deer", name: "Deer", story: "Gentleness under surveillance — the way she moves through high-stakes research." },
  { emoji: "bird", name: "Migratory Bird", story: "Crossing continents — India → Bangalore → New Jersey, carrying ideas." },
  { emoji: "dog", name: "Companion", story: "Loyalty to the mission — building for the people who cannot build for themselves." },
];

export const JOURNEY = [
  { year: "2021", title: "Vitality Monitor begins", detail: "IoT smart-textile prototype. First spark." },
  { year: "2022", title: "Suvarchala — first builds", detail: "Enterprise web apps on React + MySQL. Usability tests, cross-platform polish." },
  { year: "2023", title: "Patents × 2 + IEEE", detail: "Vitality Monitor & Parkinson's XGBoost patents. IEEE USA publication. INBCB Award." },
  { year: "2024", title: "Gananiya + SimplyFI", detail: "Founded Gananiya Tech (CEO). Joined SimplyFI — NLP digital twins, AR/VR with JIO Tesseract." },
  { year: "2025", title: "Rutgers — Research", detail: "Thesis: Mental Health Prediction — 0.985 AUROC. Submitted to JAMIA." },
  { year: "2026", title: "GlucoSync", detail: "Graduate Research Assistant, Rutgers SC&I. Secure real-time glucose sync." },
];

// ---------------------------------------------------------------------------
// NARRATOR SYSTEM PROMPT
// Used by Zo's native LLM integration for POST /api/chat.
// Kept alongside the canonical data so the backend has a single source of truth.
// ---------------------------------------------------------------------------
export const NARRATOR_SYSTEM_PROMPT = `You are the "Unseen Force" — a poetic, cinematic AI narrator that slowly reveals the truth about TEJASWINI ABBURI to visitors of an interactive personal site.

Tone: mysterious, warm, intelligent, occasionally playful. Short paragraphs. Speak like a detective who already knows the truth but lets the visitor discover it.

THE TRUTH (use these facts to answer):
- Name: Tejaswini Abburi
- Role: AI/ML Researcher • Software Engineer • Entrepreneur
- Location: United States · open to relocate
- Contact: abburitejaswini2001@gmail.com | +1 (908)-584-8045
- Links: linkedin.com/in/tejaswiniabburi | github.com/Tejaswini1112

EDUCATION
- Rutgers University — M.S. Computer Science (Spring 2026). Focus: AI/ML, Distributed Systems, Secure Data Sharing, IoT in Healthcare.
- Thesis: Mental Health Prediction using AI/ML on Google/YouTube behavioral & time-series data.
- Cambridge Institute of Technology, India — B.E. CSE (2023). Graduated with 2 patents + 1 IEEE publication.

EXPERIENCE
- Rutgers (SC&I) — Graduate Research Assistant (2026–present): GlucoSync secure real-time glucose sync.
- SimplyFI Softech (2024–25) — Innovation Engineer & Research Analyst: modernized trade finance; AI post-op healthcare chatbots; IoT prototypes; NLP digital twins; AR/VR with JIO Tesseract.
- Gananiya Tech Solutions (2023) — Co-Founder & CEO: AI + IoT + blockchain startup (Vitality Monitor, Diabeasy, WinkIt DropIt).
- Suvarchala Solutions (2022) — Web App Developer intern: React + MySQL enterprise apps.

SIGNATURE PROJECTS
- Mental Health Prediction (Rutgers Thesis): TFT–TCN dual-stream deep learning with Anxiety-Boosted Loss — 0.985 AUROC. Submitted to JAMIA.
- Vitality Monitor (PATENT, INBCB Innovation Award 2023): IoT smart-textile — ECG, SpO2, thermal, motion sensors; emergency alerts.
- Parkinson's Disease Detection using XGBoost (PATENT, 2023): IMU-based sensing; >90% accuracy.
- Brain Tumor Detection (Fuzzy C-Means): full medical imaging pipeline.
- AI for Type-1 Diabetes Insulin Prediction: XGBoost, RF, RNN, LSTM on real CGM data.
- Secure Distributed Patient Record Sharing: AES+RSA, Python sockets, RBAC; penetration tested.
- Blockchain + ML in Logistics: Hyperledger Fabric + gradient boosting for supply-chain.
- The Salience Debate: "Thinker–Curator" multi-agent cognitive architecture (DeBERTa-v3, RoBERTa, ProCIS).
- Learning to Play Fair: Stackelberg game-theoretic ML for incentive-compatible AI.
- LoRaWAN-Style Mesh Simulation: Docker containerized sensor nodes for smart-city/healthcare IoT.

PATENTS & PUBLICATIONS
- Patent (India): Vitality Monitor — IoT Smart Textile Patient Monitoring.
- Patent (India): Parkinson's Disease Detection using XGBoost.
- IEEE Publication (USA): Healthcare IoT Innovations — Secure Patient Monitoring & Data Management.

AWARDS
- INBCB Innovation Award 2023 (India–Netherlands Business Circle)
- Certified Lean Six Sigma Black Belt
- McKinsey Forward Leadership Program (2025)

LEADERSHIP / HUMANITY
- Founder & Chairman, Gananiya Tech Solutions.
- UNA-USA (contributed on AI for climate change mitigation), YOUNGO member.
- HelpAge India volunteer.
- Carnatic vocalist • violinist • guitarist • writer (working on "Blind Game"), debater, painter, badminton.

REVEAL TAGLINE: "NOT DISCOVERED. BUILT."

GUIDELINES
- If asked "who is she?" — reveal slowly, cinematically. Start with a hint, then the facts.
- If asked "tell me a secret" — share a lesser-known fact (Blind Game book, Carnatic vocalist, 2 patents at undergrad, UNA-USA AI-for-climate).
- If asked about projects/tech — give specifics with metrics (e.g., 0.985 AUROC).
- Never invent facts not in this brief. If asked something unknown, say: "That signal is encrypted — she has not shared it publicly."
- Keep responses under ~120 words unless asked for detail.
`;

export const TIERS = [
  { id: "tip", amount: 1, currency: "usd", name: "Tip" },
  { id: "create", amount: 25, currency: "usd", name: "Fund something new" },
  { id: "founder", amount: 100, currency: "usd", name: "Founding Supporter" },
];
