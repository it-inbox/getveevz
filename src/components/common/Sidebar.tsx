import React from 'react';
import { 
  LayoutDashboard, 
  Megaphone, 
  CreditCard, 
  Users, 
  FolderKanban, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  Settings as SettingsIcon,
  Video,
  Briefcase,
  Share2,
  Trophy,
  MessageSquare
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  roles: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
}) => {
  // Master menu items list mapped with strict role permissions
  const menuItems: MenuItem[] = [
    // Admin / Leader / Manager Core
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['CEO', 'Division_Leader', 'Campaign_Manager', 'Campaign_Manager_Assistant', 'Clipper', 'Client'],
    },
    {
      id: 'campaigns',
      label: currentRole === 'Client' ? 'My Campaigns' : 'Campaigns',
      icon: Megaphone,
      roles: ['CEO', 'Division_Leader', 'Campaign_Manager', 'Campaign_Manager_Assistant', 'Client', 'Clipper'],
    },
    {
      id: 'submissions',
      label: currentRole === 'Clipper' ? 'My Submissions' : 'Submissions',
      icon: Video,
      roles: ['CEO', 'Campaign_Manager', 'Campaign_Manager_Assistant', 'Clipper'],
    },
    {
      id: 'payouts',
      label: currentRole === 'Clipper' ? 'My Payouts' : 'Payouts (Global)',
      icon: CreditCard,
      roles: ['CEO', 'Division_Leader', 'Clipper'],
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: Trophy,
      roles: ['Client'],
    },
    {
      id: 'talent',
      label: 'Talent Pool',
      icon: Users,
      roles: ['CEO'],
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: Briefcase,
      roles: ['Clipper'],
    },
    {
      id: 'connected_accounts',
      label: 'Connected Accounts',
      icon: Share2,
      roles: ['Clipper'],
    },
    {
      id: 'inventory',
      label: 'Inventory (Themes)',
      icon: FolderKanban,
      roles: ['CEO', 'PR_Manager', 'Clipper'],
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: GraduationCap,
      roles: ['CEO', 'Clipper'],
    },
    {
      id: 'contracts',
      label: currentRole === 'Client' || currentRole === 'Clipper' ? 'Contracts' : 'Contracts & Invoices',
      icon: FileText,
      roles: ['CEO', 'Client'],
    },
    {
      id: 'feedbacks',
      label: 'Feedbacks',
      icon: MessageSquare,
      roles: ['Client'],
    },
    {
      id: 'metrics',
      label: 'Metrics',
      icon: BarChart3,
      roles: ['CEO', 'Division_Leader'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      roles: ['CEO', 'Division_Leader'],
    },
  ];

  // Filter based on user's active role
  const visibleItems = menuItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-[250px] shrink-0 min-h-[calc(100vh-61px)] bg-white border-r border-[#E0E0E0] p-4 flex flex-col justify-between select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Navigation
        </div>

        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#E3F2FD] text-[#0084FF] shadow-xs'
                  : 'text-black hover:bg-[#E3F2FD] hover:text-[#0084FF]'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-[#0084FF]' : 'text-[#0084FF]'
                }`}
              />
              <span className="font-['Manrope'] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Role Context Card in Sidebar footer */}
      <div className="mt-8 p-3 rounded-xl bg-gray-50 border border-[#E0E0E0] text-xs">
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Access Scope</p>
        <p className="font-bold text-black mt-0.5">{currentRole.replace(/_/g, ' ')}</p>
        <p className="text-[11px] text-gray-600 mt-1 leading-snug">
          {currentRole === 'CEO' && 'Full system authority and administrative control.'}
          {currentRole === 'Division_Leader' && 'Campaign performance and payout authorizations.'}
          {currentRole === 'Campaign_Manager' && 'Managing assigned campaigns and video submissions.'}
          {currentRole === 'Campaign_Manager_Assistant' && 'Read-only submission reviews.'}
          {currentRole === 'Clipper' && 'Personal clips, earnings formulas, and portfolio.'}
          {currentRole === 'Client' && 'Anonymized creator analytics and campaign oversight.'}
          {currentRole === 'PR_Manager' && 'Curating theme pages and visual template library.'}
        </p>
      </div>
    </aside>
  );
};
