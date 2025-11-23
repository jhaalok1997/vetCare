"use client"

import { useRef } from "react"
import { useForm } from "react-hook-form"
import axios, { AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload, FileText, CheckCircle, AlertCircle, User, Mail, Phone } from "lucide-react"

interface UploadReportModalProps {
    isOpen: boolean
    onClose: () => void
}

interface UploadReportFormData {
    uploaderName: string
    uploaderEmail: string
    uploaderPhone?: string
    patientName?: string
    species?: string
    description?: string
    file: FileList
}

export default function UploadReportModal({ isOpen, onClose }: UploadReportModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        setError,
        clearErrors,
    } = useForm<UploadReportFormData>({
        mode: "onBlur",
        defaultValues: {
            uploaderName: "",
            uploaderEmail: "",
            uploaderPhone: "",
            patientName: "",
            species: "",
            description: "",
        },
    })

    const selectedFile = watch("file")?.[0]

    const validateFile = (fileList: FileList) => {
        if (!fileList || fileList.length === 0) {
            return "Please select a file to upload"
        }

        const file = fileList[0]
        const maxSize = 5 * 1024 * 1024 // 5MB
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"]

        if (file.size > maxSize) {
            return "File size exceeds 5MB limit"
        }

        if (!allowedTypes.includes(file.type)) {
            return "Invalid file type. Please upload PDF, JPEG, PNG, or WebP files"
        }

        return true
    }

    const handleFileSelect = (file: File) => {
        const fileList = new DataTransfer()
        fileList.items.add(file)
        setValue("file", fileList.files, { shouldValidate: true })
        clearErrors("file")
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const onSubmit = async (data: UploadReportFormData) => {
        try {
            const formDataToSend = new FormData()
            formDataToSend.append("file", data.file[0])
            formDataToSend.append("uploaderName", data.uploaderName)
            formDataToSend.append("uploaderEmail", data.uploaderEmail)
            if (data.uploaderPhone) formDataToSend.append("uploaderPhone", data.uploaderPhone)
            if (data.patientName) formDataToSend.append("patientName", data.patientName)
            if (data.species) formDataToSend.append("species", data.species)
            if (data.description) formDataToSend.append("description", data.description)

            const response = await axios.post("/api/reports/upload", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })

            if (response.data.success) {
                setTimeout(() => {
                    reset()
                    onClose()
                }, 2000)
            } else {
                setError("root", {
                    type: "manual",
                    message: response.data.error || "Failed to upload report",
                })
            }
        } catch (err) {
            const error = err as AxiosError<{ error?: string }>
            setError("root", {
                type: "manual",
                message: error.response?.data?.error || "An error occurred. Please try again.",
            })
            console.error(err)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Upload className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Upload Medical Report</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {isSubmitSuccessful && (
                    <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-green-800 font-semibold">Report uploaded successfully!</p>
                    </div>
                )}

                {/* Error Message */}
                {errors.root && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{errors.root.message}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* File Upload Area */}
                    <div>
                        <Label className="mb-2 block">Upload File *</Label>
                        <div
                            className="relative border-2 border-dashed rounded-xl p-8 text-center transition-all border-gray-300 hover:border-purple-400"
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                {...register("file", {
                                    validate: validateFile,
                                })}
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                className="hidden"
                            />

                            {selectedFile ? (
                                <div className="space-y-3">
                                    <div className="inline-flex p-3 bg-purple-100 rounded-full">
                                        <FileText className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setValue("file", undefined as unknown as FileList)
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = ""
                                            }
                                        }}
                                    >
                                        Remove File
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="inline-flex p-3 bg-gray-100 rounded-full">
                                        <Upload className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Drag and drop your file here</p>
                                        <p className="text-sm text-gray-500">or</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Browse Files
                                    </Button>
                                    <p className="text-xs text-gray-500">
                                        Supported formats: PDF, JPEG, PNG, WebP (Max 5MB)
                                    </p>
                                </div>
                            )}
                        </div>
                        {errors.file && (
                            <p className="text-sm text-red-600 mt-2">{errors.file.message}</p>
                        )}
                    </div>

                    {/* Uploader Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                            <User className="w-5 h-5 text-purple-500" />
                            Your Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="uploaderName">Your Name *</Label>
                                <Input
                                    id="uploaderName"
                                    {...register("uploaderName", {
                                        required: "Name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Name must be at least 2 characters",
                                        },
                                    })}
                                    placeholder="John Doe"
                                    className={errors.uploaderName ? "border-red-500" : ""}
                                />
                                {errors.uploaderName && (
                                    <p className="text-sm text-red-600 mt-1">{errors.uploaderName.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="uploaderEmail">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email *
                                </Label>
                                <Input
                                    id="uploaderEmail"
                                    type="email"
                                    {...register("uploaderEmail", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Invalid email format",
                                        },
                                    })}
                                    placeholder="john@example.com"
                                    className={errors.uploaderEmail ? "border-red-500" : ""}
                                />
                                {errors.uploaderEmail && (
                                    <p className="text-sm text-red-600 mt-1">{errors.uploaderEmail.message}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="uploaderPhone">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="uploaderPhone"
                                    type="tel"
                                    {...register("uploaderPhone", {
                                        pattern: {
                                            value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                                            message: "Invalid phone number format",
                                        },
                                    })}
                                    placeholder="+1 234 567 8900"
                                    className={errors.uploaderPhone ? "border-red-500" : ""}
                                />
                                {errors.uploaderPhone && (
                                    <p className="text-sm text-red-600 mt-1">{errors.uploaderPhone.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pet Information (Optional) */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Pet Information (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="patientName">Pet Name</Label>
                                <Input
                                    id="patientName"
                                    {...register("patientName")}
                                    placeholder="e.g., Max"
                                />
                            </div>
                            <div>
                                <Label htmlFor="species">Species</Label>
                                <Input
                                    id="species"
                                    {...register("species")}
                                    placeholder="e.g., Dog, Cat"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    {...register("description", {
                                        maxLength: {
                                            value: 500,
                                            message: "Description must be less than 500 characters",
                                        },
                                    })}
                                    placeholder="Brief description of the report..."
                                    rows={3}
                                    className={errors.description ? "border-red-500" : ""}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Uploading..." : "Upload Report"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
