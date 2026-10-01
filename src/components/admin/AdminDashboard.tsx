import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Megaphone, 
  IndianRupee, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Sparkles,
  Play
} from 'lucide-react';
import { Campaign, Submission, Payout, User } from '../../types';

interface AdminDashboardProps {
  campaigns: Campaign[];
  submissions: Submission[];
  payouts: Payout[];
  clippers: User[];
  onNavigateTab: (tabId: string) => void;
  onSelectCampaign?: (campaign: Campaign) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  campaigns,
  submissions,
  payouts,
  clippers,
  onNavigateTab,
  onSelectCampaign,
}) => {
  const [performanceRange, setPerformanceRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Total calculations
  const totalViews = submissions.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalPaid = payouts
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + (curr.approved_amount || 0), 0);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;
  const pendingApprovalsCount = submissions.filter((s) => s.status === 'pending').length;

  // Risk Dashboard Calculations for each active campaign
  const campaignRiskData = campaigns.map((camp) => {
    const campSubs = submissions.filter((s) => s.campaign_id === camp.id);
    const views = campSubs.reduce((acc, curr) => acc + (curr.views || 0), 0);
    // Estimated target based on budget / rate
    const targetViews = camp.budget ? Math.round((camp.budget / (camp.rate_per_1k_views || 35)) * 1000) : 1000000;
    const progressPercent = Math.min(Math.round((views / targetViews) * 100), 120);

    let riskLevel: 'red' | 'orange' | 'yellow' | 'blue' | 'green';
    let riskLabel: string;
    let badgeColor: string;

    if (progressPercent < 50) {
      riskLevel = 'red';
      riskLabel = 'Critical (<50%)';
      badgeColor = 'bg-[#F44336] text-white';
    } else if (progressPercent < 70) {
      riskLevel = 'orange';
      riskLabel = 'High Risk (50-70%)';
      badgeColor = 'bg-[#FFA726] text-black font-semibold';
    } else if (progressPercent < 85) {
      riskLevel = 'yellow';
      riskLabel = 'Medium Risk (70-85%)';
      badgeColor = 'bg-yellow-400 text-black font-semibold';
    } else if (progressPercent < 95) {
      riskLevel = 'blue';
      riskLabel = 'On Track (85-95%)';
      badgeColor = 'bg-[#0084FF] text-white';
    } else {
      riskLevel = 'green';
      riskLabel = 'Exceeding (95%+)';
      badgeColor = 'bg-[#4CAF50] text-white';
    }

    return {
      campaign: camp,
      views,
      targetViews,
      progressPercent,
      riskLevel,
      riskLabel,
      badgeColor,
    };
  });

  // Top 5 performers
  const topClippers = [...clippers]
    .sort((a, b) => (b.total_earned || 0) - (a.total_earned || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black font-['Manrope']">Executive Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time campaign velocity, talent distribution, and payout liquidity metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="px-4 py-2 bg-[#0084FF] hover:bg-[#0073e6] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            + Create Campaign
          </button>
          <button
            onClick={() => onNavigateTab('payouts')}
            className="px-4 py-2 bg-white border border-[#E0E0E0] hover:bg-[#E3F2FD] text-black font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Review Payouts ({payouts.filter(p => p.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Top Metrics Cards (4 columns): White bg, sky blue top border, black text, Manrope font */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Campaigns */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Campaigns</span>
            <Megaphone className="w-5 h-5 text-[#0084FF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black font-['Manrope']">24</span>
            <span className="text-xs font-bold text-[#4CAF50] flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{activeCampaignsCount} actively running right now</p>
        </div>

        {/* Active Clippers */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Clippers</span>
            <Users className="w-5 h-5 text-[#0084FF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black font-['Manrope']">156</span>
            <span className="text-xs font-bold text-[#4CAF50] flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +8%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">From vetted talent roster pool</p>
        </div>

        {/* Total Payouts This Month */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Payouts (Month)</span>
            <IndianRupee className="w-5 h-5 text-[#0084FF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black font-['Manrope']">₹45,23,000</span>
            <span className="text-xs font-bold text-[#4CAF50] flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +15%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Processed via Razorpay gateway</p>
        </div>

        {/* Average Campaign ROI */}
        <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] border-t-4 border-t-[#0084FF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Campaign ROI</span>
            <TrendingUp className="w-5 h-5 text-[#0084FF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-black font-['Manrope']">34%</span>
            <span className="text-xs font-bold text-[#4CAF50] flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +3%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Net profit after platform margin</p>
        </div>

      </div>

      {/* Charts & Risk Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Campaign Performance (Line chart visualization) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E0E0E0]">
            <div>
              <h3 className="font-bold text-base text-black font-['Manrope']">Campaign Performance (Views Trend)</h3>
              <p className="text-xs text-gray-500">Aggregate daily verified views across Instagram, YouTube & Facebook</p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setPerformanceRange(r)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    performanceRange === r ? 'bg-white text-[#0084FF] shadow-xs' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="mt-6 h-64 w-full">
            <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0084FF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0084FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="40" x2="700" y2="40" stroke="#F0F0F0" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="700" y2="90" stroke="#F0F0F0" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="700" y2="140" stroke="#F0F0F0" strokeDasharray="4 4" />
              <line x1="0" y1="190" x2="700" y2="190" stroke="#F0F0F0" strokeDasharray="4 4" />

              {/* Axis labels */}
              <text x="5" y="44" fill="#999" fontSize="10">800k views</text>
              <text x="5" y="94" fill="#999" fontSize="10">500k views</text>
              <text x="5" y="144" fill="#999" fontSize="10">250k views</text>
              <text x="5" y="194" fill="#999" fontSize="10">50k views</text>

              {/* Area */}
              <path
                d="M 60 180 Q 150 140, 240 150 T 400 90 T 520 70 T 680 30 L 680 210 L 60 210 Z"
                fill="url(#viewsGradient)"
              />

              {/* Spline line */}
              <path
                d="M 60 180 Q 150 140, 240 150 T 400 90 T 520 70 T 680 30"
                fill="none"
                stroke="#0084FF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Nodes */}
              {[
                { x: 60, y: 180, val: '80k' },
                { x: 240, y: 150, val: '240k' },
                { x: 400, y: 90, val: '520k' },
                { x: 520, y: 70, val: '680k' },
                { x: 680, y: 30, val: '980k (Peak)' },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="6" fill="#FFFFFF" stroke="#0084FF" strokeWidth="3" />
                  <text x={pt.x - 15} y={pt.y - 12} fill="#000" fontSize="10" fontWeight="bold">
                    {pt.val}
                  </text>
                </g>
              ))}

              {/* X axis labels */}
              <text x="60" y="225" fill="#888" fontSize="10">Week 1</text>
              <text x="240" y="225" fill="#888" fontSize="10">Week 2</text>
              <text x="400" y="225" fill="#888" fontSize="10">Week 3</text>
              <text x="520" y="225" fill="#888" fontSize="10">Week 4</text>
              <text x="650" y="225" fill="#888" fontSize="10">Current</text>
            </svg>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E0E0E0] flex items-center justify-between text-xs text-gray-500">
            <span>Aggregated verified views: <strong className="text-black">{totalViews.toLocaleString()} views</strong></span>
            <span className="text-[#0084FF] font-semibold flex items-center gap-1 cursor-pointer hover:underline" onClick={() => onNavigateTab('metrics')}>
              View Granular Metrics <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Payout Breakdown (Donut chart - CPM vs Retainer vs Hybrid) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-black font-['Manrope']">Payout Model Breakdown</h3>
            <p className="text-xs text-gray-500">Distribution of compensation frameworks</p>

            {/* Circular Donut Diagram */}
            <div className="relative flex items-center justify-center my-6">
              <svg width="180" height="180" viewBox="0 0 100 100" className="transform -rotate-90">
                {/* CPM: 58% (stroke-dasharray 58 100 approx) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#0084FF"
                  strokeWidth="14"
                  strokeDasharray="140 240"
                  strokeDashoffset="0"
                />
                {/* Hybrid: 28% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FFA726"
                  strokeWidth="14"
                  strokeDasharray="65 240"
                  strokeDashoffset="-140"
                />
                {/* Retainer: 14% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#000000"
                  strokeWidth="14"
                  strokeDasharray="35 240"
                  strokeDashoffset="-205"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-gray-400 font-semibold uppercase">Total Pool</span>
                <span className="text-lg font-bold text-black">₹45.2L</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#0084FF]" />
                  <span className="font-semibold text-black">CPM (Rate / 1k views)</span>
                </span>
                <span className="font-bold text-black">58% (₹26.2L)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FFA726]" />
                  <span className="font-semibold text-black">Hybrid (Base + Bonuses)</span>
                </span>
                <span className="font-bold text-black">28% (₹12.6L)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-black" />
                  <span className="font-semibold text-black">Retainer (Fixed deliverables)</span>
                </span>
                <span className="font-bold text-black">14% (₹6.4L)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E0E0E0] text-[11px] text-gray-500">
            Avg Gross Margin across all models: <strong>26.4%</strong>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Risk Dashboard (5 Color Codes) & Top Performers Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Dashboard (Color-Coded: Red / Orange / Yellow / Blue / Green) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-black font-['Manrope']">Campaign Risk Dashboard</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E3F2FD] text-[#0084FF]">
                  Live ABAC Engine
                </span>
              </div>
              <p className="text-xs text-gray-500">Real-time target velocity tracking with automated early-warning flags</p>
            </div>
          </div>

          {/* Color Legend explanation bar */}
          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
            <span className="px-2 py-1 rounded-md bg-[#F44336]/10 text-[#F44336] font-bold">Red: Critical (&lt;50%)</span>
            <span className="px-2 py-1 rounded-md bg-[#FFA726]/10 text-orange-700 font-bold">Orange: High risk (50-70%)</span>
            <span className="px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 font-bold">Yellow: Medium (70-85%)</span>
            <span className="px-2 py-1 rounded-md bg-[#0084FF]/10 text-[#0084FF] font-bold">Blue: On Track (85-95%)</span>
            <span className="px-2 py-1 rounded-md bg-[#4CAF50]/10 text-[#4CAF50] font-bold">Green: Exceeding (95%+)</span>
          </div>

          {/* Campaigns Status List */}
          <div className="mt-4 space-y-3">
            {campaignRiskData.map((item) => (
              <div 
                key={item.campaign.id} 
                onClick={() => onSelectCampaign?.(item.campaign)}
                className="p-3.5 rounded-xl border border-[#E0E0E0] hover:bg-[#E3F2FD]/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-black">{item.campaign.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {item.campaign.campaign_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Views: <strong>{item.views.toLocaleString()}</strong> / {item.targetViews.toLocaleString()}</span>
                    <span>•</span>
                    <span>Budget: <strong>₹{item.campaign.budget.toLocaleString()}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress bar */}
                  <div className="w-32 hidden sm:block">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          item.riskLevel === 'red' ? 'bg-[#F44336]' :
                          item.riskLevel === 'orange' ? 'bg-[#FFA726]' :
                          item.riskLevel === 'yellow' ? 'bg-yellow-400' :
                          item.riskLevel === 'blue' ? 'bg-[#0084FF]' : 'bg-[#4CAF50]'
                        }`}
                        style={{ width: `${Math.min(item.progressPercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 mt-0.5 block text-right">
                      {item.progressPercent}% of target
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.badgeColor}`}>
                    {item.riskLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers (Bar chart - top 5 clippers by earnings) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
            <div>
              <h3 className="font-bold text-base text-black font-['Manrope']">Top Performers</h3>
              <p className="text-xs text-gray-500">Top 5 clippers by total earnings</p>
            </div>
            <button 
              onClick={() => onNavigateTab('talent')}
              className="text-xs font-bold text-[#0084FF] hover:underline cursor-pointer"
            >
              View Roster
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {topClippers.map((clipper, index) => {
              const maxEarnings = topClippers[0]?.total_earned || 70000;
              const barWidth = Math.max(Math.round(((clipper.total_earned || 0) / maxEarnings) * 100), 15);

              return (
                <div key={clipper.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <img 
                        src={clipper.avatar} 
                        alt={clipper.name} 
                        className="w-6 h-6 rounded-full object-cover" 
                      />
                      <span className="font-bold text-black">{clipper.name}</span>
                    </div>
                    <span className="font-bold text-[#0084FF]">
                      ₹{(clipper.total_earned || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0084FF] rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{clipper.campaigns_completed || 12} campaigns done</span>
                    <span>{clipper.connected_accounts.instagram || '@creator'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-3 rounded-xl bg-[#E3F2FD] border border-[#0084FF]/20 text-xs text-[#0084FF]">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Automated Payout Guarantee
            </p>
            <p className="text-[11px] text-gray-700 mt-0.5">
              Approved earnings disburse directly into creator bank accounts via Razorpay Instant Payouts.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
