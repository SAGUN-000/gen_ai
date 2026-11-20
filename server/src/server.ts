
import 'dotenv/config'
import express from 'express'
import chatRouter from './routes/chat.routes.js'
import authRouter from './routes/auth.routes.js'
import cors from 'cors'
import { connectDB } from './config/DBConfig.js'


const app=express()

const port=process.env.PORT

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/chat",chatRouter)
app.use("/api/auth",authRouter)
 

app.listen(port,()=>{
    console.log(`server started at port ${port}`)
})


connectDB()

