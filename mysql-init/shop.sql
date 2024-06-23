/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80026 (8.0.26)
 Source Host           : localhost:3306
 Source Schema         : shop

 Target Server Type    : MySQL
 Target Server Version : 80026 (8.0.26)
 File Encoding         : 65001

 Date: 23/06/2024 17:34:35
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for order_goods
-- ----------------------------
DROP TABLE IF EXISTS `order_goods`;
CREATE TABLE `order_goods`  (
  `orderId` int NOT NULL,
  `goodsId` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`orderId`, `goodsId`) USING BTREE,
  INDEX `goodsId`(`goodsId` ASC) USING BTREE,
  CONSTRAINT `order_goods_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `shoporder` (`orderId`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `order_goods_ibfk_2` FOREIGN KEY (`goodsId`) REFERENCES `shopgoods` (`goodsId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of order_goods
-- ----------------------------
INSERT INTO `order_goods` VALUES (1, 1, 2);
INSERT INTO `order_goods` VALUES (2, 1, 1);
INSERT INTO `order_goods` VALUES (2, 2, 1);
INSERT INTO `order_goods` VALUES (2, 3, 1);
INSERT INTO `order_goods` VALUES (3, 1, 1);
INSERT INTO `order_goods` VALUES (4, 4, 3);

-- ----------------------------
-- Table structure for shopgoods
-- ----------------------------
DROP TABLE IF EXISTS `shopgoods`;
CREATE TABLE `shopgoods`  (
  `goodsId` int NOT NULL AUTO_INCREMENT,
  `goodsName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `goodsPrice` double NOT NULL,
  `timeStamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stock` int NULL DEFAULT 0,
  PRIMARY KEY (`goodsId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shopgoods
-- ----------------------------
INSERT INTO `shopgoods` VALUES (1, '商品1', 1, '2024-06-14 18:19:52', 10);
INSERT INTO `shopgoods` VALUES (2, '商品2', 2, '2024-06-14 18:19:52', 10);
INSERT INTO `shopgoods` VALUES (3, '商品3', 3, '2024-06-14 18:19:52', 10);
INSERT INTO `shopgoods` VALUES (4, '商品4', 4, '2024-06-14 18:19:52', 10);
INSERT INTO `shopgoods` VALUES (5, '商品5', 5, '2024-06-14 18:49:30', 10);
INSERT INTO `shopgoods` VALUES (6, '商品6', 6, '2024-06-17 15:25:24', 10);
INSERT INTO `shopgoods` VALUES (7, '商品7', 7, '2024-06-17 15:51:05', 10);
INSERT INTO `shopgoods` VALUES (8, '商品8', 8, '2024-06-18 18:16:39', 10);
INSERT INTO `shopgoods` VALUES (9, '商品9', 9, '2024-06-18 20:37:22', 10);
INSERT INTO `shopgoods` VALUES (10, '商品10', 10, '2024-06-23 16:23:16', 10);

-- ----------------------------
-- Table structure for shoporder
-- ----------------------------
DROP TABLE IF EXISTS `shoporder`;
CREATE TABLE `shoporder`  (
  `orderId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `orderState` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `createStamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `orderPrice` decimal(10, 2) NULL DEFAULT 0.00,
  PRIMARY KEY (`orderId`) USING BTREE,
  INDEX `userId`(`userId` ASC) USING BTREE,
  CONSTRAINT `shoporder_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `shopuser` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shoporder
-- ----------------------------
INSERT INTO `shoporder` VALUES (1, 1, '待发货', '2024-06-23 16:28:06', 100.00);
INSERT INTO `shoporder` VALUES (2, 12, '已取消', '2024-06-23 16:51:42', 6.00);
INSERT INTO `shoporder` VALUES (3, 12, '待付款', '2024-06-23 16:42:02', 1.00);
INSERT INTO `shoporder` VALUES (4, 12, '已取消', '2024-06-23 17:32:09', 12.00);

-- ----------------------------
-- Table structure for shopuser
-- ----------------------------
DROP TABLE IF EXISTS `shopuser`;
CREATE TABLE `shopuser`  (
  `userId` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `userPhone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `userPassword` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `userWallet` double NOT NULL,
  `loginTime` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `isAdmin` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`userId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shopuser
-- ----------------------------
INSERT INTO `shopuser` VALUES (1, 'admin', '0000000000', 'admin', 1000, '2024-06-23 17:32:20', 1);
INSERT INTO `shopuser` VALUES (2, 'user1', '0123456789', 'password1', 100, '2023-11-01 00:00:00', 0);
INSERT INTO `shopuser` VALUES (3, 'user2', '0234567890', 'password2', 100, '2023-11-01 00:00:00', 0);
INSERT INTO `shopuser` VALUES (4, 'user3', '0345678901', 'password3', 100, '2024-06-18 20:12:06', 0);
INSERT INTO `shopuser` VALUES (5, 'user4', '0456789012', 'password4', 100, '2024-06-14 18:22:24', 0);
INSERT INTO `shopuser` VALUES (6, 'user5', '0567890123', 'password5', 100, '2024-06-17 14:40:27', 0);
INSERT INTO `shopuser` VALUES (7, 'use6', '0678901234', 'password6', 100, '2024-06-18 20:11:53', 0);
INSERT INTO `shopuser` VALUES (8, 'user7', '0789012345', 'password7', 100, '2024-06-18 20:19:27', 0);
INSERT INTO `shopuser` VALUES (9, 'user8', '0890123456', 'password8', 100, '2024-06-18 21:24:58', 0);
INSERT INTO `shopuser` VALUES (10, 'user9', '0901234567', 'password9', 100, '2024-06-19 21:47:08', 0);
INSERT INTO `shopuser` VALUES (11, 'user10', '1123456789', 'password10', 100, '2024-06-22 12:28:35', 0);
INSERT INTO `shopuser` VALUES (12, 'user11', '1234567890', 'password11', 100, '2024-06-23 17:31:53', 0);
INSERT INTO `shopuser` VALUES (13, 'user12', '1345678901', 'password12', 100, '2024-06-22 12:52:50', 0);
INSERT INTO `shopuser` VALUES (14, 'user13', '1456789012', 'password13', 100, '2024-06-23 16:22:27', 0);

SET FOREIGN_KEY_CHECKS = 1;
