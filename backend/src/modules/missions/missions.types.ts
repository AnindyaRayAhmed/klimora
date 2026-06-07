export interface Mission {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  points: number;
  active: boolean;
  verificationPromptHint: string | null;
  createdAt: string;
}

export interface MissionDto {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  points: number;
  verificationPromptHint: string | null;
}

export interface MissionSubmission {
  id: string;
  missionId: string;
  userId: string;
  localityId: string;
  status: "submitted" | "pending_verification" | "verified" | "manual_review" | "rejected";
}
