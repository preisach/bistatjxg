/**
 * control.js
 * @author marcd 2019-05-29
 */
/*
	JXG is loaded by a <script> tag
*/

require( ["lib/preisach", "boards", "jxgObjects"],
function(p, b, pars, vars) { 
	// var INITIAL_SATURATION = 0;
	var relay_thresholds = [0.25, 0.75];
	//var buffer_around_view = [-0.15, 1.15];

	// var r = new Relay(relay_thresholds[0], relay_thresholds[1], 0);
	var r = new preisach.thermostat(relay_thresholds[0], relay_thresholds[1], 0, 0);
	
	var isHighLowPP = true; //hysteron on right of diagonal?

	var time_current = 0.0;
	var time_last_update = +new Date();//the '+' makes it a number I think

	var brd_InOut, brd_InIn, brd_Input;

	var in_out, threshold_higher_io, threshold_lower_io, io_branch0, io_branch1;
	var inSlider, threshold_higher_slide, threshold_lower_slide;
	var diagonal, in_in, hysteron_pp, threshold_vertical_pp, threshold_horizontal_pp;

	initView();
	initBackgroundEvents();
	initEvents();

	function initView() {
		[brd_InOut, brd_Input, brd_InIn] = 
			boards.createBoards(JXG, [brd_InOut, brd_Input, brd_InIn]);

		[in_out, threshold_higher_io, threshold_lower_io, io_branch0, io_branch1] = 
			jxgObjects.createObjects_IO(JXG, brd_InOut, r);

		[inSlider, threshold_higher_slide, threshold_lower_slide] = 
			jxgObjects.createObjects_Input(JXG, brd_Input, r);
		
		[diagonal, in_in, hysteron_pp, threshold_vertical_pp, threshold_horizontal_pp] = 
			jxgObjects.createObjects_InIn(JXG, brd_InIn, r, function() { return isHighLowPP; });
	}

	function initBackgroundEvents() {	

		brd_InOut.zoomIn = function (x, y) {
			// var b = this.getBoundingBox();		
			JXG.Board.prototype.zoomIn.call(this, x, 0.5);
			JXG.Board.prototype.zoomIn.call(brd_Input, x, 0);
			// var z = 0.5*(x+y);//project (x, y) onto the diagonal
			JXG.Board.prototype.zoomIn.call(brd_InIn, x, x);//(z, z)

			reInit(this.getBoundingBox());
			return this;	
		}
		brd_InOut.zoomOut = function (x, y) {
			JXG.Board.prototype.zoomOut.call(this, x, 0.5);
			JXG.Board.prototype.zoomOut.call(brd_Input, x, 0);
			
			// var z = 0.5*(x+y);//project (x, y) onto the diagonal	
			JXG.Board.prototype.zoomOut.call(brd_InIn, x, x);
			
			reInit(this.getBoundingBox());	    	
			return this;	
		}
		
		brd_InOut.moveOrigin = function (x, y, diff) {
			if(this.mode == this.BOARD_MODE_MOVE_ORIGIN){
				if (typeof(x) != 'undefined' && typeof(y) != 'undefined') {
					this.drag_dy = 0;
					this.origin.scrCoords[1] = x;
					// this is new x but we want to override this...
					// this.origin.scrCoords[2] = y;
					if (diff) {
						this.origin.scrCoords[1] -= this.drag_dx;
						// this.origin.scrCoords[2] -= this.drag_dy;
					}
				}
				this.updateCoords().clearTraces().fullUpdate();
				this.triggerEventHandlers(['boundingbox']);
				b = this.getBoundingBox();
				brd_Input.setBoundingBox([b[0], 0.15, b[2], -0.15]);
				brd_InIn.setBoundingBox([b[0], b[2], b[2], b[0]]);
				return this;
			} else {
				JXG.Board.prototype.moveOrigin.call(this, x, y);
			}
			reInit(this.getBoundingBox());	
			return this;
		}	

		/**
		 * thing is that we have to override the 4 click arrow buttons if we do it this way
		 */
		/*
			touchOriginMove: function (evt) {
				var r = (this.mode === this.BOARD_MODE_MOVE_ORIGIN);
				var pos;
				if (r) {
					pos = this.getMousePosition(evt, 0);
					this.moveOrigin(pos[0], pos[1], true);
				}
				return r;
			},
		*/

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
				brd_Input.setBoundingBox([b[0], 0.15, b[2], -0.15]);
				brd_InOut.setBoundingBox([b[0], 1.15, b[2], -0.15]);
				return this;		 
			}else JXG.Board.prototype.moveOrigin.call(this, x, y);
			reInit(this.getBoundingBox());	
			return this;
		}
		
		/**
		 * zoom on projection of zoom point onto diagonal to always maintain diagonal 
		 */
		brd_InIn.zoomIn = function(x, y){
			var z = 0.5*(x+y);
			// project (x, y) onto the diagonal	
			JXG.Board.prototype.zoomIn.call(this, x, x);
			JXG.Board.prototype.zoomIn.call(brd_InOut, x, 0.5);
			JXG.Board.prototype.zoomIn.call(brd_Input, x, 0);
			
			reInit(this.getBoundingBox());	    	
			return this;	
		}
		brd_InIn.zoomOut = function(x, y){
			var z = 0.5*(x+y);//project (x, y) onto the diagonal	
			JXG.Board.prototype.zoomOut.call(this, x, x);
			
			JXG.Board.prototype.zoomOut.call(brd_InOut, x, 0.5);
			JXG.Board.prototype.zoomOut.call(brd_Input, x, 0);
				
			reInit(this.getBoundingBox());
			// reInitHysteron(this.getBoundingBox());
			// reInitInputs(this.getBoundingBox());	    	
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
					
					brd_Input.drag_dx = dz;//x - this.origin.scrCoords[1];
					brd_Input.drag_dy = 0;
					JXG.Board.prototype.moveOrigin.call(brd_Input, z, brd_Input.origin.scrCoords[2], true);

					reInit(this.getBoundingBox());
				}
			}else JXG.Board.prototype.moveOrigin.call(this, x, y);
			
			return this;
		}*/
	}

	function initEvents() {		
		/*
			IO events
		*/
		threshold_lower_io.on('drag', function(evt){
			// 20190529
			// qualityDown([brd_InOut, brd_In, brd_InIn]);
			bb = brd_InOut.getBoundingBox();
			zeroInputs(bb[0], bb[2]-bb[0]);
			var crds = new JXG.Coords(JXG.COORDS_BY_SCREEN, brd_InOut.getMousePosition(evt), brd_InOut);
			var x = crds.usrCoords[1];//	var x = this.point1.X();
			r.low = x;
			if(x > r.high - 0.1) r.high = x + 0.1;
			
			if(isHighLowPP){
				hysteron_pp.moveTo([r.high, r.low]);
			}else{
				hysteron_pp.moveTo([r.low, r.high]);		
			}	
			// brd_InIn.update();
			brd_InIn.update();
			brd_Input.update();
			// 20190529
			// qualityUp([brd_InOut, brd_In, brd_InIn]);
		});

		threshold_higher_io.on('drag', function(evt){
			// 20190529
			// qualityDown([brd_InOut, brd_In, brd_InIn]);
			bb = brd_InOut.getBoundingBox();
			zeroInputs(bb[0], bb[2]-bb[0]);
			var crds = new JXG.Coords(JXG.COORDS_BY_SCREEN, brd_InOut.getMousePosition(evt), brd_InOut);
			var x = crds.usrCoords[1];
			r.high = x;
			if(x - r.low < 0.1)	r.low = x - 0.1;
			if(isHighLowPP) hysteron_pp.moveTo([r.high, r.low]);
			else hysteron_pp.moveTo([r.low, r.high]);
			// brd_InIn.update();
			brd_InIn.update();
			brd_Input.update();
			// 20190529
			// qualityUp([brd_InOut, brd_In, brd_InIn]);
		});

		/*
			Input events
		*/
		inSlider.on('drag', function(){
			// 20190529
			// qualityDown([brd_InOut, brd_InIn]);
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
			
			// brd_InIn.update();
		    brd_InOut.update();
		    brd_Input.update();
			// 20190529
			// qualityUp([brd_InOut,brd_InIn]);
		});


		/*
			InIn events
		*/
		hysteron_pp.on('drag', function(evt){
			// hystPoly.on('drag', function(evt){
			
			// 20190529
			// qualityDown([brd_InOut, brd_In, brd_InIn]);

			bb = brd_InIn.getBoundingBox();
			zeroInputs(bb[0], bb[2]-bb[0]);

		    var crds = new JXG.Coords(JXG.COORDS_BY_SCREEN, brd_InIn.getMousePosition(evt), brd_InIn);
		   // var x = crds.usrCoords[1];//	var x = this.point1.X();
		    if(crds.usrCoords[1] > crds.usrCoords[2]){
		    	isHighLowPP = true;
				r.high = crds.usrCoords[1];
				r.low = crds.usrCoords[2];
				hysteron_pp.moveTo([r.high, r.low]);
		    }else{
		    	isHighLowPP = false;
				r.low = crds.usrCoords[1]; 
				r.high = crds.usrCoords[2];
				hysteron_pp.moveTo([r.low, r.high]);
		    }
		    brd_InOut.update();
		    brd_Input.update();
		    // brd_InIn.update();

			// 20190529
			// qualityUp([brd_InOut, brd_In, brd_InIn]);
		});

		threshold_vertical_pp.on('drag', function(evt){
			// 20190529
			// qualityDown([brd_InOut, brd_In, brd_InIn]);
			bb = brd_InIn.getBoundingBox();
			zeroInputs(bb[0], bb[2]-bb[0]);
			
			var crds = new JXG.Coords(JXG.COORDS_BY_SCREEN, brd_InIn.getMousePosition(evt), brd_InIn);
			var x = crds.usrCoords[1];
		    var y = crds.usrCoords[2];
		    if(isHighLowPP) {
		    	// plane on right at last update
		    	if(x > r.low){
		    		// if plane still on right
		        	r.high = x;
		       		// r.low = y; //y doesn't change
		        	isHighLowPP = true;
		        	hysteron_pp.moveTo([r.high, r.low]);
		    	}else{
		    		// plane changed to left
		        	r.high = r.low;
		        	r.low = x;
		        	isHighLowPP = false;
		        	hysteron_pp.moveTo([r.low, r.high]);    		
		    	}
			} else { // plane on left at last update
		    	if(x < r.high) { // if plane still on left
		        	r.low = x;
		       		// r.low = y; //y doesn't change
		        	isHighLowPP = false;
		        	hysteron_pp.moveTo([r.low, r.high]);
		    	} else { // plane changed to right
		        	r.low = r.high;
		        	r.high = x;
		        	isHighLowPP = true;
		        	hysteron_pp.moveTo([r.high, r.low]);    		
		    	}		
			}	
		    brd_InOut.update();
		    brd_Input.update();
			// 20190529
			// qualityUp([brd_InOut, brd_In, brd_InIn]);
		});

		threshold_horizontal_pp.on('drag', function(evt){
			// 20190529
			// qualityDown([brd_InOut, brd_In, brd_InIn]);
			bb = brd_InIn.getBoundingBox();
			zeroInputs(bb[0], bb[2]-bb[0]);
			
			var crds = new JXG.Coords(JXG.COORDS_BY_SCREEN, brd_InIn.getMousePosition(evt), brd_InIn);
			var x = crds.usrCoords[1];
		    var y = crds.usrCoords[2];
		    // if plane on right at last update
		    if(isHighLowPP){
		    	// if plane still on right
		    	if(y < r.high){
		        	// r.high = x;//x doesn't change
		        	r.low = y; 
		        	isHighLowPP = true;
		        	hysteron_pp.moveTo([r.high, r.low]);
		    	}
		    	// else plane changed to left
		    	else{
		    		r.low = r.high
		        	r.high = y;
		        	isHighLowPP = false;
		        	hysteron_pp.moveTo([r.low, r.high]);    		
		    	}
			} // else plane on left at last update
		    else{
		    	// if plane still on left
		    	if(y > r.low){
		        	// r.low = x;//x doesn't change
		        	r.high = y; 
		        	isHighLowPP = false;
		        	hysteron_pp.moveTo([r.low, r.high]);
		    	}
		    	// else plane changed to right
		    	else{
		        	r.low = r.high;
		        	r.high = y;
		        	isHighLowPP = true;
		        	hysteron_pp.moveTo([r.high, r.low]);    		
		    	}		
			}		
		    brd_InOut.update();
		    brd_Input.update();
			// 20190529
			// // 20190529
			// // qualityUp([brd_InOut, brd_In, brd_InIn]);
		});

		in_in.on('drag', function(){
			// 20190529
			// qualityDown([brd_InOut, brd_In, brd_InIn]);
			
			// should be able to draw in_in up to threshold and then the rest...
			time_since_update = +new Date() - time_last_update;
			time_last_update = +new Date();
			time_current += time_since_update/1000;
			// pt2.setAttribute({size:20});belongs to IO	
			var out = r.update(this.X());
			// in_out.setPositionDirectly(JXG.COORDS_BY_USER, [this.X(), out]);
			in_out.moveTo([this.X(), out]);//could define in_out as a function cause it is not draggable, 
			inSlider.moveTo([this.X(), 0]);//can't be defined as a function cause it is draggable
			// wouldn't need to set position if defined as function, just board.update()s
			// in_time_turtle.moveTo([time_current, this.X()]);
			// in_time.setPositionDirectly(JXG.COORDS_BY_USER, [time_current, this.X()]);

		    brd_InOut.update();
		    brd_Input.update();
			// 20190529
			// qualityUp([brd_InOut, brd_In, brd_InIn]);
		});
	}

	function zeroInputs(l, size){
		var x = l + size*0.15/1.3;
		r.update(x);
		in_out.moveTo([x, 0]);
		inSlider.moveTo([x, 0]);
		in_in.moveTo([x, x]);		
	}

	function projToDiag(x, y, w, h){
		/*
			// first convert line to normalized unit vector
			var dx = w; // x2 - x1;
			var dy = -h; // y2 - y1;
			var mag = Math.sqrt(2)*w;//Math.sqrt(dx*dx + dy*dy);
			dx /= mag; // 1/sqrt(2)
			dy /= mag; // -1/sqrt(2)
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

	function reInit(bb){
		var boxSize = bb[2] - bb[0];
		r.threshold_lower = bb[0] + boxSize*0.35/1.3;
		r.threshold_higher = bb[0] + boxSize*0.85/1.3;
		if(isHighLowPP) hysteron_pp.moveTo([r.high, r.low]);
		else hysteron_pp.moveTo([r.low, r.high]);
		zeroInputs(bb[0], boxSize);
	}	

	function qualityDown(brds){	for(let brd in brds) brd.updateQuality = brd.BOARD_QUALITY_LOW; }
	function qualityUp(brds)  {	for(let brd in brds) brd.updateQuality = brd.BOARD_QUALITY_HIGH; }
});
