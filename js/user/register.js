// 生成随机验证码
function createCaptcha(elementId) {
    const captchaBox = document.getElementById(elementId);
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let captcha = '';
    
    // 生成4位随机验证码
    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        captcha += chars[randomIndex];
    }
    
    // 将验证码显示在验证码框中
    captchaBox.innerHTML = captcha;
    captchaBox.setAttribute('data-captcha', captcha);
    
    // 添加随机颜色和旋转效果增加验证码复杂度
    const letters = captchaBox.textContent.split('');
    captchaBox.textContent = '';
    
    letters.forEach(letter => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.style.color = `rgb(
            ${Math.floor(Math.random() * 100 + 50)}, 
            ${Math.floor(Math.random() * 100 + 50)}, 
            ${Math.floor(Math.random() * 100 + 100)}
        )`;
        span.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
        span.style.display = 'inline-block';
        captchaBox.appendChild(span);
    });
}

// 页面加载时初始化验证码
window.addEventListener("load", function() {
    createCaptcha('captcha-box');
});

// 注册表单提交处理
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const userName = document.getElementById('userName').value;
    const userPassword = document.getElementById('userPassword').value;
    const userPhone = document.getElementById('userPhone').value;
    const captchaInput = document.getElementById('captcha-input').value;
    const captchaBox = document.getElementById('captcha-box');
    const captchaValue = captchaBox.getAttribute('data-captcha');

    // 验证码校验
    if (captchaInput !== captchaValue) {
        alert('验证码错误，请重新输入！');
        document.getElementById('captcha-input').value = '';
        createCaptcha('captcha-box');
        return;
    }
    
    axios.post('http://localhost:8082/user/create', { userName, userPassword, userPhone, userType: 0 }) 
        .then(response => {
            alert('注册成功！');
            window.location.href = '/html/user/login.html';
        })
        .catch(error => {
            // 注册失败处理
            if (error.response && error.response.data) {
                alert(error.response.data);
            } else {
                console.error(error);
                alert('注册失败，请重试。');
            }
        });
});

// 返回登录页面按钮处理
document.getElementById('loginButton').addEventListener('click', function () {
    window.location.href = '/html/user/login.html'; 
});
