import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BestActions } from './components/BestActions';
import { SellChannels } from './components/SellChannels';
import { CropDetailModal } from './components/CropDetailModal';
import { ChannelSellModal } from './components/ChannelSellModal';
import { WhyActionsModal } from './components/WhyActionsModal';

const DashboardContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      
      {activeTab === 'Dashboard' ? (
        <>
          {/* Section 1: Hero Banner & Market Overview */}
          <HeroSection />

          {/* Section 2: Today's Best Actions (CORE SECTION) */}
          <BestActions />

          {/* Section 3: Sell Your Produce – Reach More Buyers */}
          <SellChannels />
        </>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 mb-2">
            {activeTab} Overview
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Detailed management panel for <strong>{activeTab}</strong> connected directly to live Mandi APMC data streams.
          </p>
          <div className="bg-green-50 border border-green-200 text-[#167A42] font-semibold text-xs py-2 px-4 rounded-full inline-flex items-center gap-2">
            <span>● Live Data Stream Active</span>
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <CropDetailModal />
      <ChannelSellModal />
      <WhyActionsModal />

    </main>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <div className="min-h-screen bg-[#f4f7f4] text-gray-900 flex flex-col">
          <Navbar />
          <DashboardContent />
        </div>
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
