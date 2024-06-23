package com.example.orderservice.controller;

import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderGoods;
import com.example.orderservice.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public String createOrder(@RequestBody Order order) {
        try {
            orderService.createOrder(order);
            return "创建订单成功";
        } catch (Exception e) {
            e.printStackTrace();
            return "创建订单失败";
        }
    }

    @PostMapping("/query")
    public Order queryOrder(@RequestBody Order order) {
        return orderService.findOrderByOrderId(order.getOrderId());
    }

    @PostMapping("/update")
    public String updateOrderState(@RequestBody Order order) {
        orderService.updateOrderState(order);
        return "订单状态更新成功";
    }

    @GetMapping("/list")
    public List<Order> getAllOrders() {
        return orderService.findAllOrders();
    }

    @GetMapping("/findgoods/{orderId}")
    public List<OrderGoods> findGoods(@PathVariable Integer orderId) {
        return orderService.findGoodsByOrderId(orderId);
    }
}
