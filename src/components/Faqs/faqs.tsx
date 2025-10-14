"use client";

import { useEffect, useState } from "react";
import { ThreeDot } from "react-loading-indicators";

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

  if (loading) return <p className="text-center">
    <ThreeDot variant="bob" color="#32cd32" size="large" text="Loading... FAQS" textColor="#af5151" />
  </p>;

  return (
    <section className="max-w-3xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="p-3 sm:p-4 w-full rounded-lg border border-gray-300 shadow-md bg-white transition hover:bg-emerald-100"
          >
            <summary className="font-semibold cursor-pointer font-serif text-sm sm:text-base">{faq.question}</summary>
            <p className="mt-2 text-gray-700 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
