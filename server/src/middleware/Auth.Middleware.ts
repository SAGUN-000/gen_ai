 
// src/middleware/auth.middleware.ts

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    username: string;
  };
};

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {

    console.log("AUTH MIDDLEWARE HIT:", req.method, req.originalUrl);

     console.log(
    "Authorization:",
    req.headers.authorization ? "PRESENT" : "MISSING"
  );
  
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;


  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error("JWT_SECRET is not configured"));
  }

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  console.log("Authorization header exists:", !!authHeader);
  console.log("Token exists:", !!token);
  console.log("JWT secret exists:", !!secret);

  try {
    const decoded = jwt.verify(token, secret);

    console.log("JWT verified successfully");
    console.log("Decoded payload:", decoded);

    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "string" ||
      typeof decoded.username !== "string"
    ) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    return next();
  } catch(e) {
      console.error("JWT verification error:", e);

  return res.status(401).json({
    message: "Invalid or expired token",
  });
  }
}
 