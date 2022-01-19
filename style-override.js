const generateOverride = (params = {}) => {
	let result = "";
	var colors = {
		// 主背景色
		"theme-color-first": {
			white: "#ffffff",
			black: "#242424",
		},
		// 次背景色(首页文章背景色)
		"theme-color-second": {
			white: "#f3f3f3a8",
			black: "#2a2a2aa8",
		},
		// 主文字颜色
		"content-color-first": {
			white: "#4a4a4a",
			black: "#EAEAEA",
		},
		// 次要文字颜色
		"content-color-second": {
			white: "#868e96",
			black: "#868e96",
		},
		// 文字高亮色
		"content-color-highlight": {
			white: "#0085a1",
			black: "#ffd602",
		},
		// 文字翻转色(页码)
		"content-color-flip": {
			white: "#ffffff",
			black: "#414040",
		},
		// 文字次要翻转色(页码hover)
		"content-color-flip-second": {
			white: "#817c7c",
			black: "#b6b6b6fc",
		},
		// 线的颜色
		"line-color": {
			white: "#0000001a",
			black: "#4c4c4c",
		},
		// header 遮罩层
		"header-opacity": {
			white: 0.4,
			black: 0.9,
		},
		// 阴影
		"box-shadow-color": {
			white: "#c1bcbc",
			black: "#4b4a4a",
		},
	};

	if (params.isEnabledCustomColor) {
		params.skin = "custom";
		colors["theme-color-first"][params.skin] = params.ctf;
		colors["theme-color-second"][params.skin] = params.cts;
		colors["content-color-first"][params.skin] = params.ccf;
		colors["content-color-second"][params.skin] = params.ccs;
		colors["content-color-highlight"][params.skin] = params.highlight;
		colors["content-color-flip"][params.skin] = params.flip;
		colors["content-color-flip-second"][params.skin] = params.cofs;
		colors["line-color"][params.skin] = params.lc;
		colors["box-shadow-color"][params.skin] = params.bsc;
		colors["header-opacity"][params.skin] = params.ho;
	}

	if (!params.skin) {
		params.skin = "white";
	}
	result += `
			body {
				background-color: ${colors["theme-color-first"][params.skin]} !important;
				color: ${colors["content-color-first"][params.skin]} !important;
			}

			#mainNav.is-fixed {
				background-color: ${colors["theme-color-first"][params.skin].colorRgba(0.9)};
				border-bottom: 1px solid ${colors["content-color-flip"][params.skin]};
			}

			.fixed-top {
				background-color: ${colors["theme-color-first"][params.skin]};
			}
			.fixed-top .navbar-brand,
			.fixed-top .navbar-nav > li.nav-item > a,
			.fixed-top .navbar-toggler {
				color: ${colors["content-color-first"][params.skin]};
			}
			.navbar-light .navbar-toggler {
				border-color: ${colors["content-color-first"][params.skin].colorRgba(0.5)} !important;;
			}

			a {
				color: ${colors["content-color-highlight"][params.skin].colorRgba(0.7)} ;
			}

			a:focus,
			a:hover {
				color: ${colors["content-color-highlight"][params.skin]} ;
			}

            .row .post-row-container {
				background-color: ${colors["theme-color-second"][params.skin]} !important;
			}

			.title-floor .post-title-container a,
			h3.post-subtitle,
			.pagination-ul li a,
			.list-inline .list-inline-item a,
			#mainNav.is-fixed .navbar-brand,
			#mainNav.is-fixed .navbar-nav > li.nav-item > a {
				color: ${colors["content-color-first"][params.skin]} !important;
			}
			.title-floor .post-title-container a:after,
			.pagination-active a{
				background-color: ${colors["content-color-first"][params.skin]} !important;
			}

			blockquote {
				border-left: 2px solid ${colors["content-color-highlight"][params.skin]};
				color: ${colors["content-color-highlight"][params.skin]} !important;
			}

			.post-preview > .post-meta {
				color: ${colors["content-color-second"][params.skin]} !important;
			}

			.title-floor .post-title-container a:hover,
			#mainNav.is-fixed .navbar-brand:hover,
			#mainNav.is-fixed .navbar-nav > li.nav-item > a:hover {
				color: ${colors["content-color-highlight"][params.skin]} !important;
			}

			.title-floor .post-title-container a:hover::after{
				background-color: ${colors["content-color-highlight"][params.skin]} !important;
			}

			::selection{
				background: ${colors["content-color-highlight"][params.skin]} !important;
			}

			.post-row-sec-floor .post-tag {
				color: ${colors["content-color-first"][params.skin]} !important;
				border-color: ${colors["content-color-first"][params.skin]} !important;;
			}

			.post-row-sec-floor .post-tag:hover {
				color: ${colors["content-color-highlight"][params.skin]} !important;
				border-color: ${colors["content-color-highlight"][params.skin]} !important;
			}

			.page {
				border-top: 1px solid ${colors["line-color"][params.skin]} !important;
			}

			hr {
				border-top: 1px solid ${colors["line-color"][params.skin]} !important;
			}

			.fa-inverse {
				color: ${colors["content-color-flip"][params.skin]} !important;
			}

			.pagination-ul a:hover {
				background-color: ${colors["content-color-flip-second"][params.skin]} !important;
				color: ${colors["content-color-flip"][params.skin]} !important;
				box-shadow: 0 1px 4px 2px ${colors["content-color-flip-second"][params.skin].colorRgba(0.9)} !important;
			}

			.pagination-ul .pagination-active a{
				color: ${colors["content-color-flip"][params.skin]} !important;
				box-shadow: 0 1px 4px 2px ${colors["content-color-flip-second"][params.skin].colorRgba(0.9)} !important;
			}

			.sticky-top-flag {
				background: ${colors["content-color-first"][params.skin].colorRgba(0.8)} !important;
				color: ${colors["content-color-flip"][params.skin]} !important;
			}

			header.masthead .overlay {
				opacity: ${colors["header-opacity"][params.skin]} !important;
			}

			.toc-container .markdownIt-TOC {
				border: 1px solid ${colors["content-color-first"][params.skin].colorRgba(0.3)};
				background-color: ${colors["theme-color-first"][params.skin]};
			}

			.toc-container .markdownIt-TOC li a {
				color: ${colors["content-color-first"][params.skin].colorRgba(0.5)};
			}

			.currentToc {
				color: ${colors["content-color-highlight"][params.skin]} !important;
				background-color: ${colors["content-color-first"][params.skin].colorRgba(0.1)};
			}

			.toc-container li a:hover {
				background-color: ${colors["content-color-first"][params.skin].colorRgba(0.1)};
			}

			.row .post-row-container ,
			#post-content-article .container .post-feature-header-image {
				box-shadow: 0 3px 15px 2px ${colors["box-shadow-color"][params.skin]};;
			}
			
         `;
	if (params.customCss) {
		result += `
      ${params.customCss}
    `;
	}

	return result;
};

/**
 * 十六进制颜色转 RGBA 颜色
 * @param alpha
 * @returns {string}
 */
String.prototype.colorRgba = function (alpha = 1.0) {
	var sColor = this.toLowerCase();
	//十六进制颜色值的正则表达式
	var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	// 如果是16进制颜色
	if (sColor && reg.test(sColor)) {
		if (sColor.length === 4) {
			var sColorNew = "#";
			for (var i = 1; i < 4; i += 1) {
				sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
			}
			sColor = sColorNew;
		}
		//处理六位的颜色值
		var sColorChange = [];
		for (var i = 1; i < 7; i += 2) {
			sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
		}
		return "RGBA(" + sColorChange.join(",") + "," + alpha + ")";
	}
	return sColor;
};

module.exports = generateOverride;
