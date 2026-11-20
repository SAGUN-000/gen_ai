
import { signUp as signUpService,login as loginService } from "../service/Auth.service.js";
import { Request,Response } from "express";
 

 export const signUp=async(req: Request, res: Response)=>{

    try {

        const user=await signUpService(req.body)
        
        return res.status(201).json({
            message:"user createad sucessfully",
            user:user
        })
        
    } catch (error) {
         res.status(500).json({
         message: "Signup failed"
    });
    }

 }


export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = await loginService(req.body);

    if (!token) {
      res.status(401).json({
        message: "Invalid credentials"
      });
      return;
    }

    res.status(201).json(token)
    
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed"
    });
  }
};