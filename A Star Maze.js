

// ==== Starter World =================================================================================================
// This code is designed for use on the Ancient Brain site.
// This code may be freely copied and edited by anyone on the Ancient Brain site.
// To include a working run of this program on another site, see the "Embed code" links provided on Ancient Brain.
// ====================================================================================================================



// =============================================================================================
// More complex starter World 
// 3d-effect Maze World (really a 2-D problem)
// Movement is on a semi-visible grid of squares 
//
// This more complex World shows:
// - Skybox
// - Internal maze (randomly drawn each time)
// - Enemy actively chases agent
// - Music/audio
// - 2D world (clone this and set show3d = false)
// - User keyboard control (clone this and comment out Mind actions to see)
// =============================================================================================


// =============================================================================================
// Scoring:
// Bad steps = steps where enemy is within one step of agent.
// Good steps = steps where enemy is further away. 
// Score = good steps as percentage of all steps.
//
// There are situations where agent is trapped and cannot move.
// If this happens, you score zero.
// =============================================================================================


 





// ===================================================================================================================
// === Start of tweaker's box ======================================================================================== 
// ===================================================================================================================

// The easiest things to modify are in this box.
// You should be able to change things in this box without being a JavaScript programmer.
// Go ahead and change some of these. What's the worst that could happen?


AB.clockTick       = 100;    

	// Speed of run: Step every n milliseconds. Default 100.
	
AB.maxSteps        = 1000;    

	// Length of run: Maximum length of run in steps. Default 1000.

AB.screenshotStep  = 50;   
  
	// Take screenshot on this step. (All resources should have finished loading.) Default 50.



//---- global constants: -------------------------------------------------------

	const show3d = false;						// Switch between 3d and 2d view (both using Three.js) 


 const TEXTURE_WALL 	= '/uploads/jai/1606495887.png' ;
 const TEXTURE_MAZE 	= '/uploads/jai/1606496247.png' ;
 const TEXTURE_AGENT 	= '/uploads/jai/1606496156.png' ;
 const TEXTURE_ENEMY 	= '/uploads/jai/1606496112.png' ;
 
// credits:
// http://commons.wikimedia.org/wiki/File:Old_door_handles.jpg
// https://commons.wikimedia.org/wiki/Category:Pac-Man_icons
// https://commons.wikimedia.org/wiki/Category:Skull_and_crossbone_icons
// http://en.wikipedia.org/wiki/File:Inscription_displaying_apices_(from_the_shrine_of_the_Augustales_at_Herculaneum).jpg

 
	const MUSIC_BACK  = '/uploads/starter/Defense.Line.mp3' ;
	const SOUND_ALARM = '/uploads/starter/air.horn.mp3' ;

// credits:
// http://www.dl-sounds.com/royalty-free/defense-line/
// http://soundbible.com/1542-Air-Horn.html 

	
	
const gridsize = 50;						// number of squares along side of world	   

const NOBOXES =  Math.trunc ( (gridsize * gridsize) / 3 );
		// density of maze - number of internal boxes
		// (bug) use trunc or can get a non-integer 

const squaresize = 100;					// size of square in pixels

const MAXPOS = gridsize * squaresize;		// length of one side in pixels 
	
const SKYCOLOR 	= 0xddffdd;				// a number, not a string 

 
const startRadiusConst	 	= MAXPOS * 0.8 ;		// distance from centre to start the camera at
const maxRadiusConst 		= MAXPOS * 10  ;		// maximum distance from camera we will render things  



//--- change ABWorld defaults: -------------------------------

ABHandler.MAXCAMERAPOS 	= maxRadiusConst ;

ABHandler.GROUNDZERO		= true;						// "ground" exists at altitude zero



//--- skybox: -------------------------------
// skybox is a collection of 6 files 
// x,y,z positive and negative faces have to be in certain order in the array 
// https://threejs.org/docs/#api/en/loaders/CubeTextureLoader 

