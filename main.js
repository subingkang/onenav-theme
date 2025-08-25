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
            activateCategoryButton(); // 激活 "全部" 按钮
            window.scrollTo({ top: 0, behavior: 'smooth' }); // 滚动到顶部
        });
    }

    // --- 滚动监听，实现智能激活分类按钮 ---
    let ticking = false; // 节流标志，防止滚动事件过于频繁

    function updateCategoryOnScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                // 只有在没有特定锚点时才根据滚动位置更新（避免与锚点跳转冲突）
                // 但为了实现滚动时始终激活对应按钮，我们去掉这个判断
                // if (!window.location.hash) {
                    let currentActiveGroupId = 'all'; // 默认为 "全部"

                    // 遍历所有分类组，找出当前视口最顶部的
                    for (let i = 0; i < categoryGroups.length; i++) {
                        const group = categoryGroups[i];
                        const rect = group.getBoundingClientRect();
                        // 判断元素顶部是否进入或穿过固定头部下方的判定区域
                        // 使用一个小的正值（例如 10px）作为缓冲区，更灵敏
                        if (rect.top <= headerOffsetHeight + 10) {
                            currentActiveGroupId = group.id.replace('category-', '');
                        } else {
                            // 一旦发现一个元素顶部在判定区域下方，后面的元素必然也在下方
                            // 所以可以停止循环
                            break;
                        }
                    }

                    // 移除所有按钮的激活状态
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // 激活对应的按钮
                    let buttonToActivate;
                    if (currentActiveGroupId === 'all') {
                        buttonToActivate = document.querySelector('.category-btn[data-target="all"]');
                    } else {
                        buttonToActivate = document.querySelector(`.category-btn[href="#category-${currentActiveGroupId}"]`);
                    }
                    
                    if (buttonToActivate) {
                        buttonToActivate.classList.add('active');
                    } else {
                        // Fallback: 如果找不到，激活 "全部"
                        document.querySelector('.category-btn[data-target="all"]')?.classList.add('active');
                    }
                // }
                ticking = false;
            });
            ticking = true;
        }
    }

    // 添加滚动事件监听器
    window.addEventListener('scroll', updateCategoryOnScroll, { passive: true });


    // --- 搜索功能 ---
    if (searchBar) {
        const handleSearch = function () {
            const keyword = searchBar.value.trim().toLowerCase();

            if (keyword.length > 0) {
                // --- 修复：每次搜索前先清空旧结果 ---
                searchResultsList.innerHTML = '';

                const websiteItems = document.querySelectorAll('.website-item');
                let matchCount = 0;

                websiteItems.forEach(item => {
                    const title = item.dataset.title?.toLowerCase() || '';
                    const description = item.dataset.desc?.toLowerCase() || '';

                    if (title.includes(keyword) || description.includes(keyword)) {
                        // --- 修复：克隆节点并添加到结果列表 ---
                        const clonedItem = item.cloneNode(true);
                        searchResultsList.appendChild(clonedItem);
                        matchCount++;
                    }
                });

                // 更新结果计数
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

            } else {
                // 关键词为空，隐藏搜索结果，显示分类内容
                if (searchResultsContainer) {
                    searchResultsContainer.style.display = 'none';
                }
                document.querySelectorAll('.category-group').forEach(group => {
                    group.style.display = 'block';
                });
                // 可选：清空搜索框内容和结果列表
                // searchBar.value = '';
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
                handleSearch(); // 调用搜索处理函数
            }
        });
    }

    // --- 处理锚点跳转后的初始滚动位置 ---
    // (这个逻辑也可以通过 CSS scroll-margin-top 更好地处理，但如果需要 JS 控制也可以保留)
    /*
    if (window.location.hash) {
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                const targetTop = targetElement.offsetTop - headerOffsetHeight;
                window.scrollTo({ top: targetTop, behavior: 'smooth' });
            }
        }, 100); // 稍微延迟以确保页面加载完成
    }
    */
});
