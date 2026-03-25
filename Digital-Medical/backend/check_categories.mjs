import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const cats = await p.category.findMany({ select: { slug: true, name: true } });
console.log("Categories:", JSON.stringify(cats, null, 2));

// Also check if there's a hospital business and its slug
const hospital = await p.businessProfile.findFirst({
  where: { name: { contains: "sss", mode: "insensitive" } },
  select: { name: true, phone1: true, user: { select: { phone: true, name: true } }, category: { select: { slug: true, name: true } } }
});
console.log("\nHospital (SSS):", JSON.stringify(hospital, null, 2));

// Check medical store
const medical = await p.businessProfile.findFirst({
  where: { name: { contains: "lotus", mode: "insensitive" } },
  select: { name: true, phone1: true, userId: true, user: { select: { id: true, phone: true, name: true } }, category: { select: { slug: true, name: true } } }
});
console.log("\nMedical (Lotus):", JSON.stringify(medical, null, 2));

// Check if medical owner is in alreadyLinkedUserIds
if (medical) {
  const linked = await p.staffMember.findFirst({
    where: { linkedUserId: medical.user.id }
  });
  console.log("\nIs medical owner already linked as staff?", linked ? "YES" : "NO");
  if (linked) console.log("Linked record:", JSON.stringify(linked, null, 2));
}

// Also check all staff members with linkedUserId
const allLinked = await p.staffMember.findMany({
  where: { linkedUserId: { not: null } },
  select: { linkedUserId: true, name: true, businessId: true, business: { select: { name: true } } }
});
console.log("\nAll linked staff:", JSON.stringify(allLinked, null, 2));

await p.$disconnect();
