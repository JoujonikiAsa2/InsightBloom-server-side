var express = require("express")
const Post = require("../../models/posts")

var router = express.Router()

router.get("/posts", async (req, res) => {
	const page = parseInt(req.query.page)
	const size = parseInt(req.query.size)
	const posts = await Post.find()
		.skip(page * size)
		.limit(size)
		.sort({ time: -1 })
	res.send(posts)
	// console.log("pagination", req.query, page, size)
})

module.exports = router