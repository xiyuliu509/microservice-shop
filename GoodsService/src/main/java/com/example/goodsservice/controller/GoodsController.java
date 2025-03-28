package com.example.goodsservice.controller;

import com.example.goodsservice.config.GetTime;
import com.example.goodsservice.entity.Goods;
import com.example.goodsservice.service.GoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/goods")
public class GoodsController {
    @Autowired
    private GoodsService goodsService;
    private Goods goods;

    private final String uploadDir = "C:/Users/liuxiyu/IdeaProjects/microservice_212106233/Photo/";  // 设置上传图片的存储路径

    // 后端代码（GoodsController）
    @PostMapping("/create")
    public String createGoods(@RequestParam("goodsName") String goodsName,
                              @RequestParam("goodsPrice") Double goodsPrice,
                              @RequestParam("goodsStock") Integer goodsStock,
                              @RequestParam("goodsType") Integer goodsType,
                              @RequestParam("goodsBrand") String goodsBrand,
                              @RequestParam("file") MultipartFile file) throws IOException {

        System.out.println("Received goodsType: '" + goodsType + "'");  // Add quotes to clearly see if it's empty or not


        // 文件大小限制
        long maxSize = 5 * 1024 * 1024;  // 5MB
        if (file.getSize() > maxSize) {
            return "文件太大，最大支持 5MB";
        }

        // 获取图片文件名并检查文件是否存在
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();

        // 限制上传图片的格式
        if (!fileExtension.equals("jpg") && !fileExtension.equals("jpeg") && !fileExtension.equals("png")) {
            return "只支持 jpg, jpeg, png 格式的图片";
        }

        // 保存图片
        String imageName = originalFilename;
        Path path = Paths.get(uploadDir + imageName);  // 拼接路径
        if (Files.exists(path)) {
            return "该商品图片已经存在，请更换文件名";
        }
        Files.copy(file.getInputStream(), path);  // 保存文件到目标路径

        // 保存图片路径为相对路径，供前端访问
        String imageUrl =   imageName;  // 显示相对路径

        // 创建商品对象并设置属性
        Goods goods = new Goods();
        goods.setGoodsName(goodsName);
        goods.setGoodsPrice(goodsPrice);
        goods.setStock(goodsStock);
        goods.setGoodsType(goodsType);  // 设置商品类型
        goods.setGoodsBrand(goodsBrand);  // 设置商品品牌
        goods.setGoodsImage(imageUrl);  // 设置图片路径
        goods.setTimeStamp(GetTime.NowTime()); // 使用你现有的时间获取方法

        // 保存商品数据
        goodsService.createGoods(goods);

        System.out.println("Image URL: " + goods.getGoodsImage());

        return "商品创建成功，并已上传图片";
    }


    @GetMapping("/images/{imageName}")
    public Resource getImage(@PathVariable String imageName) {
        Path path = Paths.get(uploadDir + imageName);
        return new FileSystemResource(path);
    }


    // 删除商品（下架）
    @DeleteMapping("/delete/{goodsName}")
    public String deleteGoods(@PathVariable String goodsName) {
        Goods goods = goodsService.findGoodsByGoodsName(goodsName);
        if (goods != null) {
            goodsService.deleteGoods(goods.getGoodsName());  // 调用 service 层删除商品
            return "商品删除成功";
        }
        return "商品未找到";
    }


    @PostMapping("/query")
    public Goods queryGoods(@RequestBody Goods goods) {
        return goodsService.findGoodsByGoodsName(goods.getGoodsName());
    }

    @GetMapping("/list")
    public List<Goods> getAllGoods() {
        return goodsService.findAllGoods();
    }

    @GetMapping("/page")
    public Map<String, Object> getGoodsPage(@RequestParam(defaultValue = "1") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> result = (Map<String, Object>) goodsService.findGoodsWithPagination(page, size);
        return result;
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

    // 根据商品类型筛选
    @GetMapping("/filterByType")
    public List<Goods> filterGoodsByType(@RequestParam String goodsType) {
        return goodsService.findGoodsByType(goodsType);
    }

    // 根据商品品牌筛选
    @GetMapping("/filterByBrand")
    public List<Goods> filterGoodsByBrand(@RequestParam String goodsBrand) {
        return goodsService.findGoodsByBrand(goodsBrand);
    }

    @GetMapping("/filterByPrice")
    public List<Goods> filterGoodsByPrice(
            @RequestParam(required = false, defaultValue = "0") Double minPrice,
            @RequestParam(required = false, defaultValue = "999999") Double maxPrice) {
        return goodsService.findGoodsByPrice(minPrice, maxPrice);
    }

    @GetMapping("/filterByTypeBrandPrice")
    public List<Goods> filterGoodsByTypeBrandPrice(
            @RequestParam String goodsType,
            @RequestParam String goodsBrand,
            @RequestParam(required = false, defaultValue = "0") Double minPrice,
            @RequestParam(required = false, defaultValue = "999999") Double maxPrice) {
        return goodsService.findGoodsByTypeBrandPrice(goodsType, goodsBrand, minPrice, maxPrice);
    }

    @GetMapping("/findById")
    public Goods findGoodsById(@RequestParam Integer goodsId) {
        return goodsService.findGoodsById(goodsId);
    }


}
