package com.example.userservice.controller;

import com.example.userservice.entity.User;
import com.example.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;
//  创建用户
    @PostMapping("/create")
    public String createUser(@RequestBody User user) {
        userService.createUser(user);
        return "创建用户成功";
    }
//  查询用户
    @PostMapping("/query")
    public User queryUser(@RequestBody User user) {
        return userService.findByUserName(user.getUserName());
    }
//  用户登录
    @PostMapping("/login")
    public User loginUser(@RequestBody User user) {
        return userService.loginUser(user.getUserName(), user.getUserPassword());
    }
//  用户列表
    @GetMapping("/list")
    public List<User> getAllUsers() {
        return userService.findAllUsers();
    }
//  返回特定用户登录信息
    @GetMapping("/info/{userName}")
    public User getUserInfo(@PathVariable String userName) {
        return userService.findByUserName(userName);
    }
}
