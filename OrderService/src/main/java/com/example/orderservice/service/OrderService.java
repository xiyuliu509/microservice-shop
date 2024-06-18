package com.example.orderservice.service;

import com.example.orderservice.config.GetTime;
import com.example.orderservice.entity.Goods;
import com.example.orderservice.entity.Order;
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
        orderMapper.createOrder(order);
    }

    public void updateOrderState(Order order) {
        order.setCreateStamp(GetTime.NowTime());
        orderMapper.updateOrderState(order.getOrderId(), order.getOrderState(),order.getCreateStamp());
    }

    public Order findOrderByOrderId(Integer orderId) {
        return orderMapper.findOrderByOrderId(orderId);
    }

    public List<Order> findAllOrders() {
        return orderMapper.findAllOrders();
    }

    public Goods findGoodsByOrderId(Integer orderId) {
        Integer goodsId = orderMapper.findGoodsIdByOrderId(orderId);
        if (goodsId != null) {
            return goodsMapper.findGoodsById(goodsId);
        } else {
            return null;
        }
    }
}
