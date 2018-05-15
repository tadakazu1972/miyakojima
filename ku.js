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
		scale = 120000;
		mapx = width / 2;
		mapy = height / 2;
		label_font_size='36pt';
		label_width=180;
		font_size='14pt';
	//iPadの場合 innerWidth=980
	} else if (width<981 && width>600){
		scale = 200000;
		mapx = width - (width/8);
		mapy = height / 4;
		label_font_size='28pt';
		label_width=80;
		font_size='12pt';
	//AndroidタブレットのモバイルChrome(Nexus7)の場合 innerWidth=600
	} else if (width<601 && width>480){
		scale = 120000;
		mapx = width-(width/20);
		mapy = height / 4;
		label_font_size='28pt';
		label_width=80;
		font_size='10pt'
	//iPhoneの場合
	} else {
		scale = 70000;
		mapx = width-(width/10);
		mapy = height / 4;
		label_font_size='18pt';
		label_width=40;
		font_size='7pt'
	}
	//取得したwidthを表示するラベル生成
	var label=d3.select("body")
					  .append("div")
					  .attr("class", "tip")
	label.style("font-size", "16pt")
		 .style("left", "30px")
		 .style("top", "10px")
		 .style("visibility", "visible")
		 .text(width)
	// svg要素を作成し、データの受け皿となるg要素を追加している
	map = d3.select('#map')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g');
	// 同じディレクトリにあるgeojsonファイルをhttp経由で読み込む    
	d3.json("ku.json", function(json) {
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
				   if(d.properties.N03_004.lastIndexOf("区") > -1){
						return "cyan";
				   }
						return "white";
				   })
			   .attr("fill", function(d){
			   // 適当に色を塗るなど
					return "hsl(0,0%,80%)";
			   })
			   .attr("stroke","hsl(80,100%,0%)" )
			   .on('mouseover', function(d){
				   // mouseoverの時のインタラクション
				   d3.select(this).style("fill", "red");
				   //ツールチップを表示
				   var name=d.properties.N03_004;
				   var label_x = String((width - label_width) / 2)+'px';
				   tooltip.style("font-size", label_font_size)
						  .style("left", label_x)
						  .style("top", "10px")
						  .style("visibility", "visible")
						  .text(name)
			   })
			   .on('mouseout', function(d){
					d3.select(this).style("fill", "cyan");
					tooltip.style("visibility", "hidden")
			   })
			   .on('click', function(d) {
                  // clickされた時のインタラクション
				
			   });
	/*//サークル追加
	var lonlat = [135.502154, 34.694062]; //大阪市役所
	var xy = projection(lonlat)
	map.append("circle")
	   .attr({
		  cx: xy[0],
		  cy: xy[1],
		  r: 5
	    })*/
	//区名表示ラベル追加
	var xhr = new XMLHttpRequest();
	xhr.onload = function(){
		var tempArray = xhr.responseText.split("\n");
		csvArray = new Array();
		for(var i=0;i<tempArray.length;i++){
			csvArray[i] = tempArray[i].split(",");
			var data = csvArray[i];
			var lonlat = [data[0], data[1]];
			var xy = projection(lonlat);
			//人口棒グラフ
			map.append("rect")
			   .attr({
			     x: xy[0],
				 y: xy[1]-data[3]/2000,
				 width: 10,
				 height : data[3]/2000
				})
				.style("fill", "orange")
				.style("stroke", "black")
			//区名ラベル
			map.append("text")
			   .attr({
			     x: xy[0]-20,
				 y: xy[1],
			    })
			   .style("font-size", font_size)
			   .text(data[2]);
		}
	};	
	xhr.open("get", "ku_center.csv", true);
	xhr.send(null);
	/*//小中学校追加
	//CSVファイル読み込み
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
				 r: 3
			   })
		}
	};	
	xhr.open("get", "syotyu.csv", true);
	xhr.send(null);*/
	});
})();