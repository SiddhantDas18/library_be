-- CreateTable
CREATE TABLE "Borrowed" (
    "id" SERIAL NOT NULL,
    "borrowed_user" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "borrowed_date" INTEGER NOT NULL,
    "return_date" INTEGER NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "Borrowed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Borrowed_id_key" ON "Borrowed"("id");

-- AddForeignKey
ALTER TABLE "Borrowed" ADD CONSTRAINT "Borrowed_borrowed_user_fkey" FOREIGN KEY ("borrowed_user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrowed" ADD CONSTRAINT "Borrowed_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
