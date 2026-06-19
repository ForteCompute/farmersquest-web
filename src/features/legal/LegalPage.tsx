import { Link } from 'react-router-dom';
import { config } from '@/services/config';
import styles from './LegalPage.module.css';

// A simple, readable legal document page (Terms of Service, Privacy Policy), shown in the storefront
// chrome. Content is passed in as plain sections; React escapes all text. These give the auth and
// footer legal links real destinations with clear, plain-language wording.
export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalPageProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.intro}>{intro}</p>
      </header>

      <div className={styles.body}>
        {sections.map((section) => (
          <section key={section.heading} className={styles.section}>
            <h2 className={styles.heading}>{section.heading}</h2>
            {section.body.map((paragraph, i) => (
              <p key={i} className={styles.text}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        <p className={styles.contact}>
          Questions? Contact us at{' '}
          <a className={styles.link} href={`mailto:${config.supportEmail}`}>
            {config.supportEmail}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
