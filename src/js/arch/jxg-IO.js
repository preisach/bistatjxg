
/**
 * math vars
 */
//var input_bounds = [0, 1];
//var inpput_interval = function(return input_bounds[1]-inputbounds[0]);
//var input_min = 0;
var relay_thresholds = [0.25, 0.75];
//var buffer_around_view = [-0.15, 1.15];

var r = new Relay(relay_thresholds[0], relay_thresholds[1], 0);
var pp_highLow = true;//hysteron on right of diagonal
var time_current = 0.0;
var time_last_update = +new Date();//the '+' makes it a number I think

	
var brd_InOut = JXG.JSXGraph.initBoard(
	'jxg-InOut', {
			axis:true,    
			showNavigation:false, showCopyright:false,	 
			boundingbox:[-0.15, 1.15, 1.15, -0.15],
			zoom:{wheel:true, needshift:true, factorX:1.5, factorY:1}, 
			pan:{enabled:true, needshift:true}, 
			showReload:true,
			axesAlways:true,
			// defaultAxes.x.name: 'input',
			// defaultAxes.y.name: 'output',
	}
);
brd_InOut.defaultAxes.x.name = 'input';
brd_InOut.defaultAxes.y.name = 'output';
brd_InOut.fullUpdate();

brd_InOut.zoomIn = function (x, y) {
//		var b = this.getBoundingBox();		
	JXG.Board.prototype.zoomIn.call(this, x, 0.5);
	JXG.Board.prototype.zoomIn.call(brd_In, x, 0);
//    var z = 0.5*(x+y);//project (x, y) onto the diagonal
	JXG.Board.prototype.zoomIn.call(brd_InIn, x, x);//(z, z)
		
	reInit(this.getBoundingBox());		    	
	return this;	
}
brd_InOut.zoomOut = function (x, y) {
	JXG.Board.prototype.zoomOut.call(this, x, 0.5);
	JXG.Board.prototype.zoomOut.call(brd_In, x, 0);
	
//	var z = 0.5*(x+y);//project (x, y) onto the diagonal	
	JXG.Board.prototype.zoomOut.call(brd_InIn, x, x);
	
	reInit(this.getBoundingBox());	    	
	return this;	
}
/**
 * thing is that we have to override the 4 click arrow buttons if we do it this way
 */
/*
touchOriginMove: function (evt) {
	var r = (this.mode === this.BOARD_MODE_MOVE_ORIGIN),
		pos;

	if (r) {
		pos = this.getMousePosition(evt, 0);
		this.moveOrigin(pos[0], pos[1], true);
	}

	return r;
},
*/
brd_InOut.moveOrigin = function (x, y, diff) {
	if(this.mode == this.BOARD_MODE_MOVE_ORIGIN){
		if (typeof(x) != 'undefined' && typeof(y) != 'undefined') {
		this.drag_dy = 0;
		this.origin.scrCoords[1] = x;//this is new x but we want to override this...
		   this.origin.scrCoords[2] = y;
		if (diff) {
		this.origin.scrCoords[1] -= this.drag_dx;
//	            this.origin.scrCoords[2] -= this.drag_dy;
		}
	}
	this.updateCoords().clearTraces().fullUpdate();
	this.triggerEventHandlers(['boundingbox']);
	b = this.getBoundingBox();
	brd_In.setBoundingBox([b[0], 0.15, b[2], -0.15]);
	brd_InIn.setBoundingBox([b[0], b[2], b[2], b[0]]);
	return this;		 
	} else 
	JXG.Board.prototype.moveOrigin.call(this, x, y);
	reInit(this.getBoundingBox());	
	return this;
}
	/*
		initMoveOrigin: function (x, y) {
			this.drag_dx = x - this.origin.scrCoords[1];
			this.drag_dy = y - this.origin.scrCoords[2];

			this.mode = this.BOARD_MODE_MOVE_ORIGIN;
			this.updateQuality = this.BOARD_QUALITY_LOW;
		},
		moveOrigin: function (x, y, diff) {
			if (Type.exists(x) && Type.exists(y)) {
			   this.origin.scrCoords[1] = x;//this is new x but we want to override this...
			   this.origin.scrCoords[2] = y;
					 
				if (diff) {
					this.origin.scrCoords[1] -= this.drag_dx;
					this.origin.scrCoords[2] -= this.drag_dy;                          
				}
			}
			this.updateCoords().clearTraces().fullUpdate();

			this.triggerEventHandlers(['boundingbox']);

			return this;
		},
		brd_InOut.mouseOriginMove = function (evt) {
			var rr = (this.mode === this.BOARD_MODE_MOVE_ORIGIN),
				pos;

			if (rr) {
				pos = this.getMousePosition(evt);
	*/
