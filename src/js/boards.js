/**
 * @author marcd 2019
 */

(function(exports) {

	/**
	 * @param
	 * @return
	 */
	function createBoards(JXG, [brd_InOut, brd_Input, brd_InIn]) {

		brd_InOut = JXG.JSXGraph.initBoard('jxg-InOut', 
			{
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

		//var view = [-0.15, 1.15];
		brd_Input = JXG.JSXGraph.initBoard('jxg-In', 
			{
				axis:false, 
				grid:false,
				showNavigation:false, showCopyright:false,
				// boundingbox:[function(){return view[0];}, 0.15,
				// function(){return view[1];}, -0.15], 
				boundingbox:[-0.15, 0.15, 1.15, -0.15],
				zoom:{wheel:false, factorX:1.5, factorY:1}, 
				pan:{enabled:false},
				// axesAlways:true,
				// zoom:{wheel:true},
				// brd_Input.defaultAxes.y.point1.coords.usrCoords = [1, x, 0];
					// axis:{originx:0.5}
				// origin:{usrCoords:[1, 0.5, 0]}
			});

		var bb_pp = [-0.15, 1.15, 1.15, -0.15];		
		brd_InIn = JXG.JSXGraph.initBoard('jxg-PreisachPlane', {
				boundingbox:bb_pp, 
				axis:true, 
				grid:false, 
				showNavigation:false,	showCopyright:false,
				zoom:{wheel:true, needshift:true, factorX:1.5, factorY:1.5}, 
				pan:{enabled:true, needshift:true},
				axesAlways:true,
				// dependentBoards:['brd_InOut', 'brd_Input', 'jxg-IO-v-time']
			});
		/*
			return [brd_InOut, brd_Input, brd_InIn];
			}

			function addBoardListeners(JXG, [brd_InOut, brd_Input, brd_InIn], x, y)	{
		*/

		return [brd_InOut, brd_Input, brd_InIn];
	}

	
	exports.createBoards = createBoards;
	// exports.createBoard_Input = createBoard_Input;
	// exports.createBoard_InIn = createBoard_InIn;

	// exports.addBoardListeners = addBoardListeners;

})( typeof exports === 'undefined' ? this['boards'] = {}: exports );
