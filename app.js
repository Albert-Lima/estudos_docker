const express = require("express")
const path = require("path")
const app = express()

app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "public" ,"index.html"))
})

app.listen(8081, (err)=>{
    if(err){
        console.log("houve um erro ao iniciar o servidor: "+err)
    }else{
        console.log("servidor rodando na porta 8081")
    }
})