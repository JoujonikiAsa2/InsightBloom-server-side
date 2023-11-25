const express = require('express')
const applyMiddlewares = require('./middlewares/applyMiddlewares')
const globalErrorHandler = require('./utils/globalErrorhandle')
const app = express()
const port = process.env.PORT || 5000


// import the middlewares
applyMiddlewares(app)

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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})