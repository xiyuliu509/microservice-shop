package com.example.userservice.service;

import com.example.userservice.config.GetTime;
import com.example.userservice.entity.User;
import com.example.userservice.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    public void createUser(User user) {
        user.setLoginTime(GetTime.NowTime());
        userMapper.createUser(user);
    }

    public User findByUserName(String userName) {
        return userMapper.findByUserName(userName);
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
        }
        return user;
    }
}
