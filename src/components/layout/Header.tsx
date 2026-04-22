"use client";

import { Settings, Moon, Sun } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { HelpDropdown } from "./HelpDropdown";
import { AboutModal } from "./AboutModal";
import { ProviderSelector } from "./ProviderSelector";
import { getGroupLabel, type TabId } from "./TabNav";

interface HeaderProps {
  activeTab?: TabId;
}

export function Header({ activeTab }: HeaderProps) {
  const { settings, toggleDarkMode, setSettingsOpen } = useSettings();
  const viewLabel = activeTab ? getGroupLabel(activeTab) : "";

  return (
    <header className="border-b border-parchment-dark px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Vector Lab family branding */}
        <a
          href="https://vector-lab-tools.github.io"
          target="_blank"
          rel="noopener noreferrer"
          title="Part of the Vector Lab"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/vector-lab-logo-mark.svg"
            alt=""
            aria-hidden="true"
            width={22}
            height={22}
            className="block opacity-70"
          />
          <span className="font-sans text-caption font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Vector Lab
          </span>
        </a>

        <span className="h-6 w-px bg-parchment-dark" aria-hidden="true" />

        {/* Tool branding */}
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/vector-lab-manifold-atlas.svg"
            alt=""
            aria-hidden="true"
            width={26}
            height={26}
            className="block flex-shrink-0"
          />
          <h1 className="font-display text-display-md font-bold text-burgundy tracking-tight leading-none">
            Manifold Atlas
          </h1>
        </div>

        {viewLabel && (
          <>
            <span className="h-6 w-px bg-parchment-dark" aria-hidden="true" />
            <span className="font-sans text-body-sm text-muted-foreground">
              {viewLabel}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ProviderSelector />
        <AboutModal />
        <HelpDropdown />
        <button
          onClick={toggleDarkMode}
          className="btn-editorial-ghost px-3 py-2"
          aria-label="Toggle dark mode"
        >
          {settings.darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="btn-editorial-secondary px-3 py-2"
        >
          <Settings size={16} className="mr-2" />
          <span className="font-sans text-body-sm">Settings</span>
        </button>
      </div>
    </header>
  );
}
