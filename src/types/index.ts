export type UserRole = 
  | 'CEO'
  | 'Division_Leader'
  | 'Campaign_Manager'
  | 'Campaign_Manager_Assistant'
  | 'Clipper'
  | 'Client'
  | 'PR_Manager';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface ConnectedAccounts {
  instagram?: string;
  youtube?: string;
  facebook?: string;
  instagram_followers?: number;
  youtube_subscribers?: number;
  facebook_followers?: number;
  last_synced?: string;
}

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  name: string;
  avatar: string;
  phone: string;
  username: string;
  portfolio?: string; // URL for clippers - PDF or link
  client_name?: string; // for clients
  connected_accounts: ConnectedAccounts;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  campaigns_completed?: number;
  total_earned?: number;
}

export type CampaignType = 'CPM' | 'Retainer' | 'Hybrid';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface MilestonePayout {
  views_required: number;
  bonus_amount: number;
  description: string;
}

export interface Campaign {
  id: string;
  name: string;
  brief: string; // markdown
  client_id: string;
  campaign_type: CampaignType;
  budget: number;
  gross_margin: number; // percentage, auto-calculated
  rate_per_1k_views: number; // for CPM
  minimum_payout_threshold: number;
  maximum_payout_per_clipper: number;
  retainer_amount: number; // for Retainer/Hybrid
  milestone_payouts?: MilestonePayout[];
  assigned_managers: string[]; // User IDs
  status: CampaignStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  // Computed / aggregated
  total_views?: number;
  total_payouts?: number;
  clippers_count?: number;
  submissions_count?: number;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'published';
export type PlatformSource = 'instagram' | 'youtube' | 'facebook' | 'manual';

export interface Submission {
  id: string;
  campaign_id: string;
  clipper_id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
  description: string;
  views: number;
  status: SubmissionStatus;
  feedback?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
  views_last_sync: string;
  platform_synced_from: PlatformSource;
  // populated
  clipper_name?: string;
  campaign_name?: string;
  estimated_earnings?: number;
}

export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'failed';

export interface Payout {
  id: string;
  campaign_id: string;
  clipper_id: string;
  submission_id: string;
  views: number;
  rate_used: number; // rate per 1k views or retainer fixed
  calculated_amount: number;
  approved_amount: number;
  status: PayoutStatus;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  razorpay_order_id?: string;
  razorpay_status?: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
  // populated
  campaign_name?: string;
  clipper_name?: string;
  submission_title?: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  payout_id: string;
  clipper_id: string;
  invoice_number: string;
  amount: number;
  currency: string; // "INR"
  status: InvoiceStatus;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  // populated
  clipper_name?: string;
  campaign_name?: string;
}

export type ContractType = 'campaign' | 'talent_agreement';
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'archived';
export type ESignatureStatus = 'pending' | 'signed' | 'rejected';

export interface Contract {
  id: string;
  campaign_id?: string;
  clipper_id: string;
  contract_type: ContractType;
  title?: string;
  content: string;
  status: ContractStatus;
  esignature_url?: string;
  esignature_status: ESignatureStatus;
  signed_at?: string;
  created_at: string;
  updated_at: string;
  // populated
  clipper_name?: string;
  campaign_name?: string;
}

export interface ThemePage {
  id: string;
  name: string;
  category: string;
  file_url: string;
  description: string;
  file_size?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  video_url: string;
  visible_to_roles: UserRole[];
  created_by: string;
  duration?: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  company_name: string;
  logo_url: string;
  theme_color: string;
  margin_percentage: number;
  default_cpm_rate: number;
  razorpay_key_id: string;
  instagram_app_id: string;
  youtube_api_key: string;
  facebook_app_id: string;
  created_at: string;
  updated_at: string;
}

export interface VideoFeedback {
  id: string;
  submission_id: string;
  client_id: string;
  comments: string;
  video_timestamp?: string;
  video_url?: string;
  created_at: string;
  // populated
  client_name?: string;
  submission_title?: string;
}
