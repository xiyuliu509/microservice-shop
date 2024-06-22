package com.example.userservice.entity;

import java.math.BigDecimal;

public class User {
    private Integer userId;
    private String userName;
    private String userPhone;
    private String userPassword;
    private BigDecimal userWallet;
    private String loginTime;
    private Boolean isAdmin;

    // getters and setters

    public Boolean getIsAdmin() {
        return isAdmin;
    }

    public void setIsAdmin(Boolean admin) {
        isAdmin = admin;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPhone() {
        return userPhone;
    }

    public void setUserPhone(String userPhone) {
        this.userPhone = userPhone;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public BigDecimal getUserWallet() {
        return userWallet;
    }

    public void setUserWallet(BigDecimal userWallet) {
        this.userWallet = userWallet;
    }

    public String getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(String loginTime) {
        this.loginTime = loginTime;
    }
}
