const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghkhwep.mongodb.net/?retryWrites=true&w=majority`;

// middleware

app.use(cors())
app.use(express.json())

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

    // get request for all tags o

    app.get('/posts', async (req, res) => {
      const result = await postsCollection.find().toArray()
      res.send(result)
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {


  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  // res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))