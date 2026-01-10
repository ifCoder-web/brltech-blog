const express = require("express");
const router = express.Router();
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");
const categorieModel = require("./Category");


router.get("/", (req, res) => {
    res.send("Categorias");
})

// ADM
    // Create
    router.get("/admin/new", adminAuth, (req, res) => {
        res.render("admin/categories/new");
    })

    // Read
    router.get("/admin", adminAuth, (req, res) => {
        // Pesquisa no DB
        categorieModel.find()
            .then(data => {
                res.render("admin/categories/index", {
                    categories: data
                })
            })
            .catch(err => {
                console.error("Erro ao consultar DB categorias: "+err);
                res.redirect("/");
            })
    })

    // Update
    router.get("/admin/edit/:id", adminAuth, (req, res) => {
        const id = req.params.id;

        // Consulta DB
        if(id == "" || id == null || id == undefined){
            console.log("Nenhum id");
            res.redirect("/");
        }else{
            categorieModel.findById(id)
            .then(data => {
                if(data == ""){
                    console.log("Nenhum dado encontrado");
                    res.redirect("/");
                }else{
                    res.render("admin/categories/edit", {
                        category: data
                    })
                }
            })
            .catch(err => {
                console.error("Erro ao consultar id: "+err);
                res.redirect("/");
            })
        }
    })

    // DB
    router.get("/admin/db", adminAuth, (req, res) => {
        // Lendo dados do DB Categories
        categorieModel.find().sort({_id: -1})
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                console.error("Erro ao consultar categorias: "+err);
                res.redirect("/");
            })
    })

/////////// POST ///////////

// Create
router.post("/admin/new", adminAuth, async (req, res) => {
    // Recebendo dados do form
    const title = req.body.title;

    await new categorieModel({
        title: title,
        slug: slugify(title, {lower: true})
    }).save()
    .then(() => {
        console.log("Categoria salva no DB");
        res.redirect(req.get("Referrer" || "/"));
    })
    .catch(err => {
        console.error("Erro ao salvar categoria: "+err);
        res.redirect("/");
    })
})

// Update
router.post("/admin/edit", adminAuth, async (req, res) => {
    // Dados do formulario
    const id = req.body.id;
    const title = req.body.title;

    await categorieModel.findByIdAndUpdate(id, {
        title: title,
        slug: slugify(title, {lower: true})
    })
    .then(() => {
        console.log("Categoria editada com sucesso!");
        res.redirect("/categories/admin");
    })
    .catch((error) => {
        console.error("Erro ao salvar categoria: "+error);
        res.redirect("/");
    });
})

// Delete
router.post("/admin/delete", adminAuth, async (req, res) => {
    const id = req.body.id;
    
    categorieModel.findById(id)
        .then(data => {
            // Validação
            if(data.articles.length > 0){
                console.log("Erro ao deletar categoria: Existem artigos relacionados");
                res.redirect("/");
            }else{
                categorieModel.findOneAndDelete(id)
                    .then(() => {
                        console.log("categoria deletada com sucesso!");
                        res.redirect(req.get("Referrer" || "/"));
                    })
                    .catch(err => {
                        console.log("Erro ao deletar categoria: "+err);
                        res.redirect("/");
                    })
            }
        })
        .catch(err => {
            console.log("Erro ao deletar categoria: "+err);
            res.redirect("/");
        })
    
})

module.exports = router;