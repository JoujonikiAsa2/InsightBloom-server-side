const Post = require("../../models/posts");
var express = require("express")
var router = express.Router()

router.get('/totalPost',async(req,res)=>{
    const post = req.body
    const result = await Post.estimatedDocumentCount(post)
    res.send({totalPost: result})
})

module.exports = router