const express = require('express');
const db = require('../data/database');
const router = express.Router();
const mongoDB = require('mongodb');
const ObjectId = mongoDB.ObjectId;

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function(req, res) {
  const allPosts = await db.getDB().collection('posts').find({})
  .project({ title: 1, summary: 1, 'author.name': 1 }).toArray();
  res.render('posts-list', {posts : allPosts});
});

router.get('/new-post', async function(req, res) {
  const authors = await db.getDB().collection('authors').find().toArray();
  res.render('create-post',{authors : authors });
});

router.post ('/posts', async function(req, res) {
  const authorID =  new ObjectId(req.body.author);
  const author = await db.getDB().collection('authors').findOne({ _id : authorID })

  const newPost = {
    title : req.body.title,
    summary : req.body.summary,
    content : req.body.content,
    date : new Date(),
    author : {
      id : authorID,
      name : author.name,
      email : author.email
    }
  };
  const result = await db.getDB().collection('posts').insertOne(newPost);
  res.redirect('/posts');

});

router.get('/edit/:id', async function(req ,res) {
  const postID = new ObjectId(req.params.id);
  const targetPost = await db.getDB().collection('posts').findOne(
    {_id: postID},
    {projection: {title: 1, summary: 1, content: 1}}
);

  res.render('update-post' , {post : targetPost});
})

router.post('/edit/:id', async function(req ,res) {
  const postID = req.params.id;
    await db.getDB().collection('posts').updateOne({_id : new ObjectId(postID) } , {$set : {'title': req.body.title, 'summary': req.body.summary, 'content': req.body.content, 'date': new Date()}});
  res.redirect('/posts');
})

router.get ('/posts/:id',async function(req, res){

    const postID = req.params.id;
    let targetPost;
    if (ObjectId.isValid(postID)) {
    targetPost = await db.getDB().collection('posts').findOne(
      {_id: new ObjectId(postID)},
      {projection: {summary: 0}}
  );
  } 
if(!targetPost) {
  return res.status(404).render('404')
}
targetPost.humanReadableDate = targetPost.date.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
})
targetPost.date =targetPost.date.toISOString();
    res.render('post-detail', {post : targetPost});


})

router.post('/posts/delete/:id',async function (req, res){
  const postID = req.params.id;
  await db.getDB().collection('posts').deleteOne({_id :new ObjectId(postID)});
  res.redirect('/posts');
});


module.exports = router;