import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.listing.deleteMany();

  await prisma.listing.createMany({
    data: [
      {
        title: "Cane smarrito zona Retiro",
        description: "Meticcio marrone, collarino rosso.",
        animalType: "DOG",
        status: "LOST",
        city: "Madrid",
        latitude: 40.415,
        longitude: -3.684,
        photos: "https://picsum.photos/seed/dog1/800/600"
      },
      {
        title: "Gatto trovato a Gràcia",
        description: "Grigio tigrato, molto docile.",
        animalType: "CAT",
        status: "FOUND",
        city: "Barcelona",
        latitude: 41.406,
        longitude: 2.157,
        photos: "https://picsum.photos/seed/cat1/800/600"
      },
      {
        title: "Pappagallo avvistato",
        description: "Verde, vola tra gli alberi.",
        animalType: "BIRD",
        status: "LOST",
        city: "Madrid",
        latitude: 40.431,
        longitude: -3.703,
        photos: "https://picsum.photos/seed/bird1/800/600"
      }
    ]
  });
}

main()
  .then(async () => {
    console.log("✅ Seed completato");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });