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

    // --- 计算固定头部高度，用于滚动偏移 ---
    let headerOffsetHeight = 0;
    function calculateHeaderHeight() {
        headerOffsetHeight = fixedHeader ? fixedHeader.offsetHeight : 0;
    }
    calculateHeaderHeight();
    window.addEventListener('resize', calculateHeaderHeight); // 窗口大小改变时重新计算

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

                // 显示搜索结果容器，隐藏分类内容
                if (searchResultsContainer) {
                    searchResultsContainer.style.display = 'block';
                }
                document.querySelectorAll('.category-group').forEach(group => {
                    group.style.display = 'none';
                });

                // 动态调整 search-results 高度并滚动到顶部
                const resultsHeight = searchResultsList.scrollHeight + 60; // 60px for header padding
                searchResultsContainer.style.height = `${resultsHeight}px`;
                const searchTop = searchResultsContainer.offsetTop - headerOffsetHeight;
                window.scrollTo({ top: searchTop, behavior: 'smooth' });
            } else {
                // 关键词为空，隐藏搜索结果，显示分类内容
                if (searchResultsContainer) {
                    searchResultsContainer.style.display = 'none';
                    searchResultsContainer.style.height = 'auto'; // 恢复默认高度
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