// mountain skybox, credit:
// http://stemkoski.github.io/Three.js/Skybox.html

 const SKYBOX_ARRAY = [										 
                "/uploads/starter/dawnmountain-xpos.png",
                "/uploads/starter/dawnmountain-xneg.png",
                "/uploads/starter/dawnmountain-ypos.png",
                "/uploads/starter/dawnmountain-yneg.png",
                "/uploads/starter/dawnmountain-zpos.png",
                "/uploads/starter/dawnmountain-zneg.png"
                ];


// space skybox, credit:
// http://en.spaceengine.org/forum/21-514-1
// x,y,z labelled differently

/*
 const SKYBOX_ARRAY = [										 
                "/uploads/starter/sky_pos_z.jpg",
                "/uploads/starter/sky_neg_z.jpg",
                "/uploads/starter/sky_pos_y.jpg",
                "/uploads/starter/sky_neg_y.jpg",
                "/uploads/starter/sky_pos_x.jpg",
                "/uploads/starter/sky_neg_x.jpg"
                ];
*/				


// urban photographic skyboxes, credit:
// http://opengameart.org/content/urban-skyboxes

/*
 const SKYBOX_ARRAY = [										 
                "/uploads/starter/posx.jpg",
                "/uploads/starter/negx.jpg",
                "/uploads/starter/posy.jpg",
                "/uploads/starter/negy.jpg",
                "/uploads/starter/posz.jpg",
                "/uploads/starter/negz.jpg"
                ];
*/



// ===================================================================================================================
// === End of tweaker's box ==========================================================================================
// ===================================================================================================================


// You will need to be some sort of JavaScript programmer to change things below the tweaker's box.









//--- Mind can pick one of these actions -----------------

const ACTION_LEFT 			= 0;		   
const ACTION_RIGHT 			= 1;
const ACTION_UP 			= 2;		 
const ACTION_DOWN 			= 3;
const ACTION_STAYSTILL 		= 4;

// in initial view, (smaller-larger) on i axis is aligned with (left-right)
// in initial view, (smaller-larger) on j axis is aligned with (away from you - towards you)


// contents of a grid square

const GRID_BLANK 	= 0;
const GRID_WALL 	= 1;
const GRID_MAZE 	= 2;
 
 
 
 

var BOXHEIGHT;		// 3d or 2d box height 

var GRID 	= new Array(gridsize);			// can query GRID about whether squares are occupied, will in fact be initialised as a 2D array   

var theagent, theenemy;
  
var wall_texture, agent_texture, enemy_texture, maze_texture; 


// is diagonal move allowed 
    const diagonal = true ;


// enemy and agent position on squares
var ei, ej, ai, aj;

var badsteps;
var goodsteps;


	
function loadResources()		// asynchronous file loads - call initScene() when all finished 
{
	var loader1 = new THREE.TextureLoader();
	var loader2 = new THREE.TextureLoader();
	var loader3 = new THREE.TextureLoader();
	var loader4 = new THREE.TextureLoader();
	
	loader1.load ( TEXTURE_WALL, function ( thetexture )  		
	{
		thetexture.minFilter  = THREE.LinearFilter;
		wall_texture = thetexture;
		if ( asynchFinished() )	initScene();		// if all file loads have returned 
	});
		
	loader2.load ( TEXTURE_AGENT, function ( thetexture )  	 
	{
		thetexture.minFilter  = THREE.LinearFilter;
		agent_texture = thetexture;
		if ( asynchFinished() )	initScene();		 
	});	
	
	loader3.load ( TEXTURE_ENEMY, function ( thetexture )  
	{
		thetexture.minFilter  = THREE.LinearFilter;
		enemy_texture = thetexture;
		if ( asynchFinished() )	initScene();		 
	});
	
	loader4.load ( TEXTURE_MAZE, function ( thetexture )  
	{
		thetexture.minFilter  = THREE.LinearFilter;
		maze_texture = thetexture;
		if ( asynchFinished() )	initScene();		 
	});
	
}


function asynchFinished()		 // all file loads returned 
{
	if ( wall_texture && agent_texture && enemy_texture && maze_texture )   return true; 
	else return false;
}	
	
	
 

