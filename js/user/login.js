document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const userName = document.getElementById('userName').value;
    const userPassword = document.getElementById('userPassword').value;
    
    axios.post('http://localhost:8082/user/login', { userName, userPassword })
        .then(response => {
            // 判断用户身份（管理员/普通用户）
            if (response.data.isAdmin) {
                // 管理员登录成功处理
                alert('管理员登录成功, ' + response.data.userName);
                alert('Login time: ' + response.data.loginTime); 
                localStorage.setItem('user', JSON.stringify(response.data));
                window.location.href = '/html/user/user.html';
            } else {
                // 普通用户登录成功处理
                alert('用户登录成功, ' + response.data.userName);
                alert('Login time: ' + response.data.loginTime); 
                localStorage.setItem('user', JSON.stringify(response.data));
                window.location.href = '/html/user/user.html';
            }
        })
        .catch(error => {
            // 登录失败处理（账号密码验证失败）
            alert('凭据无效，请重试.');
            console.error(error);
        });
});

// 注册按钮点击处理
document.getElementById('registerButton').addEventListener('click', function () {
    window.location.href = '/html/user/register.html'; 
});
