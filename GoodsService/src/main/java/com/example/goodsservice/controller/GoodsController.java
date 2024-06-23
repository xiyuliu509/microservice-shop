package com.example.goodsservice.controller;

import com.example.goodsservice.entity.Goods;
import com.example.goodsservice.service.GoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @PostMapping("/updateStock")
    public String updateGoodsStock(@RequestBody Map<String, Integer> request) {
        Integer goodsId = request.get("goodsId");
        Integer quantity = request.get("quantity");
        goodsService.updateGoodsStock(goodsId, quantity);
        return "库存更新成功";
    }

    @PostMapping("/decreaseStock")
    public String decreaseGoodsStock(@RequestBody Map<String, Integer> request) {
        Integer goodsId = request.get("goodsId");
        Integer quantity = request.get("quantity");
        goodsService.decreaseGoodsStock(goodsId, quantity);
        return "库存减少成功";
    }

    @GetMapping("/findById")
    public Goods findGoodsById(@RequestParam Integer goodsId) {
        return goodsService.findGoodsById(goodsId);
    }
}
