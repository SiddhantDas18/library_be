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
                Copies_availabe:copies,
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








const port = 8080

app.listen(port)
console.log(`listening on port ${port}`)