import { unstable_cache } from "next/cache";
import { supabaseConfigured, supabasePublic } from "./supabase";
import { demoExperience, demoProfile, demoProjects, demoSkills } from "./demo-data";
import type { Experience, Profile, Project, Skill } from "./types";

// Har bir bo'lim o'z tag'i bilan keshlanadi — bot o'zgartirganda revalidateTag(tag)
// chaqiriladi va sahifa yangilanadi. Free tier limitlarini tejaydi.

export const CACHE_TAGS = {
  profile: "profile",
  projects: "projects",
  skills: "skills",
  experience: "experience",
} as const;

export const getProfile = unstable_cache(
  async (): Promise<Profile> => {
    if (!supabaseConfigured) return demoProfile;
    const { data, error } = await supabasePublic()
      .from("profile")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) return demoProfile;
    return data as Profile;
  },
  ["profile"],
  { tags: [CACHE_TAGS.profile] }
);

export const getProjects = unstable_cache(
  async (): Promise<Project[]> => {
    if (!supabaseConfigured) return demoProjects;
    const { data, error } = await supabasePublic()
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    // Migratsiya o'tkazilmagan bazada image_urls hali bo'lmasligi mumkin
    return (data as Project[]).map((p) => ({ ...p, image_urls: p.image_urls ?? [] }));
  },
  ["projects"],
  { tags: [CACHE_TAGS.projects] }
);

export const getSkills = unstable_cache(
  async (): Promise<Skill[]> => {
    if (!supabaseConfigured) return demoSkills;
    const { data, error } = await supabasePublic()
      .from("skills")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error || !data) return [];
    return data as Skill[];
  },
  ["skills"],
  { tags: [CACHE_TAGS.skills] }
);

export const getExperience = unstable_cache(
  async (): Promise<Experience[]> => {
    if (!supabaseConfigured) return demoExperience;
    const { data, error } = await supabasePublic()
      .from("experience")
      .select("*")
      .order("start_date", { ascending: false })
      .order("sort_order", { ascending: true });
    if (error || !data) return [];
    return data as Experience[];
  },
  ["experience"],
  { tags: [CACHE_TAGS.experience] }
);
