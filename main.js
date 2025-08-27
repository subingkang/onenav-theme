/**
 * Modern主题JavaScript文件
 * 作者: subk
 * 包含页面交互功能的实现
 */
document.addEventListener('DOMContentLoaded', function () {
    // --- 缓存常用 DOM 元素 ---
    const categoryButtons = document.querySelectorAll('.category-btn');
    const categoryGroups = document.querySelectorAll('.category-group');
    const searchBar = document.getElementById('search');
    const searchResultsContainer = document.getElementById('search-results');
    const searchResultsList = document.getElementById('search-results-list');
    const resultCountSpan = document.getElementById('result-count');
    const fixedHeader = document.querySelector('.fixed-header');
    const allButton = document.querySelector('.category-btn[data-target="all"]');

    // --- 动态计算并更新 body padding-top ---
    let headerOffsetHeight = 0;
    function updateBodyPaddingTop() {
        if (fixedHeader) {
            // 获取固定头部的实际高度
            headerOffsetHeight = fixedHeader.offsetHeight;
            // 更新 body 的 padding-top
            document.body.style.paddingTop = headerOffsetHeight + 'px';
        }
    }
    
    // 初始化时计算一次
    updateBodyPaddingTop();
    
    // 窗口大小改变时重新计算（处理移动端横屏切换、分类按钮换行等情况）
    window.addEventListener('resize', function() {
        // 使用 setTimeout 确保 DOM 重排完成后再计算
        setTimeout(updateBodyPaddingTop, 100);
    });
    
    // 监听固定头部高度变化（使用 ResizeObserver 更精确）
    if (window.ResizeObserver && fixedHeader) {
        const headerResizeObserver = new ResizeObserver(function(entries) {
            for (let entry of entries) {
                // 当固定头部高度变化时，更新 body padding
                headerOffsetHeight = entry.contentRect.height;
                document.body.style.paddingTop = headerOffsetHeight + 'px';
            }
        });
        headerResizeObserver.observe(fixedHeader);
    }

    /**
     * 激活对应分类按钮
     * @param {string} [targetHash] - 可选的目标锚点 (例如 "#category-52")
     */
    function activateCategoryButton(targetHash) {
        // 移除所有按钮的激活状态
        categoryButtons.forEach(btn => btn.classList.remove('active'));

        let targetButton = null;
        if (targetHash) {
            // 根据锚点查找并激活按钮
            targetButton = document.querySelector(`.category-btn[href="${targetHash}"]`);
        } else {
            // 默认激活 "全部" 按钮
            targetButton = document.querySelector('.category-btn[data-target="all"]');
        }

        if (targetButton) {
            targetButton.classList.add('active');
        } else {
            // 如果找不到对应按钮，激活 "全部"
            document.querySelector('.category-btn[data-target="all"]')?.classList.add('active');
        }
    }

    // --- 初始化分类按钮激活状态 ---
    activateCategoryButton(window.location.hash);

    // --- 监听锚点变化 (点击分类按钮或浏览器前进/后退) ---
    window.addEventListener('hashchange', function () {
        activateCategoryButton(window.location.hash);
        // 平滑滚动到目标元素，考虑固定头部偏移
        if (window.location.hash) {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                const targetTop = targetElement.offsetTop - headerOffsetHeight;
                window.scrollTo({ top: targetTop, behavior: 'smooth' });
            }
        }
    });

    // --- "全部" 按钮点击事件 ---
    if (allButton) {
        allButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.hash = '';
            activateCategoryButton();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 滚动监听，实现智能激活分类按钮 ---
    let ticking = false; // 节流标志，防止滚动事件过于频繁

    function updateCategoryOnScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                let currentActiveGroupId = 'all';

                for (let i = 0; i < categoryGroups.length; i++) {
                    const group = categoryGroups[i];
                    const rect = group.getBoundingClientRect();
                    if (rect.top <= headerOffsetHeight + 10) {
                        currentActiveGroupId = group.id.replace('category-', '');
                    } else {
                        break;
                    }
                }

                categoryButtons.forEach(btn => btn.classList.remove('active'));
                
                let buttonToActivate;
                if (currentActiveGroupId === 'all') {
                    buttonToActivate = document.querySelector('.category-btn[data-target="all"]');
                } else {
                    buttonToActivate = document.querySelector(`.category-btn[href="#category-${currentActiveGroupId}"]`);
                }
                
                if (buttonToActivate) {
                    buttonToActivate.classList.add('active');
                } else {
                    document.querySelector('.category-btn[data-target="all"]')?.classList.add('active');
                }
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', updateCategoryOnScroll, { passive: true });

    // --- 搜索功能 ---
    if (searchBar) {
        const mainContent = document.querySelector('.main-content');
        const pageWrapper = document.querySelector('.page-wrapper');
        
        const handleSearch = function () {
            const keyword = searchBar.value.trim().toLowerCase();

            if (keyword.length > 0) {
                // 清空旧结果
                searchResultsList.innerHTML = '';

                const websiteItems = document.querySelectorAll('.website-item');
                let matchCount = 0;

                websiteItems.forEach(item => {
                    const title = item.dataset.title?.toLowerCase() || '';
                    const description = item.dataset.desc?.toLowerCase() || '';

                    if (title.includes(keyword) || description.includes(keyword)) {
                        const clonedItem = item.cloneNode(true);
                        searchResultsList.appendChild(clonedItem);
                        matchCount++;
                    }
                });

                if (resultCountSpan) {
                    resultCountSpan.textContent = matchCount;
                }

                // 进入搜索模式
                if (mainContent) {
                    mainContent.classList.add('search-mode');
                }
                
                // 关键修复：确保page-wrapper在搜索模式下高度正确
                if (pageWrapper) {
                    pageWrapper.style.minHeight = 'calc(100vh - ' + headerOffsetHeight + 'px)';
                }
                
                // 显示搜索结果容器，隐藏分类内容
                if (searchResultsContainer) {
                    searchResultsContainer.style.display = 'block';
                    searchResultsContainer.style.height = 'auto';
                }
                document.querySelectorAll('.category-group').forEach(group => {
                    group.style.display = 'none';
                });

                // 滚动到搜索结果顶部
                const searchTop = searchResultsContainer.offsetTop - headerOffsetHeight;
                window.scrollTo({ top: searchTop, behavior: 'smooth' });
            } else {
                // 退出搜索模式
                if (mainContent) {
                    mainContent.classList.remove('search-mode');
                }
                
                // 恢复page-wrapper的原始最小高度设置
                if (pageWrapper) {
                    pageWrapper.style.minHeight = '';
                }
                
                // 关键词为空，隐藏搜索结果，显示分类内容
                if (searchResultsContainer) {
                    searchResultsContainer.style.display = 'none';
                    searchResultsContainer.style.height = 'auto';
                }
                document.querySelectorAll('.category-group').forEach(group => {
                    group.style.display = 'block';
                });
                if (searchResultsList) {
                    searchResultsList.innerHTML = '';
                }
                if (resultCountSpan) {
                    resultCountSpan.textContent = '0';
                }
            }
        };

        // 输入实时搜索
        searchBar.addEventListener('input', handleSearch);

        // 回车键搜索
        searchBar.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }
});