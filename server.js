const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// قاعدة البيانات
const db = new sqlite3.Database('./database.sqlite', err => {
  if(err) console.error(err.message);
  else console.log('✅ قاعدة البيانات جاهزة');
});

// إنشاء جدول المستخدمين (الرقم الجامعي فقط لتسجيل الدخول)
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  university_id TEXT UNIQUE,
  role TEXT DEFAULT 'عضو',
  points INTEGER DEFAULT 0
)`);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// تسجيل عضو جديد
app.post('/signup', (req,res)=>{
  const {name, university_id} = req.body;
  db.run("INSERT INTO users (name, university_id) VALUES (?,?)",[name, university_id], function(err){
    if(err) return res.send({status:'fail', message:'الرقم الجامعي مستخدم بالفعل'});
    res.send({status:'ok', message:'تم إنشاء الحساب بنجاح'});
  });
});

// تسجيل الدخول
app.post('/login', (req,res)=>{
  const {university_id} = req.body;
  db.get("SELECT * FROM users WHERE university_id=?",[university_id],(err,row)=>{
    if(err) return res.send({status:'error', message:err.message});
    if(!row) return res.send({status:'fail', message:'الرقم الجامعي غير مسجل'});
    res.send({status:'ok', user: row});
  });
});

// بيانات العضو
app.get('/profile/:university_id',(req,res)=>{
  db.get("SELECT name,university_id,points,role FROM users WHERE university_id=?",[req.params.university_id],(err,row)=>{
    if(err) return res.send({status:'error', message:err.message});
    res.send({status:'ok', user: row});
  });
});

// إضافة نقاط للمشرف
app.post('/addPoints',(req,res)=>{
  const {university_id, points} = req.body;
  db.run("UPDATE users SET points=points+? WHERE university_id=?",[points,university_id],function(err){
    if(err) return res.send({status:'error', message:err.message});
    res.send({status:'ok', message:'تمت إضافة النقاط'});
  });
});

// جلب كل الأعضاء
app.get('/allUsers',(req,res)=>{
  db.all("SELECT name,university_id,points,role FROM users",[],(err,rows)=>{
    if(err) return res.send({status:'error', message:err.message});
    res.send({status:'ok', users: rows});
  });
});

app.listen(PORT, ()=>console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`));
