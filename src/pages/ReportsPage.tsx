import React from 'react';
import { mockReportSummary } from '../data/mockData';
import { AutoTranslate } from '../context/LanguageContext';
import { BarChart3, Download, TrendingUp, DollarSign, Sprout, PieChart } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const r = mockReportSummary;

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#167A42]" />
            <AutoTranslate text="Farm Yield & Earnings Reports" />
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            <AutoTranslate text="Season financial analytics, channel profitability breakdown, and export statement." />
          </p>
        </div>

        <button
          onClick={() => alert('📄 Financial Report PDF downloaded successfully!')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span><AutoTranslate text="Export PDF Report" /></span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase"><AutoTranslate text="Season Net Revenue" /></span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#167A42] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-[#167A42] tracking-tight">
            ₹{r.totalRevenueRs.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +18.4% <AutoTranslate text="vs last season" />
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase"><AutoTranslate text="Total Harvest Volume" /></span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight">
            {r.totalHarvestKg.toLocaleString()} kg
          </div>
          <span className="text-[11px] text-gray-500 font-medium mt-1 block">
            <AutoTranslate text="Across 4 registered lots" />
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase"><AutoTranslate text="Avg Profit Margin" /></span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-purple-800 tracking-tight">
            {r.avgProfitMarginPercent}%
          </div>
          <span className="text-[11px] text-gray-500 font-medium mt-1 block">
            <AutoTranslate text="AI optimized timing boost" />
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase"><AutoTranslate text="Active Crop Lots" /></span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight">
            {r.activeLotsCount} <AutoTranslate text="Lots" />
          </div>
          <span className="text-[11px] text-gray-500 font-medium mt-1 block">
            <AutoTranslate text="100% digital tracking" />
          </span>
        </div>
      </div>

      {/* Monthly Chart & Channel Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Revenue Bar Breakdown */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-heading font-bold text-base text-gray-900 mb-4">
            <AutoTranslate text="Monthly Farm Revenue Growth (2025)" />
          </h3>

          <div className="space-y-3.5">
            {r.monthlyBreakdown.map((m, idx) => {
              const maxRev = 150000;
              const widthPct = (m.revenue / maxRev) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span><AutoTranslate text={m.month} /> 2025</span>
                    <span className="text-[#167A42]">₹{m.revenue.toLocaleString()} ({m.yield} kg)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#167A42] h-full rounded-full transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel Profit Share */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-heading font-bold text-base text-gray-900 mb-4">
            <AutoTranslate text="Channel Revenue Distribution" />
          </h3>

          <div className="space-y-4">
            {r.channelShare.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#167A42]" />
                  <span className="font-semibold text-gray-800"><AutoTranslate text={c.channel} /></span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 block">₹{c.amount.toLocaleString()}</span>
                  <span className="text-[10.5px] text-gray-400 font-medium">{c.percent}% <AutoTranslate text="Share" /></span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <span className="text-xs text-gray-500">
              <AutoTranslate text="Quick Commerce (Blinkit & Swiggy) generated 60% of total revenue." />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