//        this.moveOrigin(pos[0], pos[1], true);
		this.drag_dy = 0;
		this.moveOrigin(pos[0], this.origin.scrCoords[2], true);

		brd_In.mode = this.BOARD_MODE_MOVE_ORIGIN;
		brd_In.updateQuality = this.BOARD_QUALITY_LOW;
		brd_In.drag_dy = 0;
		brd_In.drag_dx = this.drag_dx;
		brd_In.moveOrigin(pos[0], brd_In.origin.scrCoords[2], true);

		brd_InIn.mode = this.BOARD_MODE_MOVE_ORIGIN;
		brd_InIn.updateQuality = this.BOARD_QUALITY_LOW;
//		var dx = x - this.origin.scrCoords[1];
		brd_InIn.drag_dx = this.drag_dx;
		brd_InIn.drag_dy = -this.drag_dx;
		brd_InIn.moveOrigin(pos[0], brd_InIn.origin.scrCoords[2]+brd_InIn.drag_dy, true);
	}

	return rr;
}
/**
 * problem is that zoom events call moveOrigin()
 * but not the prototype 
 * 
brd_InOut.moveOrigin = function(x, y, diff) {
//	if(this.mode == this.BOARD_MODE_DRAG){
	if(this.mode == this.BOARD_MODE_MOVE_ORIGIN){
//	if(typeof diff != 'undefined'){
//	if(typeof diff != 'undefined' && diff){//false when arrows clicked
		if(diff){//false when arrows clicked
			var dx = x - this.origin.scrCoords[1];
//            this.drag_dx = x - this.origin.scrCoords[1];
			this.drag_dx = dx;
			this.drag_dy = 0;
			JXG.Board.prototype.moveOrigin.call(this, x, this.origin.scrCoords[2], true);
			
			brd_In.drag_dx = dx;
			brd_In.drag_dy = 0;
			JXG.Board.prototype.moveOrigin.call(brd_In, x, brd_In.origin.scrCoords[2], true);

//			var z = 0.5*(x+y);//project (x, y) onto the diagonal
//			var zOld = 0.5*(brd_InIn.origin.scrCoords[1] + brd_InIn.origin.scrCoords[2]);
//			brd_InIn.drag_dx = z-zOld;
//			brd_InIn.drag_dy = z-zOld;			

			//brd_In.origin.scrCoords[1] == brd_InOut.origin.scrCoords[1] == brd_InIn.origin.scrCoords[1]
			
//			brd_InIn.drag_dx = dx;
//			brd_InIn.drag_dy = dx;
//			JXG.Board.prototype.moveOrigin.call(brd_InIn, x, brd_InIn.origin.scrCoords[2]+dx, true);
			b = this.getBoundingBox();
			brd_InIn.setBoundingBox([b[0], b[2], b[2], b[0]]);
			
			

			reInit(this.getBoundingBox());
		}
	}else JXG.Board.prototype.moveOrigin.call(this, x, y);
	return this;
} */


function zeroInputs(l, size){
	var x = l + size*0.15/1.3;
	r.update(x);
	in_out.moveTo([x, 0]);
	inSlider.moveTo([x, 0]);
	in_in.moveTo([x, x]);
	
}

