require("dotenv").config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const { restart } = require("nodemon")

const port = process.env.PORT || 3000

/*-------------------------------------------------------- mongoose setup --------------------------------------------------------*/
//mongoose.connect(process.env.MONGODB_ATLAS_CONNECTION_STRING)
//let db = mongoose.connection


/*-------------------------------------------------------- express setup --------------------------------------------------------*/
const app = express()

app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cors({ origin: '*', optionsSuccessStatus: 200 }))
app.disable('x-powered-by')

/*-------------------------------------------------------- mongoose functions  ----------------------------------------------------*/


/*-------------------------------------------------------- express routes --------------------------------------------------------*/
app.get('/api/test', async (req, res) => {
	res.status(200).send("get works")
})

app.post('/api/test', async (req, res) => {
	res.status(200).send("post works: " + JSON.stringify(req.body))
})

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, '/dist/index.html'));
})

app.listen(port, () => {
	console.log(`Express app listening on port ${port}`)
})