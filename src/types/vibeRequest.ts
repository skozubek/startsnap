import { UserProfile } from './user'; // Assuming UserProfile is defined in src/types/user.ts

export interface VibeRequest {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description: string;
  tags?: string[] | null;
  status: 'open' | 'in progress' | 'completed';
  type: 'request' | 'challenge';
  linked_startsnap_id?: string | null;
  // Optional: requester's profile, can be populated after fetching
  requesterProfile?: Partial<UserProfile>;
}
