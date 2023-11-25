const express = require('express')
const applyMiddlewares = require('./middlewares/applyMiddlewares')
const app = express()
const port = process.env.PORT || 5000


// import the middlewares
applyMiddlewares(app)

// Check if the server is running  
app.get('/health', (req, res) => {
    hjadgff
    res.send('Hello World!')
})

// handle error for all method 
app.all("*", (req, res, next)=>{
    const error = new Error(`The requested [${req.url}] is invalid`)
    error.status = 404
    next(error)
})

// pass the error here
app.use((err, req, res, next)=>{
    res.status(err.status || 500 ).send({
        messsage : err.message
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})