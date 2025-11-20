export interface Event {
  id: string
  title: string
  description: string | null
  rules: string[]
  status: "active" | "closed"
  closure_message: string | null
  hide_pairings_from_admins: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  event_id: string
  name: string
  email: string | null
  // Optional moodboard: bullet points with likes/dislikes
  moodboard?: string[] | null
  unique_link: string
  created_at: string
}

export interface Pairing {
  id: string
  event_id: string
  giver_id: string
  receiver_id: string
  revealed: boolean
  revealed_at: string | null
  created_at: string
}

export interface AdminUser {
  id: string
  discord_id: string
  discord_username: string
  discord_avatar: string | null
  created_at: string
}

export interface PairingWithDetails extends Pairing {
  giver: Participant
  receiver: Participant
  event: Event
}
