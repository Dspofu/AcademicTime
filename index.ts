import express from "express";

const server = express();

server.get("/", (req, res)=>{
  res.end("<h1></h1>")
})
server.listen(8080, "0.0.0.0", ()=>console.log("Ta rodando essa jossa."))