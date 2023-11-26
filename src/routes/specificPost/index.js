const express = require('express')
const { ObjectId } = require('mongodb')
const Post = require('../../models/posts')
var router = express.Router()

router.get('/post/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await Post.findOne(query)
    res.send(result)
})

module.exports = router