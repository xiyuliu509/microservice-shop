

// 购物车数据
let cart = [];
let products = []; // 商品数据将从API获取

// 分页相关变量
let currentPage = 1;  // 当前页码
let totalPages = 1;  // 总页数
let pageSize = 12;  // 每页显示12个商品

// 筛选条件相关变量
let currentCategory = '';  // 当前选中的分类
let currentBrand = '';  // 当前选中的品牌
let currentMinPrice = '';  // 当前最低价格
let currentMaxPrice = '';  // 当前最高价格
let currentSearchTerm = '';  // 当前搜索关键词
let currentSortBy = '';  // 当前排序方式

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initPage();
});


// DOM 元素
const goodsContainer = document.getElementById('goodsContainer');
const cartCount = document.getElementById('cartCount');
const cartButton = document.getElementById('cartButton');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const cartTotal = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const productModal = document.getElementById('productModal');
const closeProduct = document.getElementById('closeProduct');
const merchantModal = document.getElementById('merchantModal');
const closeMerchant = document.getElementById('closeMerchant');

// 筛选元素
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const categorySelect = document.getElementById('categorySelect');
const brandSelect = document.getElementById('brandSelect');
const sortSelect = document.getElementById('sortSelect');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');
const priceFilterButton = document.getElementById('priceFilterButton');

// 商品类型和品牌映射
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
    'f': '西卡',
    'A': '马可波罗瓷砖',
    'B': '雪狼陶瓷',
    'C': '多乐士',
    'D': '立邦',
    'E': '奥斯曼',
    'F': '西卡'
};

// 初始化页面
function initPage() {
    // 检查用户登录状态
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        showCustomAlert('请先登录');
        window.location.href = '/html/user/login.html';
        return;
    }
    
    // 根据用户类型显示不同功能
    const adminContainer = document.getElementById('adminContainer');
    if (adminContainer) {
        // 严格检查用户类型，确保只有商家才能看到管理功能
        // 兼容字符串和数字类型的比较
        if (user.userType == 2 || user.userType === '2') {  // 如果是商家
            adminContainer.style.display = 'block';  // 显示商品管理功能
            console.log('显示商家管理功能');
        } else {
            adminContainer.style.display = 'none';  // 对于其他用户类型，隐藏管理功能
            console.log('隐藏商家管理功能，用户类型:', user.userType);
        }
    }
    
    // 加载商品数据
    loadGoods(1);
    setupEventListeners();
    setupCustomDialogs();
    
    // 添加文件名显示功能
    const goodsImageInput = document.getElementById('goodsImage');
    if (goodsImageInput) {
        goodsImageInput.addEventListener('change', function() {
            const fileName = this.files[0] ? this.files[0].name : '未选择文件';
            const fileNameElement = document.getElementById('file-name');
            if (fileNameElement) {
                fileNameElement.textContent = fileName;
            }
            
            // 验证文件类型
            if (this.files[0]) {
                const fileType = this.files[0].type;
                const modalError = document.getElementById('modalError');
                if (modalError) {
                    if (!fileType.match('image/jpeg') && !fileType.match('image/png') && !fileType.match('image/jpg')) {
                        modalError.textContent = '只支持 jpg, jpeg, png 格式的图片';
                        this.value = ''; // 清空文件选择
                        if (fileNameElement) {
                            fileNameElement.textContent = '未选择文件';
                        }
                    } else if (this.files[0].size > 5 * 1024 * 1024) { // 5MB
                        modalError.textContent = '文件太大，最大支持 5MB';
                        this.value = ''; // 清空文件选择
                        if (fileNameElement) {
                            fileNameElement.textContent = '未选择文件';
                        }
                    } else {
                        modalError.textContent = '';
                    }
                }
            }
        });
    }
}


// 设置自定义弹窗
function setupCustomDialogs() {
    // 通用确认弹窗
    window.showCustomConfirm = function(message, title = '确认', callback) {
        const dialog = document.getElementById('customDialog');
        const dialogTitle = dialog.querySelector('.custom-dialog-title');
        const dialogMessage = document.getElementById('customDialogMessage');
        const confirmButton = document.getElementById('customDialogConfirm');
        const cancelButton = document.getElementById('customDialogCancel');
        const closeButton = dialog.querySelector('.custom-dialog-close');
        
        dialogTitle.textContent = title;
        dialogMessage.textContent = message;
        dialog.classList.add('show');
        
        const confirmHandler = () => {
            dialog.classList.remove('show');
            if (callback) callback(true);
            cleanup();
        };
        
        const cancelHandler = () => {
            dialog.classList.remove('show');
            if (callback) callback(false);
            cleanup();
        };
        
        const closeHandler = () => {
            dialog.classList.remove('show');
            if (callback) callback(false);
            cleanup();
        };
        
        const cleanup = () => {
            confirmButton.removeEventListener('click', confirmHandler);
            cancelButton.removeEventListener('click', cancelHandler);
            closeButton.removeEventListener('click', closeHandler);
        };
        
        confirmButton.addEventListener('click', confirmHandler);
        cancelButton.addEventListener('click', cancelHandler);
        closeButton.addEventListener('click', closeHandler);
    };
    
    // 通用提示弹窗
    window.showCustomAlert = function(message, title = '提示') {
        const dialog = document.getElementById('customAlert');
        const dialogTitle = dialog.querySelector('.custom-dialog-title');
        const dialogMessage = document.getElementById('customAlertMessage');
        const confirmButton = document.getElementById('customAlertConfirm');
        const closeButton = dialog.querySelector('.custom-dialog-close');
        
        dialogTitle.textContent = title;
        dialogMessage.textContent = message;
        dialog.classList.add('show');
        
        const confirmHandler = () => {
            dialog.classList.remove('show');
            cleanup();
        };
        
        const closeHandler = () => {
            dialog.classList.remove('show');
            cleanup();
        };
        
        const cleanup = () => {
            confirmButton.removeEventListener('click', confirmHandler);
            closeButton.removeEventListener('click', closeHandler);
        };
        
        confirmButton.addEventListener('click', confirmHandler);
        closeButton.addEventListener('click', closeHandler);
    };
}

// 添加到购物车
function addToCart(goodsId, quantity) {
    if (!quantity || quantity < 1) {
        showCustomAlert('请输入有效的数量');
        return;
    }
    
    // 查找商品信息 - 使用正确的API路径
    axios.get(`http://localhost:8084/goods/findById?goodsId=${goodsId}`)
        .then(response => {
            const product = response.data;
            if (!product) {
                showCustomAlert('商品不存在');
                return;
            }
            
            // 检查库存
            if (product.stock < quantity) {
                showCustomAlert('库存不足');
                return;
            }
            
            // 添加到购物车
            const item = {
                goodsId: goodsId,
                goodsName: product.goodsName,
                goodsPrice: product.goodsPrice,
                goodsImage: product.goodsImage,
                goodsBrand: product.goodsBrand,
                goodsType: product.goodsType,
                quantity: parseInt(quantity),
                stock: product.stock
            };
            
            // 检查是否已存在相同商品
            const existingItemIndex = cart.findIndex(i => i.goodsId === goodsId);
            if (existingItemIndex !== -1) {
                cart[existingItemIndex].quantity += parseInt(quantity);
            } else {
                cart.push(item);
            }
            
            // 更新购物车计数
            updateCartCount();
            
            showCustomAlert(`已添加 ${quantity} 个 ${product.goodsName} 到购物车`);
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
            showCustomAlert('添加到购物车失败: ' + error.message);
        });
}

// 更新购物车计数
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

