const express = require('express')
const applyMiddlewares = require('./middlewares/applyMiddlewares')
const globalErrorHandler = require('./utils/globalErrorhandle')
const connectDB = require('./db/connectDB')
const app = express()
const port = process.env.PORT || 5000
const allPostsRoutes = require('./routes/allPosts')
const uniquePostsRoutes = require('./routes/uniqueTag')


// import the middlewares
applyMiddlewares(app)

// get all post
app.use('/api',allPostsRoutes)
app.use('/api',uniquePostsRoutes)

// Check if the server is running  
app.get('/health', (req, res) => {
    res.send('InsightBloom is running.........')
})

// handle error for all method 
app.all("*", (req, res, next)=>{
    const error = new Error(`The requested [${req.url}] is invalid`)
    error.status = 404
    next(error)
})

// error handler
app.use(globalErrorHandler);

const main=async ()=>{
    await connectDB()
    app.listen(port, () => {
        console.log(`Car Doctor Server is running on port ${port}`);
    });
   
}


main()