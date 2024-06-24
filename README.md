## 项目简介

microservice_212106233 是一个基于 Spring Boot 和 Spring Cloud 构建的微服务项目，包含三个主要模块：UserService、OrderService 和 GoodsService。该项目旨在实现用户管理、订单管理和商品管理功能。

## 主要功能

- **用户模块**：
    - 注册页面：用户可以创建一个新账户。
    - 登录页面：用户输入用户名和密码进行登录,并区分消费者和管理员
    - 主页：显示用户信息和商铺信息的轮播图，提供商品和订单页面的链接。

- **商品模块**：
    - 商品列表页面：显示所有商品信息，提供查看商品详情的功能。管理员可以上架新商品、更新库存。用户可以搜索商品、添加商品到订单。

- **订单模块**：
    - 订单管理页面：显示所有订单信息，管理员可以更新订单状态，用户可以查看订单中的商品，申请取消订单或确认收货。


## 目录结构
microservice_212106233
│
├── UserService
│ ├── src
│ ├── pom.xml
│ └── ...
│
├── OrderService
│ ├── src
│ ├── pom.xml
│ └── ...
│
├── GoodsService
│ ├── src
│ ├── pom.xml
│ └── ...
│
├── pom.xml
└── README.md

markdown
复制代码

## 开发环境

- **JDK**：1.8
- **Spring Boot**：2.6.13
- **Spring Cloud**：2021.0.3
- **MySQL**：8.0.31
- **Maven**：3.6.3

## 依赖组件

- **Spring Boot Starter Web**
- **Spring Data JPA**
- **MySQL Connector**
- **FastJSON**
- **Spring Boot Starter Test**
- **Spring Boot DevTools**
- **Lombok**
- **Spring Security**
- **Spring Cloud OpenFeign**
- **Spring Boot Actuator**
- **Spring Cloud Nacos**
- **MyBatis**

## 构建与运行

1. 克隆项目代码：
    ```sh
    git clone https://github.com/yourusername/microservice_212106233.git
    ```
2. 进入项目目录：
    ```sh
    cd microservice_212106233
    ```
3. 构建项目：
    ```sh
    mvn clean install
    ```
4. 运行各个服务模块：
    ```sh
    cd UserService
    mvn spring-boot:run
    ```

    ```sh
    cd OrderService
    mvn spring-boot:run
    ```

    ```sh
    cd GoodsService
    mvn spring-boot:run
    ```

## 接口文档

- 用户接口
  - 创建用户：`POST /user/create`
  - 查询用户：`POST user/query`
  - 登录用户：`POST /user/login`
  - 获取用户信息：`GET /user/list`

- 订单接口
  - 创建订单：`POST /order/create`
  - 查询订单：`GET /order/{id}`
  - 更新订单状态：`POST /order/update`
  - 查看订单对应商品：`GET /order/findgoods/{id}`
  - 获取订单列表: `GET /order/list`

- 商品接口
  - 获取商品列表：`GET /goods/list`
  - 获取商品库存：`GET /oods/findById?goodsId={id}`
  - 创建商品：`POST /goods/create`
  - 查询商品：`POST /goods/query`
  - 修改商品库存: `POST /goods/updateStock`

## 配置文件

各模块的配置文件位于 `src/main/resources/application.yml`，可以根据需要进行修改。
