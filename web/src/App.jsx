import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentMenu from './components/StudentMenu';
import SlotPicker from './components/SlotPicker';
import OrderConfirmation from './components/OrderConfirmation';
import LiveQueue from './components/LiveQueue';
import ManagerKitchen from './components/ManagerKitchen';
import ManagerForecast from './components/ManagerForecast';
import ManagerLeftovers from './components/ManagerLeftovers';
import ManagerImpact from './components/ManagerImpact';
import ManagerSurplus from './components/ManagerSurplus';
import { PrivacyPolicy, TermsConditions } from './components/LegalPages';
import {
  CookieBanner,
  BackToTop,
  ContactHelpdesk,
  ExpandableFaq,
  AuthModal,
  MockPaymentScreen
} from './components/BaselineWidgets';

function readStoredUser() {
  try {
    const saved = localStorage.getItem('thalitrack_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem('thalitrack_user');
    return null;
  }
}

export default function App() {
  // Navigation & Role State
  const [currentScreen, setCurrentScreen] = useState(() => readStoredUser()?.role === 'manager' ? 'kitchen' : 'menu');
  const [userRole, setUserRole] = useState(() => readStoredUser()?.role === 'manager' ? 'manager' : 'student');
  const [activeCategory, setActiveCategory] = useState('all');

  // User & Auth State
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('thalitrack_token') || '');

  // 1. Dark Mode State (Baseline #1)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 2. Cookie Banner State (Baseline #2)
  const [cookieAccepted, setCookieAccepted] = useState(() => localStorage.getItem('thalitrack_cookie') === 'true');

  // 3. Site Search State (Baseline #3)
  const [searchQuery, setSearchQuery] = useState('');

  // 4. Back to Top State (Baseline #4)
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 5. Mobile Menu State (Baseline #5)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 8. Scroll Progress Bar (Baseline #8)
  const [scrollProgress, setScrollProgress] = useState(0);

  // 9. Copy Key State (Baseline #9)
  const [copiedKey, setCopiedKey] = useState('');

  // 13. Password Visibility Toggle (Baseline #13)
  const [showPassword, setShowPassword] = useState(false);

  // 14. UTM Tracking State (Baseline #14)
  const [utmData, setUtmData] = useState({ source: '', medium: '', campaign: '' });

  // 15 & 16. Form Alerts (Baseline #15, #16)
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // 18. Last Updated Date (Baseline #18)
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [isLiveSseConnected, setIsLiveSseConnected] = useState(false);

  // 19. Expandable FAQ (Baseline #19)
  const [expandedFaq, setExpandedFaq] = useState(null);

  // 20. Floating Contact Helpdesk (Baseline #20)
  const [showContactModal, setShowContactModal] = useState(false);

  // Domain Datasets
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState({});
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotsData, setSlotsData] = useState([]);
  const [quieterTip, setQuieterTip] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [queueInfo, setQueueInfo] = useState({ active_orders_count: 0, estimated_wait_minutes: 0, queue_breakdown: [] });
  const [notifications, setNotifications] = useState([]);
  const [surplusOffers, setSurplusOffers] = useState([]);

  // Manager Datasets
  const [managerOrders, setManagerOrders] = useState([]);
  const [managerSummary, setManagerSummary] = useState([]);
  const [managerStatusFilter, setManagerStatusFilter] = useState('all');
  const [managerSlotFilter, setManagerSlotFilter] = useState('all');
  const [forecastData, setForecastData] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [leftoverInputs, setLeftoverInputs] = useState({});
  const [surplusForm, setSurplusForm] = useState({ dish_id: '', qty: '', original_price: '', discount_price: '' });
  const [safetyBufferPct, setSafetyBufferPct] = useState(5);

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Capture UTM parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmData({
      source: params.get('utm_source') || 'campus_portal',
      medium: params.get('utm_medium') || 'qr_sticker',
      campaign: params.get('utm_campaign') || 'break_rush'
    });
  }, []);

  // Scroll listener for progress bar & back to top
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setScrollProgress((window.scrollY / scrollHeight) * 100);
      }
      setShowBackToTop(window.scrollY > 180);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch initial datasets
  useEffect(() => {
    loadDishes();
    loadSlots();
    loadQueue();
    loadNotifications();
    loadSurplus();
  }, []);

  // Realtime Server-Sent Events (SSE) Synchronizer
  useEffect(() => {
    const sse = new EventSource('/api/events');

    sse.onopen = () => setIsLiveSseConnected(true);
    sse.onerror = () => setIsLiveSseConnected(false);

    sse.addEventListener('new_order', () => {
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
      loadSlots();
      loadQueue();
      if (userRole === 'manager') loadManagerOrders();
    });

    sse.addEventListener('order_status_update', (e) => {
      const updated = JSON.parse(e.data);
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
      setActiveOrder((prev) => (prev && prev.public_order_id === updated.public_order_id ? { ...prev, status: updated.status } : prev));
      if (userRole === 'manager') loadManagerOrders();
      loadMyOrders();
    });

    sse.addEventListener('leftovers_updated', () => {
      loadForecast();
      loadImpact();
    });

    sse.addEventListener('new_notification', () => loadNotifications());
    sse.addEventListener('surplus_alert', () => {
      loadNotifications();
      loadSurplus();
    });

    return () => sse.close();
  }, [userRole]);

  // API Callers
  const loadDishes = async () => {
    try {
      const res = await fetch('/api/dishes');
      const data = await res.json();
      setDishes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSlots = async () => {
    try {
      const res = await fetch('/api/slots');
      const data = await res.json();
      setSlotsData(data.slots || []);
      setQuieterTip(data.quieter_suggestion);
    } catch (e) {
      console.error(e);
    }
  };

  const loadQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      setQueueInfo(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSurplus = async () => {
    try {
      const res = await fetch('/api/surplus/offers');
      const data = await res.json();
      setSurplusOffers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMyOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadManagerOrders = async () => {
    if (!token || user?.role !== 'manager') return;
    try {
      let url = `/api/manager/orders?status=${managerStatusFilter}`;
      if (managerSlotFilter !== 'all') url += `&slot=${managerSlotFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setManagerOrders(data.orders || []);
        setManagerSummary(data.slot_summary || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadForecast = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/forecast/tomorrow?buffer=${safetyBufferPct}`);
      const data = await res.json();
      setForecastData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadImpact = async () => {
    try {
      const res = await fetch('/api/impact');
      const data = await res.json();
      setImpactData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (userRole === 'manager') {
      if (currentScreen === 'kitchen') loadManagerOrders();
      if (currentScreen === 'forecast') loadForecast();
      if (currentScreen === 'impact') loadImpact();
    }
    if (currentScreen === 'my-orders') loadMyOrders();
  }, [currentScreen, userRole, managerStatusFilter, managerSlotFilter, safetyBufferPct]);

  // Cart operations
  const updateCart = (dishId, delta) => {
    setCart((prev) => {
      const current = prev[dishId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[dishId];
        return copy;
      }
      return { ...prev, [dishId]: next };
    });
  };

  const cartTotal = Object.entries(cart).reduce((sum, [dId, qty]) => {
    const dish = dishes.find((d) => d.id === parseInt(dId, 10));
    return sum + (dish ? Number(dish.price) * qty : 0);
  }, 0);

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  // Authentication Handlers
  const handleDemoSignIn = async (email, password) => {
    try {
      setIsLoading(true);
      setFormError('');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('thalitrack_user', JSON.stringify(data.user));
      localStorage.setItem('thalitrack_token', data.token);
      setIsLoginModalOpen(false);

      setFormSuccess(`Signed in as ${data.user.name} (${data.user.role})`);
      setTimeout(() => setFormSuccess(''), 2500);

      if (data.user.role === 'manager') {
        setUserRole('manager');
        setCurrentScreen('kitchen');
      } else {
        setUserRole('student');
        setCurrentScreen('menu');
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('thalitrack_user');
    localStorage.removeItem('thalitrack_token');
    setUserRole('student');
    setCurrentScreen('menu');
  };

  // Place pre-order
  const handlePlaceOrder = async () => {
    if (!selectedSlot) {
      setFormError('Please select a 10-minute pickup slot');
      return;
    }
    if (cartItemCount === 0) {
      setFormError('Your tray is empty');
      return;
    }

    try {
      setIsLoading(true);
      setFormError('');
      const payload = Object.entries(cart).map(([dish_id, qty]) => ({
        dish_id: parseInt(dish_id, 10),
        qty
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          slot_start: selectedSlot,
          items: payload,
          customer_name: user?.name || 'Campus Student',
          user_id: user?.id || null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setActiveOrder(data);
      setCart({});
      setCurrentScreen('confirmation');
      loadDishes();
      loadSlots();
      loadQueue();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Manager: Update Order Status
  const handleUpdateOrderStatus = async (publicOrderId, newStatus) => {
    try {
      const res = await fetch(`/api/manager/orders/${publicOrderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        loadManagerOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manager: Submit Leftovers
  const handleSubmitLeftovers = async (e) => {
    e.preventDefault();
    const leftovers = Object.entries(leftoverInputs).map(([dId, kg]) => ({
      dish_id: parseInt(dId, 10),
      leftover_kg: parseFloat(kg) || 0
    }));
    try {
      const res = await fetch('/api/manager/leftovers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ leftovers })
      });
      if (res.ok) {
        setFormSuccess('Closing leftovers recorded. Next-day forecast buffer updated.');
        setLeftoverInputs({});
      }
    } catch (err) {
      setFormError('Failed to record leftovers');
    }
  };

  // Manager: Submit Surplus Offer
  const handleSubmitSurplus = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/surplus/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(surplusForm)
      });
      if (res.ok) {
        setFormSuccess('Surplus discount offer broadcast to campus feeds!');
        setSurplusForm({ dish_id: '', qty: '', original_price: '', discount_price: '' });
        loadSurplus();
      }
    } catch (err) {
      setFormError('Failed to broadcast surplus offer');
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="min-h-screen bg-[#1B2A4A] text-[#FFFFFF] font-sans flex flex-col justify-between selection:bg-[#E4A0A0] selection:text-[#1B2A4A]">
      {/* Pinned Navbar Component */}
      <Navbar
        user={user}
        userRole={userRole}
        setUserRole={setUserRole}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        scrollProgress={scrollProgress}
        isLiveSseConnected={isLiveSseConnected}
        lastUpdated={lastUpdated}
        utmData={utmData}
        queueCount={queueInfo.active_orders_count}
        onOpenSignIn={() => setIsLoginModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* 15 & 16. Form Feedback Alerts (Baseline #15, #16) */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-3">
        {formSuccess && (
          <div className="bg-[#24345A] border-l-4 border-[#EED9A0] p-2.5 rounded text-xs text-[#FFFFFF] flex items-center justify-between">
            <span>{formSuccess}</span>
            <button onClick={() => setFormSuccess('')}>✕</button>
          </div>
        )}
        {formError && (
          <div className="bg-[#24345A] border-l-4 border-[#EF4444] p-2.5 rounded text-xs text-[#FFFFFF] flex items-center justify-between">
            <span>{formError}</span>
            <button onClick={() => setFormError('')}>✕</button>
          </div>
        )}
      </div>

      {/* Main Content Workspace */}
      <main id="main-content" className="max-w-4xl mx-auto w-full px-4 py-4 flex-1">
        {/* STUDENT SCREENS */}
        {currentScreen === 'menu' && (
          <StudentMenu
            dishes={dishes}
            cart={cart}
            updateCart={updateCart}
            cartTotal={cartTotal}
            cartItemCount={cartItemCount}
            onProceedToSlots={() => setCurrentScreen('slots')}
            surplusOffers={surplusOffers}
            quieterTip={quieterTip}
            onPickQuieterSlot={(slot) => {
              setSelectedSlot(slot);
              setCurrentScreen('slots');
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}

        {currentScreen === 'slots' && (
          <SlotPicker
            slotsData={slotsData}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            quieterTip={quieterTip}
            onBackToMenu={() => setCurrentScreen('menu')}
            onProceedToPayment={() => setCurrentScreen('payment')}
          />
        )}

        {currentScreen === 'payment' && (
          <MockPaymentScreen
            cart={cart}
            dishes={dishes}
            cartTotal={cartTotal}
            selectedSlot={selectedSlot}
            copiedKey={copiedKey}
            copyToClipboard={copyToClipboard}
            onChangeSlot={() => setCurrentScreen('slots')}
            onAuthorizePay={handlePlaceOrder}
            isLoading={isLoading}
          />
        )}

        {currentScreen === 'confirmation' && (
          <OrderConfirmation
            activeOrder={activeOrder}
            copiedKey={copiedKey}
            copyToClipboard={copyToClipboard}
            onOrderAnother={() => setCurrentScreen('menu')}
          />
        )}

        {currentScreen === 'queue' && (
          <LiveQueue queueInfo={queueInfo} slotsData={slotsData} />
        )}

        {currentScreen === 'my-orders' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#FFFFFF]">My Pre-Order Tokens</h2>
            {myOrders.length === 0 ? (
              <div className="bg-[#24345A] p-6 rounded text-center text-xs text-[#B8C2D9]">
                You have no active orders yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myOrders.map((o) => (
                  <div key={o.id} className="bg-[#24345A] p-3.5 rounded border border-[#24345A] flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-[#FFFFFF]">{o.public_order_id}</span>
                        <span className="text-xs bg-[#1B2A4A] text-[#EED9A0] font-semibold px-2 py-0.5 rounded">
                          Slot: {o.slot_start} IST
                        </span>
                      </div>
                      <p className="text-xs text-[#B8C2D9] mt-1">
                        {o.items?.map((it) => `${it.qty}x ${it.name}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded block mb-1 ${
                        o.status === 'ready' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#1B2A4A] text-[#E4A0A0]'
                      }`}>
                        {o.status}
                      </span>
                      <span className="text-xs font-bold text-[#FFFFFF]">₹{o.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MANAGER SCREENS */}
        {currentScreen === 'kitchen' && (
          <ManagerKitchen
            managerOrders={managerOrders}
            managerSummary={managerSummary}
            managerStatusFilter={managerStatusFilter}
            setManagerStatusFilter={setManagerStatusFilter}
            managerSlotFilter={managerSlotFilter}
            setManagerSlotFilter={setManagerSlotFilter}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {currentScreen === 'forecast' && (
          <ManagerForecast
            forecastData={forecastData}
            isLoading={isLoading}
            safetyBufferPct={safetyBufferPct}
            setSafetyBufferPct={setSafetyBufferPct}
          />
        )}

        {currentScreen === 'leftovers' && (
          <ManagerLeftovers
            dishes={dishes}
            leftoverInputs={leftoverInputs}
            setLeftoverInputs={setLeftoverInputs}
            onSubmitLeftovers={handleSubmitLeftovers}
          />
        )}

        {currentScreen === 'impact' && (
          <ManagerImpact impactData={impactData} />
        )}

        {currentScreen === 'surplus' && (
          <ManagerSurplus
            dishes={dishes}
            surplusForm={surplusForm}
            setSurplusForm={setSurplusForm}
            onSubmitSurplus={handleSubmitSurplus}
          />
        )}

        {/* LEGAL PAGES */}
        {currentScreen === 'privacy' && (
          <PrivacyPolicy onBack={() => setCurrentScreen('menu')} />
        )}

        {currentScreen === 'terms' && (
          <TermsConditions onBack={() => setCurrentScreen('menu')} />
        )}

        {/* 19. Expandable FAQ (Baseline #19) */}
        {currentScreen === 'menu' && (
          <ExpandableFaq expandedFaq={expandedFaq} setExpandedFaq={setExpandedFaq} />
        )}
      </main>

      {/* 2. Cookie Banner (Baseline #2) */}
      <CookieBanner
        cookieAccepted={cookieAccepted}
        onAccept={() => {
          localStorage.setItem('thalitrack_cookie', 'true');
          setCookieAccepted(true);
        }}
      />

      {/* 4. Back to Top Button (Baseline #4) */}
      <BackToTop show={showBackToTop} />

      {/* 20. Floating Contact Desk (Baseline #20) */}
      <ContactHelpdesk isOpen={showContactModal} setIsOpen={setShowContactModal} />

      {/* Auth Modal with 1-Tap Demo Logins */}
      <AuthModal
        isOpen={isLoginModalOpen}
        setIsOpen={setIsLoginModalOpen}
        onDemoSignIn={handleDemoSignIn}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isLoading={isLoading}
        onSubmit={(e) => {
          e.preventDefault();
          handleDemoSignIn(authEmail, authPassword);
        }}
      />

      {/* Footer with Legal links and UTM metadata */}
      <footer className="bg-[#1B2A4A] border-t border-[#24345A] py-6 px-4 text-xs text-[#B8C2D9] no-print">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <span className="font-semibold text-[#FFFFFF]">ThaliTrack</span> — Campus pre-order & food waste forecast.
            <span className="block text-[11px] text-[#B8C2D9] mt-0.5">
              Live SSE Sync Active • Last updated: {lastUpdated}
            </span>
            <span className="block text-[10px] text-[#B8C2D9]/60 mt-0.5">
              Source: {utmData.source} | Campaign: {utmData.campaign}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentScreen('privacy')} className="hover:text-[#FFFFFF] underline">
              Privacy Policy
            </button>
            <button onClick={() => setCurrentScreen('terms')} className="hover:text-[#FFFFFF] underline">
              Terms & Conditions
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
