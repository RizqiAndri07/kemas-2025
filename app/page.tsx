import AboutSection from "@/components/home/AboutSection";
import HeroSection from "@/components/home/HeroSection";
import Join from "@/components/home/Join";
import WhatsNew from "@/components/home/WhatsNew";

export default function Home() {
  return (
    <div className=" bg-radial">
      <HeroSection />
      <AboutSection />
      <WhatsNew />
      <Join />
    </div>
  );
}
