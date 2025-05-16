package com.example.userservice.service;

import com.example.userservice.config.GetTime;
import com.example.userservice.entity.User;
import com.example.userservice.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    // 创建用户时，检查用户名和手机号是否已存在
    public void createUser(User user) {
        // 检查用户名是否已存在
        if (userMapper.findByUserName(user.getUserName()) != null) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查手机号是否已存在
        if (userMapper.findByUserPhone(user.getUserPhone()) != null) {
            throw new RuntimeException("手机号已存在");
        }

        user.setLoginTime(GetTime.NowTime());
        user.setUserType(User.CUSTOMER);  // 默认为顾客，或根据实际需求调整
        userMapper.createUser(user);
    }

    public User findByUserPhone(String userPhone) {
        return userMapper.findByUserPhone(userPhone);
    }

    public User findByUserName(String userName) {
        return userMapper.findByUserName(userName);
    }

    public List<User> findAllUsers() {
        return userMapper.findAllUsers();
    }

    // 登录
    public User loginUser(String userName, String userPassword) {
        User user = userMapper.findByUserNameAndPassword(userName, userPassword);
        if (user != null) {
            String currentTime = GetTime.NowTime();
            user.setLoginTime(currentTime);
            userMapper.updateLoginTime(userName, currentTime);

            if (user.getUserType() == User.ADMIN) {
                user.setUserType(User.ADMIN);  // 管理员身份
            } else if (user.getUserType() == User.MERCHANT) {
                user.setUserType(User.MERCHANT);  // 商家身份
            } else {
                user.setUserType(User.CUSTOMER);  // 顾客身份
            }
            return user;
        }
        throw new UsernameNotFoundException("User not found with username: " + userName);
    }

    // 更新用户角色
    public void updateUserRole(String userName, int newRole) {
        User user = userMapper.findByUserName(userName);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + userName);
        }
        user.setUserType(newRole);
        userMapper.updateUserRole(user);
    }

    // 删除用户
    public void deleteUser(String userName) {
        User user = userMapper.findByUserName(userName);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + userName);
        }
        try {
            userMapper.deleteUser(userName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }
    }
}
