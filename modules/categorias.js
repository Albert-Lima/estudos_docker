const express = require('express')
const app = express()

const mongoose = require('mongoose')
const Categoria = new mongoose.Schema({//model para receber e salvar categorias modificadas pelo adm;
    nomeCategoria:{
        type: String,
        require: true
    },
    slugCategoria:{
        type: String,
        require: true
    },
    Date:{
        type: Date,
        default: Date.now()
    }
})
mongoose.model('categorias', Categoria)