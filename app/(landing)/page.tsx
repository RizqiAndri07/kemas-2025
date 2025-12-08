import AboutSection from "@/components/home/AboutSection";
import HeroSection from "@/components/home/HeroSection";
import Join from "@/components/home/Join";
import Timeline from "@/components/home/Timeline";
import WhatsNew from "@/components/home/WhatsNew";

export default function Home() {
  return (
    <div className="space-y-20">
      <HeroSection />
      <AboutSection />
      <WhatsNew />
      <Timeline />
      <Join />
    </div>
  );
}
