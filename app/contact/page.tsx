"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, HelpCircle, Building2 } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-background">
      <main className="w-full mx-auto relative h-full overflow-x-hidden">
        <div className="md:w-full">
          <section className="flex flex-col min-h-screen w-full pt-4">
            <div className="lg:px-0 px-4">
              <h1 className="text-4xl lg:text-5xl font-[600] text-left tracking-tighter text-foreground mb-4">
                Contact Us
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground mb-6">
                We're here to help you with any questions or concerns you may
                have.
              </p>
              <a
                href="mailto:contact@myout.fit"
                className=" cursor-pointer text-primary text-base font-medium"
              >
                contact@myout.fit
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
