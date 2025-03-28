package com.example.goodsservice.mapper;

import com.example.goodsservice.entity.Goods;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GoodsMapper {

    void createGoods(Goods goods);

    void deleteGoods(@Param("goodsName") String goodsName);

    Goods findGoodsByGoodsName(@Param("goodsName") String goodsName);

    List<Goods> findAllGoods();

    int countGoods();  // 获取商品总数

    Goods findGoodsById(@Param("goodsId") Integer goodsId);

    List<Goods> findGoodsByType(@Param("goodsType") String goodsType);  // 商品分类查询方法

    List<Goods> findGoodsByBrand(@Param("goodsBrand") String goodsBrand);  // 商品品牌查询方法

    List<Goods> findGoodsByPrice(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);
    // 添加 @Param 注解
    List<Goods> findGoodsByTypeBrandPrice(
            @Param("goodsType") String goodsType,
            @Param("goodsBrand") String goodsBrand,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice
    );

    List<Goods> findGoodsWithPagination(@Param("offset") int offset, @Param("size") int size);

    void updateGoodsStock(@Param("goodsId") Integer goodsId, @Param("quantity") Integer quantity);

    void decreaseGoodsStock(@Param("goodsId") Integer goodsId, @Param("quantity") Integer quantity);


}
