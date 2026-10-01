import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
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
} from './src/data/seedData.ts';
import type { User, Campaign, Submission, Payout, Invoice, Contract, ThemePage, Course, Settings, VideoFeedback } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Interface for DB state
interface DatabaseState {
  users: User[];
  campaigns: Campaign[];
  submissions: Submission[];
  payouts: Payout[];
  invoices: Invoice[];
  contracts: Contract[];
  themes: ThemePage[];
  courses: Course[];
  settings: Settings;
  feedbacks: VideoFeedback[];
}

function loadDatabase(): DatabaseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse database.json, re-initializing from seeds', e);
    }
  }

  const initialDb: DatabaseState = {
    users: [...SEED_USERS],
    campaigns: [...SEED_CAMPAIGNS],
    submissions: [...SEED_SUBMISSIONS],
    payouts: [...SEED_PAYOUTS],
    invoices: [...SEED_INVOICES],
    contracts: [...SEED_CONTRACTS],
    themes: [...SEED_THEMES_PAGES],
    courses: [...SEED_COURSES],
    settings: { ...SEED_SETTINGS },
    feedbacks: [...SEED_FEEDBACKS],
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(data: DatabaseState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS & Security headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Auth Context Middleware (Extract user from token or header)
  app.use((req: Request & { currentUser?: User }, res, next) => {
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'] as string;
    let userId: string | null = null;

    if (userIdHeader) {
      userId = userIdHeader;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        userId = decoded.userId || decoded.id;
      } catch (err) {
        // Simple token fallback
        userId = token;
      }
    }

    if (userId) {
      const user = db.users.find((u) => u.id === userId);
      if (user) {
        req.currentUser = user;
      }
    }
    next();
  });

  // ---------------- AUTH API ----------------

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Mock token generated with 24hr expiration
    const token = Buffer.from(JSON.stringify({ 
      userId: user.id, 
      email: user.email, 
      role: user.role, 
      exp: Date.now() + 24 * 3600 * 1000 
    })).toString('base64');

    return res.json({
      user,
      token,
      expiresIn: 86400,
    });
  });

  app.post('/api/auth/google', (req, res) => {
    const { email, name, avatar, requestedRole } = req.body;
    let user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());

    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        email: email || 'user@example.com',
        role: requestedRole || 'Clipper',
        name: name || 'Google User',
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: '+91 99000 11223',
        username: (email || 'user').split('@')[0],
        connected_accounts: {},
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        campaigns_completed: 0,
        total_earned: 0,
      };
      db.users.push(user);
      saveDatabase(db);
    }

    const token = Buffer.from(JSON.stringify({ 
      userId: user.id, 
      email: user.email, 
      role: user.role, 
      exp: Date.now() + 24 * 3600 * 1000 
    })).toString('base64');

    return res.json({ user, token });
  });

  app.post('/api/auth/register', (req, res) => {
    const { email, name, role, phone } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and Name are required' });
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: email.trim(),
      role: role || 'Clipper',
      name: name.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      phone: phone || '+91 98000 00000',
      username: email.split('@')[0],
      client_name: role === 'Client' ? name : undefined,
      connected_accounts: {},
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      campaigns_completed: 0,
      total_earned: 0,
    };

    db.users.push(newUser);
    saveDatabase(db);

    const token = Buffer.from(JSON.stringify({ 
      userId: newUser.id, 
      email: newUser.email, 
      role: newUser.role, 
      exp: Date.now() + 24 * 3600 * 1000 
    })).toString('base64');

    return res.json({ user: newUser, token });
  });

  app.get('/api/auth/me', (req: Request & { currentUser?: User }, res) => {
    if (!req.currentUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.json({ user: req.currentUser });
  });

  // ---------------- CAMPAIGNS API (RBAC ENFORCED) ----------------

  app.get('/api/campaigns', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    let campaigns = [...db.campaigns];

    // Compute live metrics for each campaign
    campaigns = campaigns.map((camp) => {
      const campSubs = db.submissions.filter((s) => s.campaign_id === camp.id);
      const campPays = db.payouts.filter((p) => p.campaign_id === camp.id && p.status === 'paid');
      const uniqueClippers = new Set(campSubs.map((s) => s.clipper_id));

      return {
        ...camp,
        total_views: campSubs.reduce((acc, curr) => acc + (curr.views || 0), 0),
        total_payouts: campPays.reduce((acc, curr) => acc + (curr.approved_amount || 0), 0),
        clippers_count: uniqueClippers.size,
        submissions_count: campSubs.length,
      };
    });

    if (user) {
      if (user.role === 'Client') {
        campaigns = campaigns.filter((c) => c.client_id === user.id);
      } else if (user.role === 'Campaign_Manager' || user.role === 'Campaign_Manager_Assistant') {
        campaigns = campaigns.filter((c) => c.assigned_managers.includes(user.id) || c.assigned_managers.length === 0);
      }
    }

    return res.json(campaigns);
  });

  app.post('/api/campaigns', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    if (user && user.role !== 'CEO' && user.role !== 'Division_Leader') {
      return res.status(403).json({ error: 'Only CEO or Division Leader can create campaigns' });
    }

    const {
      name,
      brief,
      client_id,
      campaign_type,
      budget,
      gross_margin,
      rate_per_1k_views,
      minimum_payout_threshold,
      maximum_payout_per_clipper,
      retainer_amount,
      milestone_payouts,
      assigned_managers,
      start_date,
      end_date,
    } = req.body;

    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: name || 'New Campaign',
      brief: brief || '',
      client_id: client_id || 'user_client_1',
      campaign_type: campaign_type || 'CPM',
      budget: Number(budget) || 1000000,
      gross_margin: Number(gross_margin) || 25,
      rate_per_1k_views: Number(rate_per_1k_views) || 35,
      minimum_payout_threshold: Number(minimum_payout_threshold) || 1000,
      maximum_payout_per_clipper: Number(maximum_payout_per_clipper) || 100000,
      retainer_amount: Number(retainer_amount) || 0,
      milestone_payouts: milestone_payouts || [],
      assigned_managers: assigned_managers || ['user_mgr_1'],
      status: 'active',
      created_by: user?.id || 'user_ceo_1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      start_date: start_date || new Date().toISOString(),
      end_date: end_date || new Date(Date.now() + 30 * 86400000).toISOString(),
    };

    db.campaigns.unshift(newCampaign);
    saveDatabase(db);
    return res.status(201).json(newCampaign);
  });

  app.patch('/api/campaigns/:id', (req: Request & { currentUser?: User }, res) => {
    const { id } = req.params;
    const index = db.campaigns.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    db.campaigns[index] = {
      ...db.campaigns[index],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    saveDatabase(db);
    return res.json(db.campaigns[index]);
  });

  // ---------------- SUBMISSIONS API (RBAC ENFORCED) ----------------

  app.get('/api/submissions', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    let submissions = [...db.submissions];

    // Populate metadata
    submissions = submissions.map((sub) => {
      const clipper = db.users.find((u) => u.id === sub.clipper_id);
      const camp = db.campaigns.find((c) => c.id === sub.campaign_id);
      let estEarnings = 0;
      if (camp) {
        if (camp.campaign_type === 'CPM') {
          estEarnings = Math.round(((sub.views || 0) * (camp.rate_per_1k_views || 0)) / 1000);
        } else if (camp.campaign_type === 'Retainer') {
          estEarnings = camp.retainer_amount || 0;
        } else {
          estEarnings = Math.round(((sub.views || 0) * (camp.rate_per_1k_views || 0)) / 1000) + (camp.retainer_amount || 0);
        }
      }

      return {
        ...sub,
        clipper_name: clipper?.name || 'Unknown Clipper',
        campaign_name: camp?.name || 'Unknown Campaign',
        estimated_earnings: estEarnings,
      };
    });

    if (user) {
      if (user.role === 'Clipper') {
        // Clipper CANNOT see other clippers' submissions
        submissions = submissions.filter((s) => s.clipper_id === user.id);
      } else if (user.role === 'Client') {
        // Client can only see their campaigns' submissions
        const clientCampaignIds = db.campaigns.filter((c) => c.client_id === user.id).map((c) => c.id);
        submissions = submissions.filter((s) => clientCampaignIds.includes(s.campaign_id));
        // Client CANNOT see clipper real identities
        submissions = submissions.map((s, idx) => ({
          ...s,
          clipper_name: `Clipper ${((idx % 12) + 1)}`,
        }));
      } else if (user.role === 'Campaign_Manager' || user.role === 'Campaign_Manager_Assistant') {
        // Manager only sees assigned campaigns
        const managerCampIds = db.campaigns
          .filter((c) => c.assigned_managers.includes(user.id) || c.assigned_managers.length === 0)
          .map((c) => c.id);
        submissions = submissions.filter((s) => managerCampIds.includes(s.campaign_id));
      }
    }

    return res.json(submissions);
  });

  app.post('/api/submissions', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    const { campaign_id, title, description, video_url, thumbnail_url, platform_synced_from } = req.body;

    const clipperId = user?.id || req.body.clipper_id || 'user_clipper_1';
    const initialViews = Math.floor(Math.random() * 50000) + 10000;

    const newSub: Submission = {
      id: `sub_${Date.now()}`,
      campaign_id,
      clipper_id: clipperId,
      video_url: video_url || 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-smartphone-41484-large.mp4',
      thumbnail_url: thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500',
      title: title || 'New Campaign Video',
      description: description || '',
      views: initialViews,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views_last_sync: 'Just now',
      platform_synced_from: platform_synced_from || 'instagram',
    };

    db.submissions.unshift(newSub);
    saveDatabase(db);
    return res.status(201).json(newSub);
  });

  app.patch('/api/submissions/:id', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    const { id } = req.params;
    const index = db.submissions.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const { status, feedback } = req.body;
    const sub = db.submissions[index];

    // Role check: Assistant cannot approve
    if (user?.role === 'Campaign_Manager_Assistant' && status === 'approved') {
      return res.status(403).json({ error: 'Campaign Manager Assistant has read-only access for approvals' });
    }

    if (status === 'approved') {
      sub.status = 'approved';
      sub.approved_by = user?.id || 'user_mgr_1';
      sub.approved_at = new Date().toISOString();
      sub.feedback = feedback || sub.feedback;

      // Automatically create a corresponding Payout record
      const camp = db.campaigns.find((c) => c.id === sub.campaign_id);
      const rate = camp?.rate_per_1k_views || 35;
      const calculatedAmount = Math.round(((sub.views || 0) * rate) / 1000);

      const existingPayout = db.payouts.find((p) => p.submission_id === sub.id);
      if (!existingPayout) {
        const newPayout: Payout = {
          id: `pay_${Date.now()}`,
          campaign_id: sub.campaign_id,
          clipper_id: sub.clipper_id,
          submission_id: sub.id,
          views: sub.views,
          rate_used: rate,
          calculated_amount: calculatedAmount,
          approved_amount: calculatedAmount,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          campaign_name: camp?.name,
          clipper_name: db.users.find((u) => u.id === sub.clipper_id)?.name,
          submission_title: sub.title,
        };
        db.payouts.unshift(newPayout);
      }
    } else if (status === 'rejected') {
      sub.status = 'rejected';
      sub.rejected_by = user?.id || 'user_mgr_1';
      sub.rejected_at = new Date().toISOString();
      sub.feedback = feedback || 'Does not meet campaign specifications.';
    }

    sub.updated_at = new Date().toISOString();
    db.submissions[index] = sub;
    saveDatabase(db);
    return res.json(sub);
  });

  // ---------------- PAYOUTS API (RBAC ENFORCED) ----------------

  app.get('/api/payouts', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    let payouts = [...db.payouts];

    // Populate extra fields
    payouts = payouts.map((p) => {
      const camp = db.campaigns.find((c) => c.id === p.campaign_id);
      const clipper = db.users.find((u) => u.id === p.clipper_id);
      const sub = db.submissions.find((s) => s.id === p.submission_id);

      return {
        ...p,
        campaign_name: camp?.name || p.campaign_name || 'Campaign',
        clipper_name: clipper?.name || p.clipper_name || 'Clipper',
        submission_title: sub?.title || p.submission_title || 'Video',
      };
    });

    if (user) {
      if (user.role === 'Clipper') {
        // Clipper CANNOT see other clippers' payouts
        payouts = payouts.filter((p) => p.clipper_id === user.id);
      } else if (user.role === 'Client') {
        const clientCampaignIds = db.campaigns.filter((c) => c.client_id === user.id).map((c) => c.id);
        payouts = payouts.filter((p) => clientCampaignIds.includes(p.campaign_id));
        // Client views anonymized clipper names
        payouts = payouts.map((p, idx) => ({
          ...p,
          clipper_name: `Clipper ${(idx % 12) + 1}`,
        }));
      } else if (user.role === 'Campaign_Manager' || user.role === 'Campaign_Manager_Assistant') {
        // Managers only see payouts for their assigned campaigns
        const managerCampIds = db.campaigns
          .filter((c) => c.assigned_managers.includes(user.id))
          .map((c) => c.id);
        payouts = payouts.filter((p) => managerCampIds.includes(p.campaign_id));
      }
    }

    return res.json(payouts);
  });

  app.patch('/api/payouts/:id', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    const { id } = req.params;
    const index = db.payouts.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    // Role check: Only CEO, Division_Leader, or Client (for client approval) can approve payouts
    if (
      user &&
      user.role !== 'CEO' &&
      user.role !== 'Division_Leader' &&
      user.role !== 'Client'
    ) {
      return res.status(403).json({ error: 'Permission denied to approve payouts' });
    }

    const { status, approved_amount } = req.body;
    const p = db.payouts[index];

    if (status === 'approved') {
      p.status = 'approved';
      p.approved_by = user?.id || 'user_leader_1';
      p.approved_at = new Date().toISOString();
      if (approved_amount !== undefined) {
        p.approved_amount = Number(approved_amount);
      }
      p.razorpay_order_id = `order_GVZ${Math.floor(Math.random() * 900000000 + 100000000)}`;
      p.razorpay_status = 'created';
    } else if (status === 'rejected') {
      p.status = 'rejected';
      p.rejected_by = user?.id;
      p.rejected_at = new Date().toISOString();
    } else if (status === 'paid') {
      p.status = 'paid';
      p.paid_date = new Date().toISOString();
      p.razorpay_status = 'captured';

      // Auto generate invoice
      const invoiceNumber = `GVZ-INV-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        payout_id: p.id,
        clipper_id: p.clipper_id,
        invoice_number: invoiceNumber,
        amount: p.approved_amount || p.calculated_amount,
        currency: 'INR',
        status: 'paid',
        pdf_url: `/invoices/${invoiceNumber}.pdf`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        clipper_name: p.clipper_name,
        campaign_name: p.campaign_name,
      };
      db.invoices.unshift(newInvoice);

      // Update clipper's total earned stat
      const clipperIdx = db.users.findIndex((u) => u.id === p.clipper_id);
      if (clipperIdx !== -1) {
        db.users[clipperIdx].total_earned = (db.users[clipperIdx].total_earned || 0) + (p.approved_amount || p.calculated_amount);
      }
    }

    p.updated_at = new Date().toISOString();
    db.payouts[index] = p;
    saveDatabase(db);
    return res.json(p);
  });

  // Bulk Approve Payouts
  app.post('/api/payouts/approve-all', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    if (user && user.role !== 'CEO' && user.role !== 'Division_Leader') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    let count = 0;
    db.payouts = db.payouts.map((p) => {
      if (p.status === 'pending') {
        count++;
        return {
          ...p,
          status: 'approved',
          approved_by: user?.id || 'user_leader_1',
          approved_at: new Date().toISOString(),
          approved_amount: p.calculated_amount,
          razorpay_order_id: `order_GVZ${Math.floor(Math.random() * 900000000 + 100000000)}`,
          razorpay_status: 'created',
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });

    saveDatabase(db);
    return res.json({ success: true, approved_count: count });
  });

  // Razorpay Payout Simulation
  app.post('/api/payouts/:id/razorpay-payout', (req, res) => {
    const { id } = req.params;
    const index = db.payouts.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    const p = db.payouts[index];
    p.status = 'paid';
    p.razorpay_status = 'captured';
    p.paid_date = new Date().toISOString();
    p.updated_at = new Date().toISOString();

    // Generate Invoice
    const invoiceNum = `GVZ-INV-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newInv: Invoice = {
      id: `inv_${Date.now()}`,
      payout_id: p.id,
      clipper_id: p.clipper_id,
      invoice_number: invoiceNum,
      amount: p.approved_amount || p.calculated_amount,
      currency: 'INR',
      status: 'paid',
      pdf_url: `/invoices/${invoiceNum}.pdf`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clipper_name: p.clipper_name,
      campaign_name: p.campaign_name,
    };
    db.invoices.unshift(newInv);

    // Update Clipper Total Earned
    const cIdx = db.users.findIndex((u) => u.id === p.clipper_id);
    if (cIdx !== -1) {
      db.users[cIdx].total_earned = (db.users[cIdx].total_earned || 0) + (p.approved_amount || p.calculated_amount);
    }

    saveDatabase(db);
    return res.json({ success: true, payout: p, invoice: newInv });
  });

  // ---------------- INVOICES API ----------------

  app.get('/api/invoices', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    let invoices = [...db.invoices];

    if (user && user.role === 'Clipper') {
      invoices = invoices.filter((i) => i.clipper_id === user.id);
    }

    return res.json(invoices);
  });

  app.patch('/api/invoices/:id/pay', (req, res) => {
    const { id } = req.params;
    const index = db.invoices.findIndex((i) => i.id === id);
    if (index === -1) return res.status(404).json({ error: 'Invoice not found' });

    db.invoices[index].status = 'paid';
    db.invoices[index].updated_at = new Date().toISOString();
    saveDatabase(db);
    return res.json(db.invoices[index]);
  });

  // ---------------- CONTRACTS API ----------------

  app.get('/api/contracts', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    let contracts = [...db.contracts];

    if (user && user.role === 'Clipper') {
      contracts = contracts.filter((c) => c.clipper_id === user.id);
    }

    return res.json(contracts);
  });

  app.post('/api/contracts', (req: Request & { currentUser?: User }, res) => {
    const { campaign_id, clipper_id, contract_type, title, content } = req.body;
    const newContract: Contract = {
      id: `contract_${Date.now()}`,
      campaign_id,
      clipper_id: clipper_id || 'user_clipper_1',
      contract_type: contract_type || 'campaign',
      title: title || 'GetVeevz Campaign Agreement',
      content: content || 'Standard campaign participation terms...',
      status: 'sent',
      esignature_status: 'pending',
      esignature_url: `https://esign.getveevz.com/sign/${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clipper_name: db.users.find((u) => u.id === clipper_id)?.name,
      campaign_name: db.campaigns.find((c) => c.id === campaign_id)?.name,
    };

    db.contracts.unshift(newContract);
    saveDatabase(db);
    return res.status(201).json(newContract);
  });

  app.patch('/api/contracts/:id/sign', (req, res) => {
    const { id } = req.params;
    const index = db.contracts.findIndex((c) => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Contract not found' });

    db.contracts[index].status = 'signed';
    db.contracts[index].esignature_status = 'signed';
    db.contracts[index].signed_at = new Date().toISOString();
    db.contracts[index].updated_at = new Date().toISOString();
    saveDatabase(db);
    return res.json(db.contracts[index]);
  });

  // ---------------- THEMES & INVENTORY API ----------------

  app.get('/api/themes', (req, res) => {
    return res.json(db.themes);
  });

  app.post('/api/themes', (req, res) => {
    const { name, category, description, file_url, file_size } = req.body;
    const newTheme: ThemePage = {
      id: `theme_${Date.now()}`,
      name: name || 'New Theme Asset',
      category: category || 'Templates',
      description: description || '',
      file_url: file_url || '/assets/templates/template.xlsx',
      file_size: file_size || '1.5 MB XLSX',
      created_at: new Date().toISOString(),
    };
    db.themes.unshift(newTheme);
    saveDatabase(db);
    return res.status(201).json(newTheme);
  });

  app.delete('/api/themes/:id', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    if (user && user.role !== 'CEO' && user.role !== 'PR_Manager') {
      return res.status(403).json({ error: 'Permission denied to delete theme asset' });
    }
    const { id } = req.params;
    db.themes = db.themes.filter((t) => t.id !== id);
    saveDatabase(db);
    return res.json({ success: true });
  });

  // ---------------- COURSES API ----------------

  app.get('/api/courses', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    let courses = [...db.courses];

    if (user) {
      courses = courses.filter((c) => c.visible_to_roles.includes(user.role));
    }
    return res.json(courses);
  });

  app.post('/api/courses', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    if (user && user.role !== 'CEO') {
      return res.status(403).json({ error: 'Only CEO can create courses' });
    }

    const { title, description, video_url, visible_to_roles, duration, thumbnail } = req.body;
    const newCourse: Course = {
      id: `course_${Date.now()}`,
      title: title || 'New Training Course',
      description: description || '',
      video_url: video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      visible_to_roles: visible_to_roles || ['CEO', 'Division_Leader', 'Campaign_Manager', 'PR_Manager'],
      created_by: user?.id || 'user_ceo_1',
      duration: duration || '30 mins',
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.courses.unshift(newCourse);
    saveDatabase(db);
    return res.status(201).json(newCourse);
  });

  // ---------------- TALENT POOL / USERS API ----------------

  app.get('/api/users', (req: Request & { currentUser?: User }, res) => {
    const roleFilter = req.query.role as string;
    let users = [...db.users];

    if (roleFilter) {
      users = users.filter((u) => u.role === roleFilter);
    }
    return res.json(users);
  });

  app.patch('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    db.users[index] = {
      ...db.users[index],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    saveDatabase(db);
    return res.json(db.users[index]);
  });

  // ---------------- SETTINGS API ----------------

  app.get('/api/settings', (req, res) => {
    return res.json(db.settings);
  });

  app.patch('/api/settings', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    if (user && user.role !== 'CEO' && user.role !== 'Division_Leader') {
      return res.status(403).json({ error: 'Only CEO or Division Leader can update settings' });
    }

    db.settings = {
      ...db.settings,
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    saveDatabase(db);
    return res.json(db.settings);
  });

  // ---------------- FEEDBACKS API ----------------

  app.get('/api/feedbacks', (req, res) => {
    return res.json(db.feedbacks);
  });

  app.post('/api/feedbacks', (req: Request & { currentUser?: User }, res) => {
    const user = req.currentUser;
    const { submission_id, comments, video_timestamp, video_url } = req.body;
    const sub = db.submissions.find((s) => s.id === submission_id);

    const newFb: VideoFeedback = {
      id: `fb_${Date.now()}`,
      submission_id,
      client_id: user?.id || 'user_client_1',
      comments: comments || '',
      video_timestamp: video_timestamp || '0:05',
      video_url: video_url || sub?.video_url,
      created_at: new Date().toISOString(),
      client_name: user?.name || 'Client',
      submission_title: sub?.title || 'Video Submission',
    };
    db.feedbacks.unshift(newFb);
    saveDatabase(db);
    return res.status(201).json(newFb);
  });

  // ---------------- VIEW TRACKING & SOCIAL API SYNC ----------------

  app.post('/api/sync/views', (req, res) => {
    const { platform, clipper_id, submission_id } = req.body;

    let updatedCount = 0;
    db.submissions = db.submissions.map((sub) => {
      if ((!submission_id || sub.id === submission_id) && (!clipper_id || sub.clipper_id === clipper_id)) {
        // Simulate genuine view spike from platform API
        const addedViews = Math.floor(Math.random() * 25000) + 5000;
        const newViews = (sub.views || 0) + addedViews;
        updatedCount++;

        // Recalculate associated payout if present
        const pIdx = db.payouts.findIndex((p) => p.submission_id === sub.id);
        if (pIdx !== -1) {
          const payout = db.payouts[pIdx];
          const calculated = Math.round((newViews * payout.rate_used) / 1000);
          db.payouts[pIdx].views = newViews;
          db.payouts[pIdx].calculated_amount = calculated;
          if (db.payouts[pIdx].status === 'pending') {
            db.payouts[pIdx].approved_amount = calculated;
          }
        }

        return {
          ...sub,
          views: newViews,
          views_last_sync: 'Just now',
          platform_synced_from: (platform as any) || sub.platform_synced_from,
          updated_at: new Date().toISOString(),
        };
      }
      return sub;
    });

    saveDatabase(db);
    return res.json({ success: true, updated_submissions: updatedCount, message: `Synced with ${platform || 'platform'} API successfully` });
  });

  // ---------------- VITE OR STATIC SERVING ----------------

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GetVeevz server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