// 更新购物车显示
function updateCartDisplay() {
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItems.innerHTML = '';
        cartTotal.textContent = '¥0.00';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    cartItems.innerHTML = '';
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.goodsPrice * item.quantity;
        total += itemTotal;
        
        const brandName = brandTypes[item.goodsBrand] || '未知品牌';
        const typeName = goodsTypes[item.goodsType] || '未知类型';
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="http://localhost:8084/goods/images/${item.goodsImage}" alt="${item.goodsName}" onerror="this.src='/img/default.png'">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.goodsName}</div>
                <div class="cart-item-price">¥${item.goodsPrice.toFixed(2)}</div>
                <div class="cart-item-brand-type">${brandName} | ${typeName}</div>
                <div class="cart-item-quantity">
                    数量:
                    <div class="quantity-control">
                        <button class="quantity-button decrease" data-index="${index}">-</button>
                        <input type="number" value="${item.quantity}" min="1" max="${item.stock}" data-index="${index}">
                        <button class="quantity-button increase" data-index="${index}">+</button>
                    </div>
                </div>
            </div>
            <div class="cart-item-remove" data-index="${index}">&times;</div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `¥${total.toFixed(2)}`;
    
    // 添加购物车项事件监听器
    addCartItemEventListeners();
}

// 添加购物车项事件监听器
function addCartItemEventListeners() {
    // 增加数量按钮
    document.querySelectorAll('.quantity-button.increase').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            if (cart[index].quantity < cart[index].stock) {
                cart[index].quantity++;
                updateCartDisplay();
                updateCartCount();
            } else {
                showCustomAlert('已达到最大库存量');
            }
        });
    });
    
    // 减少数量按钮
    document.querySelectorAll('.quantity-button.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                updateCartDisplay();
                updateCartCount();
            } else {
                // 如果数量为1，询问是否移除
                showCustomConfirm('是否从购物车中移除此商品？', '确认移除', function(confirmed) {
                    if (confirmed) {
                        cart.splice(index, 1);
                        updateCartDisplay();
                        updateCartCount();
                    }
                });
            }
        });
    });
    
    // 数量输入框
    document.querySelectorAll('.cart-item-quantity input').forEach(input => {
        input.addEventListener('change', function() {
            const index = parseInt(this.dataset.index);
            const value = parseInt(this.value);
            
            if (isNaN(value) || value < 1) {
                this.value = 1;
                cart[index].quantity = 1;
            } else if (value > cart[index].stock) {
                this.value = cart[index].stock;
                cart[index].quantity = cart[index].stock;
                showCustomAlert('已达到最大库存量');
            } else {
                cart[index].quantity = value;
            }
            
            updateCartDisplay();
            updateCartCount();
        });
    });
    
    // 移除按钮
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            showCustomConfirm('是否从购物车中移除此商品？', '确认移除', function(confirmed) {
                if (confirmed) {
                    cart.splice(index, 1);
                    updateCartDisplay();
                    updateCartCount();
                }
            });
        });
    });
}

// 结算功能
function checkout() {
    if (cart.length === 0) {
        showCustomAlert('购物车是空的');
        return;
    }
    
    // 创建订单
    const orderGoodsList = cart.map(item => ({
        goodsId: item.goodsId,
        quantity: item.quantity
    }));
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        showCustomAlert('请先登录');
        window.location.href = '/html/user/login.html';
        return;
    }
    
    const order = {
        userId: user.userId,
        orderGoodsList: orderGoodsList,
        orderState: '待付款'
    };
    
    // 发送创建订单请求
    axios.post('http://localhost:8083/order/create', order)
        .then(response => {
            const orderId = response.data;
            if (orderId) {
                // 显示订单确认弹窗
                showOrderConfirmation(orderId, order);
                // 清空购物车
                cart = [];
                updateCartCount();
                updateCartDisplay();
                // 关闭购物车弹窗
                cartModal.style.display = 'none';
            } else {
                showCustomAlert('创建订单失败');
            }
        })
        .catch(error => {
            console.error('Error creating order:', error);
            showCustomAlert('创建订单失败: ' + error.message);
        });
}

// 显示订单确认
function showOrderConfirmation(orderId, order) {
    const dialog = document.getElementById('orderConfirmDialog');
    if (!dialog) {
        showCustomAlert('订单创建成功，订单号: ' + orderId);
        return;
    }
    
    const orderIdDisplay = document.getElementById('orderIdDisplay');
    const orderTotalDisplay = document.getElementById('orderTotalDisplay');
    const orderItemsContainer = document.getElementById('orderItemsContainer');
    const viewOrderButton = document.getElementById('viewOrderButton');
    const continueShoppingButton = document.getElementById('continueShoppingButton');
    const closeButton = dialog.querySelector('.custom-dialog-close');
    
    // 设置订单信息
    orderIdDisplay.textContent = '订单号: ' + orderId;
    
    // 计算订单总金额
    const total = cart.reduce((sum, item) => sum + (item.goodsPrice * item.quantity), 0);
    orderTotalDisplay.textContent = '总金额: ¥' + total.toFixed(2);
    
    // 设置订单商品
    orderItemsContainer.innerHTML = '';
    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-name">${item.goodsName}</div>
            <div class="order-item-price">¥${item.goodsPrice.toFixed(2)}</div>
            <div class="order-item-quantity">x${item.quantity}</div>
            <div class="order-item-total">¥${(item.goodsPrice * item.quantity).toFixed(2)}</div>
        `;
        orderItemsContainer.appendChild(orderItem);
    });
    
    // 显示弹窗
    dialog.classList.add('show');
    
    // 查看订单按钮
    const viewOrderHandler = () => {
        dialog.classList.remove('show');
        window.location.href = '/html/order/order.html';
        cleanup();
    };
    
    // 继续购物按钮
    const continueShoppingHandler = () => {
        dialog.classList.remove('show');
        cleanup();
    };
    
    // 关闭按钮
    const closeHandler = () => {
        dialog.classList.remove('show');
        cleanup();
    };
    
    // 清理事件监听器
    const cleanup = () => {
        viewOrderButton.removeEventListener('click', viewOrderHandler);
        continueShoppingButton.removeEventListener('click', continueShoppingHandler);
        closeButton.removeEventListener('click', closeHandler);
    };
    
    viewOrderButton.addEventListener('click', viewOrderHandler);
    continueShoppingButton.addEventListener('click', continueShoppingHandler);
    closeButton.addEventListener('click', closeHandler);
}

// 显示商品详情
function showProductDetails(productId) {
    console.log('查看商品详情，商品ID:', productId);
    axios.get(`http://localhost:8084/goods/findById?goodsId=${productId}`)
        .then(response => {
            const product = response.data;
            if (!product) {
                showCustomAlert('商品不存在');
                return;
            }
            
            // 设置商品详情
            document.getElementById('productModalTitle').textContent = '商品详情';
            document.getElementById('productModalName').textContent = product.goodsName;
            document.getElementById('productModalPrice').textContent = '¥' + product.goodsPrice.toFixed(2);
            document.getElementById('productModalStock').textContent = '库存: ' + product.stock + '件';
            
            const brandName = brandTypes[product.goodsBrand] || '未知品牌';
            const typeName = goodsTypes[product.goodsType] || '未知类型';
            
            document.getElementById('productModalBrand').textContent = brandName;
            document.getElementById('productModalType').textContent = typeName;
            document.getElementById('productModalTime').textContent = product.timeStamp || '未知';
            
            // 设置商品图片
            const imageUrl = product.goodsImage ? 
                `http://localhost:8084/goods/images/${product.goodsImage}` : 
                '/img/default.png';
            
            document.getElementById('productModalImage').innerHTML = `
                <img src="${imageUrl}" alt="${product.goodsName}" onerror="this.src='/img/default.png'">
            `;
            
            // 设置商品描述（如果有）
            document.getElementById('productModalDescription').textContent = product.goodsDescription || '暂无描述';
            
            // 设置数量控制
            const quantityInput = document.getElementById('productQuantity');
            quantityInput.value = 1;
            quantityInput.max = product.stock;
            
            // 设置加入购物车按钮
            const addToCartButton = document.getElementById('addToCartButton');
            addToCartButton.dataset.id = product.goodsId;
            
            // 显示弹窗
            productModal.style.display = 'flex';
            
            // 添加数量控制事件
            setupQuantityControl(product.stock);
        })
        .catch(error => {
            console.error('Error loading product details:', error);
            showCustomAlert('加载商品详情失败: ' + error.message);
        });
}

