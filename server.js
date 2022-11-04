const express = require('express');
const server = express();
const expressLayouts = require('express-ejs-layouts');
const port = 3000;
const bodyParser = require('body-parser')
const route = require('./routes')

server.set('view engine', 'ejs')
server.set('views', __dirname + '/views') // memberi tahu path views
server.set('layout', 'layouts/layout')
server.use(expressLayouts)
server.use(express.static('public'))
server.use(bodyParser.urlencoded({limit:'10mb', extended:false})) // untuk menerima kiriman body dari form ejs

server.use('/',route)

server.listen(port, (req, res)=>{
  console.log(`this app run at port ${port}`)
})