

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <section className="relative w-full h-screen">
        <img
          src="./vetCare_banner (2).webp"
          alt="Veterinary Care"
          className="w-full h-full mt-8 object-cover object-center"
        />
      </section>

       <div className="absolute inset-10 mt-16 flex flex-col justify-end-safe text-right p-8 md:p-16 lg:p-6 max-w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold mb-4 text-gray-500">Welcome to Vet🐾Care</h1>
         
          <h2 className="text-xl sm:text-2xl md:text-2xl font-bold mb-6  bg-gradient-to-r from-green-0 to-green-700 rounded-full px-2 py-1">Caring for Animals, Caring for Life 
          </h2>

           <span className="inline-block sm:text-lg md:text-xl max-w-2xl font-serif text-gray-600">
            "The greatness of a nation and its moral progress can be judged by the way its animals are treated." – Mahatma Gandhi
          </span>
         
        </div>

      {/* Content */}
      <div className="flex-grow container mx-auto px-6 py-12">
        <h2 className="text-5xl font-bold mb-4"></h2>
        <p className="text-lg text-gray-700">
          We provide the most advanced tools for veterinary professionals, students, and researchers to enhance their knowledge and animal care.
        </p>
      </div>
 
  
    </div>
  );
}
