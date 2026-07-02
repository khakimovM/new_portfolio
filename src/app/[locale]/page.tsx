import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import OrderContact from "@/components/sections/OrderContact";
import { getExperience, getProfile, getProjects, getSkills } from "@/lib/data";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [profile, skills, projects, experience] = await Promise.all([
    getProfile(),
    getSkills(),
    getProjects(),
    getExperience(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero profile={profile} skills={skills} />
        <About profile={profile} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Experience items={experience} />
        <OrderContact />
      </main>
      <Footer profile={profile} />
    </>
  );
}
