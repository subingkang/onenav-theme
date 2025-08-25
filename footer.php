<?php
/**
 * Modern主题 - 底部文件
 * 作者: subk
 * 包含网站的底部版权信息区域
 */
// 确保变量存在，防止直接访问
if (!isset($site)) {
    die('非法访问');
}
?>
<!-- 页面底部版权信息区域 -->
<footer>
    <div class="container">
        <!-- 显示当前年份和网站标题 -->
        <p>© <?php echo date('Y'); ?> <?php echo $site['title']; ?> - 基于OneNav二次开发 by <a href="https://subkme.com" target="_blank">subk</a></p>
        <!-- 如果设置了ICP备案号，则显示备案信息 -->
        <?php if(!empty($site['icp'])) { ?>
        <p><a href="https://beian.miit.gov.cn/" target="_blank"><?php echo $site['icp']; ?></a></p>
        <?php } ?>
    </div>
</footer>