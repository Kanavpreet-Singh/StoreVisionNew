-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_storeid_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isFulfilled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "storeid" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeid_fkey" FOREIGN KEY ("storeid") REFERENCES "Store"("storeid") ON DELETE SET NULL ON UPDATE CASCADE;
