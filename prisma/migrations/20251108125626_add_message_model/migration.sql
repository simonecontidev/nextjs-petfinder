/*
  Warnings:

  - You are about to drop the column `email` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `fromUserId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Message` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "senderUserId" TEXT,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "phone" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Message_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("body", "createdAt", "id", "listingId", "phone") SELECT "body", "createdAt", "id", "listingId", "phone" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_listingId_idx" ON "Message"("listingId");
CREATE INDEX "Message_senderUserId_idx" ON "Message"("senderUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
