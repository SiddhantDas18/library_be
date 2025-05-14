import express from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import cors from 'cors'
import prismaClient from "./db"
import middleware from "./middleware";

const app = express()
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

const SECRET = process.env.SECRET



app.post("/addAdmin",async function(req,res){
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email
    const role = "admin"

    const hashedPassword = await bcrypt.hash(password,10)

    try{


        const checkUser = await prismaClient.users.findUnique({
            where:{
                username:username
            }
        })

        if(checkUser){
            res.json({
                msg:"Username already taken"
            })
        }

        const addUser = await prismaClient.users.create({
            data:{
                username:username,
                email:email,
                password:hashedPassword,
                role:role
            }
        })


        res.json({
            msg:"User Created",
            user:addUser
        })


    }catch(e){

        res.json({
            msg:(e as Error).toString()
        })
    }
})

app.post("/addUser",async function(req,res){
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email
    const role = "user"

    const hashedPassword = await bcrypt.hash(password,10)

    try{

        const checkUser = await prismaClient.users.findUnique({
            where:{
                username:username
            }
        })  

        if(checkUser){
            res.json({
                msg:"Username already taken"
            })
        }

        const addUser = await prismaClient.users.create({
            data:{
                username:username,
                email:email,
                password:hashedPassword,
                role:role
            }
        })  

        res.json({
            msg:"User Created",
            user:addUser
        })
        
        

    }catch(e){
        
    }
    
})

app.post("/login",async function(req,res){
    const username = req.body.username
    const password = req.body.password

    try{

        const user = await prismaClient.users.findUnique({
            where:{
                username:username
            }
        })  

        if(!user){
            res.json({
                msg:"User not found"
            })
        }       

        const isPasswordValid = await bcrypt.compare(password,user?.password || "")

        if(!isPasswordValid){
            res.json({
                msg:"Invalid password"
            })
        }

        const user_id = user?.id
        const role = user?.role

        const token = jwt.sign({
            id:user_id,
            role:role
        },SECRET as string)

        res.json({
            msg:"Login successful",
            token:token,
            role:role
        })
        
        
    }catch(e){
        res.json({
            msg:(e as Error).toString()
        })
    }
})

app.post("/addBook", middleware, async function(req, res): Promise<void> {
    const title = req.body.title
    const author = req.body.author
    const isbn = req.body.isbn
    const published_year = req.body.year
    const copies = req.body.copies

    const id = (req as any).id
    const role = (req as any).role

    try{
        if(role != 'admin'){
            res.json({
                msg:"Only Admin can Add books"
            })
        }

        const book = await prismaClient.books.create({
            data: {
                title:title,
                author:author,
                ISBN:isbn,
                Published_year:published_year,
                Copies_available:copies,
            }
        })

        res.json({
            msg:"Book added successfully",
            book: book
        })

    }catch(e){
        res.json({
            msg:(e as Error).toString()
        })
    }
})

app.get("/books",middleware, async function(req,res){

    try {
        const books = await prismaClient.books.findMany()
        
        res.json({
            msg: "Books retrieved successfully",
            books: books
        })
    } catch(e) {
        res.json({
            msg: (e as Error).toString()
        })
    }

})


app.post("/borrow/:id", middleware, async function(req, res) {
    const book_id = parseInt(req.params.id)
    const role = (req as any).role
    const customer_id = parseInt(req.body.customer_id)

    if (role !== "admin") {
        res.json({
            msg: "Only administrators can process book borrowing"
        })
        return
    }

    if (!customer_id) {
        res.json({
            msg: "Customer ID is required in the request body"
        })
        return
    }

    try {
        const findUser = await prismaClient.users.findUnique({
            where: {
                id: customer_id
            }
        })

        if (!findUser) {
            res.json({
                msg: "User not found"
            })
            return
        }


        const existingBorrow = await prismaClient.borrowed.findFirst({
            where: {
                borrowed_user: customer_id,
                Status: false 
            }
        })

        if (existingBorrow) {
            res.json({
                msg: "This customer already has a book borrowed. They must return it before borrowing another one."
            })
            return
        }

        const book_available = await prismaClient.books.findUnique({
            where: {
                id: book_id
            }
        })

        if (!book_available) {
            res.json({  
                msg: "We don't have this book on us"
            })
            return
        }

        let copies = book_available?.Copies_available
        let borrowed = book_available?.Copies_Borrowed

        if (copies == 0) {
            res.json({  
                msg: "Sorry We don't have this book in stock right now"
            })
            return
        }

        const checkout = await prismaClient.books.update({
            where: {
                id: book_id
            },
            data: {
                Copies_available: (copies as number) - 1,
                Copies_Borrowed: (borrowed as number) + 1
            }
        })

        const transaction = await prismaClient.transactions.create({
            data: {
                user_id: customer_id,  
                book_id: book_id,
                amount: 30,
                Transaction_Date: new Date(),
                return_date: new Date(new Date().setDate(new Date().getDate() + 7)),
            }
        })

        const borrow = await prismaClient.borrowed.create({
            data: {
                borrowed_user: customer_id,  
                book_id: book_id,
                borrowed_date: new Date(),
                return_date: new Date(new Date().setDate(new Date().getDate() + 7))
            }
        })

        res.json({
            msg: "You got your book",
            transaction: transaction,
            book: checkout
        })

    } catch(e) {
        res.json({
            msg: (e as Error).toString()
        })
    }
})

