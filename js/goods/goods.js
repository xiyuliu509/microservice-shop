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

        // 显示或隐藏相应的按钮
        if (isAdmin) {
            document.getElementById('adminContainer').style.display = 'block';
            document.getElementById('userContainer').style.display = 'none';
        } else {
            document.getElementById('adminContainer').style.display = 'none';
            document.getElementById('userContainer').style.display = 'block';
        }

        function loadGoods() {
            axios.get('http://localhost:8084/goods/list')
                .then(response => {
                    container.innerHTML = ''; // 清空容器
                    const goodsList = response.data;
                    goodsList.forEach(goods => {
                        const item = document.createElement('div');
                        item.className = 'goods-item';
                        item.innerHTML = `
                            <img src="/images/3.jpg" alt="${goods.goodsName}">
                            <h2>${goods.goodsName}</h2>
                            <p>价格: $${goods.goodsPrice}</p>
                            <p>库存: <span id="stock-${goods.goodsId}">${goods.stock}</span></p>
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
                })
                .catch(error => {
                    console.error('Error loading goods:', error);
                });
        }

        loadGoods();

        document.getElementById('orderButton').addEventListener('click', function() {
            createOrder(user.userId);
        });

        document.getElementById('searchButton').addEventListener('click', function () {
            const searchValue = document.getElementById('searchInput').value.toLowerCase().trim();
            const goodsItems = document.querySelectorAll('.goods-item');
            let found = false;

            if (searchValue === '') {
                alert('请输入内容');
                return;
            }

            goodsItems.forEach(item => {
                const goodsName = item.querySelector('h2').textContent.toLowerCase();
                if (goodsName.includes(searchValue)) {
                    item.classList.add('highlight');
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    found = true;
                } else {
                    item.classList.remove('highlight');
                }
            });

            if (!found) {
                alert('商品不存在');
            }
        });

        window.addToOrder = function(goodsId, goodsName, goodsPrice) {
            const quantity = parseInt(document.getElementById(`quantity-${goodsId}`).value, 10);
            if (isNaN(quantity) || quantity <= 0) {
                alert('数量无效，请重新输入');
                return;
            }

            const existingItem = orderItems.find(item => item.goodsId === goodsId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                orderItems.push({ goodsId, goodsName, goodsPrice, quantity });
            }
            alert(`已将${quantity}个${goodsName}添加到订单`);
        }

        window.createOrder = function(userId) {
            if (orderItems.length === 0) {
                alert('订单为空，请先添加商品');
                return;
            }

            const orderPrice = orderItems.reduce((total, item) => total + item.goodsPrice * item.quantity, 0);
            const orderGoodsList = orderItems.map(item => ({
                goodsId: item.goodsId,
                quantity: item.quantity
            }));

            axios.post('http://localhost:8083/order/create', {
                userId,
                orderState: '待付款',
                orderGoodsList,
                orderPrice
            })
            .then(response => {
                alert('订单创建成功！');
                orderItems.length = 0;  // 清空订单商品
                loadGoods(); // 重新加载商品列表，更新库存
            })
            .catch(error => {
                console.error('创建订单失败:', error);
                alert('创建订单失败，请重试');
            });
        }

        window.updateStock = function(goodsId, quantity) {
            const currentStock = parseInt(document.getElementById(`stock-${goodsId}`).textContent, 10);
            const newStock = currentStock + quantity;
            if (newStock < 0) {
                alert('库存不能为负数');
                return;
            }

            axios.post('http://localhost:8084/goods/updateStock', { goodsId, quantity })
                .then(response => {
                    document.getElementById(`stock-${goodsId}`).textContent = newStock;
                })
                .catch(error => {
                    console.error('更新库存失败:', error);
                    alert('更新库存失败，请重试');
                });
        }

        document.getElementById('createButton').addEventListener('click', function() {
            document.getElementById('myModal').style.display = 'flex';
        });

        document.getElementById('confirmButton').addEventListener('click', function() {
            const goodsName = document.getElementById('goodsName').value.trim();
            const goodsPrice = document.getElementById('goodsPrice').value.trim();
            const goodsStock = document.getElementById('goodsStock').value.trim();

            if (goodsName === '' || goodsPrice === '' || goodsStock === '') {
                document.getElementById('modalError').textContent = '请填写所有字段';
                return;
            }

            if (isNaN(goodsPrice) || goodsPrice <= 0) {
                document.getElementById('modalError').textContent = '请输入有效的商品价格';
                return;
            }

            if (isNaN(goodsStock) || goodsStock < 0) {
                document.getElementById('modalError').textContent = '请输入有效的商品库存';
                return;
            }

            axios.post('http://localhost:8084/goods/create', {
                goodsName: goodsName,
                goodsPrice: parseFloat(goodsPrice),
                stock: parseInt(goodsStock, 10)
            })
            .then(response => {
                document.getElementById('myModal').style.display = 'none';
                loadGoods();  // 重新加载商品列表
            })
            .catch(error => {
                document.getElementById('modalError').textContent = '创建商品失败，请检查输入数据或稍后再试。';
            });
        });

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
