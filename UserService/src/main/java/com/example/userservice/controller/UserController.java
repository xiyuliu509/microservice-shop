package com.example.userservice.controller;

import com.example.userservice.entity.User;
import com.example.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/info/role")
    public ResponseEntity<Map<String, Boolean>> getUserRole(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findByUserName(principal.getName());
        if (user != null) {
            Map<String, Boolean> roleMap = new HashMap<String, Boolean>();
            roleMap.put("isMerchant", user.getIsAdmin());
            return ResponseEntity.ok(roleMap);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Create user
    @PostMapping("/create")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        if (userService.findByUserName(user.getUserName()) != null) {
            return ResponseEntity.badRequest().body("用户已存在");
        }
        if (userService.findByUserPhone(user.getUserPhone()) != null) {
            return ResponseEntity.badRequest().body("联系方式已被注册");
        }
        userService.createUser(user);
        return ResponseEntity.ok("创建用户成功");
    }

    // Query user by username
    @PostMapping("/query")
    public ResponseEntity<User> queryUser(@RequestBody User user) {
        User foundUser = userService.findByUserName(user.getUserName());
        if (foundUser == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(foundUser);
    }

    // User login
    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestBody User user) {
        User loggedInUser = userService.loginUser(user.getUserName(), user.getUserPassword());
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(null); // Unauthorized
        }
        return ResponseEntity.ok(loggedInUser);
    }

    // List all users
    @GetMapping("/list")
    public List<User> getAllUsers() {
        return userService.findAllUsers();
    }

    // Return specific user's login information
    @GetMapping("/info/{userName}")
    public ResponseEntity<User> getUserInfo(@PathVariable String userName) {
        User user = userService.findByUserName(userName);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }
}
