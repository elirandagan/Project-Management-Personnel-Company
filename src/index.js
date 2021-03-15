const express = require('express')
const app_port = process.env.PORT || 3000
const app = express()
const router = express.Router()


app.set('view engine', 'ejs')

app.use(express.static('public'))


router.get('/',function(req,res){
  res.status(200).render('login')
})

router.get('/dashboard',function(req,res){
  res.status(200).render('dashboard')
})

//add the router
app.use('/', router)
module.exports = app.listen(app_port)

console.log(`app is running. port: ${app_port}`)
console.log(`http://127.0.0.1:${app_port}/`)



// const MongoClient = require('mongodb').MongoClient;
// const uri = 'mongodb+srv://Admin:<>@cluster0.6vq53.mongodb.net/ProjectManger?retryWrites=true&w=majority';
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// // eslint-disable-next-line no-unused-vars
// client.connect(err => {
//   const collection = client.db('test').collection('devices');
//   console.log(collection)
//   // perform actions on the collection object
//   client.close();
// });
