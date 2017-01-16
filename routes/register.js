var express = require('express');
var router = express.Router();
// 实现与MySQL交互
var mysql = require('mysql');
var config = require('../model/config');
// 使用连接池，提升性能
var pool = mysql.createPool(config.mysql);
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('register', {title: 'register'});
});
router.post('/userRegister', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var name = req.body.name; //获取前台请求的参数
  pool.getConnection(function (err, connection) {
    //先判断该账号是否存在
    var $sql = "select * from users where username=?";
    connection.query($sql, [username], function (err, result) {
      var resultJson = result;
      console.log(resultJson.length);
      if (resultJson.length !== 0) {
        result = {
          code: 300,
          msg: '该账号已存在'
        };
        res.json(result);
        connection.release();
      } else {  //账号不存在，可以注册账号
        // 建立连接，向表中插入值  数据库表名为user-info会出错
        var $sql1 = "INSERT INTO users(id, username, password, name) VALUES(0,?,?,?)";
        connection.query($sql1, [username, password, name], function (err, result) {
          console.log(result);
          if (result) {
            result = {
              code: 200,
              msg: '注册成功'
            };
          } else {
            result = {
              code: 400,
              msg: '注册失败'
            };
          }
          res.json(result); // 以json形式，把操作结果返回给前台页面
          connection.release();// 释放连接
        });
      }
    });
  });
});
module.exports = router;
