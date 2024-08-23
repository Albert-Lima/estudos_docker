const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//recebendo model de usuários
require("/estudos_docker/modules/usuarios")
const Usuarios = mongoose.model("usuarios")

//recebendo model de postagens
require("/estudos_docker/modules/postagem")
const Postagens = mongoose.model("postagens")

//rota principal após login como usuário
const {eUser} = require("../helpers/eUser")
router.get("/home", eUser, (req, res)=>{
    Postagens.find().populate().sort({data: "desc"}).limit(5).lean().then((postagens)=>{
        res.render("usuarios/home", {postagens: postagens})
     }).catch((err)=>{
        req.flash("error_msg", "houve um erro interno")
        res.redirect("/404")
     })
})

//rotas de resposta para informar o usuário
router.get("/cadastre-se", (req, res)=>{
    res.render("usuarios/resposta")
})
router.get("/sobre", (req, res)=>{
    res.render("usuarios/about")
})

//rota para cadastro
router.get("/cadastro", (req, res)=>{
    res.render("usuarios/cadastro")
})
router.post("/cadastro", (req, res)=>{
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "email inválido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "senha inválida"})
    }
    if(req.body.senha.length < 8){
        erros.push({texto: "senha muito pequena(pelo menos 8 caracteres)"})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "senhas não compatíveis"})
    }
    if(erros.length > 0){
        res.render("usuarios/cadastro", {erros: erros})
    }else{
        Usuarios.findOne({email: req.body.email}).lean().then((usuarios)=>{
            if(usuarios){
                req.flash("error_msg", "email já cadastrado!")
                req.redirect("/user/cadastro")
            }else{
                const novoUsuario = new Usuarios({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10, (erro, salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                        if(erro){
                            req.flash("error_msg", "houve um erro durante o salvamento")
                            res.redirect("/")
                        }else{
                            novoUsuario.senha = hash
                            novoUsuario.save().then(()=>{
                                console.log("cadastro realizado")
                                req.flash("success_msg", "usuário cadastrado")
                                res.redirect("/user/home")
                            }).catch((err)=>{
                                req.flash("error_msg","houve um erro ao criar novo usuário")
                                res.redirect("/user/cadastro")
                            })
                        }
                    })
                })

            }
        }).catch((err)=>{
            res.redirect("/user/cadastro")
        })
    }
})

//rota para login
require("/estudos_docker/config/auth")
const passport = require("passport")

router.get("/logout", (req, res)=>{
    req.logout((err)=>{
        console.log(err)
    })//fará o logout automaticamente
    req.flash("success_msg", "deslogado com sucesso")
    res.redirect("/")
})
router.get("/login", (req, res)=>{
    res.render("usuarios/login")
})
router.post("/login", (req, res, next)=>{
    passport.authenticate("local", (err, user, info)=> {
        if (err) {
            return next(err);
        }
        if (!user) {
            // Se a autenticação falhar, redireciona para a página de login com uma mensagem de erro
            return res.redirect("/user/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Verifica o campo eAdmin do usuário para determinar o redirecionamento
            if (user.eAdmin === 1) {
                return res.redirect("/admin/home");
            } else {
                return res.redirect("/user/home");
            }
        });
    })(req, res, next)
})


//rota para renderizar a vizualização completa das postagens
router.get("/postagem", eUser, (req, res)=>{
    Postagens.find().populate("categoria").sort({data: "desc"}).lean().then((postagens)=>{
        res.render("usuarios/postagem", {postagens: postagens})
    }).catch((err)=>{
        req.flash('error_msg', 'erro ao listar postagens')
    })
})
router.get("/postagem/:id", eUser, (req, res)=>{
    Postagens.findOne({_id: req.params.id}).lean().then((postagens)=>{
        res.render("usuarios/see_post", {postagens: postagens})
    }).catch((err)=>{
        console.log("houve um erro: "+err)
        req.flash("error_msg", "erro ao mostrar postagem")
        res.redirect("/admin/postagens")
    })
})

module.exports = router