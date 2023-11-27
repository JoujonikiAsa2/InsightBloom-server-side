const express = require('express')
const app = express()
const cors = require('cors')
require("dotenv").config()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATABASE_LOCAL_USERNAME}:${process.env.DATABASE_LOCAL_PASSWORD}@cluster0.ghkhwep.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    const postsCollection = client.db('forumDatabase').collection('posts')
    const commentsCollection = client.db('forumDatabase').collection('comments')
    const usersCollection = client.db('forumDatabase').collection('users')

    // get the popular post
    app.get('/api/post/popular', async (req, res) => {
      try {
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);

        const posts = await postsCollection.aggregate([
          {
            $addFields: {
              voteDifference: { $subtract: ['$upVote', '$downVote'] },
            },
          },
          {
            $sort: { voteDifference: -1 },
          },
        ]).skip(page * size).limit(size).toArray();

        res.send(posts);
        console.log("Popular pagination", req.query, page, size);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    // to get all post
    app.get("/api/post", async (req, res) => {
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      const posts = await postsCollection.find()
        .skip(page * size)
        .limit(size)
        .sort({ time: -1 })
        .toArray()
      res.send(posts)
      console.log("pagination", req.query, page, size)
    })

    // totalPost count used for pagination
    app.get('/api/totalPost', async (req, res) => {
      const post = req.body
      const result = await postsCollection.estimatedDocumentCount(post)
      res.send({ totalPost: result })
    })

    // get all distinct tags
    app.get("/api/tags", async (req, res) => {
      try {
        const tags = await postsCollection.aggregate([
          { $group: { _id: '$tag' } }
        ]).toArray();
    
        const distinctTags = tags.map(tag => tag._id);
    
        res.send(distinctTags);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // create unique user profile at database
    app.post('/users', async (req, res) => {
      try {
          const user = req.body
          console.log("User hit here")
          const query = { email: user.email }
          const existingUser = await usersCollection.findOne(query)
          if (existingUser) {
              return res.send({ message: "User already exists", insertedId: null })
          }
          const result = await usersCollection.insertOne(user)
          res.send(result)
      }
      catch {
          error => {
              console.log("Added data to user has an error: ", error)
          }
      }
  })
    
    // individual post find
    app.get('/api/post/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await postsCollection.findOne(query)
      res.send(result)
    })

    app.patch('api/post/:id', async (req, res) => {
      const id = req.params.id
      const post = req.body
      const filter = { _id: new ObjectId(id) }
      const updatedDOc = {
        $set: {
          upVote: post.upVote,
          downVote: post.downVote
        }
      }
      const result = await postsCollection.updateOne(filter, updatedDOc)
      console.log(result, post.upVote, post.downVote)
      res.send(result)
    })

    // post api for comment
    app.post('/api/comments', async (req, res) => {
      const comment = req.body
      const result = await commentsCollection.insertOne(comment)
      res.send(result)
    })

    // get all comment data
    app.get('/api/comments', async (req, res) => {
      const comment = await commentsCollection.find().toArray()
      res.send(comment)
    })

    // get comment data by post
    app.get('/api/comments/post/:post_id', async (req, res) => {
      const post_id = req.params.post_id
      const query = { post_id: post_id }
      const result = await commentsCollection.find(query).toArray()
      res.send(result)
    })


    // handle error for all method 
    app.all("*", (req, res, next) => {
      const error = new Error(`The requested [${req.url}] is invalid`)
      error.status = 404
      next(error)
    })

    app.use((err, req, res, next) => {
      res.status(err.status || 500).send({
        messsage: err.message,
        errors: err.errors,
      })
    })

  } catch {
    error => { console.log(error) }
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))