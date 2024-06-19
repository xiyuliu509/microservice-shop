document.addEventListener('DOMContentLoaded', function () {
    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const date = new Date(dateString);
        return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString(undefined, options);
    }

    // Fetch orders and populate the table
    axios.get('http://localhost:8083/order/list')
        .then(response => {
            const orders = response.data;
            const orderTableBody = document.getElementById('orderTableBody');
            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.orderId}</td>
                    <td>
                        <select data-order-id="${order.orderId}">
                            <option value="待付款" ${order.orderState === '待付款' ? 'selected' : ''}>待付款</option>
                            <option value="已取消" ${order.orderState === '已取消' ? 'selected' : ''}>已取消</option>
                            <option value="待发货" ${order.orderState === '待发货' ? 'selected' : ''}>待发货</option>
                            <option value="待收货" ${order.orderState === '待收货' ? 'selected' : ''}>待收货</option>
                            <option value="订单完成" ${order.orderState === '订单完成' ? 'selected' : ''}>订单完成</option>                           
                        </select>
                    </td>
                    <td>$${order.orderPrice}</td>
                    <td>${formatDate(order.createStamp)}</td>
                    <td>
                        <button onclick="viewGoods(${order.orderId})">View Goods</button>
                    </td>
                `;
                orderTableBody.appendChild(row);
            });

            // Add event listeners for order state change
            document.querySelectorAll('select[data-order-id]').forEach(select => {
                select.addEventListener('change', function () {
                    const orderId = this.getAttribute('data-order-id');
                    const newState = this.value;
                    axios.post('http://localhost:8083/order/update', { orderId: parseInt(orderId), orderState: newState })
                        .then(response => {
                            alert('Order status updated successfully!');
                        })
                        .catch(error => {
                            console.error(error);
                            alert('Failed to update order status.');
                        });
                });
            });
        })
        .catch(error => {
            console.error(error);
        });
});

function viewGoods(orderId) {
    axios.get(`http://localhost:8083/order/findgoods/${orderId}`)
        .then(response => {
            const goods = response.data;
            if (goods) {
                alert(`Goods Name: ${goods.goodsName}\nPrice: $${goods.goodsPrice}\nAdded on: ${new Date(goods.timeStamp).toLocaleString()}`);
            } else {
                alert('No goods found for this order.');
            }
        })
        .catch(error => {
            console.error(error);
            alert('Failed to fetch goods.');
        });
}

const sidebar = document.getElementById('sidebar');
const dragHandle = document.getElementById('dragHandle');

let isDragging = false;
let initialX, initialY;
let offsetX = 0;
let offsetY = 0;

dragHandle.addEventListener('mousedown', function (e) {
    isDragging = true;
    initialX = e.clientX - offsetX;
    initialY = e.clientY - offsetY;
    document.addEventListener('mousemove', moveSidebar);
    document.addEventListener('mouseup', stopDragging);
});

function moveSidebar(e) {
    if (isDragging) {
        e.preventDefault();
        offsetX = e.clientX - initialX;
        offsetY = e.clientY - initialY;
        sidebar.style.right = `${-offsetX}px`;
        sidebar.style.bottom = `${-offsetY}px`;
    }
}

function stopDragging() {
    isDragging = false;
    document.removeEventListener('mousemove', moveSidebar);
    document.removeEventListener('mouseup', stopDragging);
}

const toTopButton = document.getElementById('toTopButton');
toTopButton.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
