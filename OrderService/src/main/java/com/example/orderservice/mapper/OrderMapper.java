package com.example.orderservice.mapper;

import com.example.orderservice.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface OrderMapper {

    void createOrder(Order order);

    Order findOrderByOrderId(@Param("orderId") Integer orderId);

    List<Order> findAllOrders();

    @Select("SELECT goodsId FROM shoporder WHERE orderId = #{orderId}")
    Integer findGoodsIdByOrderId(@Param("orderId") Integer orderId);

    @Update("UPDATE shoporder SET orderState = #{orderState}, createStamp = #{createStamp} WHERE orderId = #{orderId}")
    void updateOrderState(@Param("orderId") Integer orderId, @Param("orderState") String orderState,@Param("createStamp") String createStamp);
}
