import React, { useState } from 'react';
import { 
  Bell, 
  Settings as SettingsIcon, 
  LogOut, 
  RefreshCw, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { GetVeevzLogo } from './GetVeevzLogo';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
  onNavigateSettings?: () => void;
  onSyncAllViews?: () => void;
  syncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onSwitchRole,
  onNavigateSettings,
  onSyncAllViews,
  syncing = false,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Submission approved', desc: 'Sarah Jenkins "Night Mode Camera Test" approved (+₹31,150)', time: '10m ago' },
    { id: 2, title: 'Payout batch ready', desc: 'Razorpay payout batch for Neon Pulse ready for disbursement', time: '1h ago' },
    { id: 3, title: 'New viral milestone', desc: 'GamerFuel clip reached 980k views on Instagram', time: '3h ago' },
    { id: 4, title: 'Contract signed', desc: 'Devansh Joshi signed the Q3 Creator Master Agreement', time: '5h ago' },
    { id: 5, title: 'Client feedback received', desc: 'Apex Tech Global added comments on submission #sub_1', time: '1d ago' },
  ];

  const roles: { role: UserRole; label: string; badge: string }[] = [
    { role: 'CEO', label: 'CEO (Varad Kole)', badge: 'Full Access' },
    { role: 'Division_Leader', label: 'Division Leader (Pooja)', badge: 'Approvals & ROI' },
    { role: 'Campaign_Manager', label: 'Campaign Manager (Rahul)', badge: 'Submissions Review' },
    { role: 'Campaign_Manager_Assistant', label: 'Assistant Manager (Neha)', badge: 'Read-Only Review' },
    { role: 'Clipper', label: 'Clipper (Sarah Jenkins)', badge: 'Earnings & Upload' },
    { role: 'Client', label: 'Client (Apex Tech Global)', badge: 'Anonymized Leaderboard' },
    { role: 'PR_Manager', label: 'PR Manager (Ananya)', badge: 'Themes & Inventory' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E0E0E0] px-6 py-3 transition-colors">
      <div className="flex items-center justify-between">
        
        {/* Left: 40x40px Circular Logo + Brand Name */}
        <div className="flex items-center gap-4">
          <GetVeevzLogo size={40} showText={true} />
          
          {/* Quick Role Tester Pill */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E3F2FD] text-[#0084FF] border border-[#0084FF]/30 hover:bg-[#d0e8fc] transition-colors cursor-pointer"
              title="Click to test different dashboard roles"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role: <strong className="text-black font-bold">{currentUser.role.replace(/_/g, ' ')}</strong></span>
              <ChevronDown className="w-3 h-3 text-[#0084FF]" />
            </button>

            {showRoleDropdown && (
              <div 
                className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E0E0E0] py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setShowRoleDropdown(false)}
              >
                <div className="px-3 py-2 border-b border-[#E0E0E0] text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Switch Live Role (Testing)</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#0084FF]" />
                </div>
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      onSwitchRole(r.role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-[#E3F2FD] transition-colors cursor-pointer ${
                      currentUser.role === r.role ? 'bg-[#E3F2FD] font-bold text-[#0084FF]' : 'text-black'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{r.label}</p>
                      <p className="text-[10px] text-gray-500">{r.badge}</p>
                    </div>
                    {currentUser.role === r.role && <CheckCircle2 className="w-4 h-4 text-[#0084FF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Sync, Notifications, Profile, Settings, Logout */}
        <div className="flex items-center gap-4">
          
          {/* Real-time View Sync trigger */}
          {onSyncAllViews && (
            <button
              onClick={onSyncAllViews}
              disabled={syncing}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-[#E3F2FD] hover:text-[#0084FF] rounded-lg border border-[#E0E0E0] transition-colors cursor-pointer"
              title="Fetch fresh views from Instagram Graph & YouTube APIs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#0084FF]' : ''}`} />
              <span>{syncing ? 'Syncing APIs...' : 'Sync Views'}</span>
            </button>
          )}

          {/* Notification Bell (with 5 items badge as requested) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-black hover:bg-[#E3F2FD] rounded-lg transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#0084FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                5
              </span>
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#E0E0E0] p-3 z-50 animate-in fade-in"
                onMouseLeave={() => setShowNotifications(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E0E0E0] mb-2">
                  <span className="font-bold text-sm text-black">Notifications</span>
                  <span className="text-[11px] text-[#0084FF] font-semibold cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-lg hover:bg-[#E3F2FD] transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-black">{n.title}</p>
                        <span className="text-[10px] text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Icon */}
          {onNavigateSettings && (
            <button
              onClick={onNavigateSettings}
              className="p-2 text-gray-600 hover:text-black hover:bg-[#E3F2FD] rounded-lg transition-colors cursor-pointer"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          )}

          {/* User Info & Avatar */}
          <div className="flex items-center gap-3 pl-2 border-l border-[#E0E0E0]">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-[#E0E0E0]"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-black leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-gray-500 font-medium capitalize mt-0.5">
                {currentUser.client_name ? currentUser.client_name : currentUser.role.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 text-gray-600 hover:text-[#F44336] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>
      </div>
    </header>
  );
};
