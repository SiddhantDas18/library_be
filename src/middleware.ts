import jwt from "jsonwebtoken"

const SECRET = process.env.SECRET

export default function middleware(req:any,res:any,next:any){
    const token = req.headers.authorization.split(" ")[1]

    if(!token){
        return res.status(401).json({
            msg:"Unauthorized"
        })
    }

    const decode = jwt.verify(token, SECRET as string)

    if(decode){

        const { id } = decode as { id: number }
        const {role} = decode as {role:string}
        req.id = id
        req.role= role
        next()
    }else{
        res.json({
            msg:"user id not found in auth"
        })
    }
}