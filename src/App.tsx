import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { NoticiasPage } from './pages/NoticiasPage';
import { ServicosPage } from './pages/ServicosPage';
import { DadosPage } from './pages/DadosPage';
import { TemasPage } from './pages/TemasPage';
import { IniciativasPage } from './pages/IniciativasPage';
import { InstitutoPage } from './pages/InstitutoPage';
import { InitiativeDetailPage } from './pages/InitiativeDetailPage';
import { EditaisPage } from './pages/EditaisPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SetupPage } from './pages/SetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminBannersPage } from './pages/AdminBannersPage';
import { AdminContentPage } from './pages/AdminContentPage';
import { AdminMediaPage } from './pages/AdminMediaPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditalDetailPage } from './pages/EditalDetailPage';
import { AdminEditaisPage } from './pages/AdminEditaisPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="noticias" element={<NoticiasPage />} />
          <Route path="servicos" element={<ServicosPage />} />
          <Route path="dados" element={<DadosPage />} />
          <Route path="temas" element={<TemasPage />} />
          <Route path="editais" element={<EditaisPage />} />
          <Route path="editais/:slug" element={<EditalDetailPage />} />
          <Route path="iniciativas" element={<IniciativasPage />} />
          <Route path="iniciativas/:slug" element={<InitiativeDetailPage />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                  <h1 className="mb-4 text-4xl font-brand font-bold">404</h1>
                  <p className="text-ui-muted">página não encontrada</p>
                </div>
              </div>
            }
          />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="editais" element={<AdminEditaisPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
