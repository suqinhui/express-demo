var express = require('express');
var router = express.Router();
// 实现与MySQL交互
var mysql = require('mysql');
var config = require('../model/config');
// 使用连接池，提升性能
var pool = mysql.createPool(config.mysql);
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', {title: 'login'});
});
router.post('/userLogin', function (req, res, next) {
  var username = req.body.username;//获取前台请求的参数
  var password = req.body.password;
  pool.getConnection(function (err, connection) {
    //先判断该账号是否存在
    var $sql = "select * from users where username=?";
    connection.query($sql, [username], function (err, result) {
      var resultJson = result;
      console.log(resultJson.length);
      if (resultJson.length === 0) {
        result = {
          code: 300,
          msg: '该账号不存在'
        };
        res.json(result);
        connection.release();
      } else {  //账号存在，可以登录，进行密码判断
        var $sql1 = "select password from users where username=?";
        connection.query($sql1, [username], function (err, result) {
          var temp = result[0].password;  //取得数据库查询字段值
          console.log(temp);
          if (temp == password) {
            result = {
              code: 200,
              msg: '密码正确'
            };
          } else {
            result = {
              code: 400,
              msg: '密码错误'
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
