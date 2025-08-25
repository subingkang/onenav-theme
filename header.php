<?php
/**
 * Modern主题 - 头部文件
 * 作者: subk
 * 包含网站的固定头部区域（Banner、搜索框、分类导航）
 * 添加了 Unicode Emoji 支持
 */
// 确保变量存在，防止直接访问
if (!isset($site) || !isset($categorys) || !isset($template)) {
    die('非法访问');
}
// 获取主题路径
$template_path = '/templates/' . $template;

/**
 * 根据分类ID或名称关键词获取对应的 Emoji
 * @param array $category OneNav 分类数组
 * @return string 对应的 Emoji 字符
 */
function getCategoryEmoji($category) {
    // --- 方法1: 根据分类ID映射 Emoji ---
    $emoji_map = [
        // 请根据您OneNav后台的实际分类ID修改此映射
        52 => '🤖', // 假设ID为52的分类是AI
        53 => '🎨', // 假设ID为53的分类是Design
        54 => '🖼️', // 假设ID为54的分类是Pic
        55 => '💻', // 假设ID为55的分类是IT
        56 => '📖', // 假设ID为56的分类是Learn
        57 => '📰', // 假设ID为57的分类是Info
        58 => '삶', // 假设ID为58的分类是Life (使用韩文字符代表生活)
        59 => '🛠️', // 假设ID为59的分类是Tools
        // 可以继续为其他ID添加映射
        // 通用/默认
        'default' => '📁'
    ];

    if (isset($emoji_map[$category['id']])) {
        return $emoji_map[$category['id']];
    }

    // --- 方法2 (备选): 如果ID没有映射，则根据名称关键词匹配 ---
    /*
    $name_to_emoji = [
        'AI' => '🤖',
        '设计' => '🎨',
        '图片' => '🖼️',
        'IT' => '💻',
        '学习' => '📖',
        '信息' => '📰',
        '生活' => '삶',
        '工具' => '🛠️',
        '视频' => '🎬',
        '社交' => '👥',
        '购物' => '🛒',
        '新闻' => '🗞️',
        '音乐' => '🎵',
        '游戏' => '🎮',
    ];
    foreach ($name_to_emoji as $keyword => $emoji) {
        if (strpos($category['name'], $keyword) !== false) {
            return $emoji;
        }
    }
    */

    // 如果都没有匹配到，返回默认Emoji
    return $emoji_map['default'];
}
/**
 * 获取主题目录下 images 文件夹中的随机 Banner 图片 URL
 * @param string $template 当前主题名称
 * @return string 图片的相对 URL 或默认图片 URL
 */
function getRandomBannerImageUrl($template) {
    $imagesDir = __DIR__ . '/images'; // 服务器上的绝对路径
    $relativeImagesPath = "/templates/" . $template . "/images"; // Web 访问的相对路径

    // 检查 images 目录是否存在
    if (!is_dir($imagesDir)) {
        // 如果主题 images 目录不存在，尝试使用默认图片或返回空
        // 这里我们返回一个默认的 Unsplash 图片作为后备
        // 您也可以选择返回一个主题内的默认图片，例如 '/templates/' . $template . '/images/default-banner.jpg'
        return 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
    }

    // 扫描目录中的文件
    $files = scandir($imagesDir);
    $images = [];

    foreach ($files as $file) {
        // 过滤掉 '.' 和 '..' 以及非图片文件
        if ($file !== '.' && $file !== '..') {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                $images[] = $file;
            }
        }
    }

    // 如果找到了图片
    if (!empty($images)) {
        // 随机选择一张
        $randomImage = $images[array_rand($images)];
        // 返回 Web 可访问的 URL
        return $relativeImagesPath . '/' . urlencode($randomImage);
    } else {
        // 如果没有找到图片，返回后备图片
        return 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
    }
}

// --- 在需要使用的地方获取随机 Banner 图片 URL ---
// 通常在 HTML 输出部分之前调用一次即可
$random_banner_image_url = getRandomBannerImageUrl($template);
?>
<!-- 固定头部区域 -->
<div class="fixed-header">
    <!-- 顶部Banner区域，显示网站标题和副标题 -->
    <div class="banner" style="background-image: url('<?php echo htmlspecialchars($random_banner_image_url); ?>');">
        <div class="banner-content">
            <h1><?php echo $site['title']; ?></h1>
            <p><?php echo $site['subtitle']; ?></p>
        </div>
    </div>
    <!-- 页面主要内容容器 -->
    <div class="container">
        <!-- 搜索框区域 -->
        <div class="search-box">
            <input type="text" id="search" placeholder="搜索网站...">
        </div>
        <!-- 分类导航栏 -->
        <div class="category-nav">
            <!-- "全部"分类按钮，默认选中 -->
            <a href="#" class="category-btn active" data-target="all">全部</a>
            <!-- 遍历所有分类，生成分类按钮 -->
            <?php foreach ($categorys as $category) {
                // 获取分类对应的 Emoji
                $category_emoji = getCategoryEmoji($category);
                // 组合 Emoji 和分类名称
                $category_name_with_emoji = $category_emoji . ' ' . $category['name'];
            ?>
            <a href="#category-<?php echo $category['id']; ?>" class="category-btn"><?php echo htmlspecialchars($category_name_with_emoji); ?></a>
            <?php } ?>
        </div>
    </div>
</div>