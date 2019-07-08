

/**
 *
 */
var bb_pp = [-0.15, 1.15, 1.15, -0.15];		
var brd_InIn = JXG.JSXGraph.initBoard('jxg-PreisachPlane', {
		boundingbox:bb_pp, 
		axis:true, 
		grid:false, 
		showNavigation:false,	showCopyright:false,
		zoom:{wheel:true, needshift:true, factorX:1.5, factorY:1.5}, 
		pan:{enabled:true, needshift:true},
		axesAlways:true,
//		dependentBoards:['brd_InOut', 'brd_In', 'jxg-IO-v-time']
	});

function projToDiag(x, y, w, h){
/*
	//first convert line to normalized unit vector
	var dx = w;//x2 - x1;
	var dy = -h;//y2 - y1;
	var mag = Math.sqrt(2)*w;//Math.sqrt(dx*dx + dy*dy);
	dx /= mag;//1/sqrt(2)
	dy /= mag;//-1/sqrt(2)
	//translate the point and get the dot product
	var lambda = (dx * (x - x1)) + (dy * (y - y1));
	var x4 = (dx * lambda) + x1;
	var y4 = (dy * lambda) + y1;
	
	return [x4, y4];
	*/
	var xx = 0.5*(x-y+h);
	var yy = 0.5*(-x+y+h);
	return [xx, yy];
}
brd_InIn.initMoveOrigin = function (x, y) {
	[x, y] = projToDiag(x, y, this.canvasWidth, this.canvasHeight);
    this.drag_dx = x - this.origin.scrCoords[1];
    this.drag_dy = y - this.origin.scrCoords[2];

    this.mode = this.BOARD_MODE_MOVE_ORIGIN;
    this.updateQuality = this.BOARD_QUALITY_LOW;
},
brd_InIn.moveOrigin = function (x, y, diff) {
    if(this.mode == this.BOARD_MODE_MOVE_ORIGIN){
    	if (typeof(x) != 'undefined' && typeof(y) != 'undefined') {
		    [x, y] = projToDiag(x,  y, this.canvasWidth, this.canvasHeight);		    
		    this.origin.scrCoords[1] = x;
		    this.origin.scrCoords[2] = y;
	
		    if (diff) {
		    	this.origin.scrCoords[1] -= this.drag_dx;
		    	this.origin.scrCoords[2] -= this.drag_dy;                          
		    }
    	}
    	this.updateCoords().clearTraces().fullUpdate();

    	this.triggerEventHandlers(['boundingbox']);

    	b = this.getBoundingBox();
    	brd_In.setBoundingBox([b[0], 0.15, b[2], -0.15]);
    	brd_InOut.setBoundingBox([b[0], 1.15, b[2], -0.15]);
    	return this;		 
	}else JXG.Board.prototype.moveOrigin.call(this, x, y);
	reInit(this.getBoundingBox());	
    return this;
}
/**
 * zoom on projection of zoom point onto diagonal to always maintain diagonal 
 *  
 */
brd_InIn.zoomIn = function(x, y){
	var z = 0.5*(x+y);//project (x, y) onto the diagonal	
	JXG.Board.prototype.zoomIn.call(this, x, x);
	JXG.Board.prototype.zoomIn.call(brd_InOut, x, 0.5);
	JXG.Board.prototype.zoomIn.call(brd_In, x, 0);
	
	reInit(this.getBoundingBox());	    	
	return this;	
}
brd_InIn.zoomOut = function(x, y){
	var z = 0.5*(x+y);//project (x, y) onto the diagonal	
	JXG.Board.prototype.zoomOut.call(this, x, x);
	
	JXG.Board.prototype.zoomOut.call(brd_InOut, x, 0.5);
	JXG.Board.prototype.zoomOut.call(brd_In, x, 0);
		
	reInit(this.getBoundingBox());
//	reInitHysteron(this.getBoundingBox());
//	reInitInputs(this.getBoundingBox());	    	
	return this;	
}
/*
brd_InIn.moveOrigin = function(x, y, diff) {
// if(this.mode == this.BOARD_MODE_DRAG){
	if(this.mode == this.BOARD_MODE_MOVE_ORIGIN){
//	if(typeof diff != 'undefined'){
		if(diff){//false when arrows clicked
			var z = 0.5*(x+y);//project (x, y) onto the diagonal
			var zOld = 0.5*(this.origin.scrCoords[1] + this.origin.scrCoords[2]);
			var dz = z-zOld;
			this.drag_dx = dz;
			this.drag_dy = dz;
			JXG.Board.prototype.moveOrigin.call(this, z, z, true);
			
			brd_InOut.drag_dx = dz;//x - this.origin.scrCoords[1];
			brd_InOut.drag_dy = 0;
			JXG.Board.prototype.moveOrigin.call(brd_InOut, z, brd_InOut.origin.scrCoords[2], true);
			
			brd_In.drag_dx = dz;//x - this.origin.scrCoords[1];
			brd_In.drag_dy = 0;
			JXG.Board.prototype.moveOrigin.call(brd_In, z, brd_In.origin.scrCoords[2], true);

			reInit(this.getBoundingBox());
		}
	}else JXG.Board.prototype.moveOrigin.call(this, x, y);
    
    return this;
}*/
/*******************************************************************************
 * board objects
 */
