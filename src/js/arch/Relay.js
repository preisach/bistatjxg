/*
	relay.js
	@author marcd 2016-07
*/

function Relay(tl, th, s){
	this.state= s;
	this.threshold_lower = tl;
	this.threshold_higher = th;
	this.update = function update(x) {
		//this.input = input;
		if(x <= this.threshold_lower) this.state = 0;
		else if(x >= this.threshold_higher) this.state = 1;
			return this.state;
	 };
	 this.init = function(inMin, inMax, buf){
		var size = inMax - inMin;
		var x = inMin + buf;
		var threshold_lower_inset = 0.25*(size - 2*buf);
		var threshold_higher_inset = 0.75*(size - 2*buf);
		threshold_lower = x + threshold_lower_inset;
		threshold_higher = x + threshold_higher_inset;
		this.update(x);
		
	 }; 
	/*
		 getState = function(){
			return state;
		 };
	*/
}

/*	
	var relay = {
		state: 			false,
		lowerBound: 	0.0,
		higherBound: 	1.0,
		weight: 		1.0,
		
		update: function (input) {
			//this.input = input;
			if(x <= lowerBound) this.state = false;
			else if(x >= higherBound) this.state = true;
			return this.state;
		},
		setLowerBound: function (a) {
			this.lowerBound = a;
		},
		setHigherBound: function(b) {
			this.higherBound = b;
		},
		setWeight: function (w) {
			this.weight = w;
		},	
	}
*/