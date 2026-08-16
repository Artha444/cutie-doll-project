"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface SiteContactSettings {
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  location: string;
}

export const DEFAULT_CONTACT_SETTINGS: SiteContactSettings = {
  whatsappNumber: "6281545585448",
  whatsappDisplay: "+62 815-4558-5448",
  email: "simoengil@gmail.com",
  location: "Kab. Bandung, Jawa Barat",
};

interface SiteSettingsContextType {
  settings: SiteContactSettings;
  updateSettings: (newSettings: Partial<SiteContactSettings>) => Promise<boolean>;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_CONTACT_SETTINGS,
  updateSettings: async () => false,
  isLoading: false,
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteContactSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("simoengil_site_contact");
        if (cached) {
          const parsed = JSON.parse(cached);
          return { ...DEFAULT_CONTACT_SETTINGS, ...parsed };
        }
      } catch (e) {
        console.error("Failed to load cached site contact settings", e);
      }
    }
    return DEFAULT_CONTACT_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("settings")
        .eq("id", "contact")
        .maybeSingle();

      if (!error && data && data.settings) {
        const merged = { ...DEFAULT_CONTACT_SETTINGS, ...data.settings };
        setSettings(merged);
        if (typeof window !== "undefined") {
          localStorage.setItem("simoengil_site_contact", JSON.stringify(merged));
        }
      }
    } catch (e) {
      console.warn("Could not fetch site settings from Supabase, using cache/defaults", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem("simoengil_site_contact");
        if (cached) {
          const parsed = JSON.parse(cached);
          setSettings({ ...DEFAULT_CONTACT_SETTINGS, ...parsed });
        }
      } catch (e) {}
      fetchSettings();
    };

    window.addEventListener("site_settings_updated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "simoengil_site_contact") handleUpdate();
    });

    return () => {
      window.removeEventListener("site_settings_updated", handleUpdate);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<SiteContactSettings>): Promise<boolean> => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("simoengil_site_contact", JSON.stringify(updated));
      window.dispatchEvent(new Event("site_settings_updated"));
    }

    try {
      const { error } = await supabase.from("site_settings").upsert({
        id: "contact",
        settings: updated,
      });

      if (error) {
        console.warn("Failed to persist site settings to Supabase:", error);
      }
      return true;
    } catch (e) {
      console.error("Error saving site settings to Supabase:", e);
      return true;
    }
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
