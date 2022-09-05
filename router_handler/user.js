//导入数据库操作模块
const db = require('../db/index');
//导入bcryptjs(密码加密)包
const bcrypt = require('bcryptjs')
//导入生成token的包
const Jwt = require('jsonwebtoken');
//导入全局配置文件
const config = require('../config');

/*
在这里定义和用户相关的路由处理函数，供/router/user.js使用
*/
//注册用户的处理函数
exports.regUSer = (req, res) => {
    //获取客户端提交给服务器的用户信息
    const userinfo = req.body

    //定义sql语句，查询用户名是否被占用
    const sqlStr = 'select * from ev_users where username=?'
    db.query(sqlStr, userinfo.username, (err, results) => {
        //执行sql语句失败
        if (err) {
            return res.cc(err)
        }
        //判断用户名是否被占用
        if (results.length > 0) {
            return res.cc('用户名已被占用，请更换其他用户名！')
        }
        //调用bcrypt.hashSync对密码进行加密
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        //定义插入新用户SQL语句
        const sql = 'insert into ev_users set ?'
        //调用db.query执行SQL语句
        db.query(sql, { username: userinfo.username, password: userinfo.password }, (err, results) => {
            //判断sql语句是否执行成功
            if (err) {
                return res.cc(err)
            }
            //判断影响行数是否为 1
            if (results.affectedRows != 1) {
                return res.cc('注册失败，请稍后再试！')
            }
            //注册成功
            res.cc('注册成功', 0)
        })
    })
}
//登陆的处理函数
exports.login = (req, res) => {
    //接受表单数据
    const userinfo = req.body
    //定义sql语句
    const sql = 'select * from ev_users where username=?'
    //执行sql语句根据用户名查询用户信息
    db.query(sql, userinfo.username, (err, results) => {
        //执行sql语句失败
        if (err) { return res.cc(err) }
        //执行sql成功，但获取到的条数不等于一
        if (results.length != 1) { return res.cc('登录失败!') }
        //判断密码是否正确
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
        if (!compareResult) { return res.cc('登录失败') }
        //在服务器端生成token字符串
        const user = { ...results[0], password: '', user_pic: '' }
        //对用户信息进行加密，生成token字符串
        const tokenStr = Jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
        //调用res.send方法将token返回给客户端
        res.send({
            status: 0,
            message: '登录成功',
            token: 'Bearer ' + tokenStr
        })

    })
}