


export default function Contact() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p>Have questions or suggestions? We’d love to hear from you.</p>
      <form className="mt-6 grid gap-4">
        <input type="text" placeholder="Name" className="border p-3 rounded" />
        <input type="email" placeholder="Email" className="border p-3 rounded" />
        <textarea placeholder="Your message" className="border p-3 rounded h-32"></textarea>
        <button className="bg-emerald-700 text-white py-3 rounded hover:bg-emerald-800">
          Send Message
        </button>
      </form>
    </div>
  );
}