// 设置数量控制
function setupQuantityControl(maxStock) {
    const quantityInput = document.getElementById('productQuantity');
    const decreaseButton = document.getElementById('decreaseQuantity');
    const increaseButton = document.getElementById('increaseQuantity');
    const addToCartButton = document.getElementById('addToCartButton');
    
    // 清除旧的事件监听器，防止重复绑定
    const newDecreaseButton = decreaseButton.cloneNode(true);
    const newIncreaseButton = increaseButton.cloneNode(true);
    const newAddToCartButton = addToCartButton.cloneNode(true);
    
    decreaseButton.parentNode.replaceChild(newDecreaseButton, decreaseButton);
    increaseButton.parentNode.replaceChild(newIncreaseButton, increaseButton);
    addToCartButton.parentNode.replaceChild(newAddToCartButton, addToCartButton);
    
    // 减少数量
    newDecreaseButton.addEventListener('click', function() {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });
    
    // 增加数量
    newIncreaseButton.addEventListener('click', function() {
        let value = parseInt(quantityInput.value);
        if (value < maxStock) {
            quantityInput.value = value + 1;
        } else {
            showCustomAlert('已达到最大库存量');
        }
    });
    
    // 加入购物车按钮
    newAddToCartButton.addEventListener('click', function() {
        const productId = parseInt(this.dataset.id);
        const quantity = parseInt(quantityInput.value);
        console.log('商品详情页面添加到购物车，商品ID:', productId, '数量:', quantity);
        addToCart(productId, quantity);
        productModal.style.display = 'none'; // 添加成功后关闭弹窗
    });
    
    // 数量输入框
    quantityInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.value = 1;
        } else if (value > maxStock) {
            this.value = maxStock;
            showCustomAlert('已达到最大库存量');
        }
    });
    
    // 注意：不需要再次为addToCartButton添加事件监听器，因为它已经被newAddToCartButton替换了
}

