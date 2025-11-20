"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, HelpCircle, Building2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    alert("Contact form submission coming soon!");
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl 2xl:text-6xl font-bold tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Options */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6">
                Contact Options
              </h2>
              <div className="space-y-4">
                <div className="border border-border rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email Support</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        For general inquiries and support
                      </p>
                      <a
                        href="mailto:support@myout.fit"
                        className="text-primary hover:underline"
                      >
                        support@myout.fit
                      </a>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Help Center</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Find answers to common questions
                      </p>
                      <Link
                        href="/guide"
                        className="text-primary hover:underline"
                      >
                        Visit Guide →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Brand Partnerships</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Interested in becoming a partner brand?
                      </p>
                      <a
                        href="mailto:brands@myout.fit"
                        className="text-primary hover:underline"
                      >
                        brands@myout.fit
                      </a>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Feedback</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Share your thoughts and suggestions
                      </p>
                      <Link
                        href="/feedback"
                        className="text-primary hover:underline"
                      >
                        Submit Feedback →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Response Time
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                We typically respond to all inquiries within 24-48 hours during
                business days. For urgent matters, please mark your email as
                high priority.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="border border-border rounded-2xl p-8 bg-white dark:bg-black/50">
              <h2 className="text-2xl font-bold tracking-tight mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Brand Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Looking for quick answers? Check out our comprehensive guide first.
          </p>
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Read the Guide
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


