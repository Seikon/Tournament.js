//tournament visualization mode
var MODE_ENUM = {
	
	NORMAL: 0,
	DIVIDED: 1
}
//tournament animation mode
var MODE_ANIMATION = {
	
	FADEOUT: 0,
	BY_LETTER: 1
	
}

//Constructor
function Tournament(canvas,cellHeight,cellWidth,participants,cellsColor,fontColor,backgroundColor,bracketsColor,mode,animation,fontType,fontSize) {
	
	//--Dimensions--
    this.cellHeight = cellHeight;
	this.cellWidth = cellWidth;
	this.textWidth;
	this.textHeight;
	this.roundWidth;
	this.textmargin = 10;
	//--References--
	this.self = this;
	//--Tournament Abstractions--
	this.cellCords = [];
	this.participants = participants;
	//---Style---
	this.cellsColor = cellsColor;
	this.fontColor = fontColor;
	this.backgroundColor = backgroundColor;
	this.bracketsColor = bracketsColor;
	this.fontType = fontType;
	this.fontSize = fontSize;
	//---Canvas--
	this.canvas = canvas;
	this.ctx = this.canvas.getContext("2d");
	//--Control Intervals
	this.animationIntervals = [];
	//--Enums--
	this.mode = mode;
	this.animation = animation;
}

Tournament.prototype.init = function() {
	
	this.roundWidth = this.cellWidth * 1.67;
	
	//The Number of the total rounds is given by the log 2 base of the number of participants.
	this.totalRounds = Math.log2(this.participants.length / 2);
	//Size of fade out transit refresh 
	// -2 to recalculate canvas text error drawing
	this.textWidth = (this.cellWidth -2) / 1.2;
	//Text Height based on px fontsize
	this.textHeight = this.fontSize;
	//Reference self object to access it in another running context like intervals,timeOut,objects events...
	this.self = this;
	//Reference to father(Tournament.js) in canvas to access atribute members in canvas event listeners
	this.canvas.objectParent = this.self;
	//Color canvas
	this.canvas.style.backgroundColor = this.backgroundColor;
	//Events listener
	this.canvas.addEventListener("mousedown",this.touchStartHandler,false);
	this.canvas.addEventListener("touchstart",this.touchStartHandler,false);
	
}
//Animation fadeout when a battle resolution
//It works drawing the text and cleaning it in the canvas multiple times until get the 100% alpha transparency
//It uses a bit complex interval array(one for each animation) with references to the parent(Tournament) for a completely creation a destruction of each interval
Tournament.prototype.fadeOut = function(text,x,y,width,height,font) {
					
				context = this.ctx;
				
				self = this;
				
				self.canvas.removeEventListener("mousedown",this.touchStartHandler,false);
				self.canvas.removeEventListener("touchstart",this.touchStartHandler,false);
				
				this.animationIntervals.push(1);
				
				var intervals = this.animationIntervals;				
				alpha = 0.0;
								
				var secuence = setInterval(function () {
					
					context.clearRect(x - 1,y - 20,width,height);
					
					context.fillStyle = "rgba("+ self.fontColor[0] +","+self.fontColor[1]+","+self.fontColor[2]+","+ alpha +")";
					context.font = self.fontSize + "px" + " " + self.fontType;
					context.fillText(text,x,y);
					
					alpha += 0.03;
					
					if(alpha > 1) {
						
						clearInterval(secuence);
						intervals.splice(0,1);

						if(intervals.length === 0)
							self.canvas.addEventListener("mousedown",self.touchStartHandler,false);
							self.canvas.addEventListener("touchstart",self.touchStartHandler,false);
						
					}
					
				},30,alpha,intervals);
								
}

Tournament.prototype.byletter = function(text,x,y,width,height,font) {
	
				context = this.ctx;
				
				self = this;
				
				self.canvas.removeEventListener("mousedown",this.touchStartHandler,false);
				
				this.animationIntervals.push(1);
								
				var intervals = this.animationIntervals;
				var textIndex = 0;
				
			var secuence = setInterval(function () {
					
					context.clearRect(x - 1,y - 20,width,height);
					
					context.fillStyle = "rgb("+ self.fontColor[0] +","+self.fontColor[1]+","+self.fontColor[2]+")";
					context.font = self.fontSize + "px" + " " + self.fontType;
					context.fillText(text.substring(0,textIndex),x,y);
										
					if(textIndex >= text.length) {

						clearInterval(secuence);
						intervals.splice(0,1);

						if(intervals.length === 0)
							self.canvas.addEventListener("mousedown",self.touchStartHandler,false);
							self.canvas.addEventListener("touchstart",self.touchStartHandler,false);
						
					}
					
					textIndex ++;
					
				},50,secuence,intervals);
}

