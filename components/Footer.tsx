"use client";

import Link from "next/link";
import { ChevronRight, Globe, Table } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  const handleScrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const headerHeight = 64; // 16 * 4 = 64px (h-16)
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  const sections = [
    {
      title: "Navigation",
      links: [
        { href: "/", label: "Home", isScrollLink: false },
        { href: "#features", label: "Features", isScrollLink: true },
        { href: "#ai", label: "AI", isScrollLink: true },
        { href: "#blocks", label: "Blocks", isScrollLink: true },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "/pricing", label: "Pricing", isScrollLink: false },
        { href: "#feedback", label: "Feedback", isScrollLink: true },
      ],
    },
    {
      title: "Legal",
      links: [
        {
          href: "/privacy-policy",
          label: "Privacy Policy",
          isScrollLink: false,
        },
        { href: "/terms", label: "Terms of Service", isScrollLink: false },
      ],
    },
    {
      title: "Social",
      links: [
        { href: "https://twitter.com", label: "X", isScrollLink: false },
        {
          href: "https://instagram.com",
          label: "Instagram",
          isScrollLink: false,
        },
      ],
    },
  ];

  return (
    <footer className="bg-background">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 100"
        className="bg-muted"
      >
        <path
          d="M0 0v100S0 4 500 4s500 96 500 96V0H0Z"
          fill="var(--background)"
        ></path>
      </svg>
      <div className="w-full flex flex-col justify-center items-center bg-muted">
        <div className="flex flex-col gap-4 lg:mb-0 mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 lg:-mt-22 2xl:-mt-32"
          >
            <div className="flex items-center w-16 h-16">
              <Image
                src="/logo.png"
                alt="Tablium"
                width={100}
                height={100}
                className="w-full h-full invert"
              />
            </div>
            <span className="font-semibold text-6xl tracking-tight text-foreground">
              Tablium
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 pt-6 px-4 md:px-6 pb-12 gap-6 lg:gap-0 w-full lg:w-5xl lg:ml-40">
          {sections.map((section) => (
            <div key={section.title} className="">
              <h4 className="mb-2 font-semibold text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isScrollLink ? (
                      <button
                        onClick={() =>
                          handleScrollToSection(link.href.replace("#", ""))
                        }
                        className="hover:text-foreground cursor-pointer"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link href={link.href} className="hover:text-foreground">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full bg-muted mx-auto px-4 md:px-6 py-4 text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-center gap-3">
        <p>© {year} Tablium</p>
      </div>
    </footer>
  );
}