// 更新库存
function updateStock(goodsId, change) {
    // 确保goodsId是数字类型
    goodsId = parseInt(goodsId);
    
    console.log('更新库存，商品ID:', goodsId, '变化量:', change);
    
    const stockElement = document.getElementById(`stock-${goodsId}`);
    if (!stockElement) {
        console.error('找不到库存元素，ID:', `stock-${goodsId}`);
        showCustomAlert('找不到商品信息');
        return;
    }
    
    const currentStock = parseInt(stockElement.textContent);
    const newStock = currentStock + change;
    
    if (newStock < 0) {
        showCustomAlert('库存不能小于0');
        return;
    }
    
    console.log(`更新商品ID: ${goodsId} 的库存，从 ${currentStock} 到 ${newStock}`);
    
    // 发送更新库存请求
    axios.post(`http://localhost:8084/goods/updateStock`, {
        goodsId: goodsId,
        quantity: newStock
    })
    .then(response => {
        // 检查响应是否成功
        if (response.data || response.status === 200) {
            stockElement.textContent = newStock;
            showCustomAlert('库存更新成功');
        } else {
            showCustomAlert('库存更新失败: ' + (response.data ? response.data.message : '未知错误'));
        }
    })
    .catch(error => {
        console.error('Error updating stock:', error);
        showCustomAlert('库存更新失败: ' + error.message);
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
                        loadGoods(currentPage, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm, currentSortBy);
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

// 加载商品数据
function loadGoods(page = 1, category = '', brand = '', minPrice = '', maxPrice = '', searchTerm = '', sortBy = '') {
    // 保存当前筛选条件
    currentPage = page;
    currentCategory = category;
    currentBrand = brand;
    currentMinPrice = minPrice;
    currentMaxPrice = maxPrice;
    currentSearchTerm = searchTerm;
    currentSortBy = sortBy;
    
    // 默认获取所有商品
    let url = `http://localhost:8084/goods/list`;

    // 根据筛选条件构建URL
    if (category && brand && (minPrice || maxPrice)) {
        // 同时按类型、品牌和价格筛选
        url = `http://localhost:8084/goods/filterByTypeBrandPrice?goodsType=${category}&goodsBrand=${brand}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
    } else if (category && brand) {
        // 同时按类型和品牌筛选
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

    // 发起API请求获取商品数据
    axios.get(url)
        .then(response => {
            goodsContainer.innerHTML = ''; // 清空容器
            const goodsList = response.data || [];
            
            // 保存商品数据到全局变量，以便其他函数使用
            products = goodsList;
            console.log('获取到的商品数据:', goodsList);
            
            if (goodsList.length === 0) {
                goodsContainer.innerHTML = '<div class="no-results">没有找到符合条件的商品</div>';
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
                    goodsContainer.innerHTML = '<div class="no-results">没有符合价格条件的商品</div>';
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
                    goodsContainer.innerHTML = '<div class="no-results">没有找到名称包含 "' + searchTerm + '" 的商品</div>';
                    return;
                }
            }

            // 排序
            if (sortBy) {
                if (sortBy === 'price-asc') {
                    filteredGoods.sort((a, b) => a.goodsPrice - b.goodsPrice);
                } else if (sortBy === 'price-desc') {
                    filteredGoods.sort((a, b) => b.goodsPrice - a.goodsPrice);
                } else if (sortBy === 'sales') {
                    // 暂时随机排序模拟销量排序
                    filteredGoods.sort(() => Math.random() - 0.5);
                } else if (sortBy === 'new') {
                    // 这里假设id越大表示越新
                    filteredGoods.sort((a, b) => b.goodsId - a.goodsId);
                }
            } else {
                // 默认按商品ID排序（未筛选状态）
                filteredGoods.sort((a, b) => a.goodsId - b.goodsId);
            }

            // 计算总页数
            totalPages = Math.ceil(filteredGoods.length / pageSize);
            console.log('总商品数:', filteredGoods.length, '总页数:', totalPages, '每页商品数:', pageSize);
            
            // 计算当前页应显示的商品
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, filteredGoods.length);
            const currentPageGoods = filteredGoods.slice(startIndex, endIndex);
            console.log('当前页:', currentPage, '显示商品索引范围:', startIndex, '-', endIndex - 1, '显示商品数:', currentPageGoods.length);

            // 渲染商品列表
            renderProducts(currentPageGoods);
            
            // 渲染分页按钮
            renderPagination();
            
            // 更新页面计数器
            updatePageCounter();
        })
        .catch(error => {
            console.error('Error loading goods:', error);
            goodsContainer.innerHTML = '<div class="error-message">加载商品失败: ' + error.message + '</div>';
            console.log('请求失败的URL:', url);
            console.log('错误详情:', error.response ? error.response.data : '无响应数据');
        });
    }



// 渲染商品列表
function renderProducts(productsToRender) {
    goodsContainer.innerHTML = '';
    
    if (productsToRender.length === 0) {
        goodsContainer.innerHTML = '<div class="no-products">没有找到符合条件的商品</div>';
        return;
    }
    
    // 获取当前用户类型
    const user = JSON.parse(localStorage.getItem('user'));
    const userType = user ? user.userType : null;
    
    // 渲染商品卡片
    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.goodsId;
        
        // 如果是搜索结果且匹配搜索词，添加高亮类
        if (currentSearchTerm && product.goodsName.toLowerCase().includes(currentSearchTerm.toLowerCase())) {
            productCard.classList.add('highlight');
        }
        
        // 构建图片URL
        const imageUrl = product.goodsImage ? 
            `http://localhost:8084/goods/images/${product.goodsImage}` : 
            '/img/default.png';
        
        // 获取商品类型和品牌名称（仅用于详情页）
        const brandName = brandTypes[product.goodsBrand] || '未知品牌(' + product.goodsBrand + ')';
        const typeName = goodsTypes[product.goodsType] || '未知类型(' + product.goodsType + ')';
        
        // 添加促销标签
        const hasPromotion = product.goodsPrice < 100; // 假设价格低于100的商品有促销
        const promotionTag = hasPromotion ? '<div class="promotion-tag"></div>' : '';
        
        // 根据用户类型显示不同的操作按钮
        let actionsHtml = '';
        if (userType == 2 || userType === '2') { // 商家用户
            actionsHtml = `
                <div class="product-actions merchant-actions">
                    <div class="stock-buttons-row">
                        <button class="stock-button" data-id="${product.goodsId}" data-action="increase">增加库存</button>
                        <button class="stock-button" data-id="${product.goodsId}" data-action="decrease">减少库存</button>
                    </div>
                    <div class="cart-buttons-row">
                        <button class="add-to-cart-btn" data-id="${product.goodsId}">加入购物车</button>
                        <button class="view-details-btn" data-id="${product.goodsId}">查看详情</button>
                    </div>
                </div>
            `;
        } else { // 普通用户
            actionsHtml = `
                <div class="product-actions">
                    <button class="add-to-cart-btn" data-id="${product.goodsId}">加入购物车</button>
                    <button class="view-details-btn" data-id="${product.goodsId}">查看详情</button>
                </div>
            `;
        }
        
        // 商品卡片HTML
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${product.goodsName}" onerror="this.src='/img/default.png'">
                ${promotionTag}
            </div>
            <div class="product-info">
                <div class="product-name">${product.goodsName}</div>
                <div class="product-price">¥${product.goodsPrice.toFixed(2)}</div>
                <div class="product-stock">库存: <span id="stock-${product.goodsId}">${product.stock}</span>件</div>
                ${actionsHtml}
            </div>
        `;
        
        // 确保商品ID被正确设置为数据属性
        productCard.dataset.id = product.goodsId;
        
        goodsContainer.appendChild(productCard);
    });
    
    // 直接为每个按钮添加事件监听器，确保事件绑定正确
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            const productId = parseInt(this.dataset.id);
            console.log('直接点击添加到购物车按钮，商品ID:', productId);
            addToCart(productId, 1);
        });
    });
    
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            const productId = parseInt(this.dataset.id);
            console.log('直接点击查看详情按钮，商品ID:', productId);
            showProductDetails(productId);
        });
    });
    
    document.querySelectorAll('.stock-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            const productId = parseInt(this.dataset.id);
            const action = this.dataset.action;
            console.log('直接点击库存按钮，商品ID:', productId, '操作:', action);
            
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && (user.userType == 2 || user.userType === '2')) {
                if (action === 'increase') {
                    updateStock(productId, 1);
                } else if (action === 'decrease') {
                    updateStock(productId, -1);
                }
            } else {
                showCustomAlert('只有商家才能调整库存');
            }
        });
    });
}

// 渲染分页按钮
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) {
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    // 添加"首页"按钮
    const firstPageButton = document.createElement('button');
    firstPageButton.textContent = '首页';
    firstPageButton.className = 'pagination-button';
    firstPageButton.disabled = currentPage === 1;
    firstPageButton.addEventListener('click', () => goToPage(1));
    fragment.appendChild(firstPageButton);
    
    // 添加"上一页"按钮
    const prevButton = document.createElement('button');
    prevButton.textContent = '上一页';
    prevButton.className = 'pagination-button';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => goToPage(currentPage - 1));
    fragment.appendChild(prevButton);
    
    // 添加页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'pagination-button';
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => goToPage(i));
        fragment.appendChild(button);
    }
    
    // 添加"下一页"按钮
    const nextButton = document.createElement('button');
    nextButton.textContent = '下一页';
    nextButton.className = 'pagination-button';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => goToPage(currentPage + 1));
    fragment.appendChild(nextButton);
    
    // 添加"末页"按钮
    const lastPageButton = document.createElement('button');
    lastPageButton.textContent = '末页';
    lastPageButton.className = 'pagination-button';
    lastPageButton.disabled = currentPage === totalPages;
    lastPageButton.addEventListener('click', () => goToPage(totalPages));
    fragment.appendChild(lastPageButton);
    
    paginationContainer.appendChild(fragment);
}

// 筛选商品
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value;
    const category = document.getElementById('categorySelect').value;
    const brand = document.getElementById('brandSelect').value;
    const sortBy = document.getElementById('sortSelect').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    
    loadGoods(1, category, brand, minPrice, maxPrice, searchTerm, sortBy);
}

// 跳转到指定页
function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }
    
    // 保留所有筛选条件，跳转到指定页
    loadGoods(page, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm, currentSortBy);
    
    // 滚动到页面顶部，提升用户体验
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 更新页面计数器
function updatePageCounter() {
    // 检查是否存在页面计数器元素
    let pageCounter = document.getElementById('pageCounter');
    if (!pageCounter) {
        // 如果不存在，则创建一个
        pageCounter = document.createElement('div');
        pageCounter.id = 'pageCounter';
        pageCounter.className = 'page-counter';
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) {
            paginationContainer.parentNode.insertBefore(pageCounter, paginationContainer.nextSibling);
        }
    }
    
    // 更新页面计数器内容
    pageCounter.innerHTML = `第 <span id="currentPageNum">${currentPage}</span> 页，共 <span id="totalPagesNum">${totalPages}</span> 页`;
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索表单提交
    document.querySelector('.search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        filterProducts();
    });
    
    // 筛选变化
    categorySelect.addEventListener('change', filterProducts);
    brandSelect.addEventListener('change', filterProducts);
    sortSelect.addEventListener('change', filterProducts);
    
    // 商品卡片点击事件委托
    goodsContainer.addEventListener('click', function(e) {
        // 确保事件委托正确捕获按钮点击，即使点击的是按钮内的元素
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        const viewDetailsBtn = e.target.closest('.view-details-btn');
        const stockButton = e.target.closest('.stock-button');
        
        if (addToCartBtn) {
            const productId = parseInt(addToCartBtn.dataset.id);
            console.log('添加到购物车，商品ID:', productId);
            addToCart(productId, 1);
        } else if (viewDetailsBtn) {
            const productId = parseInt(viewDetailsBtn.dataset.id);
            console.log('查看商品详情，商品ID:', productId);
            showProductDetails(productId);
        } else if (stockButton) {
            // 从按钮本身获取商品ID
            const productId = parseInt(stockButton.dataset.id);
            const action = stockButton.dataset.action;
            console.log('库存调整，商品ID:', productId, '操作:', action);
            
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && (user.userType == 2 || user.userType === '2')) {
                if (action === 'increase') {
                    updateStock(productId, 1);
                } else if (action === 'decrease') {
                    updateStock(productId, -1);
                }
            } else {
                showCustomAlert('只有商家才能调整库存');
            }
        }
    });
    
    // 购物车按钮
    cartButton.addEventListener('click', function() {
        cartModal.style.display = 'flex';
        updateCartDisplay();
    });
    
    // 关闭购物车
    closeCart.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });
    
    // 关闭商品详情
    closeProduct.addEventListener('click', function() {
        productModal.style.display = 'none';
    });
    
    // 关闭商家功能
    closeMerchant.addEventListener('click', function() {
        merchantModal.style.display = 'none';
    });
    
    // 结算按钮
    checkoutButton.addEventListener('click', checkout);
    
    // 上架商品按钮
    const createButton = document.getElementById('createButton');
    if (createButton) {
        createButton.addEventListener('click', function() {
            const myModal = document.getElementById('myModal');
            if (myModal) {
                myModal.style.display = 'flex';
            } else {
                showCustomAlert('上架商品功能将在后续版本中实现');
            }
        });
    }
    
    // 下架商品按钮
    const deleteButton = document.getElementById('deleteButton');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            const dialog = document.getElementById('deleteGoodsDialog');
            if (dialog) {
                dialog.classList.add('show');
                
                const closeButton = dialog.querySelector('.custom-dialog-close');
                const confirmButton = document.getElementById('confirmDeleteButton');
                const cancelButton = document.getElementById('cancelDeleteButton');
                const errorMessage = document.getElementById('deleteModalError');
                const goodsIdInput = document.getElementById('deleteGoodsId');
                
                // 清空表单
                goodsIdInput.value = '';
                if (errorMessage) {
                    errorMessage.textContent = '';
                    errorMessage.style.display = 'none';
                }
                
                // 确认按钮事件
                const confirmHandler = () => {
                    const goodsId = goodsIdInput.value.trim();
                    
                    if (!goodsId) {
                        if (errorMessage) {
                            errorMessage.textContent = '请输入商品名称';
                            errorMessage.style.display = 'block';
                        }
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
            } else {
                console.error('找不到下架商品弹窗元素');
                const goodsId = prompt('请输入要下架的商品名称:');
                if (goodsId) {
                    deleteGoods(goodsId);
                }
            }
        });
    }
    
    // 上架商品确认按钮
    const confirmButton = document.getElementById('confirmButton');
    if (confirmButton) {
        confirmButton.addEventListener('click', function() {
            const goodsName = document.getElementById('goodsName').value.trim();
            const goodsPrice = document.getElementById('goodsPrice').value.trim();
            const goodsStock = document.getElementById('goodsStock').value.trim();
            const goodsType = document.getElementById('goodsType').value;
            const goodsBrand = document.getElementById('goodsBrand').value;
            const goodsImage = document.getElementById('goodsImage').files[0];
            const modalError = document.getElementById('modalError');
            
            // 验证表单
            if (!goodsName) {
                modalError.textContent = '请输入商品名称';
                modalError.style.display = 'block';
                return;
            }
            if (!goodsPrice || parseFloat(goodsPrice) <= 0) {
                modalError.textContent = '请输入有效的商品价格';
                modalError.style.display = 'block';
                return;
            }
            if (!goodsStock || parseInt(goodsStock) < 0) {
                modalError.textContent = '请输入有效的商品库存';
                modalError.style.display = 'block';
                return;
            }
            if (!goodsType) {
                modalError.textContent = '请选择商品类型';
                modalError.style.display = 'block';
                return;
            }
            if (!goodsBrand) {
                modalError.textContent = '请选择商品品牌';
                modalError.style.display = 'block';
                return;
            }
            if (!goodsImage) {
                modalError.textContent = '请选择商品图片';
                modalError.style.display = 'block';
                return;
            }
            
            // 创建FormData对象
            const formData = new FormData();
            formData.append('goodsName', goodsName);
            formData.append('goodsPrice', goodsPrice);
            formData.append('goodsStock', goodsStock);
            formData.append('goodsType', goodsType);
            formData.append('goodsBrand', goodsBrand);
            formData.append('file', goodsImage);
            
            // 发送请求
            axios.post('http://localhost:8084/goods/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                const data = response.data;
                if (data === '商品创建成功，并已上传图片') {
                    showCustomAlert('商品上架成功');
                    document.getElementById('myModal').style.display = 'none';
                    // 重新加载商品列表
                    loadGoods(currentPage, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm, currentSortBy);
                } else {
                    modalError.textContent = '上架失败: ' + data;
                    modalError.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error adding goods:', error);
                modalError.textContent = '上架失败: ' + error.message;
                modalError.style.display = 'block';
            });
        });
    }
    
    // 关闭上架商品弹窗
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            const myModal = document.getElementById('myModal');
            if (myModal) {
                myModal.style.display = 'none';
            }
        });
    }
    
    // 商家功能按钮
    const manageInventoryButton = document.getElementById('manageInventoryButton');
    if (manageInventoryButton) {
        manageInventoryButton.addEventListener('click', function() {
            showCustomAlert('库存管理功能将在后续版本中实现');
        });
    }
    
    const viewOrdersButton = document.getElementById('viewOrdersButton');
    if (viewOrdersButton) {
        viewOrdersButton.addEventListener('click', function() {
            showCustomAlert('查看订单功能将在后续版本中实现');
        });
    }
    
    
}
    
    // 显示商品详情
function showProductDetails(productId) {
    // 从商品列表中找到对应商品
    const product = products.find(p => p.goodsId === productId);
    if (!product) {
        showCustomAlert('商品信息不存在');
        return;
    }

    // 更新商品详情弹窗内容
    document.getElementById('productModalTitle').textContent = '商品详情';
    document.getElementById('productModalTitle').dataset.productId = productId;
    document.getElementById('productModalName').textContent = product.goodsName;
    document.getElementById('productModalPrice').textContent = `¥${product.goodsPrice.toFixed(2)}`;
    document.getElementById('productModalStock').textContent = `库存: ${product.stock}件`;
    document.getElementById('productModalBrand').textContent = brandTypes[product.goodsBrand] || '未知品牌';
    document.getElementById('productModalType').textContent = goodsTypes[product.goodsType] || '未知类型';
    
    // 设置上架时间（如果有）
    const createTime = product.createTime ? new Date(product.createTime).toLocaleString() : '暂无记录';
    document.getElementById('productModalTime').textContent = createTime;
    
    // 设置商品图片
    const imageUrl = product.goodsImage ? 
        `http://localhost:8084/goods/images/${product.goodsImage}` : 
        '/img/default.png';
    document.getElementById('productModalImage').innerHTML = `
        <img src="${imageUrl}" alt="${product.goodsName}" onerror="this.src='/img/default.png'">
    `;

    // 重置数量输入框
    document.getElementById('productQuantity').value = 1;
    document.getElementById('productQuantity').max = product.stock;

    // 显示弹窗
    productModal.style.display = 'flex';
}

// 更新商品库存
function updateStock(productId, change) {
    console.log('更新库存，商品ID:', productId, '变化量:', change);
    
    // 确保productId是数字类型
    productId = parseInt(productId);
    
    // 首先尝试通过ID直接获取库存元素
    let stockElement = document.getElementById(`stock-${productId}`);
    
    // 如果找不到，尝试通过data-id属性查找
    if (!stockElement) {
        const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
        if (productCard) {
            stockElement = productCard.querySelector('.product-stock span');
        }
    }
    
    // 如果仍然找不到，尝试在商品详情弹窗中查找
    if (!stockElement && productModal.style.display === 'flex') {
        stockElement = document.getElementById('productModalStock');
    }
    
    if (!stockElement) {
        console.error('找不到库存元素，商品ID:', productId);
        showCustomAlert('无法更新库存：找不到商品信息');
        return;
    }
    
    // 获取当前库存
    let currentStock;
    if (stockElement.id === 'productModalStock') {
        // 从详情弹窗中提取数字
        const match = stockElement.textContent.match(/\d+/);
        if (match) {
            currentStock = parseInt(match[0]);
        } else {
            console.error('无法从详情弹窗中提取库存数量');
            showCustomAlert('无法更新库存：库存格式错误');
            return;
        }
    } else {
        // 直接获取库存元素的文本内容
        currentStock = parseInt(stockElement.textContent);
    }
    
    if (isNaN(currentStock)) {
        console.error('库存不是有效数字:', stockElement.textContent);
        showCustomAlert('无法更新库存：库存格式错误');
        return;
    }
    
    const newStock = currentStock + change;
    
    if (newStock < 0) {
        showCustomAlert('库存不能小于0');
        return;
    }
    
    // 发送更新请求
    axios.post('http://localhost:8084/goods/updateStock', {
        goodsId: productId,
        quantity: newStock
    })
    .then(response => {
        console.log('库存更新响应:', response.data);
        // 检查响应是否成功
        if (response.data === '库存更新成功' || response.status === 200) {
            // 更新DOM中的库存显示
            if (stockElement.id === 'productModalStock') {
                stockElement.textContent = `库存: ${newStock}件`;
            } else {
                stockElement.textContent = newStock;
            }
            
            showCustomAlert('库存更新成功');
            
            // 更新商品列表中的数据
            const productIndex = products.findIndex(p => p.goodsId === productId);
            if (productIndex !== -1) {
                products[productIndex].stock = newStock;
            }
        } else {
            showCustomAlert('库存更新失败: ' + (response.data || '未知错误'));
        }
    })
    .catch(error => {
        console.error('Error updating stock:', error);
        showCustomAlert('库存更新失败: ' + error.message);
    });
}


// 商品详情中的数量控制
document.getElementById('decreaseQuantity').addEventListener('click', function() {
    const quantityInput = document.getElementById('productQuantity');
    let quantity = parseInt(quantityInput.value);
    if (quantity > 1) {
        quantityInput.value = quantity - 1;
    }
});

document.getElementById('increaseQuantity').addEventListener('click', function() {
    const quantityInput = document.getElementById('productQuantity');
    let quantity = parseInt(quantityInput.value);
    const maxStock = parseInt(quantityInput.max);
    if (quantity < maxStock) {
        quantityInput.value = quantity + 1;
    } else {
        showCustomAlert('已达到最大库存数量');
    }
});

// 商品详情中的加入购物车按钮
document.getElementById('addToCartButton').addEventListener('click', function() {
    const productId = parseInt(document.getElementById('productModalTitle').dataset.productId);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    addToCart(productId, quantity);
    productModal.style.display = 'none';
});
    
    // 上架商品表单提交
    const addGoodsForm = document.getElementById('addGoodsForm');
    if (addGoodsForm) {
        addGoodsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitNewGoods();
        });
    }
    
    // 关闭上架商品弹窗
    const closeAddGoodsModal = document.getElementById('closeAddGoodsModal');
    if (closeAddGoodsModal) {
        closeAddGoodsModal.addEventListener('click', function() {
            const myModal = document.getElementById('myModal');
            if (myModal) {
                myModal.style.display = 'none';
            }
        });
    }
    
    // 点击空白区域关闭模态框
    window.addEventListener('click', function(e) {
        const myModal = document.getElementById('myModal');
        if (e.target === myModal) {
            myModal.style.display = 'none';
        }
    });
    
    // 点击空白区域关闭模态框
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
        if (e.target === merchantModal) {
            merchantModal.style.display = 'none';
        }
    });


