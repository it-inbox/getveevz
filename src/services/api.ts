import { 
  User, 
  Campaign, 
  Submission, 
  Payout, 
  Invoice, 
  Contract, 
  ThemePage, 
  Course, 
  Settings, 
  VideoFeedback,
  UserRole 
} from '../types';
import { 
  SEED_USERS, 
  SEED_CAMPAIGNS, 
  SEED_SUBMISSIONS, 
  SEED_PAYOUTS, 
  SEED_INVOICES, 
  SEED_CONTRACTS, 
  SEED_THEMES_PAGES, 
  SEED_COURSES, 
  SEED_SETTINGS,
  SEED_FEEDBACKS
} from '../data/seedData';

const TOKEN_KEY = 'getveevz_jwt_token';
const USER_KEY = 'getveevz_user';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const setAuthSession = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const user = getStoredUser();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (user?.id) {
    headers['x-user-id'] = user.id;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`API call failed for ${endpoint}, using state fallback:`, error);
    throw error;
  }
}

// ----------------- Auth API -----------------
export const apiLogin = async (email: string): Promise<{ user: User; token: string }> => {
  try {
    const res = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setAuthSession(res.token, res.user);
    return res;
  } catch {
    // Client fallback if needed
    const found = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || SEED_USERS[0];
    const token = btoa(JSON.stringify({ userId: found.id, email: found.email, role: found.role }));
    setAuthSession(token, found);
    return { user: found, token };
  }
};

export const apiGoogleAuth = async (requestedRole?: UserRole): Promise<{ user: User; token: string }> => {
  try {
    const res = await request<{ user: User; token: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        email: 'danish.inboxinfotech@gmail.com',
        name: 'Danish (Google User)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        requestedRole: requestedRole || 'CEO',
      }),
    });
    setAuthSession(res.token, res.user);
    return res;
  } catch {
    const fallbackUser: User = {
      ...SEED_USERS[0],
      email: 'danish.inboxinfotech@gmail.com',
      role: requestedRole || 'CEO',
    };
    const token = btoa(JSON.stringify({ userId: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role }));
    setAuthSession(token, fallbackUser);
    return { user: fallbackUser, token };
  }
};

export const apiRegister = async (data: { email: string; name: string; role: UserRole; phone?: string }): Promise<{ user: User; token: string }> => {
  const res = await request<{ user: User; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setAuthSession(res.token, res.user);
  return res;
};

// ----------------- Campaigns API -----------------
export const apiGetCampaigns = async (): Promise<Campaign[]> => {
  try {
    return await request<Campaign[]>('/api/campaigns');
  } catch {
    return SEED_CAMPAIGNS;
  }
};

export const apiCreateCampaign = async (campaign: Partial<Campaign>): Promise<Campaign> => {
  return await request<Campaign>('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(campaign),
  });
};

export const apiUpdateCampaign = async (id: string, updates: Partial<Campaign>): Promise<Campaign> => {
  return await request<Campaign>(`/api/campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

// ----------------- Submissions API -----------------
export const apiGetSubmissions = async (): Promise<Submission[]> => {
  try {
    return await request<Submission[]>('/api/submissions');
  } catch {
    return SEED_SUBMISSIONS;
  }
};

export const apiCreateSubmission = async (sub: Partial<Submission>): Promise<Submission> => {
  return await request<Submission>('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(sub),
  });
};

export const apiUpdateSubmission = async (id: string, status: 'approved' | 'rejected', feedback?: string): Promise<Submission> => {
  return await request<Submission>(`/api/submissions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, feedback }),
  });
};

// ----------------- Payouts API -----------------
export const apiGetPayouts = async (): Promise<Payout[]> => {
  try {
    return await request<Payout[]>('/api/payouts');
  } catch {
    return SEED_PAYOUTS;
  }
};

