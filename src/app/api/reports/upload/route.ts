import { connectDB } from "@/lib/mongoDb";
import MedicalReport from "@/models/MedicalReport";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/dicom",
];

// Upload medical report
export async function POST(req: NextRequest) {
    await connectDB();

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const uploaderName = formData.get("uploaderName") as string;
        const uploaderEmail = formData.get("uploaderEmail") as string;
        const uploaderPhone = formData.get("uploaderPhone") as string;
        const patientName = formData.get("patientName") as string;
        const species = formData.get("species") as string;
        const appointmentId = formData.get("appointmentId") as string;
        const description = formData.get("description") as string;

        // Validate required fields
        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        if (!uploaderName || !uploaderEmail) {
            return NextResponse.json(
                { success: false, error: "Uploader name and email are required" },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: "File size exceeds 5MB limit" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid file type. Allowed types: PDF, JPEG, PNG, WebP, DICOM",
                },
                { status: 400 }
            );
        }

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = path.extname(file.name);
        const fileName = `report_${timestamp}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Save metadata to database
        const reportData = {
            fileName,
            originalName: file.name,
            fileSize: file.size,
            fileType: file.type,
            filePath: `/uploads/reports/${fileName}`,
            uploadedBy: {
                name: uploaderName,
                email: uploaderEmail,
                phone: uploaderPhone || undefined,
            },
            patientName: patientName || undefined,
            species: species || undefined,
            appointmentId: appointmentId || undefined,
            description: description || undefined,
        };

        const report = await MedicalReport.create(reportData);

        return NextResponse.json(
            {
                success: true,
                message: "Report uploaded successfully",
                data: {
                    id: report._id,
                    fileName: report.fileName,
                    originalName: report.originalName,
                    fileSize: report.fileSize,
                    fileType: report.fileType,
                    downloadUrl: report.filePath,
                    uploadDate: report.uploadDate,
                },
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error("Upload error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// Fetch uploaded reports
export async function GET(req: NextRequest) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
        const appointmentId = searchParams.get("appointmentId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (email) {
            query["uploadedBy.email"] = email;
        }

        if (appointmentId) {
            query.appointmentId = appointmentId;
        }

        const skip = (page - 1) * limit;

        const reports = await MedicalReport.find(query)
            .populate("appointmentId")
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(limit);

        const total = await MedicalReport.countDocuments(query);

        return NextResponse.json(
            {
                success: true,
                data: reports,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
