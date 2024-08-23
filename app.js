const express = require('express')
const app = express()
const path = require('path')

//CONFIGURAÇÕES
   //HANDLEBARS
      const handlebars = require('express-handlebars')
      app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
      app.set('view engine', 'handlebars')
   //BODY-PARSER
      const bodyParser = require('body-parser')
      app.use(bodyParser.urlencoded({extended: false}))
      app.use(bodyParser.json())
   //MONGOOSE
      const mongoose = require('mongoose')
      const db = require("./config/db")
      mongoose.connect(db.mongoURI).then(()=>{
         console.log('Conexão com mongoDB estabelecida!')
      }).catch((err)=>{
         console.log('erro ao acessar o banco de Dados: '+err)
      })
      
   //MIDLLEWARES:
      //PASSPORT
         const passport = require("passport")
         require("./config/auth")(passport)
      //CONFIGURAÇÃO:
         const session = require('express-session')
         const flash = require('connect-flash')
         app.use(session({
            secret: 'chaveAlbertLima@123',
            resave: true,
            saveUninitialized: true
         }))

         app.use(passport.initialize())//é importante essa parte estar entre a session() e o flash()
         app.use(passport.session())

         app.use(flash())
      //APLICAÇÃO:
         app.use((req, res, next)=>{
            res.locals.success_msg = req.flash("success_msg")//mensagem de sucesso do tipo flash
            res.locals.error_msg = req.flash("error_msg")//mensagem de erro do tipo flash
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
         })
   //PUBLIC
      app.use(express.static(path.join(__dirname, 'public')))

//ROTAS
   //USER
   const user = require('./routes/users')
   app.use('/user', user)

   require('./modules/usuarios')
   const Usuarios = mongoose.model('usuarios')
   //ADM
   const admin = require('./routes/admin')
   app.use('/admin', admin)

      //rota princial de toda a aplicação
         require("./modules/postagem")
         const Postagens = mongoose.model("postagens")
         app.get("/", (req, res)=>{
            res.render("index")
            /*Postagens.find().populate().sort({data: "desc"}).lean().then((postagens)=>{
               res.render("index", {postagens: postagens})
            }).catch((err)=>{
               req.flash("error_msg", "houve um erro interno")
               res.redirect("/404")
            })*/
         })
         app.get("/404", (req, res)=>{
            res.send("erro 404")
         })
         
   app.get("/postagem/:slug", (req, res)=>{
      Postagens.findOne({slug: req.params.slug}).lean().then((postagens)=>{
         if(postagens){
            res.render("postagem/index", {postagens: postagens})
         }else{
            req.flash("error", "essa postagem não existe")
            res.redirect("/")
         }
      }).catch((err)=>{
         req.flash("erro_msg", "houve um erro interno")
         res.redirect("/")
      })
   })

   require("./modules/categorias")
   const Categoria = mongoose.model("categorias")
   app.get("/categorias", (req, res)=>{
      Categoria.find().lean().then((categorias)=>{
         res.render("categorias/index", {categorias: categorias})
      }).catch((err)=>{
         req.flash("error_msg", "erro ao listar categorias")
         req.redirect("/")
      })
   })

   app.get("/categorias/:slug", (req, res)=>{
      Categoria.findOne({slugCategoria: req.params.slug}).lean().then((categorias)=>{
         if(categorias){
            Postagens.find({categoria: categorias._id}).lean().then((postagens)=>{
               res.render("categorias/postagens", {postagens: postagens, categoria: categorias})

            }).catch((err)=>{
               req.flash("error_msg", "houve um erro ao listar os posts!")
               res.redirect("/")
            })
         }else{
            req.flash("error_msg", "categoria não existe")
            res.redirect("/")
         }
      }).catch((err)=>{
         req.flash("error_msg", "houve um erro ao listar as postagens")
         res.redirect("/")
      })
   })

const port =  8081
app.listen(port, ()=>{
   console.log('servidor rodando perfeitamente')
})