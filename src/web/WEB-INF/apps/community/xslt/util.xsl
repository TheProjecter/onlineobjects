<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0"
	xmlns="http://www.w3.org/1999/xhtml"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	>
	<xsl:template name="in2igui">
		<xsl:call-template name="in2igui-css"/>
		<xsl:call-template name="in2igui-js"/>
	</xsl:template>
	
	<xsl:template name="in2igui-css">
		<xsl:choose>
			<xsl:when test="$development-mode='true'">
				<link rel="stylesheet" href="{$base-context}/In2iGui/css/dev.css" type="text/css" media="screen" title="front" charset="utf-8"/>
			</xsl:when>
			<xsl:otherwise>
				<link rel="stylesheet" href="{$base-context}/In2iGui/css/minimized.css" type="text/css" media="screen" title="front" charset="utf-8"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template name="in2igui-js">
		<xsl:choose>
			<xsl:when test="$development-mode='true'">
				<script src="{$base-context}/In2iGui/lib/prototype.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/lib/n2i.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/lib/swfupload/swfupload.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/In2iGui.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/Toolbar.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/BoundPanel.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/Formula.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/Alert.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/Button.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/Picker.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/Editor.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/ImageViewer.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/RichText.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/Menu.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/ColorPicker.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/Overlay.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
				<script src="{$base-context}/In2iGui/js/Box.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
			</xsl:when>
			<xsl:otherwise>
				<script src="{$base-context}/In2iGui/js/minimized.js" type="text/javascript" charset="utf-8"><xsl:comment/></script>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template name="analytics">
		<xsl:if test="$development-mode!='true'">
			<script src="http://www.google-analytics.com/ga.js" type="text/javascript"><xsl:comment/></script>
			<script type="text/javascript">
			var pageTracker = _gat._getTracker("UA-420000-3");
			pageTracker._trackPageview();
			</script>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="chrome-top">
		<div class="chrome_top">
			<div class="chrome_top">
				<div class="chrome_top">
					<ul class="navigation">
						<li><a href="{$base-context}/" class="home"><span>Forside</span></a></li>
						<!--
						<li><a href="{$local-context}/images/"><span>Billeder</span></a></li>
						<li><a href="{$local-context}/index/"><span>Indeks</span></a></li>
						-->
					</ul>
					<xsl:if test="$user-name!='public'">
					<div class="login_info">
						Bruger: <xsl:value-of select="$user-name"/><xsl:text> </xsl:text><a href="#" class="link" id="logOut"><span>Log ud</span></a>
					</div>
					</xsl:if>
				</div>
			</div>
		</div>
	</xsl:template>
	
</xsl:stylesheet>