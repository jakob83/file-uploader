/*
  Warnings:

  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `directories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rootDirId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mimeType` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rootDirId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "rootDirId" TEXT NOT NULL;

-- DropTable
DROP TABLE "sessions";

-- CreateIndex
CREATE UNIQUE INDEX "directories_name_key" ON "directories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "files_name_key" ON "files"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_rootDirId_key" ON "users"("rootDirId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rootDirId_fkey" FOREIGN KEY ("rootDirId") REFERENCES "directories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
