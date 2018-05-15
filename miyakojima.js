(function() {
    var g;
	var width  = window.innerWidth;
	var height = window.innerHeight;
	//scaleはスクリーンの大きさによって変更
	var scale;
	var mapx;
	var mapy;
	var label_font_size;
	var label_width;
	var label_height;
	var font_size;
	//PCの場合 残念ながら980以下の表示はくずれるが、その調整は捨てる。大きくして見てもらう。
	if (width>980){
		scale = 500000;
		mapx = width / 2;
		mapy = height / 2;
		label_font_size='36pt';
		label_width=400;
		font_size='14pt';
	//iPadの場合 innerWidth=980
	} else if (width<981 && width>600){
		scale = 500000;
		mapx = width / 2;
		mapy = height / 2;
		label_font_size='28pt';
		label_width=200;
		font_size='12pt';
	//AndroidタブレットのモバイルChrome(Nexus7)の場合 innerWidth=600
	} else if (width<601 && width>480){
		scale = 500000;
		mapx = width / 2;
		mapy = height / 2;
		label_font_size='28pt';
		label_width=200;
		font_size='10pt'
	//iPhoneの場合
	} else {
		scale = 500000;
		mapx = width / 2;
		mapy = height / 2;
		label_font_size='12pt';
		label_width=200;
		font_size='7pt'
	}
	//取得したwidthを表示するラベル生成
	var label=d3.select("body")
					  .append("div")
					  .attr("class", "tip")
	label.style("font-size", "8pt")
		 .style("left", "10px")
		 .style("top", "30px")
		 .style("visibility", "visible")
		 .text(width)
	// svg要素を作成し、データの受け皿となるg要素を追加している
	map = d3.select('#map')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g');
	// 同じディレクトリにあるgeojsonファイルをhttp経由で読み込む    
	d3.json("miyakojima.json", function(json) {
			var projection,path;
			//ツールチップを生成
			var tooltip=d3.select("body")
						  .append("div")
						  .attr("class", "tip")
			// 投影を処理する関数を用意する。データからSVGのPATHに変換するため。
			projection = d3.geo.mercator()
						   .scale(scale)
						   .center(d3.geo.centroid(json))  // データから中心点を計算 .center(d3.geo.centroid(json)) 
						   .translate([mapx, mapy]);
			// pathジェネレータ関数
			path = d3.geo.path().projection(projection);
			// これがenterしたデータ毎に呼び出されpath要素のd属性にgeoJSONデータから変換した値を入れる                
			map.selectAll('path')
			   .data(json.features)
			   .enter()
			   .append('path')
			   .attr('d', path)
			   .style("fill", function(d,i){
					var a = d.properties.JINKO / 10000;
					if (a > 1.0) { a = 1.0 }
					return "rgba(0, 255, 0, "+a+")";
				   })
			   .attr("fill", function(d){
			   // 適当に色を塗るなど
					return "hsl(0,0%,80%)";
			   })
			   .on('mouseover', function(d){
				   // mouseoverの時のインタラクション
				   d3.select(this).style("stroke", "red").style("stroke-width", "5");
				   //ツールチップを表示
				   var name=d.properties.MOJI+'  人口:'+d.properties.JINKO+'人';
				   var label_x = String((width - label_width) / 2)+'px';
				   tooltip.style("font-size", label_font_size)
						  .style("left", label_x)
						  .style("top",  "10px")
						  .style("visibility", "visible")
						  .text(name)
			   })
			   .on('mouseout', function(d){
					d3.select(this).style("stroke", "black").style("stroke-width", "0.5");
					tooltip.style("visibility", "hidden")
			   })
			   .on('click', function(d) {
                  // clickされた時のインタラクション
				
			   });
	//小中高追加
	var xhr = new XMLHttpRequest();
	xhr.onload = function(){
		var tempArray = xhr.responseText.split("\n");
		csvArray = new Array();
		for(var i=0;i<tempArray.length;i++){
			csvArray[i] = tempArray[i].split(",");
			var data = csvArray[i];
			var lonlat = [data[0], data[1]];
			var xy = projection(lonlat);
			map.append("circle")
			   .attr({
			     cx: xy[0],
				 cy: xy[1],
				 r: 6
			   })
			   .attr("fill", "cyan")
			   .attr("stroke", "blue")
			   .attr("stroke-width", "2")
			 map.append("text")
			    .attr({ x: xy[0]-10, y: xy[1]+12 })
				.style("font-size", "6pt")
				.text(data[2])
				.style("visibility", "visible")
		}
	};	
	xhr.open("get", "miyakojima_school.csv", true);
	xhr.send(null);
	});
})();