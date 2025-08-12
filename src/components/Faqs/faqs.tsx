"use client";

import { useEffect, useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQComponent() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch("/api/faqs");
        if (!res.ok) throw new Error("Failed to fetch FAQs");
        const data = await res.json();
        setFaqs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();

    // Refresh every hour (matches backend cache)
    const interval = setInterval(fetchFAQs, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center">Loading FAQs...</p>;

  return (
    <section className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4 mt-8 ">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="p-4 w-full rounded-lg border border-gray-300 shadow-md bg-white transition hover:bg-emerald-100"
          >
            <summary className="font-semibold cursor-pointer font-serif">{faq.question}</summary>
            <p className="mt-2 text-gray-700">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
