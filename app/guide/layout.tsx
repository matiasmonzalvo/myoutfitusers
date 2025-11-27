"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const sections = [
  {
    title: "Getting Started",
    id: "getting-started",
    items: [
      { title: "Introduction", href: "/guide" },
      { title: "Creating Your Avatar", href: "/guide/creating-avatar" },
      {
        title: "Understanding the Platform",
        href: "/guide/understanding-platform",
      },
    ],
  },
  {
    title: "Wearing clothing items",
    id: "tryons",
    items: [
      { title: "Getting started", href: "/guide/start-wearing" },
      { title: "Try-ons", href: "/guide/try-ons" },
      { title: "Partner brands", href: "/guide/partner-brands" },
      { title: "Best practices", href: "/guide/best-practices" },
      { title: "Common issues", href: "/guide/common-issues" },
    ],
  },
];

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Get current page breadcrumb info
  const getCurrentPageInfo = () => {
    for (const section of sections) {
      const item = section.items.find((item) => item.href === pathname);
      if (item) {
        return {
          sectionTitle: section.title,
          pageTitle: item.title,
        };
      }
    }
    return null;
  };

  const pageInfo = getCurrentPageInfo();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="xl:hidden fixed top-[136px] lg:top-40  xl:top-[132px] left-4 lg:left-10 xl:left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-full bg-background"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      <div className="flex max-w-[1800px] mx-auto">
        {/* Sidebar */}
        <aside
          className={`
          fixed xl:fixed top-10 lg:top-18 xl:top-38 left-0 lg:left-0 xl:left-4 h-screen w-64 lg:w-72 pl-0 lg:pl-6 xl:pl-0 xl:w-68 border-r border-border pb-10 lg:pb-18 xl:pb-38 bg-background
          transition-transform duration-300 z-40 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
        `}
        >
          <div className="h-full overflow-y-auto p-4.5 xl:p-6 pt-32 xl:pt-6">
            <Link
              href="/guide"
              className="text-xl font-bold tracking-tight mb-4 block hover:text-primary transition-colors"
            >
              Guide
            </Link>

            <nav className="space-y-6">
              {sections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-sm font-bold text-muted-foreground  mb-2">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`block text-sm transition-colors py-1.5 px-2 font-medium rounded-md hover:bg-muted ${
                            pathname === item.href
                              ? "text-foreground font-medium bg-muted"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Quick Links */}
            <div className="mt-0 pt-6">
              <h3 className="text-sm font-bold text-muted-foreground  mb-2">
                Other Links
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/pricing"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-md hover:bg-muted"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-md hover:bg-muted"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded-md hover:bg-muted"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 xl:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 px-0 xl:px-10 py-10 max-w-4xl xl:ml-[248px]">
          {/* Breadcrumb */}
          {pageInfo && (
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/guide" className="text-muted-foreground">
                      {pageInfo.sectionTitle}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">
                    {pageInfo.pageTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
