# 主题开发

您可以根据此文档开发自己喜欢的OneNav主题。

## 目录结构

OneNav主题位于站点根目录下的`/templates`目录，或者是`/data/templates`，逻辑为：

1. 优先读取`/templates`目录下的主题
2. 如果未读取到`/templates`目录下的主题，则尝试从`/data/templates`读取

## 主题目录命名规范

1. 主题目录不能包含特殊字符，比如`-/.*!@#$%^&`等
2. 目录名称不能包含空格

## 创建一个主题

在`/templates`下创建一个目录，比如`HelloWorld`，里面至少需要存在2个文件，分别是：

* `index.php` - 主题首页文件
* `info.json` - 主题描述等信息

### info.json配置信息

info.jsonn内容包含：

```json
{
    "name":"Hello World",
    "description":"Hello World",
    "homepage":"https://www.xiaoz.me",
    "version":"1.0.0",
    "update":"2022/04/13",
    "author":"xiaoz",
    "screenshot":"https://img.rss.ink/imgs/2022/03/42ed3ef2c4a50f6d.png"
}
```

字段含义如下：

* name：主题名称
* description：主题描述
* homepage：作者主页
* version：主题版本
* update：主题更新时间
* author：主题作者
* screenshot：主题截图

这个时候回到OneNav后台 - 系统设置 - 主题设置，可以看到刚刚创建好的`HelloWorld`主题，不过当前没有实际作用，因为`index.php`还没有任何内容。

