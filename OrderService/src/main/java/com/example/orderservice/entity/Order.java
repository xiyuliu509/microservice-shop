package com.example.orderservice.entity;

public class Order {
    private Integer orderId;
    private Integer userId;
    private Integer goodsId;
    private Double orderPrice;
    private String orderState;
    private String createStamp;

    // getters and setters


    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getGoodsId() {
        return goodsId;
    }

    public void setGoodsId(Integer goodsId) {
        this.goodsId = goodsId;
    }

    public Double getOrderPrice() {
        return orderPrice;
    }

    public void setOrderPrice(Double orderPrice) {
        this.orderPrice = orderPrice;
    }

    public String getOrderState() {
        return orderState;
    }

    public void setOrderState(String orderState) {
        this.orderState = orderState;
    }

    public String getCreateStamp() {
        return createStamp;
    }

    public void setCreateStamp(String createStamp) {
        this.createStamp = createStamp;
    }
}
