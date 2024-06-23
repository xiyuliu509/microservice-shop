package com.example.orderservice.service;

import com.example.orderservice.config.GetTime;
import com.example.orderservice.entity.Goods;
import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderGoods;
import com.example.orderservice.mapper.GoodsMapper;
import com.example.orderservice.mapper.OrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
            order.setOrderGoodsList(orderMapper.findOrderGoodsByOrderId(orderId));
        }
        return order;
    }

    public List<Order> findAllOrders() {
        List<Order> orders = orderMapper.findAllOrders();
        for (Order order : orders) {
            order.setOrderGoodsList(orderMapper.findOrderGoodsByOrderId(order.getOrderId()));
        }
        return orders;
    }

    public List<OrderGoods> findGoodsByOrderId(Integer orderId) {
        return orderMapper.findOrderGoodsByOrderId(orderId);
    }
}
