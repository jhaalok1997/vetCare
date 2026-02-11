import type { JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";

export interface VetJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

export type VetProfileLean = {
  _id: Types.ObjectId;
  name: string;
  contact?: {
    email?: string;
  };
  isActive?: boolean;
};

export type AccountUserLean = {
  username?: string;
  email?: string;
};

export type AppointmentSummary = {
  id: string;
  patientName: string;
  species: string;
  condition: string;
  urgency: string;
  scheduledFor: Date;
  status: string;
};

export type PatientSummary = {
  id: string;
  name: string;
  species: string | undefined;
  age: number | undefined;
  breed?: string;
  lastVisit: Date | undefined;
  condition: string;
  urgency: string;
  latestDiagnosisSnippet: string | null;
};
