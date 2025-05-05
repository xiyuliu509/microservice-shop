// 配置对象 - 提高代码复用性和减少耦合
const CONFIG = {
    charts: {
        overview: {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [
                    {
                        label: '访问量',
                        data: [65, 59, 80, 81, 56, 55, 40],
                        borderColor: '#6c5ce7',
                        backgroundColor: 'rgba(108, 92, 231, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: '订单量',
                        data: [28, 48, 40, 19, 86, 27, 90],
                        borderColor: '#1dd1a1',
                        backgroundColor: 'rgba(29, 209, 161, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 10,
                            font: { size: 10 }
                        }
                    },
                    tooltip: {
                        titleFont: { size: 10 },
                        bodyFont: { size: 9 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { font: { size: 9 } }
                    },
                    x: {
                        ticks: { font: { size: 9 } }
                    }
                }
            }
        },
        doughnut: {
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 8,
                            padding: 4,
                            font: { size: 9 }
                        }
                    },
                    tooltip: {
                        titleFont: { size: 10 },
                        bodyFont: { size: 9 }
                    }
                },
                cutout: '70%'
            }
        },
        userDistribution: {
            type: 'doughnut',
            data: {
                labels: ['顾客', '商家', '管理员'],
                datasets: [{
                    data: [9, 2, 1],
                    backgroundColor: ['#54a0ff', '#ff6b6b', '#1dd1a1'],
                    borderWidth: 0
                }]
            }
        },
        brandDistribution: {
            type: 'doughnut',
            data: {
                labels: ['马可波罗陶瓷', '雪狼陶瓷', '多乐士', '立邦', '奥斯曼', '西卡'],
                datasets: [{
                    data: [29, 20, 6, 8, 4, 9],
                    backgroundColor: ['#ff9f43', '#ee5253', '#0abde3', '#c8d6e5'],
                    borderWidth: 0
                }]
            }
        },
        typeDistribution: {
            type: 'doughnut',
            data: {
                labels: ['石材砖', '仿木砖', '泳池砖', '马赛克砖', '底漆', '防水涂料', '内墙乳胶漆', '木漆及金属漆', '腻子', '美缝', '密封抗裂胶'],
                datasets: [{
                    data: [13, 13, 6, 7, 3, 6, 9, 6, 1, 1, 1],
                    backgroundColor: ['#10ac84', '#5f27cd', '#ff9ff3', '#48dbfb'],
                    borderWidth: 0
                }]
            }
        }
    }
};

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    App.init();
});

