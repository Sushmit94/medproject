import type { EventItem } from "@/types";

export const events: EventItem[] = [
  {
    id: 1, title: "Free Cardiac Screening Camp", slug: "free-cardiac-camp-delhi",
    organizer: "Apollo Hospitals", type: "camp",
    date: "March 15, 2026", time: "9:00 AM – 4:00 PM",
    venue: "Apollo Hospital, Sarita Vihar", city: "Delhi",
    description: "Free cardiac check-up including ECG, blood pressure, and consultation with a cardiologist for all age groups.",
    services: ["ECG", "Blood Pressure Check", "Cholesterol Test", "Cardiologist Consultation"],
    registrationRequired: true, isPaid: false, sponsored: true,
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600",
  },
  {
    id: 2, title: "Diabetes Awareness Workshop", slug: "diabetes-workshop-mumbai",
    organizer: "Fortis Healthcare", type: "workshop",
    date: "March 20, 2026", time: "10:00 AM – 1:00 PM",
    venue: "Fortis Hospital, Mulund", city: "Mumbai",
    description: "Interactive workshop on diabetes management with free HbA1c testing and nutritional counseling.",
    services: ["HbA1c Testing", "Diet Counseling", "Diabetes Education", "Free Medicines Sample"],
    registrationRequired: true, isPaid: false, sponsored: false,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600",
  },
  {
    id: 3, title: "Blood Donation Drive", slug: "blood-donation-bangalore",
    organizer: "Indian Red Cross Society", type: "event",
    date: "March 25, 2026", time: "8:00 AM – 5:00 PM",
    venue: "Town Hall, M.G. Road", city: "Bangalore",
    description: "Annual blood donation drive. Every donor receives a health check-up and certificate of appreciation.",
    services: ["Blood Donation", "Health Check-up", "Blood Group Test"],
    registrationRequired: false, isPaid: false, sponsored: false,
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600",
  },
  {
    id: 4, title: "Free Eye Screening Camp", slug: "eye-camp-chennai",
    organizer: "Sankara Nethralaya", type: "camp",
    date: "April 2, 2026", time: "9:00 AM – 3:00 PM",
    venue: "Sankara Nethralaya, Nungambakkam", city: "Chennai",
    description: "Comprehensive eye screening with free spectacles distribution for eligible patients.",
    services: ["Vision Test", "Cataract Screening", "Glaucoma Check", "Free Spectacles"],
    registrationRequired: true, isPaid: false, sponsored: true,
    image: "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=600",
  },
  {
    id: 5, title: "Digital Health Summit 2026", slug: "digital-health-summit",
    organizer: "NASSCOM Health-Tech", type: "event",
    date: "April 10–11, 2026", time: "9:00 AM – 6:00 PM",
    venue: "Hyderabad International Convention Centre", city: "Hyderabad",
    description: "India's premier health-tech event bringing together startups, hospitals, and policymakers.",
    services: ["Keynote Sessions", "Panel Discussions", "Startup Showcase", "Networking"],
    registrationRequired: true, isPaid: true, price: 2500, sponsored: true,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
  },
  {
    id: 6, title: "Free Dental Check-up Camp", slug: "dental-camp-pune",
    organizer: "Dental Council of India", type: "camp",
    date: "April 18, 2026", time: "10:00 AM – 2:00 PM",
    venue: "Sassoon General Hospital", city: "Pune",
    description: "Free dental check-up and oral hygiene education for children and adults.",
    services: ["Dental Check-up", "Oral Cancer Screening", "Fluoride Treatment", "Dental Hygiene Kit"],
    registrationRequired: false, isPaid: false, sponsored: false,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600",
  },
];

export const getUpcomingEvents = () => events;
export const getFeaturedEvents = () => events.filter((e) => e.sponsored);