//Responsive Event listener when user click or touch the canvas
Tournament.prototype.touchStartHandler = function(e) {
				
	var rect = this.getBoundingClientRect();
	//Where user has produced the click (x,y)
	var xMouse = e.clientX;
	var yMouse = e.clientY;
	//Diference beetwen screen and canvas
	var xCanvas = xMouse - rect.left;
	var yCanvas = yMouse - rect.top;
	//Check if user has clicked in a participant cell and move it to the next round if positive result
	var participant = coliderDetection(xCanvas,yCanvas,this.objectParent.cellCords);
	
	if (participant != null) 
	{
		this.objectParent.moveNextRound(participant);
		
	}
		
}
//Responsive Event listener when user leave mouse or finger from the canvas
Tournament.prototype.moveNextRound = function(participant) {
	
	//Destiny of the participant
	var destiny = this.calculateNextRound(participant);
	//search the teorical destiny of the participant with all cells and introuce it in the cell
	//It could have no destiny because of last round winner
	for(i=0; i < this.cellCords.length;i++)
	{
		if(this.cellCords[i].round === destiny.round && this.cellCords[i].cell === destiny.cell)
		{
			this.cellCords[i].element = participant.element;
			this.drawParticipant(this.cellCords[i],participant);
		}

	}
	
}
//This functions returns the next round and cell when user click in a cell (this produce battle resolution)
Tournament.prototype.calculateNextRound = function(participant) {
	//To calculate that only sum one round to the participant. And to calculate the cell, use the whole part of a cell number divided by 2
	//Example: "participant 0:7" has to be the next round -> 0 +1 = 1 and next cell->  7/2 = Math.floor(3.5) = 3 so participant go to "participant:2:3"
	//And its rival in case of win would go to the same round: participant 0:6 round -> 0 +1 = 1 and next cell->  6/2 = Math.floor(3) = 3 "participant:2:3"
	var round = participant.round + 1;
	var cell = Math.floor(participant.cell / 2);
	
	return {round: round,cell: cell};
}
//Draw participants in each cell with the expecific animation method. For the moment only FadeOut is available like animation method
Tournament.prototype.drawParticipant = function(participant,participantBefore) {
				
				switch(this.animation)
				
				{
					case MODE_ANIMATION.FADEOUT:
					this.fadeOut(participant.element,((participant.x0 + participant.x1) / 2) - this.cellWidth / 2.5,((participant.y0 + participant.y1) / 2) + (this.cellHeight / 4.5),this.textWidth,this.textHeight,this.fontSize + " " + this.fontType);
					break;
					
					case MODE_ANIMATION.BY_LETTER:
					this.byletter(participant.element,((participant.x0 + participant.x1) / 2) - this.cellWidth / 2.5,((participant.y0 + participant.y1) / 2) + (this.cellHeight / 4.5),this.textWidth,this.textHeight,this.fontSize + " " + this.fontType);
					break;
				}
										
}

//Colider detection if user touch or click canvas in a cell
function coliderDetection (x,y,arrayCords) {
	//check if x and y cors are in range of each cell
	for(i=0; i < arrayCords.length; i++) 
	{
		if(x >= arrayCords[i].x0 && x <= arrayCords[i].x1)
		{

			if(y >= arrayCords[i].y0 && y <= arrayCords[i].y1)
					return arrayCords[i];
			
		}
	}
	
	return null;
}

//Generate Tournament based on Mode enum.
//The tournament it can be generated by this way or calling each method(Generate Cells, Generate Brackects, Locate Participants) separatelly implements animations and visual effects
Tournament.prototype.generateTournament = function() {
	
		switch(this.mode) {
			
			case MODE_ENUM.NORMAL:
				//
				this.generateCells();
				this.generateBrackets();
				this.locateParticipants();
				break;
				
			case MODE_ENUM.DIVIDED:
				
				this.generateCellsDivided();
				this.generateBracketsDivided();
				this.locateParticipants();
				break;
			
			
		}
	
	}
