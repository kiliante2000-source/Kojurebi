-- AlterTable
ALTER TABLE "Product" ADD COLUMN "sizes" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN "frame" TEXT NOT NULL DEFAULT 'portrait';
