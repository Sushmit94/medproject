import type { Category } from "@/types";

export const categories: Category[] = [
  {
    id: 1, name: "Hospitals", slug: "hospitals", icon: "Building2", count: 12400,
    subcategories: [
      { name: "Multi-Speciality", slug: "multi-speciality" },
      { name: "Super-Speciality", slug: "super-speciality" },
      { name: "Government Hospital", slug: "government" },
      { name: "Private Hospital", slug: "private" },
      { name: "Children Hospital", slug: "children" },
      { name: "Maternity Hospital", slug: "maternity" },
    ],
  },
  {
    id: 2, name: "Doctors", slug: "doctors", icon: "Stethoscope", count: 58600,
    subcategories: [
      { name: "Cardiologist", slug: "cardiologist" },
      { name: "Dermatologist", slug: "dermatologist" },
      { name: "Gynecologist", slug: "gynecologist" },
      { name: "Orthopedic", slug: "orthopedic" },
      { name: "Pediatrician", slug: "pediatrician" },
      { name: "Neurologist", slug: "neurologist" },
      { name: "ENT Specialist", slug: "ent" },
      { name: "Dentist", slug: "dentist" },
    ],
  },
  {
    id: 3, name: "Pharmacy", slug: "pharmacy", icon: "Pill", count: 34200,
    subcategories: [
      { name: "24x7 Pharmacy", slug: "24x7" },
      { name: "Online Pharmacy", slug: "online" },
      { name: "Ayurvedic", slug: "ayurvedic" },
      { name: "Homeopathic", slug: "homeopathic" },
    ],
  },
  {
    id: 4, name: "Diagnostics", slug: "diagnostics", icon: "Microscope", count: 8900,
    subcategories: [
      { name: "Pathology Lab", slug: "pathology" },
      { name: "Radiology", slug: "radiology" },
      { name: "MRI / CT Scan", slug: "mri-ct" },
      { name: "Blood Test", slug: "blood-test" },
    ],
  },
  {
    id: 5, name: "Laboratories", slug: "laboratories", icon: "FlaskConical", count: 6500,
    subcategories: [
      { name: "Clinical Lab", slug: "clinical" },
      { name: "Research Lab", slug: "research" },
      { name: "Home Collection", slug: "home-collection" },
    ],
  },
  {
    id: 6, name: "Clinics", slug: "clinics", icon: "Heart", count: 24800,
    subcategories: [
      { name: "Dental Clinic", slug: "dental" },
      { name: "Eye Clinic", slug: "eye" },
      { name: "Skin Clinic", slug: "skin" },
      { name: "IVF Clinic", slug: "ivf" },
    ],
  },
  {
    id: 7, name: "Ambulance", slug: "ambulance", icon: "Siren", count: 3200,
    subcategories: [
      { name: "Emergency", slug: "emergency-ambulance" },
      { name: "Patient Transport", slug: "transport" },
      { name: "Air Ambulance", slug: "air-ambulance" },
    ],
  },
  {
    id: 8, name: "Blood Banks", slug: "blood-banks", icon: "Droplets", count: 2800,
    subcategories: [
      { name: "Government", slug: "govt-blood-bank" },
      { name: "Private", slug: "private-blood-bank" },
      { name: "Red Cross", slug: "red-cross" },
    ],
  },
  {
    id: 9, name: "Nursing", slug: "nursing", icon: "BedDouble", count: 5600,
    subcategories: [
      { name: "Nursing Home", slug: "nursing-home" },
      { name: "Home Nursing", slug: "home-nursing" },
      { name: "Elderly Care", slug: "elderly-care" },
    ],
  },
  {
    id: 10, name: "Optical", slug: "optical", icon: "Eye", count: 9400,
    subcategories: [
      { name: "Optician", slug: "optician" },
      { name: "Eye Hospital", slug: "eye-hospital" },
      { name: "Contact Lens", slug: "contact-lens" },
    ],
  },
  {
    id: 11, name: "Wellness", slug: "wellness", icon: "Leaf", count: 7800,
    subcategories: [
      { name: "Yoga Center", slug: "yoga" },
      { name: "Physiotherapy", slug: "physiotherapy" },
      { name: "Ayurveda", slug: "ayurveda" },
      { name: "Mental Health", slug: "mental-health" },
    ],
  },
  {
    id: 12, name: "Medical Store", slug: "medical-store", icon: "ShoppingBag", count: 18700,
    subcategories: [
      { name: "Wholesale", slug: "wholesale" },
      { name: "Surgical Supply", slug: "surgical" },
      { name: "Equipment", slug: "equipment" },
    ],
  },
];

export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);

export const getAllCategorySlugs = () => categories.map((c) => c.slug);
