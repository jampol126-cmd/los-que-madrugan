import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  LogOut, 
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/frases', icon: MessageSquare, label: 'Frases' },
  { path: '/admin/suscriptores', icon: Users, label: 'Suscriptores' },
];

function Sidebar({ className, onItemClick }: { className?: string; onItemClick?: () => void }) {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/admin/login');
  };

  return (
    <div className={cn("flex flex-col h-full bg-[#0f172a] border-r border-white/5", className)}>
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌅</span>
          <div>
            <span className="font-bold text-white">
              Los que <span className="text-amber-400">Madrugan</span>
            </span>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            onClick={onItemClick}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              isActive 
                ? "bg-amber-500/10 text-amber-400" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F17] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed h-full">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-[#0f172a] border-white/5">
          <Sidebar onItemClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-[#0f172a] border-white/5">
                  <Sidebar onItemClick={() => setMobileOpen(false)} />
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 font-semibold">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-medium text-sm">Admin</p>
                  <p className="text-gray-500 text-xs">admin@losquemadrugan.co</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
