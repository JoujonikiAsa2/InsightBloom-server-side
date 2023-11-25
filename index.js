const express = require('express')
const app = express()
require("dotenv").config()
const port = process.env.PORT || 5000

const { MongoClient, ServerApiVersion } = require('mongodb');
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

    app.get('/posts', async (req, res) => {
      const result = await postsCollection.find().toArray()
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