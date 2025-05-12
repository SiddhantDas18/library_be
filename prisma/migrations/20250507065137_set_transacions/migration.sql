/*
  Warnings:

  - The `Status` column on the `Borrowed` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[return_date]` on the table `Borrowed` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `return_date` on the `Borrowed` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Borrowed" DROP COLUMN "return_date",
ADD COLUMN     "return_date" TIMESTAMP(3) NOT NULL,
DROP COLUMN "Status",
ADD COLUMN     "Status" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Borrowed_return_date_key" ON "Borrowed"("return_date");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_return_date_fkey" FOREIGN KEY ("return_date") REFERENCES "Borrowed"("return_date") ON DELETE RESTRICT ON UPDATE CASCADE;
