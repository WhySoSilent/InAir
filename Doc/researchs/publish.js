//部署文档
服务器
	IP Address: 192.241.200.69
	Username: root
	Password: labbfpcysfph

	user: webgl
	paddword: zaiyunduan
	
	
	tomcat目录  /usr/local/tomcat7
	mysql目录
	ftp目录

数据库
	root:zaiyunduan
	建库: webgl 字符集: utf8 -- UTF-8 Unicode	排序规则: utf8_unicode_ci
	user: webgl
	password: zaiyunduan

	配置最大连接数: 	my.ini  修改 max_connection = 180
Tomcat
	windows 安装为服务 service.bat install tomcat7
	linux 安装为服务 sudo /etc/init.d/tomcat7 start
	//当心部署多了之后连接数报错
	重命名ROOT / 配置 docBase="webgl" path=""
	关闭缓存 server.xml 配置文件的 <Context 字段添加 cachingAllowed="false" 属性

	添加用户 webgl=zaiyunduan
	
	Install tomcat7 as service
	-----------------------------------
	http://diegobenna.blogspot.com/2011/01/install-tomcat-7-in-ubuntu-1010.html
	CATALINA_HOME="/usr/local/tomcat7"
	JAVA_HOME="/usr/lib/jvm/java-7-oracle"
	JRE_HOME="/usr/lib/jvm/java-7-oracle/jre"


data文件夹处理


ubuntu shell
adduser -----------------------------------