var diagonal = brd_InIn.create('line', 
		[[0, 0], [1, 1]], 
		{fixed:true, strokecolor: 'black', highlightstrokecolor: 'black'}//'blue'}
);
var in_in = brd_InIn.create('glider', [ 0, 0,	diagonal]);
in_in.setAttribute({fixed: false, size:6, name:''});
/**
 * from http://jsxgraph.uni-bayreuth.de/docs/symbols/Point.html
 * //If given by a string or a function that coordinate will be constrained
 * //that means the user won't be able to change the point's position directly by mouse
 * //because it will be calculated automatically depending on the string or the function's return value.
 */ 
//so I guess we can go back to making a polygon!!
//polygons don't move either...but why can lines??
var hysteron_pp = brd_InIn.create('point', [r.threshold_higher, r.threshold_lower],//[0.75, 0.25],
			{fixed:false, face:'[]', size:10, name:'', color:'green', //color:'lightblue', 
	fillOpacity:function(){return r.state;}});

var threshold_vertical_pp = brd_InIn.create('line', 
		//because we are drawing the threshold all the way across plane we can define the line in a more simple way 
		[ [function(){return pp_highLow?r.threshold_higher:r.threshold_lower;},0],
		  [function(){return pp_highLow?r.threshold_higher:r.threshold_lower;}, 1]
		],
		{color:function(){if(pp_highLow) return 'red'; else return 'blue';}, dash:true, strokeWidth:1}//, straightLast:false}
);
var threshold_horizontal_pp = brd_InIn.create('line',
		[ [0, function(){return pp_highLow?r.threshold_lower:r.threshold_higher;}],
		  [1, function(){return pp_highLow?r.threshold_lower:r.threshold_higher;}]
		],
		{color:function(){return pp_highLow?'blue':'red'}, dash:true, strokeWidth:1}//, straightLast:false}
);
/**************************************************************************
 * board object action events
 */
