const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Postagens = new Schema({
    imagem:{
        type: String,
        required: true
    },
    titulo:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    descricao:{
        type: String,
        required: true
    },
    conteudo:{
        type: String,
        required: true
    },
    data:{
        type: Date,
        default: Date.now()
    },
    categoria:{
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    }
})
mongoose.model("postagens", Postagens)