// 获取用户信息
document.addEventListener('DOMContentLoaded', function() {
    // 从localStorage获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('user')) || {};
    
    // 更新页面上的用户信息
    document.getElementById('username').textContent = `用户名：${userInfo.userName || '未登录'}`;
    document.getElementById('contact').textContent = `联系方式：${userInfo.userPhone || '未设置'}`;
    document.getElementById('last-login').textContent = `最近登录时间：${userInfo.loginTime || '未记录'}`;
    
    // 根据用户类型显示不同内容
    if (userInfo.userType === 2) {
        // 商家显示轮播图
        document.getElementById('carouselContainer').style.display = 'block';
        document.getElementById('userSearchContainer').style.display = 'none';
        
        // 初始化轮播图
        initCarousel();
    } else {
        // 非商家不显示轮播图
        document.getElementById('carouselContainer').style.display = 'none';
    }
    
    // 只有管理员才可以看到用户查找部分
    if (userInfo.userType === 1) {  // 判断是否为管理员
        document.getElementById('userSearchContainer').style.display = 'block';
    } else {
        document.getElementById('userSearchContainer').style.display = 'none';
    }
    
    // 轮播图功能
    function initCarousel() {
        const track = document.getElementById('carouselTrack');
        const slides = track.querySelectorAll('.carousel-slide');
        const indicators = document.getElementById('carouselIndicators');
        const prevButton = document.getElementById('prevSlide');
        const nextButton = document.getElementById('nextSlide');
        
        let currentIndex = 0;
        let autoPlayInterval;
        
        // 创建指示器
        slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('carousel-indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(index));
            indicators.appendChild(indicator);
        });
        
        // 更新轮播图位置
        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // 更新指示器
            const allIndicators = indicators.querySelectorAll('.carousel-indicator');
            allIndicators.forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }
        
        // 跳转到指定幻灯片
        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
            resetAutoPlay();
        }
        
        // 下一张幻灯片
        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
            resetAutoPlay();
        }
        
        // 上一张幻灯片
        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
            resetAutoPlay();
        }
        
        // 重置自动播放
        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }
        
        // 开始自动播放
        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 5000);
        }
        
        // 添加事件监听
        prevButton.addEventListener('click', prevSlide);
        nextButton.addEventListener('click', nextSlide);
        
        // 开始自动播放
        startAutoPlay();
    }
    
    // 用户查询功能
    const searchForm = document.getElementById('searchUser');
    const searchButton = document.getElementById('searchButton');
    
    // 添加回车搜索功能
    searchForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchUser();
        }
    });
    
    // 搜索按钮点击事件
    searchButton.addEventListener('click', function() {
        searchUser();
    });
    
    // 搜索用户函数
    function searchUser() {
        const userName = document.getElementById('searchUser').value;
        if (userName) {
            fetch(`http://localhost:8082/user/admin/search/${userName}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();  // 如果请求成功，解析 JSON
                    } else {
                        throw new Error('用户未找到');
                    }
                })
                .then(jsonData => {
                    if (jsonData) {
                        // 显示查询结果
                        document.getElementById('searchedUserName').textContent = `用户名：${jsonData.userName}`;
                        document.getElementById('searchedUserPhone').textContent = `联系方式：${jsonData.userPhone}`;
                        document.getElementById('searchResult').style.display = 'block';

                        // 更新角色按钮点击事件
                        document.getElementById('updateRoleButton').onclick = function () {
                            const newRole = prompt('输入新角色 (0 为普通用户, 2 为商家):');
                            if (newRole === '0' || newRole === '2') {
                                updateUserRole(jsonData.userName, newRole);  // 调用后端更新角色
                            } else {
                                alert('无效角色。请输入 0 表示普通用户或 2 表示商家。');
                            }
                        };

                        // 删除用户按钮点击事件
                        document.getElementById('deleteUserButton').onclick = function () {
                            const confirmation = prompt('输入 "delete" 确认删除用户:');
                            if (confirmation === 'delete') {
                                deleteUser(jsonData.userName);  // 调用删除函数
                            } else {
                                alert('删除已取消。输入 "delete" 确认。');
                            }
                        };
                    }
                })
                .catch(error => {
                    console.error('用户搜索出错:', error);
                    alert('用户搜索出错。请稍后再试。');
                });
        } else {
            alert('请输入用户名进行搜索。');
        }
    }
    
    // 更新用户角色函数
    function updateUserRole(userName, newRole) {
        fetch(`http://localhost:8082/user/admin/updateRole/${userName}?newRole=${newRole}`, {
            method: 'PUT',  // 使用 PUT 请求方法
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`错误: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.message) {
                alert(data.message);  // 显示后端返回的消息
            } else {
                alert('意外的响应格式');
            }
        })
        .catch(error => {
            console.error('更新用户角色出错:', error);
            alert('更新用户角色出错。请稍后再试。');
        });
    }

    // 删除用户函数
    function deleteUser(userName) {
        fetch(`http://localhost:8082/user/admin/delete/${userName}`, {
            method: 'DELETE',  // 使用 DELETE 请求方法
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`错误: ${response.statusText}`);
            }
            return response.json();  // 解析 JSON 响应
        })
        .then(data => {
            if (data && data.message) {
                alert(data.message);  // 显示删除成功的消息
                document.getElementById('searchResult').style.display = 'none';  // 隐藏查询结果
            } else {
                alert('意外的响应格式');
            }
        })
        .catch(error => {
            console.error('删除用户出错:', error);
            alert('删除用户出错。请稍后再试。');
        });
    }
    
    // 回首页按钮点击事件
    document.getElementById('homeBtn').addEventListener('click', function() {
        window.location.href = '/html/user/index.html';
    });
    
    // 退出登录按钮点击事件
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('user');
        alert('已退出登录');
        window.location.href = '/html/user/login.html';
    });
    
    // 设置商场和订单按钮的链接
    document.querySelector('.shop-btn').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/html/goods/goods.html';
    });
    
    document.querySelector('.order-btn').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/html/order/order.html';
    });
});