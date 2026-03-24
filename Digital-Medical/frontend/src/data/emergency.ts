import type { EmergencyNumber, AmbulanceProvider, OxygenProvider, HealthDepartment } from "@/types";

export const nationalEmergencyNumbers: EmergencyNumber[] = [
  { id: 1, name: "Ambulance", number: "108", description: "Free ambulance for medical emergencies", icon: "Siren", available: "24/7" },
  { id: 2, name: "Police", number: "100", description: "Police emergency helpline", icon: "Shield", available: "24/7" },
  { id: 3, name: "Fire", number: "101", description: "Fire brigade emergency", icon: "Flame", available: "24/7" },
  { id: 4, name: "Universal Emergency", number: "112", description: "Single emergency number for all services", icon: "Phone", available: "24/7" },
  { id: 5, name: "Women Helpline", number: "1091", description: "Women's safety and assistance", icon: "Heart", available: "24/7" },
  { id: 6, name: "Child Helpline", number: "1098", description: "Child protection and assistance", icon: "Baby", available: "24/7" },
  { id: 7, name: "Disaster Mgmt", number: "1070", description: "National Disaster Management", icon: "AlertTriangle", available: "24/7" },
  { id: 8, name: "Mental Health", number: "08046110007", description: "iCall – TISS mental health support", icon: "Brain", available: "Mon–Sat 8AM–10PM" },
];

export const ambulanceProviders: AmbulanceProvider[] = [
  {
    id: 1, name: "StanPlus Ambulance", phone: "1800-123-2020", city: "Pan India",
    responseTime: "8 min avg", price: "₹1,500 – ₹5,000", rating: 4.6,
    image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=600",
    features: ["GPS tracking", "ICU on wheels", "Doctor on board", "24/7 availability"],
  },
  {
    id: 2, name: "Ziqitza Healthcare", phone: "102", city: "Pan India",
    responseTime: "12 min avg", price: "Free (Govt)", rating: 4.2,
    image: "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=600",
    features: ["Free service", "Government operated", "BLS equipped", "Trained paramedics"],
  },
  {
    id: 3, name: "Apollo Emergency", phone: "1066", city: "Major Cities",
    responseTime: "10 min avg", price: "₹2,000 – ₹8,000", rating: 4.7,
    image: "https://images.unsplash.com/photo-1619468129361-605ebea04b44?w=600",
    features: ["ALS ambulance", "Cardiac monitor", "Ventilator support", "Pan-city coverage"],
  },
];

export const oxygenProviders: OxygenProvider[] = [
  { id: 1, name: "Linde India Ltd", phone: "+91-22-24927000", city: "Pan India", available: true, type: "Industrial & Medical", price: "₹500 – ₹2,000 / cylinder" },
  { id: 2, name: "INOX Air Products", phone: "+91-22-66117500", city: "Pan India", available: true, type: "Medical Oxygen", price: "₹400 – ₹1,800 / cylinder" },
  { id: 3, name: "OxygenForIndia", phone: "1800-599-0606", city: "Pan India", available: true, type: "Concentrators + Cylinders", price: "Free (NGO Supported)" },
];

export const healthDepartments: HealthDepartment[] = [
  {
    id: 1, name: "ASHA Workers", ministry: "Ministry of Health & Family Welfare", icon: "HeartHandshake",
    description: "Accredited Social Health Activists who serve as community health workers linking villages with health facilities.",
    role: ["Health education", "Immunization drives", "Maternal care", "Disease surveillance"],
    helpline: "104", website: "https://nhm.gov.in", count: "10.7 lakh+",
    stateData: [{ state: "UP", count: 158000 }, { state: "Bihar", count: 89000 }, { state: "MP", count: 72000 }],
  },
  {
    id: 2, name: "Anganwadi Centers", ministry: "Ministry of Women & Child Development", icon: "Baby",
    description: "Government-run centers providing nutrition, health check-ups, and pre-school education for children under 6.",
    role: ["Supplementary nutrition", "Health check-ups", "Pre-school education", "Growth monitoring"],
    helpline: "181", website: "https://wcd.nic.in", count: "13.9 lakh+",
    stateData: [{ state: "UP", count: 190000 }, { state: "Bihar", count: 115000 }, { state: "Rajasthan", count: 62000 }],
  },
  {
    id: 3, name: "PM-JAY (Ayushman Bharat)", ministry: "National Health Authority", icon: "ShieldCheck",
    description: "World's largest government health insurance scheme covering ₹5 lakh per family per year for secondary and tertiary care.",
    role: ["Cashless treatment", "Hospital empanelment", "Grievance redressal", "Beneficiary identification"],
    helpline: "14555", website: "https://pmjay.gov.in", count: "55 Cr+ beneficiaries",
  },
  {
    id: 4, name: "District Health Officers", ministry: "State Health Departments", icon: "Building",
    description: "Administrative heads overseeing public health services, hospitals, and community health programs at district level.",
    role: ["Disease control", "Hospital supervision", "Budget management", "Epidemic response"],
    website: "https://mohfw.gov.in", count: "780 districts",
  },
  {
    id: 5, name: "National TB Programme (NTEP)", ministry: "Central TB Division", icon: "Lungs",
    description: "India's flagship programme to eliminate tuberculosis by 2025 through free diagnosis and treatment.",
    role: ["Free TB testing", "DOTS therapy", "Contact tracing", "Drug-resistant TB treatment"],
    helpline: "1800-11-6666", website: "https://tbcindia.gov.in", count: "24 lakh+ treated annually",
  },
];
