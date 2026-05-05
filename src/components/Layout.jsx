import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import HelpPopup from './HelpPopup';
import PrivacyPopup from './PrivacyPopup';
import AlertPopup from './NotificationsPopup'; // Import AlertPopup

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false); // State cho alert popup

  const user = authService.getCurrentUser();

const menuItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/map', icon: 'map', label: 'Live Map' },
  { path: '/cameras', icon: 'videocam', label: 'Cameras' },
  { path: '/analytics', icon: 'analytics', label: 'Analytics' },
  { path: '/notifications', icon: 'notifications', label: 'Notifications' },
  { path: '/about', icon: 'info', label: 'About System' }, // Thêm dòng này
  { path: '/chat', icon: 'forum', label: 'Chat Box' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleAcceptPrivacy = () => {
    setShowPrivacyPopup(false);
    localStorage.setItem('privacyAccepted', 'true');
  };

  return (
    <>
      <div className="flex h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
        {/* Top Header Navigation */}
        <header className="flex h-16 items-center justify-between border-b border-primary/10 bg-white dark:bg-background-dark/50 px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined">traffic</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Smart Traffic</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  System Status: <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                </span>
              </div>

            </div>

            <div className="flex items-center gap-2 border-l border-primary/10 pl-6">
              {/* Nút thông báo (Chuông) */}
              <button 
                onClick={() => setShowAlertPopup(true)}
                className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors relative"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {/* Badge thông báo chưa đọc */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                  3
                </span>
              </button>
              
              {/* Nút Privacy Policy */}
              <button 
                onClick={() => setShowPrivacyPopup(true)}
                className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                title="Privacy Policy"
              >
                <span className="material-symbols-outlined text-xl">shield</span>
              </button>
              
              {/* Nút Help */}
              <button 
                onClick={() => setShowHelpPopup(true)}
                className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">help</span>
              </button>
              
              {/* User Avatar with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="ml-2 h-9 w-9 rounded-full bg-primary/30 overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors focus:outline-none"
                >
                  <img
                    className="h-full w-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4UEbCN5ogt749TeQKBlDznPnGgW6f8xPSV-1d0Z5chQ5qj1ioQiE0tvt0oyo4IeTCE6EZtS1M7FRYt68BzJ9J8PnXla303wSh__pgyaBuw_aTz9r7QQMAZyRuSopd52uj3JKLO1g1lNs8vo53Z5HBjt-VEJyw5yRFAawmCiHHyxevJz-zOhgSH5n5klrWYazJMFMx1pPOKBBKA9Jj-IE-IQ0WL3j7AaLLBK0Z-bG-gVI-fvyCKJHpVCLcsS_5nEgQJousIPZzA64"
                    alt="User avatar"
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    ></div>
                    
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-background-dark rounded-xl shadow-2xl border border-primary/10 z-50 overflow-hidden">
                      {/* User Info */}
                      <div className="p-4 border-b border-primary/10">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 overflow-hidden">
                            <img
                              className="h-full w-full object-cover"
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4UEbCN5ogt749TeQKBlDznPnGgW6f8xPSV-1d0Z5chQ5qj1ioQiE0tvt0oyo4IeTCE6EZtS1M7FRYt68BzJ9J8PnXla303wSh__pgyaBuw_aTz9r7QQMAZyRuSopd52uj3JKLO1g1lNs8vo53Z5HBjt-VEJyw5yRFAawmCiHHyxevJz-zOhgSH5n5klrWYazJMFMx1pPOKBBKA9Jj-IE-IQ0WL3j7AaLLBK0Z-bG-gVI-fvyCKJHpVCLcsS_5nEgQJousIPZzA64"
                              alt="User avatar"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {user?.name || 'User Name'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {user?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="material-symbols-outlined text-lg">account_circle</span>
                          <span>Profile Settings</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary/5 hover:text-primary transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="material-symbols-outlined text-lg">settings</span>
                          <span>App Settings</span>
                        </Link>

                        <div className="border-t border-primary/5 my-2"></div>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">logout</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex w-64 flex-col border-r border-primary/10 bg-white dark:bg-background-dark/50 p-4 transition-all`}>
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                      active
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Traffic Density Widget in Sidebar */}
          </aside>

          {/* Main Content */}
          <main className="relative flex-1 bg-transparent overflow-hidden">
            {children}
          </main>
        </div>
      </div>

      {/* Popups */}
      <HelpPopup 
        isOpen={showHelpPopup}
        onClose={() => setShowHelpPopup(false)}
      />

      <PrivacyPopup 
        isOpen={showPrivacyPopup}
        onClose={() => setShowPrivacyPopup(false)}
        onAccept={handleAcceptPrivacy}
      />

      <AlertPopup 
        isOpen={showAlertPopup}
        onClose={() => setShowAlertPopup(false)}
      />
    </>
  );
}

export default Layout;