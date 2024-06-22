document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const userName = document.getElementById('userName').value;
    const userPassword = document.getElementById('userPassword').value;
    axios.post('http://localhost:8082/user/login', { userName, userPassword })
        .then(response => {
            if (response.data.isAdmin) {
                alert('管理员登录成功, ' + response.data.userName);
                alert('Login time: ' + response.data.loginTime); // 在登录成功的弹窗中显示登录时间
                localStorage.setItem('user', JSON.stringify(response.data));
                window.location.href = '/html/user/user.html';
            } else {
                alert('用户登录成功, ' + response.data.userName);
                alert('Login time: ' + response.data.loginTime); // 在登录成功的弹窗中显示登录时间
                localStorage.setItem('user', JSON.stringify(response.data));
                window.location.href = '/html/user/user.html';
            }
        })
        .catch(error => {
            alert('凭据无效，请重试.');
            console.error(error);
        });
});

document.getElementById('registerButton').addEventListener('click', function () {
    window.location.href = '/html/user/register.html'; // 修改为注册页面的路径
});
