var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const mysql = require("mysql2");
const SqlString = require('sqlstring')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.locals.con = mysql.createConnection({
    host: "localhost",
    port: "3307",
    user: "usernote",
    password: "123",
    database: "usernote"
});

app.post("/newNote", (req, res)=>{
    //console.log(req.body);

    req.app.locals.con.connect(function(err){
      if(err){
        console.log(err);
      }

      let sql = `SELECT * FROM notes`;
      req.app.locals.con.query(sql, function(err, result){
        if(err){
          console.log(err);
        }
        for(obj in result){
          //If the note exist, update it!
          if(result[obj].id.toString() === req.body.id){
            console.log(req.body.noteName);
            let noteName = SqlString.escape(req.body.noteName);
            let noteContent = SqlString.escape(req.body.noteContent);
            let updateNote = `UPDATE notes SET noteName = ${noteName}, noteContent = ${noteContent} WHERE id = ${req.body.id}`
            req.app.locals.con.query(updateNote, function(err, result){
              if(err){
                console.log(err);
              }
              console.log("result: ", result);
            });
          }
        } 
      });


      //If the note does'nt exist, add it!
      if(req.body.id === "null" ){
        let noteName = SqlString.escape(req.body.noteName);
        let noteContent = SqlString.escape(req.body.noteContent);
        let addNote = `INSERT INTO notes (noteName, noteContent) VALUES (${noteName}, ${noteContent})`

        req.app.locals.con.query(addNote, function(err, result){
          if(err){
            console.log(err);
          }
          console.log("result", result);
        });  
        
      }

        
    
    });
});

app.post("/viewNote", (req, res)=>{

  req.app.locals.con.connect(function(err){
    if(err){
      console.log(err);
    }

    let printSql = `SELECT * FROM notes`;
    req.app.locals.con.query(printSql, function(err, result){
      if(err){
        console.log(err);
      }

      res.send(result);

    });
  
  });
});

app.post("/deleteNote", (req, res)=>{
  
  req.app.locals.con.connect(function(err){
    if(err){
      console.log(err);
    }

    let sql = `SELECT * FROM notes`;
    req.app.locals.con.query(sql, function(err, result){
      if(err){
        console.log(err);
      }
      for(obj in result){
        //Add deleted to the note!
        if(result[obj].id.toString() === req.body.id){
          console.log(req.body.noteName);
          let noteId = SqlString.escape(req.body.id)
          let updateNote = `UPDATE notes SET deleted = true WHERE id = ${noteId}`
          req.app.locals.con.query(updateNote, function(err, result){
            if(err){
              console.log(err);
            }
            console.log("result: ", result);
            console.log("deleted");
          });
        }
      } 
    });
  });
});




module.exports = app;
