
const { model, Schema } = require("mongoose");

const PostsSchema = new Schema({
    'authorImage': {
        type: String,
        required: true
    },
    "authorName": {
        type: String,
        required: true
    },
    "authorEmail": {
        type: String,
        required: true
    },
    "postTitle": {
        type: String,
        required: true
    },
    "postDescription": {
        type: String,
        required: true
    },
    'tag': {
        type: String,
        required: true
    },
    "upVote": {
        type: Number,
        required: true
    },
    "downVote": {
        type: Number,
        required: true
    },

})

const Post= model("Post",PostsSchema)

module.exports = Post