// 筛选商品
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    const brand = brandSelect.value;
    const sortBy = sortSelect.value;
    let minPrice = minPriceInput ? minPriceInput.value : '';
    let maxPrice = maxPriceInput ? maxPriceInput.value : '';
    
    // 如果选择了价格排序，弹出价格输入框要求输入价格范围
    if (sortBy === 'price-asc' || sortBy === 'price-desc') {
        // 创建价格输入弹窗的HTML
        const priceDialogHTML = `
            <div style="margin-bottom: 15px;">
                <label for="dialogMinPrice">最低价格:</label>
                <input type="number" id="dialogMinPrice" value="${minPrice}" min="0" step="0.01" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 4px; border: 1px solid #ccc;">
            </div>
            <div style="margin-bottom: 15px;">
                <label for="dialogMaxPrice">最高价格:</label>
                <input type="number" id="dialogMaxPrice" value="${maxPrice}" min="0" step="0.01" style="width: 100%; padding: 8px; margin-top: 5px; border-radius: 4px; border: 1px solid #ccc;">
            </div>
        `;
        
        // 使用自定义弹窗询问价格范围
        const dialog = document.getElementById('customDialog');
        const dialogTitle = dialog.querySelector('.custom-dialog-title');
        const dialogMessage = document.getElementById('customDialogMessage');
        const confirmButton = document.getElementById('customDialogConfirm');
        const cancelButton = document.getElementById('customDialogCancel');
        const closeButton = dialog.querySelector('.custom-dialog-close');
        
        dialogTitle.textContent = '价格筛选';
        dialogMessage.innerHTML = priceDialogHTML;
        dialog.classList.add('show');
        
        // 获取弹窗中的价格输入框
        const dialogMinPrice = document.getElementById('dialogMinPrice');
        const dialogMaxPrice = document.getElementById('dialogMaxPrice');
        
        // 确认按钮事件
        const confirmHandler = () => {
            dialog.classList.remove('show');
            // 获取用户输入的价格范围
            minPrice = dialogMinPrice.value;
            maxPrice = dialogMaxPrice.value;
            
            // 更新价格输入框的值（如果存在）
            if (minPriceInput) minPriceInput.value = minPrice;
            if (maxPriceInput) maxPriceInput.value = maxPrice;
            
            // 使用loadGoods函数加载筛选后的商品
            loadGoods(1, category, brand, minPrice, maxPrice, searchTerm, sortBy);
            cleanup();
        };
        
        // 取消按钮事件
        const cancelHandler = () => {
            dialog.classList.remove('show');
            // 用户取消，重置排序选择
            sortSelect.value = '';
            cleanup();
        };
        
        // 关闭按钮事件
        const closeHandler = () => {
            dialog.classList.remove('show');
            // 用户关闭，重置排序选择
            sortSelect.value = '';
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
        
        return;
    }
    
    // 使用loadGoods函数加载筛选后的商品
    loadGoods(1, category, brand, minPrice, maxPrice, searchTerm, sortBy);
}

