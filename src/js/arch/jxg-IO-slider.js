

//var view = [-0.15, 1.15];
var brd_In = JXG.JSXGraph.initBoard(
    'jxg-In', {
			axis:false,  
			grid:false,
			showNavigation:false, showCopyright:false,	
//			boundingbox:[function(){return view[0];}, 0.15,
//			             function(){return view[1];}, -0.15], 
			boundingbox:[-0.15, 0.15, 1.15, -0.15],
			zoom:{wheel:false, factorX:1.5, factorY:1}, 
			pan:{enabled:false},
			// axesAlways:true,
//			zoom:{wheel:true},
//			brd_In.defaultAxes.y.point1.coords.usrCoords = [1, x, 0];
//    		axis:{originx:0.5}
//			origin:{usrCoords:[1, 0.5, 0]}
    }
);
var l = brd_In.create('line', 
		[[0, 0], [1, 0]], 
		{fixed:true, strokecolor: 'black', highlightstrokecolor: 'black'}//'blue'}
);
var inSlider = brd_In.create('glider', [ 0, 0,	l]);
inSlider.setAttribute({fixed: false, size:6, name:''});

inSlider.on('drag', function(){
	qualityDown([brd_InOut, brd_InIn]);

	// should be able to draw in_in up to threshold and then the rest...
		time_since_update = +new Date() - time_last_update;
		time_last_update = +new Date();
		time_current += time_since_update/1000;
		//pt2.setAttribute({size:20});belongs to IO	
		var out = r.update(this.X());
		//in_out.setPositionDirectly(JXG.COORDS_BY_USER, [this.X(), out]);
		in_out.moveTo([this.X(), out]);
		in_in.moveTo([this.X(), this.X()]);
		//in_time_turtle.moveTo([time_current, this.X()]);
		//in_time.setPositionDirectly(JXG.COORDS_BY_USER, [time_current, this.X()]);
		
//	brd_InIn.update();
	    brd_InOut.update();
	    brd_In.update();
	qualityUp([brd_InOut,brd_InIn]);
});
/**
 * make thresholds 
 */
var threshold_higher_slide = brd_In.create('line', 
		[[function(){return r.threshold_higher;}, 0], [function(){return r.threshold_higher;}, 1]],
		{color:'red', dash:true, strokeWidth:1}
);
var threshold_lower_slide = brd_In.create('line', 
		[[function(){return r.threshold_lower;}, 1], [function(){return r.threshold_lower;}, 0]],
		{color:'blue', dash:true, strokeWidth:1}
);