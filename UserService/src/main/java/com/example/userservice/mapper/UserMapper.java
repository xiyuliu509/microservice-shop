package com.example.userservice.mapper;

import com.example.userservice.entity.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper {

    void createUser(User user);

    User findByUserPhone(@Param("userPhone") String userPhone);

    User findByUserName(@Param("userName") String userName);

    User findByUserNameAndPassword(@Param("userName") String userName, @Param("userPassword") String userPassword);

    void updateLoginTime(@Param("userName") String userName, @Param("loginTime") String loginTime);

    List<User> findAllUsers();

    // 新增：通过用户ID查找用户
    User findByUserId(@Param("userId") Integer userId);

    // 新增：更新用户角色（更新userType）
    void updateUserRole(User user);

    // 删除用户：根据用户名删除
    void deleteUser(@Param("userName") String userName);
}
