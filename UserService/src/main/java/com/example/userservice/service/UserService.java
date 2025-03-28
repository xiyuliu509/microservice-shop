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

    public void createUser(User user) {
        user.setLoginTime(GetTime.NowTime());
        user.setUserType(User.CUSTOMER);  // 默认为顾客，或根据实际需求调整
        userMapper.createUser(user);
    }

    public User findByUserPhone(String userPhone) {
        return userMapper.findByUserPhone(userPhone);
    }

    public User findByUserName(String userName) {
        System.out.println("Searching for user with username: " + userName); // Debugging log
        User user = userMapper.findByUserName(userName);
        if (user == null) {
            System.out.println("User not found for username: " + userName);
            throw new UsernameNotFoundException("User not found with username: " + userName);
        }
        return user;
    }

    public List<User> findAllUsers() {
        return userMapper.findAllUsers();
    }

    public User loginUser(String userName, String userPassword) {
        User user = userMapper.findByUserNameAndPassword(userName, userPassword);
        if (user != null) {
            String currentTime = GetTime.NowTime();
            user.setLoginTime(currentTime);
            userMapper.updateLoginTime(userName, currentTime);
//            2.23新加用户判定
            if (user.getUserType() == User.ADMIN) {
                user.setUserType(User.ADMIN);  // 管理员身份
            } else if (user.getUserType() == User.MERCHANT) {
                user.setUserType(User.MERCHANT);  // 商家身份
            } else {
                user.setUserType(User.CUSTOMER);  // 顾客身份
            }
            return user;  // User object includes isAdmin flag
        }
        throw new UsernameNotFoundException("User not found with username: " + userName);
    }

    public void updateUserRole(String userName, int newRole) {
        // 根据用户名查找用户
        User user = userMapper.findByUserName(userName);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + userName);
        }

        // 更新用户角色为新角色（例如，将用户角色更新为顾客（0）或商家（2））
        user.setUserType(newRole);  // 根据传递的 newRole 更新用户角色

        // 更新数据库中的角色
        userMapper.updateUserRole(user);
    }


    public void deleteUser(String userName) {
        // 根据用户名查找用户
        User user = userMapper.findByUserName(userName);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + userName);
        }
        try {
            // 直接通过用户名删除用户
            userMapper.deleteUser(userName);  // 通过用户名删除用户
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user: " + e.getMessage());
        }
    }


}