![](https://img.rss.ink/imgs/2022/04/14/57188081ff020234.png)

### 内置变量

您在`index.php`中可以使用以下变量，注意需要通过PHP开始符和结束符包裹，比如`<?php echo $name; ?>`

* `$site['title']`：站点标题
* `$site['logo']`：站点logo
* `$site['subtitle']`：站点副标题
* `$site['keywords']`：站点关键词
* `$site['description']`：站点描述
* `$site['custom_header']`：自定义header
* `$template`：主题文件夹名称，比如`HelloWorld`

### index.php

接下来我们试着在`index.php`添加内容，这个文件可以直接使用上面提到的内置变量。试着将上面的变量添加到`index.php`，内容如下：

```php
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title><?php echo $site['title']; ?> - <?php echo $site['subtitle']; ?></title>
        <meta name="keywords" content="<?php echo $site['keywords']; ?>" />
        <meta name="description" content="<?php echo $site['description']; ?>" />
        <style>
            header{
                width:100%;
                
            }
            aside{
                width:20%;
                float:left;
            }
            article{
                float:80%;
            }
            footer{
                width:100%;
            }
        </style>
	</head>
	<body>
		<!-- 顶部 -->
		<header>
            <!-- 网站标题 -->
			<h1><?php echo $site['title']; ?></h1>
		</header>
		<!-- 顶部 -->

		<!-- 左侧 -->
		<aside>
			左侧
		</aside>
		<!-- 左侧 -->

		<!-- 内容 -->
		<article>
			内容
		</article>
		<!-- 内容END -->

		<!-- 底部 -->
		<footer>
			这是底部内容
		</footer>
		<!-- 底部END -->
	</body>
</html>
```

OneNav后台 - 系统设置 - 主题设置 - 使用`HelloWorld`这个主题，回到首页我们可以看到变量已经生效，自动输出了网站标题。

![](https://img.rss.ink/imgs/2022/04/14/37abed6ed7e171ad.png)

不过当前非常简陋，内容都还没有。我们试着在`aside`元素添加遍历输出分类目录的代码，如下：

```php
<?php
                //遍历分类目录并显示
                foreach ($categorys as $category) {
                //var_dump($category);
                $font_icon = empty($category['font_icon']) ? '' : "<i class='{$category['font_icon']}'></i> ";
            ?>
            <a href="#category-<?php echo $category['id']; ?>">
                <li>
                    <div><?php echo $font_icon; ?><?php echo htmlspecialchars_decode($category['name']); ?></div>
                </li>
            </a>
            <?php } ?>
```

* `$category['name']`指的是分类目录名称

这时分类目录已经遍历并显示，内容如下截图：

![](https://img.rss.ink/imgs/2022/04/14/1db36899c0cc01c0.png)

趁热打铁，我们继续将书签内容也遍历输出，将下面的代码添加到`article`元素节点：

```php
<!-- 遍历分类目录 -->
            <?php foreach ( $categorys as $category ) {
                $fid = $category['id'];
                $links = get_links($fid);
				$font_icon = empty($category['font_icon']) ? '' : "<i class='{$category['font_icon']}'></i> ";
                //如果分类是私有的
                if( $category['property'] == 1 ) {
                    $property = '<i class="fa fa-expeditedssl" style = "color:#5FB878"></i>';
                }
                else {
                    $property = '';
                }
            ?>
			<div id = "category-<?php echo $category['id']; ?>" class = "mdui-col-xs-12 mdui-typo-title cat-title">
				<?php echo $font_icon; ?>
				<?php echo htmlspecialchars_decode($category['name']); ?> <?php echo $property; ?>
				<span class = "mdui-typo-caption"><?php echo $category['description']; ?></span>
			</div>
			<!-- 遍历链接 -->
			<?php
				foreach ($links as $link) {
					//默认描述
					$link['description'] = empty($link['description']) ? '作者很懒，没有填写描述。' : $link['description'];
					
				//var_dump($link);
			?>
			<div class="mdui-col-lg-3 mdui-col-md-4 mdui-col-xs-12 link-space" id = "id_<?php echo $link['id']; ?>" link-title = "<?php echo $link['title']; ?>" link-url = "<?php echo $link['url']; ?>">
				<!--定义一个卡片-->
				<div class="mdui-card link-line mdui-hoverable">
						<!-- 如果是私有链接，则显示角标 -->
						<?php if($link['property'] == 1 ) { ?>
						<div class="angle">
							<span> </span>
						</div>
						<?php } ?>
						<!-- 角标END -->
						<a href="/index.php?c=click&id=<?php echo $link['id']; ?>" target="_blank" title = "<?php echo $link['description']; ?>">
							<div class="mdui-card-primary" style = "padding-top:16px;">
									<div class="mdui-card-primary-title link-title">
										<img src="https://favicon.rss.ink/v1/<?php echo base64($link['url']); ?>" alt="HUAN" width="16" height="16">
										<span class="link_title"><?php echo $link['title']; ?></span> 
									</div>

							</div>
						</a>
						
					
					<!-- 卡片的内容end -->
					<div class="mdui-card-content mdui-text-color-black-disabled" style="padding-top:0px;"><span class="link-content"><?php echo $link['description']; ?></span></div>
				</div>
				<!--卡片END-->
			</div>
			<?php } ?>
			<!-- 遍历链接END -->
			<?php } ?>
```

这时候刷新首页，可以看到书签内容也输出了。不过没有CSS，样式完全是乱的，CSS样式就需要主题开发者根据自己的喜好来写了。

![](https://img.rss.ink/imgs/2022/04/14/3792b72ed3abe95f.png)

至此一个简单的`HelloWorld`主题已经完成，完整代码如下：

```php
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title><?php echo $site['title']; ?> - <?php echo $site['subtitle']; ?></title>
        <meta name="keywords" content="<?php echo $site['keywords']; ?>" />
        <meta name="description" content="<?php echo $site['description']; ?>" />
        <style>
            header{
                width:100%;
                
            }
            aside{
                width:20%;
                float:left;
            }
            article{
                float:80%;
            }
            footer{
                width:100%;
            }
        </style>
	</head>
	<body>
		<!-- 顶部 -->
		<header>
            <!-- 网站标题 -->
			<h1><?php echo $site['title']; ?></h1>
		</header>
		<!-- 顶部 -->

		<!-- 左侧 -->
		<aside>
            <?php
                //遍历分类目录并显示
                foreach ($categorys as $category) {
                //var_dump($category);
                $font_icon = empty($category['font_icon']) ? '' : "<i class='{$category['font_icon']}'></i> ";
            ?>
            <a href="#category-<?php echo $category['id']; ?>">
                <li>
                    <div><?php echo $font_icon; ?><?php echo htmlspecialchars_decode($category['name']); ?></div>
                </li>
            </a>
            <?php } ?>
		</aside>
		<!-- 左侧 -->

		<!-- 内容 -->
		<article>
			<!-- 遍历分类目录 -->
            <?php foreach ( $categorys as $category ) {
                $fid = $category['id'];
                $links = get_links($fid);
				$font_icon = empty($category['font_icon']) ? '' : "<i class='{$category['font_icon']}'></i> ";
                //如果分类是私有的
                if( $category['property'] == 1 ) {
                    $property = '<i class="fa fa-expeditedssl" style = "color:#5FB878"></i>';
                }
                else {
                    $property = '';
                }
            ?>
			<div id = "category-<?php echo $category['id']; ?>" class = "mdui-col-xs-12 mdui-typo-title cat-title">
				<?php echo $font_icon; ?>
				<?php echo htmlspecialchars_decode($category['name']); ?> <?php echo $property; ?>
				<span class = "mdui-typo-caption"><?php echo $category['description']; ?></span>
			</div>
			<!-- 遍历链接 -->
			<?php
				foreach ($links as $link) {
					//默认描述
					$link['description'] = empty($link['description']) ? '作者很懒，没有填写描述。' : $link['description'];
					
				//var_dump($link);
			?>
			<div class="mdui-col-lg-3 mdui-col-md-4 mdui-col-xs-12 link-space" id = "id_<?php echo $link['id']; ?>" link-title = "<?php echo $link['title']; ?>" link-url = "<?php echo $link['url']; ?>">
				<!--定义一个卡片-->
				<div class="mdui-card link-line mdui-hoverable">
						<!-- 如果是私有链接，则显示角标 -->
						<?php if($link['property'] == 1 ) { ?>
						<div class="angle">
							<span> </span>
						</div>
						<?php } ?>
						<!-- 角标END -->
						<a href="/index.php?c=click&id=<?php echo $link['id']; ?>" target="_blank" title = "<?php echo $link['description']; ?>">
							<div class="mdui-card-primary" style = "padding-top:16px;">
									<div class="mdui-card-primary-title link-title">
										<img src="https://favicon.rss.ink/v1/<?php echo base64($link['url']); ?>" alt="HUAN" width="16" height="16">
										<span class="link_title"><?php echo $link['title']; ?></span> 
									</div>

							</div>
						</a>
						
					
					<!-- 卡片的内容end -->
					<div class="mdui-card-content mdui-text-color-black-disabled" style="padding-top:0px;"><span class="link-content"><?php echo $link['description']; ?></span></div>
				</div>
				<!--卡片END-->
			</div>
			<?php } ?>
			<!-- 遍历链接END -->
			<?php } ?>
		</article>
		<!-- 内容END -->

		<!-- 底部 -->
		<footer>
			这是底部内容
		</footer>
		<!-- 底部END -->
	</body>
</html>
```