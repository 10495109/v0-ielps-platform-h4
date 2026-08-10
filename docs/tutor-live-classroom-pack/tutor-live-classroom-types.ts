export type TutorBookingState =
  | "draft"
  | "payment_pending"
  | "confirmed"
  | "lobby_open"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "refunded";

export type TutorOnboardingState =
  | "profile_started"
  | "identity_pending"
  | "identity_verified"
  | "background_pending"
  | "background_clear"
  | "safeguarding_acknowledged"
  | "approved"
  | "rejected"
  | "suspended";

export type LiveRoomState =
  | "not_available"
  | "precheck"
  | "waiting_for_tutor"
  | "waiting_for_learner"
  | "ready_to_join"
  | "connected"
  | "reconnecting"
  | "ended";

export interface TutorCard {
  id: string;
  name: string;
  headline?: string;
  levels: string[];
  skills: string[];
  priceCents: number;
  currency: string;
  verificationState: TutorOnboardingState;
  nextAvailableAt?: string;
}

export interface TutorBookingPayload {
  tutorId: string;
  learnerId: string;
  startsAt: string;
  durationMinutes: number;
  focus: "speaking" | "writing" | "exam" | "conversation" | "homework" | "custom";
  learnerNotes?: string;
}

export interface TutorBooking {
  id: string;
  tutorId: string;
  learnerId: string;
  parentId?: string;
  state: TutorBookingState;
  startsAt: string;
  durationMinutes: number;
  focus: string;
  paymentStatus?: "not_required" | "pending" | "paid" | "failed" | "refunded";
  liveRoomState: LiveRoomState;
}

export interface LiveRoomTokenResponse {
  bookingId: string;
  provider: string;
  token: string;
  roomUrl?: string;
  expiresAt: string;
}

export interface TutorSessionNotesPayload {
  bookingId: string;
  strengths: string[];
  needsPractice: string[];
  suggestedPractice: string[];
  privateTutorNotes?: string;
  learnerVisibleSummary: string;
}

export interface TutorSessionEndPayload {
  bookingId: string;
  endedAt: string;
  attendance: "completed" | "learner_no_show" | "tutor_no_show" | "technical_issue";
  notesSubmitted: boolean;
}

export interface TutorSupportEvidence {
  learnerId: string;
  bookingId: string;
  evidenceSource: "tutor_session";
  strengths: string[];
  suggestedPractice: string[];
  createdAt: string;
}

