var express = require("express")
const Post = require("../../models/posts")

var router = express.Router()

router.get("/posts", async (req, res) => {
	const posts = await Post.find()
	res.send(posts)
})

module.exports = router