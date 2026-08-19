import React, { useState, useEffect } from 'react';
import { mockReportSummary } from '../data/mockData';
import { AutoTranslate, useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { translateDynamicText } from '../services/translationService';
import { BarChart3, Download, TrendingUp, DollarSign, Sprout, PieChart } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [r, setR] = useState(mockReportSummary);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { user } = useApp();

  useEffect(() => {
    fetch('http://localhost:5000/api/reports/summary')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.totalRevenueRs) {
          setR(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load backend reports summary, falling back to mock data:', err);
        setIsLoading(false);
      });
  }, []);

  const exportToPDF = async (targetLang: 'en' | 'hi' | 'mr' = language) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export the PDF report.');
      return;
    }

    const titleText = await translateDynamicText('Farm Yield & Earnings Reports', targetLang);
    const revenueText = await translateDynamicText('Season Net Revenue', targetLang);
    const volumeText = await translateDynamicText('Total Harvest Volume', targetLang);
    const marginText = await translateDynamicText('Avg Profit Margin', targetLang);
    const lotsText = await translateDynamicText('Active Crop Lots', targetLang);
    
    // Additional Details Texts
    const farmerDetailsText = await translateDynamicText('Farmer Details', targetLang);
    const nameText = await translateDynamicText('Name', targetLang);
    const locationText = await translateDynamicText('Location', targetLang);
    const farmSizeText = await translateDynamicText('Farm Size', targetLang);
    const channelDistText = await translateDynamicText('Channel Revenue Distribution', targetLang);
    const channelText = await translateDynamicText('Channel', targetLang);
    const shareText = await translateDynamicText('Share', targetLang);
    const amountText = await translateDynamicText('Amount', targetLang);
    
    const generatedOnText = await translateDynamicText('Generated dynamically on', targetLang);
    const guestFarmerText = await translateDynamicText('Guest Farmer', targetLang);
    const acresText = await translateDynamicText('Acres', targetLang);
    const monthlyGrowthTitle = await translateDynamicText(`Monthly Farm Revenue Growth (${new Date().getFullYear()})`, targetLang);
    const monthColText = await translateDynamicText('Month', targetLang);
    const revenueColText = await translateDynamicText('Revenue', targetLang);
    const yieldColText = await translateDynamicText('Yield Volume', targetLang);

    let monthlyBreakdownRows = '';
    for (const m of r.monthlyBreakdown) {
      const translatedMonth = await translateDynamicText(m.month, targetLang);
      monthlyBreakdownRows += `
        <tr>
          <td>${translatedMonth} ${new Date().getFullYear()}</td>
          <td class="badge">₹${m.revenue.toLocaleString()}</td>
          <td>${m.yield.toLocaleString()} kg</td>
        </tr>
      `;
    }

    let channelShareRows = '';
    for (const c of r.channelShare) {
      const translatedChannel = await translateDynamicText(c.channel, targetLang);
      channelShareRows += `
        <tr>
          <td>${translatedChannel}</td>
          <td>${c.percent}%</td>
          <td class="badge">₹${c.amount.toLocaleString()}</td>
        </tr>
      `;
    }

    const html = `
      <html>
        <head>
          <title>${titleText}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111827; }
            .header { border-bottom: 2px solid #167A42; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #167A42; }
            .section-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 15px; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; }
            .card-title { font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; }
            .card-value { font-size: 20px; font-weight: bold; margin-top: 8px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th { background: #f9fafb; padding: 12px; text-align: left; font-size: 11px; font-weight: bold; color: #4b5563; border-bottom: 1px solid #e5e7eb; }
            .table td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
            .badge { font-weight: bold; color: #167A42; }
            .info-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
            .info-label { font-weight: bold; color: #4b5563; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${titleText}</div>
            <div style="font-size: 11px; color: #9ca3af; margin-top: 5px;">
              ${generatedOnText} ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          
          <div class="info-box">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #167A42;">${farmerDetailsText}</div>
            <div class="info-row"><span class="info-label">${nameText}:</span> <span>${user?.name || guestFarmerText}</span></div>
            <div class="info-row"><span class="info-label">${locationText}:</span> <span>${user?.location || 'Unknown'}</span></div>
            <div class="info-row"><span class="info-label">${farmSizeText}:</span> <span>${user?.farmSizeAcres || 0} ${acresText}</span></div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">${revenueText}</div>
              <div class="card-value" style="color: #167A42;">₹${r.totalRevenueRs.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-title">${volumeText}</div>
              <div class="card-value">${r.totalHarvestKg.toLocaleString()} kg</div>
            </div>
            <div class="card">
              <div class="card-title">${marginText}</div>
              <div class="card-value" style="color: #6d28d9;">${r.avgProfitMarginPercent}%</div>
            </div>
            <div class="card">
              <div class="card-title">${lotsText}</div>
              <div class="card-value">${r.activeLotsCount}</div>
            </div>
          </div>

          <div class="section-title">${monthlyGrowthTitle}</div>
          <table class="table">
            <thead>
              <tr>
                <th>${monthColText}</th>
                <th>${revenueColText}</th>
                <th>${yieldColText}</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyBreakdownRows}
            </tbody>
          </table>

          <div class="section-title">${channelDistText}</div>
          <table class="table">
            <thead>
              <tr>
                <th>${channelText}</th>
                <th>${shareText}</th>
                <th>${amountText}</th>
              </tr>
            </thead>
            <tbody>
              ${channelShareRows}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

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

        <div className="flex gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => exportToPDF('en')}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>EN</span>
          </button>
          <button
            onClick={() => exportToPDF('hi')}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>हिन्दी</span>
          </button>
          <button
            onClick={() => exportToPDF('mr')}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>मराठी</span>
          </button>
        </div>
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
            <AutoTranslate text={`Monthly Farm Revenue Growth (${new Date().getFullYear()})`} />
          </h3>

          <div className="space-y-3.5">
            {r.monthlyBreakdown.map((m, idx) => {
              const maxRev = 150000;
              const widthPct = (m.revenue / maxRev) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span><AutoTranslate text={m.month} /> {new Date().getFullYear()}</span>
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