export const apiUpdatePayout = async (id: string, updates: Partial<Payout>): Promise<Payout> => {
  return await request<Payout>(`/api/payouts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const apiApproveAllPayouts = async (): Promise<{ success: boolean; approved_count: number }> => {
  return await request<{ success: boolean; approved_count: number }>('/api/payouts/approve-all', {
    method: 'POST',
  });
};

export const apiProcessRazorpayPayout = async (payoutId: string): Promise<{ success: boolean; payout: Payout; invoice: Invoice }> => {
  return await request<{ success: boolean; payout: Payout; invoice: Invoice }>(`/api/payouts/${payoutId}/razorpay-payout`, {
    method: 'POST',
  });
};

// ----------------- Invoices API -----------------
export const apiGetInvoices = async (): Promise<Invoice[]> => {
  try {
    return await request<Invoice[]>('/api/invoices');
  } catch {
    return SEED_INVOICES;
  }
};

// ----------------- Contracts API -----------------
export const apiGetContracts = async (): Promise<Contract[]> => {
  try {
    return await request<Contract[]>('/api/contracts');
  } catch {
    return SEED_CONTRACTS;
  }
};

export const apiCreateContract = async (contract: Partial<Contract>): Promise<Contract> => {
  return await request<Contract>('/api/contracts', {
    method: 'POST',
    body: JSON.stringify(contract),
  });
};

export const apiSignContract = async (id: string): Promise<Contract> => {
  return await request<Contract>(`/api/contracts/${id}/sign`, {
    method: 'PATCH',
  });
};

// ----------------- Themes API -----------------
export const apiGetThemes = async (): Promise<ThemePage[]> => {
  try {
    return await request<ThemePage[]>('/api/themes');
  } catch {
    return SEED_THEMES_PAGES;
  }
};

export const apiCreateTheme = async (theme: Partial<ThemePage>): Promise<ThemePage> => {
  return await request<ThemePage>('/api/themes', {
    method: 'POST',
    body: JSON.stringify(theme),
  });
};

export const apiDeleteTheme = async (id: string): Promise<{ success: boolean }> => {
  return await request<{ success: boolean }>(`/api/themes/${id}`, {
    method: 'DELETE',
  });
};

// ----------------- Courses API -----------------
export const apiGetCourses = async (): Promise<Course[]> => {
  try {
    return await request<Course[]>('/api/courses');
  } catch {
    return SEED_COURSES;
  }
};

export const apiCreateCourse = async (course: Partial<Course>): Promise<Course> => {
  return await request<Course>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(course),
  });
};

// ----------------- Users / Talent Pool API -----------------
export const apiGetUsers = async (role?: string): Promise<User[]> => {
  try {
    return await request<User[]>(`/api/users${role ? `?role=${role}` : ''}`);
  } catch {
    return role ? SEED_USERS.filter((u) => u.role === role) : SEED_USERS;
  }
};

export const apiUpdateUser = async (id: string, updates: Partial<User>): Promise<User> => {
  return await request<User>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

// ----------------- Settings API -----------------
export const apiGetSettings = async (): Promise<Settings> => {
  try {
    return await request<Settings>('/api/settings');
  } catch {
    return SEED_SETTINGS;
  }
};

export const apiUpdateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  return await request<Settings>('/api/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
};

// ----------------- Social Sync API -----------------
export const apiSyncSocialViews = async (platform?: string, clipper_id?: string, submission_id?: string): Promise<{ success: boolean; updated_submissions: number; message: string }> => {
  return await request<{ success: boolean; updated_submissions: number; message: string }>('/api/sync/views', {
    method: 'POST',
    body: JSON.stringify({ platform, clipper_id, submission_id }),
  });
};

// ----------------- Feedbacks API -----------------
export const apiGetFeedbacks = async (): Promise<VideoFeedback[]> => {
  try {
    return await request<VideoFeedback[]>('/api/feedbacks');
  } catch {
    return SEED_FEEDBACKS;
  }
};

export const apiCreateFeedback = async (feedback: Partial<VideoFeedback>): Promise<VideoFeedback> => {
  return await request<VideoFeedback>('/api/feedbacks', {
    method: 'POST',
    body: JSON.stringify(feedback),
  });
};
