import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { MyLotsPage } from './pages/MyLotsPage';
import { MarketPricesPage } from './pages/MarketPricesPage';
import { StorageLocatorPage } from './pages/StorageLocatorPage';
import { OrdersPage } from './pages/OrdersPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuthPage } from './pages/AuthPage';
import { CropDetailModal } from './components/CropDetailModal';
import { ChannelSellModal } from './components/ChannelSellModal';
import { WhyActionsModal } from './components/WhyActionsModal';
import { AddLotModal } from './components/AddLotModal';
import { BookStorageModal } from './components/BookStorageModal';
import { ProfileAuthModal } from './components/ProfileAuthModal';

const MainLayout: React.FC = () => {
  const { user, activeTab } = useApp();

  // Initial landing page flow: If user is not logged in, show full AuthPage
  if (!user.isLoggedIn) {
    return <AuthPage />;
  }

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'My Lots':
        return <MyLotsPage />;
      case 'Market Prices':
        return <MarketPricesPage />;
      case 'Storage Locator':
        return <StorageLocatorPage />;
      case 'Orders':
        return <OrdersPage />;
      case 'Reports':
        return <ReportsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4] text-gray-900 flex flex-col antialiased">
      <Navbar />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col w-full">
        {renderCurrentPage()}

        {/* Global Interactive Modals */}
        <CropDetailModal />
        <ChannelSellModal />
        <WhyActionsModal />
        <AddLotModal />
        <BookStorageModal />
        <ProfileAuthModal />
      </main>
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
