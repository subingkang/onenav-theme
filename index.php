<?php
/**
 * Modern主题 - 适配OneNav项目
 * 作者: subk
 * 版本: 1.0
 *
 * 这是主题的主入口文件，负责渲染整个导航页面
 * 使用了OneNav提供的内置变量和函数来获取网站信息和链接数据
 * 添加了 Unicode Emoji 支持
 */
// 获取主题路径
$template_path = '/templates/' . $template;
/**
 * 根据分类ID或名称关键词获取对应的 Emoji (供主内容区使用)
 * @param array $category OneNav 分类数组
 * @return string 对应的 Emoji 字符
 */
function getCategoryTitleEmoji($category) {
    // 为了保持一致性，使用与 header.php 相同的逻辑
    $emoji_map = [
        // 请根据您OneNav后台的实际分类ID修改此映射
        52 => '🤖',
        53 => '🎨',
        54 => '🖼️',
        55 => '💻',
        56 => '📖',
        57 => '📰',
        58 => '삶',
        59 => '🛠️',
        'default' => '📁'
    ];
    if (isset($emoji_map[$category['id']])) {
        return $emoji_map[$category['id']];
    }
    return $emoji_map['default'];
}
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <!-- 响应式设计viewport设置 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- 页面标题，显示网站名称和副标题 -->
    <title><?php echo $site['title']; ?> - <?php echo $site['subtitle']; ?></title>
    <!-- SEO关键词 -->
    <meta name="keywords" content="<?php echo $site['keywords']; ?>">
    <!-- SEO描述信息 -->
    <meta name="description" content="<?php echo $site['description']; ?>">
    <!-- 引入主题样式文件，使用绝对路径确保正确加载 -->
    <link rel="stylesheet" href="<?php echo $template_path; ?>/style.css?v=<?php echo time(); ?>">
</head>
<body>
    <?php
    // 引入头部文件
    require_once 'header.php';
    ?>
    <!-- 添加包装 div 用于 flex 布局 -->
    <div class="page-wrapper">
        <!-- 页面主要内容区域 -->
        <div class="main-content">
            <!-- 搜索结果容器，添加 id 以便滚动定位 -->
            <div class="search-results" id="search-results">
                <div class="container">
                    <div class="category-header">
                        <h2>搜索结果</h2>
                        <span class="category-desc" id="search-count">找到 <span id="result-count">0</span> 个结果</span>
                    </div>
                    <div class="websites-list" id="search-results-list">
                        <!-- 搜索结果将通过JavaScript动态插入 -->
                    </div>
                </div>
            </div>
            <!-- 网站链接容器 -->
            <div class="links-container">
                <div class="container">
                    <!-- 遍历所有分类 -->
                    <?php foreach ($categorys as $category) {
                        // 获取当前分类的ID
                        $fid = $category['id'];
                        // 使用OneNav内置函数get_links获取该分类下的所有链接
                        $links = get_links($fid);
                        // 只有当分类下有链接时才显示该分类
                        if (!empty($links)) {
                            // 获取分类标题对应的 Emoji
                            $category_title_emoji = getCategoryTitleEmoji($category);
                            // 组合 Emoji 和分类标题
                            $category_title_with_emoji = $category_title_emoji . ' ' . $category['name'];
                    ?>
                    <!-- 每个分类的内容区域 -->
                    <div class="category-group" id="category-<?php echo $category['id']; ?>">
                        <!-- 分类标题栏 -->
                        <div class="category-header">
                            <h2><?php echo htmlspecialchars($category_title_with_emoji); ?></h2>
                            <?php if (!empty($category['description'])) { ?>
                            <span class="category-desc"><?php echo htmlspecialchars($category['description']); ?></span>
                            <?php } ?>
                        </div>
                        <!-- 网站链接列表 -->
                        <div class="websites-list">
                            <!-- 遍历当前分类下的所有链接 -->
                            <?php foreach ($links as $link) { ?>
                            <!-- 单个网站链接项 -->
                            <a href="/index.php?c=click&id=<?php echo $link['id']; ?>" target="_blank" class="website-item" data-id="<?php echo $link['id']; ?>" data-title="<?php echo htmlspecialchars($link['title']); ?>" data-desc="<?php echo htmlspecialchars($link['description']); ?>">
                                <!-- 网站图标区域 -->
                                <div class="website-icon">
                                    <?php
                                    // --- 核心修改点：优先使用 OneNav 提供的 base64 函数获取 favicon ---
                                    // 使用 OneNav 内置的 base64 函数生成 favicon URL
                                    if (function_exists('base64')) {
                                        $favicon_url = 'https://favicon.rss.ink/v1/' . base64($link['url']);
                                        $alt_text = htmlspecialchars($link['title']);
                                        // --- 修复点：正确转义 JavaScript 中的引号 ---
                                        // 使用单引号包裹整个 onerror 属性值，并在内部使用双引号或转义单引号
                                        echo '<img src="' . $favicon_url . '" alt="' . $alt_text . '" onerror="this.parentNode.innerHTML=\'<span>' . mb_substr($alt_text, 0, 1, 'UTF-8') . '</span>\';">';
                                    } else {
                                        // 回退逻辑（如果 base64 函数不可用）
                                        if (!empty($link['ico_url'])) {
                                            // --- 修复点：同样正确转义引号 ---
                                            echo '<img src="' . htmlspecialchars($link['ico_url']) . '" alt="' . htmlspecialchars($link['title']) . '" onerror="this.parentNode.innerHTML=\'<span>' . mb_substr(htmlspecialchars($link['title']), 0, 1, 'UTF-8') . '</span>\';">';
                                        } else {
                                            echo '<span>' . mb_substr(htmlspecialchars($link['title']), 0, 1, 'UTF-8') . '</span>';
                                        }
                                    }
                                    ?>
                                </div>
                                <!-- 网站信息区域 -->
                                <!-- 关键修改：为 h3 和 p 添加 title 属性 -->
                                <div class="website-info">
                                    <h3 title="<?php echo htmlspecialchars($link['title']); ?>"><?php echo htmlspecialchars($link['title']); ?></h3>
                                    <p title="<?php echo htmlspecialchars($link['description']); ?>"><?php echo htmlspecialchars($link['description']); ?></p>
                                </div>
                            </a>
                            <?php } ?>
                        </div>
                    </div>
                    <?php } } ?>
                </div>
            </div>
        </div>
        <?php
        // 引入底部文件
        require_once 'footer.php';
        ?>
    </div>
    <!-- 引入主题JavaScript文件，使用绝对路径确保正确加载 -->
    <script src="<?php echo $template_path; ?>/main.js?v=<?php echo time(); ?>"></script>
</body>
</html>