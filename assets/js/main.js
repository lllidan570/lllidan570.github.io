// 项目过滤功能
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    if (!filterBtns.length || !projectItems.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有按钮的active类
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // 给当前点击的按钮添加active类
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            projectItems.forEach(item => {
                // 首先隐藏所有项目
                item.style.display = 'none';
                
                // 如果是"全部"或者分类匹配，则显示
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    // 添加渐入动画
                    setTimeout(() => {
                        item.style.opacity = 1;
                    }, 50);
                } else {
                    item.style.opacity = 0;
                }
            });
        });
    });
}

// 技能进度条动画
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    if (!progressBars.length) return;

    const animateProgressBar = (bar) => {
        const progress = bar.getAttribute('data-progress');
        bar.style.width = progress + '%';
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateProgressBar(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => {
        observer.observe(bar);
    });
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // 初始化项目过滤功能
    initProjectFilters();
    
    // 初始化技能进度条动画
    initProgressBars();
}); 