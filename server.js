const express = require('express');
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');
const mongo = require('mongodb');
const nodemailer = require('nodemailer');
const io = require('socket.io')(http);
const date = require('./modules/Date.js');
const mongoClient = mongo.MongoClient;
//mongo host
const url = 'mongodb://localhost:27017/mydb'

//server connection
console.log('Connecting to server...');
http.listen(5000, function () {
  console.log('Server is ready');
});

//static
app.use(express.static('src'));
app.use(express.static('static'))


function getstring() {
  var poid = '';
  const list = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
  for (var i = 0; i < 10; i++) {
    rand = list[Math.round(Math.random()*61)];
    poid = poid + rand;
  }
  return poid;
}

//socket
io.on('connection', function (socket) {
  console.log('Connection');

  //check username exists
  socket.on('checkUsername', function (user) {
    mongoClient.connect(url,{useUnifiedTopology:true}, function (err, db) {
      if(err) return console.log('err4: '+err.message);
      else {
        db.db("main_db").collection("userInfo").find({"username": user}).toArray(function (e, res) {
          if (err) return console.log('err6: '+err.message);
          else {
            if (res != '') {
              socket.emit('isUsr', true)
            }else {
              socket.emit('isUsr', false)
            }
          }
          db.close();
        })
      }
    })
  });
  socket.on('checkEmail', function (email) {
    mongoClient.connect(url,{useUnifiedTopology:true}, function (err, db) {
      if(err) return console.log('err4: '+err.message);
      else {
        db.db("main_db").collection("userInfo").find({"email.e": email}).toArray(function (e, res) {
          if (err) return console.log('err6: '+err.message);
          else {
            if (res != '') {
              socket.emit('isEmail', true)
            }else {
              socket.emit('isEmail', false)
            }
          }
          db.close();
        })
      }
    })
  });

  //get sign up information
  socket.on('usrinfo', function (info) {
    var name = info.name, username = info.username, email = info.email, pass = info.pass;
    mongoClient.connect(url,{useUnifiedTopology:true}, function(err, db) {
      if (err) return console.log('err7: '+err.message);
      var insertInfo = {
        name: name,
        username: username,
        email: {e:email, v:'Not verified'},
        pass: pass,
        verified:false,
        plans:[],
        suggestions:[],
        followers:[],
        followings:[],
        friends:[],
        friendReqFromMe:[],
        friendReqToMe:[],
        searchClick:0
      };
      db.db("main_db").collection("userInfo").insertOne(insertInfo, function(errInfo, res) {
        if (errInfo) return console.log('err8: '+errInfo.message);
        socket.emit('siggnUpOk', {status:'ok'});
        db.close();
      });
    });
  })

  //Login Handling
  socket.on('verify', function (v) {
    var loginUser = v.loginUser, loginPass = v.loginPass;
    let name, username, cert, proPic;
    mongoClient.connect(url,{useUnifiedTopology:true},function (err, db) {
      if (err) return console.log('err9: '+err.message);
      else {
        db.db("main_db").collection("userInfo").find({$and :[{"username":loginUser},{'pass':loginPass}]}).toArray(function (errVerify, resVerify) {
          if (errVerify) return console.log('err10: '+errVerify.message);
          else {
            if (resVerify == '') {
              socket.emit('verifyRes', {name, username, proPic, cert});
            }else {
              name = resVerify[0].name;
              username = resVerify[0].username;
              cert = resVerify[0].verified;
              if (resVerify[0].proPic) {
                proPic = resVerify[0].proPic;
              }
              socket.emit('verifyRes', {name, username, proPic, cert});
            }
          }
        })
        db.db(loginUser).collection("plans").find({}).toArray(function (errVerify, resVerify) {
          if (errVerify) return console.log('err10: '+errVerify.message);
          else {
            socket.emit('loadPlans', resVerify);
          }
        })
      }
    })
  })

  //getting table
  socket.on('table',function (t){
    let plan = t.table;
    mongoClient.connect(url,{useUnifiedTopology:true},function (err, db) {
      if (err) return console.log('err10: '+err.message);
      else {
        var pSId = date.dateTime().replace(' ', '').replace(':','').replace(':','').replace(':','').replace('-','').replace('-','');
        var strng = getstring();
        plan['planId'] = t.user +pSId+strng+'taBle';
        plan['author'] = t.user;
        plan['likes'] = [];
        plan['replies'] = {};
        plan['watchs'] = [];
        plan['uses'] = {};
        plan['verify'] = false;
        plan['dateTime'] = date.dateTime();
        plan['modifyTime'] = date.dateTime();
        db.db('main_db').collection('userInfo').updateOne({username:t.user},{$push:{plans:{planId:plan['planId'],title:plan.title,status:plan.condition,verify:plan.verify}}},function (e, res1) {
          if (e) return console.log('err110: '+e.message);
        })
        db.db(t.user).collection('plans').insertOne(plan,function (e, res) {
          if (e) return console.log('err11: '+e.message);
          db.close();
          socket.emit('giveTable', plan);
        })
      }
    })
  })

  //changing plan status
  socket.on('changeCondition', function (c) {
    let u = c.loginUser, pID = c.pID, s = c.status, preCond;
    mongoClient.connect(url,{useUnifiedTopology:true},function (err, db) {
      if (err) return console.log('err14: '+err.message);
      db.db(u).collection('plans').updateOne({planId:pID},{$set:{condition:s}},function (e, r) {
        if (e) return console.log('err12: '+e.message);
        io.emit('chngCondOK', {u, pID, s});
        db.db('main_db').collection('userInfo').updateOne({username:'mstfsrmd','plans.planId':pID},{$set:{'plans.$.status':s}},function (eE, rR) {
          if (eE) return console.log('err23: '+eE.message);
          db.close();
        })
      })
    });
  })


  //like a plan
  socket.on('like', function (l) {
    let u = l.loginUser, pId = l.pID;
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      if (err) return console.log('err16: '+err.message);
      db.db(u).collection('plans').updateOne({planId:pId},{$push:{likes:u}},function (e, r) {
        if (e) return console.log('err13: '+e.message);
        db.close();
      })
    })
  })
  //unlike a plan
  socket.on('unlike', function (l) {
    let u = l.loginUser, pId = l.pID;
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      if (err) return console.log('err17: '+err.message);
      db.db(u).collection('plans').updateOne({planId:pId},{$pull:{likes:u}},function (e, r) {
        if (e) return console.log('err18: '+e.message);
        db.close();
      })
    })
  })
  //watch a plan
  socket.on('watch', function (l) {
    let u = l.loginUser, pId = l.pID;
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      if (err) return console.log('err19: '+err.message);
      db.db(u).collection('plans').updateOne({planId:pId},{$push:{watchs:u}},function (e, r) {
        if (e) return console.log('err20: '+e.message);
        console.log(r);
        db.close();
      })
    })
  })



  //global search
  socket.on('searchLiveResault', function (s) {
    if (s != '') {
      let srchRes=[], timeRes =[];
      mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
        if (err) return console.log('err21: '+err.message);
        else {
          db.db('main_db').collection('userInfo').find({$and:[{$or:[{username:{$regex:s, $options:'i'}},{name:{$regex:s, $options:'i'}}]},{'plans.$.status':{$nin:['prvt']}}]},{projection:{email:0, pass:0, _id:0}}).sort({searchClick:-1}).toArray(function (e, r) {
            if (e) return console.log('err22: '+e.message);
            //srchRes = r[0];
            (function search(r) {
              return  new Promise(function(resolve, reject) {
                c = 0;
                if (r != '') {
                  r.forEach((item, i) => {
                    if (r[i]) {
                      db.db(r[i].username).collection('plans').find({condition:{$nin:['prvt']}},{projection:{dateTime:1, _id:0, condition:1}}).sort({dataTime:1}).toArray(function (eE, tR) {
                        if (eE) return console.log('err23: '+eE.message);
                        //console.log(tR);
                        timeRes.push(tR);
                        srchRes.push(item);
                        console.log(tR);
                        if (i+1 == r.length) {
                          //console.log(c);
                          resolve([srchRes, timeRes])
                        }
                      })
                    }
                  });
                }else {
                  //console.log(r);
                  srchRes = null;
                  timeRes = null;
                  resolve([srchRes, timeRes])
                }
              }).then(function ([srchRes, timeRes]) {
                //console.log(srchRes);
                socket.emit('searchLiveResault', {srchRes, timeRes})
                db.close();
              })
            })(r);
          })
        }
      })
    }
  })

  //search click record
  socket.on('searchClick', function (user) {
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      db.db('main_db').collection('userInfo').updateOne({username:user},{$inc:{searchClick:1}}, function (e, r) {
        if (e) return console.log('err24: '+e.message);
        db.close();
      })
    })
  })
  //send friend request
  socket.on('sendFriendRec', function (u) {
    let from = u.loginUser, to = u.user;
    console.log(to, from);
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      db.db('main_db').collection('userInfo').updateOne({username:to},{$push:{friendReqToMe:from}}, function (e, r) {
        if (e) return console.log('err25: '+e.message);
        else {
          db.db('main_db').collection('userInfo').updateOne({username:from},{$push:{friendReqFromMe:to}}, function (e, r) {
            if (e) return console.log('err26: '+e.message);
            socket.emit('requestedForFriendship', to)
            db.close();
          })
        }
      })

    })
  })
  //cancel friend request
  socket.on('cancelFriendRec', function (u) {
    let from = u.loginUser, to = u.user;
    console.log('cancel ',to, from);
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      db.db('main_db').collection('userInfo').updateOne({username:to},{$pull:{friendReqToMe:from}}, function (e, r) {
        if (e) return console.log('err27: '+e.message);
        else {
          db.db('main_db').collection('userInfo').updateOne({username:from},{$pull:{friendReqFromMe:to}}, function (e, r) {
            if (e) return console.log('err28: '+e.message);
            socket.emit('canceledForFriendship', to)
            db.close();
          })
        }
      })

    })
  })
































  /*mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
    if (err) return console.log('err214: '+err.message);
    else {
      db.db('mstfsrmd').collection('plans').find({}).toArray(function (e, r) {
        if (e) return console.log('err242: '+e.message);
        console.log(r);
        r.forEach((item, i) => {
          db.db('main_db').collection('userInfo').updateOne({username:'mstfsrmd'},{$push:{plans: {title:item.title, status:item.condition, verify:item.verify}}},function (er, rr) {
            if (er) return console.log('err22: '+er.message);
          })
        });
      })
    }
  })*/


  //usr disconnection
  socket.on("disconnect", function (dis) {
    console.log('disconnection.');
  });
});
