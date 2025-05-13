import express from "express";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import cors from 'cors'
import prismaClient from "./db"
import middleware from "./middleware";


const app = express()
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
            token:token
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
    const user_id = (req as any).id  
    try {
        const book_available = await prismaClient.books.findUnique({
            where: {
                id: book_id
            }
        })

        if (!book_available) {
             res.json({  
                msg: "We don't have this book on us"
            })
        }

        let copies = book_available?.Copies_available
        let borrowed = book_available?.Copies_Borrowed

        if (copies == 0) {
             res.json({  
                msg: "Sorry We don't have this book in stock right now"
            })
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
                user_id: user_id,  
                book_id: book_id,
                amount: 30,
                Transaction_Date: new Date(),
                return_date: new Date(new Date().setDate(new Date().getDate() + 7)),

            }
        })

        const borrow = await prismaClient.borrowed.create({
            data: {
                borrowed_user: user_id,  
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

const port = 8080

app.listen(port)
console.log(`listening on port ${port}`)