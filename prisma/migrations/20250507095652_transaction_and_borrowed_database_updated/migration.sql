-- DropForeignKey
ALTER TABLE "Transactions" DROP CONSTRAINT "Transactions_return_date_fkey";

-- DropIndex
DROP INDEX "Borrowed_return_date_key";
