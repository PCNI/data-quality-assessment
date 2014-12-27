(function () {	
	var chart = {
        xyz: "hello"
    };
    
	/* Chart Rendering Function*/
	chart.renderChart = function (chartopts) {
    
		var _chart = {};
	    	
		if (classes[chartopts.type]) {
				
				_chart = $.extend(true, _chart, classes[chartopts.type]);
				
				/* When we extend _chart from its corresponding class object, it will have the default 'options' defined in the class.
				The below statement is to override the default options with those given by user */
				
				_chart.options = $.extend(true, _chart.options, chartopts);
				//_chart.parent = this;
				
				if (typeof _chart.processdata === 'function'){ 
					_chart.processdata();
				} 
				if (typeof _chart.draw === 'function'){
					_chart.draw();
				}
		}
		
		return _chart;
	}

	window.chart = chart;
	

/* Defining various Charts */
	
	classes = {};
	
	classes.Chart = {
		options:{}, 
		processdata: null,
		draw: null,
		transform: null,
	
	};
	
	classes.C3Charts = $.extend(true, {}, classes.Chart);
	classes.C3Charts.typemap = {
		C3PieChart :'Pie',
		C3DonutChart :'donut',
		C3BarChart : 'bar',
		C3LineChart : 'line',
		C3ScatterChart : 'scatter',
		C3AreaChart : 'area',
		C3SplineChart : 'spline',
		C3AreaSplineChart :'area-spline',
		C3StepChart : 'step',
		C3AreaStepChart :'area-step'		
	};
	classes.C3Charts.transformable = ["C3BarChart","C3LineChart","C3AreaChart","C3ScatterChart","C3AreaStepChart","C3SplineChart","C3StepChart","C3AreaSplineChart"];
	classes.C3Charts.options = {
		type:'C3BarChart',
		data: { 
			jsondata: {},
			categorykey : '',
			valuekeys: [],
			groupkeys:[[]],
		},
		placeholder: 'chart',
		title: 'Chart Title',
		size: {
			height: null,
			width: null
        },
			  
	    padding: {    
			top: 20,
            right: 50,
            bottom: 20,
            left: 50,
        },
		order : ' desc',		 
		legend: {
			show: true
		},
		
		tooltip: {
            grouped:false
        },
	
		color: {
		    pattern: ['#1f77b4', '#aec7e8','#9467bd', '#c5b0d5', '#8c564b', '#c49c94','#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
        },
			   
		axis: { rotated: false,
			x: { 
			    padding: {top: 0, bottom: 0},
				label: {    
                    text: '',
                    position: 'inner-right'
				},
				tick: {rotate:0 },
				extent: [0,0],
				type: 'category',
				height:50
			},
				   
			y:{ 
				label: {    
					padding: {top: 0, bottom: 0},
                    text: '',
                    position: 'inner-right'
				},
			    
				max: null,
				min: null ,
			    height:50
			}
				   
		},
		
		point: {
			show: true
		}, 
		
		zoom: {enabled:true},		
		
		subchart: {
			show:true
		},
					  		
		grid: {
            x: {
				show:false,
            },
						 
            y: {
				show:false,
            }
		}
	};
	
	classes.C3Charts.draw = function () {
		console.log("C3Charts.draw");
		var _options = this.options;
		
		var c3chart = c3.generate({
		   
			bindto: '#' + _options.placeholder,
			data: {
				json: _options.data.jsondata,
				keys: {
					x: _options.data.categorykey, 
					value: _options.data.valuekeys,
				},
				type : this.typemap[_options.type],		
				groups:_options.data.groupkeys
				
			},	
			
			legend:_options.legend,
			size: _options.size,
			padding: _options.padding,
			tooltip: _options.tooltip,	 
			color: _options.color,
			axis: _options.axis,
			point: _options.point,
			subchart: _options.subchart,
			zoom:_options.zoom,
			grid:_options.grid
			
		});
		
		this.c3chart = c3chart;
	}; 
		
	classes.C3Charts.flow = function (newdata) {
		var _options = this.options;
		this.c3chart.flow({
			json:newdata,
			keys: {
					x: _options.data.categorykey, 
					value: _options.data.valuekeys,
			},
			length: 3,
			duration: 1500
		});
	};
	
	classes.C3Charts.transform = function (transformTo){
		console.log("classes.C3Charts.transform ");
		console.log(transformTo);
		var _options = $.extend(true, {}, this.options);
		var newchart = {};
		if($.inArray(transformTo, this.transformable) > -1){
			console.log("Is transformable")
		    this.c3chart.transform(this.typemap[transformTo]);
		    newchart = this;
		}
		else if ($.inArray(transformTo, classes.C3ArrayCharts.transformable) > -1){
			console.log("Switching");
			_options.type = transformTo,
			_options.data.serieskey = _options.data.categorykey,
			_options.data.valuekey = _options.data.valuekeys[0],
			newchart = chart.renderChart(_options)
			
		}
		else{
		    
			console.log("Cannot be transformed")
		}	
		return newchart;

	};
	
	
	classes.C3ArrayCharts = $.extend(true, {}, classes.Chart);
	classes.C3ArrayCharts.typemap = {
		C3AreaChart : 'area',
		C3BarChart : 'bar',
		C3LineChart : 'line',
		C3ScatterChart : 'scatter',
		C3SplineChart : 'spline',
		C3StepChart : 'step',
		C3AreaSplineChart :'area-spline',
		C3AreaStepChart :'area-step',
		C3PieChart :'pie',
		C3DonutChart :'donut',
		C3GaugeChart :'gauge'
	};
	classes.C3ArrayCharts.transformable = ["C3PieChart","C3DonutChart"];
	classes.C3ArrayCharts.options = {
		data: { 
			jsondata: {},
			serieskey: '', 
			valuekey: ''
		},
		placeholder: 'chart',
		title: 'Chart Title',
		
		size: {
			height: null,
			width: null
        },
		order : 'asc',
	    padding: {    
			top: 20,
            right: 50,
            bottom: 20,
            left: 50,
        },
				 
		legend: {
			show: true
		},
		
		color: {
		    pattern: ['#1f77b4', '#aec7e8', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94','#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
        }
	};
	
	classes.C3ArrayCharts.processdata = function() {
		var _ArrayData=[]; 
		var _options = this.options;
		for (_i=0; _i < _options.data.jsondata.length; _i++){
			_ArrayData[_i]=[];
			_ArrayData[_i].push(_options.data.jsondata[_i][_options.data.serieskey]);
			_ArrayData[_i].push(_options.data.jsondata[_i][_options.data.valuekey]);
		}
		console.log(_ArrayData);
		this.ArrayData =_ArrayData; 
	}
	
	classes.C3ArrayCharts.draw = function () {
		console.log("C3ArrayCharts.draw");
		var _options = this.options;
		
		var c3chart = c3.generate({
		   
			bindto: '#' + _options.placeholder,
			data: {
				columns: this.ArrayData,
				
				type : this.typemap[_options.type],
		       		
			},
			
			legend:_options.legend,
			size: _options.size,
			padding: _options.padding,	 
			color: _options.color
		});
		
		this.c3chart = c3chart;
	}; 

	classes.C3ArrayCharts.transform = function (transformTo){
		console.log("classes.C3ArrayCharts.transform ");
		console.log(transformTo);
		var _options = $.extend(true, {}, this.options);
		var newchart = {};
		if($.inArray(transformTo, this.transformable) > -1){
			console.log("Is transformable")
		    	this.c3chart.transform(this.typemap[transformTo])
  			newchart = this;
		}
		else if ($.inArray(transformTo, classes.C3Charts.transformable) > -1){
			console.log("Switching");
			_options.type = transformTo,
			_options.data.categorykey = _options.data.serieskey,
			_options.data.valuekeys = [_options.data.valuekey],
			newchart = chart.renderChart(_options)	
		}
		else{
			console.log("Cannot be transformed")
		}	
		return newchart;
	};	
	
	classes.C3ArrayCharts.flow = function (newdata) {
		var _options = this.options;
		this.c3chart.flow({
			json:newdata,
			keys: {
					x: _options.data.categorykey, 
					value: _options.data.valuekeys,
			},
			length: 3,
			duration: 1500
		});
	};
	
/* ----------------Defining C3PieChart--------------------------*/
	classes.C3PieChart = $.extend(true, {}, classes.C3ArrayCharts);
	
/* ----------------Defining C3DonnutChart-----------------------*/
	classes.C3DonutChart = $.extend(true, {}, classes.C3ArrayCharts);
		
/* ----------------Defining C3BarChart--------------------------*/
	classes.C3BarChart = $.extend(true, {}, classes.C3Charts);

/* ----------------Defining C3LineChart-------------------------*/
	classes.C3LineChart = $.extend(true, {}, classes.C3Charts);
	
/* ----------------Defining C3AreaChart-------------------------*/
	classes.C3AreaChart = $.extend(true, {}, classes.C3Charts);
		
/* ----------------Defining C3SplineChart-----------------------*/
	classes.C3SplineChart = $.extend(true, {}, classes.C3Charts);
	
/* ----------------Defining C3StepChart-------------------------*/
	classes.C3StepChart = $.extend(true, {}, classes.C3Charts);
	
/* ----------------Defining C3AreaSplineChart-------------------*/	
	classes.C3AreaSplineChart = $.extend(true, {}, classes.C3Charts);
	
/* ----------------Defining C3AreaStepChart---------------------*/	
	classes.C3AreaStepChart = $.extend(true, {}, classes.C3Charts);
	
/* ----------------Defining C3ScatterChart-----------------------*/
	classes.C3ScatterChart = $.extend(true, {}, classes.C3Charts);
	
/* ----------------Defining D3BarChart--------------------------*/
	
	classes.D3BarChart = $.extend(true, {}, classes.Chart);
	
	classes.D3BarChart.options = {
		type: 'D3BarChart',
		data: { 
			jsondata: {},
			categorykey : '',
			valuekey: ''
		},
		placeholder: 'chart',
		title: 'Chart Title',
		tooltip: {
			show:true
		}
	};
	
	classes.D3BarChart.draw = function () {
		
		var _options = this.options;
	
		var margin = {top: 20, right: 30, bottom: 30, left: 70},
					width = 500 - margin.left - margin.right,
					height = 400 - margin.top - margin.bottom;
				
		var category = "d." + _options.data.categorykey;
		var values= "d." +  _options.data.valuekey;
		
		var tooltip = "eval(category) +\" : \"+eval(values)";
		
		$(_options.placeholder).addClass('panel').addClass('panel-primary');

			var x = d3.scale.ordinal()
				.rangeRoundBands([0, width], .1);

			var y = d3.scale.linear()
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");

			var heading = d3.select(_options.placeholder)
							.append("h3").attr("class", "panel-heading").style("margin", 0 ).style("clear", "none")
							.text(_options.title);

			var chart = d3.select(_options.placeholder).append("div").attr("class", "panel-body")
				.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			  .append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			x.domain(data.map(function(d) { return eval(category); }));
			y.domain([0, d3.max(data, function(d) { return eval(values); })]);


			chart.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

			chart.append("g")
				.attr("class", "y axis")
				.call(yAxis);

			chart.selectAll(".bar")
				.data(_options.data.jsondata)
			.enter().append("rect")
			  .attr("class", "bar")
			  .attr("x", function(d) { return x(eval(category)); })
			  .attr("y", function(d) { return y(eval(values)); })
			  .attr("height", function(d) { return height - y(eval(values)); })
			  .attr("width", x.rangeBand());
			
			if (_options.tooltip.show == true) {
				chart.selectAll(".bar")
				 .append("title")
					.text(function(d){ return eval(tooltip)});	
			}
	};
})();