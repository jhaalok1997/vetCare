import type { AppointmentSummary, PatientSummary } from "./types";
import type { Types } from "mongoose";

export function buildDiagnosisByAnimalType(recentDiagnosisReports: Array<any>) {
  const diagnosisByAnimalType = new Map<string, (typeof recentDiagnosisReports)[number]>();
  recentDiagnosisReports.forEach((diagnosis) => {
    if (!diagnosis.animalType) return;
    const key = String(diagnosis.animalType).toLowerCase();
    if (!diagnosisByAnimalType.has(key)) {
      diagnosisByAnimalType.set(key, diagnosis);
    }
  });
  return diagnosisByAnimalType;
}

export function buildMatchLogAppointments(
  matchLogs: Array<any>,
  startOfToday: Date
): AppointmentSummary[] {
  return matchLogs
    .filter((log) => {
      const appointmentDate = log.appointmentDate ?? log.timestamp;
      return appointmentDate && appointmentDate >= startOfToday;
    })
    .sort((a, b) => {
      const aDate = (a.appointmentDate ?? a.timestamp ?? new Date()).getTime();
      const bDate = (b.appointmentDate ?? b.timestamp ?? new Date()).getTime();
      return aDate - bDate;
    })
    .map((log) => {
      const animal = log.animalType as {
        _id?: Types.ObjectId;
        petName?: string;
        animalType?: string;
      };
      const disease = log.diseaseCategory as {
        DiseaseType?: string;
        UrgencyLevel?: string;
      };

      return {
        id: log._id?.toString() ?? "",
        patientName: animal?.petName || "Unknown patient",
        species: animal?.animalType || "Unknown",
        condition: disease?.DiseaseType || "General consultation",
        urgency: disease?.UrgencyLevel || "Low",
        scheduledFor: log.appointmentDate ?? log.timestamp,
        status: log.status,
      };
    });
}

export function buildNewModelAppointments(
  newAppointments: Array<any>,
  startOfToday: Date
): AppointmentSummary[] {
  return newAppointments
    .filter((apt) => apt.scheduledFor >= startOfToday)
    .map((apt) => ({
      id: apt._id?.toString() ?? "",
      patientName: apt.patientName,
      species: apt.species,
      condition: apt.reason,
      urgency: apt.urgency,
      scheduledFor: apt.scheduledFor,
      status: apt.status,
    }));
}

export function buildUpcomingAppointments(
  matchLogAppointments: AppointmentSummary[],
  newModelAppointments: AppointmentSummary[]
) {
  return [...matchLogAppointments, ...newModelAppointments]
    .sort((a, b) => {
      const aDate = new Date(a.scheduledFor).getTime();
      const bDate = new Date(b.scheduledFor).getTime();
      return aDate - bDate;
    })
    .slice(0, 6);
}

export function buildPatientSummaries(
  matchLogs: Array<any>,
  diagnosisByAnimalType: Map<string, any>
): PatientSummary[] {
  const patientSummaries: PatientSummary[] = [];
  const seenPatients = new Set<string>();

  for (const log of [...matchLogs].sort((a, b) => {
    const aDate = (a.appointmentDate ?? a.timestamp ?? new Date()).getTime();
    const bDate = (b.appointmentDate ?? b.timestamp ?? new Date()).getTime();
    return bDate - aDate;
  })) {
    const animal = log.animalType as {
      _id?: Types.ObjectId;
      petName?: string;
      animalType?: string;
      petAge?: number;
      petBreed?: string;
    };
    if (!animal?._id) continue;
    const animalId = animal._id.toString();
    if (seenPatients.has(animalId)) continue;
    seenPatients.add(animalId);

    const disease = log.diseaseCategory as {
      DiseaseType?: string;
      UrgencyLevel?: string;
    };

    const diagnosisKey = animal.animalType?.toLowerCase();
    const relatedDiagnosis = diagnosisKey ? diagnosisByAnimalType.get(diagnosisKey) : null;

    patientSummaries.push({
      id: animalId,
      name: animal.petName || "Unnamed patient",
      species: animal.animalType,
      age: animal.petAge,
      breed: animal.petBreed,
      lastVisit: log.appointmentDate ?? log.timestamp,
      condition: disease?.DiseaseType || "General check-up",
      urgency: disease?.UrgencyLevel || "Low",
      latestDiagnosisSnippet: relatedDiagnosis?.report
        ? String(relatedDiagnosis.report).slice(0, 200)
        : null,
    });

    if (patientSummaries.length >= 10) break;
  }

  return patientSummaries;
}

export function mapRecentMessages(recentMessages: Array<any>) {
  return recentMessages.map((msg) => ({
    id: msg._id?.toString() ?? "",
    name: msg.Name,
    email: msg.email,
    message: msg.message,
    status: "new",
    receivedAt: msg.createdAt,
  }));
}