//Draws  the blocks or cell and store its cordinates(x0-x1,y0-y1) of participants of a normal tournament
Tournament.prototype.generateCells = function() {
			//I wanted to simply the cell generation proccess to the minimun, but it probably could be more simply

			//two for, i for each round and j for each cell
			//Number total of rounds is log 2 of total of participants. Example 16 participants -> Log2(16) =  
			for(i = 0; i < Math.log2(this.participants.length) + 1; i++) 
			{
				this.ctx.strokeStyle = this.bracketsColor;
		
				switch(i)
				{
					case 0:
						for(j=0; j < this.participants.length; j++) 
						{
							this.ctx.strokeRect(this.roundWidth * i,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),this.cellWidth,this.cellHeight);
							this.cellCords.push(
												{ x0:this.roundWidth * i,
												  x1: this.roundWidth * i + this.cellWidth,
												  y0:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),
												  y1: (this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight,
												  round: i,
												  cell: j,
												});
						}
					break;
				
					case Math.log2(this.participants.length):
						this.ctx.strokeRect(this.roundWidth * i,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (0 * Math.pow(2, i + 1))),this.cellWidth,this.cellHeight);
						this.cellCords.push(
										    { x0:this.roundWidth * i,
											  x1: this.roundWidth * i + this.cellWidth,
											  y0:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (0 * Math.pow(2, i + 1))),
											  y1: (this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (0 * Math.pow(2, i + 1))) + this.cellHeight,
											  round: i,
											  cell: 0,
											});
					break;
				
					default:
						for(j=0; j < this.participants.length / Math.pow(2,i); j++) 
						{
							this.ctx.strokeRect(this.roundWidth * i,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),this.cellWidth,this.cellHeight);
							this.cellCords.push(
												{ x0:this.roundWidth * i,
												  x1: this.roundWidth * i + this.cellWidth,
												  y0:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),
												  y1: (this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight,
												  round: i,
												  cell: j,
												});
						}
					break;
				}
			}
			
			this.self = this;
			
}
//Draws  the blocks or cell and store its cordinates(x0-x1,y0-y1) of participants of a divided tournament
Tournament.prototype.generateCellsDivided = function() {
	
	for(i = 0; i <= this.totalRounds + 1; i++) 
	{
				this.ctx.strokeStyle = this.bracketsColor;
		
				switch(i) 
				{
					case 0:
						for(j = 0; j < this.participants.length / 2; j++)
						{	
							//First Node
							this.ctx.strokeRect(this.roundWidth * i,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),this.cellWidth,this.cellHeight);
							this.cellCords.push(
												{ x0:this.roundWidth * i,
												  x1:this.roundWidth * i + this.cellWidth,
												  y0:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),
												  y1: (this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight,
												  round: i,
												  cell: j,
												});
							
							//Second Node
							this.ctx.strokeRect(this.roundWidth * Math.log2(this.participants.length) * 2 - this.roundWidth,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),this.cellWidth,this.cellHeight);
							this.cellCords.push(
												{ x0:this.roundWidth * Math.log2(this.participants.length) * 2 - this.roundWidth,
												  x1:this.roundWidth * Math.log2(this.participants.length) * 2 - this.roundWidth + this.cellWidth,
												  y0:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),
												  y1:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight,
												  round:i,
												  cell:j + this.participants.length / 2,
							});
						}
							
					break;
					
					case this.totalRounds + 1:
						this.ctx.strokeRect(this.roundWidth * i - this.cellWidth / 1.2,(this.cellHeight *  Math.pow(2, i -1) - (this.cellHeight)) + (this.cellHeight * 2),this.cellWidth,this.cellHeight);
						
						this.cellCords.push(
										    { x0:this.roundWidth * i - this.cellWidth / 1.2,
											  x1: this.roundWidth * i - this.cellWidth / 1.2 + this.cellWidth,
											  y0:(this.cellHeight *  Math.pow(2, i -1) - (this.cellHeight)) + (this.cellHeight * 2),
											  y1: (this.cellHeight *  Math.pow(2, i -1) - (this.cellHeight)) + (this.cellHeight * 2) + this.cellHeight,
											  round: i,
											  cell: 0,
											});	
						break;
										
					case Math.log2(this.participants.length / 2):
						//First Node
						this.ctx.strokeRect(this.roundWidth * i,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (0 * Math.pow(2, i + 1))),this.cellWidth,this.cellHeight);
						
						this.cellCords.push(
										    { x0:this.roundWidth * i,
											  x1: this.roundWidth * i + this.cellWidth,
											  y0:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (0 * Math.pow(2, i + 1))),
											  y1: (this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (0 * Math.pow(2, i + 1))) + this.cellHeight,
											  round: i,
											  cell: 0,
											});
						//Last Node
						this.ctx.strokeRect(this.roundWidth * Math.log2(this.participants.length),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (0 * Math.pow(2, i + 1))),this.cellWidth,this.cellHeight);
						this.cellCords.push(
										    { x0:this.roundWidth * Math.log2(this.participants.length),
											  x1: this.roundWidth * Math.log2(this.participants.length) + this.cellWidth,
											  y0:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (0 * Math.pow(2, i + 1))),
											  y1: (this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (0 * Math.pow(2, i + 1))) + this.cellHeight,
											  round: i,
											  cell: 1,
											});		
					break;
					
					default:
						for(j = 0; j < this.participants.length / (Math.pow(2,i) * 2); j++)
						{
							//First Node
							this.ctx.strokeRect(this.roundWidth * i,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),this.cellWidth,this.cellHeight);
							this.cellCords.push(
												{ x0:this.roundWidth * i,
												  x1: this.roundWidth * i + this.cellWidth,
												  y0:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),
												  y1: (this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight,
												  round: i,
												  cell: j,
												});
							//Second Node
							this.ctx.strokeRect(this.roundWidth * this.totalRounds + (this.roundWidth * (Math.log2(this.participants.length / 2)) - ((i -1) * this.roundWidth)),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),this.cellWidth,this.cellHeight);
							this.cellCords.push(
												{ x0:this.roundWidth * this.totalRounds + (this.roundWidth * (Math.log2(this.participants.length / 2)) - ((i -1) * this.roundWidth)),
												  x1:this.roundWidth * this.totalRounds + (this.roundWidth * (Math.log2(this.participants.length / 2)) - ((i -1) * this.roundWidth)) + this.cellWidth,
												  y0:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))),
												  y1:(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight,
												  round:i,
												  cell:Math.floor(j + this.participants.length / (2 * (i + 1))),
							});
						}
					break;
					
					
				}
	}
			
			this.self = this;
	
	
}
//Draws the brackets of a normal tournament
Tournament.prototype.generateBrackets = function() {
	
	
		for(i = 0; i < Math.log2(this.participants.length) + 1; i++) 
		{
		
			switch(i)
			{
				case 0:
					for(j=0; j < this.participants.length; j++) 
					{
						//horizontal movement
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4 ,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.stroke();
						
						if(j % 2 ==0) 
						{
						//vertical movement
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,((this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2) + (this.cellHeight * Math.pow(2, i + 1)));
						this.ctx.stroke();
						
						//Relation Line
						this.ctx.beginPath();
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 2.5,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i)+ this.cellHeight / 2);
						this.ctx.stroke();
						
						}
					}
				break;
				
				case Math.log2(this.participants.length):
				break;
				
				default:
					for(j=0; j < this.participants.length / Math.pow(2,i); j++) 
					{
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4 ,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.stroke();
						
						if(j % 2 ==0) 
						{
						//vertical movement
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,((this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2) + (this.cellHeight * Math.pow(2, i + 1)));
						this.ctx.stroke();
						
						//Relation Line
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 2.5,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i)+ this.cellHeight / 2);
						this.ctx.stroke();
						
						}
					}
				break;
			}
			
		}
		
		this.self = this;
			
}
//Draws the brackets of a divided tournament
Tournament.prototype.generateBracketsDivided = function() {
	
	
		for(i = 0; i <= Math.log2(this.participants.length / 2); i++) 
		{
		
			switch(i)
			{
				case 0:
					for(j=0; j < this.participants.length / 2; j++) 
					{
						//horizontal movement D1
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4 ,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.stroke();
						//horizontal movement D2
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo(this.roundWidth * Math.log2(this.participants.length) * 2 - this.roundWidth ,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo(this.roundWidth * Math.log2(this.participants.length) * 2 - this.roundWidth  - (this.roundWidth / 4),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.stroke();						
						
						if(j % 2 ==0) 
						{
						//vertical movement D1
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,((this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2) + (this.cellHeight * Math.pow(2, i + 1)));
						this.ctx.stroke();
						//vertical movement D2
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo(this.roundWidth * Math.log2(this.participants.length) * 2 - this.roundWidth  - (this.roundWidth / 4),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo(this.roundWidth * Math.log2(this.participants.length) * 2 - this.roundWidth  - (this.roundWidth / 4),((this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2) + (this.cellHeight * Math.pow(2, i + 1)));
						this.ctx.stroke();
						//Relation Line D1
						this.ctx.beginPath();
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 2.5,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i)+ this.cellHeight / 2);
						this.ctx.stroke();
						//Relation Line 2 D2
						this.ctx.beginPath();
						this.ctx.moveTo(this.roundWidth * Math.log2(this.participants.length) * 2 - this.roundWidth   - (this.roundWidth / 4),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i) + this.cellHeight / 2);
						this.ctx.lineTo(this.roundWidth * Math.log2(this.participants.length) * 2 - this.roundWidth   - (this.roundWidth / 2.5),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i)+ this.cellHeight / 2);
						this.ctx.stroke();
						}
					}
				break;
				
				case Math.log2(this.participants.length / 2):
						//Horizontal Movement
						this.ctx.beginPath();
						this.ctx.moveTo((this.roundWidth * i + this.cellWidth) + (this.cellWidth / 3),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight / 2),this.cellWidth,this.cellHeight);
						this.ctx.lineTo((this.roundWidth * i + this.cellWidth) + (this.cellWidth / 3),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * 2),this.cellWidth,this.cellHeight);
						this.ctx.stroke();
						//Relation
						this.ctx.beginPath();
						this.ctx.moveTo(this.roundWidth * i + this.cellWidth,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight / 2),this.cellWidth,this.cellHeight);
						this.ctx.lineTo((this.roundWidth * i + this.cellWidth) + (this.cellWidth / 1.5),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight / 2),this.cellWidth,this.cellHeight);						
						this.ctx.stroke();						
				break;
				
				default:
					for(j=0; j < this.participants.length / Math.pow(2,i) / 2; j++) 
					{	
						//horizontal movement D1
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4 ,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.stroke();
						////horizontal movement D2
						this.ctx.beginPath();
						this.ctx.moveTo(this.roundWidth * this.totalRounds + (this.roundWidth * (Math.log2(this.participants.length / 2)) - ((i -1) * this.roundWidth)),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo(this.roundWidth * this.totalRounds + (this.roundWidth * (Math.log2(this.participants.length / 2)) - ((i -1) * this.roundWidth)) - (this.roundWidth / 4),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.stroke();
						
						if(j % 2 ==0) 
						{
						//vertical movement
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,((this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2) + (this.cellHeight * Math.pow(2, i + 1)));
						this.ctx.stroke();
						//vertical movement 2
						this.ctx.beginPath();
						this.ctx.moveTo(this.roundWidth * this.totalRounds + (this.roundWidth * (Math.log2(this.participants.length / 2)) - ((i -1) * this.roundWidth)) - (this.roundWidth / 4),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2);
						this.ctx.lineTo(this.roundWidth * this.totalRounds + (this.roundWidth * (Math.log2(this.participants.length / 2)) - ((i -1) * this.roundWidth)) - (this.roundWidth / 4),((this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight / 2) + (this.cellHeight * Math.pow(2, i + 1)));
						this.ctx.stroke();
						//Relation Line
						this.ctx.beginPath();
						this.ctx.strokeStyle = this.bracketsColor;
						this.ctx.moveTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 4,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i) + this.cellHeight / 2);
						this.ctx.lineTo((this.roundWidth * i) + this.cellWidth + this.roundWidth / 2.5,(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i)+ this.cellHeight / 2);
						this.ctx.stroke();
						//Relation Line 2
						this.ctx.beginPath();
						this.ctx.moveTo(this.roundWidth * this.totalRounds + (this.roundWidth * (Math.log2(this.participants.length / 2)) - ((i -1) * this.roundWidth)) - (this.roundWidth / 4),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i) + this.cellHeight / 2);
						this.ctx.lineTo(this.roundWidth * this.totalRounds + (this.roundWidth * (Math.log2(this.participants.length / 2)) - ((i -1) * this.roundWidth)) - (this.roundWidth / 2.5),(this.cellHeight *  Math.pow(2, i) - (this.cellHeight)) + (this.cellHeight * (j * Math.pow(2, i + 1))) + this.cellHeight * Math.pow(2, i) + this.cellHeight / 2);
						this.ctx.stroke();
						}
					}
				break;
			}
			
		}
		
		this.self = this;
			
}
//Draw the text of the participants in its inital cells
Tournament.prototype.locateParticipants = function() {
	
			var locations = this.participants.slice(0,this.participants.length);
	
			for(j=0; j < this.participants.length; j++) 
			{
				var number = Math.floor(Math.random() * (locations.length));
				
				var element = locations.slice(number,number + 1);
				
				this.cellCords[j].element = element[0];
				
				locations.splice(number,1);
				
				this.drawParticipant(this.cellCords[j]);
			}
			
			this.self = this;
}