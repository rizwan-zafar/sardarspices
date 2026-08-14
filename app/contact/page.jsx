import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us | spicer",
  description: "Get in touch with spicer — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="container-app py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-800">Contact Us</h1>
        <p className="text-stone-500 mt-1">We&apos;d love to hear from you. Reach out anytime.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
          <ContactForm />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-start gap-4">
            <span className="text-2xl">📍</span>
            <div>
              <h3 className="font-semibold text-stone-800">Our Address</h3>
              <p className="text-sm text-stone-500 mt-1">123 Spice Market Road, Lahore, Pakistan</p>
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-start gap-4">
            <span className="text-2xl">📞</span>
            <div>
              <h3 className="font-semibold text-stone-800">Phone</h3>
              <p className="text-sm text-stone-500 mt-1">+92 300 1234567</p>
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-start gap-4">
            <span className="text-2xl">✉️</span>
            <div>
              <h3 className="font-semibold text-stone-800">Email</h3>
              <p className="text-sm text-stone-500 mt-1">support@spicer.com</p>
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-start gap-4">
            <span className="text-2xl">🕒</span>
            <div>
              <h3 className="font-semibold text-stone-800">Working Hours</h3>
              <p className="text-sm text-stone-500 mt-1">Mon - Sat: 9:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
