/*
 made by：212106233卢诗宇
 Navicat Premium Data Transfer
 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80026 (8.0.26)
 Source Host           : localhost:3306
 Source Schema         : shop

 Target Server Type    : MySQL
 Target Server Version : 80026 (8.0.26)
 File Encoding         : 65001

 Date: 14/06/2024 21:02:07
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for shopgoods
-- ----------------------------
DROP TABLE IF EXISTS `shopgoods`;
CREATE TABLE `shopgoods`  (
  `goodsId` int NOT NULL AUTO_INCREMENT,
  `goodsName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `goodsPrice` double NOT NULL,
  `timeStamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`goodsId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shopgoods
-- ----------------------------
INSERT INTO `shopgoods` VALUES (1, '商品1', 50, '2024-06-14 18:19:52');
INSERT INTO `shopgoods` VALUES (2, '商品2', 100, '2024-06-14 18:19:52');
INSERT INTO `shopgoods` VALUES (3, '商品3', 150, '2024-06-14 18:19:52');
INSERT INTO `shopgoods` VALUES (4, '树莓派', 50, '2024-06-14 18:19:52');
INSERT INTO `shopgoods` VALUES (6, 'zcxy', 60, '2024-06-14 18:49:30');

-- ----------------------------
-- Table structure for shoporder
-- ----------------------------
DROP TABLE IF EXISTS `shoporder`;
CREATE TABLE `shoporder`  (
  `orderId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `goodsId` int NOT NULL,
  `orderPrice` double NOT NULL,
  `orderState` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `createStamp` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`orderId`) USING BTREE,
  INDEX `userId`(`userId` ASC) USING BTREE,
  INDEX `fk_goods`(`goodsId` ASC) USING BTREE,
  CONSTRAINT `fk_goods` FOREIGN KEY (`goodsId`) REFERENCES `shopgoods` (`goodsId`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `shoporder_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `shopuser` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `shoporder_ibfk_2` FOREIGN KEY (`goodsId`) REFERENCES `shopgoods` (`goodsId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shoporder
-- ----------------------------
INSERT INTO `shoporder` VALUES (1, 1, 1, 100, '待付款', '2023-11-01 00:00:00');
INSERT INTO `shoporder` VALUES (2, 2, 2, 200, '待发货', '2023-11-01 00:00:00');
INSERT INTO `shoporder` VALUES (3, 3, 3, 300, '待收货', '2023-11-01 00:00:00');
INSERT INTO `shoporder` VALUES (4, 1, 1, 211, '待支付', '2024-06-14 16:00:00');
INSERT INTO `shoporder` VALUES (11, 3, 3, 2, '待发货', '2024-06-14 18:49:25');

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
  PRIMARY KEY (`userId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shopuser
-- ----------------------------
INSERT INTO `shopuser` VALUES (1, 'admin', '0000000000', 'admin', 1000, '2023-11-01 00:00:00');
INSERT INTO `shopuser` VALUES (2, 'user1', '1234567890', 'password1', 500, '2023-11-01 00:00:00');
INSERT INTO `shopuser` VALUES (3, 'user2', '0987654321', 'password2', 300, '2023-11-01 00:00:00');
INSERT INTO `shopuser` VALUES (4, 'lushiyu', '13055740819', '212106233', 985, '2024-06-14 15:49:31');
INSERT INTO `shopuser` VALUES (5, 'lushiyu1', '13055740819', '212106233', 985, '2024-06-14 18:22:24');

SET FOREIGN_KEY_CHECKS = 1;
