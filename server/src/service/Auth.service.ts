import { generateToken } from "../utils/Auth.util.js";
import { prisma } from "../config/DBConfig.js";
import type { SignUpRequest,LoginRequest } from "../schema/auth.schema.js";
import bcrypt from 'bcrypt'

export const signUp=async({name,email,password}:SignUpRequest)=>{

    if(!name || !email || !password){
        throw new Error("invalid credentials")
    }

    const userExists=await prisma.user.findUnique({
        where:{
            email
        }
    })

    if(userExists){
        throw new Error("user already exists")
    }

    const salt=await bcrypt.genSalt(10)
    const hashPassword=await bcrypt.hash(password,salt)

    const user=await prisma.user.create({
        data:{
            name,
            email,
            password:hashPassword
        }
    })

    return user;

}

 interface LoginResponse{
    JWT_token:string
 }

export const login=async({email,password}:LoginRequest): Promise<LoginResponse> =>{

    if(!email || !password){
        throw new Error("invalid credentials")
    }

    const user=await prisma.user.findUnique({
        where:{
            email
        }   
    })

    if(!user){
         throw new Error("email not found")
    }

    const IsPasswordCorrect=await bcrypt.compare(password,user.password)

    if(!IsPasswordCorrect){
        throw new Error("invalid Password")
    }

    const token=generateToken(user.id,user.name)

     return {
        JWT_token:token
    }
}