//--- grid system -------------------------------------------------------------------------------
// my numbering is 0 to gridsize-1

	
function occupied ( i, j )		// is this square occupied
{
 if ( ( ei == i ) && ( ej == j ) ) return true;		// variable objects 
 if ( ( ai == i ) && ( aj == j ) ) return true;

 if ( GRID[i][j].wall) return true;		// fixed objects	 
 if ( GRID[i][j].maze) return true;		 
	 
 return false;
}

 
// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates
// logically, coordinates are: y=0, x and z all positive (no negative)    
// logically my dimensions are all positive 0 to MAXPOS
// to centre everything on origin, subtract (MAXPOS/2) from all dimensions 

function translate ( i, j )			
{
	var v = new THREE.Vector3();
	
	v.y = 0;	
	v.x = ( i * squaresize ) - ( MAXPOS/2 );   		 
	v.z = ( j * squaresize ) - ( MAXPOS/2 );   	
	
	return v;
}


//=== heuristic ===========================
// this must be always optimistic - real time will be this or longer 

function heuristic(a, b) 
{
    
     if ( diagonal ) {
        var x = a.i - b.i;
        var y = a.j - b.j;
        return (Math.sqrt( x*x + y*y ));
     }
    else
        return ( Math.abs(a.i - b.i) + Math.abs(a.j - b.j) );

}

// Function to delete element from the array
function removeFromArray(arr, elt) 
{
  // Could use indexOf here instead to be more efficient
  for (var i = arr.length - 1; i >= 0; i--) 
    if (arr[i] == elt) 
      arr.splice(i, 1);
}

// Open and closed set
var openSet = [];
var closedSet = [];

// Start and end
var start;
var end;

// Spot function to allocate spot for every position in the grid including the maze and wall
function Spot(i, j) 
{

  // Location
  this.i = i;
  this.j = j;

  // f, g, and h values for A*
  this.f = 0;
  this.g = 0;
  this.h = 0;
  
  // Am I an Wall?
  if ( ( i==0 ) || ( i==gridsize-1 ) || ( j==0 ) || ( j==gridsize-1 ) )   this.wall = true;
  else                          this.wall = false;

  // Am I an Maze?
  this.maze = false;
  
  // Neighbors
  this.neighbors = [];

  // Where did I come from?
  this.previous = undefined;

   // Figure out who my neighbors are
  this.addNeighbors = function(GRID) 
  {
    var i = this.i;
    var j = this.j;
    
    if (i < gridsize - 1)   this.neighbors.push(GRID[i + 1][j]);
    if (i > 0)          this.neighbors.push(GRID[i - 1][j]);
    if (j < gridsize - 1)   this.neighbors.push(GRID[i][j + 1]);
    if (j > 0)          this.neighbors.push(GRID[i][j - 1]);
    
    if (diagonal)
    // diagonals are also neighbours:
    {
        if (i > 0 && j > 0)                 this.neighbors.push(GRID[i - 1][j - 1]);
        if (i < gridsize - 1 && j > 0)          this.neighbors.push(GRID[i + 1][j - 1]);
        if (i > 0 && j < gridsize - 1)          this.neighbors.push(GRID[i - 1][j + 1]);
        if (i < gridsize - 1 && j < gridsize - 1)   this.neighbors.push(GRID[i + 1][j + 1]);
    }

  }
}


