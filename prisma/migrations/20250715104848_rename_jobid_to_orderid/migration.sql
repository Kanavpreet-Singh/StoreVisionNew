/*
  Warnings:

  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `jobid` on the `Order` table. All the data in the column will be lost.
  - The required column `orderid` was added to the `Order` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
DROP COLUMN "jobid",
ADD COLUMN     "orderid" TEXT NOT NULL,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("orderid");
