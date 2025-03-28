package com.example.orderservice.mapper;

import com.example.orderservice.entity.Order;
import com.example.orderservice.entity.OrderGoods;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMapper {
    void createOrder(Order order);

    void addGoodsToOrder(@Param("orderId") Integer orderId, @Param("goodsId") Integer goodsId, @Param("quantity") Integer quantity);

    Order findOrderByOrderId(@Param("orderId") Integer orderId);

    List<Order> findAllOrders();

    void updateOrderState(@Param("orderId") Integer orderId, @Param("orderState") String orderState, @Param("createStamp") String createStamp);

    List<OrderGoods> findOrderGoodsByOrderId(@Param("orderId") Integer orderId);

    void deleteOrder(@Param("orderId") Integer orderId);

}
