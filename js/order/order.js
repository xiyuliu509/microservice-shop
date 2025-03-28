document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('请先登录');
        window.location.href = '/html/user/login.html';
        return;
    }

    function loadOrders() {
        const isAdminOrSeller = user.userType ===1 || user.userType === 2; // 判断是否为管理员或商家
        axios.get('http://localhost:8083/order/list')
            .then(response => {
                const orders = response.data;
                const orderTableBody = document.getElementById('orderTableBody');
                orderTableBody.innerHTML = '';
                orders.forEach(order => {
                    // 只显示用户自己订单或者管理员/商家所有订单
                    if (user.userId !== order.userId && !isAdminOrSeller) {
                        return; // 普通用户只能看到自己的订单，管理员商家可以看到所有订单
                    }

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
                        <td>$${order.orderPrice}</td>
                        <td>${order.createStamp}</td>
                        <td>
                            <button class="view-goods-button" data-order-id="${order.orderId}">查看商品</button>
                            ${(!isAdminOrSeller && order.orderState === '待付款') ? `
                                <button class="cancel-order-button" data-order-id="${order.orderId}">取消订单</button>
                            ` : ''}
                            ${(!isAdminOrSeller && order.orderState === '待收货') ? `
                                <button onclick="updateOrderState(${order.orderId}, '订单完成')">确认收货</button>
                            ` : ''}
                        </td>
                    `;
                    orderTableBody.appendChild(row);
                });

                // 添加事件监听器用于查看商品
                document.querySelectorAll('.view-goods-button').forEach(button => {
                    button.addEventListener('click', function () {
                        const orderId = parseInt(this.getAttribute('data-order-id'));
                        viewGoods(orderId);
                    });
                });

                // 添加事件监听器用于取消订单
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

                // 添加事件监听器用于更新订单状态
                document.querySelectorAll('select[data-order-id]').forEach(select => {
                    select.addEventListener('change', function () {
                        const orderId = parseInt(this.getAttribute('data-order-id'));
                        const newState = this.value;
                        axios.post('http://localhost:8083/order/update', { orderId: orderId, orderState: newState })
                            .then(response => {
                                alert('订单状态更新成功！');
                            })
                            .catch(error => {
                                console.error(error);
                                alert('更新订单状态失败');
                            });
                    });
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

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

    // 加载订单列表
    loadOrders();
});
