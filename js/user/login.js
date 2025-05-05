document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const userName = document.getElementById('userName').value;
    const userPassword = document.getElementById('userPassword').value;
    
    // 显示加载状态
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> 登录中...';
    }
    
    axios.post('http://localhost:8082/user/login', { userName, userPassword })
        .then(response => {
            // 判断用户身份（管理员/普通用户/商家）
            if (response.data.userType === 1) {
                // 管理员登录成功处理
                showNotification('管理员登录成功, ' + response.data.userName, 'success');
                localStorage.setItem('user', JSON.stringify(response.data));
                
                // 延迟跳转到管理员页面
                setTimeout(() => {
                    window.location.href = '/admin.html'; // 管理员跳转到管理后台
                }, 1500);
            } else if (response.data.userType === 2) {
                // 商家登录成功处理
                showNotification('商家登录成功, ' + response.data.userName, 'success');
                localStorage.setItem('user', JSON.stringify(response.data));
                
                // 延迟跳转到商家页面
                setTimeout(() => {
                    window.location.href = '/html/user/user.html';
                }, 1500);
            } else {
                // 普通用户登录成功处理
                showNotification('用户登录成功, ' + response.data.userName, 'success');
                localStorage.setItem('user', JSON.stringify(response.data));
                
                // 延迟跳转到用户页面
                setTimeout(() => {
                    window.location.href = '/html/user/user.html';
                }, 1500);
            }
        })
        .catch(error => {
            // 恢复按钮状态
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = '登录';
            }
            
            // 登录失败处理（账号密码验证失败）
            showNotification('凭据无效，请重试', 'error');
            console.error(error);
        });
});

// 注册按钮点击处理
document.getElementById('registerButton').addEventListener('click', function () {
    window.location.href = '/html/user/register.html'; 
});

// 显示通知消息
function showNotification(message, type = 'info') {
    // 检查是否已存在通知元素
    let notification = document.getElementById('login-notification');
    
    // 如果不存在，创建一个
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'login-notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
        
        // 添加样式
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        notification.style.zIndex = '1000';
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
    }
    
    // 设置通知类型样式
    if (type === 'success') {
        notification.style.backgroundColor = '#51e9a5';
        notification.style.color = '#fff';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ff5252';
        notification.style.color = '#fff';
    } else {
        notification.style.backgroundColor = '#f8f9fa';
        notification.style.color = '#333';
    }
    
    // 设置消息内容
    notification.textContent = message;
    
    // 显示通知
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // 3秒后隐藏通知
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
    }, 3000);
}