app.get("/searchBook/:title",async function(req,res){
    const title = req.params.title

    try {
        const books = await prismaClient.books.findMany({
            where: {
                title: {
                    contains: title,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                title: true,
                author: true,
                ISBN: true,
                Published_year: true,
                Copies_available: true,
                Copies_Borrowed: true
            }
        })

        if (books.length === 0) {
            res.json({
                msg: "No books found with that title",
                books: []
            })
            return
        }

        res.json({
            msg: "Books found successfully",
            books: books
        })

    } catch(e) {
        res.json({
            msg: (e as Error).toString()
        })
    }
})

app.get("/my-books", middleware, async function(req, res) {
    const user_id = (req as any).id

    try {
        const borrowedBooks = await prismaClient.borrowed.findMany({
            where: {
                borrowed_user: user_id,
            },
            include: {
                books: true
            }
        })

        res.json({
            msg: "Borrowed books retrieved successfully",
            books: borrowedBooks
        })
    } catch(e) {
        res.json({
            msg: (e as Error).toString()
        })
    }
})

app.get("/checkBorrow/:id",middleware,async function(req,res){
    const customerID = parseInt(req.params.id)
    const user_id=(req as any).id
    const role = (req as any).role

    if(role!="admin"){
        res.json({
            msg:"You are not authorized"
        })
    }

    try{

        const findUser = await prismaClient.users.findUnique({
            where:{
                id:customerID
            }
        })

        if(!findUser){
            res.json({
                msg:"User not found"
            })
        }

        const findBorrow = await prismaClient.borrowed.findMany({
            where: {
                borrowed_user: customerID,
                Status: false
            },
            include: {
                books: true
            }
        })

        if (findBorrow.length === 0) {
            res.json({
                msg: "No active borrowings found",
                borrow: []
            })
        }

        res.json({
            msg: "Active borrowings retrieved successfully",
            borrow: findBorrow
        })

    }catch(e){
        res.json({
            msg:(e as Error).toString()
        })
    }
})


app.post("/return/:id", middleware, async function(req, res) {
    const book_id = parseInt(req.params.id)
    const role = (req as any).role
    const user = req.body.user

    if(role != "admin"){
        res.json({
            msg: "Not authorized"
        })
    }

    try {
        const finduser = await prismaClient.users.findUnique({
            where: {
                id: ( user as number)
            }
        })

        if(!finduser){
            res.json({
                msg: "Invalid User name"
            })
        }

        const findBook = await prismaClient.books.findUnique({
            where: {
                id: book_id
            }
        })

        if(!findBook){
            res.json({
                msg: "Book not found"
            })
        }

        const return_user_id = finduser?.id

        const findBorrow = await prismaClient.borrowed.findFirst({
            where: {
                borrowed_user: return_user_id,
                book_id: book_id,
                Status: false
            }
        })

        if(!findBorrow){
            res.json({
                msg: "No active borrowing found for this book"
            })
        }

        const updateBorrow = await prismaClient.borrowed.update({
            where: {
                id: findBorrow?.id
            },
            data: {
                Status: true
            }
        })

        const available = findBook?.Copies_available
        const borrowed = findBook?.Copies_Borrowed

        const books = await prismaClient.books.update({
            where: {
                id: book_id
            },
            data: {
                Copies_available: (available as number) + 1,
                Copies_Borrowed: (borrowed as number) - 1
            }
        })

        const return_date = findBorrow?.return_date ? new Date(findBorrow?.return_date) : new Date()


        const transaction = await prismaClient.transactions.create({
            data: {
                user_id: return_user_id!,
                book_id: book_id,
                amount: 0,
                return_date: return_date,
                Transaction_Date: new Date(),
                Status:true
            }
        })

        res.json({
            msg: "Book returned successfully",
            borrow: updateBorrow,
            book: books,
            transaction: transaction
        })

    } catch(e) {
        res.json({
            msg: (e as Error).toString()
        })
    }
})

app.get("/transactions", middleware, async function(req, res) {
    const role = (req as any).role

    if (role !== "admin") {
        res.json({
            msg: "Not authorized to view transactions"
        })
        return
    }

    try {
        const transactions = await prismaClient.transactions.findMany({
            orderBy: {
                Transaction_Date: 'desc'
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                },
                books: {
                    select: {
                        title: true
                    }
                }
            }
        })

        res.json({
            msg: "Transactions retrieved successfully",
            transactions: transactions
        })
    } catch(e) {
        res.json({
            msg: (e as Error).toString()
        })
    }
})




const port = 8080

app.listen(port)
console.log(`listening on port ${port}`)