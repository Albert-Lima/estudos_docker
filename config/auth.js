const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//model de usuário
require("../modules/usuarios")
const Usuarios = mongoose.model("usuarios")


module.exports = function(passport){
    //o campo passado em usernameField vai ser o campo que eu quero analisar e como nosso sistema é baseado no email...
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done)=>{
        Usuarios.findOne({email: email}).then((usuarios)=>{
            if(!usuarios){
                return done( null, false, {message: "esta conta não existe!"})
            }
            bcrypt.compare(senha, usuarios.senha, (erro, batem)=>{
                if(batem){
                    return done(null, usuarios)
                }else{
                    return done(null, false, {message: "senha incorreta!"})
                }
            })
        })
    }))

    //serializeUser e deserializerUser servem para salvar os dados do usuário em uma sessão
    passport.serializeUser((usuarios, done)=>{
        done(null, usuarios.id)
    })
    
    passport.deserializeUser((id, done)=>{
        Usuarios.findById(id)
            .then((usuarios) => {
                done(null, usuarios);
            })
            .catch(error => {
                done(error, null);
            });
    });

}