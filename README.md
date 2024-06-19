## 项目简介

microservice_212106233 是一个基于 Spring Boot 和 Spring Cloud 构建的微服务项目，包含三个主要模块：UserService、OrderService 和 GoodsService。该项目旨在实现用户管理、订单管理和商品管理功能。

## 目录结构
![后端](https://github.com/xiyuliu509/microservice-shop/assets/118703788/17744868-066b-4ff9-8338-3e2c22fef791)

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

## 主要功能

- **UserService**：用户管理，包含用户注册、登录、信息查询等功能。
- **OrderService**：订单管理，包含订单创建、查询、状态更新等功能。
- **GoodsService**：商品管理，包含商品信息展示、查询等功能。

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
  - 注册用户：`POST /user/register`
  - 登录用户：`POST /user/login`
  - 获取用户信息：`GET /user/{id}`

- 订单接口
  - 创建订单：`POST /order/create`
  - 查询订单：`GET /order/{id}`
  - 更新订单状态：`POST /order/update`

- 商品接口
  - 获取商品列表：`GET /goods/list`
  - 获取商品详情：`GET /goods/{id}`

## 配置文件

各模块的配置文件位于 `src/main/resources/application.yml`，可以根据需要进行修改。
