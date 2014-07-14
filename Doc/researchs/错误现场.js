// lightMap 全黑的问题
// ------------------------------------------------------
/*
	第一套是普通UV，第二套才是lightMapUV

	UV数量是跟点数相对应的

	faces里包括的不仅仅是顶点索引，也有UV索引，我们加了一套UV，而索引里没有添加，导致索引不够了，再加一套索引需要

	你模型导出的时候只导出了一套UV
	面索引里也只有一套UV索引
	加上一套UV
	面索引里也加上一套UV索引
	就OK了

*/

// three.js 例子中 knight.js 动画模型用普通Mesh导入找不到
// ------------------------------------------------------
/*
	材质不透明的问题 模型文件如下,导出工具是 Blender 2.63 Exporter
	transparency" : 1.0,
	"transparent" : false

	OBJConverter 对透明属性的处理可能和 Blender 2.63 Exporter 不统一

	我擅自更改的 Loader出的问题
	if ( m.transparent !== undefined || m.opacity < 1.0 ) {
		// /transparent 透明的 adj
		mpars.transparent = m.transparent || true;

	}
	改成
	if ( m.transparent !== undefined || m.opacity < 1.0 ) {
		// /transparent 透明的 adj
		mpars.transparent = m.transparent !== undefined ?  m.transparent : true;

	}
	同时更改了一下对于 transparency 属性的处理
	if ( m.transparency ) {
		mpars.opacity = 1 - m.transparency;
		if( mpars.opacity < 1 && m.transparent === undefined ) { mpars.transparent = true; }
	}
	!!! 未慎重分析潜在问题

*/