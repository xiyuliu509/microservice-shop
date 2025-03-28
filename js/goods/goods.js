(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('请先登录');
            window.location.href = '/html/user/login.html';
            return;
        }

        const container = document.querySelector('.container');
        const orderItems = [];
        const isAdmin = user.isAdmin;
        const userType = user.userType;  // 获取用户类型
        const pageSize = 10;  // 每页显示10个商品
        let currentPage = 1;  // 当前页码
        let totalPages = 1;  // 总页数（初始为1）
        let currentCategory = '';  // 当前选中的分类
        let currentBrand = '';  // 当前选中的品牌
        let currentMinPrice = '';  // 当前最低价格
        let currentMaxPrice = '';  // 当前最高价格

        // 根据用户类型显示不同功能
        if (userType === 1 || userType === 2) {  // 如果是管理员或者商家
            document.getElementById('adminContainer').style.display = 'block';  // 显示商品管理功能
            document.getElementById('userContainer').style.display = 'none';  // 隐藏普通用户功能
        } else {
            document.getElementById('adminContainer').style.display = 'none';  // 隐藏商品管理功能
            document.getElementById('userContainer').style.display = 'block';  // 显示普通用户功能
        }

        // 载入商品
        function loadGoods(page = 1, category = '', brand = '', minPrice = '', maxPrice = '') {
            // 保存当前筛选条件
            currentPage = page;
            currentCategory = category;
            currentBrand = brand;
            currentMinPrice = minPrice;
            currentMaxPrice = maxPrice;
            
            // 默认获取所有商品
            let url = `http://localhost:8084/goods/list`;

            // 根据筛选条件构建URL
            if (category && brand && (minPrice || maxPrice)) {
                // 同时按类型、品牌和价格筛选
                url = `http://localhost:8084/goods/filterByTypeBrandPrice?goodsType=${category}&goodsBrand=${brand}`;
                if (minPrice) url += `&minPrice=${minPrice}`;
                if (maxPrice) url += `&maxPrice=${maxPrice}`;
            } else if (category && brand) {
                // 同时按类型和品牌筛选 - 使用类型和品牌组合筛选
                url = `http://localhost:8084/goods/filterByTypeBrandPrice?goodsType=${category}&goodsBrand=${brand}&minPrice=0&maxPrice=999999`;
            } else if (category) {
                // 仅按类型筛选
                url = `http://localhost:8084/goods/filterByType?goodsType=${category}`;
            } else if (brand) {
                // 仅按品牌筛选
                url = `http://localhost:8084/goods/filterByBrand?goodsBrand=${brand}`;
            } else if (minPrice || maxPrice) {
                // 仅按价格筛选
                url = `http://localhost:8084/goods/filterByPrice?minPrice=${minPrice || 0}&maxPrice=${maxPrice || 999999}`;
            }

            console.log('请求URL:', url); // 添加日志，查看实际请求的URL

            axios.get(url)
                .then(response => {
                    container.innerHTML = ''; // 清空容器
                    const goodsList = response.data || [];
                    console.log('获取到的商品数据:', goodsList);
                    
                    if (goodsList.length === 0) {
                        container.innerHTML = '<p>暂无商品</p>';
                        return;
                    }

                    // 如果有价格筛选但后端不支持，在前端进行过滤
                    let filteredGoods = goodsList;
                    if ((minPrice || maxPrice) && !url.includes('minPrice')) {
                        filteredGoods = goodsList.filter(goods => {
                            let match = true;
                            if (minPrice && goods.goodsPrice < parseFloat(minPrice)) match = false;
                            if (maxPrice && goods.goodsPrice > parseFloat(maxPrice)) match = false;
                            return match;
                        });
                        
                        if (filteredGoods.length === 0) {
                            container.innerHTML = '<p>没有符合价格条件的商品</p>';
                            return;
                        }
                    }

                    // 计算总页数
                    totalPages = Math.ceil(filteredGoods.length / pageSize);
                    
                    // 计算当前页应显示的商品
                    const startIndex = (currentPage - 1) * pageSize;
                    const endIndex = Math.min(startIndex + pageSize, filteredGoods.length);
                    const currentPageGoods = filteredGoods.slice(startIndex, endIndex);

                    currentPageGoods.forEach(goods => {
                        const item = document.createElement('div');
                        item.className = 'goods-item';

                        // 修改图片URL构建方式，使用正确的API路径
                        const imageUrl = "http://localhost:8084/goods/images/" + goods.goodsImage;
                        
                        const goodsTypes = {
                            1: '石材砖',
                            2: '仿木砖',
                            3: '泳池砖',
                            4: '马赛克砖',
                            5: '底漆',
                            6: '防水涂料',
                            7: '内墙乳胶漆',
                            8: '木漆及金属漆',
                            9: '腻子',
                            10: '美缝',
                            11: '密封抗裂胶'
                        };

                        const brandTypes = {
                            'a': '马可波罗瓷砖',
                            'b': '雪狼陶瓷',
                            'c': '多乐士',
                            'd': '立邦',
                            'e': '奥斯曼',
                            'f': '西卡'
                        };

                        const brandName = brandTypes[goods.goodsBrand] || '未知品牌';
                        const typeName = goodsTypes[goods.goodsType] || '未知类型';

                        item.innerHTML = `
                            <img src="${imageUrl}" alt="${goods.goodsName}" onerror="this.src='/img/default.png'">
                            <h2>${goods.goodsName}</h2>
                            <p>价格: $${goods.goodsPrice}</p>
                            <p>库存: <span id="stock-${goods.goodsId}">${goods.stock}</span></p>
                            <p>品牌: ${brandName}</p>
                            <p>类型: ${typeName}</p>
                            <p>上架日期: ${goods.timeStamp}</p>
                            ${isAdmin ? `
                                <button class="stock-button" onclick="updateStock(${goods.goodsId}, 1)">增加库存</button>
                                <button class="stock-button" onclick="updateStock(${goods.goodsId}, -1)">减少库存</button>
                            ` : `
                                <input type="number" id="quantity-${goods.goodsId}" placeholder="数量">
                                <button class="add-button" onclick="addToOrder(${goods.goodsId}, '${goods.goodsName}', ${goods.goodsPrice})">添加到订单</button>
                            `}
                        `;
                        container.appendChild(item);
                    });
                    
                    // 渲染分页按钮
                    renderPagination();
                })
                .catch(error => {
                    console.error('Error loading goods:', error);
                    container.innerHTML = '<p>加载商品失败: ' + error.message + '</p>';
                    console.log('请求失败的URL:', url);
                    console.log('错误详情:', error.response ? error.response.data : '无响应数据');
                });
        }

        // 商品分类筛选
        document.getElementById('categorySelect').addEventListener('change', function() {
            const selectedCategory = this.value;
            const selectedBrand = document.getElementById('brandSelect').value;
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            loadGoods(1, selectedCategory, selectedBrand, minPrice, maxPrice); // 重置为第一页
        });

        // 商品品牌筛选
        document.getElementById('brandSelect').addEventListener('change', function() {
            const selectedBrand = this.value;
            const selectedCategory = document.getElementById('categorySelect').value;
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            loadGoods(1, selectedCategory, selectedBrand, minPrice, maxPrice); // 重置为第一页
        });
        
        // 价格筛选按钮
        document.getElementById('priceFilterButton').addEventListener('click', function() {
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            const selectedCategory = document.getElementById('categorySelect').value;
            const selectedBrand = document.getElementById('brandSelect').value;
            
            // 验证价格输入
            if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
                alert('最低价格不能高于最高价格');
                return;
            }
            
            loadGoods(1, selectedCategory, selectedBrand, minPrice, maxPrice); // 重置为第一页
        });
        
        // 价格输入框回车键触发筛选
        document.getElementById('minPrice').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('priceFilterButton').click();
            }
        });
        
        document.getElementById('maxPrice').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('priceFilterButton').click();
            }
        });
        
        // 渲染分页按钮
        function renderPagination() {
            const paginationContainer = document.getElementById('paginationContainer');
            paginationContainer.innerHTML = '';  // 清空现有的分页按钮
            
            if (totalPages <= 1) {
                return; // 如果只有一页，不显示分页按钮
            }
        
            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.classList.add('pagination-button');
                if (i === currentPage) {
                    button.classList.add('active');  // 给当前页按钮添加 'active' 类
                }
                button.addEventListener('click', () => {
                    // 使用保存的筛选条件，包括价格
                    loadGoods(i, currentCategory, currentBrand, currentMinPrice, currentMaxPrice);
                });
                paginationContainer.appendChild(button);
            }
        }
        
        // 初始化第一页商品数据
        loadGoods(1);

        // 取消按钮关闭模态框
        document.getElementById('cancelButton').addEventListener('click', function() {
            document.getElementById('myModal').style.display = 'none';
        });

        window.addEventListener('click', function (event) {
            if (event.target == document.getElementById('myModal')) {
                document.getElementById('myModal').style.display = 'none';
            }
        });
    });
})();