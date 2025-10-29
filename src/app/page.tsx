import FAQ from "@/components/Faqs/faqs";
import QuickActions from "@/components/Home/QuickActions";
import MiniChart from "@/components/Home/MiniChart";
import MiniCalendar from "@/components/Home/MiniCalendar";
import Image from "next/image";

export default function Home() {
  return (
    <div className=" min-h-screen flex flex-col">

      {/* Hero Section */}
      <section className="relative w-full h-full overflow-hidden">
        <Image
          src="/vetCare_banner (2).webp"
          alt="Veterinary Care Banner"
          width={1080}
          height={720}
          priority
          className=" w-full h-[125vh] object-cover object-center "
        />
      </section>

      <div className="absolute inset-10 mt-16 flex flex-col justify-end text-right p-28 pr-1 md:p-16 lg:p-6 max-w-full">
        <h1 className=" text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-bold mb-4 text-gray-500">Welcome to Vet🐾Care</h1>

        <h2 className="text-xl sm:text-2xl md:text-2xl font-bold mb-6  bg-gradient-to-r from-green-0 to-green-700 rounded-full px-4 py-1">Caring for Animals, Caring for Life
        </h2>

        <span className="absolute top-55 md:top-40 right-1 text-sm md:text-xl max-w-2xl font-serif text-gray-600">
          `The greatness of a nation and its moral progress can be judged by the way its animals are treated` – Mahatma Gandhi
        </span>

      </div>

      {/* Content */}
      <div className="flex-grow container mx-auto px-6 py-12">
        <h2 className="text-5xl font-bold mb-4"></h2>
        <p className="text-lg text-gray-700 font-bold font-serif mb-8">
          We combine veterinary science and AI to make pet care smarter and research more insightful.
          From early disease detection to better clinical decisions, our tools empower vets, students, and pet lovers alike.
          Together, let us shape the future of animal health and compassionate care.
        </p>
      </div>

      {/* Features */}
      <section className="max-w-7xl mx-auto py-16 px-6 grid md:grid-cols-3 gap-8 ">
        <div className="bg-white p-6 border-1 rounded-lg text-center shadow-md hover:shadow-2xl cursor-pointer transition-shadow duration-200">
          <h3 className="text-xl font-bold mb-2">Pet Health Records</h3>
          <p>Access and manage detailed medical histories for every patient.</p>
        </div>
        <div className="bg-white p-6  rounded-lg border-1 text-center shadow-lg hover:shadow-2xl cursor-pointer transition-shadow duration-200">
          <h3 className="text-xl font-bold mb-2">Vet Learning Resources</h3>
          <p>Instant access to research papers, case studies, and vet courses.</p>
        </div>
        <div className="bg-white p-6  rounded-lg text-center border-1 shadow-lg hover:shadow-2xl cursor-pointer transition-shadow duration-200">
          <h3 className="text-xl font-bold mb-2">AI-Driven Diagnosis</h3>
          <p>Get assistance with possible diagnoses based on symptoms and reports.</p>
        </div>
      </section>

      {/* Engagement widgets */}
      <QuickActions />
      <MiniChart />
      <MiniCalendar />

      {/* FAQs */}
      <main className="min-h-screen bg-gray-50">
        <div className="py-10">
          <FAQ />
        </div>
      </main>

    </div>
  );
}
