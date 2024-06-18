package com.example.goodsservice.controller;

import com.example.goodsservice.entity.Goods;
import com.example.goodsservice.service.GoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/goods")
public class GoodsController {
    @Autowired
    private GoodsService goodsService;

    @PostMapping("/create")
    public String createGoods(@RequestBody Goods goods) {
        goodsService.createGoods(goods);
        return "创建商品成功";
    }

    @PostMapping("/query")
    public Goods queryGoods(@RequestBody Goods goods) {
        return goodsService.findGoodsByGoodsName(goods.getGoodsName());
    }

    @GetMapping("/list")
    public List<Goods> getAllGoods() {
        return goodsService.findAllGoods();
    }
}
