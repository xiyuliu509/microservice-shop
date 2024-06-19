document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.userName;
        document.getElementById('userPhone').textContent = user.userPhone;
        document.getElementById('userWallet').textContent = user.userWallet;
    } else {
        alert('No user information found. Please login first.');
        window.location.href = '/html/user/login.html';
    }

    document.getElementById('logout').addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = '/html/user/login.html';
    });
});
