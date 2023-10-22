import express from "express";
const app=express();
const port=process.env.PORT || 5000;
import cors from 'cors';
import route from "./route/Route.js";
import Connection from "./db/Connection.js";

Connection()

app.use(cors());
app.use(express.json())

app.use('/',route)

app.listen(port,()=>{
    console.log(`server start at ${port} `)
})