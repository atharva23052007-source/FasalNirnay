import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { BestActions } from '../components/BestActions';
import { SellChannels } from '../components/SellChannels';

export const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: Hero Banner & Market Overview */}
      <HeroSection />

      {/* Section 2: Today's Best Actions (CORE SECTION) */}
      <BestActions />

      {/* Section 3: Sell Your Produce – Reach More Buyers */}
      <SellChannels />
    </div>
  );
};
