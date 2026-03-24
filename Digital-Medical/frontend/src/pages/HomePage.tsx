import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedListings from "@/components/home/FeaturedListings";
import HowItWorks from "@/components/home/HowItWorks";
import ServicesSection from "@/components/home/ServicesSection";
import CampsEventsSection from "@/components/home/CampsEventsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsSection from "@/components/home/NewsSection";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";
import BusinessSection from "@/components/home/BusinessSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <FeaturedListings />
      <HowItWorks />
      <ServicesSection />
      <CampsEventsSection />
      <TestimonialsSection />
      <NewsSection />
      <AppDownloadBanner />
      <BusinessSection />
    </>
  );
}
