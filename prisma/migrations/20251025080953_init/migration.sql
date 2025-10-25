-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "animalType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOST',
    "city" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "photos" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
