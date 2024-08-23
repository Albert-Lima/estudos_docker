const express = require('express')
const app = express()
const router = express.Router()
const mongoose = require('mongoose')



//RECEBENDO O HELPER DE ACESSO;
const {eAdmin} = require("../helpers/eAdmin")

//RECEBENDO MODEL DE CATEGORIA:
require('/estudos_docker/modules/categorias')
const Categoria = mongoose.model('categorias')

//RECEBENDO O MODEL DE POSTAGENS:
require('/estudos_docker/modules/postagem')
const Postagens = mongoose.model('postagens')


//Rota para a página principal do admin:
router.get("/home", eAdmin ,(req, res)=>{
    Postagens.find().populate().sort({data: "desc"}).limit(5).lean().then((postagens)=>{
        res.render("admin/home", {postagens: postagens})
     }).catch((err)=>{
        req.flash("error_msg", "houve um erro interno")
        res.redirect("/404")
     })
})

//ADIÇÃO E AUTENTICAÇÃO DE CATEGORIAS:
    router.post("/categorias/nova", eAdmin, (req, res)=>{
        const erros = []
        if(!req.body.nomeCategoria || typeof req.body.nomeCategoria == undefined || req.body.nomeCategoria == null){
            erros.push({texto: "Nome da categoria inválido"})
        }
        if(!req.body.slugCategoria || typeof req.body.slugCategoria == undefined || req.body.slugCategoria == null){
            erros.push({texto: "Slug inválido"})
        }
        if(req.body.nomeCategoria < 2){
            erros.push({texto: "Nome da categoria é muito pequueno!"})
        }
        if(erros.length > 0){
            res.render("admin/categoriasNova", {erros: erros})
        }
        else{
            const CategoriaColect = {
                nomeCategoria: req.body.nomeCategoria,
                slugCategoria: req.body.slugCategoria
            }
            new Categoria(CategoriaColect).save().then(()=>{
                req.flash("success_msg", "Categoria criada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((err)=>{
                req.flash("error_msg", "houve um erro ao salvar a categorias!")
            })
        }
    })
//Rota que irá mandar as informações e os dados da categoria para a página de edição
router.get("/categorias/edit/:id",eAdmin, (req, res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err)=>{
        req.flash("error_msg", "esta categoria não existe!")
        res.redirect("/admin/categorias")
    })
})
//Rota que fará todas as alterações dentro do banco de dados com os dados que receber do input da página de edição
router.post("/categorias/edit",eAdmin, (req, res)=>{
    Categoria.findOneAndUpdate({_id: req.body.id}).then((categoria)=>{
        categoria.nomeCategoria = req.body.nomeCategoria
        categoria.slugCategoria = req.body.slugCategoria
        categoria.save().then(()=>{
            req.flash("success_msg", "categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg", "houve um erro ao salvar a categoria")
            res.redirect("/admin/categorias")
        })
    }).catch((err)=>{
        req.flash("error_msg", "erro ao editar categoria: "+err)
        res.redirect("/admin/categorias")
    })
})
//Rota que envia para a página de renderização de edição de postagem:
router.get("/postagens/edit/:id",eAdmin, (req, res)=>{
    Postagens.findOne({_id: req.params.id}).lean().then((postagens)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpost", {categorias: categorias, postagens: postagens})
        })
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })
})
//Rota para atualizar dados no banco
router.post("/postagens/edit", eAdmin,(req, res)=>{
    Postagens.findByIdAndUpdate({_id: req.body.id}).then((postagens)=>{
        postagens.titulo = req.body.titulo
        postagens.slug = req.body.slug
        postagens.descricao = req.body.descricao
        postagens.conteudo = req.body.conteudo
        postagens.categoria = req.body.categoria
        postagens.save().then(()=>{
            req.flash("success_msg", "postagem edita com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "erro interno")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg", "erro ao salvar postagem")
    })
})
//Rota para deletar postagens(forma não segura)
router.get("/postagens/delete/:id", (req, res)=>{
    Postagens.findOneAndDelete({_id: req.params.id}).lean().then(()=>{
        req.flash("success_msg", "postagem deletada")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        console.log("houve um erro: "+err)
        req.flash("error_msg", "erro ao deletar postagem")
        res.redirect("/admin/postagens")
    })
})

//Rota que receberá o id da categoria em que o botão se econtra:
router.post("/categorias/deletar",eAdmin, (req, res)=>{
    Categoria.deleteOne({_id:req.body.id}).then(()=>{
        req.flash("success_msg", "categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg", "erro ao deletar categoria: "+err)
        res.redirect("/admin/categorias")
    })
})

//Rota queredenrizará as a página com a lista de categorias
router.get('/categorias', eAdmin,(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render('admin/categorias', {Categoria: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao listar categorias")
        res.render('admin/categorias')
    })
})
router.get('/categorias/nova', function(req, res){
    res.render('admin/categoriasNova')
})

//rota para renderizar as postagens
router.get("/home", (req, res)=>{
    res.render("admin/home")
})
router.get("/postagens", (req, res)=>{
    Postagens.find().populate("categoria").sort({data: "desc"}).lean().then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=>{
        req.flash('error_msg', 'erro ao listar postagens')
    })
})
router.get("/postagem/:id", (req, res)=>{
    Postagens.findOne({_id: req.params.id}).lean().then((postagens)=>{
        res.render("admin/see_post", {postagens: postagens})
    }).catch((err)=>{
        console.log("houve um erro: "+err)
        req.flash("error_msg", "erro ao mostrar postagem")
        res.redirect("/admin/postagens")
    })
})
//rota para renderizar a página de ediçção das postagens
router.get("/postagens/nova", (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render('admin/postagensnova', {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao carregar o formulário")
        res.redirect("/admin/postagens")
    })
})
//rota que vai receber os dados de postagem e salavar no banco de dados
app.use(express.static('public'))
const path = require('path')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public")
    },
    filename: function (req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})

router.post("/postagens/nova", upload.single('imagem'), (req, res)=>{
    var  erros = []
    if(req.body.categoria == "0"){
        erros.push({texto: "Categorias inválida, registre uma categoria!"})
    }
    if(erros.length > 0){
        res.render("admin/postagensnova", {erros: erros})
    }else{
        const imagemName = path.basename(req.file.path)
        const novaPostagem = {
            imagem: imagemName,
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagens(novaPostagem).save().then(()=>{
            console.log("postagem criada")
            req.flash("success_msg", "postagem criada")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "erro ao criar postagem")
            res.redirect("/admin/postagens")
        })
    }
})

module.exports = router