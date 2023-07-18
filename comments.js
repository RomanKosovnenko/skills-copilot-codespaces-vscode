// Create web server
var express = require('express');
var router = express.Router();
var Comments = require('../models/comments');
var passport = require('passport');
var auth = require('../middlewares/auth');
var util = require('../util');

// Index
router.get('/', function(req, res){
    Comments.find({})
    .sort('-createdAt')
    .exec(function(err, comments){
        if(err) return res.json(err);
        res.render('comments/index', {comments:comments});
    });
});

// New
router.get('/new', function(req, res){
    var comment = req.flash('comment')[0] || {};
    var errors = req.flash('errors')[0] || {};
    res.render('comments/new', {comment:comment, errors:errors});
});

// create
router.post('/', function(req, res){
    req.body.user = req.user._id;
    Comments.create(req.body, function(err, comment){
        if(err){
            req.flash('comment', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/comments/new');
        }
        res.redirect('/comments');
    });
});

// show
router.get('/:id', function(req, res){
    Comments.findOne({_id:req.params.id})
    .populate('user')
    .exec(function(err, comment){
        if(err) return res.json(err);
        res.render('comments/show', {comment:comment});
    });
});

// edit
router.get('/:id/edit', function(req, res){
    var comment = req.flash('comment')[0];
    var errors = req.flash('errors')[0] || {};
    if(!comment){
        Comments.findOne({_id:req.params.id}, function(err, comment){
            if(err) return res.json(err);
            res.render('comments/edit', {comment:comment, errors:errors});
        });
    } else {
        comment._id = req.params.id;
        res.render('comments/edit', {comment:comment, errors:errors});
    }
});

// update
router.put('/:id', function(req, res){
    req.body.updatedAt = Date.now();
    Comments.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, comment){
        if(err){
            req.flash('comment', req.body);
            req.flash('errors', util.parseError(err));
            return res.redirect('/comments/'+req.params.id+'/edit');
        }
        res.redirect('/comments/'+req.params.id);
    });
});