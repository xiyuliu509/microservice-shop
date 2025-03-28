package com.example.goodsservice.service;

import com.example.goodsservice.config.GetTime;
import com.example.goodsservice.entity.Goods;
import com.example.goodsservice.mapper.GoodsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GoodsService {
    @Autowired
    private GoodsMapper goodsMapper;

    // 创建商品
    public void createGoods(Goods goods) {
        goods.setTimeStamp(GetTime.NowTime()); // 使用你现有的时间获取方法
        goodsMapper.createGoods(goods);
    }

    public void deleteGoods(String goodsName) {
        goodsMapper.deleteGoods(goodsName); // 调用Mapper删除商品
    }

    // 通过商品名称查找商品
    public Goods findGoodsByGoodsName(String goodsName) {
        return goodsMapper.findGoodsByGoodsName(goodsName);
    }

    // 查找所有商品
    public List<Goods> findAllGoods() {
        return goodsMapper.findAllGoods();
    }

    //分页
    public Map<String, Object> findGoodsWithPagination(int page, int size) {
        int offset = (page - 1) * size;
        // 获取总商品数
        int totalItems = goodsMapper.countGoods();  // 你需要在 Mapper 中实现 countGoods 方法
        int totalPages = (int) Math.ceil((double) totalItems / size);  // 计算总页数

        // 获取当前页的商品列表
        List<Goods> goodsList = goodsMapper.findGoodsWithPagination(offset, size);

        // 将商品列表和分页信息封装到一个对象中返回
        Map<String, Object> result = new HashMap<>();
        result.put("content", goodsList);  // 商品数据
        result.put("totalPages", totalPages);  // 总页数
        return result;
    }

    // 通过ID查找商品
    public Goods findGoodsById(Integer goodsId) {
        return goodsMapper.findGoodsById(goodsId);
    }

    // 更新商品库存
    public void updateGoodsStock(Integer goodsId, Integer quantity) {
        goodsMapper.updateGoodsStock(goodsId, quantity);
    }

    // 减少商品库存
    public void decreaseGoodsStock(Integer goodsId, Integer quantity) {
        goodsMapper.decreaseGoodsStock(goodsId, quantity);
    }

    // 通过商品类型查找商品
    public List<Goods> findGoodsByType(String goodsType) {
        return goodsMapper.findGoodsByType(goodsType);
    }

    // 根据商品品牌查询商品
    public List<Goods> findGoodsByBrand(String goodsBrand) {
        return goodsMapper.findGoodsByBrand(goodsBrand);
    }

    public List<Goods> findGoodsByPrice(Double minPrice, Double maxPrice) {
        if (minPrice == null) minPrice = 0.0;
        if (maxPrice == null) maxPrice = 999999.0;
        return goodsMapper.findGoodsByPrice(minPrice, maxPrice);
    }

    public List<Goods> findGoodsByTypeBrandPrice(String goodsType, String goodsBrand, Double minPrice, Double maxPrice) {
        if (minPrice == null) minPrice = 0.0;
        if (maxPrice == null) maxPrice = 999999.0;
        return goodsMapper.findGoodsByTypeBrandPrice(goodsType, goodsBrand, minPrice, maxPrice);
    }
}