// 应用主对象 - 模块化设计减少耦合
const App = {
    // 图表实例存储
    charts: {},
    
    // 初始化应用
    init: function() {
        // 确保基本UI组件先初始化
        this.initCharts();
        this.initTabs();
        this.initNotifications();
        
        // 立即初始化弹窗，不使用setTimeout
        this.initCustomDialogs();
        
        this.bindEvents();
        
        // 初始化用户管理功能
        this.initUserManagement();
        // 初始化商品管理功能
        this.initProductManagement();
        // 初始化订单管理
        this.initOrderManagement();
        // 确保订单管理标签页正确显示
        const ordersTab = document.getElementById('orders');
        if (ordersTab) {
            ordersTab.classList.add('tab-content');
            if (document.querySelector('.menu-item[data-tab="orders"]').classList.contains('active')) {
                ordersTab.style.display = 'block';
            }
        }

        // 绑定用户管理相关事件
        this.bindUserManagementEvents();
        
        // 绑定商品管理相关事件
        this.bindProductManagementEvents();
        
        // 绑定订单管理相关事件
        this.bindOrderManagementEvents();
    },
    
    // 初始化订单管理功能
    initOrderManagement: function() {
        // 加载订单列表
        this.loadOrderList();
        
        // 初始化订单搜索结果区域
        const searchResult = document.getElementById('orderSearchResult');
        if (searchResult) {
            searchResult.style.display = 'none';
        }
    },
    
    // 绑定订单管理相关事件
    bindOrderManagementEvents: function() {
        // 订单管理容器
        const orderManagement = document.getElementById('orders');
        if (!orderManagement) return;
        
        // 使用事件委托处理所有订单管理相关事件
        orderManagement.addEventListener('click', (e) => {
            const target = e.target;
            
            // 搜索按钮
            if (target.id === 'orderSearchBtn' || target.closest('#orderSearchBtn')) {
                this.searchOrder();
                return;
            }
            
            // 刷新订单列表按钮
            if (target.id === 'refreshOrderList' || target.closest('#refreshOrderList')) {
                this.loadOrderList();
                return;
            }
        });
        
        // 搜索输入框回车事件
        const searchInput = document.getElementById('orderSearchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchOrder();
                }
            });
        }
        
        // 订单状态筛选事件
        const filterSelect = document.getElementById('orderStatusFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                this.loadOrderList();
            });
        }
    },
    
    // 加载订单列表
    loadOrderList: function() {
        const filterSelect = document.getElementById('orderStatusFilter');
        const selectedStatus = filterSelect ? filterSelect.value : 'all';
        
        fetch('http://localhost:8083/order/list')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('获取订单列表失败');
                }
            })
            .then(orders => {
                this.renderOrderList(orders, selectedStatus);
                this.hideNotification();
            })
            .catch(error => {
                console.error('加载订单列表出错:', error);
                this.showNotification('加载订单列表出错，请稍后再试', 'error');
            });
    },
    
    // 渲染订单列表
    renderOrderList: function(orders, selectedStatus) {
        const tableBody = document.getElementById('orderTableBody');
        if (!tableBody) return;
        
        // 清空现有内容
        tableBody.innerHTML = '';
        
        // 筛选订单
        let filteredOrders = orders;
        if (selectedStatus !== 'all') {
            filteredOrders = orders.filter(order => order.orderState === selectedStatus);
        }
        
        // 渲染订单列表
        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            // 格式化时间戳
            const formattedTime = order.createStamp ? this.formatDateTime(order.createStamp) : 'N/A';
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>
                    <select data-order-id="${order.orderId}" class="order-status-select form-select form-select-sm">
                        <option value="待付款" ${order.orderState === '待付款' ? 'selected' : ''}>待付款</option>
                        <option value="已取消" ${order.orderState === '已取消' ? 'selected' : ''}>已取消</option>
                        <option value="待发货" ${order.orderState === '待发货' ? 'selected' : ''}>待发货</option>
                        <option value="待收货" ${order.orderState === '待收货' ? 'selected' : ''}>待收货</option>
                        <option value="订单完成" ${order.orderState === '订单完成' ? 'selected' : ''}>订单完成</option>
                    </select>
                </td>
                <td>¥${order.orderPrice.toFixed(2)}</td>
                <td>${formattedTime}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm view-goods-button" data-order-id="${order.orderId}">
                            <i class="bi bi-eye"></i> 查看商品
                        </button>
                    </div>
                </td>
            `;
            
            // 添加状态选择事件监听器// ... 省略前面代码 ...
            const statusSelect = row.querySelector('.order-status-select');
            if (statusSelect) {
                statusSelect.addEventListener('change', (e) => {
                    const orderId = e.target.getAttribute('data-order-id');
                    const newState = e.target.value;
                    this.showCustomConfirm(
                        `确定要将订单 ${orderId} 的状态修改为 "${newState}" 吗？`,
                        '确认修改状态',
                        (confirmed) => {
                            if (confirmed) {
                                this.updateOrderState(orderId, newState);
                            } else {
                                // 用户取消，恢复下拉框选项并刷新列表
                                e.target.value = order.orderState;
                                this.loadOrderList(); // 强制刷新，确保UI和数据一致
                            }
                        }
                    );
                });
            }


            // 添加查看商品按钮事件监听器
            const viewButton = row.querySelector('.view-goods-button');
            if (viewButton) {
                viewButton.addEventListener('click', (e) => {
                    const orderId = e.target.getAttribute('data-order-id');
                    this.viewOrderGoods(orderId); // 调用修改后的查看商品函数
                });
            }

            tableBody.appendChild(row);
        });
    },

    // 更新订单状态
    updateOrderState: function(orderId, newState) {
        // ... (此函数内部逻辑不变) ...
        fetch('http://localhost:8083/order/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: parseInt(orderId),
                orderState: newState
            })
        })
        .then(response => {
            if (response.ok) {
                this.showNotification('订单状态更新成功', 'success');
                this.loadOrderList(); // 重新加载列表以更新状态
            } else {
                 // 如果更新失败，也需要重新加载以恢复原始状态
                 this.loadOrderList();
                 return response.text().then(text => { throw new Error(`更新订单状态失败: ${text || response.statusText}`) });
            }
        })
        .catch(error => {
            console.error('更新订单状态出错:', error);
            this.showNotification(error.message || '更新订单状态失败，请稍后再试', 'error');
             // 确保即使出错也刷新列表以显示正确状态
             this.loadOrderList();
        });
    },

    // 查看订单商品 (修改为使用自定义弹窗)
    viewOrderGoods: function(orderId) {
        fetch(`http://localhost:8083/order/findgoods/${orderId}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('获取订单商品信息失败');
                }
            })
            .then(goodsList => {
                let dialogBodyContent = '';
                if (goodsList && goodsList.length > 0) {
                    // 使用 HTML 格式化商品信息
                    dialogBodyContent = '<ul style="list-style: none; padding: 0;">';
                    goodsList.forEach(orderGoods => {
                        dialogBodyContent += `<li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                            <strong>商品名称:</strong> ${orderGoods.goods.goodsName}<br>
                            <strong>价格:</strong> ¥${orderGoods.goods.goodsPrice.toFixed(2)}<br>
                            <strong>数量:</strong> ${orderGoods.quantity}
                        </li>`;
                    });
                    dialogBodyContent += '</ul>';
                } else {
                    dialogBodyContent = '<p>此订单中没有商品信息。</p>';
                }

                // 调用自定义弹窗显示信息
                 const dialog = document.getElementById('customDialog');
                 const messageElement = document.getElementById('customDialogMessage');
                 const titleElement = dialog.querySelector('.custom-dialog-title');
                 const confirmButton = document.getElementById('customDialogConfirm');
                 const cancelButton = document.getElementById('customDialogCancel');

                 titleElement.textContent = `订单 ${orderId} 商品详情`;
                 messageElement.innerHTML = dialogBodyContent; // 使用 innerHTML 渲染 HTML
                 dialog.classList.add('show');

            })
            .catch(error => {
                console.error('获取订单商品信息出错:', error);
                this.showNotification('获取订单商品信息失败，请稍后再试', 'error');
            });
    },
    
    // 搜索订单
    searchOrder: function() {
        const searchInput = document.getElementById('orderSearchInput');
        const searchValue = searchInput ? searchInput.value.trim() : '';
        
        if (!searchValue) {
            this.showNotification('请输入订单号', 'info');
            return;
        }
        
        // 在现有订单列表中搜索
        const rows = document.querySelectorAll('#orderTableBody tr');
        let found = false;
        
        rows.forEach(row => {
            const orderId = row.querySelector('td:first-child').textContent;
            if (orderId.includes(searchValue)) {
                row.style.display = '';
                found = true;
            } else {
                row.style.display = 'none';
            }
        });
        
        if (!found) {
            this.showNotification('未找到匹配的订单', 'info');
        }
    },
    
     // 绑定菜单事件
    bindMenuEvents: function() {
        console.log('绑定菜单事件');
        
        // 获取所有菜单项
        const menuItems = document.querySelectorAll('.menu-item');
        
        // 绑定点击事件
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                // 移除所有菜单项的active类
                menuItems.forEach(i => i.classList.remove('active'));
                
                // 给当前点击的菜单项添加active类
                this.classList.add('active');
            });
        });
    },
    // 初始化图表
    initCharts: function() {
        // 系统概览图表
        this.createChart('overviewChart', CONFIG.charts.overview);
        
        // 用户分布图表
        this.createChart('userDistributionChart', {
            ...CONFIG.charts.userDistribution,
            options: CONFIG.charts.doughnut.options
        });
        
        // 品牌分布图表
        this.createChart('brandDistributionChart', {
            ...CONFIG.charts.brandDistribution,
            options: CONFIG.charts.doughnut.options
        });
        
        // 类型分布图表
        this.createChart('typeDistributionChart', {
            ...CONFIG.charts.typeDistribution,
            options: CONFIG.charts.doughnut.options
        });
        
        // 监听窗口大小变化，重新调整图表
        window.addEventListener('resize', this.handleResize.bind(this));
    },
    
    // 处理窗口大小变化
    handleResize: function() {
        // 延迟执行以避免频繁触发
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        this.resizeTimeout = setTimeout(() => {
            // 更新所有图表
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        }, 200);
    },
    
    // 创建图表的通用方法
    createChart: function(id, config) {
        const element = document.getElementById(id);
        if (!element) return;
        
        const ctx = element.getContext('2d');
        this.charts[id] = new Chart(ctx, {
            type: config.type,
            data: config.data,
            options: config.options
        });
    },
    
    // 更新图表数据
    updateChartData: function(chartId, newData) {
        const chart = this.charts[chartId];
        if (!chart) return;
        
        chart.data = newData;
        chart.update();
    },
    
    // 初始化标签页切换