// 渲染分页按钮
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const fragment = document.createDocumentFragment();
    
    // 添加"首页"按钮
    const firstPageButton = document.createElement('button');
    firstPageButton.textContent = '首页';
    firstPageButton.className = 'pagination-button';
    firstPageButton.disabled = currentPage === 1;
    firstPageButton.addEventListener('click', () => {
        loadGoods(1, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm, currentSortBy);
    });
    fragment.appendChild(firstPageButton);
    
    // 添加"上一页"按钮
    const prevButton = document.createElement('button');
    prevButton.textContent = '上一页';
    prevButton.className = 'pagination-button';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            loadGoods(currentPage - 1, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm, currentSortBy);
        }
    });
    fragment.appendChild(prevButton);
    
    // 添加页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'pagination-button' + (i === currentPage ? ' active' : '');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            loadGoods(i, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm, currentSortBy);
        });
        fragment.appendChild(pageButton);
    }
    
    // 添加"下一页"按钮
    const nextButton = document.createElement('button');
    nextButton.textContent = '下一页';
    nextButton.className = 'pagination-button';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadGoods(currentPage + 1, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm, currentSortBy);
        }
    });
    fragment.appendChild(nextButton);
    
    // 添加"末页"按钮
    const lastPageButton = document.createElement('button');
    lastPageButton.textContent = '末页';
    lastPageButton.className = 'pagination-button';
    lastPageButton.disabled = currentPage === totalPages;
    lastPageButton.addEventListener('click', () => {
        loadGoods(totalPages, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm, currentSortBy);
    });
    fragment.appendChild(lastPageButton);
    
    paginationContainer.appendChild(fragment);
}

// 显示商品详情
function showProductDetails(productId) {
    console.log('查看商品详情，商品ID:', productId);
    
    // 直接从API获取最新的商品详情
    axios.get(`http://localhost:8084/goods/findById?goodsId=${productId}`)
        .then(response => {
            const product = response.data;
            if (!product) {
                showCustomAlert('商品不存在');
                return;
            }
            
            // 获取商品类型和品牌名称
            const brandName = brandTypes[product.goodsBrand] || '未知品牌(' + product.goodsBrand + ')';
            const typeName = goodsTypes[product.goodsType] || '未知类型(' + product.goodsType + ')';
            
            document.getElementById('productModalTitle').textContent = '商品详情';
            document.getElementById('productModalName').textContent = product.goodsName;
            document.getElementById('productModalPrice').textContent = `¥${product.goodsPrice.toFixed(2)}`;
            document.getElementById('productModalStock').textContent = `库存: ${product.stock}件`;
            document.getElementById('productQuantity').value = 1;
            
            // 设置品牌和类型信息
            document.getElementById('productModalBrand').textContent = brandName;
            document.getElementById('productModalType').textContent = typeName;
            document.getElementById('productModalTime').textContent = product.timeStamp || '未知';
            
            // 构建图片URL
            const imageUrl = product.goodsImage ? 
                `http://localhost:8084/goods/images/${product.goodsImage}` : 
                '/img/default.png';
            
            const imageContainer = document.getElementById('productModalImage');
            imageContainer.innerHTML = `<img src="${imageUrl}" alt="${product.goodsName}" onerror="this.src='/img/default.png'">`;
            
            // 设置加入购物车按钮的商品ID
            const addToCartButton = document.getElementById('addToCartButton');
            addToCartButton.dataset.id = product.goodsId;
            
            // 显示弹窗
            productModal.style.display = 'flex';
            
            // 设置数量控制
            setupQuantityControl(product.stock);
        })
        .catch(error => {
            console.error('Error loading product details:', error);
            showCustomAlert('加载商品详情失败: ' + error.message);
        });
}


