package com.example.goodsservice.service;

import com.example.goodsservice.config.GetTime;
import com.example.goodsservice.entity.Goods;
import com.example.goodsservice.mapper.GoodsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoodsService {
    @Autowired
    private GoodsMapper goodsMapper;

    public void createGoods(Goods goods) {
        goods.setTimeStamp(GetTime.NowTime());
        goods.setStock(goods.getStock() == null ? 0 : goods.getStock());
        goodsMapper.createGoods(goods);
    }

    public Goods findGoodsByGoodsName(String goodsName) {
        return goodsMapper.findGoodsByGoodsName(goodsName);
    }

    public List<Goods> findAllGoods() {
        return goodsMapper.findAllGoods();
    }

    public Goods findGoodsById(Integer goodsId) {
        return goodsMapper.findGoodsById(goodsId);
    }

    public void updateGoodsStock(Integer goodsId, Integer quantity) {
        goodsMapper.updateGoodsStock(goodsId, quantity);
    }

    public void decreaseGoodsStock(Integer goodsId, Integer quantity) {
        goodsMapper.decreaseGoodsStock(goodsId, quantity);
    }
}