// 需要在 App 对象中添加或修改以下方法
initTabs: function() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // 移除所有活动状态
            menuItems.forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.style.display = 'none'; // 修改这里，确保正确隐藏
            });
            
            // 添加新的活动状态
            item.classList.add('active');
            const tabId = item.getAttribute('data-tab');
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.style.display = 'block'; // 修改这里，确保正确显示
            }
        });
    });
    
    // 默认显示第一个标签页
    const firstMenuItem = document.querySelector('.menu-item');
    if (firstMenuItem) {
        firstMenuItem.click();
    }
},
    
    // 初始化通知系统
    initNotifications: function() {
        this.notification = document.getElementById('notification');
        this.notificationCloseBtn = this.notification.querySelector('.notification-close');
        
        if (this.notificationCloseBtn) {
            this.notificationCloseBtn.addEventListener('click', () => {
                this.hideNotification();
            });
        }
    },
    
    // 初始化自定义弹窗系统
    initCustomDialogs: function() {
        // 获取DOM元素
        const dialog = document.getElementById('customDialog');
        
        // 添加调试信息
        console.log('初始化自定义弹窗系统');
        console.log('弹窗元素存在:', !!dialog);
        
        if (!dialog) {
            console.error('自定义弹窗元素不存在，请检查HTML中是否包含id为customDialog的元素');
            return;
        }
        
        const closeBtn = dialog.querySelector('.custom-dialog-close');
        const cancelBtn = document.getElementById('customDialogCancel');
        
        // 绑定关闭按钮事件
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeCustomDialog();
            });
        } else {
            console.warn('未找到弹窗关闭按钮');
        }
        
        // 绑定取消按钮事件
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeCustomDialog();
            });
        } else {
            console.warn('未找到弹窗取消按钮');
        }
        
        console.log('自定义弹窗初始化完成');
    },

    // 显示自定义确认对话框
    showCustomConfirm: function(message, title = '确认操作', callback) {
        const dialog = document.getElementById('customDialog');
        const dialogMessage = document.getElementById('customDialogMessage');
        const dialogTitle = document.querySelector('.custom-dialog-title');
        const confirmBtn = document.getElementById('customDialogConfirm');
        
        if (!dialog || !dialogMessage || !confirmBtn) {
            console.error('自定义弹窗元素不存在');
            return false;
        }
        
        // 设置消息和标题
        dialogMessage.textContent = message;
        if (dialogTitle) dialogTitle.textContent = title;
        
        // 显示对话框
        dialog.classList.add('show');
        
        // 移除之前的事件监听器
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        // 添加确认按钮事件
        newConfirmBtn.addEventListener('click', () => {
            this.closeCustomDialog();
            if (typeof callback === 'function') {
                callback(true);
            }
        });
        
        return true;
    },

    // 关闭自定义对话框
    closeCustomDialog: function() {
        const dialog = document.getElementById('customDialog');
        if (dialog) {
            dialog.classList.remove('show');
        }
    },

    // 显示通知
    showNotification: function(message, type = 'success') {
        if (!this.notification) return;
        
        // 设置通知内容
        const messageElement = this.notification.querySelector('.notification-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        // 设置通知类型
        this.notification.className = 'notification';
        this.notification.classList.add('show', type);
        
        // 设置图标
        const iconElement = this.notification.querySelector('.notification-icon i');
        if (iconElement) {
            iconElement.className = type === 'success' 
                ? 'bi bi-check-circle-fill' 
                : type === 'error' 
                    ? 'bi bi-x-circle-fill' 
                    : 'bi bi-info-circle-fill';
        }
        
        // 自动隐藏
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
        
        this.notificationTimeout = setTimeout(() => {
            this.hideNotification();
        }, 3000);
    },
    
    // 隐藏通知
    hideNotification: function() {
        if (!this.notification) return;
        this.notification.classList.remove('show');
    },
    
    // 绑定事件
    bindEvents: function() {
        // 时间范围选择器
        const timeRangeSelector = document.getElementById('timeRangeSelector');
        if (timeRangeSelector) {
            timeRangeSelector.addEventListener('change', this.handleTimeRangeChange.bind(this));
        }
        
        // 删除查看所有通知按钮的事件绑定
        
        // 数据统计按钮
        const statsButton = document.getElementById('statsButton');
        if (statsButton) {
            statsButton.addEventListener('click', () => {
                this.showNotification('数据统计功能即将上线', 'info');
            });
        }
    },
    
    // 处理时间范围变化
    handleTimeRangeChange: function(e) {
        const selectedRange = e.target.value;
        let newData;
        
        // 根据选择的时间范围更新数据
        switch(selectedRange) {
            case '最近30天':
                newData = {
                    labels: ['第1周', '第2周', '第3周', '第4周'],
                    datasets: [
                        {
                            label: '访问量',
                            data: [280, 320, 270, 350],
                            borderColor: '#6c5ce7',
                            backgroundColor: 'rgba(108, 92, 231, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: '订单量',
                            data: [120, 150, 130, 180],
                            borderColor: '#1dd1a1',
                            backgroundColor: 'rgba(29, 209, 161, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        }
                    ]
                };
                break;
            case '最近90天':
                newData = {
                    labels: ['1月', '2月', '3月'],
                    datasets: [
                        {
                            label: '访问量',
                            data: [1200, 1350, 1100],
                            borderColor: '#6c5ce7',
                            backgroundColor: 'rgba(108, 92, 231, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: '订单量',
                            data: [580, 620, 540],
                            borderColor: '#1dd1a1',
                            backgroundColor: 'rgba(29, 209, 161, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        }
                    ]
                };
                break;
            default: // 最近7天
                newData = CONFIG.charts.overview.data;
                break;
        }
        
        this.updateChartData('overviewChart', newData);
        this.showNotification('数据已更新', 'success');
    },
    
    // 初始化用户管理功能
    // 添加通用API请求方法
    apiRequest: function(url, method = 'GET', data = null) {
        // 显示加载状态
        this.showNotification('正在处理请求...', 'info');
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        return fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`请求失败: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                this.showNotification(error.message, 'error');
                throw error;
            });
    },
    
    // 优化后的用户管理初始化
    initUserManagement: function() {
        // 初始化时加载用户列表
        this.loadUserList();
        
        // 初始化用户搜索结果区域
        const searchResult = document.getElementById('searchResult');
        if (searchResult) {
            searchResult.style.display = 'none';
        }
        
        // 绑定用户管理相关事件
        this.bindUserManagementEvents();
    },
    
    // 绑定用户管理相关事件 - 使用事件委托
    bindUserManagementEvents: function() {
        // 用户管理容器
        const userManagement = document.getElementById('users');
        if (!userManagement) return;
        
        // 使用事件委托处理所有用户管理相关事件
        userManagement.addEventListener('click', (e) => {
            const target = e.target;
            
            // 搜索按钮
            if (target.id === 'userSearchBtn' || target.closest('#userSearchBtn')) {
                this.searchUser();
                return;
            }
            
            // 刷新用户列表按钮
            if (target.id === 'refreshUserList' || target.closest('#refreshUserList')) {
                this.loadUserList();
                return;
            }
        });
        
        // 搜索输入框回车事件
        const searchInput = document.getElementById('userSearchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchUser();
                }
            });
        }
        
        // 用户筛选事件
        const filterSelect = document.querySelector('.filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', this.filterUsers.bind(this));
        }
    },
    
    // 加载用户列表
    loadUserList: function() {
        fetch('http://localhost:8082/user/list')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('获取用户列表失败');
                }
            })
            .then(users => {
                this.renderUserList(users);
                // 隐藏之前的加载提示
                this.hideNotification();
            })
            .catch(error => {
                console.error('加载用户列表出错:', error);
                this.showNotification('加载用户列表出错，请稍后再试', 'error');
            });
    },
    
    // 渲染用户列表
    renderUserList: function(users) {
        const tableBody = document.querySelector('.user-table tbody');
        if (!tableBody) return;
        
        // 清空现有内容
        tableBody.innerHTML = '';
        
        // 获取当前筛选条件
        const filterSelect = document.querySelector('.filter-select');
        const filterValue = filterSelect ? filterSelect.value : '所有用户';
        
        // 筛选用户 - 不显示管理员用户
        let filteredUsers = users.filter(user => user.userType !== 1); // 排除管理员用户
        
        // 根据筛选条件进一步筛选
        if (filterValue === '商家') {
            filteredUsers = filteredUsers.filter(user => user.userType === 2);
        } else if (filterValue === '顾客') {
            filteredUsers = filteredUsers.filter(user => user.userType === 0);
        }
        
        // 渲染用户行
        filteredUsers.forEach((user, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-username', user.userName);
            
            // 用户类型文本映射
            const userTypeText = user.userType === 0 ? '顾客' : 
                            user.userType === 2 ? '商家' : '未知';
            
            // 格式化登录时间
            const loginTime = user.loginTime ? this.formatDateTime(user.loginTime) : '未登录';
            
            // 设置行内容 - 使用与搜索结果一致的按钮样式
            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="user-avatar-cell">
                    <div class="user-avatar-small">
                        <i class="bi bi-person"></i>
                    </div>
                </td>
                <td>${user.userName || '未设置'}</td>
                <td>${user.userPhone || '未设置'}</td>
                <td>
                    <span class="user-role-badge ${userTypeText === '商家' ? 'merchant' : 'customer'}">
                        ${userTypeText}
                    </span>
                </td>
                <td>${loginTime}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning" data-username="${user.userName}" data-role="${user.userType === 0 ? '2' : '0'}">
                            <i class="bi bi-check-circle"></i> 修改为${user.userType === 0 ? '商家' : '顾客'}
                        </button>
                        <button class="btn btn-danger" data-username="${user.userName}">
                            <i class="bi bi-trash"></i> 删除用户
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // 直接在这里绑定按钮事件，而不是调用bindUserRowEvents
        this.bindUserTableEvents();
    },
    
    // 修改用户表格中的所有按钮事件
    bindUserTableEvents: function() {
        const tableBody = document.querySelector('.user-table tbody');
        if (!tableBody) return;
        
        // 修改角色按钮
        const roleButtons = tableBody.querySelectorAll('.btn-warning');
        roleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const userName = e.currentTarget.getAttribute('data-username');
                const newRole = e.currentTarget.getAttribute('data-role');
                const newRoleText = newRole === '2' ? '商家' : '顾客';
                
                if (userName && newRole) {
                    // 使用自定义弹窗替代原生confirm
                    const dialog = document.getElementById('customDialog');
                    if (!dialog) {
                        // 如果自定义弹窗不可用，回退到原生confirm
                        if (confirm(`确定要将用户 ${userName} 的角色修改为${newRoleText}吗？`)) {
                            this.updateUserRole(userName, newRole);
                        }
                    } else {
                        // 使用自定义弹窗
                        this.showCustomConfirm(
                            `确定要将用户 ${userName} 的角色修改为${newRoleText}吗？`,
                            '修改用户角色',
                            (confirmed) => {
                                if (confirmed) {
                                    this.updateUserRole(userName, newRole);
                                }
                            }
                        );
                    }
                }
            });
        });
        
        // 删除用户按钮
        const deleteButtons = tableBody.querySelectorAll('.btn-danger');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const userName = e.currentTarget.getAttribute('data-username');
                
                if (userName) {
                    // 使用自定义弹窗替代原生confirm
                    const dialog = document.getElementById('customDialog');
                    if (!dialog) {
                        // 如果自定义弹窗不可用，回退到原生confirm
                        if (confirm(`确定要删除用户 ${userName} 吗？`)) {
                            this.deleteUser(userName);
                        }
                    } else {
                        // 使用自定义弹窗
                        this.showCustomConfirm(
                            `确定要删除用户 ${userName} 吗？`,
                            '删除用户确认',
                            (confirmed) => {
                                if (confirmed) {
                                    this.deleteUser(userName);
                                }
                            }
                        );
                    }
                }
            });
        });
    },
    // 搜索用户
    searchUser: function() {
        const searchInput = document.getElementById('userSearchInput');
        if (!searchInput) return;
        
        const userName = searchInput.value.trim();
        if (!userName) {
            this.showNotification('请输入用户名进行搜索', 'info');
            return;
        }
        
        this.apiRequest(`http://localhost:8082/user/admin/search/${userName}`)
            .then(user => {
                // 检查返回的数据是否为空
                if (!user || Object.keys(user).length === 0) {
                    throw new Error('未找到该用户');
                }
                
                // 不显示管理员用户
                if (user.userType === 1) {
                    throw new Error('无权查看管理员信息');
                }
                this.renderSearchResult(user);
                this.showNotification('搜索成功', 'success');
            })
            .catch(error => {
                // 隐藏搜索结果区域
                const searchResult = document.getElementById('searchResult');
                if (searchResult) {
                    searchResult.style.display = 'none';
                }
            });
    },
    
    // 渲染搜索结果
    renderSearchResult: function(user) {
        const searchResult = document.getElementById('searchResult');
        if (!searchResult) return;
        
        // 用户类型文本映射
        const userTypeText = user.userType === 0 ? '顾客' : 
                    user.userType === 2 ? '商家' : '未知';
        
        // 格式化登录时间
        const loginTime = user.loginTime ? this.formatDateTime(user.loginTime) : '未登录';
        
        // 设置搜索结果内容 - 使用更清晰的格式
        searchResult.innerHTML = `
            <div class="user-card" data-username="${user.userName}">
                <div class="user-avatar">
                    <i class="bi bi-person"></i>
                </div>
                <div class="user-card-info">
                    <h4 class="user-card-name">用户名：${user.userName}</h4>
                    <span class="user-role-badge ${userTypeText === '商家' ? 'merchant' : 'customer'}">
                        ${userTypeText}
                    </span>
                    <p class="user-card-contact">联系方式：${user.userPhone || '未设置联系方式'}</p>
                    <p class="user-card-login-time">最近登录时间：${loginTime}</p>
                </div>
                <div class="user-card-actions">
                    <button class="btn btn-warning" data-username="${user.userName}" data-role="${user.userType === 0 ? '2' : '0'}">
                        <i class="bi bi-check-circle"></i> 修改为${user.userType === 0 ? '商家' : '顾客'}
                    </button>
                    <button class="btn btn-danger" data-username="${user.userName}">
                        <i class="bi bi-trash"></i> 删除用户
                    </button>
                </div>
            </div>
        `;
        
        // 显示搜索结果区域
        searchResult.style.display = 'block';
        
        // 绑定搜索结果中的按钮事件
        const saveRoleBtn = searchResult.querySelector('.btn-warning');
        if (saveRoleBtn) {
            saveRoleBtn.addEventListener('click', (e) => {
                const userName = e.currentTarget.getAttribute('data-username');
                const newRole = e.currentTarget.getAttribute('data-role');
                const newRoleText = newRole === '2' ? '商家' : '顾客';
                
                if (userName && newRole) {
                    // 使用自定义弹窗替代原生confirm
                    const dialog = document.getElementById('customDialog');
                    if (!dialog) {
                        // 如果自定义弹窗不可用，回退到原生confirm
                        if (confirm(`确定要将用户 ${userName} 的角色修改为${newRoleText}吗？`)) {
                            this.updateUserRole(userName, newRole);
                        }
                    } else {
                        // 使用自定义弹窗
                        this.showCustomConfirm(
                            `确定要将用户 ${userName} 的角色修改为${newRoleText}吗？`,
                            '修改用户角色',
                            (confirmed) => {
                                if (confirmed) {
                                    this.updateUserRole(userName, newRole);
                                }
                            }
                        );
                    }
                }
            });
        }
        
        const deleteUserBtn = searchResult.querySelector('.btn-danger');
        if (deleteUserBtn) {
            deleteUserBtn.addEventListener('click', (e) => {
                const userName = e.currentTarget.getAttribute('data-username');
                
                if (userName) {
                    // 使用自定义弹窗替代原生confirm
                    const dialog = document.getElementById('customDialog');
                    if (!dialog) {
                        // 如果自定义弹窗不可用，回退到原生confirm
                        if (confirm(`确定要删除用户 ${userName} 吗？`)) {
                            this.deleteUser(userName);
                        }
                    } else {
                        // 使用自定义弹窗
                        this.showCustomConfirm(
                            `确定要删除用户 ${userName} 吗？`,
                            '删除用户确认',
                            (confirmed) => {
                                if (confirmed) {
                                    this.deleteUser(userName);
                                }
                            }
                        );
                    }
                }
            });
        }
    },
    
    // 更新用户角色
    updateUserRole: function(userName, newRole) {
        this.apiRequest(`http://localhost:8082/user/admin/updateRole/${userName}?newRole=${newRole}`, 'PUT')
            .then(data => {
                this.showNotification(data.message || '用户角色已更新', 'success');
                
                // 重新加载用户列表
                this.loadUserList();
                
                // 清空搜索结果
                const searchResult = document.getElementById('searchResult');
                if (searchResult) {
                    searchResult.style.display = 'none';
                }
            });
    },
    
    // 删除用户
    deleteUser: function(userName) {
        this.apiRequest(`http://localhost:8082/user/admin/delete/${userName}`, 'DELETE')
            .then(data => {
                this.showNotification(data.message || '用户已删除', 'success');
                
                // 重新加载用户列表
                this.loadUserList();
                
                // 清空搜索结果
                const searchResult = document.getElementById('searchResult');
                if (searchResult) {
                    searchResult.style.display = 'none';
                }
            });
    },
    
    // 筛选用户
    filterUsers: function() {
        // 显示加载状态
        this.showNotification('正在筛选用户...', 'info');
        
        // 重新加载用户列表，筛选会在renderUserList中处理
        this.loadUserList();
    },
    
    // 格式化日期时间
    formatDateTime: function(dateTimeStr) {
        if (!dateTimeStr) return '未登录';
        
        try {
            const date = new Date(dateTimeStr);
            if (isNaN(date.getTime())) {
                // 如果日期无效，尝试其他格式
                return dateTimeStr;
            }
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        } catch (e) {
            console.error('日期格式化错误:', e);
            return dateTimeStr;
        }
    },
    
    // 初始化商品管理
    initProductManagement: function() {
        // 初始化时加载商品列表
        this.loadProductList();
        
        // 初始化商品搜索结果区域
        const searchResult = document.getElementById('productSearchResult');
        if (searchResult) {
            searchResult.style.display = 'none';
        }
        
        // 绑定商品管理相关事件
        this.bindProductManagementEvents();
    },

    // 绑定商品管理相关事件
    bindProductManagementEvents: function() {
        console.log('绑定商品管理相关事件');
        
        // 搜索按钮事件绑定
        const searchBtn = document.getElementById('productSearchBtn');
        const searchInput = document.getElementById('productSearchInput');

        if (searchBtn && searchInput) {
            // 点击搜索按钮触发搜索
            searchBtn.addEventListener('click', () => this.searchProduct());
            
            // 回车键触发搜索
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchProduct();
                }
            });
        }

        
        // 刷新按钮
        const refreshBtn = document.getElementById('refreshProductList');
        if (refreshBtn) {
            // 修改这里：使用箭头函数或者保存this的引用
            refreshBtn.addEventListener('click', () => this.loadProductList());
        } else {
            console.error('未找到刷新商品列表按钮');
        }
        
        // 添加商品按钮
        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) {
            console.log('找到添加商品按钮，绑定事件');
            addBtn.addEventListener('click', () => {
                console.log('点击了添加商品按钮');
                this.showAddProductModal();
            });
        } else {
            console.error('未找到添加商品按钮');
        }
        
        // 保存商品按钮
        const saveBtn = document.getElementById('saveProductBtn');
        if (saveBtn) {
            console.log('找到保存商品按钮，绑定事件');
            saveBtn.addEventListener('click', () => {
                console.log('点击了保存商品按钮');
                this.saveProduct();
            });
        } else {
            console.error('未找到保存商品按钮');
        }
        
        // 确认库存调整按钮
        const confirmStockBtn = document.getElementById('confirmStockBtn');
        if (confirmStockBtn) {
            confirmStockBtn.addEventListener('click', () => this.confirmStockAdjustment());
        }
        
        // 文件选择事件 - 显示文件名
        const fileInput = document.getElementById('productImage');
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                const fileName = this.files[0] ? this.files[0].name : '未选择文件';
                document.getElementById('file-name').textContent = fileName;
            });
        } else {
            console.error('未找到文件选择输入框');
        }
    },

    // 加载商品列表
    loadProductList: function() {
        // 显示加载状态
        this.showNotification('正在加载商品列表...', 'info');
        
        // 使用apiRequest方法替代axios
        this.apiRequest('http://localhost:8084/goods/list')
            .then(goodsList => {
                this.renderProductList(goodsList);
                this.showNotification('商品列表加载完成', 'success');
            })

    },
    // 修改renderProductList方法以更新操作按钮
    // 修改渲染商品列表方法
    renderProductList: function(products) {
        const tableBody = document.querySelector('#productTable tbody');
        if (!tableBody) return;
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 如果没有商品，显示空状态
        if (products.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="9" class="text-center">暂无商品数据</td>
            `;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // 商品类型映射 - 与goods.js保持一致
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
        
        // 品牌映射 - 与goods.js保持一致
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
        
        // 渲染每个商品行
        products.forEach((product, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', product.goodsId);
            
            // 格式化价格显示
            const formattedPrice = product.goodsPrice;
            
            // 获取商品类型和品牌名称
            const typeName = goodsTypes[product.goodsType] || '未知类型(' + product.goodsType + ')';
            const brandName = brandTypes[product.goodsBrand] || '未知品牌(' + product.goodsBrand + ')';
            
            // 构建图片URL
            const imageUrl = "http://localhost:8084/goods/images/" + product.goodsImage;

            // 格式化上架时间 - 使用timeStamp字段
            const uploadTime = this.formatDateTime(product.timeStamp);
            
            // 修改操作按钮
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div class="product-image-small">
                        <img src="${imageUrl}" alt="${product.goodsName}" onerror="this.src='/img/default.png'">
                    </div>
                </td>
                <td>${product.goodsName}</td>
                <td>${typeName}</td>
                <td>${brandName}</td>
                <td>¥${formattedPrice}</td>
                <td>${product.stock || 0}</td>
                <td>${uploadTime}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-success btn-sm" onclick="App.adjustStock('${product.goodsId}', 1)">
                            <i class="bi bi-plus-circle"></i> 增加库存
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="App.adjustStock('${product.goodsId}', -1)">
                            <i class="bi bi-dash-circle"></i> 减少库存
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="App.deleteProduct('${product.goodsId}')">
                            <i class="bi bi-trash"></i> 删除商品
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // 绑定商品行操作按钮事件
        this.bindProductRowEvents();
    },

    // 修改绑定商品行操作按钮事件
    bindProductRowEvents: function() {
        // 调整库存按钮
        const adjustButtons = document.querySelectorAll('.btn-adjust-stock');
        adjustButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                const currentStock = e.currentTarget.getAttribute('data-stock');
                this.showStockAdjustmentModal(productId, currentStock);
            });
        });
        
        // 删除商品按钮
        const deleteButtons = document.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                this.deleteProduct(productId);
            });
        });
    },
    
    // 修改显示库存调整模态框方法
    showStockAdjustmentModal: function(productId, currentStock) {
        // 保存当前商品ID
        this.currentProductId = productId;
        
        // 获取模态框元素
        const modalElement = document.getElementById('stockModal');
        if (!modalElement) {
            console.error('未找到库存调整模态框');
            return;
        }

        // 设置当前库存显示
        const currentStockElement = document.getElementById('currentStock');
        if (currentStockElement) {
            currentStockElement.textContent = currentStock;
        }
        
        // 重置调整数量输入框
        const adjustmentInput = document.getElementById('stockAdjustment');
        if (adjustmentInput) {
            adjustmentInput.value = '';
        }
        
        // 显示模态框
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
        document.body.classList.add('modal-open');
        
        // 添加背景遮罩
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
    },
    
    // 修改关闭模态框方法
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // 隐藏模态框
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        // 移除背景遮罩
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.parentNode.removeChild(backdrop);
        }
        
        // 清理当前商品ID
        if (modalId === 'stockModal') {
            this.currentProductId = null;
        }
    },

    // 修改商品搜索方法
    searchProduct: function() {
        const searchInput = document.getElementById('productSearchInput');
        if (!searchInput) {
            console.error('未找到商品搜索输入框');
            return;
        }

        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            this.showNotification('请输入商品名称进行搜索', 'info');
            return;
        }

        // 显示加载状态
        this.showNotification('正在搜索商品...', 'info');

        // 使用 query 接口进行搜索
        fetch('http://localhost:8084/goods/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                goodsName: searchTerm
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('搜索失败');
            }
            return response.json();
        })
        .then(product => {
            if (!product || !product.goodsId) {
                this.showNotification('未找到相关商品', 'info');
                const tableBody = document.querySelector('#productTable tbody');
                if (tableBody) {
                    tableBody.innerHTML = '<tr><td colspan="9" class="text-center">未找到相关商品</td></tr>';
                }
            } else {
                // 将单个商品包装成数组传给渲染方法
                this.renderProductList([product]);
                this.showNotification('搜索完成', 'success');
            }
        })
        .catch(error => {
            console.error('搜索商品时出错:', error);
            this.showNotification(error.message || '搜索失败，请稍后重试', 'error');
        });
    },
            
    // 修改库存调整方法
    adjustStock: function(goodsId, adjustment) {
        if (!goodsId) return;
        
        // 获取当前库存
        const stockElement = document.querySelector(`tr[data-id="${goodsId}"] td:nth-child(7)`);
        const currentStock = parseInt(stockElement.textContent);
        
        // 直接使用adjustment作为调整量，而不是计算新的库存值
        if (currentStock + adjustment < 0) {
            this.showNotification('库存不能小于0', 'error');
            return;
        }
        
        // 发送请求到后端API
        fetch('http://localhost:8084/goods/updateStock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                goodsId: goodsId,
                quantity: adjustment  // 直接发送调整量，而不是新的库存值
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('库存调整失败');
            }
            // 尝试解析JSON，如果失败则作为文本处理
            return response.text().then(text => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    // 如果不是JSON，直接返回文本
                    return { message: text, success: response.ok };
                }
            });
        })
        .then(result => {
            // 更新成功后重新加载商品列表，而不是直接修改DOM
            this.showNotification(result.message || '库存调整成功', 'success');
            this.loadProductList();
        })
        .catch(error => {
            this.showNotification(error.message || '库存调整失败', 'error');
            console.error('调整库存时出错:', error);
        });
    },
    
    // 删除商品方法
    deleteProduct: function(productId) {
        if (!productId) return;
        
        // 首先获取商品名称
        const productRow = document.querySelector(`tr[data-id="${productId}"]`);
        if (!productRow) {
            console.error('未找到商品行元素');
            return;
        }
        
        const productName = productRow.querySelector('td:nth-child(3)').textContent;
        if (!productName) {
            console.error('未找到商品名称');
            return;
        }
        
        // 检查自定义弹窗是否可用
        const dialog = document.getElementById('customDialog');
        if (!dialog) {
            // 如果自定义弹窗不可用，回退到原生confirm
            if (!confirm(`确定要下架商品"${productName}"吗？此操作不可恢复！`)) {
                return;
            }
            
            // 显示加载状态
            this.showNotification(`正在下架商品...`, 'info');
            
            // 使用fetch发送删除请求
            fetch(`http://localhost:8084/goods/delete/${productName}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(text || '商品下架失败');
                    });
                }
                this.showNotification(`商品下架成功`, 'success');
                this.loadProductList();
            })
            .catch(error => {
                console.error('商品下架失败:', error);
                this.showNotification(error.message || '商品下架失败，请稍后重试', 'error');
            });
            
            return;
        }
        
        // 使用自定义确认对话框
        this.showCustomConfirm(
            `确定要下架商品"${productName}"吗？此操作不可恢复！`,
            `商品下架确认`,
            (confirmed) => {
                if (confirmed) {
                    // 显示加载状态
                    this.showNotification(`正在下架商品...`, 'info');
                    
                    // 使用fetch发送删除请求
                    fetch(`http://localhost:8084/goods/delete/${productName}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => {
                                throw new Error(text || '商品下架失败');
                            });
                        }
                        this.showNotification(`商品下架成功`, 'success');
                        this.loadProductList();
                    })
                    .catch(error => {
                        console.error('商品下架失败:', error);
                        this.showNotification(error.message || '商品下架失败，请稍后重试', 'error');
                    });
                }
            }
        );
    },
    
    // 在 App 对象中添加 showAddProductModal 方法
    // 显示添加商品模态框
    showAddProductModal: function() {
        console.log('显示添加商品模态框');
        const modal = document.getElementById('addProductModal');
        if (!modal) {
            console.error('添加商品模态框不存在，请检查HTML中是否包含id为addProductModal的元素');
            this.showNotification('添加商品模态框不存在', 'error');
            return;
        }
        
        // 重置表单
        const form = document.getElementById('addProductForm');
        if (form) {
            form.reset();
        }
        
        // 重置文件名显示
        const fileNameDisplay = document.getElementById('file-name');
        if (fileNameDisplay) {
            fileNameDisplay.textContent = '未选择文件';
        }
        
        // 先移除可能存在的旧背景
        const existingBackdrops = document.querySelectorAll('.modal-backdrop');
        existingBackdrops.forEach(backdrop => {
            backdrop.parentNode.removeChild(backdrop);
        });
        
        // 显示模态框
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        
        // 添加模态框背景
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
    },
    
    // 保存新商品
    saveProduct: function() {
        console.log('保存商品');
        const form = document.getElementById('addProductForm');
        if (!form) {
            console.error('未找到添加商品表单');
            return;
        }
        
        // 获取表单数据
        const formData = new FormData(form);
        
        // 验证必填字段
        const productName = formData.get('productName');
        const productType = formData.get('productType');
        const productBrand = formData.get('productBrand');
        const productPrice = formData.get('productPrice');
        const productStock = formData.get('productStock');
        const file = formData.get('productImage');
        
        console.log('表单数据:', {
            productName,
            productType,
            productBrand,
            productPrice,
            productStock,
            file: file ? file.name : null
        });
        
        if (!productName || !productType || !productBrand || !productPrice || !productStock) {
            this.showNotification('请填写所有必填字段', 'error');
            return;
        }
        
        if (!file || file.size === 0) {
            this.showNotification('请选择商品图片', 'error');
            return;
        }
        
        // 验证品牌格式 - 确保是单个字符a-f或A-F
        if (!/^[a-fA-F]$/.test(productBrand)) {
            this.showNotification('品牌格式不正确，请使用a-f或A-F的单个字符', 'error');
            return;
        }
        
        // 验证价格和库存是否为有效数字
        if (isNaN(parseFloat(productPrice)) || parseFloat(productPrice) <= 0) {
            this.showNotification('请输入有效的商品价格', 'error');
            return;
        }
        
        if (isNaN(parseInt(productStock)) || parseInt(productStock) < 0) {
            this.showNotification('请输入有效的商品库存', 'error');
            return;
        }
        
        // 显示加载状态
        this.showNotification('正在上传商品信息...', 'info');
        
        // 重命名表单字段以匹配后端API
        const apiFormData = new FormData();
        apiFormData.append('goodsName', productName);
        apiFormData.append('goodsPrice', parseFloat(productPrice)); // 确保价格是数字
        apiFormData.append('goodsStock', parseInt(productStock));   // 确保库存是整数
        apiFormData.append('goodsType', parseInt(productType));     // 确保商品类型是整数
        apiFormData.append('goodsBrand', productBrand);             // 品牌保持原样
        apiFormData.append('file', file);
        
        console.log('发送的商品数据:', {
            goodsName: productName,
            goodsPrice: parseFloat(productPrice),
            goodsStock: parseInt(productStock),
            goodsType: parseInt(productType),
            goodsBrand: productBrand,
            file: file.name
        });
        
        // 发送请求到正确的API端点
        fetch('http://localhost:8084/goods/create', {
            method: 'POST',
            body: apiFormData,
            // 不设置Content-Type，让浏览器自动设置为multipart/form-data
        })
        .then(response => {
            console.log('响应状态:', response.status);
            // 无论成功与否，都尝试读取响应内容
            return response.text().then(text => {
                if (!response.ok) {
                    throw new Error('上传商品失败: ' + (text || response.status));
                }
                return text;
            });
        })
        .then(data => {
            console.log('商品上传响应:', data);
            this.showNotification(data || '商品上传成功', 'success');
            
            // 关闭模态框
            this.closeModal('addProductModal');
            
            // 重新加载商品列表
            this.loadProductList();
        })

    },
    
    // 修改apiRequest方法以处理CORS问题
    apiRequest: function(url, method = 'GET', data = null) {
        // 显示加载状态
        this.showNotification('正在处理请求...', 'info');
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors', // 添加CORS模式
            credentials: 'include' // 包含凭证
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        return fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`该用户不存在`);
                }
                return response.json();
            })

    },
    
};