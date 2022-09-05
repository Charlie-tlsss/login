//导入express
const express = require('express');
//创建服务器实例对象
const app = express()
//导入joi包
const joi = require('joi');

//导入并配置cors中间件
const cors = require('cors');
app.use(cors())

//配置解析表单数据中间件
app.use(express.urlencoded({ extended: false }))

//在路由之前封装res.cc函数
app.use((req, res, next) => {
    //status默认值为前，表示失败情况
    //err的值，可能是一个错误对象，也可能是一个错误描述字符串
    res.cc = function (err, status = 1) {
        res.send({
            // 状态
            status,
            // 状态描述，判断 err 是 错误对象 还是 字符串
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})

//在路由之前配置解析token中间件
const expressJWT = require('express-jwt')
//导入全局配置文件
const config = require('./config');
//组册全局中间件并排除掉不需验证的路由
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }))


//导入并使用用户路由模块
const userRouter = require('./router/user');
app.use('/api', userRouter)
// 导入并使用用户信息路由模块
const userinfoRouter = require('./router/userinfo')
// 注意：以 /my 开头的接口，都是有权限的接口，需要进行 Token 身份认证
app.use('/my', userinfoRouter)

//定错误级别中间件
app.use((err, req, res, next) => {
    // 数据验证失败
    if (err instanceof joi.ValidationError) return res.cc(err)
    // 捕获身份认证失败的错误
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    // 未知错误
    res.cc(err)
})


//启动服务器
app.listen(3007, () => {
    console.log('api server running at http://127.0.0.1:3007')
})