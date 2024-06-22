document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const userName = document.getElementById('userName').value;
    const userPassword = document.getElementById('userPassword').value;
    const userPhone = document.getElementById('userPhone').value;
    const userWallet = document.getElementById('userWallet').value;
    axios.post('http://localhost:8082/user/create', { userName, userPassword, userPhone, userWallet, isAdmin: false }) 
        .then(response => {
            alert('注册成功！');
            window.location.href = '/html/user/login.html'; // 注册成功后跳转到登录页面
        })
        .catch(error => {
            if (error.response && error.response.data) {
                alert(error.response.data); // Display more specific error message from the server
            } else {
                console.error(error);
                alert('注册失败，请重试。');
            }
        });
});

document.getElementById('loginButton').addEventListener('click', function () {
    window.location.href = '/html/user/login.html'; // 跳转到登录页面
});
