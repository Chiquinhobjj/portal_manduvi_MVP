import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { VantaBackground } from './VantaBackground';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col relative">
      <VantaBackground />
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
