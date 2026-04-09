import { useNavigate } from "react-router-dom"
import "./LandingPage.css"

export default function LandingPage() {
  const navigate = useNavigate()
  const onGetStarted = () => navigate("/signup")
  const onSignIn = () => navigate("/signin")
  return (
    <div className="lp-root">
      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <span className="lp-logo-icon">✦</span> CareerMate AI
          </div>
          <ul className="lp-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#demo">Demo</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={onSignIn}>Sign In</button>
            <button className="lp-btn-primary" onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <span className="lp-hero-badge">🚀 AI-Powered Career Coach</span>
          <h1 className="lp-hero-title">
            Your AI Career<br />Practice Partner
          </h1>
          <p className="lp-hero-sub">
            Practise interviews, polish your resume, and land your dream job — with
            a smart AI that knows what top employers look for.
          </p>
          <div className="lp-hero-btns">
            <button className="lp-btn-primary lp-btn-lg" onClick={onGetStarted}>
              Get Started Free
            </button>
            <button className="lp-btn-outline lp-btn-lg">
              ▶ Watch Demo
            </button>
          </div>
          <p className="lp-hero-note">No credit card required · Free forever plan</p>
        </div>

        <div className="lp-hero-right">
          {/* Robot mascot placeholder — replace with your image */}
          <div className="lp-robot-wrap">
            <div className="lp-robot-bg" />
            <div className="lp-robot-placeholder">🤖</div>
            {/* Floating badges */}
            <div className="lp-badge lp-badge-tl">
              <span className="lp-badge-icon">📄</span>
              <span>Resume Reviewed</span>
            </div>
            <div className="lp-badge lp-badge-tr">
              <span className="lp-badge-icon">🎯</span>
              <span>Interview Ready</span>
            </div>
            <div className="lp-badge lp-badge-bl">
              <span className="lp-badge-icon">⚡</span>
              <span>Instant Feedback</span>
            </div>
            <div className="lp-badge lp-badge-br">
              <span className="lp-badge-icon">✅</span>
              <span>Job Matched</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="lp-section lp-problem">
        <h2 className="lp-section-title">Still Struggling with Job Applications?</h2>
        <p className="lp-section-sub">
          Most candidates fail not because they're unqualified — but because they're unprepared.
        </p>
        <div className="lp-cards-row">
          {[
            { icon: "😰", title: "Blank-page resume panic", body: "Staring at an empty document not knowing where to start or what recruiters actually want." },
            { icon: "🎤", title: "Interview anxiety", body: "Freezing up on common questions you know the answer to, unable to perform under pressure." },
            { icon: "🔍", title: "Generic applications", body: "Sending the same resume everywhere and getting ghosted because nothing stands out." },
          ].map((c) => (
            <div className="lp-card" key={c.title}>
              <span className="lp-card-icon">{c.icon}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="lp-section lp-solution">
        <div className="lp-solution-card">
          <div className="lp-solution-left">
            <p className="lp-solution-eyebrow">The Fix</p>
            <h2>CareerMate AI helps<br />fix all of that —<br /><em>smartly.</em></h2>
            <p className="lp-solution-body">
              One intelligent platform that coaches you from resume to offer letter.
              Real-time feedback, personalised tips, and practice that actually prepares you.
            </p>
            <button className="lp-btn-white lp-btn-lg" onClick={onGetStarted}>
              Start Practising Free →
            </button>
          </div>
          <div className="lp-solution-right">
            {[
              "AI resume builder tailored to each role",
              "Mock interview with instant scoring",
              "Job-description keyword matching",
              "Cover letter generator",
              "Progress tracking dashboard",
            ].map((item) => (
              <div className="lp-solution-item" key={item}>
                <span className="lp-check">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section" id="features">
        <h2 className="lp-section-title">Everything You Need to Grow Your Career</h2>
        <p className="lp-section-sub">Six tools. One platform. Unlimited practice.</p>
        <div className="lp-features-grid">
          {[
            { icon: "📝", title: "Smart Resume Builder", body: "AI rewrites your bullet points to match ATS systems and recruiter expectations." },
            { icon: "🎙️", title: "Mock Interviews", body: "Realistic Q&A sessions with voice or text. Get scored on clarity, depth, and structure." },
            { icon: "🔑", title: "Keyword Optimiser", body: "Paste a job description and instantly see which keywords your resume is missing." },
            { icon: "✍️", title: "Cover Letter AI", body: "Generate compelling, personalised cover letters in under 60 seconds." },
            { icon: "📊", title: "Progress Tracker", body: "Monitor your improvement across sessions and know exactly what to practise next." },
            { icon: "🤝", title: "Job Match Score", body: "See how well your profile fits any role before you even apply." },
          ].map((f) => (
            <div className="lp-feature-card" key={f.title}>
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO ── */}
      <section className="lp-section lp-demo-section" id="demo">
        <h2 className="lp-section-title">See CareerMate AI in Action</h2>
        <p className="lp-section-sub">Watch how quickly you can go from nervous to confident.</p>
        <div className="lp-demo-wrap">
          {/* Replace with a real screenshot/video */}
          <div className="lp-demo-placeholder">
            <span>📸 App Screenshot / Demo Video</span>
            <p>Replace this block with your product screenshot or embedded video</p>
          </div>
          <div className="lp-demo-steps">
            {[
              { num: "01", title: "Upload Your Resume", body: "Drop in your existing resume or start from scratch with our templates." },
              { num: "02", title: "Choose a Target Role", body: "Tell us the job you're after and we tailor everything to it." },
              { num: "03", title: "Practise & Improve", body: "Run mock interviews, get feedback, iterate — then apply with confidence." },
            ].map((s) => (
              <div className="lp-demo-step" key={s.num}>
                <span className="lp-step-num">{s.num}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH CALLOUT ── */}
      <section className="lp-section lp-tech">
        <div className="lp-tech-inner">
          <div className="lp-tech-icon">⚙️</div>
          <div>
            <h3>Built with AI Engineering</h3>
            <p>
              Powered by the latest large language models, fine-tuned on thousands of real
              hiring conversations, and continuously updated to match evolving market trends.
            </p>
          </div>
          <div className="lp-tech-pills">
            <span>GPT-4</span><span>Claude</span><span>RAG Pipeline</span><span>Real-time scoring</span>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-section" id="testimonials">
        <h2 className="lp-section-title">Trusted by Students Worldwide</h2>
        <p className="lp-section-sub">Real people. Real results.</p>
        <div className="lp-testimonials-grid">
          {[
            {
              name: "Aisha K.",
              role: "CS Graduate · Google Intern",
              quote: "CareerMate AI transformed my interviews. I went from blanking out to answering every question with structure and confidence.",
              avatar: "👩🏾‍💻",
            },
            {
              name: "James T.",
              role: "Finance Major · JP Morgan Offer",
              quote: "The keyword optimiser alone got my resume past ATS filters I was stuck on for months. Landed 3 interviews in one week.",
              avatar: "👨🏻‍💼",
            },
            {
              name: "Priya M.",
              role: "MBA Student · McKinsey Finalist",
              quote: "The mock case interviews are shockingly realistic. Practised every day for two weeks and made it to the final round.",
              avatar: "👩🏽‍🎓",
            },
          ].map((t) => (
            <div className="lp-testimonial-card" key={t.name}>
              <div className="lp-testimonial-avatar">{t.avatar}</div>
              <p className="lp-testimonial-quote">"{t.quote}"</p>
              <div className="lp-testimonial-author">
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
              <div className="lp-stars">★★★★★</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="lp-section lp-contact-section" id="contact">
        <div className="lp-contact-wrap">
          <div className="lp-contact-left">
            <h2>Get in touch</h2>
            <p>
              Have a question, partnership enquiry, or just want to say hi?
              We'd love to hear from you.
            </p>
            <div className="lp-contact-info">
              <p>📧 hello@careermate.ai</p>
              <p>🐦 @CareerMateAI</p>
              <p>💼 linkedin.com/company/careermate-ai</p>
            </div>
          </div>
          <form className="lp-contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="lp-form-row">
              <input type="text" placeholder="Your name" />
              <input type="email" placeholder="Email address" />
            </div>
            <input type="text" placeholder="Subject" />
            <textarea placeholder="Your message…" rows={5} />
            <button type="submit" className="lp-btn-primary lp-btn-lg">Send Message</button>
          </form>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-cta-banner">
        <h2>Ready to level up your career?</h2>
        <p>Join thousands of students who are already practising smarter.</p>
        <button className="lp-btn-white lp-btn-lg" onClick={onGetStarted}>
          Start for Free — No Card Needed
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo">
              <span className="lp-logo-icon">✦</span> CareerMate AI
            </div>
            <p>Your AI-powered career coach — from resume to offer letter.</p>
          </div>
          <div className="lp-footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#demo">Demo</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="lp-footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© 2026 CareerMate AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
