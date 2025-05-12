-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categories_id_key" ON "Categories"("id");
