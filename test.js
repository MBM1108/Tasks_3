const express=require('express')
const {query, validationResult,body, matchedData}=require('express-validator')

const app=express()
const path=require('path')
const fs=require('fs')
let database=require('./books.json')


app.use(express.urlencoded({extended:false}))
app.use(express.json())

/*const database=[
  {"id":1,"title":"title 1","author":"Sharif 1"},
  {"id":2,"title":"title 2","author":"author 2"},
  {"id":3,"title":"title 3","author":"author 3"},
  {"id":4,"title":"title 4","author":"author 4"}
  
]*/
const supporter = (req,res,next)=>{
  const {params:{id},}=req
 const parsedID=parseInt(id)
 console.log(parsedID)
 if(isNaN(parsedID)) return res.sendStatus(400)
 const findUserIndex=database .findIndex((user)=>user.id===parsedID)
 if(findUserIndex===-1) return res.sendStatus(404)
 req.findUserIndex=findUserIndex
next()  
} 
app.get('/books',(req,res) => {
/*res.send([
{"id":1,"title":"title 1","author":"Sharif 1"},
{"id":2,"title":"title 2","author":"author 2"},
{"id":3,"title":"title 3","author":"author 3"},
{"id":4,"title":"title 4","author":"author 4"}
])*/
/*res.sendFile(path.join(__dirname,'books.json'))*/
res.send(database)
})

app.get('/users',
query("filter")
.isString()
.notEmpty()
.withMessage("Must be not empty")
.isLength({min:3,max:10})
.withMessage("Must be at least 3-10 characters"), 
(req,res)=>{
  console.log(req.query);
  const result=validationResult(req)
  //console.log(req["express-validator#contexts"])
  console.log(result)
  const {query:{filter,value}}=req;
    if(filter&&value)
    return res.send(database.filter((user)=> user[filter].includes(value))); 
  return res.send(database)
})

app.get('/books/:id',supporter,(req,res) => {
const{findUserIndex}=req
const findUser=database[findUserIndex]
if(!findUser) return res.send('<h1>not found</h1>')
  res.send(findUser) 
})

app.get('/adding',(req,res)=>{
  res.send(`<html>
  <head>
      <title>Yangi kitob qo'shish</title>
  </head>
  <body>
      <form action="/users" method="POST">
          <label >kitob nomi</label>
          <br>
          <input type="text" name="title">
          <br>
          <label >avtor nomi</label>
          <br>
          <input type="text" name="author">
          <br>
          <button>Send </button>
      </form>
  </body>
</html>`)
})

app.post(
  '/users',
   body('title')
  .notEmpty()
  .withMessage('You should enter message title')
  .isLength({min:5,max:52})
  .withMessage('Your message range should 5-10 character')
  .isString()
  .withMessage('You should enter string this place')
  ,body('author')
  .notEmpty()
  .withMessage('You should enter message author')
  .isLength({min:5,max:52})
  .withMessage('Your author range should 5-10 character')
  .isString()
  .withMessage('You should enter author this place')
   
  , (req,res)=>{
    const result=validationResult(req)
    console.log(result)
    if (!result.isEmpty) return res.status(400).send({errors:result.array()})
      const data=matchedData(req)
 
  const newUser= {id: database[database.length-1].id+1,...data}
  console.log(newUser)
  database.push(newUser)
  fs.writeFile('books.json', JSON.stringify(database), 'utf8', (err) => {
    if (err) {
        console.error('Error writing file:', err);
        return;
    }
    console.log('Browser data saved to books.json');
}); 
  
  return res.status(200).send(database)
  })
app.put('/books/:id',supporter,(req,res)=>{
 
const {body,findUserIndex}=req
  console.log(findUserIndex)
  database[findUserIndex]={id:database[findUserIndex].id,...body}
  console.log(database)
  fs.writeFile('books.json', JSON.stringify(database), 'utf8', (err) => {
    if (err) {
        console.error('Error editing file:', err);
        return;
    }
    console.log('Browser data edited in books.json');
}); 

  
  return res.sendStatus(200)
  
}   
)

app.patch('/books/:id',supporter,(req,res)=>{
 
  const { body, findUserIndex }=req
    console.log(findUserIndex)
    database[findUserIndex]={...database[findUserIndex],...body}
    console.log(database)
    fs.writeFile('books.json', JSON.stringify(database), 'utf8', (err) => {
      if (err) {
          console.error('Error editing file:', err);
          return;
      }
      console.log('Browser data edited in books.json');
  }); 
  
    return res.sendStatus(200)
   
  
  }   
  )

  app.delete('/books/:id',supporter, (req,res)=>{
  const {findUserIndex}=req
  database.splice(findUserIndex,1)
  console.log(database)
  fs.writeFile('books.json', JSON.stringify(database), 'utf8', (err) => {
    if (err) {
        console.error('Error editing file:', err);
        return;
    }
    console.log('Browser data edited in books.json');
}); 

  return res.sendStatus(200) 
  
     
    }   
    )  
const PORT=process.env.PORT||2200
app.listen(PORT,()=>{
    console.log('Just working:'+PORT)
})