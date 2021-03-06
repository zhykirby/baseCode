const express = require('express');
const routers = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Daily = require('../models/Daily');
const Habit = require('../models/Habit');
var responseData;

routers.use(function(req,res,next){
    responseData={
        code:0,
        message:'注册成功！',
        token:"",
        userName:'',
        daily_id:''
    };
    next();
});
routers.post('/user/register',function(req,res,next){
    let username = req.body.username;
    let password = req.body.password;
    let confirm = req.body.confirm;
    if(username === ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    if(password === ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    if(confirm === ''){
        responseData.code = 3;
        responseData.message = '请输入确认密码';
        res.json(responseData);
        return;
    }
    if(password !== confirm){
        responseData.code = 4;
        responseData.message = '两次输入密码不一致';
        res.json(responseData);
        return;
    }
    if(password.length < 6){
        responseData.code = 5;
        responseData.message = "密码长度不够";
        res.json(responseData);
        return;
    }
    User.findOne({
        username:username
    }).then(function(userInfo){
        if(userInfo != null){
            responseData.code = 5;
            responseData.message = '用户名已存在';
            res.json(responseData);
            return;
        }else{
            let user = new User({
                username:username,
                password:password
            });
            user.save();
            responseData.code = 0;
            responseData.message = '注册成功！';
            res.json(responseData);
        }
    }).catch(function(error){
        console.log(error);
    });
});
routers.post('/user/login',function(req,res,next){
    let username = req.body.userName;
    let password = req.body.passWord;
    if(username == ''){
        responseData.code = 11;
        responseData.message = '用户名为空';
        res.json(responseData);
        return;
    }
    if(password == ''){
        responseData.code = 12;
        responseData.message = '密码为空';
        res.json(responseData);
        return;
    }
    User.findOne({
        username:username,
    }).then(function(userInfo){
        if(userInfo == null){
            responseData.code = 13;
            responseData.message = '用户名错误';
            res.json(responseData);
            return;
        }
        if(userInfo.password != password){
            responseData.code = 14;
            responseData.message = '密码错误';
            res.json(responseData);
            return;
        }
        else{
            const payload = {
                username:username,
                user:true
            };
            const secret = 'howie';
            const token = jwt.sign(payload,secret,{expiresIn:'1h'});
            responseData.code = 10;
            responseData.message = '登录成功~';
            responseData.token = token;
            responseData.userName = userInfo.username;
            responseData.userInfo = {
                _id : userInfo._id,
                username : userInfo.username,
                email : userInfo.email,
                describtion : userInfo.describtion,
                name : userInfo.name,
                token:token
            };
            req.cookies.set('userInfo',JSON.stringify({
                _id:userInfo._id,
                username:userInfo.username,
                token:token
            }));
            res.json(responseData);
            return;
        }
    }).catch(function(error){
        console.log(error);
    });
});
routers.post('/user/userInfo',function(req,res,next){ 
    let name = req.body.name;
    let birthday = req.body.birthday;
    let email = req.body.email;
    let describtion = req.body.describtion;
    let username = req.body.username;
    User.findOne({
        username:username
    }).then(function(userInfo){;
        userInfo.name = name;
        userInfo.birthday = birthday;
        userInfo.email = email;
        userInfo.describtion = describtion;
        return userInfo.save();
    }).then(function(newInfo){
        responseData.code = 20;
        responseData.message = '保存成功';
        res.json(responseData);
    }).catch(function(err){
        console.log(err);
    });
});
routers.post("/write",function(req,res,next){
    let title = req.body.title;
    let content = req.body.content;
    let date = req.body.date;
    let user = req.body.user;
    const daily = new Daily({
        user:user,
        title:title,
        content:content,
        date:date,
    });
    daily.save();
    responseData.code = 30;
    responseData.message = "保存成功";
    res.json(responseData);    
});
routers.post("/dailyedit",function(req,res,next){
    let title = req.body.title;
    let content = req.body.content;
    let date = req.body.date;
    let id = req.body.id;
    Daily.findById(id).then(function(dailies){
        dailies.title = title;
        dailies.content = content;
        dailies.date = date;
        return dailies.save();
    }).then(function(newdaily){
        responseData.code = 41;
        responseData.message = "修改成功";
        res.json(responseData);
    }).catch(function(e){
        console.log(e);
    });       
});
routers.post("/changePwd",function(req,res,next){
    let opwd = req.body.opwd;
    let npwd = req.body.npwd;
    let cpwd = req.body.cpwd;
    let username = req.body.user;
    if(opwd === "" || npwd === "" || cpwd === ""){
        responseData.code = 51;
        responseData.message = "输入不得为空";
        res.json(responseData);
        return;
    }
    if(npwd != cpwd){
        responseData.code = 52;
        responseData.message = "两次输入密码不一致";
        res.json(responseData);
        return;
    }
    if(npwd.length < 6){
        responseData.code = 54;
        responseData.message = "密码长度不够";
        res.json(responseData);
        return;
    }
    User.findOne({
        username:username
    }).then(function(users){
        if(opwd != users.password){
            responseData.code = 53;
            responseData.message = "输入密码错误";
            res.json(responseData);
            return;
        }
        else{
            users.password = npwd;
            users.save();
            responseData.code = 50;
            responseData.message = "修改成功~";
            res.json(responseData);
            return;
        }
    }).catch(function(e){
        console.log(e);
    });
});
routers.post("/habitWrite",function(req,res,next){
    let name = req.body.name;
    let startdate = req.body.startdate;
    let color = req.body.color;
    let describe = req.body.describe;
    let user = req.body.user;
    const habit = new Habit({
        user:user,
        name:name,
        startdate:startdate,
        color:color,
        describe:describe
    });
    habit.save();
    responseData.code = 60;
    responseData.message = "创建成功";
    res.json(responseData);
})

module.exports = routers;
