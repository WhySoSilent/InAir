/**
 * parameters = {
 *  opacity						opacity						opacity
 *  blending 					blending					blending
 *  depthTest 					depthTest					depthTest
 *  depthWrite					depthWrite					depthWrite
 *
 * } 
 */
	MeshBasicMaterial			MeshPhongMaterial			MeshLambertMaterial				Material
	------------------------------------------------------------------------------------------------------------
								metal 						
								perPixel

								-specular 
								-shininess
								-bumpMap
								-bumpScale
								-normalMap
								-normalScale
								-morphNormals

								 wrapAround					 wrapAround
								 wrapRGB					 wrapRGB
								-ambient 					-ambient
								-emissive 					-emissive

	-color 						-color 						-color
	-map 						-map 						-map
	-lightMap 					-lightMap					-lightMap
	-specularMap 				-specularMap				-specularMap
	-envMap 					-envMap						-envMap
	-combine 					-combine 					-combine
	-reflectivity 				-reflectivity				-reflectivity
	-refractionRatio 			-refractionRatio			-refractionRatio
	-fog 						-fog						-fog
	-shading 					-shading					-shading
	-wireframe 					-wireframe 					-wireframe
	-wireframeLinewidth 		-wireframeLinewidth 		-wireframeLinewidth
	 wireframeLinecap 			 wireframeLinecap			 wireframeLinecap
	 wireframeLinejoin 		 	 wireframeLinejoin			 wireframeLinejoin
	-vertexColors 				-vertexColors				-vertexColors
	-skinning 					-skinning
	-morphTargets 				-morphTargets				


																							id
																							uuid
																							name
																							side
																							-opacity
																							transparent
																							-blending
																							blendSrc
																							blendDst
																							blendEquation
																							-depthTest
																							-depthWrite
																							polygonOffset
																							polygonOffsetFactor
																							polygonOffsetUnits
																							alphaTest
																							overdraw
																							visible
																							needsUpdate

	-----------------------------------------------------------------------------------
	1.上面都是各个不同材质构造函数初始化的参数
	2.前面带'-'的指的是可以通过构造函数参数传入而被更改值的属性，注意是可以，three默认先初始化为初值
	3.前面不带'-'的是作者列出来的 构造函数参数列表 中不存在的
	4.