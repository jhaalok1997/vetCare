export default function Footer() {
  return (
    <footer className="bg-green-900 text-white mt-12">
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About */}
        <div>
          <h3 className="text-xl font-bold mb-4">About Vet🐾Care</h3>
          <p className="text-sm">
            VetCare is dedicated to providing reliable, fast, and insightful veterinary resources to students, professionals, and researchers.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-yellow-300">Home</a></li>
            <li><a href="/about" className="hover:text-yellow-300">About</a></li>
            <li><a href="/services" className="hover:text-yellow-300">Services</a></li>
            <li><a href="/contact" className="hover:text-yellow-300">Contact</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <p className="text-sm">📍 hb-16, City Center, Sector-4</p>
          <p className="text-sm">📍 B.S City, Jharkhand</p>
          <p className="text-sm">📧 support@vetcare.com</p>
          <p className="text-sm">📞 +91 9348516261</p>
        </div>
      </div>

      <div className="bg-green-950 text-center py-3 text-sm">
        © {new Date().getFullYear()} Vet🐾Care. All rights reserved.
      </div>
    </footer>
  );
}
