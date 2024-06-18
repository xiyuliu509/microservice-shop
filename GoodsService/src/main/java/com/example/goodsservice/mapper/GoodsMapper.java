package com.example.goodsservice.mapper;

import com.example.goodsservice.entity.Goods;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GoodsMapper {
    void createGoods(Goods goods);

    Goods findGoodsByGoodsName(@Param("goodsName") String goodsName);

    List<Goods> findAllGoods();
}
