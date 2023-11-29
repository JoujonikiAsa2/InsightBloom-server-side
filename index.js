const express = require('express')
const app = express()
const cors = require('cors')
require("dotenv").config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5001

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


app.get('/', (req, res) => {
  res.send('Hey! InsightBloom in running..........')
})

async function run() {
  try {
    const postsCollection = client.db('forumDatabase').collection('posts')
    const commentsCollection = client.db('forumDatabase').collection('comments')
    const userCollections = client.db('forumDatabase').collection('users')
    const paymentCollections = client.db('forumDatabase').collection('payments')
    const announcementCollections = client.db('forumDatabase').collection('announcements')
    const reportCollection = client.db('forumDatabase').collection('reports')
    const searchCollections = client.db('forumDatabase').collection('search')

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
    app.get("/post", async (req, res) => {
      try {
        const posts = await postsCollection.find().toArray()
        res.send(posts)
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    // to get all post
    app.get("/api/post", async (req, res) => {
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      try {
        const posts = await postsCollection.find()
          .skip(page * size)
          .limit(size)
          .sort({ time: -1 })
          .toArray()
        res.send(posts)
        console.log("pagination", req.query, page, size)
      }
      catch {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    // totalPost count used for pagination
    app.get('/api/totalPost', async (req, res) => {
      try {
        const post = req.body
        const result = await postsCollection.estimatedDocumentCount(post)
        res.send({ totalPost: result })
      }
      catch {
        res.status(500).json({ error: 'Internal Server Error' });
      }
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

    // post  a post
    app.post("/api/post", async (req, res) => {
      try {
        const post = req.body
        const result = await postsCollection.insertOne(post)
        res.send(result)
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })


    // create unique user profile at database
    app.post('/users', async (req, res) => {
      try {
        const user = req.body
        console.log("User hit here")
        const query = { email: user.email }
        const existingUser = await userCollections.findOne(query)
        if (existingUser) {
          return res.send({ message: "User already exists", insertedId: null })
        }
        const result = await userCollections.insertOne(user)
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
      try {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await postsCollection.findOne(query)
        res.send(result)
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    // post of each user
    app.get('/post/:email', async (req, res) => {
      const email = req.params.email;
      const query = { authorEmail: email };

      try {

        const postsCursor = postsCollection.find(query);
        const posts = await postsCursor.sort({ time: -1 }).toArray();
        res.send(posts);

      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });

      }
    });

    app.patch('/api/post/:id', async (req, res) => {
      const id = req.params.id
      const post = req.body
      const filter = { _id: new ObjectId(id) }
      try {
        const updatedDOc = {
          $set: {
            upVote: post.upVote,
            downVote: post.downVote
          }
        }
        const result = await postsCollection.updateOne(filter, updatedDOc)
        console.log(result, post.upVote, post.downVote)
        res.send(result)
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    // post api for comment
    app.post('/api/comments', async (req, res) => {
      try {
        const comment = req.body
        const result = await commentsCollection.insertOne(comment)
        res.send(result)
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    // get all comment data
    app.get('/api/comments', async (req, res) => {
      try {
        const comment = await commentsCollection.find().toArray()
        res.send(comment)
      }
      catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });

      }
    })

    // get comment data by post
    app.get('/api/comments/post/:post_id', async (req, res) => {
      try {
        const post_id = req.params.post_id
        const query = { post_id: post_id }
        const result = await commentsCollection.find(query).toArray()
        res.send(result)
      }
      catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });

      }
    })

    // allPayment
    app.post('/create-payment-intent', async (req, res) => {
      try {
        const { price } = req.body
        const amount = parseInt(price * 100)

        console.log("Amount inside cart", amount)

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method_types: ['card']
        })

        res.send(
          {
            clientSecret: paymentIntent.client_secret
          })
      }
      catch {
        error => console.log(error)
      }
    })

    app.get('/payments/:email', async (req, res) => {
      const query = { email: req.params.email }
      try {
        if (req.params.email !== req.decoded.email) {
          return res.status(403).send({ message: 'Forbidden Access' })
        }
        const result = await paymentCollections.find(query).toArray()
        res.send(result)
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });

      }
    })

    app.post('/payments', async (req, res) => {
      try {
        console.log("Yes user hit the payment post")
        const payment = req.body;
        const paymentResult = await paymentCollections.insertOne(payment);
        console.log('payment info', payment);
        res.send({ paymentResult })
      }
      catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });

      }
    })



    // user
    app.get("/users", async (req, res) => {
      try {
        // console.log(req.headers)
        const users = userCollections.find()
        const result = await users.toArray()
        res.send(result)
      } catch (error) {
        console.log("Can not get data from users: ", error)

      }
    })

    app.get('/users/email/:email', async (req, res) => {
      try {
        const email = req.params.email
        console.log(email)
        const filter = { email: email }
        const result = await userCollections.findOne(filter)
        console.log("Dashboard email is here ")
        res.send(result)
      } catch (error) {
        console.log("Dashboard email is here ", error)
      }
    })

    app.get('/users/adminRoll/:email', async (req, res) => {
      try {
        const email = req.params.email;

        const query = { email: email };
        const user = await userCollections.findOne(query);
        let admin = false;
        if (user) {
          admin = user?.role === 'admin';
        }
        res.send({ admin });
      } catch (error) {
        console.log("Can not get admin data by email: ", error)

      }
    })

    app.patch('/users/admin/:name', async (req, res) => {
      try {
        const name = req.params.name
        const filter = { name: name }
        const updatedDoc = {
          $set: {
            role: 'admin',
          }
        }
        const result = await userCollections.updateOne(filter, updatedDoc)
        res.send(result)
      } catch (error) {
        console.log("Something is wrong: ", error)

      }
    })

    app.patch('/users/:id', async (req, res) => {
      try {
        const id = req.params.id
        console.log(id)
        const filter = { _id: new ObjectId(id) }
        const updatedDoc = {
          $set: {
            membership: 'Gold',
          }
        }
        const result = await userCollections.updateOne(filter, updatedDoc)
        res.send(result)
      } catch (error) {
        console.log("Failed to added a user role: ", error)

      }
    })

    app.delete('/api/post/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const result = await postsCollection.deleteOne(filter)
      res.send(result)
    })

    // nummber of comment
    app.get('/commentCount', async (req, res) => {
      const comments = res.body
      const totalComment = await commentsCollection.estimatedDocumentCount(comments)
      res.send({ totalComment: totalComment })
    })

    // nummber of user
    app.get('/userCount', async (req, res) => {
      const users = res.body
      const totalUser = await userCollections.estimatedDocumentCount(users)
      res.send({ totalUser: totalUser })
    })

    // post an announcement post
    app.post("/api/announcement", async (req, res) => {
      try {
        const announcement = req.body
        const result = await announcementCollections.insertOne(announcement)
        res.send(result)
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    // get announcement
    app.get("/api/announcement", async (req, res) => {

      const announcement = announcementCollections.find()
      const result = await announcement.toArray()
      res.send(result)
    })

    // get announcement count
    app.get('/announcementCount', async (req, res) => {
      const announcements = res.body
      const totalAnnouncement = await announcementCollections.estimatedDocumentCount(announcements)
      res.send({ totalAnnouncement: totalAnnouncement })
    })

    app.post("/api/reports", async (req, res) => {
      const report = req.body
      const result = await reportCollection.insertOne(report)
      res.send(result)
    })

    app.get("/api/reports", async (req, res) => {
      const report = req.body
      const result = await reportCollection.find().toArray()
      res.send(result)
    })
    app.patch("/api/reports/:id", async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedDOc = {
        $set: {
          action: "deleted"
        }
      }
      const result = await reportCollection.updateOne(filter, updatedDOc)
      res.send(result)
    })

    app.delete('/api/comments/:comment_id', async (req, res) => {
      try {
        const comment_id = req.params.comment_id
        console.log(comment_id)
        const query = { _id: new ObjectId(comment_id) }
        const result = await commentsCollection.deleteOne(query)
        res.send(result)
      }
      catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });

      }
    })


    app.get('/posts/:tag', async (req, res) => {
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      const tag = req.params.tag
      const filter = { tag: tag }
      try {
        const posts = await postsCollection.find(filter)
          .skip(page * size)
          .limit(size)
          .sort({ time: -1 })
          .toArray()
        res.send(posts)
        console.log("pagination", req.query, page, size)
      }
      catch {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })


    app.get('/searchResult/:tag', async (req, res) => {
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      const tag = req.params.tag
      const filter = { tag: tag }
      try {
        const searchResult = await postsCollection.countDocuments(filter)
        res.send({ totalPost: searchResult })
        // console.log("pagination", req.query, page, size)
      }
      catch {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    })

    app.post('/api/search', async (req, res) => {
      const searchValue = req.body
      const result = await searchCollections.insertOne(searchValue)
      res.send(result)
    })


    // app.get('/api/search/:tag', async(req,res)=>{
    //   const tag = req.params.tag
    //   const filter = {search_tag: tag}
    //   try {
    //     const searchResult = await searchCollections.countDocuments(filter)
    //     res.send({totalSearch: searchResult})
    //     // console.log("pagination", req.query, page, size)
    //   }
    //   catch {
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
    // })


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