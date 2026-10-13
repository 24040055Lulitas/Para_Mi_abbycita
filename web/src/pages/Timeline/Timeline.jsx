import AuraParticles from '../../components/AuraParticles';
import Reveal from '../../components/Reveal';
import ScrollMeter from '../../components/ScrollMeter';
import { TIMELINE } from '../../data/timeline';
import './Timeline.css';

export default function Timeline() {
  return (
    <div className="timeline-page">
      <AuraParticles />
      <ScrollMeter />

      <section className="timeline-hero">
        <p className="section-eyebrow">nuestra historia</p>
        <h1 className="timeline-title">
          Todo lo que hemos <em>vivido</em>
        </h1>
        <p className="timeline-subtitle">
          Cada foto que me pases va a tener su lugar aquí, en orden, para que
          puedas recorrer todo lo que hemos vivido juntos desde el principio.
        </p>
      </section>

      <section className="timeline-list">
        <div className="timeline-line" aria-hidden="true" />

        {TIMELINE.map((entry, i) => (
          <Reveal
            as="article"
            key={entry.title}
            className={`timeline-entry ${i % 2 === 0 ? 'is-left' : 'is-right'}`}
            delay={i * 60}
          >
            <span className="timeline-dot" aria-hidden="true" />

            <div className="timeline-photo">
              {entry.image ? (
                <img src={entry.image} alt={entry.title} />
              ) : (
                <span className="timeline-photo-placeholder">agrega la foto aquí</span>
              )}
            </div>

            <div className="timeline-copy">
              <p className="timeline-date">{entry.date}</p>
              <h2 className="timeline-entry-title">{entry.title}</h2>
              <p className="timeline-text">{entry.text}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