// 这个函数已被移除，使用上面定义的addToCart函数

// 更新购物车数量显示
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// 显示添加购物车成功提示 - 这个函数已不再使用，使用showCustomAlert代替
function showAddToCartSuccess() {
    // 此函数保留但不再使用，使用showCustomAlert代替
    console.log('showAddToCartSuccess函数已被弃用，使用showCustomAlert代替');
}

// 下架商品功能
function deleteGoods(goodsName) {
    // 使用自定义确认弹窗
    showCustomConfirm('确定要下架商品 "' + goodsName + '" 吗？', '下架商品确认', function(confirmed) {
        if (confirmed) {
            fetch(`http://localhost:8084/goods/delete/${goodsName}`, {
                method: 'DELETE'
            })
            .then(response => response.text())
            .then(data => {
                console.log('删除商品响应:', data);
                if (data === '商品删除成功') {
                    showCustomAlert('商品下架成功');
                    // 重新加载商品列表
                    loadGoods(currentPage, currentCategory, currentBrand, currentMinPrice, currentMaxPrice, currentSearchTerm, currentSortBy);
                } else {
                    showCustomAlert('商品下架失败: ' + data);
                }
            })
            .catch(error => {
                console.error('Error deleting goods:', error);
                showCustomAlert('商品下架失败: ' + error.message);
            });
        }
    });
}

// 更新库存
function updateStock(goodsId, change) {
    // 直接获取库存元素
    const stockElement = document.getElementById(`stock-${goodsId}`);
    if (!stockElement) {
        showCustomAlert('找不到商品库存元素');
        console.error('找不到库存元素，商品ID:', goodsId);
        return;
    }
    
    // 获取当前库存
    const currentStock = parseInt(stockElement.textContent);
    const newStock = currentStock + change;
    
    if (newStock < 0) {
        showCustomAlert('库存不能小于0');
        return;
    }
    
    console.log(`正在更新商品 ${goodsId} 的库存，当前库存: ${currentStock}，变化量: ${change}，新库存: ${newStock}`);
    
    // 使用axios发送请求到后端API
    axios.post('http://localhost:8084/goods/updateStock', {
        goodsId: goodsId,
        quantity: newStock
    })
    .then(response => {
        // 检查响应是否成功
        if (response.data && (response.data.success || response.status === 200)) {
            // 更新DOM中的库存显示
            stockElement.textContent = newStock;
            showCustomAlert('库存更新成功');
            
            // 同时更新products数组中的库存数据
            const productIndex = products.findIndex(p => p.goodsId === goodsId);
            if (productIndex !== -1) {
                products[productIndex].stock = newStock;
            }
        } else {
            showCustomAlert('库存更新失败: ' + (response.data ? response.data.message : '未知错误'));
        }
    })
    .catch(error => {
        console.error('Error updating stock:', error);
        showCustomAlert('库存更新失败: ' + error.message);
    });
}


// 自定义输入弹窗
function showCustomPrompt(message, callback, title = '请输入') {
    const dialog = document.getElementById('customDialog');
    const dialogTitle = dialog.querySelector('.custom-dialog-title');
    const dialogMessage = document.getElementById('customDialogMessage');
    const confirmButton = document.getElementById('customDialogConfirm');
    const cancelButton = document.getElementById('customDialogCancel');
    const closeButton = dialog.querySelector('.custom-dialog-close');
    
    // 创建输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.marginTop = '10px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #ddd';
    
    dialogTitle.textContent = title;
    dialogMessage.textContent = message;
    dialogMessage.appendChild(document.createElement('br'));
    dialogMessage.appendChild(input);
    dialog.classList.add('show');
    
    // 聚焦输入框
    setTimeout(() => input.focus(), 100);
    
    const confirmHandler = () => {
        const value = input.value.trim();
        dialog.classList.remove('show');
        // 移除输入框
        dialogMessage.removeChild(dialogMessage.lastChild);
        dialogMessage.removeChild(dialogMessage.lastChild);
        if (callback) callback(value);
        cleanup();
    };
    
    const cancelHandler = () => {
        dialog.classList.remove('show');
        // 移除输入框
        dialogMessage.removeChild(dialogMessage.lastChild);
        dialogMessage.removeChild(dialogMessage.lastChild);
        if (callback) callback(null);
        cleanup();
    };
    
    const closeHandler = () => {
        dialog.classList.remove('show');
        // 移除输入框
        dialogMessage.removeChild(dialogMessage.lastChild);
        dialogMessage.removeChild(dialogMessage.lastChild);
        if (callback) callback(null);
        cleanup();
    };
    
    // 处理回车键
    input.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            confirmHandler();
        }
    });
    
    const cleanup = () => {
        confirmButton.removeEventListener('click', confirmHandler);
        cancelButton.removeEventListener('click', cancelHandler);
        closeButton.removeEventListener('click', closeHandler);
        input.removeEventListener('keyup', confirmHandler);
    };
    
    confirmButton.addEventListener('click', confirmHandler);
    cancelButton.addEventListener('click', cancelHandler);
    closeButton.addEventListener('click', closeHandler);
}

// 更新购物车显示
function updateCartDisplay() {
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItems.innerHTML = '';
        cartTotal.textContent = '¥0.00';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    cartItems.innerHTML = '';
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.goodsPrice * item.quantity;
        total += itemTotal;
        
        const brandName = brandTypes[item.goodsBrand] || '未知品牌';
        const typeName = goodsTypes[item.goodsType] || '未知类型';
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="http://localhost:8084/goods/images/${item.goodsImage}" alt="${item.goodsName}" onerror="this.src='/img/default.png'">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.goodsName}</div>
                <div class="cart-item-price">¥${item.goodsPrice.toFixed(2)}</div>
                <div class="cart-item-brand-type">${brandName} | ${typeName}</div>
                <div class="cart-item-quantity">
                    数量:
                    <div class="quantity-control">
                        <button class="quantity-button decrease" data-index="${index}">-</button>
                        <input type="number" value="${item.quantity}" min="1" max="${item.stock}" data-index="${index}">
                        <button class="quantity-button increase" data-index="${index}">+</button>
                    </div>
                </div>
            </div>
            <div class="cart-item-remove" data-index="${index}">&times;</div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `¥${total.toFixed(2)}`;
    
    // 添加购物车项事件监听器
    addCartItemEventListeners();
}

// 设置购物车项目的事件监听
function setupCartItemEvents() {
    // 减少数量
    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const item = cart.find(item => item.product.goodsId === productId);
            if (item && item.quantity > 1) {
                item.quantity--;
                updateCartDisplay();
                updateCartCount();
            }
        });
    });
    
    // 增加数量
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            const item = cart.find(item => item.product.goodsId === productId);
            const product = products.find(p => p.goodsId === productId);
            
            if (item && item.quantity < product.stock) {
                item.quantity++;
                updateCartDisplay();
                updateCartCount();
            } else {
                alert('商品库存不足！');
            }
        });
    });
    
    // 直接输入数量
    document.querySelectorAll('.cart-item-quantity input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.dataset.id);
            const item = cart.find(item => item.product.goodsId === productId);
            const product = products.find(p => p.goodsId === productId);
            
            let quantity = parseInt(this.value);
            
            // 验证输入
            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
            } else if (quantity > product.stock) {
                quantity = product.stock;
                alert('已调整为最大可用库存！');
            }
            
            this.value = quantity;
            item.quantity = quantity;
            
            updateCartDisplay();
            updateCartCount();
        });
    });
    
    // 移除商品
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            cart = cart.filter(item => item.product.goodsId !== productId);
            updateCartDisplay();
            updateCartCount();
        });
    });
}

