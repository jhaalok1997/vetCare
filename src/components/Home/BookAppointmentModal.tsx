"use client"

import { useForm } from "react-hook-form"
import axios, { AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Calendar, Clock, User, Mail, Phone, Stethoscope } from "lucide-react"

interface BookAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
}

interface BookAppointmentFormData {
    patientName: string
    species: string
    breed?: string
    age?: string
    ownerName: string
    ownerEmail: string
    ownerPhone: string
    scheduledFor: string
    reason: string
    urgency: "Low" | "Medium" | "High" | "Emergency"
    notes?: string
}

export default function BookAppointmentModal({ isOpen, onClose }: BookAppointmentModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        setError,
    } = useForm<BookAppointmentFormData>({
        mode: "onBlur",
        defaultValues: {
            patientName: "",
            species: "",
            breed: "",
            age: "",
            ownerName: "",
            ownerEmail: "",
            ownerPhone: "",
            scheduledFor: "",
            reason: "",
            urgency: "Low",
            notes: "",
        },
    })

    const onSubmit = async (data: BookAppointmentFormData) => {
        try {
            const response = await axios.post("/api/appointments", data, {
                headers: {
                    "Content-Type": "application/json",
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
                    message: response.data.error || "Failed to book appointment",
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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Book Appointment</h2>
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
                    <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-semibold">✓ Appointment booked successfully!</p>
                    </div>
                )}

                {/* Error Message */}
                {errors.root && (
                    <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{errors.root.message}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Pet Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                            <Stethoscope className="w-5 h-5 text-blue-500" />
                            Pet Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="patientName">Pet Name *</Label>
                                <Input
                                    id="patientName"
                                    {...register("patientName", {
                                        required: "Pet name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Pet name must be at least 2 characters",
                                        },
                                    })}
                                    placeholder="e.g., Max"
                                    className={errors.patientName ? "border-red-500" : ""}
                                />
                                {errors.patientName && (
                                    <p className="text-sm text-red-600 mt-1">{errors.patientName.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="species">Species *</Label>
                                <Input
                                    id="species"
                                    {...register("species", {
                                        required: "Species is required",
                                    })}
                                    placeholder="e.g., Dog, Cat"
                                    className={errors.species ? "border-red-500" : ""}
                                />
                                {errors.species && (
                                    <p className="text-sm text-red-600 mt-1">{errors.species.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="breed">Breed</Label>
                                <Input
                                    id="breed"
                                    {...register("breed")}
                                    placeholder="e.g., Golden Retriever"
                                />
                            </div>
                            <div>
                                <Label htmlFor="age">Age</Label>
                                <Input id="age" {...register("age")} placeholder="e.g., 3 years" />
                            </div>
                        </div>
                    </div>

                    {/* Owner Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                            <User className="w-5 h-5 text-blue-500" />
                            Owner Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="ownerName">Your Name *</Label>
                                <Input
                                    id="ownerName"
                                    {...register("ownerName", {
                                        required: "Your name is required",
                                        minLength: {
                                            value: 2,
                                            message: "Name must be at least 2 characters",
                                        },
                                    })}
                                    placeholder="John Doe"
                                    className={errors.ownerName ? "border-red-500" : ""}
                                />
                                {errors.ownerName && (
                                    <p className="text-sm text-red-600 mt-1">{errors.ownerName.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="ownerEmail">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email *
                                </Label>
                                <Input
                                    id="ownerEmail"
                                    type="email"
                                    {...register("ownerEmail", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Invalid email format",
                                        },
                                    })}
                                    placeholder="john@example.com"
                                    className={errors.ownerEmail ? "border-red-500" : ""}
                                />
                                {errors.ownerEmail && (
                                    <p className="text-sm text-red-600 mt-1">{errors.ownerEmail.message}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="ownerPhone">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Phone Number *
                                </Label>
                                <Input
                                    id="ownerPhone"
                                    type="tel"
                                    {...register("ownerPhone", {
                                        required: "Phone number is required",
                                        pattern: {
                                            value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                                            message: "Invalid phone number format",
                                        },
                                    })}
                                    placeholder="+1 234 567 8900"
                                    className={errors.ownerPhone ? "border-red-500" : ""}
                                />
                                {errors.ownerPhone && (
                                    <p className="text-sm text-red-600 mt-1">{errors.ownerPhone.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Appointment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="scheduledFor">Date & Time *</Label>
                                <Input
                                    id="scheduledFor"
                                    type="datetime-local"
                                    {...register("scheduledFor", {
                                        required: "Appointment date and time is required",
                                        validate: (value) => {
                                            const selectedDate = new Date(value)
                                            const now = new Date()
                                            if (selectedDate <= now) {
                                                return "Appointment must be scheduled for a future date"
                                            }
                                            return true
                                        },
                                    })}
                                    className={errors.scheduledFor ? "border-red-500" : ""}
                                />
                                {errors.scheduledFor && (
                                    <p className="text-sm text-red-600 mt-1">{errors.scheduledFor.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="urgency">Urgency Level *</Label>
                                <select
                                    id="urgency"
                                    {...register("urgency", {
                                        required: "Urgency level is required",
                                    })}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.urgency ? "border-red-500" : "border-gray-300"
                                        }`}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                                {errors.urgency && (
                                    <p className="text-sm text-red-600 mt-1">{errors.urgency.message}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="reason">Reason for Visit *</Label>
                                <Textarea
                                    id="reason"
                                    {...register("reason", {
                                        required: "Reason for visit is required",
                                        minLength: {
                                            value: 10,
                                            message: "Please provide at least 10 characters",
                                        },
                                        maxLength: {
                                            value: 500,
                                            message: "Reason must be less than 500 characters",
                                        },
                                    })}
                                    placeholder="Describe the reason for the appointment..."
                                    rows={3}
                                    className={errors.reason ? "border-red-500" : ""}
                                />
                                {errors.reason && (
                                    <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    {...register("notes", {
                                        maxLength: {
                                            value: 500,
                                            message: "Notes must be less than 500 characters",
                                        },
                                    })}
                                    placeholder="Any additional information..."
                                    rows={2}
                                    className={errors.notes ? "border-red-500" : ""}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
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
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Booking..." : "Book Appointment"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
