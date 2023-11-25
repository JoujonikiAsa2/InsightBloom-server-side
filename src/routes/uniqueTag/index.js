var express = require("express")
const Post = require("../../models/posts")

var router = express.Router()

router.get("/tags", async (req, res) => {
	const posts = await Post.distinct('tag').exec()
	res.send(posts)
})

module.exports = router