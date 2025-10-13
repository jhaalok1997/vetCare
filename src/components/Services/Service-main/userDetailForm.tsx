
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { predefinedAnimalTypes } from "./animal&diseasesData";
import { getDiseaseCategoriesForAnimal } from "./animal&diseasesData";


// Form data interface
interface PetOwnerFormData {
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    petName: string;
    animalType: string;
    diseaseCategory: string;
    petAge: number;
    petBreed?: string;
    symptoms: string;
    urgency: 'low' | 'medium' | 'high';
    preferredContactMethod: 'phone' | 'email' | 'both';
    additionalNotes?: string;
}


export default function UserDetailForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<PetOwnerFormData>();

    // Watch animal type to filter disease categories
    const selectedAnimalType = watch('animalType');



    // Disease categories based on animal type


    // Set loading to false since we're using predefined data
    useEffect(() => {
        setIsLoading(false);
    }, []);

    // Get disease categories for selected animal type
    const filteredDiseaseCategories = selectedAnimalType ? getDiseaseCategoriesForAnimal(selectedAnimalType) : [];

    const onSubmit = async (data: PetOwnerFormData) => {
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            // First, find matching vets
            const vetMatchRes = await fetch('/api/ServicesAPi/VetProfile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    animalTypeId: data.animalType,
                    diseaseCategoryId: data.diseaseCategory
                })
            });

            const vetMatchData = await vetMatchRes.json();

            if (vetMatchData.success && vetMatchData.data.length > 0) {
                // Create vet match log
                const logRes = await fetch('/api/ServicesAPi/VetMatchLog', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: 'temp-user-id', // Replace with actual user ID from auth
                        animalType: data.animalType,
                        diseaseCategory: data.diseaseCategory,
                        matchedVet: vetMatchData.data[0]._id
                    })
                });

                if (logRes.ok) {
                    setSubmitMessage({
                        type: 'success',
                        message: `Form submitted successfully! We found ${vetMatchData.data.length} matching veterinarian(s). You will be contacted soon.`
                    });
                    reset();
                } else {
                    throw new Error('Failed to create vet match log');
                }
            } else {
                setSubmitMessage({
                    type: 'error',
                    message: 'No matching veterinarians found for your pet\'s condition. Please try again or contact us directly.'
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitMessage({
                type: 'error',
                message: 'Failed to submit form. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <>
            {/* Pet Owner Form Section */}
            <motion.section
                className="mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <Card className="max-w-4xl mx-auto  bg-white ">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl sm:text-3xl text-primary mb-2">
                            Find the Right Veterinarian for Your Pet
                        </CardTitle>
                        <p className="text-gray-600">
                            Fill out the form below to get matched with qualified veterinarians who specialize in your pet&apos;s needs.
                        </p>
                    </CardHeader>
                    <CardContent className="p-6">
                        {isLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading form data...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Owner Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-primary border-b pb-2">Owner Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                {...register('ownerName', { required: 'Owner name is required' })}
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Enter your full name"
                                            />
                                            {errors.ownerName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.ownerName.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address *
                                            </label>
                                            <input
                                                {...register('ownerEmail', {
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address'
                                                    }
                                                })}
                                                type="email"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Enter your email"
                                            />
                                            {errors.ownerEmail && (
                                                <p className="text-red-500 text-sm mt-1">{errors.ownerEmail.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number *
                                            </label>
                                            <input
                                                {...register('ownerPhone', {
                                                    required: 'Phone number is required',
                                                    pattern: {
                                                        value: /^[\+]?[1-9][\d]{0,15}$/,
                                                        message: 'Invalid phone number'
                                                    }
                                                })}
                                                type="tel"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Enter your phone number"
                                            />
                                            {errors.ownerPhone && (
                                                <p className="text-red-500 text-sm mt-1">{errors.ownerPhone.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Preferred Contact Method *
                                            </label>
                                            <select
                                                {...register('preferredContactMethod', { required: 'Please select a contact method' })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select contact method</option>
                                                <option value="phone">Phone</option>
                                                <option value="email">Email</option>
                                                <option value="both">Both Phone & Email</option>
                                            </select>
                                            {errors.preferredContactMethod && (
                                                <p className="text-red-500 text-sm mt-1">{errors.preferredContactMethod.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Pet Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-primary border-b pb-2">Pet Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pet Name *
                                            </label>
                                            <input
                                                {...register('petName', { required: 'Pet name is required' })}
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Enter your pet's name"
                                            />
                                            {errors.petName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.petName.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Animal Type *
                                            </label>
                                            <select
                                                {...register('animalType', { required: 'Please select an animal type' })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select animal type</option>
                                                {predefinedAnimalTypes.map((animal) => (
                                                    <option key={animal._id} value={animal._id}>
                                                        {animal.icon} {animal.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.animalType && (
                                                <p className="text-red-500 text-sm mt-1">{errors.animalType.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pet Age (years) *
                                            </label>
                                            <input
                                                {...register('petAge', {
                                                    required: 'Pet age is required',
                                                    min: { value: 0, message: 'Age must be 0 or greater' },
                                                    max: { value: 30, message: 'Age must be 30 or less' }
                                                })}
                                                type="number"
                                                min="0"
                                                max="30"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Enter pet's age"
                                            />
                                            {errors.petAge && (
                                                <p className="text-red-500 text-sm mt-1">{errors.petAge.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Pet Breed (Optional)
                                            </label>
                                            <input
                                                {...register('petBreed')}
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Enter pet's breed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-primary border-b pb-2">Medical Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Disease/Condition Category *
                                            </label>
                                            <select
                                                {...register('diseaseCategory', { required: 'Please select a disease category' })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                disabled={!selectedAnimalType}
                                            >
                                                <option value="">
                                                    {selectedAnimalType ? 'Select disease category' : 'Please select animal type first'}
                                                </option>
                                                {filteredDiseaseCategories.map((disease) => (
                                                    <option key={disease._id} value={disease._id}>
                                                        {disease.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedAnimalType && filteredDiseaseCategories.length > 0 && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Select the condition that best matches your {predefinedAnimalTypes.find(a => a._id === selectedAnimalType)?.name.toLowerCase()}&apos;s symptoms
                                                </p>
                                            )}
                                            {errors.diseaseCategory && (
                                                <p className="text-red-500 text-sm mt-1">{errors.diseaseCategory.message}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Urgency Level *
                                            </label>
                                            <select
                                                {...register('urgency', { required: 'Please select urgency level' })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">Select urgency</option>
                                                <option value="low">Low - Routine checkup</option>
                                                <option value="medium">Medium - Needs attention soon</option>
                                                <option value="high">High - Emergency/Urgent</option>
                                            </select>
                                            {errors.urgency && (
                                                <p className="text-red-500 text-sm mt-1">{errors.urgency.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dynamic Animal-Specific Information */}
                                    {selectedAnimalType && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-blue-800 mb-2">
                                                {predefinedAnimalTypes.find(a => a._id === selectedAnimalType)?.icon}
                                                {predefinedAnimalTypes.find(a => a._id === selectedAnimalType)?.name} Health Information
                                            </h4>
                                            <div className="text-sm text-blue-700">
                                                {selectedAnimalType === 'dog' && (
                                                    <p>Common health concerns for dogs include skin allergies, joint problems, dental issues, and digestive problems. Please describe any specific symptoms you&apos;ve noticed.</p>
                                                )}
                                                {selectedAnimalType === 'cat' && (
                                                    <p>Cats commonly experience urinary tract issues, respiratory infections, and dental problems. Please provide details about any changes in behavior or physical symptoms.</p>
                                                )}
                                                {selectedAnimalType === 'horse' && (
                                                    <p>Horses are prone to lameness, colic, and respiratory issues. Please describe any gait abnormalities, digestive problems, or breathing difficulties.</p>
                                                )}
                                                {selectedAnimalType === 'pigs' && (
                                                    <p>Pigs may experience respiratory infections, digestive issues, and reproductive problems. Please describe any symptoms related to breathing, eating, or reproductive health.</p>
                                                )}
                                                {selectedAnimalType === 'birds' && (
                                                    <p>Birds commonly have respiratory issues, feather problems, and digestive concerns. Please describe any changes in breathing, feather condition, or eating habits.</p>
                                                )}
                                                {selectedAnimalType === 'cattle' && (
                                                    <p>Cattle often experience mastitis, lameness, and reproductive issues. Please describe any udder problems, walking difficulties, or breeding concerns.</p>
                                                )}
                                                {selectedAnimalType === 'poultry' && (
                                                    <p>Poultry commonly have respiratory infections, digestive problems, and egg production issues. Please describe any breathing difficulties, digestive symptoms, or laying problems.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Symptoms/Description *
                                        </label>
                                        <textarea
                                            {...register('symptoms', { required: 'Please describe the symptoms' })}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder={
                                                selectedAnimalType
                                                    ? `Describe your ${predefinedAnimalTypes.find(a => a._id === selectedAnimalType)?.name.toLowerCase()}'s symptoms, behavior changes, or any concerns...`
                                                    : "Describe your pet's symptoms, behavior changes, or any concerns..."
                                            }
                                        />
                                        {errors.symptoms && (
                                            <p className="text-red-500 text-sm mt-1">{errors.symptoms.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Additional Notes (Optional)
                                        </label>
                                        <textarea
                                            {...register('additionalNotes')}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder={
                                                selectedAnimalType
                                                    ? `Any additional information about your ${predefinedAnimalTypes.find(a => a._id === selectedAnimalType)?.name.toLowerCase()} that might help the veterinarian...`
                                                    : "Any additional information that might help the veterinarian..."
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Submit Button and Messages */}
                                <div className="space-y-4">
                                    {submitMessage && (
                                        <div className={`p-4 rounded-md ${submitMessage.type === 'success'
                                            ? 'bg-green-50 text-green-800 border border-green-200'
                                            : 'bg-red-50 text-red-800 border border-red-200'
                                            }`}>
                                            {submitMessage.message}
                                        </div>
                                    )}

                                    <div className="flex justify-center">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-8 py-3 bg-black text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Finding Veterinarians...
                                                </div>
                                            ) : (
                                                'Find Veterinarian'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.section>
        </>
    )
}