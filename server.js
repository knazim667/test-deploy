 const express = require('express');
 const connectDB = require('./config/db');

 const app = express();

 // connect database

 connectDB();

 // Init Middlewear
 app.use(express.json({ extended : false}));

 app.get('/', (req,res) => res.send("Api Running"));

 //Defining Routes

 app.use('/api/users', require('./routes/api/users'));
 app.use('/api/posts', require('./routes/api/posts'));
 app.use('/api/auth', require('./routes/api/auth'));
 app.use('/api/contact', require('./routes/api/contact'));


 const PORT = process.env.PORT || 5000;

 app.listen(PORT, () => console.log('Server Started on Port : ' + PORT))