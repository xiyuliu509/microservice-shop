package com.example.orderservice.mapper;

import com.example.orderservice.entity.Goods;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface GoodsMapper {
    Goods findGoodsById(@Param("goodsId") Integer goodsId);

    int decreaseGoodsStock(@Param("goodsId") Integer goodsId, @Param("quantity") Integer quantity);

    void increaseGoodsStock(@Param("goodsId") Integer goodsId, @Param("quantity") Integer quantity);
}