function reInit(bb){
	var boxSize = bb[2] - bb[0];
	r.threshold_lower = bb[0] + boxSize*0.35/1.3;
	r.threshold_higher = bb[0] + boxSize*0.85/1.3;
	if(pp_highLow) hysteron_pp.moveTo([r.threshold_higher, r.threshold_lower]);
	else hysteron_pp.moveTo([r.threshold_lower, r.threshold_higher]);
	zeroInputs(bb[0], boxSize);
}
var in_out = brd_InOut.create(	'point', [0.0, 0.0 ],
{	name:'', face:'o', size:4, /*fillOpacity:0,*/ color:'black', fixed:true
//	trace: true,	traceAttributes:{size: 3, strokeWidth: 0, fillOpacity: 0.1	}//strokeOpacity:'0.06'
});
/**
 * make thresholds 
 */
var threshold_higher_io = brd_InOut.create('line', 
		[[function(){return r.threshold_higher;}, 0], [function(){return r.threshold_higher;}, 1]],
		{color:'red', dash:true, strokeWidth:1, straightfirst:false, straightLast:false, lastArrow:true}
);
var threshold_lower_io = brd_InOut.create('line', 
		[[function(){return r.threshold_lower;}, 1], [function(){return r.threshold_lower;}, 0]],
		{color:'blue', dash:true, strokeWidth:1, straightFirst:false, straightLast:false, lastArrow:true}
);
var io_branch0 = brd_InOut.create('line',
		[[function(){return r.threshold_higher - 1;}, 0],[function(){return r.threshold_higher;}, 0]],
		{color:'black',strokeWidth:3, straightLast:false}
);
var io_branch1 = brd_InOut.create('line',
		[[function(){return r.threshold_lower;}, 1],[function(){return r.threshold_lower + 1;}, 1]],
		{color:'black',strokeWidth:3, straightFirst:false}
);
threshold_lower_io.on('drag', function(evt){
	qualityDown([brd_InOut, brd_In, brd_InIn]);
	bb = brd_InOut.getBoundingBox();
	zeroInputs(bb[0], bb[2]-bb[0]);
	var crds = new JXG.Coords(JXG.COORDS_BY_SCREEN, brd_InOut.getMousePosition(evt), brd_InOut);
	var x = crds.usrCoords[1];//	var x = this.point1.X();
	r.threshold_lower = x;
	if(x > r.threshold_higher - 0.1) r.threshold_higher = x + 0.1;
	
	if(pp_highLow){
		hysteron_pp.moveTo([r.threshold_higher, r.threshold_lower]);
	}else{
		hysteron_pp.moveTo([r.threshold_lower, r.threshold_higher]);		
	}	
//	brd_InIn.update();
	brd_InIn.update();
	brd_In.update();
	qualityUp([brd_InOut, brd_In, brd_InIn]);
});
threshold_higher_io.on('drag', function(evt){
	qualityDown([brd_InOut, brd_In, brd_InIn]);
	bb = brd_InOut.getBoundingBox();
	zeroInputs(bb[0], bb[2]-bb[0]);
	var crds = new JXG.Coords(JXG.COORDS_BY_SCREEN, brd_InOut.getMousePosition(evt), brd_InOut);
	var x = crds.usrCoords[1];
	r.threshold_higher = x;
	if(x - r.threshold_lower < 0.1)	r.threshold_lower = x - 0.1;
	if(pp_highLow) hysteron_pp.moveTo([r.threshold_higher, r.threshold_lower]);
	else hysteron_pp.moveTo([r.threshold_lower, r.threshold_higher]);
//	brd_InIn.update();
	brd_InIn.update();
	brd_In.update();
	qualityUp([brd_InOut, brd_In, brd_InIn]);
});
function qualityDown(brds){	for(brd in brds) brd.updateQuality = brd.BOARD_QUALITY_LOW; }
function qualityUp(brds){	for(brd in brds) brd.updateQuality = brd.BOARD_QUALITY_HIGH; }