function initScene()		// all file loads have returned 
{
	 var i,j, shape, thecube;
	 
	// set up GRID as 2D array
	 
	 for ( i = 0; i < gridsize ; i++ ) 
		GRID[i] = new Array(gridsize);		 

    // Spot are added for all the positions in the grid including the maze and wall
    
    for (i = 0; i < gridsize; i++) 
        for (j = 0; j < gridsize; j++) 
          GRID[i][j] = new Spot(i, j);
    
    // All the neighbors for a spot
    
    for (i = 0; i < gridsize; i++) 
        for (j = 0; j < gridsize; j++) 
          GRID[i][j].addNeighbors(GRID);
    
    
	// set up walls
	
	 for ( i = 0; i < gridsize ; i++ ) 
	  for ( j = 0; j < gridsize ; j++ ) 
		if ( GRID[i][j].wall )
		{
			//GRID[i][j] = GRID_WALL;		 
			shape    = new THREE.BoxGeometry ( squaresize, BOXHEIGHT, squaresize );			 
			thecube  = new THREE.Mesh( shape );
			thecube.material = new THREE.MeshBasicMaterial( { map: wall_texture } );
			
			thecube.position.copy ( translate(i,j) ); 		  	// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates 
			ABWorld.scene.add(thecube);
		}
		
		
   // set up maze 
   
    for ( var c=1 ; c <= NOBOXES ; c++ )
	{
		i = AB.randomIntAtoB(1,gridsize-2);		// inner squares are 1 to gridsize-2
		j = AB.randomIntAtoB(1,gridsize-2);
			
		GRID[i][j].maze = true ;
		shape    = new THREE.BoxGeometry ( squaresize, BOXHEIGHT, squaresize );			 
		thecube  = new THREE.Mesh( shape );
		thecube.material = new THREE.MeshBasicMaterial( { map: maze_texture } );		  

		thecube.position.copy ( translate(i,j) ); 		  	// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates 
		ABWorld.scene.add(thecube);		
    	}
	 	 
	
	// set up enemy 
	// start in random location
	
	 do
	 {
	  i = AB.randomIntAtoB(1,gridsize-2);
	  j = AB.randomIntAtoB(1,gridsize-2);
	 }
	 while ( occupied(i,j) );  	  // search for empty square 

	 ei = i;
	 ej = j;
	 
	 shape    = new THREE.BoxGeometry ( squaresize, BOXHEIGHT, squaresize );			 
	 theenemy = new THREE.Mesh( shape );
 	 theenemy.material =  new THREE.MeshBasicMaterial( { map: enemy_texture } );
	 ABWorld.scene.add(theenemy);
	 drawEnemy();		  

	 
	
	// set up agent 
	// start in random location
	
	 do
	 {
	  i = AB.randomIntAtoB(1,gridsize-2);
	  j = AB.randomIntAtoB(1,gridsize-2);
	 }
	 while ( occupied(i,j) );  	  // search for empty square 

	 ai = i;
	 aj = j;
 
	 shape    = new THREE.BoxGeometry ( squaresize, BOXHEIGHT, squaresize );			 
	 theagent = new THREE.Mesh( shape );
	 theagent.material =  new THREE.MeshBasicMaterial( { map: agent_texture } );
	 ABWorld.scene.add(theagent);
	 drawAgent(); 
	 
      // Setting up the defaults on the screen load 
      // Setting the Start and end to enemy and agents respectively
      start     = GRID[ei][ej];
      end       = GRID[ai][aj];
    
      // openSet starts with beginning only
      openSet.push(start);
      
      
  // finally skybox 
  // setting up skybox is simple 
  // just pass it array of 6 URLs and it does the asych load 
  
  	 ABWorld.scene.background = new THREE.CubeTextureLoader().load ( SKYBOX_ARRAY, 	function() 
	 { 
		ABWorld.render(); 
	 
		AB.removeLoading();
	
		AB.runReady = true; 		// start the run loop
	 });
 		
}
 
 
 


// --- draw moving objects -----------------------------------


function drawEnemy()		// given ei, ej, draw it 
{
	theenemy.position.copy ( translate(ei,ej) ); 		  	// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates 

	ABWorld.lookat.copy ( theenemy.position );	 		// if camera moving, look back at where the enemy is  
}


function drawAgent()		// given ai, aj, draw it 
{
	theagent.position.copy ( translate(ai,aj) ); 		  	// translate my (i,j) grid coordinates to three.js (x,y,z) coordinates 

	ABWorld.follow.copy ( theagent.position );			// follow vector = agent position (for camera following agent)
}




// --- take actions -----------------------------------

