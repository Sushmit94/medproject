import type { BloodDonor, BloodRequest } from "@/types";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const bloodDonors: BloodDonor[] = [
  { id: 1, name: "Amit Verma", bloodGroup: "O+", city: "Delhi", phone: "+91-98765-43210", lastDonated: "Jan 2026", available: true, totalDonations: 12 },
  { id: 2, name: "Sneha Reddy", bloodGroup: "A+", city: "Hyderabad", phone: "+91-87654-32109", lastDonated: "Dec 2025", available: true, totalDonations: 8 },
  { id: 3, name: "Ravi Kumar", bloodGroup: "B+", city: "Mumbai", phone: "+91-76543-21098", lastDonated: "Feb 2026", available: true, totalDonations: 15 },
  { id: 4, name: "Anjali Nair", bloodGroup: "AB+", city: "Chennai", phone: "+91-65432-10987", lastDonated: "Nov 2025", available: true, totalDonations: 5 },
  { id: 5, name: "Vikram Singh", bloodGroup: "O-", city: "Delhi", phone: "+91-54321-09876", lastDonated: "Jan 2026", available: false, totalDonations: 20 },
  { id: 6, name: "Megha Joshi", bloodGroup: "A-", city: "Pune", phone: "+91-43210-98765", lastDonated: "Feb 2026", available: true, totalDonations: 6 },
  { id: 7, name: "Suresh Patel", bloodGroup: "B-", city: "Ahmedabad", phone: "+91-32109-87654", lastDonated: "Dec 2025", available: true, totalDonations: 9 },
  { id: 8, name: "Deepika Das", bloodGroup: "AB-", city: "Kolkata", phone: "+91-21098-76543", lastDonated: "Jan 2026", available: true, totalDonations: 3 },
];

export const bloodRequests: BloodRequest[] = [
  { id: 1, patientName: "Ramesh Iyer", bloodGroup: "O-", units: 3, hospital: "Apollo Hospital, Chennai", city: "Chennai", contact: "+91-99887-76655", urgency: "critical", postedAt: "2 hours ago" },
  { id: 2, patientName: "Fatima Khan", bloodGroup: "AB+", units: 2, hospital: "Fortis Hospital, Mumbai", city: "Mumbai", contact: "+91-88776-65544", urgency: "urgent", postedAt: "5 hours ago" },
  { id: 3, patientName: "Arjun Mehta", bloodGroup: "B+", units: 1, hospital: "AIIMS, Delhi", city: "Delhi", contact: "+91-77665-54433", urgency: "normal", postedAt: "1 day ago" },
];

export const getDonorsByBloodGroup = (group: string) =>
  bloodDonors.filter((d) => d.bloodGroup === group);

export const getAvailableDonors = () =>
  bloodDonors.filter((d) => d.available);

export const getActiveRequests = () => bloodRequests;
