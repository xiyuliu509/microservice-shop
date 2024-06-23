package com.example.orderservice.mapper;

import com.example.orderservice.entity.Goods;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GoodsMapper {
    Goods findGoodsById(Integer goodsId);

    int decreaseGoodsStock(Integer goodsId, Integer quantity);

    void increaseGoodsStock(Integer goodsId, Integer quantity);
}
