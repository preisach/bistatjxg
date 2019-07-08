/**
 * @author marcd 2019
 */

(function(exports) {

	/**
	 * @param
	 * @return
	 */
	function createObjects_IO(JXG, brd_InOut, r) {
		var in_out = brd_InOut.create('point', 
			[0.0, 0.0 ],
			{	
				name:'', 
				face:'o', 
				size:4, 
				/*fillOpacity:0,*/ 
				color:'black', 
				fixed:true,
				// trace: true,
				traceAttributes:
				{
					size: 3, 
					strokeWidth: 0, 
					fillOpacity: 0.1
					//strokeOpacity:'0.06'
				}
		});

		var threshold_higher_io = brd_InOut.create('line', 
				[
					[function(){return r.high;}, 0], 
					[function(){return r.high;}, 1]
				],
				{
					color:'red', 
					dash:true, 
					strokeWidth:1, 
					straightfirst:false, 
					straightLast:false, 
					lastArrow:true
				}
		);
		var threshold_lower_io = brd_InOut.create('line', 
				[
					[function(){return r.low;}, 1], 
					[function(){return r.low;}, 0]
				],
				{
					color:'blue', 
					dash:true, 
					strokeWidth:1, 
					straightFirst:false, 
					straightLast:false, 
					lastArrow:true
				}
		);

		var io_branch0 = brd_InOut.create('line',
				[
					[function(){return r.high - 1;}, 0],
					[function(){return r.high;}, 0]
				],
				{
					color:'black',
					strokeWidth:3, 
					straightLast:false
				}
		);
		var io_branch1 = brd_InOut.create('line',
				[
					[function(){return r.low;}, 1],
					[function(){return r.low + 1;}, 1]
				],
				{
					color:'black',
					strokeWidth:3, 
					straightFirst:false
				}
		);

		return [in_out, threshold_higher_io, threshold_lower_io, io_branch0, io_branch1];
	}

	function createObjects_Input(JXG, brd_In, r) {
		var l = brd_In.create('line', 
				[[0, 0], [1, 0]], 
				{fixed:true, strokecolor: 'black', highlightstrokecolor: 'black'}//'blue'}
		);
		var inSlider = brd_In.create('glider', [ 0, 0,	l]);
		inSlider.setAttribute({fixed: false, size:6, name:''});

		var threshold_higher_slide = brd_In.create('line', 
				[[function(){return r.high;}, 0], [function(){return r.high;}, 1]],
				{color:'red', dash:true, strokeWidth:1}
		);
		var threshold_lower_slide = brd_In.create('line', 
				[[function(){return r.low;}, 1], [function(){return r.low;}, 0]],
				{color:'blue', dash:true, strokeWidth:1}
		);

		return [inSlider, threshold_higher_slide, threshold_lower_slide];
	}

	function createObjects_InIn(JXG, brd_InIn, r, isHighLowPP) {
		var diagonal = brd_InIn.create('line', 
			[ 
				[0, 0], [1, 1]
			],
			{
				fixed:true, 
				strokecolor: 'black', 
				highlightstrokecolor: 'black' // 'blue'
			}
		);

		var in_in = brd_InIn.create('glider', 
			[ 0, 0,	diagonal],
			{
				fixed: false,
				size:6, 
				name:''
			}
		);
		// in_in.setAttribute({fixed: false, size:6, name:''});
		
		/**
		 * from http://jsxgraph.uni-bayreuth.de/docs/symbols/Point.html
		 * //If given by a string or a function that coordinate will be constrained
		 * //that means the user won't be able to change the point's position directly by mouse
		 * //because it will be calculated automatically depending on the string or the function's return value.
		 */ 
		// so I guess we can go back to making a polygon!!
		// polygons don't move either...but why can lines??
		var hysteron_pp = brd_InIn.create('point',
			[r.high, r.low], // [0.75, 0.25],
			{
				fixed:false,
				face:'[]',
				size:10,
				name:'',
				color:'green', //color:'lightblue', 
				fillOpacity: function(){return r.output;}
			}
		);

		var threshold_vertical_pp = brd_InIn.create('line', 
			// because we are drawing the threshold all the way across plane we can define the line in a more simple way 
			[
				[function(){
					// console.log("HL = ", isHighLowPP());
					// actually probably better to try to do this some other way
					return isHighLowPP()?r.high:r.low;}, 0],
				[function(){return isHighLowPP()?r.high:r.low;}, 1]
			],
			{
				color: function(){if(isHighLowPP()) return 'red'; else return 'blue';},
				dash: true, 
				strokeWidth: 1
				// straightLast:false
			}
		);

		var threshold_horizontal_pp = brd_InIn.create('line',
				[ [0, function(){return isHighLowPP()?r.low:r.high;}],
				  [1, function(){return isHighLowPP()?r.low:r.high;}]
				],
				{color:function(){return isHighLowPP()?'blue':'red'}, dash:true, strokeWidth:1}//, straightLast:false}
		);
		return [diagonal, in_in, hysteron_pp, threshold_vertical_pp, threshold_horizontal_pp];
	}

	exports.createObjects_IO = createObjects_IO;
	exports.createObjects_Input = createObjects_Input;
	exports.createObjects_InIn = createObjects_InIn;
	
})( typeof exports === 'undefined' ? this['jxgObjects'] = {}: exports );
