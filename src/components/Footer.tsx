import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo_manduvi_escura.svg" alt="Manduvi" className="h-5 dark:hidden" />
              <img src="/logo_manduvi_branca.svg" alt="Manduvi" className="h-5 hidden dark:block" />
            </div>
            <p className="text-sm text-ui-muted dark:text-dark-muted leading-relaxed">
              ecossistema de impacto do brasil central
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ui-text dark:text-dark-text mb-4">plataforma</h3>
            <ul className="space-y-2">
              <FooterLink to="/noticias">notícias</FooterLink>
              <FooterLink to="/servicos">serviços</FooterLink>
              <FooterLink to="/dados">dados</FooterLink>
              <FooterLink to="/temas">temas</FooterLink>
              <FooterLink to="/iniciativas">iniciativas</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ui-text dark:text-dark-text mb-4">recursos</h3>
            <ul className="space-y-2">
              <FooterLink to="/sobre">sobre</FooterLink>
              <FooterLink to="/api">API</FooterLink>
              <FooterLink to="/parceiros">parceiros</FooterLink>
              <FooterLink to="/contato">contato</FooterLink>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ui-text dark:text-dark-text mb-4">legal</h3>
            <ul className="space-y-2">
              <FooterLink to="/privacidade">privacidade</FooterLink>
              <FooterLink to="/termos">termos de uso</FooterLink>
            </ul>
            <div className="flex items-center gap-3 mt-6">
              <SocialLink href="https://github.com" label="GitHub">
                <Github className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="https://twitter.com" label="Twitter">
                <Twitter className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="https://linkedin.com" label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </SocialLink>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ui-border dark:border-dark-border">
          <p className="text-sm text-ui-muted dark:text-dark-muted text-center">
            © {new Date().getFullYear()} Manduvi OS. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-ui-muted dark:text-dark-muted hover:text-ui-text dark:hover:text-dark-text transition-colors">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="rounded-lg p-2 text-ui-muted dark:text-dark-muted transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg hover:text-ui-text dark:hover:text-dark-text"
    >
      {children}
    </a>
  );
}
