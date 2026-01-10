const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");
const categoriesModel = require("../categories/Category");
const articlesModel = require("./Article");
const User = require("../users/User");

router.get("/", (req, res) => {
    res.redirect("/");
})

// ADMIN
    // Create
    router.get("/admin/new", adminAuth, async (req, res) => {
        // Consutando dados de categorias
        await categoriesModel.find()
            .then(data => {
                res.render("admin/articles/new", {
                    categories: data,
                });
            })
            .catch(err => {
                console.error("Erro ao consultar categorias: "+err);
                res.redirect("/");
            })
    })

    // Read
    router.get("/admin", adminAuth, (req, res) => {
        // Consulta de artigos
        articlesModel.find().populate("category").sort({_id: -1})
            .then(data => {
                res.render("admin/articles/index", {
                    articles: data,
                })
            })
            .catch(err => {
                console.error("Erro ao consultar artigos: "+err);
                res.redirect("/");
            })
    })

    // Update
    router.get("/admin/update/:id", adminAuth, (req, res) => {
        id = req.params.id;

        articlesModel.findById(id).populate("category")
            .then(article => {
                categoriesModel.find({})
                    .then(categories => {
                        res.render("./admin/articles/edit", {
                            article: article.toJSON(),
                            categories:  categories.map(categories => categories.toJSON()),
                        })
                    })
                    .catch(error => {
                        console.error("Erro ao consultar categoria: "+error);
                        res.redirect("/");
                    })              
            })
            .catch(error => {
                console.error("Erro ao consultar artigo: "+error);
                res.redirect("/");
            })
    });

    // DB
    router.get("/admin/db", adminAuth, (req, res) => {
        // Consulta artigos
        articlesModel.find().sort({_id: -1}).populate("category")
            .then(data => {
                res.send(data)
            })
            .catch(error => {
                console.error("Erro ao consultar artigos: "+error);
                res.redirect("/");
            })
    })


////////////// POST //////////////

// Functions
function creatNewDate(){
    function adicionaZero(numero){
        if (numero <= 9) 
            return "0" + numero;
        else
            return numero; 
    }
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    let dataAtual = new Date();
    let dataAtualFormatada = (adicionaZero(dataAtual.getDate().toString()) + " de " + meses[(dataAtual.getMonth())] + " de " + dataAtual.getFullYear());

    return dataAtualFormatada;
}

// Create
router.post("/admin/new", adminAuth, (req, res) => {
    // data
    const title = req.body.title;
    const subTitle = req.body.subTitle;
    const slug = slugify(title, {lower: true});
    const category = req.body.category;
    const body = req.body.body;
    const img = req.body.img;
    const alt = req.body.alt;
    const abstract = req.body.abstract;
    const author = req.body.author;

    var errors = [];

    if(title == "" || title == undefined || title == null){
        errors.push("Insira o titulo do artigo.");
    }
    if(subTitle == "" || subTitle == undefined || subTitle == null){
        errors.push("Insira o Sub titulo do artigo.");
    }
    if(slug == "" || slug == undefined || slug == null){
        errors.push("Impossível criar slug do artigo.");
    }
    if(category == "" || category == undefined || category == null || category == "null"){
        errors.push("Insira a categoria do artigo.");
    }
    if(body == "" || body == undefined || body == null){
        errors.push("Insira o corpo do artigo.");
    }
    if(img == "" || img == undefined || img == null){
        errors.push("Insira a imagem destaque do artigo.");
    }
    if(alt == "" || alt == undefined || alt == null){
        errors.push("Insira o texto Alt da imagem destaque.");
    }
    if(abstract == "" || abstract == undefined || abstract == null){
        errors.push("Insira o resumo do artigo.");
    }
    if(author == "" || author == undefined || author == null){
        errors.push("Insira o nome do autor.");
    }

    if(errors.length > 0){
        console.log("Erro ao salvar artigo!");
        errors.forEach(element => {
            console.log("Error: "+element);
        })
        res.redirect("/admin/new");
    }else{
        // Salvando no DB
        new articlesModel({
            title: title,
            subTitle: subTitle,
            slug: slug,
            category: category,
            body: body,
            img: img,
            alt: alt,
            abstract: abstract,
            author: author,
            createdAtFormat: creatNewDate(),
            updatedAtFormat: creatNewDate()
        }).save()
            .then(data1 => {
                categoriesModel.updateOne({ _id: category }, {
                    $push: {articles: data1._id}
                })
                .then(data2 => {
                    UserActivation.updateOne({ _id: author }, {
                        $push: {articles: data1._id}
                    })
                    console.log("Artigo salvo no DB!");
                    res.redirect("/articles/admin");
                })
                .catch(error => {
                    console.error("Erro ao salvar artigo no DB: "+error);
                    res.redirect("/");   
                })
            })
            .catch(error => {
                console.error("Erro ao salvar artigo no DB: "+error);
                res.redirect("/");
            })
    }
});

// Update
router.post("/admin/update", adminAuth, async (req, res) => {
    // data
    const id = req.body.id;
    const title = req.body.title;
    const subTitle = req.body.subTitle;
    const slug = slugify(title, {lower: true});
    const category = req.body.category;
    const body = req.body.body;
    const img = req.body.img;
    const alt = req.body.alt;
    const abstract = req.body.abstract;
    const oldCategory = req.body.oldCategory;
    const author = req.body.author;

    // Deletando artigo da categoria
    categoriesModel.updateOne({ _id: oldCategory }, {
        $pull: {articles: id}
    })
    .then(data => {
        console.log("Artigo deletado da categoria anterior")
        // Salvando artigo na nova categoria
        categoriesModel.updateOne({ _id: category }, {
            $push: ({articles: id})
        })
        .then(data => {
            console.log("Artigo adicionado a nova categoria")
        })
        .catch(error => {
            console.error("Erro ao deletar artigo da categoria anterior")
            res.redirect("/")
        })
    })
    .catch(error => {
        console.error("Erro ao deletar artigo da categoria anterior")
        res.redirect("/")
    })

    // Atualizando dados
    articlesModel.updateOne({ _id: id }, {
        title: title,
        subTitle: subTitle,
        slug: slug,
        category: category,
        body: body,
        img: img,
        alt: alt,
        abstract: abstract,
        updatedAtFormat: creatNewDate(),
        author: author
    })
    .then(data => {
        console.log("Artigo atualizado!");
        res.redirect("/articles/admin");
    })
    .catch(error => {
        console.error("Erro ao atualizar artigo! "+error)
        res.redirect("/")
    })
});

// Delete
router.post("/admin/delete", adminAuth, (req, res) => {
    const id = req.body.id;
    const categoryId = req.body.categoryId;
    // Validação
    if(id != undefined && id != null && id != ""){
        // Deletando artigo
        articlesModel.deleteOne({ _id: id })
            .then(data => {
                categoriesModel.updateOne({ _id: categoryId }, { // Deletando categoria
                    $pull: {articles: id}
                })
                .then(() => {
                    console.log("Artigo deletado!");
                    res.redirect("/articles/admin");
                })
                .catch(error => {
                    console.error("Erro ao atualizar categoria! "+error)
                    res.redirect("/")
                })
            })
            .catch(error => {
                console.error("Erro ao deletar artigo: "+error);
                res.redirect("/");
            })
    }else{
        console.log("Artigo não encontrado");
        res.redirect('/');
    }
})

module.exports = router;