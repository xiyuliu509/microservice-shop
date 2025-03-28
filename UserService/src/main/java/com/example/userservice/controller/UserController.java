package com.example.userservice.controller;

import com.example.userservice.entity.User;
import com.example.userservice.mapper.UserMapper;
import com.example.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    private int determineRole(String userName) {
        if ("admin".equals(userName)) {
            return 0; // 例如，管理员
        } else {
            return 2; // 商家或者其他角色
        }
    }
    // 获取当前用户的角色和信息
    @GetMapping("/info/role")
    public ResponseEntity<Map<String, Object>> getUserRole(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findByUserName(principal.getName());
        if (user != null) {
            Map<String, Object> roleMap = new HashMap<String, Object>();
            roleMap.put("userType", user.getUserType());  // 返回用户类型（顾客、商家、管理员）
            roleMap.put("userName", user.getUserName());
            roleMap.put("userPhone", user.getUserPhone());

            // 只在顾客和商家角色中返回钱包
            if (user.getUserType() == User.CUSTOMER || user.getUserType() == User.MERCHANT) {
                roleMap.put("userWallet", user.getUserWallet());
            }

            return ResponseEntity.ok(roleMap);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // 创建用户
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

    // 根据用户名查询用户
    @PostMapping("/query")
    public ResponseEntity<User> queryUser(@RequestBody User user) {
        User foundUser = userService.findByUserName(user.getUserName());
        if (foundUser == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(foundUser);
    }

    // 用户登录
    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestBody User user) {
        User loggedInUser = userService.loginUser(user.getUserName(), user.getUserPassword());
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(null);
        }
        return ResponseEntity.ok(loggedInUser);
    }

    // 列出所有用户
    @GetMapping("/list")
    public List<User> getAllUsers() {
        return userService.findAllUsers();
    }

    // 获取特定用户信息
    @GetMapping("/info/{userName}")
    public ResponseEntity<User> getUserInfo(@PathVariable String userName) {
        User user = userService.findByUserName(userName);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    // 管理员搜索用户
    @GetMapping("/admin/search/{userName}")
    public ResponseEntity<User> searchUser(@PathVariable String userName) {
        try {
            // 直接查找用户
            User user = userService.findByUserName(userName);
            if (user != null) {
                return ResponseEntity.ok(user);  // 用户存在，返回 200 OK
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();  // 用户未找到，返回 404
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);  // 发生错误时返回 500 错误
        }
    }

    @PutMapping("/admin/updateRole/{userName}")
    public ResponseEntity<Map<String, String>> updateUserRole(@PathVariable String userName, @RequestParam int newRole) {
        Map<String, String> response = new HashMap<String, String>();
        try {
            // 调用 UserService 更新角色，并传递新的角色
            userService.updateUserRole(userName, newRole);

            response.put("message", "用户身份更新成功");
            return ResponseEntity.ok(response);  // 返回成功的 JSON 响应
        } catch (Exception e) {
            response.put("message", "Error occurred during the role update: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);  // 返回错误信息
        }
    }



    @DeleteMapping("/admin/delete/{userName}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String userName) {
        Map<String, String> response = new HashMap<String, String>();
        try {
            userService.deleteUser(userName);  // 调用 UserService 删除用户
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);  // 返回成功的响应
        } catch (UsernameNotFoundException e) {
            response.put("message", "User not found: " + userName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);  // 返回用户未找到
        } catch (Exception e) {
            response.put("message", "Error occurred during user deletion: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);  // 返回其他错误
        }
    }

}

