package com.example.userservice.mapper;

import com.example.userservice.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {
    void createUser(User user);

    User findByUserName(@Param("userName") String userName);

    User findByUserNameAndPassword(@Param("userName") String userName, @Param("userPassword") String userPassword);

    void updateLoginTime(@Param("userName") String userName, @Param("loginTime") String loginTime);

    List<User> findAllUsers();
}
