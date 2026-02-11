import mongoose from "mongoose";
import VetProfile from "@/models/VetProfile";
import VetMatchLog from "@/models/VetMatchLog";
import DiagnosisReport from "@/models/DiagnosisReport";
import ContactedUser from "@/models/ContactedUser";
import AccountUser from "@/models/AccountUser";
import Appointment from "@/models/Appointment";
import { isFilterClause } from "./utils";
import type { AccountUserLean, VetJwtPayload, VetProfileLean } from "./types";

export function resolveVetAccountObjectId(vetUser: VetJwtPayload) {
  return vetUser.id && mongoose.Types.ObjectId.isValid(vetUser.id)
    ? new mongoose.Types.ObjectId(vetUser.id)
    : null;
}

export async function getAccountUser(
  vetUser: VetJwtPayload,
  vetAccountObjectId: mongoose.Types.ObjectId | null
): Promise<AccountUserLean | null> {
  if (vetAccountObjectId) {
    return AccountUser.findById(vetAccountObjectId)
      .select("username email")
      .lean<AccountUserLean>();
  }

  if (vetUser.email) {
    return AccountUser.findOne({ email: vetUser.email })
      .select("username email")
      .lean<AccountUserLean>();
  }

  return null;
}

export async function getVetProfile(
  vetUser: VetJwtPayload,
  vetAccountObjectId: mongoose.Types.ObjectId | null
): Promise<VetProfileLean | null> {
  const profileOrClauses = [
    vetAccountObjectId ? { accountUser: vetAccountObjectId } : null,
    vetUser.email ? { "contact.email": vetUser.email } : null,
  ].filter(isFilterClause);

  return VetProfile.findOne(
    profileOrClauses.length
      ? { $or: profileOrClauses }
      : { "contact.email": vetUser.email }
  )
    .select("_id name contact isActive")
    .lean<VetProfileLean>();
}

type DashboardQueryParams = {
  vetProfileId: mongoose.Types.ObjectId;
  isVerified: boolean;
  vetUser: VetJwtPayload;
  startOfToday: Date;
  endOfToday: Date;
  sevenDaysAgo: Date;
};

export async function getDashboardCollections({
  vetProfileId,
  isVerified,
  vetUser,
  startOfToday,
  endOfToday,
  sevenDaysAgo,
}: DashboardQueryParams) {
  const vetMatchFilter = { matchedVet: vetProfileId };
  const appointmentVetFilter = isVerified
    ? [
        { veterinarian: vetProfileId },
        { veterinarian: { $exists: false } },
        { veterinarian: null },
      ]
    : [{ veterinarian: vetProfileId }];
  const tenantFilter = vetUser.tenantId ? { tenantId: vetUser.tenantId } : {};

  const [
    uniquePatientIds,
    todaysMatchLogsCount,
    newConsultationsCount,
    matchLogs,
    recentDiagnosisReports,
    newAppointments,
    todaysNewAppointmentsCount,
  ] = await Promise.all([
    VetMatchLog.distinct<string>("animalType", vetMatchFilter),
    VetMatchLog.countDocuments({
      ...vetMatchFilter,
      appointmentDate: { $gte: startOfToday, $lte: endOfToday },
    }),
    VetMatchLog.countDocuments({
      ...vetMatchFilter,
      appointmentDate: { $gte: sevenDaysAgo },
    }),
    VetMatchLog.find(vetMatchFilter)
      .populate("animalType")
      .populate("diseaseCategory")
      .sort({ appointmentDate: 1 })
      .limit(50)
      .lean(),
    DiagnosisReport.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Appointment.find({
      $or: appointmentVetFilter,
      status: { $in: ["pending", "scheduled", "confirmed", "rescheduled"] },
      ...tenantFilter,
    })
      .sort({ scheduledFor: 1 })
      .limit(50)
      .lean(),
    Appointment.countDocuments({
      $or: appointmentVetFilter,
      status: { $in: ["pending", "scheduled", "confirmed", "rescheduled"] },
      scheduledFor: { $gte: startOfToday, $lte: endOfToday },
      ...tenantFilter,
    }),
  ]);

  return {
    uniquePatientIds,
    todaysMatchLogsCount,
    newConsultationsCount,
    matchLogs,
    recentDiagnosisReports,
    newAppointments,
    todaysNewAppointmentsCount,
  };
}

export async function getMessageSummary() {
  const unreadMessages = await ContactedUser.countDocuments();
  const recentMessages = await ContactedUser.find({})
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  return { unreadMessages, recentMessages };
}
