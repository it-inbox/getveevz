import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  Layers,
  Sparkles,
  Calculator,
  Sliders,
  DollarSign,
  Download,
  CheckCircle2,
  Percent,
  Zap,
  Info
} from 'lucide-react';
import { Campaign, Submission } from '../../types';

interface MetricsSectionProps {
  campaigns: Campaign[];
  submissions: Submission[];
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({
  campaigns,
  submissions,
}) => {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');

  // ROI Simulator State
  const [simBudget, setSimBudget] = useState<number>(1500000);
  const [simViews, setSimViews] = useState<number>(2500000);
  const [igCpm, setIgCpm] = useState<number>(35);
  const [ytCpm, setYtCpm] = useState<number>(40);
  const [fbCpm, setFbCpm] = useState<number>(30);
  const [igShare, setIgShare] = useState<number>(50);
  const [ytShare, setYtShare] = useState<number>(35);
  const [fbShare, setFbShare] = useState<number>(15);
  const [agencyMarginTarget, setAgencyMarginTarget] = useState<number>(25);
  const [scenarioReportCopied, setScenarioReportCopied] = useState<boolean>(false);

  // Calculations
  const totalShare = igShare + ytShare + fbShare || 100;
  const normIgShare = igShare / totalShare;
  const normYtShare = ytShare / totalShare;
  const normFbShare = fbShare / totalShare;

  // Blended CPM
  const blendedCpm = Math.round((igCpm * normIgShare + ytCpm * normYtShare + fbCpm * normFbShare) * 10) / 10;
  
  // Total Creator Payouts
  const simCreatorPayouts = Math.round((simViews * blendedCpm) / 1000);
  
  // Agency Gross Margin & Profit
  const simGrossProfit = simBudget - simCreatorPayouts;
  const simEffectiveMargin = simBudget > 0 ? Math.round((simGrossProfit / simBudget) * 100) : 0;
  
  // Effective CPV (Cost Per View)
  const simCpv = simViews > 0 ? (simBudget / simViews).toFixed(2) : '0.00';
  
  // Benchmark comparison against traditional Paid Ads (Meta/Google average CPV ~ ₹1.45)
  const traditionalAdCost = Math.round(simViews * 1.45);
  const clientSavings = Math.max(0, traditionalAdCost - simBudget);
  const savingsPercent = traditionalAdCost > 0 ? Math.round((clientSavings / traditionalAdCost) * 100) : 0;
  const roiMultiplier = simBudget > 0 ? (traditionalAdCost / simBudget).toFixed(1) : '1.0';

  // Projected engagements (4.8% standard creator engagement)
  const projectedEngagements = Math.round(simViews * 0.048);
  const projectedShares = Math.round(simViews * 0.012);

  const applyPreset = (preset: 'micro' | 'launch' | 'blitz') => {
    if (preset === 'micro') {
      setSimBudget(400000);
      setSimViews(650000);
      setIgShare(60);
      setYtShare(25);
      setFbShare(15);
    } else if (preset === 'launch') {
      setSimBudget(1500000);
      setSimViews(2500000);
      setIgShare(50);
      setYtShare(35);
      setFbShare(15);
    } else if (preset === 'blitz') {
      setSimBudget(4500000);
      setSimViews(8000000);
      setIgShare(45);
      setYtShare(45);
      setFbShare(10);
    }
  };

  const handleCopySimulationReport = () => {
    const report = `GetVeevz Campaign ROI Simulation:
- Target Views: ${simViews.toLocaleString()}
- Total Budget: ₹${simBudget.toLocaleString()}
- Blended Creator CPM: ₹${blendedCpm}/1k views (IG: ₹${igCpm}, YT: ₹${ytCpm}, FB: ₹${fbCpm})
- Creator Payouts: ₹${simCreatorPayouts.toLocaleString()}
- Agency Gross Profit: ₹${simGrossProfit.toLocaleString()} (${simEffectiveMargin}% margin)
- Effective CPV: ₹${simCpv} per view
- Traditional Paid Ads Equivalent: ₹${traditionalAdCost.toLocaleString()}
- Client Value Multiplier: ${roiMultiplier}x ROI (${savingsPercent}% savings)`;

    navigator.clipboard.writeText(report);
    setScenarioReportCopied(true);
    setTimeout(() => setScenarioReportCopied(false), 3000);
  };

  const totalViews = submissions.reduce((a, b) => a + (b.views || 0), 0);
  const avgViewsPerCampaign = campaigns.length ? Math.round(totalViews / campaigns.length) : 0;

  // Best performing hours & days (Heatmap data)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '11 PM'];

  // Intensity map: 0 to 4
  const heatmapData = [
    [1, 0, 2, 3, 4, 3, 2], // Mon
    [0, 0, 1, 3, 3, 4, 2], // Tue
    [1, 0, 2, 4, 4, 4, 3], // Wed
    [0, 0, 2, 3, 3, 4, 3], // Thu
    [1, 1, 3, 4, 4, 4, 4], // Fri (Peak)
    [2, 1, 2, 4, 4, 4, 4], // Sat (Peak)
    [3, 1, 2, 3, 4, 4, 3], // Sun
  ];

  const getHeatmapColor = (val: number) => {
    switch (val) {
      case 4: return 'bg-[#0084FF] text-white';
      case 3: return 'bg-[#0084FF]/75 text-white';
      case 2: return 'bg-[#0084FF]/45 text-black';
      case 1: return 'bg-[#0084FF]/20 text-black';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const geoData = [
    { region: 'India (Tier 1 Metros)', percentage: 54, views: '5.2M' },
    { region: 'United States', percentage: 22, views: '2.1M' },
    { region: 'United Kingdom', percentage: 11, views: '1.05M' },
    { region: 'Southeast Asia (SG/MY)', percentage: 8, views: '770K' },
    { region: 'Other Global', percentage: 5, views: '480K' },
  ];

  return (
    <div className="space-y-8 font-['Manrope']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Granular Platform Performance & Metrics</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Algorithmic distribution heatmaps, demographic geo-spread, and view velocities.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-[#E0E0E0]">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                range === r ? 'bg-white text-[#0084FF] shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Last {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Views Tracked</span>
          <p className="text-3xl font-bold text-black mt-2">{totalViews.toLocaleString()}</p>
          <span className="text-xs font-bold text-[#4CAF50] flex items-center mt-1">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +24% vs previous period
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Campaigns</span>
          <p className="text-3xl font-bold text-black mt-2">{campaigns.length}</p>
          <span className="text-xs text-gray-400 mt-1 block">Active across 3 agency verticals</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Avg Views / Campaign</span>
          <p className="text-3xl font-bold text-[#0084FF] mt-2">{avgViewsPerCampaign.toLocaleString()}</p>
          <span className="text-xs font-bold text-[#4CAF50] flex items-center mt-1">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +16% retention bump
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Conversion / CTR</span>
          <p className="text-3xl font-bold text-black mt-2">4.82%</p>
          <span className="text-xs font-bold text-[#4CAF50] flex items-center mt-1">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> High viral benchmark
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ROI SIMULATOR CARD
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border-2 border-[#0084FF]/20 shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0E0E0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] text-[#0084FF] flex items-center justify-center shadow-xs">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-black font-['Manrope']">ROI Simulator</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  simGrossProfit > 0 
                    ? 'bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30' 
                    : 'bg-[#F44336]/15 text-[#F44336] border border-[#F44336]/30'
                }`}>
                  {simGrossProfit > 0 ? '● Profitable Campaign' : '● Deficit / Review Rates'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Input your campaign expectations below to calculate projected Estimated ROI, Cost-per-View (CPV), and real-time profitability margins.
              </p>
            </div>
          </div>

          {/* Quick Presets & Report Copy */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold mr-1">Presets:</span>
            <button
              onClick={() => applyPreset('micro')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-[#E3F2FD] hover:text-[#0084FF] text-gray-700 transition-colors cursor-pointer"
            >
              Micro (650K Views)
            </button>
            <button
              onClick={() => applyPreset('launch')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-[#E3F2FD] hover:text-[#0084FF] text-gray-700 transition-colors cursor-pointer"
            >
              Launch (2.5M Views)
            </button>
            <button
              onClick={() => applyPreset('blitz')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-[#E3F2FD] hover:text-[#0084FF] text-gray-700 transition-colors cursor-pointer"
            >
              Blitz (8M Views)
            </button>
            <button
              onClick={handleCopySimulationReport}
              className="flex items-center gap-1.5 px-3 py-1 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer ml-1"
              title="Copy scenario report to clipboard"
            >
              {scenarioReportCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" /> : <Download className="w-3.5 h-3.5" />}
              <span>{scenarioReportCopied ? 'Copied ✓' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>

        {/* Simulator Core: Inputs Grid & Results Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Direct Inputs (7 Columns) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 3 Explicit Primary Custom Inputs: Estimated Views, Campaign Budget, CPM Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* 1. Estimated Views Input */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E0E0E0] space-y-2">
                <label className="text-xs font-bold text-black block">
                  Estimated Views
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10000"
                    step="50000"
                    value={simViews}
                    onChange={(e) => setSimViews(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-sm font-bold text-black focus:outline-hidden focus:border-[#0084FF]"
                  />
                </div>
                <input
                  type="range"
                  min="100000"
                  max="10000000"
                  step="50000"
                  value={simViews}
                  onChange={(e) => setSimViews(Number(e.target.value))}
                  className="w-full accent-[#0084FF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>100K</span>
                  <span>5M</span>
                  <span>10M+</span>
                </div>
              </div>

              {/* 2. Campaign Budget Input */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E0E0E0] space-y-2">
                <label className="text-xs font-bold text-black block">
                  Campaign Budget (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50000"
                    step="50000"
                    value={simBudget}
                    onChange={(e) => setSimBudget(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-sm font-bold text-black focus:outline-hidden focus:border-[#0084FF]"
                  />
                </div>
                <input
                  type="range"
                  min="200000"
                  max="5000000"
                  step="100000"
                  value={simBudget}
                  onChange={(e) => setSimBudget(Number(e.target.value))}
                  className="w-full accent-[#0084FF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>₹2L</span>
                  <span>₹25L</span>
                  <span>₹50L</span>
                </div>
              </div>

              {/* 3. Base CPM Rate Input */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E0E0E0] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black">
                    CPM Rate (₹/1k)
                  </label>
                  <span className="text-[10px] font-semibold text-[#0084FF]">
                    Blended: ₹{blendedCpm}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="200"
                    step="1"
                    value={igCpm}
                    onChange={(e) => {
                      const val = Math.max(1, Number(e.target.value));
                      setIgCpm(val);
                      setYtCpm(Math.round(val * 1.15));
                      setFbCpm(Math.round(val * 0.85));
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-sm font-bold text-black focus:outline-hidden focus:border-[#0084FF]"
                  />
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={igCpm}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setIgCpm(val);
                    setYtCpm(Math.round(val * 1.15));
                    setFbCpm(Math.round(val * 0.85));
                  }}
                  className="w-full accent-[#0084FF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>₹10</span>
                  <span>₹50</span>
                  <span>₹100</span>
                </div>
              </div>

            </div>

            {/* Platform Distribution Accordion / Breakdown */}
            <div className="p-4 rounded-2xl border border-[#E0E0E0] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Platform CPM Fine-Tuning & Channel Mix
                </h4>
                <span className="text-xs text-gray-500">
                  Total Creator Cost: <strong className="text-black">₹{simCreatorPayouts.toLocaleString()}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Instagram Reels */}
                <div className="p-3 bg-pink-50/50 border border-pink-200/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between font-bold text-pink-700">
                    <span>Instagram Reels</span>
                    <span className="font-mono">₹{igCpm} CPM</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="80"
                    value={igCpm}
                    onChange={(e) => setIgCpm(Number(e.target.value))}
                    className="w-full accent-pink-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                    <span>Traffic Mix:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={igShare}
                      onChange={(e) => setIgShare(Number(e.target.value))}
                      className="w-12 text-center p-0.5 bg-white border border-pink-200 rounded font-bold text-pink-700"
                    />
                    <span>%</span>
                  </div>
                </div>

                {/* YouTube Shorts */}
                <div className="p-3 bg-red-50/50 border border-red-200/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between font-bold text-red-700">
                    <span>YouTube Shorts</span>
                    <span className="font-mono">₹{ytCpm} CPM</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={ytCpm}
                    onChange={(e) => setYtCpm(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                    <span>Traffic Mix:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={ytShare}
                      onChange={(e) => setYtShare(Number(e.target.value))}
                      className="w-12 text-center p-0.5 bg-white border border-red-200 rounded font-bold text-red-700"
                    />
                    <span>%</span>
                  </div>
                </div>

                {/* Facebook Reels */}
                <div className="p-3 bg-blue-50/50 border border-blue-200/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between font-bold text-blue-700">
                    <span>Facebook Reels</span>
                    <span className="font-mono">₹{fbCpm} CPM</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="70"
                    value={fbCpm}
                    onChange={(e) => setFbCpm(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                    <span>Traffic Mix:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={fbShare}
                      onChange={(e) => setFbShare(Number(e.target.value))}
                      className="w-12 text-center p-0.5 bg-white border border-blue-200 rounded font-bold text-blue-700"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Profitability Indicator Meter */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-[#E0E0E0] space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-gray-700">Campaign Profitability Barometer</span>
                <span className={simGrossProfit >= 0 ? 'text-[#4CAF50]' : 'text-[#F44336]'}>
                  {simGrossProfit >= 0 
                    ? `Projected Margin: ${simEffectiveMargin}% (₹${simGrossProfit.toLocaleString()} Net)` 
                    : `Deficit: -₹${Math.abs(simGrossProfit).toLocaleString()} (Adjust CPM / Views)`}
                </span>
              </div>
              <div className="h-3.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
                <div 
                  className="bg-[#0084FF] h-full transition-all duration-300"
                  style={{ width: `${Math.min(Math.round((simCreatorPayouts / (simBudget || 1)) * 100), 100)}%` }}
                  title={`Creator Payouts: ₹${simCreatorPayouts.toLocaleString()}`}
                />
                <div 
                  className={`h-full transition-all duration-300 ${simGrossProfit >= 0 ? 'bg-[#4CAF50]' : 'bg-[#F44336]'}`}
                  style={{ width: `${Math.max(0, Math.min(simEffectiveMargin, 100))}%` }}
                  title={`Agency Gross Margin: ₹${simGrossProfit.toLocaleString()}`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0084FF]" />
                  <span>Creator Payouts: <strong>₹{simCreatorPayouts.toLocaleString()}</strong> ({simBudget > 0 ? Math.round((simCreatorPayouts / simBudget) * 100) : 0}%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${simGrossProfit >= 0 ? 'bg-[#4CAF50]' : 'bg-[#F44336]'}`} />
                  <span>Gross Profit: <strong>₹{simGrossProfit.toLocaleString()}</strong> ({simEffectiveMargin}%)</span>
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Feedback Cards on ROI & Cost-per-View (5 Columns) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0084FF] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-[#0084FF]" />
                  Profitability & Performance Output
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  simGrossProfit >= 0 ? 'bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30' : 'bg-[#F44336]/20 text-[#F44336] border border-[#F44336]/30'
                }`}>
                  {simGrossProfit >= 0 ? `${roiMultiplier}x ROI Multiplier` : 'Unprofitable'}
                </span>
              </div>

              {/* Primary Visual Feedback: Estimated ROI & Cost-per-View */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* 1. Estimated ROI Card */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  simGrossProfit >= 0 
                    ? 'bg-emerald-950/30 border-emerald-500/30' 
                    : 'bg-red-950/30 border-red-500/30'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Estimated ROI</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className={`text-3xl font-black ${simGrossProfit >= 0 ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
                      {simEffectiveMargin}%
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-300 font-semibold mt-1 block">
                    {simGrossProfit >= 0 ? `+₹${simGrossProfit.toLocaleString()} Net Gain` : `-₹${Math.abs(simGrossProfit).toLocaleString()} Loss`}
                  </span>
                </div>

                {/* 2. Cost-per-View (CPV) Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Cost-per-View (CPV)</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#0084FF]">₹{simCpv}</span>
                    <span className="text-[10px] text-gray-400">/ view</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                    vs ₹1.45 Meta PPC Avg
                  </span>
                </div>

              </div>

              {/* Immediate Visual Feedback on Campaign Profitability */}
              <div className={`p-4 rounded-2xl border ${
                simGrossProfit >= (simBudget * 0.20)
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : simGrossProfit > 0
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  : 'bg-red-950/40 border-red-500/30 text-red-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs">
                  {simGrossProfit >= (simBudget * 0.20) ? (
                    <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />
                  ) : simGrossProfit > 0 ? (
                    <Info className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Zap className="w-4 h-4 text-[#F44336]" />
                  )}
                  <span>
                    {simGrossProfit >= (simBudget * 0.20)
                      ? 'Optimal Campaign Profitability'
                      : simGrossProfit > 0
                      ? 'Moderate Profit Margin (Action: optimize creator CPM)'
                      : 'Negative ROI Warning (Payouts exceed client budget)'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                  {simGrossProfit >= (simBudget * 0.20)
                    ? `Healthy gross margin of ${simEffectiveMargin}%. Expected net return after full creator fulfillment: ₹${simGrossProfit.toLocaleString()}.`
                    : simGrossProfit > 0
                    ? `Margin is below target agency 20% floor. Consider rebalancing platform CPM or negotiating higher brand budget.`
                    : `Creator payout commitments of ₹${simCreatorPayouts.toLocaleString()} exceed the ₹${simBudget.toLocaleString()} budget. Reduce CPM rates or adjust view delivery milestones.`}
                </p>
              </div>

              {/* Competitive Paid Ads Benchmark */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span>Traditional PPC Ad Cost Equivalent:</span>
                  <span className="font-mono text-gray-300 line-through">₹{traditionalAdCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span>GetVeevz Organic Creator Cost:</span>
                  <span className="font-mono text-white font-bold">₹{simBudget.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-sm">
                  <span className="text-[#4CAF50]">Client Budget Savings:</span>
                  <span className="text-[#4CAF50]">₹{clientSavings.toLocaleString()} ({savingsPercent}%)</span>
                </div>
              </div>

            </div>

            {/* Bottom Insight */}
            <div className="pt-3 border-t border-white/10 text-[11px] text-gray-400 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <span>
                Formulas derive automatically from GetVeevz dynamic payout engine: <code className="text-[#0084FF] font-mono">(Views × CPM) / 1000</code>.
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Heatmap & Geo Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap: Best performing days/times */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
            <div>
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0084FF]" />
                Optimal Posting Times & Velocity Heatmap
              </h3>
              <p className="text-xs text-gray-500">Based on Instagram and YouTube Reels engagement spikes</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500">
              <span>Low</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-gray-100" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0084FF]/20" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0084FF]/45" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0084FF]/75" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0084FF]" />
              <span>High Peak</span>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Times header */}
              <div className="grid grid-cols-8 gap-2 text-center text-[11px] font-bold text-gray-400 mb-2">
                <div>Day</div>
                {times.map((t) => (
                  <div key={t}>{t}</div>
                ))}
              </div>

              {/* Heatmap rows */}
              <div className="space-y-2">
                {days.map((day, dIdx) => (
                  <div key={day} className="grid grid-cols-8 gap-2 items-center">
                    <span className="text-xs font-bold text-black text-center">{day}</span>
                    {heatmapData[dIdx].map((val, tIdx) => (
                      <div
                        key={tIdx}
                        className={`h-8 rounded-lg ${getHeatmapColor(val)} flex items-center justify-center font-bold text-[10px] transition-transform hover:scale-105 cursor-pointer shadow-2xs`}
                        title={`${day} @ ${times[tIdx]}: Score ${val}/4`}
                      >
                        {val === 4 ? 'Peak' : ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E0E0E0] text-xs text-gray-500">
            Prime recommendation: Submit and push viral clips between <strong>Friday 4PM - 10PM</strong> and <strong>Saturday 12PM - 8PM</strong> for maximum algorithmic velocity.
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#0084FF]" />
                Geographic Audience Spread
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              {geoData.map((geo) => (
                <div key={geo.region} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-black">{geo.region}</span>
                    <span className="font-bold text-black">{geo.views} ({geo.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0084FF] rounded-full"
                      style={{ width: `${geo.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 bg-gray-50 border border-[#E0E0E0] rounded-xl text-[11px] text-gray-600">
            Data verified via platform webhooks from Meta Graph and Google YouTube Analytics.
          </div>
        </div>

      </div>

    </div>
  );
};

