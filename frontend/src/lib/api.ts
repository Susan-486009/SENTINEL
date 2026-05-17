/**
 * API Service Layer for LASUSTECH Resolution Center
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface UserSettings {
  email_notifications: boolean;
  in_app_notifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  matric: string;
  settings?: UserSettings;
}

export interface ComplaintFile {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export interface InternalNote {
  admin_id: { _id: string; name: string };
  text: string;
  created_at: string;
}

export interface TimelineEntry {
  type: 'status_change' | 'note_added' | 'assigned' | 'evidence_added' | 'system';
  text: string;
  user_id?: { _id: string; name: string; role: string };
  created_at: string;
}

export interface Complaint {
  _id: string;
  id?: string; // Some endpoints return 'id'
  reference_id: string; // From model
  referenceId?: string; // From some service returns
  category: string;
  title: string;
  description: string;
  anonymous: boolean;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  files: ComplaintFile[];
  internalNotes?: InternalNote[];
  internal_notes?: InternalNote[];
  timeline: TimelineEntry[];
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
  submitter?: {
    id: string;
    name: string;
    email: string;
    matric: string;
  };
}

export interface AnalyticsData {
  statusCounts: Record<string, number>;
  categoryStats: Array<{
    _id: string;
    open: number;
    resolved: number;
  }>;
}

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('as_access_token') : null;
  
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const baseUrlClean = BASE_URL.replace(/\/$/, '');
  const pathClean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${baseUrlClean}${pathClean}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('as_access_token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    let message = 'An unexpected error occurred';
    try {
      const error = await response.json();
      message = error.message || message;
    } catch (e) {
      // Fallback for non-JSON errors
    }
    throw new Error(message);
  }

  const result = await response.json();
  return result.data !== undefined ? result.data : result;
};

export const authService = {
  login: (credentials: any) => 
    request<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify(credentials) 
    }),
  register: (userData: any) => 
    request<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', { 
      method: 'POST', 
      body: JSON.stringify(userData) 
    }),
  me: () => request<User>('/auth/me'),
  updateProfile: (data: Partial<User> & { settings?: Partial<UserSettings> }) => 
    request<User>('/auth/me', { 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
  getUsers: (params?: any) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/auth/admin/users${qs}`);
  },
};

export const complaintService = {
  getAll: (params?: any) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Complaint[]>(`/complaints${qs}`);
  },
  getMine: () => request<Complaint[]>('/complaints/mine'),
  getById: (id: string) => request<Complaint>(`/complaints/${id}`),
  track: (refId: string) => request<Complaint>(`/complaints/track/${refId}`),
  getStats: () => request<AnalyticsData>('/complaints/stats/overview'),
  submit: (formData: FormData) => 
    request<Complaint>('/complaints', { 
      method: 'POST', 
      body: formData 
    }),
  updateStatus: (id: string, status: string) => 
    request<Complaint>(`/complaints/${id}/status`, { 
      method: 'PATCH', 
      body: JSON.stringify({ status }) 
    }),
  updatePriority: (id: string, priority: string) => 
    request<Complaint>(`/complaints/${id}/priority`, { 
      method: 'PATCH', 
      body: JSON.stringify({ priority }) 
    }),
  addInternalNote: (id: string, text: string) => 
    request<InternalNote>(`/complaints/${id}/notes`, { 
      method: 'POST', 
      body: JSON.stringify({ text }) 
    }),
};

export const departmentService = {
  getAll: () => request<any[]>('/departments'),
  create: (data: any) => request<any>('/departments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/departments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

export const notificationService = {
  getMine: () => request<any[]>('/notifications'),
  markAsRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),
};
