package com.example.orderservice.mapper;

import com.example.orderservice.entity.Goods;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface GoodsMapper {

    @Select("SELECT * FROM shopgoods WHERE goodsId = #{goodsId}")
    Goods findGoodsById(@Param("goodsId") Integer goodsId);
}
