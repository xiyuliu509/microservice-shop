document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('请先登录');
        window.location.href = '/html/user/login.html';
        return;
    }

    function loadOrders() {
        const isAdminOrSeller = user.userType === 1 || user.userType === 2; // 判断是否为管理员或商家
        axios.get('http://localhost:8083/order/list')
            .then(response => {
                const orders = response.data;
                const orderTableBody = document.getElementById('orderTableBody');
                orderTableBody.innerHTML = '';
                
                // 使用文档片段提高性能
                const fragment = document.createDocumentFragment();
                
                orders.forEach(order => {
                    // 只显示用户自己订单或者管理员/商家所有订单
                    if (user.userId !== order.userId && !isAdminOrSeller) {
                        return; // 普通用户只能看到自己的订单，管理员商家可以看到所有订单
                    }

                    // 创建订单行元素
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.orderId}</td>
                        <td>
                            <select data-order-id="${order.orderId}" ${isAdminOrSeller ? '' : 'disabled'}>
                                <option value="待付款" ${order.orderState === '待付款' ? 'selected' : ''}>待付款</option>
                                <option value="已取消" ${order.orderState === '已取消' ? 'selected' : ''}>已取消</option>
                                <option value="待发货" ${order.orderState === '待发货' ? 'selected' : ''}>待发货</option>
                                <option value="待收货" ${order.orderState === '待收货' ? 'selected' : ''}>待收货</option>
                                <option value="订单完成" ${order.orderState === '订单完成' ? 'selected' : ''}>订单完成</option>
                            </select>
                        </td>
                        <td>¥${order.orderPrice}</td>
                        <td>${order.createStamp}</td>
                        <td>
                            <button class="view-goods-button" data-order-id="${order.orderId}">查看商品</button>
                            ${(!isAdminOrSeller && order.orderState === '待付款') ? `
                                <button class="cancel-order-button" data-order-id="${order.orderId}">取消订单</button>
                                <button class="pay-order-button" data-order-id="${order.orderId}" data-order-price="${order.orderPrice}">付款</button>
                            ` : ''}
                            ${(!isAdminOrSeller && order.orderState === '待发货') ? `
                                <button class="cancel-paid-order-button" data-order-id="${order.orderId}">申请退款</button>
                            ` : ''}
                            ${(!isAdminOrSeller && order.orderState === '待收货') ? `
                                <button onclick="updateOrderState(${order.orderId}, '订单完成')">确认收货</button>
                            ` : ''}
                            ${(user.userType === 2) ? `
                                <button class="delete-order-button" data-order-id="${order.orderId}">删除订单</button>
                            ` : ''}
                        </td>
                    `;
                    fragment.appendChild(row);
                });
                
                // 一次性添加所有行到DOM，减少重排
                orderTableBody.appendChild(fragment);

                // 添加事件监听器用于查看商品 - 绑定点击事件到动态生成的按钮
                document.querySelectorAll('.view-goods-button').forEach(button => {
                    button.addEventListener('click', function () {
                        const orderId = parseInt(this.getAttribute('data-order-id'));
                        viewGoods(orderId);
                    });
                });

                // 添加事件监听器用于取消订单 - 需要确认操作
                document.querySelectorAll('.cancel-order-button').forEach(button => {
                    button.addEventListener('click', function () {
                        const orderId = parseInt(this.getAttribute('data-order-id'));
                        const confirmation = prompt('请输入 "delete" 确认取消订单：');
                        if (confirmation === 'delete') {
                            cancelOrder(orderId);
                        } else {
                            alert('取消订单失败：输入不正确');
                        }
                    });
                });

                // 添加事件监听器用于取消已付款订单 - 申请退款功能
                document.querySelectorAll('.cancel-paid-order-button').forEach(button => {
                    button.addEventListener('click', function () {
                        const orderId = parseInt(this.getAttribute('data-order-id'));
                        cancelPaidOrder(orderId);
                    });
                });
                
                // 添加事件监听器用于付款 - 显示支付二维码
                document.querySelectorAll('.pay-order-button').forEach(button => {
                    button.addEventListener('click', function () {
                        const orderId = parseInt(this.getAttribute('data-order-id'));
                        const orderPrice = this.getAttribute('data-order-price');
                        showPaymentQRCode(orderId, orderPrice);
                    });
                });

                // 添加事件监听器用于更新订单状态 - 管理员/商家功能
                document.querySelectorAll('select[data-order-id]').forEach(select => {
                    select.addEventListener('change', function () {
                        const orderId = parseInt(this.getAttribute('data-order-id'));
                        const newState = this.value;
                        // 发送更新订单状态请求
                        axios.post('http://localhost:8083/order/update', { orderId: orderId, orderState: newState })
                            .then(response => {
                                alert('订单状态更新成功！');
                                loadOrders(); // 刷新订单列表
                            })
                            .catch(error => {
                                console.error(error);
                                alert('更新订单状态失败');
                            });
                    });
                });
                
                // 添加事件监听器用于删除订单 - 商家功能
                document.querySelectorAll('.delete-order-button').forEach(button => {
                    button.addEventListener('click', function () {
                        const orderId = parseInt(this.getAttribute('data-order-id'));
                        if (confirm('确定要删除该订单吗？此操作不可恢复！')) {
                            axios.delete(`http://localhost:8083/order/delete/${orderId}`)
                                .then(response => {
                                    alert('订单已删除');
                                    loadOrders(); // 刷新订单列表
                                })
                                .catch(error => {
                                    console.error('删除订单失败:', error);
                                    alert('删除订单失败: ' + (error.response ? error.response.data : error.message));
                                });
                        }
                    });
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    // 显示支付二维码 - 创建模态支付窗口
    function showPaymentQRCode(orderId, orderPrice) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        
        // 创建支付窗口
        const paymentWindow = document.createElement('div');
        paymentWindow.className = 'payment-window';
        
        // 添加标题
        const title = document.createElement('h2');
        title.textContent = `支付订单 #${orderId}`;
        
        // 添加金额
        const amount = document.createElement('p');
        amount.textContent = `支付金额: $${orderPrice}`;
        amount.className = 'payment-amount';
        
        // 添加二维码容器
        const qrCodeContainer = document.createElement('div');
        qrCodeContainer.className = 'qr-code-container';
        
        // 添加二维码
        const qrCode = document.createElement('img');
        qrCode.src = '/picture/fkm.png';
        qrCode.alt = '支付二维码';
        qrCode.className = 'payment-qrcode';
        
        // 添加支付标识
        const paymentLabel = document.createElement('div');
        paymentLabel.textContent = '';
        paymentLabel.className = 'payment-label';
        
        // 添加提示
        const hint = document.createElement('p');
        hint.textContent = '请使用微信或支付宝扫码支付';
        hint.className = 'payment-hint';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'payment-buttons';
        
        // 添加刷新支付状态按钮
        const refreshButton = document.createElement('button');
        refreshButton.textContent = '刷新支付状态';
        refreshButton.className = 'refresh-button';
        
        // 添加取消支付按钮
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消支付';
        cancelButton.className = 'cancel-button';
        
        // 添加事件监听器
        refreshButton.addEventListener('click', function() {
            updateOrderState(orderId, '待发货');
            document.body.removeChild(modal);
            alert('支付成功！');
        });
        
        cancelButton.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // 组装支付窗口 - 将各元素添加到窗口中
        qrCodeContainer.appendChild(qrCode);
        qrCodeContainer.appendChild(paymentLabel);
        buttonContainer.appendChild(refreshButton);
        buttonContainer.appendChild(cancelButton);
        
        paymentWindow.appendChild(title);
        paymentWindow.appendChild(amount);
        paymentWindow.appendChild(qrCodeContainer);
        paymentWindow.appendChild(hint);
        paymentWindow.appendChild(buttonContainer);
        modal.appendChild(paymentWindow);
        
        // 添加到页面
        document.body.appendChild(modal);
    }

    // 添加取消已付款订单的功能
    function cancelPaidOrder(orderId) {
        const confirmation = confirm('确定要取消已付款的订单吗？退款将在1-3个工作日内退回您的支付账户。');
        if (confirmation) {
            axios.post('http://localhost:8083/order/cancel', { orderId: orderId })
                .then(response => {
                    alert('订单已取消，退款申请已提交');
                    loadOrders(); // 重新加载订单列表
                })
                .catch(error => {
                    console.error('取消订单失败:', error);
                    alert('取消订单失败: ' + (error.response ? error.response.data : error.message));
                });
        }
    }

    // 查看订单商品详情功能
    function viewGoods(orderId) {
        axios.get(`http://localhost:8083/order/findgoods/${orderId}`)
            .then(response => {
                const goodsList = response.data;
                if (goodsList && goodsList.length > 0) {
                    let goodsInfo = '订单商品信息:\n';
                    goodsList.forEach(orderGoods => {
                        goodsInfo += `商品名称: ${orderGoods.goods.goodsName}\n价格: $${orderGoods.goods.goodsPrice}\n数量: ${orderGoods.quantity}\n\n`;
                    });
                    alert(goodsInfo);
                } else {
                    alert('订单中没有商品');
                }
            })
            .catch(error => {
                console.error(error);
                alert('获取商品信息失败');
            });
    }

    // 更新订单状态功能 - 用于确认收货和支付成功
    function updateOrderState(orderId, newState) {
        axios.post('http://localhost:8083/order/update', { orderId: orderId, orderState: newState })
            .then(response => {
                alert('订单状态更新成功！');
                loadOrders(); // 重新加载订单列表
            })
            .catch(error => {
                console.error('订单状态更新失败:', error);
                alert('订单状态更新失败.');
            });
    }

    // 取消未付款订单功能
    function cancelOrder(orderId) {
        axios.post('http://localhost:8083/order/cancel', { orderId: orderId })
            .then(response => {
                alert(response.data);
                loadOrders(); // 重新加载订单列表
            })
            .catch(error => {
                console.error('取消订单失败:', error);
                alert('取消订单失败.');
            });
    }

    // 页面加载时初始化订单列表
    loadOrders();
});
