document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const dragHandle = document.getElementById('dragHandle');

    if (sidebar && dragHandle) {
        let isDragging = false;
        let initialX, initialY;
        let offsetX = 0;
        let offsetY = 0;

        dragHandle.addEventListener('mousedown', function(e) {
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
        if (toTopButton) {
            toTopButton.addEventListener('click', function() {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    } else {
        console.error('Sidebar or dragHandle not found in the DOM.');
    }
});
