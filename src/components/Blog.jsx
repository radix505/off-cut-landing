import { useState } from 'react';
import { useT } from '../context/LangContext';
import { useReveal } from '../hooks/useReveal';

export default function Blog() {
  const ref = useReveal();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <section id="blog" className="blog-section" ref={ref}>
      <div className="section-header">
        <div>
          <div className="section-number">{useT('06 / BLOG', '06 / BLOG')}</div>
          <div className="section-title">{useT('Ze świata Off Cut', 'From the Off Cut World')}</div>
        </div>
      </div>
      <div className="blog-coming-wrap reveal">
        <p className="blog-coming-text">
          {useT(
            'Wkrótce — artykuły o rzemieślnictwie, stylu i kulturze barberskiej.',
            'Coming soon — articles on craft, style, and barbershop culture.'
          )}
        </p>
        {submitted ? (
          <div className="blog-coming-thanks">
            {useT('Dziękujemy! Powiadomimy Cię.', "Thanks! We'll let you know.")}
          </div>
        ) : (
          <form className="blog-email-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="blog-email-input"
              placeholder={useT('Twój email', 'Your email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="blog-email-btn">
              {useT('Powiadom mnie', 'Notify me')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
