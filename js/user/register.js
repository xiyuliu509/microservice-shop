document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const userName = document.getElementById('userName').value;
    const userPassword = document.getElementById('userPassword').value;
    const userPhone = document.getElementById('userPhone').value;
    const userWallet = document.getElementById('userWallet').value;
    axios.post('http://localhost:8082/user/create', { userName, userPassword, userPhone, userWallet })
        .then(response => {
            // 处理注册成功的逻辑
            alert('注册成功！');
            window.location.href = '/microservice_212106233/html/user/login.html'; // 注册成功后跳转到登录页面
        })
        .catch(error => {
            console.error(error);
            alert('注册失败，请重试。');
        });
});

document.getElementById('loginButton').addEventListener('click', function () {
    window.location.href = '/microservice_212106233/html/user/login.html'; // 跳转到登录页面
});
