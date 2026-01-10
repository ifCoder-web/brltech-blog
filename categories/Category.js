const mongoose = require("mongoose");
const { Schema } = mongoose;
const db = require("../db/db");

const category_schema = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    articles: [{
        type: mongoose.ObjectId,
        ref: "Articles",
    }],
    createdAt: {
        type: Date,
        default: new Date()
    }
});

const Categories = mongoose.model("Categories", category_schema);

module.exports = Categories;