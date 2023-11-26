const Post = require("../../models/posts");
var express = require("express")
var router = express.Router()

router.get('/posts/popular', async (req, res) => {
    try {
        const page = parseInt(req.query.page)
        const size = parseInt(req.query.size)
        const posts = await Post.aggregate([
            {
                $addFields: {
                    voteDifference: { $subtract: ['$upVote', '$downVote'] },
                },
            },
            {
                $sort: { voteDifference: -1 },
            },
        ])
            .skip(page * size)
            .limit(size);

        res.send(posts);
        // console.log("pagination", req.query, page, size)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router