const express = require('express')
const app = express()
const port = process.env.PORT || 5000

app.get('/health', (req, res) => {
    hjadgff
    res.send('Hello World!')
})

app.all("*", (req, res, next)=>{
    const error = new Error(`The requested [${req.url}] is invalid`)
    error.status = 404
    next(error)
})

app.use((err, req, res, next)=>{
    res.status(err.status || 500 ).send({
        messsage : err.message
    })
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})