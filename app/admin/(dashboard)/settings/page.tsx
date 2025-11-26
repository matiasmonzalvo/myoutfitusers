"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your dashboard preferences
          </p>
        </div>

        {/* Theme Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight mb-1">
              Appearance
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose how the dashboard looks to you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <Sun className="h-8 w-8 text-amber-500" />
              </div>
              <div className="text-center">
                <div className="font-medium">Light</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Bright and clean
                </div>
              </div>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                theme === "dark"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <Moon className="h-8 w-8 text-blue-400" />
              </div>
              <div className="text-center">
                <div className="font-medium">Dark</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Easy on the eyes
                </div>
              </div>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                theme === "system"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <Monitor className="h-8 w-8 text-foreground" />
              </div>
              <div className="text-center">
                <div className="font-medium">System</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Follows device
                </div>
              </div>
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            {theme === "system"
              ? "Theme will automatically switch based on your device settings."
              : theme === "light"
                ? "Using light theme."
                : "Using dark theme."}
          </p>
        </div>
      </div>
    </div>
  );
}

