(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('请先登录');
            window.location.href = '/html/user/login.html';
            return;
        }

        const container = document.querySelector('.container');
        const orderItems = JSON.parse(localStorage.getItem('orderItems')) || [];
        const isAdmin = user.isAdmin;
        const userType = user.userType;  // 获取用户类型
        const pageSize = 10;  // 每页显示10个商品
        let currentPage = 1;  // 当前页码
        let totalPages = 1;  // 总页数（初始为1）
        let currentCategory = '';  // 当前选中的分类
        let currentBrand = '';  // 当前选中的品牌
        let currentMinPrice = '';  // 当前最低价格
        let currentMaxPrice = '';  // 当前最高价格
        let currentSearchTerm = '';  // 当前搜索关键词

        // 根据用户类型显示不同功能
        if (userType === 1 || userType === 2) {  // 如果是管理员或者商家
            document.getElementById('adminContainer').style.display = 'block';  // 显示商品管理功能
            document.getElementById('userContainer').style.display = 'none';  // 隐藏普通用户功能
        } else {
            document.getElementById('adminContainer').style.display = 'none';  // 隐藏商品管理功能
            document.getElementById('userContainer').style.display = 'block';  // 显示普通用户功能
        }

        // 载入商品
        function loadGoods(page = 1, category = '', brand = '', minPrice = '', maxPrice = '', searchTerm = '') {
            // 保存当前筛选条件
            currentPage = page;
            currentCategory = category;
            currentBrand = brand;
            currentMinPrice = minPrice;
            currentMaxPrice = maxPrice;
            currentSearchTerm = searchTerm;
            
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
                        container.innerHTML = '<div class="no-results">没有找到符合条件的商品</div>';
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
                            container.innerHTML = '<div class="no-results">没有符合价格条件的商品</div>';
                            return;
                        }
                    }

                    // 如果有搜索关键词，只在商品名称中搜索
                    if (searchTerm) {
                        const term = searchTerm.toLowerCase();
                        filteredGoods = filteredGoods.filter(goods => 
                            goods.goodsName.toLowerCase().includes(term)
                        );
                        
                        if (filteredGoods.length === 0) {
                            container.innerHTML = '<div class="no-results">没有找到名称包含 "' + searchTerm + '" 的商品</div>';
                            return;
                        }
                    }

                    // 计算总页数
                    totalPages = Math.ceil(filteredGoods.length / pageSize);
                    
                    // 计算当前页应显示的商品
                    const startIndex = (currentPage - 1) * pageSize;
                    const endIndex = Math.min(startIndex + pageSize, filteredGoods.length);
                    const currentPageGoods = filteredGoods.slice(startIndex, endIndex);

                    // 修改商品卡片的HTML生成部分
                    currentPageGoods.forEach(goods => {
                        const item = document.createElement('div');
                        item.className = 'goods-item';
                        
                        // 如果是搜索结果且匹配搜索词，添加高亮类
                        if (searchTerm && goods.goodsName.toLowerCase().includes(searchTerm.toLowerCase())) {
                            item.classList.add('highlight');
                        }
                    
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
                    
                        // 修改品牌映射，确保与后端存储的品牌代码完全匹配
                        const brandTypes = {
                            'a': '马可波罗瓷砖',
                            'b': '雪狼陶瓷',
                            'c': '多乐士',
                            'd': '立邦',
                            'e': '奥斯曼',
                            'f': '西卡',
                            // 添加大写字母映射，以防后端存储的是大写字母
                            'A': '马可波罗瓷砖',
                            'B': '雪狼陶瓷',
                            'C': '多乐士',
                            'D': '立邦',
                            'E': '奥斯曼',
                            'F': '西卡'
                        };
                    
                        // 改进品牌名称获取逻辑，增加日志以便调试
                        // console.log("商品品牌代码:", goods.goodsBrand);
                        const brandName = brandTypes[goods.goodsBrand] || '未知品牌(' + goods.goodsBrand + ')';
                        const typeName = goodsTypes[goods.goodsType] || '未知类型(' + goods.goodsType + ')';
                        
                        // 在loadGoods函数中修改商品项的HTML生成部分
                        item.innerHTML = `
                            <img src="${imageUrl}" alt="${goods.goodsName}" onerror="this.src='/img/default.png'">
                            <h2>${goods.goodsName}</h2>
                            <div class="goods-info">
                                <!-- 价格和库存在同一行 -->
                                <div class="info-row">
                                    <span>价格: ¥${goods.goodsPrice}</span>
                                    <span>库存: <span id="stock-${goods.goodsId}">${goods.stock}</span></span>
                                </div>
                                
                                <!-- 品牌和类型在同一行 -->
                                <div class="info-row">
                                    <span>品牌: ${brandName}</span>
                                    <span>类型: ${typeName}</span>
                                </div>
                                
                                <!-- 上架日期单独一行 -->
                                <div class="info-row">
                                    <span>上架日期: ${goods.timeStamp}</span>
                                </div>
                            </div>
                            
                            <div class="order-controls">
                                ${userType === 1 || userType === 2 ? `
                                    <button class="stock-button" data-id="${goods.goodsId}" data-action="increase">增加库存</button>
                                    <button class="stock-button" data-id="${goods.goodsId}" data-action="decrease">减少库存</button>
                                    <button class="add-button" data-id="${goods.goodsId}" data-name="${goods.goodsName}" data-price="${goods.goodsPrice}">加入购物车</button>
                                ` : `
                                    <input type="number" id="quantity-${goods.goodsId}" placeholder="数量" min="1" max="${goods.stock}" value="1">
                                    <button class="add-button" data-id="${goods.goodsId}" data-name="${goods.goodsName}" data-price="${goods.goodsPrice}">添加到订单</button>
                                `}
                            </div>
                        `;
                        container.appendChild(item);
                    });
                    
                    // 添加事件监听器
                    addEventListeners();
                    
                    // 渲染分页按钮
                    renderPagination();
                })
                .catch(error => {
                    console.error('Error loading goods:', error);
                    container.innerHTML = '<div class="error-message">加载商品失败: ' + error.message + '</div>';
                    console.log('请求失败的URL:', url);
                    console.log('错误详情:', error.response ? error.response.data : '无响应数据');
                });
        }

        // 添加事件监听器
        // 添加事件监听器
        function addEventListeners() {
            // 为增加库存按钮添加事件
            document.querySelectorAll('.stock-button[data-action="increase"]').forEach(button => {
                button.addEventListener('click', function() {
                    const goodsId = this.getAttribute('data-id');
                    updateStock(goodsId, 1);
                });
            });
            
            // 为减少库存按钮添加事件
            document.querySelectorAll('.stock-button[data-action="decrease"]').forEach(button => {
                button.addEventListener('click', function() {
                    const goodsId = this.getAttribute('data-id');
                    updateStock(goodsId, -1);
                });
            });
            
            // 移除下架商品按钮的事件监听器，改为在顶栏操作
            
            // 为加入购物车按钮添加事件
            document.querySelectorAll('.add-button').forEach(button => {
                button.addEventListener('click', function() {
                    const goodsId = this.getAttribute('data-id');
                    const goodsName = this.getAttribute('data-name');
                    const goodsPrice = this.getAttribute('data-price');
                    const quantity = document.getElementById(`quantity-${goodsId}`) ? 
                        document.getElementById(`quantity-${goodsId}`).value : 1;
                    addToOrder(goodsId, goodsName, goodsPrice, quantity);
                });
            });
        }

        // 更新库存
        function updateStock(goodsId, change) {
            const stockElement = document.getElementById(`stock-${goodsId}`);
            const currentStock = parseInt(stockElement.textContent);
            const newStock = currentStock + change;
            
            if (newStock < 0) {
                alert('库存不能小于0');
                return;
            }
            
            // 修改为使用正确的后端接口名称和请求方式
            axios.post(`http://localhost:8084/goods/updateStock`, {
                goodsId: goodsId,
                quantity: newStock
            })
            .then(response => {
                // 检查响应是否成功
                if (response.data && (response.data.success || response.status === 200)) {
                    stockElement.textContent = newStock;
                    alert('库存更新成功');
                } else {
                    alert('库存更新失败: ' + (response.data ? response.data.message : '未知错误'));
                }
            })
            .catch(error => {
                console.error('Error updating stock:', error);
                alert('库存更新失败: ' + error.message);
            });
        }
        
        // 下架商品功能
        function deleteGoods(goodsName) {
            // 使用自定义确认弹窗替代原生confirm
            showCustomConfirm('确定要下架商品 "' + goodsName + '" 吗？', '下架商品确认', function(confirmed) {
                if (confirmed) {
                    axios.delete(`http://localhost:8084/goods/delete/${goodsName}`)
                        .then(response => {
                            console.log('删除商品响应:', response);
                            if (response.data === '商品删除成功') {
                                showCustomAlert('商品下架成功');
                                // 重新加载商品列表
                                loadGoods(currentPage, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm);
                            } else {
                                showCustomAlert('商品下架失败: ' + response.data);
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting goods:', error);
                            showCustomAlert('商品下架失败: ' + error.message);
                        });
                }
            });
        }

        // 添加顶栏下架按钮的事件监听器
        document.getElementById('deleteButton').addEventListener('click', function() {
            // 检查弹窗元素是否存在
            const dialog = document.getElementById('deleteGoodsDialog');
            if (!dialog) {
                console.error('找不到下架商品弹窗元素');
                // 使用原生prompt作为备选方案
                const goodsId = prompt('请输入要下架的商品ID:');
                if (goodsId) {
                    deleteGoods(goodsId);
                }
                return;
            }
            
            const closeButton = dialog.querySelector('.custom-dialog-close');
            const confirmButton = document.getElementById('confirmDeleteButton');
            const cancelButton = document.getElementById('cancelDeleteButton');
            const errorMessage = document.getElementById('deleteModalError');
            const goodsIdInput = document.getElementById('deleteGoodsId');
            
            // 清空表单
            goodsIdInput.value = '';
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
            
            // 显示弹窗
            dialog.classList.add('show');
            
            // 确认按钮事件
            const confirmHandler = () => {
                const goodsId = goodsIdInput.value.trim();
                
                if (!goodsId) {
                    errorMessage.textContent = '请输入商品ID';
                    errorMessage.style.display = 'block';
                    return;
                }
                
                dialog.classList.remove('show');
                deleteGoods(goodsId);
                cleanup();
            };
            
            // 取消按钮事件
            const cancelHandler = () => {
                dialog.classList.remove('show');
                cleanup();
            };
            
            // 关闭按钮事件
            const closeHandler = () => {
                dialog.classList.remove('show');
                cleanup();
            };
            
            // 清理事件监听器
            const cleanup = () => {
                confirmButton.removeEventListener('click', confirmHandler);
                cancelButton.removeEventListener('click', cancelHandler);
                closeButton.removeEventListener('click', closeHandler);
            };
            
            confirmButton.addEventListener('click', confirmHandler);
            cancelButton.addEventListener('click', cancelHandler);
            closeButton.addEventListener('click', closeHandler);
        });
        
        // 添加到订单
        function addToOrder(goodsId, goodsName, goodsPrice, quantity) {
            if (!quantity || quantity < 1) {
                alert('请输入有效的数量');
                return;
            }
            
            const item = {
                goodsId: goodsId,
                goodsName: goodsName,
                goodsPrice: goodsPrice,
                quantity: parseInt(quantity)
            };
            
            // 检查是否已存在相同商品
            const existingItemIndex = orderItems.findIndex(i => i.goodsId === goodsId);
            if (existingItemIndex !== -1) {
                orderItems[existingItemIndex].quantity += parseInt(quantity);
            } else {
                orderItems.push(item);
            }
            
            localStorage.setItem('orderItems', JSON.stringify(orderItems));
            alert(`已添加 ${quantity} 个 ${goodsName} 到订单`);
        }

        // 商品分类筛选
        document.getElementById('categorySelect').addEventListener('change', function() {
            const selectedCategory = this.value;
            const selectedBrand = document.getElementById('brandSelect').value;
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            loadGoods(1, selectedCategory, selectedBrand, minPrice, maxPrice, currentSearchTerm); // 重置为第一页
        });

        // 商品品牌筛选
        document.getElementById('brandSelect').addEventListener('change', function() {
            const selectedBrand = this.value;
            const selectedCategory = document.getElementById('categorySelect').value;
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            loadGoods(1, selectedCategory, selectedBrand, minPrice, maxPrice, currentSearchTerm); // 重置为第一页
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
            
            loadGoods(1, selectedCategory, selectedBrand, minPrice, maxPrice, currentSearchTerm); // 重置为第一页
        });
        
        // 搜索表单提交
        document.querySelector('.search-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = document.getElementById('searchInput').value.trim();
            
            if (!searchTerm) {
                alert('请输入搜索关键词');
                return;
            }
            
            // 重置其他筛选条件，只保留搜索
            document.getElementById('categorySelect').value = '';
            document.getElementById('brandSelect').value = '';
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            
            loadGoods(1, '', '', '', '', searchTerm);
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
                    // 使用保存的筛选条件，包括价格和搜索词
                    loadGoods(i, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm);
                });
                paginationContainer.appendChild(button);
            }
        }
        
        // 上架商品按钮
        document.getElementById('createButton').addEventListener('click', function() {
            // 清空模态框中的输入
            document.getElementById('goodsName').value = '';
            document.getElementById('goodsPrice').value = '';
            document.getElementById('goodsStock').value = '';
            document.getElementById('goodsType').value = ''; // 重置下拉菜单
            document.getElementById('goodsBrand').value = ''; // 重置下拉菜单
            document.getElementById('goodsImage').value = '';
            document.getElementById('modalError').textContent = '';
            document.getElementById('file-name').textContent = '未选择文件';
            
            // 显示模态框
            document.getElementById('myModal').style.display = 'flex';
        });
        
        // 添加文件名显示功能
        document.getElementById('goodsImage').addEventListener('change', function() {
            const fileName = this.files[0] ? this.files[0].name : '未选择文件';
            document.getElementById('file-name').textContent = fileName;
            
            // 验证文件类型
            if (this.files[0]) {
                const fileType = this.files[0].type;
                if (!fileType.match('image/jpeg') && !fileType.match('image/png') && !fileType.match('image/jpg')) {
                    document.getElementById('modalError').textContent = '只支持 jpg, jpeg, png 格式的图片';
                    this.value = ''; // 清空文件选择
                    document.getElementById('file-name').textContent = '未选择文件';
                } else if (this.files[0].size > 5 * 1024 * 1024) { // 5MB
                    document.getElementById('modalError').textContent = '文件太大，最大支持 5MB';
                    this.value = ''; // 清空文件选择
                    document.getElementById('file-name').textContent = '未选择文件';
                } else {
                    document.getElementById('modalError').textContent = '';
                }
            }
        });
        
        // 确认上架商品
        document.getElementById('confirmButton').addEventListener('click', function() {
            // 获取表单数据
            const goodsName = document.getElementById('goodsName').value.trim();
            const goodsPrice = document.getElementById('goodsPrice').value.trim();
            const goodsStock = document.getElementById('goodsStock').value.trim();
            const goodsType = document.getElementById('goodsType').value.trim();
            const goodsBrand = document.getElementById('goodsBrand').value.trim();
            const goodsImage = document.getElementById('goodsImage').files[0];
            
            // 清空错误信息
            document.getElementById('modalError').textContent = '';
            
            // 验证表单数据
            if (!goodsName || !goodsPrice || !goodsStock || !goodsType || !goodsBrand) {
                document.getElementById('modalError').textContent = '请填写所有必填字段';
                return;
            }
            
            if (parseFloat(goodsPrice) <= 0) {
                document.getElementById('modalError').textContent = '价格必须大于0';
                return;
            }
            
            if (parseInt(goodsStock) < 0) {
                document.getElementById('modalError').textContent = '库存不能小于0';
                return;
            }
            
            if (!goodsImage) {
                document.getElementById('modalError').textContent = '请选择商品图片';
                return;
            }
            
            
            // 创建FormData对象
            const formData = new FormData();
            formData.append('goodsName', goodsName);
            formData.append('goodsPrice', goodsPrice);
            formData.append('goodsStock', goodsStock);
            formData.append('goodsType', goodsType);
            formData.append('goodsBrand', goodsBrand); // 直接使用选择的品牌代码
            formData.append('file', goodsImage);
            
            // 添加日志，查看实际发送的数据
            console.log('发送的商品数据:', {
                goodsName,
                goodsPrice,
                goodsStock,
                goodsType,
                goodsBrand,
                file: goodsImage.name
            });
            
            // 显示加载状态
            document.getElementById('confirmButton').disabled = true;
            document.getElementById('confirmButton').textContent = '上传中...';
            
            // 发送请求
            axios.post('http://localhost:8084/goods/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                // 恢复按钮状态
                document.getElementById('confirmButton').disabled = false;
                document.getElementById('confirmButton').textContent = '确认';
                
                console.log('创建商品响应:', response);
                
                if (response.data && response.data.includes('成功')) {
                    alert('商品上架成功');
                    document.getElementById('myModal').style.display = 'none';
                    // 重新加载商品列表
                    loadGoods(1);
                } else {
                    document.getElementById('modalError').textContent = '商品上架失败: ' + response.data;
                }
            })
            .catch(error => {
                // 恢复按钮状态
                document.getElementById('confirmButton').disabled = false;
                document.getElementById('confirmButton').textContent = '确认';
                
                console.error('Error creating goods:', error);
                document.getElementById('modalError').textContent = '商品上架失败: ' + 
                    (error.response && error.response.data ? error.response.data : error.message);
            });
        });
        
        // 取消按钮关闭模态框
        document.getElementById('cancelButton').addEventListener('click', function() {
            document.getElementById('myModal').style.display = 'none';
        });

        // 点击模态框外部关闭
        window.addEventListener('click', function(event) {
            if (event.target == document.getElementById('myModal')) {
                document.getElementById('myModal').style.display = 'none';
            }
        });

        // 创建订单按钮
        document.getElementById('orderButton').addEventListener('click', function() {
            if (orderItems.length === 0) {
                showCustomAlert('请先添加商品到订单');
                return;
            }
            
            // 计算总价
            const totalPrice = orderItems.reduce((total, item) => total + (parseFloat(item.goodsPrice) * parseInt(item.quantity)), 0);
            
            // 准备订单数据
            const orderInfo = {
                userId: user.userId,
                orderPrice: totalPrice,
                orderState: '待付款',
                orderGoodsList: orderItems.map(item => ({
                    goodsId: parseInt(item.goodsId),
                    quantity: parseInt(item.quantity),
                    goodsPrice: parseFloat(item.goodsPrice)
                }))
            };
            
            // 发送创建订单请求
            axios.post('http://localhost:8083/order/create', orderInfo)
                .then(response => {
                    console.log('创建订单响应:', response);
                    
                    // 根据后端返回的数据结构正确获取订单ID
                    // 检查response.data是否为对象且包含orderId字段
                    let orderId;
                    if (response.data && typeof response.data === 'object') {
                        orderId = response.data.orderId;
                    } else if (response.data && typeof response.data === 'string' && response.data.includes('orderId')) {
                        // 尝试从字符串中解析JSON
                        try {
                            const match = response.data.match(/orderId[:\s]+(\d+)/);
                            if (match && match[1]) {
                                orderId = match[1];
                            }
                        } catch (e) {
                            console.error('解析订单ID失败:', e);
                        }
                    }
                    
                    // 如果无法获取订单ID，使用默认值
                    if (!orderId) {
                        console.warn('订单创建');
                        orderId = '创建成功';
                    }
                    
                    // 显示订单确认弹窗，而不是直接提示成功
                    showOrderConfirmDialog(orderId, orderItems, totalPrice);
                    
                    // 清空订单项
                    localStorage.removeItem('orderItems');
                    orderItems.length = 0;
                })
                .catch(error => {
                    console.error('创建订单失败:', error);
                    showCustomAlert('创建订单失败: ' + (error.response ? error.response.data : error.message));
                });
        });
        
        // 取消按钮关闭模态框
        document.getElementById('cancelButton').addEventListener('click', function() {
            document.getElementById('myModal').style.display = 'none';
        });

        window.addEventListener('click', function (event) {
            if (event.target == document.getElementById('myModal')) {
                document.getElementById('myModal').style.display = 'none';
            }
        });
        
        // 初始化第一页商品数据
        loadGoods(1);
        
        // 将函数暴露到全局作用域，以便HTML中的onclick调用
        window.updateStock = updateStock;
        window.addToOrder = addToOrder;
        window.deleteGoods = deleteGoods;
        
        // 统一的弹窗功能
        // 自定义提示弹窗
        window.showCustomAlert = function(message, title = '提示') {
            const dialog = document.getElementById('customAlert');
            const messageElement = document.getElementById('customAlertMessage');
            const titleElement = dialog.querySelector('.custom-dialog-title');
            const confirmButton = document.getElementById('customAlertConfirm');
            const closeButton = dialog.querySelector('.custom-dialog-close');
            
            titleElement.textContent = title;
            messageElement.innerHTML = message;
            dialog.classList.add('show');
            
            // 确认按钮事件
            const confirmHandler = () => {
                dialog.classList.remove('show');
                confirmButton.removeEventListener('click', confirmHandler);
                closeButton.removeEventListener('click', closeHandler);
            };
            
            // 关闭按钮事件
            const closeHandler = () => {
                dialog.classList.remove('show');
                confirmButton.removeEventListener('click', confirmHandler);
                closeButton.removeEventListener('click', closeHandler);
            };
            
            confirmButton.addEventListener('click', confirmHandler);
            closeButton.addEventListener('click', closeHandler);
        };

        // 自定义确认弹窗
        window.showCustomConfirm = function(message, title = '确认', callback) {
            const dialog = document.getElementById('customDialog');
            const messageElement = document.getElementById('customDialogMessage');
            const titleElement = dialog.querySelector('.custom-dialog-title');
            const confirmButton = document.getElementById('customDialogConfirm');
            const cancelButton = document.getElementById('customDialogCancel');
            const closeButton = dialog.querySelector('.custom-dialog-close');
            
            titleElement.textContent = title;
            messageElement.innerHTML = message;
            dialog.classList.add('show');
            
            // 确认按钮事件
            const confirmHandler = () => {
                dialog.classList.remove('show');
                if (typeof callback === 'function') {
                    callback(true);
                }
                cleanup();
            };
            
            // 取消按钮事件
            const cancelHandler = () => {
                dialog.classList.remove('show');
                if (typeof callback === 'function') {
                    callback(false);
                }
                cleanup();
            };
            
            // 关闭按钮事件
            const closeHandler = () => {
                dialog.classList.remove('show');
                if (typeof callback === 'function') {
                    callback(false);
                }
                cleanup();
            };
            
            // 清理事件监听器
            const cleanup = () => {
                confirmButton.removeEventListener('click', confirmHandler);
                cancelButton.removeEventListener('click', cancelHandler);
                closeButton.removeEventListener('click', closeHandler);
            };
            
            confirmButton.addEventListener('click', confirmHandler);
            cancelButton.addEventListener('click', cancelHandler);
            closeButton.addEventListener('click', closeHandler);
        };
        
        // 订单确认弹窗
        window.showOrderConfirmDialog = function(orderId, orderItems, totalPrice) {
            const dialog = document.getElementById('orderConfirmDialog');
            const orderIdDisplay = document.getElementById('orderIdDisplay');
            const orderTotalDisplay = document.getElementById('orderTotalDisplay');
            const orderItemsContainer = document.getElementById('orderItemsContainer');
            const viewOrderButton = document.getElementById('viewOrderButton');
            const continueShoppingButton = document.getElementById('continueShoppingButton');
            const closeButton = dialog.querySelector('.custom-dialog-close');
            
            // 设置订单ID和总价
            orderIdDisplay.textContent = `响应: ${orderId}`;
            orderTotalDisplay.textContent = `订单总价: ¥${totalPrice.toFixed(2)}`;
            
            // 清空并填充订单商品列表
            orderItemsContainer.innerHTML = '';
            orderItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'order-item';
                
                const itemTotal = parseFloat(item.goodsPrice) * parseInt(item.quantity);
                
                itemElement.innerHTML = `
                    <div class="order-item-name">${item.goodsName}</div>
                    <div class="order-item-price">¥${parseFloat(item.goodsPrice).toFixed(2)}</div>
                    <div class="order-item-quantity">x${item.quantity}</div>
                    <div class="order-item-total">¥${itemTotal.toFixed(2)}</div>
                `;
                
                orderItemsContainer.appendChild(itemElement);
            });
            
            // 显示弹窗
            dialog.classList.add('show');
            
            // 查看订单按钮事件
            const viewOrderHandler = () => {
                dialog.classList.remove('show');
                window.location.href = '/html/user/order.html'; // 跳转到订单页面
                cleanup();
            };
            
            // 继续购物按钮事件
            const continueHandler = () => {
                dialog.classList.remove('show');
                cleanup();
            };
            
            // 关闭按钮事件
            const closeHandler = () => {
                dialog.classList.remove('show');
                cleanup();
            };
            
            // 清理事件监听器
            const cleanup = () => {
                viewOrderButton.removeEventListener('click', viewOrderHandler);
                continueShoppingButton.removeEventListener('click', continueHandler);
                closeButton.removeEventListener('click', closeHandler);
            };
            
            viewOrderButton.addEventListener('click', viewOrderHandler);
            continueShoppingButton.addEventListener('click', continueHandler);
            closeButton.addEventListener('click', closeHandler);
        };
        
        // 替换原生alert和confirm
        window.alert = function(message) {
            showCustomAlert(message);
        };

        window.confirm = function(message) {
            return new Promise(resolve => {
                showCustomConfirm(message, '确认', result => {
                    resolve(result);
                });
            });
        };
    });
})();