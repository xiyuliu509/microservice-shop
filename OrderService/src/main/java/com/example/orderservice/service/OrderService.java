package com.example.orderservice.service;

import com.example.orderservice.config.GetTime;
import com.example.orderservice.entity.Goods;
import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderGoods;
import com.example.orderservice.mapper.GoodsMapper;
import com.example.orderservice.mapper.OrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
public class OrderService {
    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private GoodsMapper goodsMapper;

    public void createOrder(Order order) {
        order.setCreateStamp(GetTime.NowTime());
        double totalPrice = 0;
        for (OrderGoods orderGoods : order.getOrderGoodsList()) {
            Goods goods = goodsMapper.findGoodsById(orderGoods.getGoodsId());
            if (goods == null || goods.getStock() < orderGoods.getQuantity()) {
                throw new RuntimeException("库存不足，无法创建订单");
            }
            totalPrice += goods.getGoodsPrice() * orderGoods.getQuantity();
            goodsMapper.decreaseGoodsStock(orderGoods.getGoodsId(), orderGoods.getQuantity());
        }
        order.setOrderPrice(totalPrice);
        orderMapper.createOrder(order);
        for (OrderGoods orderGoods : order.getOrderGoodsList()) {
            orderMapper.addGoodsToOrder(order.getOrderId(), orderGoods.getGoodsId(), orderGoods.getQuantity());
        }
    }

    public void updateOrderState(Order order) {
        order.setCreateStamp(GetTime.NowTime());
        orderMapper.updateOrderState(order.getOrderId(), order.getOrderState(), order.getCreateStamp());
        if ("已取消".equals(order.getOrderState())) {
            List<OrderGoods> orderGoodsList = orderMapper.findOrderGoodsByOrderId(order.getOrderId());
            for (OrderGoods orderGoods : orderGoodsList) {
                goodsMapper.increaseGoodsStock(orderGoods.getGoodsId(), orderGoods.getQuantity());
            }
        }
    }

    public Order findOrderByOrderId(Integer orderId) {
        Order order = orderMapper.findOrderByOrderId(orderId);
        if (order != null) {
            List<OrderGoods> orderGoodsList = orderMapper.findOrderGoodsByOrderId(orderId);
            for (OrderGoods orderGoods : orderGoodsList) {
                Goods goods = goodsMapper.findGoodsById(orderGoods.getGoodsId());
                orderGoods.setGoods(goods);  // Ensure this line exists
            }
            order.setOrderGoodsList(orderGoodsList);
        }
        return order;
    }

    public List<Order> findAllOrders() {
        List<Order> orders = orderMapper.findAllOrders();
        for (Order order : orders) {
            List<OrderGoods> orderGoodsList = orderMapper.findOrderGoodsByOrderId(order.getOrderId());
            for (OrderGoods orderGoods : orderGoodsList) {
                Goods goods = goodsMapper.findGoodsById(orderGoods.getGoodsId());
                orderGoods.setGoods(goods);  // Ensure this line exists
            }
            order.setOrderGoodsList(orderGoodsList);
        }
        return orders;
    }

    public List<OrderGoods> findGoodsByOrderId(Integer orderId) {
        List<OrderGoods> orderGoodsList = orderMapper.findOrderGoodsByOrderId(orderId);
        for (OrderGoods orderGoods : orderGoodsList) {
            Goods goods = goodsMapper.findGoodsById(orderGoods.getGoodsId());
            orderGoods.setGoods(goods);  // Ensure this line exists
        }
        return orderGoodsList;
    }

    public void cancelOrder(Integer orderId) {
        Order order = orderMapper.findOrderByOrderId(orderId);
        if (order != null) {
            List<OrderGoods> orderGoodsList = orderMapper.findOrderGoodsByOrderId(orderId);
            for (OrderGoods orderGoods : orderGoodsList) {
                goodsMapper.increaseGoodsStock(orderGoods.getGoodsId(), orderGoods.getQuantity());
            }
            order.setOrderState("已取消");
            orderMapper.updateOrderState(order.getOrderId(), order.getOrderState(), GetTime.NowTime());
        } else {
            throw new RuntimeException("订单不存在");
        }
    }

    public void deleteOrder(Integer orderId) {
        orderMapper.deleteOrderGoods(orderId);
        orderMapper.deleteShopOrder(orderId);
    }
}
