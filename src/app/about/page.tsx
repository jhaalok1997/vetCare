import AboutPage from "@/components/Aboutus/aboutuspage";





export default function About() {
  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-10 bg-emerald-50">
      <AboutPage />

      <div className="max-w-4xl mx-auto mt-8 sm:mt-12 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-3 sm:mb-4">Coming Soon</h1>
        <p className="text-emerald-700 text-sm sm:text-base">We are dedicated to improving animal healthcare with some more best services for you...</p>
      </div>
    </main>
  );
}
