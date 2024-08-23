module.exports = {
    eUser: function(req, res, next){
        if(req.isAuthenticated()){
            return next()
        }
        req.flash("error_msg", "Cadastre-se para ter acesso a todo o conteúdo"  )
        res.redirect("/")
    },
}