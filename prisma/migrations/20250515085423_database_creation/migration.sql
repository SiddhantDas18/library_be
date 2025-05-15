-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Books" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "ISBN" TEXT NOT NULL,
    "Published_year" TEXT NOT NULL,
    "Copies_available" INTEGER NOT NULL,
    "Copies_Borrowed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Borrowed" (
    "id" SERIAL NOT NULL,
    "borrowed_user" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "borrowed_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL,
    "Status" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Borrowed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "Transaction_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_date" TIMESTAMP(3) NOT NULL,
    "Status" BOOLEAN NOT NULL DEFAULT false,
    "Fine_amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_id_key" ON "Users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Books_id_key" ON "Books"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Books_ISBN_key" ON "Books"("ISBN");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_id_key" ON "Categories"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Borrowed_id_key" ON "Borrowed"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_id_key" ON "Transactions"("id");

-- AddForeignKey
ALTER TABLE "Borrowed" ADD CONSTRAINT "Borrowed_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrowed" ADD CONSTRAINT "Borrowed_borrowed_user_fkey" FOREIGN KEY ("borrowed_user") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