// making the next move for the enemy post agent's move
function moveLogicalEnemy(i, j)
{ 
 if ( ! occupied(i,j) )  	// if no obstacle then move, else just miss a turn
 {
  ei = i;
  ej = j;
 }
}


function moveLogicalAgent( a )			// this is called by the infrastructure that gets action a from the Mind 
{ 
 var i = ai;
 var j = aj;		 

      if ( a == ACTION_LEFT ) 	i--;
 else if ( a == ACTION_RIGHT ) 	i++;
 else if ( a == ACTION_UP ) 		j++;
 else if ( a == ACTION_DOWN ) 	j--;

 if ( ! occupied(i,j) ) 
 {
  ai = i;
  aj = j;
 }
}




// --- key handling --------------------------------------------------------------------------------------
// This is hard to see while the Mind is also moving the agent:
// AB.mind.getAction() and AB.world.takeAction() are constantly running in a loop at the same time 
// have to turn off Mind actions to really see user key control 

// we will handle these keys: 

var OURKEYS = [ 37, 38, 39, 40 ];

function ourKeys ( event ) { return ( OURKEYS.includes ( event.keyCode ) ); }
	

function keyHandler ( event )		
{
	if ( ! AB.runReady ) return true; 		// not ready yet 

   // if not one of our special keys, send it to default key handling:
	
	if ( ! ourKeys ( event ) ) return true;
	
	// else handle key and prevent default handling:
	
	if ( event.keyCode == 37 )   moveLogicalAgent ( ACTION_LEFT 	);   
    if ( event.keyCode == 38 )   moveLogicalAgent ( ACTION_DOWN  	); 	 
    if ( event.keyCode == 39 )   moveLogicalAgent ( ACTION_RIGHT 	); 	 
    if ( event.keyCode == 40 )   moveLogicalAgent ( ACTION_UP		);   
	
	// when the World is embedded in an iframe in a page, we want arrow key events handled by World and not passed up to parent 

	event.stopPropagation(); event.preventDefault(); return false;
}





// --- score: -----------------------------------


function badstep()			// is the enemy within one square of the agent
{
 if ( ( Math.abs(ei - ai) < 2 ) && ( Math.abs(ej - aj) < 2 ) ) return true;
 else return false;
}


function agentBlocked()			// agent is blocked on all sides, run over
{
 return ( 	occupied (ai-1,aj) 		&& 
		occupied (ai+1,aj)		&&
		occupied (  ai,aj+1)		&&
		occupied (  ai,aj-1) 	);		
} 


function updateStatusBefore(a)
// this is called before anyone has moved on this step, agent has just proposed an action
// update status to show old state and proposed move 
{
 var x 		= AB.world.getState();
 AB.msg ( " Step: " + AB.step + " &nbsp; x = (" + x.toString() + ") &nbsp; a = (" + a + ") " ); 
}


function   updateStatusAfter()		// agent and enemy have moved, can calculate score
{
 // new state after both have moved
 
 var y 		= AB.world.getState();
 var score = ( goodsteps / AB.step ) * 100; 

 AB.msg ( " &nbsp; y = (" + y.toString() + ") <br>" +
		" Bad steps: " + badsteps + 
		" &nbsp; Good steps: " + goodsteps + 
		" &nbsp; Score: " + score.toFixed(2) + "% ", 2 ); 
}





AB.world.newRun = function() 
{
	AB.loadingScreen();

	AB.runReady = false;  

	badsteps = 0;	
	goodsteps = 0;

	
	if ( show3d )
	{
	 BOXHEIGHT = squaresize;
	 ABWorld.init3d ( startRadiusConst, maxRadiusConst, SKYCOLOR  ); 	
	}	     
	else
	{
	 BOXHEIGHT = 1;
	 ABWorld.init2d ( startRadiusConst, maxRadiusConst, SKYCOLOR  ); 		     
	}
	
	
	loadResources();		// aynch file loads		
							// calls initScene() when it returns 

	document.onkeydown = keyHandler;	
		 
};



AB.world.getState = function()
{
 var x = [ ai, aj, ei, ej ];
  return ( x );  
};