hysteron_pp.on('drag', function(evt){
//hystPoly.on('drag', function(evt){
	qualityDown([brd_InOut, brd_In, brd_InIn]);
	bb = brd_InIn.getBoundingBox();
	zeroInputs(bb[0], bb[2]-bb[0]);

    var crds = new JXG.Coords(JXG.COORDS_BY_SCREEN, brd_InIn.getMousePosition(evt), brd_InIn);
//    var x = crds.usrCoords[1];//	var x = this.point1.X();
    if(crds.usrCoords[1] > crds.usrCoords[2]){
    	pp_highLow = true;
		r.threshold_higher = crds.usrCoords[1];
		r.threshold_lower = crds.usrCoords[2];
		hysteron_pp.moveTo([r.threshold_higher, r.threshold_lower]);
    }else{
    	pp_highLow = false;
		r.threshold_lower = crds.usrCoords[1]; 
		r.threshold_higher = crds.usrCoords[2];
		hysteron_pp.moveTo([r.threshold_lower, r.threshold_higher]);
    }
    brd_InOut.update();
    brd_In.update();
	qualityUp([brd_InOut, brd_In, brd_InIn]);
});
threshold_vertical_pp.on('drag', function(evt){
	qualityDown([brd_InOut, brd_In, brd_InIn]);
	bb = brd_InIn.getBoundingBox();
	zeroInputs(bb[0], bb[2]-bb[0]);
	
	var crds = new JXG.Coords(JXG.COORDS_BY_SCREEN, brd_InIn.getMousePosition(evt), brd_InIn);
	var x = crds.usrCoords[1];
    var y = crds.usrCoords[2];
    if(pp_highLow){//plane on right at last update
    	if(x > r.threshold_lower){//if plane still on right
        	r.threshold_higher = x;
//        	r.threshold_lower = y; //y doesn't change
        	pp_highLow = true;
        	hysteron_pp.moveTo([r.threshold_higher, r.threshold_lower]);
    	}else{//plane changed to left
        	r.threshold_higher = r.threshold_lower;
        	r.threshold_lower = x;
        	pp_highLow = false;
        	hysteron_pp.moveTo([r.threshold_lower, r.threshold_higher]);    		
    	}
	}else{//plane on left at last update
    	if(x < r.threshold_higher){//if plane still on left
        	r.threshold_lower = x;
//        	r.threshold_lower = y; //y doesn't change
        	pp_highLow = false;
        	hysteron_pp.moveTo([r.threshold_lower, r.threshold_higher]);
    	}else{//plane changed to right
        	r.threshold_lower = r.threshold_higher;
        	r.threshold_higher = x;
        	pp_highLow = true;
        	hysteron_pp.moveTo([r.threshold_higher, r.threshold_lower]);    		
    	}		
	}	
    brd_InOut.update();
    brd_In.update();
	qualityUp([brd_InOut, brd_In, brd_InIn]);
}
);
threshold_horizontal_pp.on('drag', function(evt){
	qualityDown([brd_InOut, brd_In, brd_InIn]);
	bb = brd_InIn.getBoundingBox();
	zeroInputs(bb[0], bb[2]-bb[0]);
	
	var crds = new JXG.Coords(JXG.COORDS_BY_SCREEN, brd_InIn.getMousePosition(evt), brd_InIn);
	var x = crds.usrCoords[1];
    var y = crds.usrCoords[2];
    // if plane on right at last update
    if(pp_highLow){
    	// if plane still on right
    	if(y < r.threshold_higher){
        	// r.threshold_higher = x;//x doesn't change
        	r.threshold_lower = y; 
        	pp_highLow = true;
        	hysteron_pp.moveTo([r.threshold_higher, r.threshold_lower]);
    	}
    	// else plane changed to left
    	else{
    		r.threshold_lower = r.threshold_higher
        	r.threshold_higher = y;
        	pp_highLow = false;
        	hysteron_pp.moveTo([r.threshold_lower, r.threshold_higher]);    		
    	}
	}
    // else plane on left at last update
    else{
    	// if plane still on left
    	if(y > r.threshold_lower){
        	// r.threshold_lower = x;//x doesn't change
        	r.threshold_higher = y; 
        	pp_highLow = false;
        	hysteron_pp.moveTo([r.threshold_lower, r.threshold_higher]);
    	}
    	// else plane changed to right
    	else{
        	r.threshold_lower = r.threshold_higher;
        	r.threshold_higher = y;
        	pp_highLow = true;
        	hysteron_pp.moveTo([r.threshold_higher, r.threshold_lower]);    		
    	}		
	}		
    brd_InOut.update();
    brd_In.update();
	qualityUp([brd_InOut, brd_In, brd_InIn]);
}
);
in_in.on('drag', function(){
	qualityDown([brd_InOut, brd_In, brd_InIn]);
	
// should be able to draw in_in up to threshold and then the rest...
	time_since_update = +new Date() - time_last_update;
	time_last_update = +new Date();
	time_current += time_since_update/1000;
	//pt2.setAttribute({size:20});belongs to IO	
	var out = r.update(this.X());
	//in_out.setPositionDirectly(JXG.COORDS_BY_USER, [this.X(), out]);
	in_out.moveTo([this.X(), out]);//could define in_out as a function cause it is not draggable, 
	inSlider.moveTo([this.X(), 0]);//can't be defined as a function cause it is draggable
	//wouldn't need to set position if defined as function, just board.update()s
	//in_time_turtle.moveTo([time_current, this.X()]);
	//in_time.setPositionDirectly(JXG.COORDS_BY_USER, [time_current, this.X()]);

    brd_InOut.update();
    brd_In.update();
	qualityUp([brd_InOut, brd_In, brd_InIn]);
});