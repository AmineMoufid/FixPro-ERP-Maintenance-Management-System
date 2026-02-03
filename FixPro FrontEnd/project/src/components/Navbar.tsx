import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { 
  Wrench, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Building2, 
  Cog, 
  Clipboard,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Utilisateurs', icon: Users },
    { to: '/admin/clients', label: 'Clients', icon: Building2 },
    { to: '/admin/machines', label: 'Machines', icon: Cog },
    { to: '/admin/interventions', label: 'Interventions', icon: Clipboard },
  ];

  const technicianLinks = [
    { to: '/technician/interventions', label: 'Mes interventions', icon: Clipboard },
  ];

  const links = isAdmin ? adminLinks : technicianLinks;

  const handleLogout = () => {
    logout();
  };

  const getRoleLabel = () => {
    return isAdmin ? 'Administrateur' : 'Technicien';
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo et navigation desktop */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden mr-4 text-white hover:text-blue-200 transition"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              
              <div className="flex-shrink-0 flex items-center">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Wrench className="w-6 h-6" />
                </div>
                <span className="ml-3 text-xl font-bold tracking-tight">FixPro</span>
              </div>

              {/* Navigation desktop */}
              <div className="hidden sm:ml-10 sm:flex sm:space-x-1">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Actions droite */}
            <div className="flex items-center space-x-4">
              {/* Badge de rôle - visible seulement sur desktop */}
              <div className="hidden md:flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium">
                {isAdmin ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                    <span>Administrateur</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-3 h-3 mr-2" />
                    <span>Technicien</span>
                  </>
                )}
              </div>

              {/* Bouton déconnexion */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-100 shadow-inner">
            <div className="px-4 py-3 space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Navigation
              </div>
              
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="w-4 h-4 mr-3" />
                  {link.label}
                </NavLink>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Compte
                </div>
                
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {getRoleLabel()}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;