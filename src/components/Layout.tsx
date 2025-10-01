import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SmartAdCarousel } from './SmartAdCarousel';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col relative bg-gray-50 dark:bg-gray-900">
      
      {/* PUBLICIDADE TOPO - Acima do menu (padrão sites de notícias) */}
      <div className="w-full bg-ui-bg dark:bg-dark-bg border-b border-ui-border dark:border-dark-border relative z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
          <SmartAdCarousel 
            folderPath="/fotos/propaganda/modelo_TOPO_leaderboard_970x120px"
            location="SITE-TOPO"
            height={90}
            className="w-full"
            autoRotate={true}
            rotationInterval={6000}
            showNavigation={false}
            showIndicators={true}
            defaultLinkUrl="https://exemplo.com"
            maxImages={5}
          />
        </div>
      </div>
      
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
