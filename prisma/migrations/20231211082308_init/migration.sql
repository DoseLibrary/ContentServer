-- CreateEnum
CREATE TYPE "LibraryType" AS ENUM ('MOVIE', 'SHOW');

-- CreateTable
CREATE TABLE "Library" (
    "id" SERIAL NOT NULL,
    "type" "LibraryType" NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "Library_pkey" PRIMARY KEY ("id")
);