var min_f_Spot;

// function to get all the possible neighbour and checking current in that neighbour set excluding the diagonal cases
function nearEnd(current) {
    neighbors = end.neighbors;
    for (var x = 0; x < neighbors.length; x++) 
    {
      var neighbor = neighbors[x];
      if (!neighbor.wall && !neighbor.maze){
          if (current === neighbor)
            if((neighbor.i == end.i-1  && neighbor.j == end.j) || 
               (neighbor.i == end.i+1  && neighbor.j == end.j) || 
               (neighbor.i == end.i  && neighbor.j == end.j-1) || 
               (neighbor.i == end.i  && neighbor.j == end.j+1))
                            return true;
      } 
    }
    return false;
}

AB.world.takeAction = function ( a )
{
  updateStatusBefore(a);			// show status line before moves 

  moveLogicalAgent(a);

// Implementing the A* algorithm for the move of enemy 
  // --- begin still searching -----------------------------
  
  if (openSet.length > 0) 
  {
    // Best next option
    var winner = 0;
    
    for (var i = 0; i < openSet.length; i++) 
      if (openSet[i].f < openSet[winner].f) 
        winner = i;
        
    var current = openSet[winner];
    
    // Did I finish?
    if (nearEnd(current) && agentBlocked()) 
    {
      AB.abortRun = true;
	  goodsteps = 0;			// you score zero as far as database is concerned 			 
      console.log("success - found path");
    }
    
    // Best option moves from openSet to closedSet
    removeFromArray(openSet, current);
    closedSet.push(current);

    // Check all the neighbors
    var neighbors = current.neighbors;
    
    //--- start of for loop -----------
    for (var i = 0; i < neighbors.length; i++) 
    {
      var neighbor = neighbors[i];
      
      // Valid next spot?
      if (!closedSet.includes(neighbor) && !neighbor.wall && !neighbor.maze) 
      {
        var tempG = current.g + heuristic(neighbor, current);
        
        // Is this a better path than before?
        var newPath = false;
        if (openSet.includes(neighbor)) 
        {
          if (tempG < neighbor.g) 
          {
            neighbor.g = tempG;
            newPath = true;
          }
          
        }
        else 
        {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
          
        }

        // Yes, it's a better path
        if (newPath) 
        {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;
        }
        
      }
    }
    //--- end of for loop -----------
    // to pull the next move coordinate for the enemy based on A* algorithm
    min_f_Spot = undefined;
    min_f = 9999999999;
    for( var i = 0 ; i < neighbors.length ; i++){
        if(neighbors[i].f < min_f && !neighbors[i].wall && !neighbors[i].maze){
            min_f_Spot = neighbors[i];
            min_f = neighbors[i].f;
        }
    }
    
  }
  // --- end still searching -----------------------------
  
  
  else 
  {
    console.log('fail - no path exists');
    AB.abortRun = false;
    return;
  }

  moveLogicalEnemy(min_f_Spot.i, min_f_Spot.j);

  if ( badstep() )  badsteps++;
  else   			goodsteps++;

   drawAgent();
   drawEnemy();
   
   // Setting back the objects to defaults not the next iteration on the path as per the move of agent 
   end = GRID[ai][aj];
   start = GRID[ei][ej];
   openSet = [];
   closedSet = [];
   openSet.push(start);
 
   
   updateStatusAfter();			// show status line after moves  

};



AB.world.endRun = function()
{
//  musicPause(); 
  if ( AB.abortRun ) AB.msg ( " <br> <font color=red> <B> Agent trapped. Final score zero. </B> </font>   ", 3  );
  else    				AB.msg ( " <br> <font color=green> <B> Run over. </B> </font>   ", 3  );
};

 
AB.world.getScore = function()
{
    // only called at end - do not use AB.step because it may have just incremented past AB.maxSteps
    
    var s = ( goodsteps / AB.maxSteps ) * 100;   // float like 93.4372778 
    var x = Math.round (s * 100);                // 9344
    return ( x / 100 );                          // 93.44
};

