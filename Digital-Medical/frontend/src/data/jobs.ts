import type { Job } from "@/types";

export const jobCategories = ["All", "Doctor", "Nurse", "Technician", "Pharmacist", "Admin", "Community Health"];

export const jobs: Job[] = [
  {
    id: 1, title: "Senior Cardiologist", slug: "senior-cardiologist-apollo",
    employer: "Apollo Hospitals", employerLogo: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=100",
    category: "Doctor", type: "Full Time", location: "Delhi",
    experience: "10+ years", qualification: "DM Cardiology",
    salary: "₹3,00,000 – ₹5,00,000 / month", description: "Looking for an experienced cardiologist for our flagship Delhi center.",
    responsibilities: ["OPD consultations", "Cardiac catheterization", "Teaching and mentoring residents", "Research publications"],
    requirements: ["DM Cardiology from a recognized institute", "Valid MCI registration", "10+ years of experience"],
    benefits: ["Health insurance for family", "Academic allowance", "Conference sponsorship", "Housing"],
    applicationDeadline: "April 30, 2026", featured: true, postedAt: "March 1, 2026",
  },
  {
    id: 2, title: "ICU Staff Nurse", slug: "icu-nurse-fortis",
    employer: "Fortis Healthcare", employerLogo: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100",
    category: "Nurse", type: "Full Time", location: "Mumbai",
    experience: "3+ years", qualification: "B.Sc Nursing + ICU experience",
    salary: "₹35,000 – ₹55,000 / month", description: "Hiring experienced ICU nurses for our Mumbai center.",
    responsibilities: ["Patient monitoring", "Ventilator management", "Medication administration", "Documentation"],
    requirements: ["B.Sc Nursing", "3+ years ICU experience", "BLS/ACLS certified"],
    benefits: ["EPF + ESI", "Quarterly bonus", "Free meals", "Transport allowance"],
    applicationDeadline: "April 15, 2026", featured: true, postedAt: "Feb 28, 2026",
  },
  {
    id: 3, title: "Radiologist", slug: "radiologist-lal-pathlabs",
    employer: "Dr. Lal PathLabs", employerLogo: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=100",
    category: "Technician", type: "Full Time", location: "Delhi",
    experience: "5+ years", qualification: "MD Radiology",
    salary: "₹1,50,000 – ₹2,50,000 / month", description: "Seeking a radiologist for our expanding diagnostic center network.",
    responsibilities: ["CT/MRI interpretation", "Ultrasound procedures", "Reporting", "Quality assurance"],
    requirements: ["MD Radiology", "5+ years experience", "AERB certification"],
    benefits: ["Health insurance", "Performance bonus", "Flexible schedule"],
    applicationDeadline: "April 20, 2026", featured: false, postedAt: "Feb 25, 2026",
  },
  {
    id: 4, title: "Clinical Pharmacist", slug: "pharmacist-medplus",
    employer: "MedPlus Pharmacy", employerLogo: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=100",
    category: "Pharmacist", type: "Full Time", location: "Hyderabad",
    experience: "2+ years", qualification: "Pharm.D / M.Pharm",
    salary: "₹25,000 – ₹40,000 / month", description: "Looking for clinical pharmacists for our Hyderabad retail chain.",
    responsibilities: ["Prescription verification", "Drug interaction checks", "Patient counseling", "Inventory management"],
    requirements: ["Pharm.D or M.Pharm", "Registered pharmacist", "2+ years retail experience"],
    benefits: ["EPF", "Performance incentive", "Training programs"],
    applicationDeadline: "April 10, 2026", featured: false, postedAt: "Feb 22, 2026",
  },
  {
    id: 5, title: "Hospital Administrator", slug: "hospital-admin-narayana",
    employer: "Narayana Health", employerLogo: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=100",
    category: "Admin", type: "Full Time", location: "Bangalore",
    experience: "8+ years", qualification: "MBA Healthcare / MHA",
    salary: "₹1,20,000 – ₹2,00,000 / month", description: "Senior administrative role for our Bangalore health city campus.",
    responsibilities: ["Operations management", "P&L responsibility", "Staff coordination", "Quality compliance"],
    requirements: ["MBA Healthcare or MHA", "8+ years in hospital administration", "NABH experience preferred"],
    benefits: ["Health insurance", "Car allowance", "Annual bonus", "Stock options"],
    applicationDeadline: "April 25, 2026", featured: false, postedAt: "Feb 20, 2026",
  },
  {
    id: 6, title: "ASHA Worker Coordinator", slug: "asha-coordinator-nhm",
    employer: "National Health Mission", employerLogo: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=100",
    category: "Community Health", type: "Contract", location: "Pan India",
    experience: "2+ years", qualification: "Graduate + Public Health training",
    salary: "₹18,000 – ₹25,000 / month", description: "Coordinate ASHA worker activities across assigned district.",
    responsibilities: ["ASHA training coordination", "Field monitoring", "Data collection", "Reporting to DHO"],
    requirements: ["Graduate degree", "Public health training", "2+ years community health experience"],
    benefits: ["Government benefits", "Travel allowance", "Training opportunities"],
    applicationDeadline: "May 1, 2026", featured: false, postedAt: "Feb 18, 2026",
  },
];

export const getActiveJobs = () => jobs;
export const getFeaturedJobs = () => jobs.filter((j) => j.featured);
