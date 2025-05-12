document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        showCustomAlert('请先登录', '提示', function() {
            window.location.href = '/html/user/login.html';
        });
        return;
    }

    // 添加加载状态变量，防止重复加载
    let isLoading = false;
    
    // 分页相关变量
    let currentPage = 1;
    const ordersPerPage = 5; // 每页显示5条订单
    let totalOrders = 0;
    let totalPages = 0;
    let allOrders = []; // 存储所有订单数据
    
    // 自定义提示弹窗
    window.showCustomAlert = function(message, title = '提示', callback) {
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
            if (callback) callback();
        };
        
        // 关闭按钮事件
        const closeHandler = () => {
            dialog.classList.remove('show');
            confirmButton.removeEventListener('click', confirmHandler);
            closeButton.removeEventListener('click', closeHandler);
            if (callback) callback();
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
            cleanup();
            if (callback) callback(true);
        };
        
        // 取消按钮事件
        const cancelHandler = () => {
            dialog.classList.remove('show');
            cleanup();
            if (callback) callback(false);
        };
        
        // 关闭按钮事件
        const closeHandler = () => {
            dialog.classList.remove('show');
            cleanup();
            if (callback) callback(false);
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
    
    // 加载所有订单数据
    function loadOrders() {
        if (isLoading) return;
        
        isLoading = true;
        const orderTableBody = document.getElementById('orderTableBody');
        orderTableBody.innerHTML = '<div class="order-loading"><div class="loading-spinner"></div><span>加载中...</span></div>';
        
        const isAdminOrSeller = user.userType === 1 || user.userType === 2; // 判断是否为管理员或商家
        
        axios.get('http://localhost:8083/order/list')
            .then(response => {
                const orders = response.data;
                
                // 过滤订单 - 普通用户只显示自己的订单
                allOrders = isAdminOrSeller ? 
                    orders : 
                    orders.filter(order => user.userId === order.userId);
                
                totalOrders = allOrders.length;
                totalPages = Math.ceil(totalOrders / ordersPerPage);
                
                // 更新页面计数器
                document.getElementById('totalPagesNum').textContent = totalPages;
                
                // 渲染当前页的订单
                renderOrdersPage(currentPage);
                
                // 生成分页控件
                renderPagination();
                
                isLoading = false;
            })
            .catch(error => {
                console.error('加载订单失败:', error);
                orderTableBody.innerHTML = '<tr><td colspan="5" class="error-cell">加载失败: ' + (error.response ? error.response.data : error.message) + ' <button onclick="window.location.reload()">重试</button></td></tr>';
                isLoading = false;
            });
    }
    
    // 渲染指定页的订单
    // 渲染指定页的订单
    function renderOrdersPage(page) {
        currentPage = page;
        document.getElementById('currentPageNum').textContent = currentPage;
        
        const orderTableBody = document.getElementById('orderTableBody');
        orderTableBody.innerHTML = '';
        
        // 计算当前页的订单范围
        const startIndex = (page - 1) * ordersPerPage;
        const endIndex = Math.min(startIndex + ordersPerPage, totalOrders);
        
        // 获取当前页的订单
        const pageOrders = allOrders.slice(startIndex, endIndex);
        
        // 修改空数据显示
        if (pageOrders.length === 0) {
            const emptyRow = document.createElement('div');
            emptyRow.className = 'order-row empty-row';
            emptyRow.innerHTML = '<div class="order-cell" style="width:100%; justify-content:center">暂无订单数据</div>';
            orderTableBody.appendChild(emptyRow);
            return;
        }
        
        // 创建文档片段，减少DOM操作次数
        const fragment = document.createDocumentFragment();
        
        // 修改订单行渲染
        pageOrders.forEach(order => {
            // 创建订单行元素
            const row = document.createElement('div');
            row.className = 'order-row';
            
            // 根据订单状态设置样式类
            let statusClass = '';
            switch(order.orderState) {
                case '待付款':
                    statusClass = 'status-pending';
                    break;
                case '待发货':
                    statusClass = 'status-paid';
                    break;
                case '待收货':
                    statusClass = 'status-shipped';
                    break;
                case '订单完成':
                    statusClass = 'status-completed';
                    break;
                case '已取消':
                    statusClass = 'status-cancelled';
                    break;
                default:
                    statusClass = '';
            }
            
            // 判断用户类型
            const isAdminOrSeller = user.userType === 1 || user.userType === 2;
            
            row.innerHTML = `
                <div class="order-cell order-id-cell">${order.orderId}</div>
                <div class="order-cell order-status-cell">
                    ${isAdminOrSeller ? 
                        `<select data-order-id="${order.orderId}" class="order-status-select">
                            <option value="待付款" ${order.orderState === '待付款' ? 'selected' : ''}>待付款</option>
                            <option value="已取消" ${order.orderState === '已取消' ? 'selected' : ''}>已取消</option>
                            <option value="待发货" ${order.orderState === '待发货' ? 'selected' : ''}>待发货</option>
                            <option value="待收货" ${order.orderState === '待收货' ? 'selected' : ''}>待收货</option>
                            <option value="订单完成" ${order.orderState === '订单完成' ? 'selected' : ''}>订单完成</option>
                        </select>` : 
                        `<span class="order-status ${statusClass}">${order.orderState}</span>`
                    }
                </div>
                <div class="order-cell order-price-cell">￥${order.orderPrice}</div>
                <div class="order-cell order-time-cell">${order.createStamp}</div>
                <div class="order-cell order-action-cell">
                    <div class="action-buttons">
                        <button class="view-goods-button action-button view-button" data-order-id="${order.orderId}">查看商品</button>
                        ${(!isAdminOrSeller && order.orderState === '待付款') ? `
                            <button class="cancel-order-button action-button cancel-button" data-order-id="${order.orderId}">取消订单</button>
                            <button class="pay-order-button action-button pay-button" data-order-id="${order.orderId}" data-order-price="${order.orderPrice}">付款</button>
                        ` : ''}
                        ${(!isAdminOrSeller && order.orderState === '待发货') ? `
                            <button class="cancel-paid-order-button action-button refund-button" data-order-id="${order.orderId}">申请退款</button>
                        ` : ''}
                        ${(!isAdminOrSeller && order.orderState === '待收货') ? `
                            <button class="confirm-receipt-button action-button view-button" data-order-id="${order.orderId}">确认收货</button>
                        ` : ''}
                        ${(user.userType === 2) ? `
                            <button class="delete-order-button action-button cancel-button" data-order-id="${order.orderId}">删除订单</button>
                        ` : ''}
                    </div>
                </div>
            `;
            fragment.appendChild(row);
        });
        
        // 一次性添加所有行到DOM，减少重排
        orderTableBody.appendChild(fragment);
    }
    
    // 渲染分页控件
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
    
    // 跳转到指定页
    function goToPage(page) {
        if (page < 1 || page > totalPages || page === currentPage) {
            return;
        }
        
        currentPage = page;
        renderOrdersPage(currentPage);
        renderPagination();
    }

    // 显示支付二维码
    function showPaymentQRCode(orderId, orderPrice) {
        const dialog = document.getElementById('paymentDialog');
        const orderInfoElement = document.getElementById('paymentOrderInfo');
        const confirmButton = document.getElementById('paymentConfirm');
        const cancelButton = document.getElementById('paymentCancel');
        const closeButton = dialog.querySelector('.custom-dialog-close');
        
        orderInfoElement.textContent = `订单号: ${orderId} - 支付金额: ￥${orderPrice}`;
        dialog.classList.add('show');
        
        // 确认支付按钮事件
        const confirmHandler = () => {
            updateOrderState(orderId, '待发货');
            dialog.classList.remove('show');
            showCustomAlert('支付成功！');
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
    }

    // 查看订单商品详情
    function viewGoods(orderId) {
        const dialog = document.getElementById('viewGoodsDialog');
        const goodsListContainer = document.getElementById('goodsListContainer');
        const closeButton = document.getElementById('viewGoodsClose');
        const dialogCloseButton = dialog.querySelector('.custom-dialog-close');
        
        // 显示加载中
        goodsListContainer.innerHTML = '<div class="loading-spinner"></div><span>加载商品信息中...</span>';
        dialog.classList.add('show');
        
        axios.get(`http://localhost:8083/order/findgoods/${orderId}`)
            .then(response => {
                const goodsList = response.data;
                goodsListContainer.innerHTML = '';
                
                if (goodsList && goodsList.length > 0) {
                    goodsList.forEach(orderGoods => {
                        const goodsItem = document.createElement('div');
                        goodsItem.className = 'goods-item';
                        goodsItem.innerHTML = `
                            <div class="goods-info">
                                <div class="goods-name">${orderGoods.goods.goodsName}</div>
                                <div class="goods-price">单价: ￥${orderGoods.goods.goodsPrice}</div>
                                <div class="goods-quantity">数量: ${orderGoods.quantity}</div>
                            </div>
                            <div class="goods-total">
                                小计: ￥${(orderGoods.goods.goodsPrice * orderGoods.quantity).toFixed(2)}
                            </div>
                        `;
                        goodsListContainer.appendChild(goodsItem);
                    });
                } else {
                    goodsListContainer.innerHTML = '<p>订单中没有商品</p>';
                }
            })
            .catch(error => {
                console.error('获取商品信息失败:', error);
                goodsListContainer.innerHTML = '<p class="error-cell">获取商品信息失败: ' + (error.response ? error.response.data : error.message) + '</p>';
            });
        
        // 关闭按钮事件
        const closeHandler = () => {
            dialog.classList.remove('show');
            closeButton.removeEventListener('click', closeHandler);
            dialogCloseButton.removeEventListener('click', closeHandler);
        };
        
        closeButton.addEventListener('click', closeHandler);
        dialogCloseButton.addEventListener('click', closeHandler);
    }

    // 取消订单
    function cancelOrder(orderId) {
        showCustomConfirm('确定要取消该订单吗？', '取消订单', function(confirmed) {
            if (confirmed) {
                axios.post('http://localhost:8083/order/cancel', { orderId: orderId })
                    .then(response => {
                        showCustomAlert(response.data || '订单已取消');
                        loadOrders(); // 重新加载订单列表
                    })
                    .catch(error => {
                        console.error('取消订单失败:', error);
                        showCustomAlert('取消订单失败: ' + (error.response ? error.response.data : error.message));
                    });
            }
        });
    }

    // 取消已付款订单
    function cancelPaidOrder(orderId) {
        showCustomConfirm('确定要申请退款吗？退款将在1-3个工作日内退回您的支付账户。', '申请退款', function(confirmed) {
            if (confirmed) {
                axios.post('http://localhost:8083/order/cancel', { orderId: orderId })
                    .then(response => {
                        showCustomAlert('订单已取消，退款申请已提交');
                        loadOrders(); // 重新加载订单列表
                    })
                    .catch(error => {
                        console.error('申请退款失败:', error);
                        showCustomAlert('申请退款失败: ' + (error.response ? error.response.data : error.message));
                    });
            }
        });
    }

    // 确认收货
    function confirmReceipt(orderId) {
        showCustomConfirm('确认已收到商品吗？', '确认收货', function(confirmed) {
            if (confirmed) {
                updateOrderState(orderId, '订单完成');
            }
        });
    }

    // 删除订单
    function deleteOrder(orderId) {
        showCustomConfirm('确定要删除该订单吗？此操作不可恢复！', '删除订单', function(confirmed) {
            if (confirmed) {
                axios.delete(`http://localhost:8083/order/delete/${orderId}`)
                    .then(response => {
                        showCustomAlert('订单已删除');
                        loadOrders(); // 刷新订单列表
                    })
                    .catch(error => {
                        console.error('删除订单失败:', error);
                        showCustomAlert('删除订单失败: ' + (error.response ? error.response.data : error.message));
                    });
            }
        });
    }

    // 更新订单状态
    function updateOrderState(orderId, newState) {
        axios.post('http://localhost:8083/order/update', { orderId: orderId, orderState: newState })
            .then(response => {
                showCustomAlert('订单状态更新成功！');
                loadOrders(); // 重新加载订单列表
            })
            .catch(error => {
                console.error('订单状态更新失败:', error);
                showCustomAlert('订单状态更新失败: ' + (error.response ? error.response.data : error.message));
            });
    }

    // 使用事件委托处理按钮点击
    document.getElementById('orderTableBody').addEventListener('click', function(event) {
        const target = event.target;
        
        if (target.classList.contains('view-goods-button')) {
            const orderId = parseInt(target.getAttribute('data-order-id'));
            viewGoods(orderId);
        }
        else if (target.classList.contains('cancel-order-button')) {
            const orderId = parseInt(target.getAttribute('data-order-id'));
            cancelOrder(orderId);
        }
        else if (target.classList.contains('pay-order-button')) {
            const orderId = parseInt(target.getAttribute('data-order-id'));
            const orderPrice = target.getAttribute('data-order-price');
            showPaymentQRCode(orderId, orderPrice);
        }
        else if (target.classList.contains('cancel-paid-order-button')) {
            const orderId = parseInt(target.getAttribute('data-order-id'));
            cancelPaidOrder(orderId);
        }
        else if (target.classList.contains('confirm-receipt-button')) {
            const orderId = parseInt(target.getAttribute('data-order-id'));
            confirmReceipt(orderId);
        }
        else if (target.classList.contains('delete-order-button')) {
            const orderId = parseInt(target.getAttribute('data-order-id'));
            deleteOrder(orderId);
        }
    });

    // 处理订单状态变更
    document.getElementById('orderTableBody').addEventListener('change', function(event) {
        const target = event.target;
        
        if (target.tagName === 'SELECT' && target.hasAttribute('data-order-id')) {
            const orderId = parseInt(target.getAttribute('data-order-id'));
            const newState = target.value;
            
            showCustomConfirm(`确定要将订单状态更改为"${newState}"吗？`, '更改订单状态', function(confirmed) {
                if (confirmed) {
                    updateOrderState(orderId, newState);
                } else {
                    // 如果用户取消，恢复原来的选择
                    loadOrders();
                }
            });
        }
    });

    // 页面加载时初始化订单列表
    loadOrders();
});
