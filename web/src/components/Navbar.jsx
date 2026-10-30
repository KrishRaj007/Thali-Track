import React from 'react';
import {
  Utensils, ShoppingBag, ChefHat, Sun, Moon,
  Menu as MenuIcon, X, Timer, Wifi, WifiOff,
  ClipboardList, BarChart3, Leaf, Zap, User, LogOut
} from 'lucide-react';

export default function Navbar({
  user, userRole, setUserRole, currentScreen, setCurrentScreen,
  isDarkMode, setIsDarkMode, mobileMenuOpen, setMobileMenuOpen,
  scrollProgress, isLiveSseConnected, lastUpdated, utmData,
  queueCount, onOpenSignIn, onSignOut
}) {
  const studentNav = [
    { id: 'menu',      label: 'Menu',       icon: Utensils },
    { id: 'queue',     label: `Queue (${queueCount})`, icon: Timer },
    ...(user ? [{ id: 'my-orders', label: 'My Tokens', icon: ClipboardList }] : [])
  ];

  const managerNav = [
    { id: 'kitchen',   label: 'Kitchen',    icon: ChefHat },
    { id: 'forecast',  label: 'Forecast',   icon: BarChart3 },
    { id: 'leftovers', label: 'Leftovers',  icon: Leaf },
    { id: 'impact',    label: 'Impact',     icon: Zap },
    { id: 'surplus',   label: 'Flash Sale', icon: Timer }
  ];

  const nav = userRole === 'student' ? studentNav : managerNav;
  const accentColor = userRole === 'student' ? '#E4A0A0' : '#EED9A0';

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="fixed top-0 left-0 h-[3px] z-[60] transition-all duration-100"
        style={{ width: `${scrollProgress}%`, backgroundColor: accentColor }}
      />

      {/* Skip to content (Baseline #12) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-[#E4A0A0] focus:text-[#1B2A4A] focus:px-3 focus:py-1.5 focus:rounded focus:text-xs focus:font-bold"
      >
        Skip to content
      </a>

      {/* Announcement bar */}
      <div className="bg-[#24345A] border-b border-[#1B2A4A]/80 px-4 py-1.5 text-[11px] text-[#B8C2D9] no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveSseConnected ? 'bg-[#10B981] pulse-dot' : 'bg-[#EF4444]'}`} />
              <span className={isLiveSseConnected ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                {isLiveSseConnected ? 'Live sync active' : 'Reconnecting...'}
              </span>
            </span>
            <span className="hidden sm:inline text-[#B8C2D9]/60">|</span>
            <span className="hidden sm:inline">
              Canteen: <strong className="text-[#FFFFFF]">08:00 AM – 05:00 PM IST</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#B8C2D9]/60">Updated</span>
            <span className="font-semibold text-[#FFFFFF] tabular">{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main sticky header */}
      <header className="sticky top-0 z-50 bg-[#1B2A4A]/95 backdrop-blur border-b border-[#24345A] no-print" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <button
            onClick={() => setCurrentScreen(userRole === 'student' ? 'menu' : 'kitchen')}
            className="flex items-center gap-3 cursor-pointer select-none group"
            aria-label="ThaliTrack home"
          >
            <div className="w-9 h-9 bg-[#24345A] border border-[#E4A0A0]/40 flex items-center justify-center rounded-lg group-hover:border-[#E4A0A0] transition-colors">
              <Utensils className="w-4.5 h-4.5 text-[#E4A0A0]" style={{width:'18px',height:'18px'}} />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-[15px] tracking-tight text-[#FFFFFF]">ThaliTrack</span>
                <span className="text-[9px] bg-[#EED9A0]/10 border border-[#EED9A0]/30 text-[#EED9A0] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  PS-06
                </span>
              </div>
              <span className="text-[10px] text-[#B8C2D9] leading-none hidden sm:block">
                Campus Pre-order & Waste Forecast
              </span>
            </div>
          </button>

          {/* Persona switcher (desktop) */}
          <div className="hidden md:flex items-center bg-[#24345A] p-1 rounded-lg border border-[#1B2A4A]">
            <button
              onClick={() => { setUserRole('student'); setCurrentScreen('menu'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                userRole === 'student'
                  ? 'bg-[#1B2A4A] text-[#E4A0A0]'
                  : 'text-[#B8C2D9] hover:text-[#FFFFFF]'
              }`}
            >
              <ShoppingBag style={{width:'13px',height:'13px'}} />
              Student
            </button>
            <button
              onClick={() => { setUserRole('manager'); setCurrentScreen('kitchen'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                userRole === 'manager'
                  ? 'bg-[#1B2A4A] text-[#EED9A0]'
                  : 'text-[#B8C2D9] hover:text-[#FFFFFF]'
              }`}
            >
              <ChefHat style={{width:'13px',height:'13px'}} />
              Manager
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 text-xs flex-1 justify-center">
            {nav.map(({ id, label, icon: Icon }) => {
              const active = currentScreen === id;
              return (
                <button
                  key={id}
                  onClick={() => setCurrentScreen(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all ${
                    active
                      ? userRole === 'student'
                        ? 'bg-[#E4A0A0]/10 text-[#E4A0A0]'
                        : 'bg-[#EED9A0]/10 text-[#EED9A0]'
                      : 'text-[#B8C2D9] hover:text-[#FFFFFF] hover:bg-[#24345A]'
                  }`}
                >
                  <Icon style={{width:'13px',height:'13px'}} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle theme"
              aria-label="Toggle theme"
              className="p-2 text-[#B8C2D9] hover:text-[#FFFFFF] bg-[#24345A] rounded-lg border border-transparent hover:border-[#B8C2D9]/30 transition"
            >
              {isDarkMode
                ? <Sun style={{width:'15px',height:'15px'}} className="text-[#EED9A0]" />
                : <Moon style={{width:'15px',height:'15px'}} className="text-[#E4A0A0]" />}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-1 bg-[#24345A] pl-2 pr-1 py-1 rounded-lg border border-[#24345A]">
                <div className="w-6 h-6 bg-[#1B2A4A] rounded-full flex items-center justify-center">
                  <User style={{width:'12px',height:'12px'}} className="text-[#B8C2D9]" />
                </div>
                <span className="text-[11px] text-[#FFFFFF] font-medium hidden sm:inline px-1">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-[#EED9A0] font-bold uppercase hidden sm:inline">
                  {user.role}
                </span>
                <button
                  onClick={onSignOut}
                  title="Sign out"
                  className="p-1.5 text-[#B8C2D9] hover:text-[#EF4444] transition ml-0.5"
                >
                  <LogOut style={{width:'12px',height:'12px'}} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenSignIn}
                className="text-xs bg-[#E4A0A0] text-[#1B2A4A] font-bold px-3.5 py-2 rounded-lg hover:opacity-90 transition"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 bg-[#24345A] text-[#FFFFFF] rounded-lg"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen
                ? <X style={{width:'18px',height:'18px'}} />
                : <MenuIcon style={{width:'18px',height:'18px'}} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#24345A] bg-[#1B2A4A] px-4 py-3 space-y-3 fade-in">
            {/* Persona toggle */}
            <div className="grid grid-cols-2 gap-2 bg-[#24345A] p-1 rounded-lg">
              <button
                onClick={() => { setUserRole('student'); setCurrentScreen('menu'); setMobileMenuOpen(false); }}
                className={`py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 ${userRole === 'student' ? 'bg-[#1B2A4A] text-[#E4A0A0]' : 'text-[#B8C2D9]'}`}
              >
                <ShoppingBag style={{width:'12px',height:'12px'}} /> Student
              </button>
              <button
                onClick={() => { setUserRole('manager'); setCurrentScreen('kitchen'); setMobileMenuOpen(false); }}
                className={`py-2 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 ${userRole === 'manager' ? 'bg-[#1B2A4A] text-[#EED9A0]' : 'text-[#B8C2D9]'}`}
              >
                <ChefHat style={{width:'12px',height:'12px'}} /> Manager
              </button>
            </div>

            {/* Nav items */}
            <div className="flex flex-col gap-1">
              {nav.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setCurrentScreen(id); setMobileMenuOpen(false); }}
                  className={`text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-2.5 font-medium transition ${
                    currentScreen === id
                      ? 'bg-[#24345A] text-[#FFFFFF]'
                      : 'text-[#B8C2D9] hover:bg-[#24345A]/60 hover:text-[#FFFFFF]'
                  }`}
                >
                  <Icon style={{width:'14px',height:'14px'}} className={currentScreen === id ? 'text-[#E4A0A0]' : ''} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
