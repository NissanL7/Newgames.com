import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowDownToLine, ArrowRight, BadgeCheck, Check, ClipboardPaste,
  FileAudio, FileVideo, Gauge, Laptop, Link2, Music2, ShieldCheck,
  Smartphone, Sparkles, Video, Zap,
} from 'lucide-react';
import Downloader from './components/Downloader';
import Faq from './components/Faq';
import Logo from './components/Logo';
import { formatOptions, steps } from './data';

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

function FormatShowcase() {
  const [active, setActive] = useState('mp4');
  const content = formatOptions[active];
  const reduceMotion = useReducedMotion();
  return (
    <div className="format-showcase">
      <div className="format-tabs" role="tablist" aria-label="Explore media formats">
        {Object.entries(formatOptions).map(([id, item]) => (
          <button
            key={id}
            id={`format-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={active === id}
            aria-controls="format-panel"
            className={active === id ? 'active' : ''}
            onClick={() => setActive(id)}
          >
            {id === 'mp4' ? <Video size={18} /> : <Music2 size={18} />}
            {item.label}
          </button>
        ))}
      </div>
      <motion.div
        key={active}
        id="format-panel"
        className="format-panel"
        role="tabpanel"
        aria-labelledby={`format-tab-${active}`}
        initial={reduceMotion ? false : { opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
      >
        <div className="format-panel-heading">
          <span>{active === 'mp4' ? 'VIDEO FORMAT' : 'AUDIO FORMAT'}</span>
          <h3>{content.title}</h3>
          <p>{content.text}</p>
        </div>
        <div className="quality-list">
          {content.options.map((item, index) => (
            <motion.div
              key={item.name}
              className="quality-row"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.05 }}
            >
              <span className="quality-icon">{active === 'mp4' ? <FileVideo size={20} /> : <FileAudio size={20} />}</span>
              <div><strong>{item.name}</strong><small>{item.detail}</small></div>
              <span className="quality-tag">{item.tag}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const reduceMotion = useReducedMotion();
  const focusDownloader = () => {
    document.getElementById('downloader')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(() => document.getElementById('video-url')?.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="site-shell" id="top">
        <section className="hero" id="downloader">
          <div className="hero-grid" aria-hidden="true" />
          <motion.div
            className="hero-orbit hero-orbit-one"
            aria-hidden="true"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="hero-orbit hero-orbit-two"
            aria-hidden="true"
            animate={reduceMotion ? undefined : { rotate: -360 }}
            transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
          />
          <header className="site-header page-width">
            <Logo />
            <nav aria-label="Main navigation">
              <a href="#how-it-works">How it works</a>
              <a href="#features">Features</a>
              <a href="#faq">FAQ</a>
            </nav>
            <button className="header-cta" type="button" onClick={focusDownloader}>Paste a link <ArrowRight size={16} /></button>
          </header>

          <div className="hero-content page-width">
            <motion.div
              className="hero-eyebrow"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <Sparkles size={15} /> A SIMPLER WAY TO SAVE MEDIA
            </motion.div>
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              YouTube video<br /><span>downloader<span className="hero-period">.</span></span>
            </motion.h1>
            <motion.p
              className="hero-description"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.14 }}
            >
              Paste a link. Choose your file. Keep the moments that matter.<br className="desktop-break" /> Simple on every screen, with no account in the way.
            </motion.p>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.2 }}
            >
              <Downloader />
            </motion.div>
          </div>
          <div className="hero-footnote page-width">
            <span><Link2 size={15} /> YouTube & Shorts links</span>
            <span><FileVideo size={15} /> Direct video & audio</span>
            <span><Smartphone size={15} /> Mobile friendly</span>
          </div>
        </section>

        <main id="main">
          <section className="steps-section section-space page-width" id="how-it-works">
            <motion.div className="section-heading split-heading" {...reveal}>
              <div><span className="section-kicker">FROM LINK TO LOCAL</span><h2>Three steps.<br />That’s the whole thing.</h2></div>
              <p>No complicated menus or mystery settings. Savr keeps the path from link to file short and understandable.</p>
            </motion.div>
            <div className="steps-grid">
              {steps.map((step, index) => (
                <motion.article
                  className="step-card"
                  key={step.number}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: reduceMotion ? 0 : index * 0.08 }}
                >
                  <div className="step-card-top"><span>{step.number}</span>{index === 0 ? <ClipboardPaste /> : index === 1 ? <Gauge /> : <ArrowDownToLine />}</div>
                  <h3>{step.title}</h3><p>{step.text}</p>
                  <div className="step-line"><span /></div>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="feature-section section-space" id="features">
            <div className="page-width">
              <motion.div className="section-heading centered-heading" {...reveal}>
                <span className="section-kicker">LESS FRICTION, MORE CONTROL</span>
                <h2>Everything you need.<br />Nothing you don’t.</h2>
                <p>A lightweight browser experience that respects your time, your screen, and your choices.</p>
              </motion.div>
              <div className="feature-bento">
                <motion.article className="feature-card feature-card-large device-feature" {...reveal}>
                  <div className="feature-copy">
                    <span className="feature-icon"><Smartphone /></span>
                    <h3>Made for the screen in your hand</h3>
                    <p>Paste, preview, and save from your phone, tablet, laptop, or desktop. The layout adapts without hiding the important bits.</p>
                    <div className="device-labels"><span><Smartphone size={15} /> Mobile</span><span><Laptop size={15} /> Desktop</span></div>
                  </div>
                  <div className="device-visual" aria-hidden="true">
                    <div className="device-window">
                      <div className="device-window-bar"><i /><i /><i /><span>savr / ready</span></div>
                      <div className="device-preview"><img src="/assets/sample-poster.svg" alt="" /><span><BadgeCheck size={15} /> MEDIA FOUND</span></div>
                      <div className="device-file-row"><FileVideo size={20} /><div><strong>creator-sample.webm</strong><small>Original quality</small></div><ArrowDownToLine size={19} /></div>
                    </div>
                  </div>
                </motion.article>
                <motion.article className="feature-card privacy-card" {...reveal} transition={{ ...reveal.transition, delay: reduceMotion ? 0 : 0.08 }}>
                  <span className="feature-icon"><ShieldCheck /></span>
                  <h3>No account. No personal profile.</h3>
                  <p>You do not need to sign in, create an account, or hand over personal details to use the direct-link workflow.</p>
                  <div className="privacy-check"><Check size={16} /> Direct files stay direct</div>
                  <div className="privacy-check"><Check size={16} /> Clear backend limitations</div>
                </motion.article>
                <motion.article className="feature-card speed-card" {...reveal} transition={{ ...reveal.transition, delay: reduceMotion ? 0 : 0.12 }}>
                  <span className="feature-icon"><Zap /></span>
                  <h3>Quick by design</h3>
                  <p>A focused interface, lightweight motion, and no unnecessary redirects between you and the available file.</p>
                  <div className="speed-visual" aria-hidden="true"><span style={{ '--bar': '92%' }} /><span style={{ '--bar': '68%' }} /><span style={{ '--bar': '82%' }} /></div>
                </motion.article>
              </div>
            </div>
          </section>

          <section className="formats-section section-space page-width" id="formats">
            <motion.div className="section-heading split-heading" {...reveal}>
              <div><span className="section-kicker">PICK YOUR FORMAT</span><h2>Watch the picture.<br />Or keep the sound.</h2></div>
              <p>Explore the options the reconstructed workflow is designed to support. Availability always comes from the actual source or connected media service.</p>
            </motion.div>
            <motion.div {...reveal}><FormatShowcase /></motion.div>
          </section>

          <section className="faq-section section-space page-width" id="faq">
            <motion.div className="faq-intro" {...reveal}>
              <span className="section-kicker">GOOD TO KNOW</span>
              <h2>Questions,<br />meet answers.</h2>
              <p>Clear expectations make better downloads. Here is how the reconstruction works and where its boundaries are.</p>
              <button type="button" onClick={focusDownloader}>Start with a link <ArrowRight size={17} /></button>
            </motion.div>
            <motion.div {...reveal} transition={{ ...reveal.transition, delay: reduceMotion ? 0 : 0.08 }}><Faq /></motion.div>
          </section>

          <section className="final-cta page-width">
            <motion.div className="final-cta-inner" {...reveal}>
              <div className="cta-spark" aria-hidden="true"><ArrowDownToLine /></div>
              <span className="section-kicker">READY WHEN YOU ARE</span>
              <h2>A good link is<br />all you need.</h2>
              <p>Try the offline sample or paste a direct media link.</p>
              <button type="button" onClick={focusDownloader}>Open downloader <ArrowRight size={19} /></button>
            </motion.div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="page-width footer-main">
            <div><Logo /><p>A focused media-saving interface.<br />Original reconstruction, honest by design.</p></div>
            <div className="footer-links"><strong>Explore</strong><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#formats">Formats</a></div>
            <div className="footer-links"><strong>Help</strong><a href="#faq">FAQ</a><a href="#downloader">Direct downloads</a><a href="#faq">Copyright guidance</a></div>
          </div>
          <div className="page-width footer-bottom"><span>© 2026 Savr</span><span>Not affiliated with YouTube or SSYouTube.</span><span>Built for responsible downloading.</span></div>
        </footer>
      </div>
    </>
  );
}
