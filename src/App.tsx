import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import EmpezarPage from '@/pages/empezar/EmpezarPage';
import PagarPage from '@/pages/pagar/PagarPage';
import ExitoPage from '@/pages/exito/ExitoPage';
import ReferidosPage from '@/pages/referidos/ReferidosPage';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminFrases from '@/pages/admin/frases/AdminFrases';
import AdminSuscriptores from '@/pages/admin/suscriptores/AdminSuscriptores';
import AdminLogin from '@/pages/admin/AdminLogin';
import { useAdminAuth } from '@/hooks/useAdminAuth';

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/empezar" element={<EmpezarPage />} />
        <Route path="/pagar" element={<PagarPage />} />
        <Route path="/exito" element={<ExitoPage />} />
        <Route path="/referidos" element={<ReferidosPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="frases" element={<AdminFrases />} />
          <Route path="suscriptores" element={<AdminSuscriptores />} />
        </Route>
      </Routes>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
