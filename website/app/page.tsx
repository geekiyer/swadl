import Image from "next/image";

const FEATURES = [
  {
    title: "Quick Logging",
    description:
      "Log feeds, diapers, sleep, and pump sessions in seconds. Track bottle amounts in both oz and ml. See time-since-last at a glance.",
    color: "#E88A30",
    bg: "#FFF3E4",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="12" y="6" width="16" height="28" rx="4" fill="#FCECD4" stroke="#C07A2A" strokeWidth="2" />
        <rect x="14" y="18" width="12" height="14" rx="2" fill="#F5B040" />
        <path d="M16 6V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" stroke="#C07A2A" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Caregiver Coordination",
    description:
      "Three care modes \u2014 Together, Shifts, and Nanny \u2014 adapt to how your family works. Hand off with auto-generated briefings.",
    color: "#3A8A55",
    bg: "#EDF8F0",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="14" cy="14" r="6" fill="#D8F0E0" stroke="#4A9A65" strokeWidth="2" />
        <circle cx="26" cy="14" r="6" fill="#D8F0E0" stroke="#4A9A65" strokeWidth="2" />
        <path d="M6 32c0-5 4-9 8-9s8 4 8 9M18 32c0-5 4-9 8-9s8 4 8 9" stroke="#4A9A65" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    title: "Summaries & Trends",
    description:
      "Day and week views show feeding totals, diaper counts, sleep hours, and pump output. Share a formatted PDF report with your pediatrician.",
    color: "#4A5A9A",
    bg: "#EDF0FA",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="28" width="6" height="8" rx="1" fill="#C8D4F0" stroke="#5468A8" strokeWidth="1.5" />
        <rect x="13" y="20" width="6" height="16" rx="1" fill="#C8D4F0" stroke="#5468A8" strokeWidth="1.5" />
        <rect x="22" y="14" width="6" height="22" rx="1" fill="#C8D4F0" stroke="#5468A8" strokeWidth="1.5" />
        <rect x="31" y="8" width="6" height="28" rx="1" fill="#C8D4F0" stroke="#5468A8" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Smart Chores",
    description:
      "Pre-seeded recurring chores with animated completion. Customize, assign, and swipe to mark done. Never forget to sterilize bottles again.",
    color: "#B85A5E",
    bg: "#FDEFF0",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="6" width="28" height="28" rx="6" fill="#F8E0E0" stroke="#B85A5E" strokeWidth="2" />
        <path d="M13 20l4 4 10-10" stroke="#B85A5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const STATS = [
  { value: "4", label: "Activity types", sub: "Feed, Diaper, Sleep, Pump" },
  { value: "3", label: "Care modes", sub: "Together, Shifts, Nanny" },
  { value: "PDF", label: "Reports", sub: "Share with pediatrician" },
  { value: "0", label: "Ads", sub: "Privacy first, always" },
];

const HIGHLIGHTS = [
  { label: "Dark Mode", desc: "Easy on the eyes at 3 AM" },
  { label: "Multi-Baby", desc: "Switch between children" },
  { label: "Real-Time Sync", desc: "Everyone stays in the loop" },
  { label: "PDF Reports", desc: "One tap for pediatrician visits" },
  { label: "Offline Ready", desc: "Logs sync when you reconnect" },
  { label: "oz + ml", desc: "Track in your preferred unit" },
];

const STEPS = [
  { step: "01", title: "Add your baby", desc: "Enter your baby\u2019s name, date of birth, and feeding method. That\u2019s it." },
  { step: "02", title: "Choose your mode", desc: "Together, Shifts, or Nanny \u2014 pick how your household coordinates care." },
  { step: "03", title: "Start logging", desc: "Log feeds, diapers, sleep, and pumps with one tap. See everything at a glance." },
];

const PRIVACY_ITEMS = [
  { title: "No ads, ever", desc: "We make money from the app, not your data." },
  { title: "No data selling", desc: "Your baby\u2019s information is never shared with third parties." },
  { title: "COPPA-aware", desc: "Built with children\u2019s privacy regulations in mind." },
  { title: "Delete anytime", desc: "Remove your account and all data with one tap in Settings." },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(255,249,240,0.85)",
        borderBottom: "1px solid #F0E4D4",
      }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image src="/bee-mascot.png" alt="Swadl" width={36} height={36} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "#1A1612", letterSpacing: -0.5 }}>
              Swadl
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a href="#features" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#8A7560" }}>
              Features
            </a>
            <a href="#privacy" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#8A7560" }}>
              Privacy
            </a>
            <a href="#download" style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14,
              backgroundColor: "#E88A30", color: "#1A1612",
              padding: "8px 20px", borderRadius: 12,
            }}>
              Download
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: "relative", paddingTop: 128, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, overflow: "hidden",
        background: "linear-gradient(180deg, #FFEED8 0%, #FFF5E8 40%, #FFF9F0 100%)",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "radial-gradient(circle, #1A1612 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <Image src="/bee-mascot.png" alt="Swadl mascot" width={120} height={120} style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(48px, 8vw, 72px)", color: "#1A1612", lineHeight: 1, marginBottom: 16, letterSpacing: -1 }}>
            Parenting, <span style={{ color: "#E88A30" }}>coordinated.</span>
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "clamp(16px, 2.5vw, 20px)", color: "#4A3828", lineHeight: 1.6, maxWidth: 640, margin: "0 auto 40px" }}>
            Swadl is not another baby tracker. It&apos;s a parenting coordination tool
            that reduces cognitive load, keeps caregivers in sync, and helps you
            stay on top of everything.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <a href="#download" style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 18,
              backgroundColor: "#E88A30", color: "#1A1612",
              padding: "16px 32px", borderRadius: 16,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <svg width="18" height="22" viewBox="0 0 20 24" fill="currentColor"><path d="M16.52 12.78c-.03-2.74 2.24-4.06 2.34-4.13-1.27-1.86-3.25-2.12-3.96-2.15-1.68-.17-3.3 1-4.15 1-.87 0-2.2-.98-3.62-.95-1.86.03-3.58 1.08-4.54 2.75-1.94 3.36-.5 8.33 1.39 11.06.93 1.33 2.03 2.83 3.47 2.78 1.4-.06 1.92-.9 3.61-.9 1.68 0 2.16.9 3.63.87 1.5-.02 2.45-1.36 3.36-2.7 1.06-1.55 1.5-3.05 1.52-3.13-.03-.01-2.92-1.12-2.95-4.45zM13.82 4.36c.77-.93 1.28-2.22 1.14-3.51-1.1.04-2.44.74-3.23 1.66-.71.82-1.33 2.13-1.16 3.39 1.23.1 2.48-.63 3.25-1.54z"/></svg>
              App Store
            </a>
            <a href="#download" style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 18,
              backgroundColor: "#1A1612", color: "#FFF9F0",
              padding: "16px 32px", borderRadius: 16,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <svg width="18" height="20" viewBox="0 0 20 22" fill="currentColor"><path d="M17.9 3.4L10.8 12l7.5 9.6h-3.2l-5.5-7.1L4.1 21.6H.9L8.5 12 1.3 3.4h3.2L9.6 10l5.1-6.6h3.2z"/></svg>
              Google Play
            </a>
          </div>
          <p style={{ fontFamily: "var(--font-body)", color: "#B8A898", fontSize: 14, marginTop: 16 }}>
            Coming soon on iOS and Android
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "48px 24px", backgroundColor: "#FFFFFF", borderTop: "1px solid #F0E4D4", borderBottom: "1px solid #F0E4D4" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 36, color: "#E88A30", marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16, color: "#2E1F10", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#8A7560" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#E88A30", textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>Features</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 4vw, 40px)", color: "#1A1612", letterSpacing: -0.5 }}>Everything your family needs</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ padding: 32, borderRadius: 16, backgroundColor: f.bg, border: "1.5px solid #F0E4D4" }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: f.color, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "#4A3828", lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 24px", backgroundColor: "#FFF5E8" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#E88A30", textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>How It Works</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 4vw, 40px)", color: "#1A1612", letterSpacing: -0.5 }}>Set up in under 2 minutes</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
            {STEPS.map((item) => (
              <div key={item.step} style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#E88A30", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, color: "#1A1612" }}>{item.step}</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#1A1612", marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "#4A3828", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for real parents */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#E88A30", textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>Built for Real Parents</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 4vw, 40px)", color: "#1A1612", letterSpacing: -0.5, marginBottom: 16 }}>Not clinical. Not cold. Handcrafted.</h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 18, color: "#4A3828", lineHeight: 1.6, maxWidth: 640, margin: "0 auto" }}>
              Warm nursery-inspired design with dark mode for late-night feeds.
              Multi-baby support. Real-time sync across caregivers. Custom illustrated icons
              that feel like they belong in a children&apos;s book.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {HIGHLIGHTS.map((item) => (
              <div key={item.label} style={{ padding: 20, borderRadius: 12, backgroundColor: "#FFFFFF", border: "1.5px solid #F0E4D4", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#1A1612", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#8A7560" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" style={{ padding: "80px 24px", backgroundColor: "#1A1612" }}>
        <div style={{ maxWidth: 768, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#E88A30", textTransform: "uppercase", letterSpacing: 3, marginBottom: 12 }}>Privacy First</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 4vw, 40px)", color: "#F5EDE2", letterSpacing: -0.5, marginBottom: 24 }}>
            Your family&apos;s data stays private.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, textAlign: "left" }}>
            {PRIVACY_ITEMS.map((item) => (
              <div key={item.title} style={{ padding: 20, borderRadius: 12, backgroundColor: "#221E18", border: "1px solid #302820" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#F5EDE2", marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#8A7A68" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="download" style={{ padding: "96px 24px", textAlign: "center", background: "linear-gradient(180deg, #FFF9F0 0%, #FFEED8 100%)" }}>
        <div style={{ maxWidth: 768, margin: "0 auto" }}>
          <Image src="/bee-mascot.png" alt="Swadl" width={80} height={80} style={{ margin: "0 auto 24px", display: "block", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(28px, 4vw, 40px)", color: "#1A1612", letterSpacing: -0.5, marginBottom: 16 }}>
            Ready to coordinate like a team?
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 18, color: "#4A3828", marginBottom: 32 }}>
            Download Swadl and take the guesswork out of parenting.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            <a href="#" style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 18,
              backgroundColor: "#E88A30", color: "#1A1612",
              padding: "16px 32px", borderRadius: 16,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <svg width="18" height="22" viewBox="0 0 20 24" fill="currentColor"><path d="M16.52 12.78c-.03-2.74 2.24-4.06 2.34-4.13-1.27-1.86-3.25-2.12-3.96-2.15-1.68-.17-3.3 1-4.15 1-.87 0-2.2-.98-3.62-.95-1.86.03-3.58 1.08-4.54 2.75-1.94 3.36-.5 8.33 1.39 11.06.93 1.33 2.03 2.83 3.47 2.78 1.4-.06 1.92-.9 3.61-.9 1.68 0 2.16.9 3.63.87 1.5-.02 2.45-1.36 3.36-2.7 1.06-1.55 1.5-3.05 1.52-3.13-.03-.01-2.92-1.12-2.95-4.45zM13.82 4.36c.77-.93 1.28-2.22 1.14-3.51-1.1.04-2.44.74-3.23 1.66-.71.82-1.33 2.13-1.16 3.39 1.23.1 2.48-.63 3.25-1.54z"/></svg>
              Download on App Store
            </a>
            <a href="#" style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 18,
              backgroundColor: "#1A1612", color: "#FFF9F0",
              padding: "16px 32px", borderRadius: 16,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <svg width="18" height="20" viewBox="0 0 20 22" fill="currentColor"><path d="M17.9 3.4L10.8 12l7.5 9.6h-3.2l-5.5-7.1L4.1 21.6H.9L8.5 12 1.3 3.4h3.2L9.6 10l5.1-6.6h3.2z"/></svg>
              Get on Google Play
            </a>
          </div>
          <p style={{ fontFamily: "var(--font-body)", color: "#B8A898", fontSize: 14, marginTop: 16 }}>
            Coming soon on iOS and Android
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px 24px", backgroundColor: "#1A1612", borderTop: "1px solid #302820" }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/bee-mascot.png" alt="Swadl" width={28} height={28} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#F5EDE2" }}>Swadl</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="/privacy" style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#8A7A68" }}>Privacy Policy</a>
            <a href="/terms" style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#8A7A68" }}>Terms of Service</a>
            <a href="mailto:swadl.support@gmail.com" style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "#8A7A68" }}>Contact</a>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#5A4A38" }}>
            &copy; {new Date().getFullYear()} Swadl
          </p>
        </div>
      </footer>
    </div>
  );
}
