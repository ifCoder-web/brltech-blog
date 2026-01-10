const mongoose = require("mongoose");

const db = async () =>{
    await mongoose.connect(`mongodb+srv://${process.env.DB_LOGIN}:${process.env.DB_PASS}@cluster0.lpwdz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        console.log("DB connect!")
    }).catch((error) => {
        console.error("Erro ao se conectar com o banco de dados: "+error)
    })
}

mongoose.connection.on('error', err => {
	console.error("Erro interno DB: "+err)
})

module.exports = db()