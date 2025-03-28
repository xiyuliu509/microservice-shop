document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        // 显示基本用户信息
        document.getElementById('userName').textContent = user.userName;
        document.getElementById('userPhone').textContent = user.userPhone;

        if (user.userType === 2) {
            document.getElementById('carouselContainer').style.display = 'block';  // 商家显示轮播图
            document.getElementById('userSearchContainer').style.display = 'none';  // 商家不显示查询功能
        } else {
            document.getElementById('carouselContainer').style.display = 'none';  // 非商家不显示轮播图
        }
        
        // 只有管理员才可以看到用户查找部分
        if (user.userType === 1) {  // 判断是否为管理员
            document.getElementById('userSearchContainer').style.display = 'block';
        } else {
            document.getElementById('userSearchContainer').style.display = 'none';
        }

        // 用户查询功能
        document.getElementById('searchButton').addEventListener('click', function () {
            const userName = document.getElementById('searchUser').value;
            if (userName) {
                fetch(`http://localhost:8082/user/admin/search/${userName}`)
                    .then(response => {
                        if (response.ok) {
                            return response.json();  // 如果请求成功，解析 JSON
                        } else {
                            throw new Error('User not found');
                        }
                    })
                    .then(jsonData => {
                        if (jsonData) {
                            // 显示查询结果
                            document.getElementById('searchedUserName').textContent = jsonData.userName;
                            document.getElementById('searchedUserPhone').textContent = jsonData.userPhone;
                            document.getElementById('searchResult').style.display = 'block';

                            // 更新角色按钮点击事件
                            document.getElementById('updateRoleButton').onclick = function () {
                                const newRole = prompt('Enter new role (0 for Customer, 2 for Merchant):');
                                if (newRole === '0' || newRole === '2') {
                                    updateUserRole(jsonData.userName, newRole);  // 调用后端更新角色
                                } else {
                                    alert('Invalid role. Please enter 0 for Customer or 2 for Merchant.');
                                }
                            };

                            // 删除用户按钮点击事件
                            document.getElementById('deleteUserButton').onclick = function () {
                                const confirmation = prompt('Type "delete" to confirm user deletion:');
                                if (confirmation === 'delete') {
                                    deleteUser(jsonData.userName);  // 调用删除函数
                                } else {
                                    alert('Deletion cancelled. Type "delete" to confirm.');
                                }
                            };
                        }
                    })
                    .catch(error => {
                        console.error('Error during user search:', error);
                        alert('Error during user search. Please try again later.');
                    });
            } else {
                alert('Please enter a username to search.');
            }
        });
    } else {
        alert('No user information found. Please login first.');
        window.location.href = '/html/user/login.html';
    }

    // 注销功能
    document.getElementById('logout').addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = '/html/user/index.html';
    });

    // 更新用户角色函数
    function updateUserRole(userName, newRole) {
        fetch(`http://localhost:8082/user/admin/updateRole/${userName}?newRole=${newRole}`, {
            method: 'PUT',  // 使用 PUT 请求方法
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.message) {
                alert(data.message);  // 显示后端返回的消息
            } else {
                alert('Unexpected response format');
            }
        })
        .catch(error => {
            console.error('Error updating user role:', error);
            alert('Error updating user role. Please try again later.');
        });
    }

    // 删除用户函数
    function deleteUser(userName) {
        fetch(`http://localhost:8082/user/admin/delete/${userName}`, {
            method: 'DELETE',  // 使用 DELETE 请求方法
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            return response.json();  // 解析 JSON 响应
        })
        .then(data => {
            if (data && data.message) {
                alert(data.message);  // 显示删除成功的消息
                document.getElementById('searchResult').style.display = 'none';  // 隐藏查询结果
            } else {
                alert('Unexpected response format');
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            alert('Error deleting user. Please try again later.');
        });
    }
});
