const express = require('express');
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');
const mongo = require('mongodb');
const nodemailer = require('nodemailer');
const io = require('socket.io')(http);
const date = require('./modules/Date.js');
const mongoClient = mongo.MongoClient;
const {detect} = require('detect-browser');
const browser = detect();
var moment = require('jalali-moment');
const url = 'mongodb://localhost:27017/mydb'

//server connection
console.log('Connecting to server...');
http.listen(5000, function () {
  console.log('Server is ready');
});

//static
app.use(express.static('src'));
app.use(express.static('static'))


//string generator
function getstring() {
  var poid = '';
  const list = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
  for (var i = 0; i < 10; i++) {
    rand = list[Math.round(Math.random()*61)];
    poid = poid + rand;
  }
  return poid;
}
//code generator
function codeGenerator() {
  var a = Math.round(Math.random()*9);
  var b = Math.round(Math.random()*9);
  var c = Math.round(Math.random()*9);
  var d = Math.round(Math.random()*9);
  var e = Math.round(Math.random()*9);
  var f = Math.round(Math.random()*9);
  var code = a+''+b+''+c+''+d+''+e+''+f;
  return code;
}
console.log(moment().locale('fa').format('YYYY/M/D HH:mm:ss'));
//socket
io.on('connection', function (socket) {
  console.log('Connection');

  //send notification
  const confirmEmailNotif = [{title:'تایید ایمیل', content:` <b>هشدار مهم:</b> ما برای احراز هویت و همچنین بازیابی اطلاعات شخصی شما به یک ایمیل تایید شده نیاز داریم.<span class="confirm_email"> لطفا ایمیل خود را تایید کنید</span>. اگر ایمیل شما تایید نشود متاسفانه حساب شما پس از سه روز حذف خواهد شد. <a href="#">بیشتر بدانید</a> `}];

  socket.on('confirmEmail', function (user) {
    console.log(user);
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      if (err) return console.log('err29: '+err.message);
      db.db('main_db').collection('userInfo').find({username:user}, {projection:{_id:0, "email.e":1}}).toArray(function (e, r) {
        if (e) return console.log('err30: '+e.message);
        let userEmail = r[0].email.e;
        socket.emit('verifyEmailname', userEmail);
        //sending Authentication email
        const transporter = nodemailer.createTransport({
          host: 'smpt.gmail.com',
          port:5001,
          secure: false,
          service: 'gmail',
          auth: {
            user: 'mostafasarmad96@gmail.com',
            pass: 'M09370030491'
          }
        });
        var gen = codeGenerator();
        const mailOptions = {
          from: 'mostafasarmad96@gmail.com',
          to: ''+userEmail+'',
          subject: 'Verify your email address on Plano',
          html: `<div style="width:500px; height:700px;display:flex; flex-direction:column; justify-content:center; align-items:center; position:absolute; left:50%;top:50%;transform:translate(-50%, -50%); text-align:center;">
                <div style="width:400px; height:300px; position:relative; text-align:center;border:solid #dadce0 thin;border-radius: 8px;padding: 40px 20px;">
                  <div style="width:400px;border-bottom:solid #dadce0 thin;">
                    <h1>احراز هویت</h1>
                    <h3>کد فعالسازی آدرس ایمیل حساب شما در پلنو،<br>به نام کاربری <b style="color:#2ec6f8;">${user}</b> </h3>
                  </div>
                  <p >کد اعتبار سنجی ایمیل شما <b style="color:#2ec6f8;">${gen}</b> است.</p>
                  <p>لطفا این کد را در قسمت مشخص شده در سایت وارد نمایید.</p>
                  <p style="padding-top:70px;color:#0000008a;font-size: 9px;line-height: 18px;">اگر این نام کاربری متعلق به شما نیست، یا شما اقدام به این عملیات نکرده اید، این پیام را نادیده بگیرید.</p>
                  <div dir="rtl" style="position:relative; text-align:center;color:#0000008a;font-size: 11px;line-height: 18px;">
                    &copy۱۳۹۹ همه ی حقوق برای <a style="padding-right:0;" >پلانو</a> محفوظ است.
                  </div>
                </div>
              </div>`
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
             console.log(error);
           } else {
             console.log('Email sent: ' + info.response);
             socket.emit('verifyEmailCode', gen);
           }
        });
      })
    })
  })
  //submit email verification in database
  socket.on('emailIsVerified', function (user) {
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      if (err) return console.log('err31: '+err.message);
      db.db('main_db').collection('userInfo').updateOne({username:user}, {$set:{'email.v':true}}, function (e, r) {
        if (e) return console.log('err32: '+e.message);
        socket.emit('emailVerifySubmited')
      })
    })
  })

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
        searchClick:0,
        proPic : ''
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
    //join to myself
    socket.join(loginUser);
    socket.join(loginUser+"_personal");
    console.log('joined to '+loginUser+" and "+loginUser+"_personal");
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
              emailConfirm = resVerify[0].email.v;
              if (resVerify[0].proPic) {
                proPic = resVerify[0].proPic;
              }
              socket.emit('verifyRes', {name, username, proPic, cert});
              if (emailConfirm == 'Not verified') {
                console.log(emailConfirm);
                socket.emit('confirmEmailNotif', confirmEmailNotif)
              }
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
        plan['suggestions'] = {};
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
    let u = l.targetUser, pId = l.pID, myUser = l.loginUser, action = true;
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      if (err) return console.log('err16: '+err.message);
      db.db(u).collection('plans').updateOne({planId:pId},{$push:{likes:myUser}},function (e, r) {
        if (e) return console.log('err13: '+e.message);
        else {
          db.db('main_db').collection('userInfo').find({username:myUser},{projection:{_id:0, name:1}}).toArray(function (er, res) {
            if (er) return console.log('err33: '+er.message);
            let name = res[0].name;
            socket.broadcast.emit('changeLikeIcon', {u, pId, action})
            socket.to(u+'_personal').emit('yourPlanLiked', {myUser, pId, name})
            db.close();
          })
        }
      })
    })
  })
  //unlike a plan
  socket.on('unlike', function (l) {
    let u = l.targetUser, pId = l.pID, myUser = l.loginUser, action = false;
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      if (err) return console.log('err17: '+err.message);
      db.db(u).collection('plans').updateOne({planId:pId},{$pull:{likes:myUser}},function (e, r) {
        if (e) return console.log('err18: '+e.message);
        socket.broadcast.emit('changeLikeIcon', {u, pId, action})
        socket.to(u+'_personal').emit('yourPlanunLiked', {myUser, pId})
        db.close();
      })
    })
  })
  //watch a plan
  socket.on('watch', function (l) {
    let u = l.targetUser, pId = l.pID, myUser = l.loginUser;
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      if (err) return console.log('err19: '+err.message);
      db.db(u).collection('plans').updateOne({planId:pId},{$push:{watchs:myUser}},function (e, r) {
        if (e) return console.log('err20: '+e.message);
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
          db.db('main_db').collection('userInfo').updateOne({username:from},{$push:{friendReqFromMe:to}}, function (er, rr) {
            if (er) return console.log('err26: '+er.message);
            socket.emit('requestedForFriendship', to);
            io.to(to+"_personal").emit('requestForFriendship', from)
            db.close();
          })
        }
      })

    })
  })
  //cancel friend request
  socket.on('cancelFriendRec', function (u) {
    let from = u.loginUser, to = u.user;
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      db.db('main_db').collection('userInfo').updateOne({username:to},{$pull:{friendReqToMe:from}}, function (e, r) {
        if (e) return console.log('err27: '+e.message);
        else {
          db.db('main_db').collection('userInfo').updateOne({username:from},{$pull:{friendReqFromMe:to}}, function (er, rr) {
            if (er) return console.log('err28: '+er.message);
            socket.emit('canceledForFriendship', to)
            io.to(to+"_personal").emit('cancelForFriendship', from)
            db.close();
          })
        }
      })

    })
  })
  //accept friendShip
  socket.on('acceptFriendRec', function (u) {
    let from = u.loginUser, to = u.user;
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      db.db('main_db').collection('userInfo').updateOne({username:to},{$push:{friends:from}}, function (e, r) {
        if (e) return console.log('err34: '+e.message);
        else {
          db.db('main_db').collection('userInfo').updateOne({username:from},{$push:{friends:to}}, function (er, rr) {
            if (er) return console.log('err35: '+er.message);
            db.db('main_db').collection('userInfo').updateOne({username:to},{$pull:{friendReqFromMe:from}}, function (err, rrr) {
              if (err) return console.log('err36: '+err.message);
              db.db('main_db').collection('userInfo').updateOne({username:from},{$pull:{friendReqToMe:to}}, function (errr, rrrr) {
                if (errr) return console.log('err37: '+errr.message);
                socket.emit('acceptFriendship', to)
                io.to(to+"_personal").emit('acceptedFriendship', from)
                db.close();
              });
            });
          })
        }
      })

    })
  })
  //cancel friendShip
  socket.on('cancelFriendShip', function (u) {
    let from = u.loginUser, to = u.user;
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      db.db('main_db').collection('userInfo').updateOne({username:to},{$pull:{friends:from,friendReqToMe:from}},{"multi":true}, function (e, r) {
        if (e) return console.log('err34: '+e.message);
        else {
          db.db('main_db').collection('userInfo').updateOne({username:from},{$pull:{friends:to,friendReqFromMe:to}},{"multi":true}, function (er, rr) {
            if (er) return console.log('err35: '+er.message);
            socket.emit('FcanceledForFriendship', to)
            io.to(to+"_personal").emit('canceledFriendship', from)
            db.close();
          })
        }
      })

    })
  })

  //open user page
  socket.on('openUserPage', function (u) {
    let user = u.username, myUser = u.loginUser;
    //join to user
    socket.join(user);
    console.log('joined to '+user);
    mongoClient.connect(url, {useUnifiedTopology:true}, function (err, db) {
      db.db('main_db').collection('userInfo').find({username:user},{projection:{_id:0, email:0, pass:0, searchClick:0}}).toArray(function (e, r) {
        if (e) return console.log('err29: '+e.message);
        db.db(user).collection('plans').find({condition:{$nin:['prvt']}}).toArray(function (er, res) {
          if (er) return console.log('err29: '+er.message);
          socket.emit('openUserPage_res', {user, res, name : r[0].name, verified : r[0].verified, friends : r[0].friends, friendReqTo : r[0].friendReqToMe, friendReqFrom : r[0].friendReqFromMe, uses : r[0].uses})
        })
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
