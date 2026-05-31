export type PlanType = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'past_due';
export type BillingInterval = 'monthly' | 'yearly';
export type AuthProviderType = 'email' | 'google' | 'both';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  auth_provider: AuthProviderType;
}

export interface Subscription {
  plan: PlanType;
  status: SubscriptionStatus;
  interval: BillingInterval;
  seats: number;
  current_period_end: string;
  created_at: string;
}

export interface NotionConfig {
  connected: boolean;
  workspace_name: string;
  workspace_icon?: string;
  journal_db_id: string;
  journal_db_name: string;
  tasks_db_id: string;
  tasks_db_name: string;
  notes_db_id: string;
  notes_db_name: string;
  habits_db_id: string;
  habits_db_name: string;
}

export interface Template {
  id: string;
  name: string;
  body: string;
  is_default: boolean;
  is_custom: boolean;
}

export interface Schedule {
  generate_time: string;
  timezone: string;
  is_active: boolean;
}

export interface JournalRun {
  id: string;
  run_at: string; // ISO string
  status: 'success' | 'failed';
  tasks_count: number;
  notes_count: number;
  trigger_type: 'scheduled' | 'manual';
  notion_page_url?: string;
  error_message?: string;
}

export interface OnboardingState {
  step: 'select-plan' | 'checkout' | 'connect-notion' | 'select-databases' | 'choose-template' | 'set-schedule' | 'complete';
  is_complete: boolean;
}
