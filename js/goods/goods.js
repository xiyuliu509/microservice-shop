document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.container');

    function loadGoods() {
        axios.get('http://localhost:8084/goods/list')
            .then(response => {
                container.innerHTML = ''; // 清空容器
                const goodsList = response.data;
                goodsList.forEach(goods => {
                    const item = document.createElement('div');
                    item.className = 'goods-item';
                    item.innerHTML = `
                        <img src="//images/3.jpg" alt="${goods.goodsName}">
                        <h2>${goods.goodsName}</h2>
                        <p>价格: $${goods.goodsPrice}</p>
                        <p>上架日期: ${goods.timeStamp}</p>
                    `;
                    container.appendChild(item);
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    loadGoods();

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

    const modal = document.getElementById('myModal');
    const createButton = document.getElementById('createButton');
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');
    const modalError = document.getElementById('modalError');

    createButton.addEventListener('click', function () {
        modal.style.display = 'flex';
        modalError.textContent = '';
    });

    confirmButton.addEventListener('click', function () {
        const goodsName = document.getElementById('goodsName').value.trim();
        const goodsPrice = document.getElementById('goodsPrice').value.trim();

        if (goodsName === '' || goodsPrice === '') {
            modalError.textContent = '请填写所有字段';
            return;
        }

        if (isNaN(goodsPrice) || goodsPrice <= 0) {
            modalError.textContent = '请输入有效的商品价格';
            return;
        }

        axios.post('http://localhost:8084/goods/create', {
            goodsName: goodsName,
            goodsPrice: parseFloat(goodsPrice)
        })
        .then(response => {
            modal.style.display = 'none';
            loadGoods(); // 重新加载商品列表
        })
        .catch(error => {
            console.error(error);
        });
    });

    cancelButton.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

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
});

