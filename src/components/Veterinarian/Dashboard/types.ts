export type DashboardOverview = {
  totalPatients: number;
  todaysAppointments: number;
  newConsultations: number;
  unreadMessages: number;
};

export type DashboardAppointment = {
  id: string;
  patientName: string;
  species?: string;
  condition?: string;
  urgency?: string;
  scheduledFor?: string;
  status?: string;
};

export type DashboardPatient = {
  id: string;
  name: string;
  species?: string;
  age?: number;
  breed?: string;
  lastVisit?: string;
  condition?: string;
  urgency?: string;
  latestDiagnosisSnippet?: string | null;
};

export type DashboardMessage = {
  id: string;
  name?: string;
  email?: string;
  message?: string;
  status?: string;
  receivedAt?: string;
};

export type DashboardMeta = {
  vetProfile?: {
    id: string;
    name?: string;
    email?: string;
    isVerified?: boolean;
  };
  totals?: {
    consultationsTracked?: number;
  };
};

export type DashboardData = {
  overview: DashboardOverview;
  appointments: DashboardAppointment[];
  patients: DashboardPatient[];
  messages: DashboardMessage[];
  meta?: DashboardMeta;
};


