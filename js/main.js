// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Navigation and scroll handling
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.querySelector('.back-to-top');
    const themeToggle = document.querySelector('.theme-toggle');
    const hamburger = document.querySelector('.hamburger');
    const menuLinks = document.querySelector('.nav-links');
    const skillBars = document.querySelectorAll('.progress-bar');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            menuLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Close menu when clicking nav links on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (menuLinks.classList.contains('active')) {
                menuLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
    
    // Theme toggle functionality
    if (themeToggle) {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
            document.body.classList.add('dark-theme');
            updateThemeIcon('light');
        } else {
            updateThemeIcon('dark');
        }
        
        themeToggle.addEventListener('click', function() {
            if (document.body.classList.contains('dark-theme')) {
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
                updateThemeIcon('dark');
            } else {
                document.body.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                updateThemeIcon('light');
            }
        });
    }
    
    function updateThemeIcon(mode) {
        if (!themeToggle) return;
        themeToggle.innerHTML = mode === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
    
    // Scroll event handlers
    window.addEventListener('scroll', function() {
        // Navbar color change on scroll
        if (window.scrollY > 100) {
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.padding = '20px 0';
            navbar.style.boxShadow = 'none';
        }
        
        // Back to top button visibility
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
        
        // Animate skill progress bars when in view
        animateSkills();
        
        // Animate elements when they come into view
        animateOnScroll();
    });
    
    // Scroll to top when button is clicked
    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Projects filtering functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            projectItems.forEach(item => {
                if (filterValue === 'all') {
                    item.classList.remove('hide');
                } else if (!item.classList.contains(filterValue)) {
                    item.classList.add('hide');
                } else {
                    item.classList.remove('hide');
                }
                
                // Trigger animation
                setTimeout(() => {
                    item.classList.add('animated');
                }, 100);
            });
        });
    });
    
    // Animate progress bars when in viewport
    function animateSkills() {
        const skillBars = document.querySelectorAll('.progress-bar');
        
        skillBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            bar.style.width = '0';
            
            // 检查是否在视口内
            if (isElementInViewport(bar)) {
                setTimeout(() => {
                    bar.style.width = progress + '%';
                }, 200);
            }
        });
    }
    
    // Check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    // Animate elements when they come into view
    function animateOnScroll() {
        animatedElements.forEach(element => {
            if (isInViewport(element) && !element.classList.contains('animated')) {
                element.classList.add('animated');
            }
        });
    }
    
    // Initial animations
    setTimeout(() => {
        animateSkills();
        animateOnScroll();
    }, 1000);
    
    // Contact form validation
    const contactForm = document.querySelector('#contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            let isValid = true;
            
            if (!name.value.trim()) {
                showError(name, '请输入您的姓名');
                isValid = false;
            } else {
                removeError(name);
            }
            
            if (!email.value.trim()) {
                showError(email, '请输入您的邮箱');
                isValid = false;
            } else if (!isValidEmail(email.value)) {
                showError(email, '请输入有效的邮箱地址');
                isValid = false;
            } else {
                removeError(email);
            }
            
            if (!message.value.trim()) {
                showError(message, '请输入您的消息');
                isValid = false;
            } else {
                removeError(message);
            }
            
            if (isValid) {
                // Here you would normally send the form data to a server
                // For demonstration purposes, we'll show a success message
                contactForm.innerHTML = '<div class="success-message">您的消息已发送成功！我会尽快回复您。</div>';
            }
        });
    }
    
    function showError(input, message) {
        const formGroup = input.parentElement;
        formGroup.classList.add('error');
        
        let errorMessage = formGroup.querySelector('.error-message');
        
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            formGroup.appendChild(errorMessage);
        }
        
        errorMessage.textContent = message;
    }
    
    function removeError(input) {
        const formGroup = input.parentElement;
        formGroup.classList.remove('error');
        
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            formGroup.removeChild(errorMessage);
        }
    }
    
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // 项目过滤功能
    function initProjectFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const projectItems = document.querySelectorAll('.project-item');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有按钮的active类
                filterBtns.forEach(b => b.classList.remove('active'));
                // 添加当前按钮的active类
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                
                projectItems.forEach(item => {
                    if (filter === 'all' || item.classList.contains(filter)) {
                        item.classList.remove('hide');
                        
                        // 添加动画效果
                        setTimeout(() => {
                            item.classList.add('animated');
                        }, 100);
                    } else {
                        item.classList.add('hide');
                        item.classList.remove('animated');
                    }
                });
            });
        });
    }

    // 监听滚动事件，激活进度条动画
    window.addEventListener('scroll', () => {
        animateElements();
        animateSkills();
    });

    // 初始化导航栏
    initNavigation();
    
    // 初始化主题切换
    initThemeSwitch();
    
    // 初始化动画元素
    initAnimations();
    
    // 初始化技能进度条
    animateSkills();
    
    // 初始化项目过滤器
    initProjectFilters();
    
    // 返回顶部按钮
    initBackToTop();
    
    // 联系表单验证
    initContactForm();
}); 