
## 项目简介

microservice_212106233 前端部分是一个基于 HTML、CSS 和 JavaScript 的 Web 应用，提供用户注册、登录、商品浏览和订单管理等功能。

## 目录结构
![前端](https://github.com/xiyuliu509/microservice-shop/assets/118703788/f0dc67b0-6508-494a-a410-0ad94b247762)

microservice_212106233
│
├── html
│ ├── user
│ │ ├── login.html
│ │ ├── user.html
│ │ └── ...
│ ├── goods
│ │ ├── goods.html
│ │ └── ...
│ ├── order
│ │ ├── order.html
│ │ └── ...
│ └── ...
│
├── css
│ ├── styles.css
│ └── ...
│
├── js
│ ├── main.js
│ └── ...
│
└── README.md
## 主要功能

- **用户模块**：
  - 注册页面：用户可以创建一个新账户。
  - 登录页面：用户输入用户名和密码进行登录,并区分消费者和管理员
  - 主页：显示用户信息和商铺信息的轮播图，提供商品和订单页面的链接。

- **商品模块**：
  - 商品列表页面：显示所有商品信息，提供查看商品详情的功能。管理员可以上架新商品、更新库存。用户可以搜索商品、添加商品到订单。

- **订单模块**：
  - 订单管理页面：显示所有订单信息，管理员可以更新订单状态，用户可以查看订单中的商品，申请取消订单或确认收货。

## 开发环境

- **HTML**：5
- **CSS**：3
- **JavaScript**：ES6+
- **Axios**：用于发送 HTTP 请求

## 构建与运行

1. 克隆项目代码：
    ```sh
    [git clone https://github.com/yourusername/microservice_212106233.git]
    (https://github.com/xiyuliu509/microservice-shop.git)
    ```
2. 进入项目目录：
    ```sh
    cd microservice_212106233
    ```
    在浏览器中访问以下页面：
    登录页面：http://127.0.0.1:5500/html/user/login.html
    注册页面：http://127.0.0.1:5500/html/user/register.html
    用户主页：http://127.0.0.1:5500/html/user/user.html
    商品管理页面：http://127.0.0.1:5500/html/goods/goods.html
    订单管理页面：http://127.0.0.1:5500/html/order/order.html

## 文件说明
  - **user** 子目录：包含用户相关页面。
  - **goods** 子目录：包含商品相关页面。
  - **order** 子目录：包含订单相关页面。
