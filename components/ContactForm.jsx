"use client";

import { useState } from "react";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common/ToastContext";

const initialForm = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        showToast(data.error || "Could not send your message.", "error");
        return;
      }

      showToast("Message sent! We'll get back to you soon.");
      setForm(initialForm);
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Phone Number (optional)"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
        <Input
          label="Subject (optional)"
          name="subject"
          value={form.subject}
          onChange={handleChange}
        />
      </div>
      <Textarea
        label="Message"
        name="message"
        rows={5}
        value={form.message}
        onChange={handleChange}
        error={errors.message}
        required
      />
      <Button type="submit" size="lg" loading={submitting} className="self-start">
        Send Message
      </Button>
    </form>
  );
}