// 结算功能 - 作为购物车内唯一的订单创建入口
function checkout() {
    if (cart.length === 0) {
        showCustomAlert('购物车是空的');
        return;
    }
    
    // 创建订单
    const orderGoodsList = cart.map(item => ({
        goodsId: item.goodsId,
        quantity: item.quantity
    }));
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        showCustomAlert('请先登录');
        window.location.href = '/html/user/login.html';
        return;
    }
    
    const order = {
        userId: user.userId,
        orderGoodsList: orderGoodsList,
        orderState: '待付款'
    };
    
    // 发送创建订单请求
    axios.post('http://localhost:8083/order/create', order)
        .then(response => {
            const orderId = response.data;
            if (orderId) {
                // 显示订单确认弹窗
                showOrderConfirmation(orderId, order);
                // 清空购物车
                cart = [];
                updateCartCount();
                updateCartDisplay();
                // 关闭购物车弹窗
                cartModal.style.display = 'none';
            } else {
                showCustomAlert('创建订单失败');
            }
        })
        .catch(error => {
            console.error('Error creating order:', error);
            showCustomAlert('创建订单失败: ' + error.message);
        });
}


// 上架新商品
function submitNewGoods() {
    const goodsName = document.getElementById('goodsName').value.trim();
    const goodsPrice = document.getElementById('goodsPrice').value.trim();
    const goodsStock = document.getElementById('goodsStock').value.trim();
    const goodsType = document.getElementById('goodsType').value;
    const goodsBrand = document.getElementById('goodsBrand').value;
    const goodsDescription = document.getElementById('goodsDescription') ? document.getElementById('goodsDescription').value.trim() : '';
    
    // 验证表单
    if (!goodsName || !goodsPrice || !goodsStock || !goodsType || !goodsBrand) {
        alert('请填写所有必填字段');
        return;
    }
    
    // 准备表单数据
    const formData = new FormData();
    formData.append('goodsName', goodsName);
    formData.append('goodsPrice', goodsPrice);
    formData.append('stock', goodsStock);
    formData.append('goodsType', goodsType);
    formData.append('goodsBrand', goodsBrand);
    
    if (goodsDescription) {
        formData.append('goodsDescription', goodsDescription);
    }
    
    // 获取图片文件
    const goodsImage = document.getElementById('goodsImage');
    if (goodsImage && goodsImage.files.length > 0) {
        formData.append('goodsImage', goodsImage.files[0]);
    }
    
    // 发送请求
    fetch('http://localhost:8084/goods/add', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log('上架商品响应:', data);
        if (data.includes('成功')) {
            alert('商品上架成功');
            // 清空表单
            document.getElementById('goodsName').value = '';
            document.getElementById('goodsPrice').value = '';
            document.getElementById('goodsStock').value = '';
            document.getElementById('goodsType').value = '';
            document.getElementById('goodsBrand').value = '';
            if (document.getElementById('goodsDescription')) {
                document.getElementById('goodsDescription').value = '';
            }
            if (goodsImage) {
                goodsImage.value = '';
            }
            
            // 关闭弹窗
            const myModal = document.getElementById('myModal');
            if (myModal) {
                myModal.style.display = 'none';
            }
            
            // 重新加载商品列表
            loadGoods(1);
        } else {
            alert('商品上架失败: ' + data);
        }
    })
    .catch(error => {
        console.error('Error adding goods:', error);
        alert('商品上架失败: ' + error.message);
    });
}

// 自定义确认弹窗
function showCustomConfirm(message, title, callback) {
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'custom-dialog';
    confirmDialog.innerHTML = `
        <div class="custom-dialog-content">
            <div class="custom-dialog-header">
                <h3>${title || '确认'}</h3>
                <span class="custom-dialog-close">&times;</span>
            </div>
            <div class="custom-dialog-body">
                <p>${message}</p>
            </div>
            <div class="custom-dialog-footer">
                <button class="custom-dialog-button confirm">确认</button>
                <button class="custom-dialog-button cancel">取消</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmDialog);
    
    const closeButton = confirmDialog.querySelector('.custom-dialog-close');
    const confirmButton = confirmDialog.querySelector('.custom-dialog-button.confirm');
    const cancelButton = confirmDialog.querySelector('.custom-dialog-button.cancel');
    
    const cleanup = () => {
        document.body.removeChild(confirmDialog);
    };
    
    closeButton.addEventListener('click', () => {
        cleanup();
        if (callback) callback(false);
    });
    
    confirmButton.addEventListener('click', () => {
        cleanup();
        if (callback) callback(true);
    });
    
    cancelButton.addEventListener('click', () => {
        cleanup();
        if (callback) callback(false);
    });
    
    // 显示弹窗
    setTimeout(() => {
        confirmDialog.classList.add('show');
    }, 10);
}

// 自定义提示弹窗
function showCustomAlert(message, title) {
    const alertDialog = document.createElement('div');
    alertDialog.className = 'custom-dialog';
    alertDialog.innerHTML = `
        <div class="custom-dialog-content">
            <div class="custom-dialog-header">
                <h3>${title || '提示'}</h3>
                <span class="custom-dialog-close">&times;</span>
            </div>
            <div class="custom-dialog-body">
                <p>${message}</p>
            </div>
            <div class="custom-dialog-footer">
                <button class="custom-dialog-button confirm">确定</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(alertDialog);
    
    const closeButton = alertDialog.querySelector('.custom-dialog-close');
    const confirmButton = alertDialog.querySelector('.custom-dialog-button.confirm');
    
    const cleanup = () => {
        document.body.removeChild(alertDialog);
    };
    
    closeButton.addEventListener('click', cleanup);
    confirmButton.addEventListener('click', cleanup);
    
    // 显示弹窗
    setTimeout(() => {
        alertDialog.classList.add('show');
    }, 10);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .add-success-message {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background-color: rgba(102, 230, 179, 0.9);
        color: #333;
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: 500;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        transition: transform 0.3s ease;
    }
    
    .add-success-message.show {
        transform: translateX(-50%) translateY(0);
    }
    
    .no-products {
        text-align: center;
        padding: 40px;
        color: #666;
        font-size: 18px;
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        margin-top: 20px;
        margin-bottom: 20px;
    }
    
    .pagination-button {
        margin: 0 5px;
        padding: 8px 12px;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    .pagination-button:hover {
        background-color: #e0e0e0;
    }
    
    .pagination-button.active {
        background-color: #4CAF50;
        color: white;
        border-color: #4CAF50;
    }
    
    .pagination-button:disabled {
        background-color: #f9f9f9;
        color: #aaa;
        cursor: not-allowed;
    }
    
    .custom-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
    }
    
    .custom-dialog.show {
        opacity: 1;
        visibility: visible;
    }
    
    .custom-dialog-content {
        background-color: white;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    
    .custom-dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
    }
    
    .custom-dialog-header h3 {
        margin: 0;
        font-size: 18px;
    }
    
    .custom-dialog-close {
        font-size: 24px;
        cursor: pointer;
        color: #999;
    }
    
    .custom-dialog-body {
        padding: 20px;
    }
    
    .custom-dialog-footer {
        padding: 15px 20px;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
    }
    
    .custom-dialog-button {
        padding: 8px 16px;
        margin-left: 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .custom-dialog-button.confirm {
        background-color: #4CAF50;
        color: white;
    }
    
    .custom-dialog-button.cancel {
        background-color: #f0f0f0;
    }
    
    .highlight {
        animation: highlight 2s ease-in-out;
    }
    
    @keyframes highlight {
        0% { box-shadow: 0 0 0 0 rgba(255, 220, 40, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(255, 220, 40, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 220, 40, 0); }
    }
    
    .info-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 20px;
        height: 20px;
        background-color: #4CAF50;
        color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        cursor: pointer;
    }
    
    .goods-info-tooltip {
        position: absolute;
        top: 40px;
        right: 10px;
        background-color: white;
        padding: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        width: 200px;
        display: none;
        z-index: 10;
    }
    
    .img-container:hover .goods-info-tooltip {
        display: block;
    }
`;
document.head.appendChild(style);