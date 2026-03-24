import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ── Super Admin ──
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { phone: "9812697469" },
    update: {},
    create: {
      name: "Super Admin",
      phone: "9812697469",
      email: "admin@digitalmedical.in",
      password: adminPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      phoneVerified: true,
    },
  });
  console.log("  ✓ Super admin created");

  // ── Categories ──
  const categories = [
    { name: "Hospitals / Clinics", slug: "hospitals-clinics", sortOrder: 1, hasDealsIn: false, hasProducts: false, hasServices: true },
    { name: "Doctors", slug: "doctors", sortOrder: 2, hasDealsIn: false, hasProducts: false, hasServices: true },
    { name: "Medicals", slug: "medicals", sortOrder: 3, hasDealsIn: true, hasProducts: true, hasServices: true },
    { name: "Diagnostics", slug: "diagnostics", sortOrder: 4, hasDealsIn: false, hasProducts: false, hasServices: true },
    { name: "Laboratories", slug: "laboratories", sortOrder: 5, hasDealsIn: false, hasProducts: false, hasServices: true },
    { name: "Opticals", slug: "opticals", sortOrder: 6, hasDealsIn: true, hasProducts: true, hasServices: true },
    { name: "Health Service Providers", slug: "health-service-providers", sortOrder: 7, hasDealsIn: false, hasProducts: false, hasServices: true },
    { name: "Associations & NGOs", slug: "associations-ngos", sortOrder: 8, hasDealsIn: false, hasProducts: false, hasServices: false },
    { name: "Pharmacists", slug: "pharmacists", sortOrder: 9, hasDealsIn: true, hasProducts: true, hasServices: true },
    { name: "Medical Institutes", slug: "medical-institutes", sortOrder: 10, hasDealsIn: false, hasProducts: false, hasServices: true },
    { name: "Medical Representatives", slug: "medical-representatives", sortOrder: 11, hasDealsIn: false, hasProducts: false, hasServices: false },
    { name: "Wholesalers", slug: "wholesalers", sortOrder: 12, hasDealsIn: true, hasProducts: true, hasServices: false },
    { name: "Manufacturers", slug: "manufacturers", sortOrder: 13, hasDealsIn: true, hasProducts: true, hasServices: false },
    { name: "Emergency Services", slug: "emergency-services", sortOrder: 14, isService: true, hasDealsIn: false, hasProducts: false, hasServices: true },
    { name: "Health Department", slug: "health-department", sortOrder: 15, isService: true, hasDealsIn: false, hasProducts: false, hasServices: false },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { hasDealsIn: cat.hasDealsIn, hasProducts: cat.hasProducts, hasServices: cat.hasServices },
      create: cat,
    });
  }
  console.log("  ✓ 15 categories created/updated with feature flags");

  // ── Product Categories per main category ──
  const productCategories: { categorySlug: string; items: { name: string; slug: string; sortOrder: number }[] }[] = [
    {
      categorySlug: "medicals",
      items: [
        { name: "Allopathic Medicines", slug: "allopathic-medicines", sortOrder: 1 },
        { name: "Ayurvedic & Herbal", slug: "ayurvedic-herbal", sortOrder: 2 },
        { name: "Homeopathic", slug: "homeopathic", sortOrder: 3 },
        { name: "OTC Products", slug: "otc-products", sortOrder: 4 },
        { name: "Surgical Items", slug: "surgical-items", sortOrder: 5 },
        { name: "Baby Care", slug: "baby-care", sortOrder: 6 },
        { name: "Nutrition & Supplements", slug: "nutrition-supplements", sortOrder: 7 },
        { name: "Personal Care", slug: "personal-care", sortOrder: 8 },
        { name: "Medical Devices", slug: "medical-devices", sortOrder: 9 },
        { name: "Veterinary", slug: "veterinary", sortOrder: 10 },
      ],
    },
    {
      categorySlug: "opticals",
      items: [
        { name: "Eyeglasses", slug: "eyeglasses", sortOrder: 1 },
        { name: "Sunglasses", slug: "sunglasses", sortOrder: 2 },
        { name: "Contact Lenses", slug: "contact-lenses", sortOrder: 3 },
        { name: "Lens Solutions", slug: "lens-solutions", sortOrder: 4 },
        { name: "Frames", slug: "frames", sortOrder: 5 },
        { name: "Reading Glasses", slug: "reading-glasses", sortOrder: 6 },
      ],
    },
    {
      categorySlug: "wholesalers",
      items: [
        { name: "Allopathic Medicines", slug: "allopathic-medicines", sortOrder: 1 },
        { name: "Ayurvedic Products", slug: "ayurvedic-products", sortOrder: 2 },
        { name: "Surgical & Disposables", slug: "surgical-disposables", sortOrder: 3 },
        { name: "OTC & FMCG", slug: "otc-fmcg", sortOrder: 4 },
        { name: "Medical Equipment", slug: "medical-equipment", sortOrder: 5 },
      ],
    },
    {
      categorySlug: "manufacturers",
      items: [
        { name: "Tablets & Capsules", slug: "tablets-capsules", sortOrder: 1 },
        { name: "Syrups & Suspensions", slug: "syrups-suspensions", sortOrder: 2 },
        { name: "Injectables", slug: "injectables", sortOrder: 3 },
        { name: "Ointments & Creams", slug: "ointments-creams", sortOrder: 4 },
        { name: "Surgical Items", slug: "surgical-items", sortOrder: 5 },
        { name: "Ayurvedic", slug: "ayurvedic", sortOrder: 6 },
      ],
    },
    {
      categorySlug: "pharmacists",
      items: [
        { name: "Allopathic Medicines", slug: "allopathic-medicines", sortOrder: 1 },
        { name: "Ayurvedic & Herbal", slug: "ayurvedic-herbal", sortOrder: 2 },
        { name: "OTC Products", slug: "otc-products", sortOrder: 3 },
        { name: "Surgical Items", slug: "surgical-items", sortOrder: 4 },
        { name: "Baby Care", slug: "baby-care", sortOrder: 5 },
      ],
    },
  ];

  for (const pc of productCategories) {
    const cat = await prisma.category.findUnique({ where: { slug: pc.categorySlug } });
    if (!cat) continue;
    for (const item of pc.items) {
      await prisma.productCategory.upsert({
        where: { slug_categoryId: { slug: item.slug, categoryId: cat.id } },
        update: {},
        create: { ...item, categoryId: cat.id },
      });
    }
  }
  console.log("  ✓ Product categories seeded");

  // ── All Indian States & Union Territories (Pan India) ──
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // Union Territories
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
  ];

  for (const name of states) {
    await prisma.state.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`  ✓ ${states.length} states/UTs seeded`);

  // ── Default Location: Haryana → Sirsa (sample data) ──
  const haryana = await prisma.state.findUnique({ where: { name: "Haryana" } });

  const sirsa = await prisma.district.upsert({
    where: { name_stateId: { name: "Sirsa", stateId: haryana!.id } },
    update: {},
    create: { name: "Sirsa", stateId: haryana!.id },
  });

  const sirsaCity = await prisma.city.upsert({
    where: { name_districtId: { name: "Sirsa", districtId: sirsa.id } },
    update: {},
    create: { name: "Sirsa", districtId: sirsa.id },
  });

  // Common areas in Sirsa
  const areas = [
    "Huda Sector 1", "Huda Sector 2", "Huda Sector 13", "Huda Sector 14",
    "Huda Sector 17", "Huda Sector 20", "Surkhab Chowk", "Dabwali Road",
    "Barnala Road", "Hisar Road", "Ellenabad Road", "DC Colony",
    "Model Town", "Nehru Nagar", "Rani Talaab", "Subhash Nagar",
  ];

  for (const area of areas) {
    await prisma.area.upsert({
      where: { name_cityId: { name: area, cityId: sirsaCity.id } },
      update: {},
      create: { name: area, cityId: sirsaCity.id },
    });
  }
  console.log("  ✓ Default location seeded (Haryana > Sirsa)");

  // ── Major Districts & Cities for key states ──
  const stateDistrictsCities: Record<string, Record<string, string[]>> = {
    "Delhi": {
      "New Delhi": ["New Delhi", "Connaught Place", "Karol Bagh"],
      "Central Delhi": ["Chandni Chowk", "Daryaganj"],
      "South Delhi": ["Saket", "Hauz Khas", "Mehrauli"],
      "East Delhi": ["Preet Vihar", "Laxmi Nagar"],
      "West Delhi": ["Rajouri Garden", "Janakpuri"],
      "North Delhi": ["Civil Lines", "Model Town"],
    },
    "Maharashtra": {
      "Mumbai": ["Mumbai", "Andheri", "Borivali", "Dadar", "Bandra"],
      "Pune": ["Pune", "Kothrud", "Hadapsar", "Hinjewadi"],
      "Nagpur": ["Nagpur", "Sitabuldi", "Dharampeth"],
      "Thane": ["Thane", "Kalyan", "Dombivli"],
      "Nashik": ["Nashik", "Panchavati"],
      "Aurangabad": ["Aurangabad", "Cidco"],
    },
    "Karnataka": {
      "Bengaluru Urban": ["Bengaluru", "Whitefield", "Electronic City", "Koramangala"],
      "Mysuru": ["Mysuru", "Vijayanagar"],
      "Mangaluru": ["Mangaluru", "Surathkal"],
      "Hubballi-Dharwad": ["Hubballi", "Dharwad"],
    },
    "Tamil Nadu": {
      "Chennai": ["Chennai", "T. Nagar", "Adyar", "Anna Nagar", "Velachery"],
      "Coimbatore": ["Coimbatore", "Gandhipuram", "RS Puram"],
      "Madurai": ["Madurai", "Anna Nagar"],
      "Tiruchirappalli": ["Tiruchirappalli", "Srirangam"],
      "Salem": ["Salem"],
    },
    "Uttar Pradesh": {
      "Lucknow": ["Lucknow", "Gomti Nagar", "Hazratganj", "Aliganj"],
      "Noida": ["Noida", "Greater Noida"],
      "Ghaziabad": ["Ghaziabad", "Indirapuram"],
      "Kanpur": ["Kanpur"],
      "Varanasi": ["Varanasi", "Sigra"],
      "Agra": ["Agra", "Tajganj"],
      "Prayagraj": ["Prayagraj", "Civil Lines"],
      "Meerut": ["Meerut"],
    },
    "Gujarat": {
      "Ahmedabad": ["Ahmedabad", "Maninagar", "Navrangpura", "Satellite"],
      "Surat": ["Surat", "Adajan", "Vesu"],
      "Vadodara": ["Vadodara", "Alkapuri"],
      "Rajkot": ["Rajkot"],
      "Gandhinagar": ["Gandhinagar"],
    },
    "Rajasthan": {
      "Jaipur": ["Jaipur", "Malviya Nagar", "Vaishali Nagar", "C-Scheme"],
      "Jodhpur": ["Jodhpur", "Paota"],
      "Udaipur": ["Udaipur", "Hiran Magri"],
      "Kota": ["Kota"],
      "Ajmer": ["Ajmer"],
      "Bikaner": ["Bikaner"],
    },
    "West Bengal": {
      "Kolkata": ["Kolkata", "Salt Lake", "New Town", "Park Street"],
      "Howrah": ["Howrah"],
      "North 24 Parganas": ["Barrackpore", "Barasat"],
      "Darjeeling": ["Siliguri", "Darjeeling"],
    },
    "Telangana": {
      "Hyderabad": ["Hyderabad", "Banjara Hills", "Gachibowli", "Madhapur", "Secunderabad"],
      "Rangareddy": ["Shamshabad", "LB Nagar"],
      "Warangal": ["Warangal"],
      "Nizamabad": ["Nizamabad"],
    },
    "Kerala": {
      "Thiruvananthapuram": ["Thiruvananthapuram", "Technopark"],
      "Ernakulam": ["Kochi", "Edappally", "Kakkanad"],
      "Kozhikode": ["Kozhikode", "Mavoor Road"],
      "Thrissur": ["Thrissur"],
      "Malappuram": ["Malappuram"],
    },
    "Punjab": {
      "Ludhiana": ["Ludhiana", "Sarabha Nagar"],
      "Amritsar": ["Amritsar", "Lawrence Road"],
      "Jalandhar": ["Jalandhar", "Model Town"],
      "Patiala": ["Patiala"],
      "Mohali": ["Mohali", "Kharar"],
      "Bathinda": ["Bathinda"],
    },
    "Madhya Pradesh": {
      "Bhopal": ["Bhopal", "MP Nagar", "Arera Colony"],
      "Indore": ["Indore", "Vijay Nagar", "Palasia"],
      "Gwalior": ["Gwalior"],
      "Jabalpur": ["Jabalpur"],
    },
    "Bihar": {
      "Patna": ["Patna", "Boring Road", "Kankarbagh"],
      "Gaya": ["Gaya"],
      "Muzaffarpur": ["Muzaffarpur"],
      "Bhagalpur": ["Bhagalpur"],
    },
    "Andhra Pradesh": {
      "Visakhapatnam": ["Visakhapatnam", "Dwaraka Nagar", "MVP Colony"],
      "Vijayawada": ["Vijayawada", "Labbipet"],
      "Guntur": ["Guntur"],
      "Tirupati": ["Tirupati"],
    },
    "Odisha": {
      "Bhubaneswar": ["Bhubaneswar", "Saheed Nagar", "Patia"],
      "Cuttack": ["Cuttack"],
      "Rourkela": ["Rourkela"],
    },
    "Jharkhand": {
      "Ranchi": ["Ranchi", "Main Road", "Doranda"],
      "Jamshedpur": ["Jamshedpur", "Bistupur"],
      "Dhanbad": ["Dhanbad"],
    },
    "Chhattisgarh": {
      "Raipur": ["Raipur", "Shankar Nagar"],
      "Bhilai": ["Bhilai"],
      "Bilaspur": ["Bilaspur"],
    },
    "Assam": {
      "Kamrup Metropolitan": ["Guwahati", "Dispur", "Paltan Bazaar"],
      "Dibrugarh": ["Dibrugarh"],
      "Jorhat": ["Jorhat"],
    },
    "Uttarakhand": {
      "Dehradun": ["Dehradun", "Rajpur Road", "Clock Tower"],
      "Haridwar": ["Haridwar", "Rishikesh"],
      "Nainital": ["Haldwani", "Nainital"],
    },
    "Himachal Pradesh": {
      "Shimla": ["Shimla", "Mall Road"],
      "Kangra": ["Dharamsala", "McLeod Ganj"],
      "Mandi": ["Mandi"],
    },
    "Goa": {
      "North Goa": ["Panaji", "Mapusa", "Calangute"],
      "South Goa": ["Margao", "Vasco da Gama"],
    },
    "Chandigarh": {
      "Chandigarh": ["Chandigarh", "Sector 17", "Sector 22", "Sector 35"],
    },
    "Jammu and Kashmir": {
      "Srinagar": ["Srinagar", "Lal Chowk", "Dal Gate"],
      "Jammu": ["Jammu", "Gandhi Nagar"],
    },
    "Puducherry": {
      "Puducherry": ["Puducherry", "White Town"],
    },
    "Haryana": {
      "Gurugram": ["Gurugram", "DLF Phase 1", "Sohna Road", "Sector 14"],
      "Faridabad": ["Faridabad", "NIT", "Sector 15"],
      "Hisar": ["Hisar", "Red Square Market"],
      "Panipat": ["Panipat"],
      "Ambala": ["Ambala", "Ambala Cantt"],
      "Karnal": ["Karnal"],
      "Rohtak": ["Rohtak"],
      "Sonipat": ["Sonipat"],
    },
    // Smaller states & UTs — just capitals/main cities
    "Manipur": { "Imphal West": ["Imphal"] },
    "Meghalaya": { "East Khasi Hills": ["Shillong"] },
    "Mizoram": { "Aizawl": ["Aizawl"] },
    "Nagaland": { "Kohima": ["Kohima"], "Dimapur": ["Dimapur"] },
    "Sikkim": { "East Sikkim": ["Gangtok"] },
    "Tripura": { "West Tripura": ["Agartala"] },
    "Arunachal Pradesh": { "Papum Pare": ["Itanagar"] },
    "Ladakh": { "Leh": ["Leh"] },
    "Andaman and Nicobar Islands": { "South Andaman": ["Port Blair"] },
    "Lakshadweep": { "Lakshadweep": ["Kavaratti"] },
    "Dadra and Nagar Haveli and Daman and Diu": { "Daman": ["Daman"], "Silvassa": ["Silvassa"] },
  };

  let districtCount = 0;
  let cityCount = 0;
  for (const [stateName, districts] of Object.entries(stateDistrictsCities)) {
    const state = await prisma.state.findUnique({ where: { name: stateName } });
    if (!state) continue;
    for (const [districtName, cities] of Object.entries(districts)) {
      const district = await prisma.district.upsert({
        where: { name_stateId: { name: districtName, stateId: state.id } },
        update: {},
        create: { name: districtName, stateId: state.id },
      });
      districtCount++;
      for (const cityName of cities) {
        await prisma.city.upsert({
          where: { name_districtId: { name: cityName, districtId: district.id } },
          update: {},
          create: { name: cityName, districtId: district.id },
        });
        cityCount++;
      }
    }
  }
  console.log(`  ✓ ${districtCount} districts and ${cityCount} cities seeded across India`);

  // ── Sample Subcategories for Hospitals ──
  const hospCat = await prisma.category.findUnique({ where: { slug: "hospitals-clinics" } });
  if (hospCat) {
    const hospitalSubs = [
      "Private Hospital", "Govt Hospital", "Charitable Hospital",
      "Multi Speciality Hospital", "Dental Clinic", "Eye Hospital",
      "Homoeopathic Clinic", "Ayurvedic Clinic", "Nursing Home",
    ];
    for (const sub of hospitalSubs) {
      const slug = sub.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.subCategory.upsert({
        where: { slug_categoryId: { slug, categoryId: hospCat.id } },
        update: {},
        create: { name: sub, slug, categoryId: hospCat.id },
      });
    }
    console.log("  ✓ Hospital subcategories seeded");
  }

  // ── Sample Subcategories for Doctors ──
  const docCat = await prisma.category.findUnique({ where: { slug: "doctors" } });
  if (docCat) {
    const doctorSubs = [
      "General Physician", "Cardiologist", "Orthopedic",
      "Dermatologist", "Dentist", "ENT Specialist",
      "Gynecologist", "Pediatrician", "Neurologist",
      "Ophthalmologist", "Psychiatrist", "Urologist",
    ];
    for (const sub of doctorSubs) {
      const slug = sub.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.subCategory.upsert({
        where: { slug_categoryId: { slug, categoryId: docCat.id } },
        update: {},
        create: { name: sub, slug, categoryId: docCat.id },
      });
    }
    console.log("  ✓ Doctor subcategories seeded");
  }

  // ── Subcategories for Diagnostics ──
  const diagCat = await prisma.category.findUnique({ where: { slug: "diagnostics" } });
  if (diagCat) {
    const diagSubs = ["X-Ray Centre", "MRI Centre", "CT Scan Centre", "Ultrasound Centre", "Pathology Lab", "ECG Centre"];
    for (const sub of diagSubs) {
      const slug = sub.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.subCategory.upsert({
        where: { slug_categoryId: { slug, categoryId: diagCat.id } },
        update: {},
        create: { name: sub, slug, categoryId: diagCat.id },
      });
    }
    console.log("  ✓ Diagnostics subcategories seeded");
  }

  // ── Subcategories for Opticals ──
  const optCat = await prisma.category.findUnique({ where: { slug: "opticals" } });
  if (optCat) {
    const optSubs = ["Optical Store", "Eye Testing Centre", "Contact Lens Store", "Spectacle Repairing"];
    for (const sub of optSubs) {
      const slug = sub.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.subCategory.upsert({
        where: { slug_categoryId: { slug, categoryId: optCat.id } },
        update: {},
        create: { name: sub, slug, categoryId: optCat.id },
      });
    }
    console.log("  ✓ Opticals subcategories seeded");
  }

  // ── Subcategories for Health Service Providers ──
  const hspCat = await prisma.category.findUnique({ where: { slug: "health-service-providers" } });
  if (hspCat) {
    const hspSubs = ["Ambulance Service", "Blood Bank", "Physiotherapy", "Home Healthcare", "Medical Equipment Rental", "Nursing Service"];
    for (const sub of hspSubs) {
      const slug = sub.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.subCategory.upsert({
        where: { slug_categoryId: { slug, categoryId: hspCat.id } },
        update: {},
        create: { name: sub, slug, categoryId: hspCat.id },
      });
    }
    console.log("  ✓ Health Service Providers subcategories seeded");
  }

  // ── Subcategories for Emergency Services ──
  const emCat = await prisma.category.findUnique({ where: { slug: "emergency-services" } });
  if (emCat) {
    const emSubs = ["108 Ambulance", "Fire Brigade", "Police", "Disaster Management", "Poison Control"];
    for (const sub of emSubs) {
      const slug = sub.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.subCategory.upsert({
        where: { slug_categoryId: { slug, categoryId: emCat.id } },
        update: {},
        create: { name: sub, slug, categoryId: emCat.id },
      });
    }
    console.log("  ✓ Emergency Services subcategories seeded");
  }

  // ── Job Categories ──
  const jobCategories = [
    "Doctor", "Nurse", "Pharmacist", "Lab Technician", "Compounder",
    "Receptionist", "Hospital Administrator", "Medical Representative",
    "Delivery Boy", "Accountant", "Store Manager", "Ward Boy",
  ];
  for (const name of jobCategories) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.jobCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  console.log("  ✓ Job categories seeded");

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
