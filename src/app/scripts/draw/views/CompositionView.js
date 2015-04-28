// CompositionView.js

define(
  [ 'RenderView', 'Vector', 'Utils', 'Rectangle', 'CanvasView', 'Color', 'tweenlite' ],
  function( RenderView, Vector, Utils, Rectangle, CanvasView, Color, TweenLite ){


    var viewCvs = new CanvasView(),
      renderCvs = new CanvasView(),
      artworkCvs = new CanvasView(),
      heatMapCvs = new CanvasView(),
      guideCvs = new CanvasView(),
      artwork = new Rectangle( 0, 0, 2200, 3900 ),
      colors = {
        gridLines : new Color( 0, 0, 0, 0.2 ),
        gridBlocks : new Color( 255, 0, 127, 0.5 )
      };

    TweenLite;


    var CompositionView = RenderView.extend({

      initialize : function() {
        artworkCvs.size( artwork.width, artwork.height );
        heatMapCvs.size( artwork.width, artwork.height );
        measureLayout();
        createClusters();
        renderHeatMap();
      },

      updateCanvas : function() {
        viewCvs.initialize( this._cvs );
        guideCvs.size( viewCvs.cvs );

        var wScale = viewCvs.width / heatMapCvs.width,
          hScale = viewCvs.height / heatMapCvs.height,
          sOff = Math.min( wScale, hScale ),
          wOff = Utils.round(heatMapCvs.width * sOff) - 10,
          hOff = Utils.round(heatMapCvs.height * sOff) - 10,
          xOff = Utils.round( (viewCvs.width - wOff) * 0.5 ),
          yOff = Utils.round( (viewCvs.height - hOff) * 0.5 );

        viewCvs.ctx.drawImage( heatMapCvs.cvs, 0, 0, heatMapCvs.width, heatMapCvs.height, xOff, yOff, wOff, hOff );
      }

    });



    var units = {
        width : 0,
        height : 0,
        count : 0,
        max : 500,
        list : [],
        linkItem : null,
        getUnitByCoord : function( col, row ) {
          var index = (row*cols) + col;
          return (typeof this.list[index] !== 'undefined') ? this.list[index] : null;
        }
      },
      thirds = [],
      targetUnits = {
        map : {},
        list : [],
        count : 0,
        maxRatio : 0.5,
        minRatio : 0.2
      },
      getOffset = window.Sine.easeIn.getRatio,
      rows = 0,
      cols = 0,
      maxOffsetRatio = 0.25,
      offsetMaxCols = 0,
      offsetMaxRows = 0;



    function measureLayout() {

      var maxVUnits = Math.floor( Math.sqrt( units.max * artwork.getAspectRatio()) ),
        maxHUnits = Math.floor( Math.sqrt( units.max / artwork.getAspectRatio()) ),
        i,
        cu,
        col,
        row;

      units.width = Utils.round( artwork.width / maxHUnits );
      units.height = Utils.round( artwork.height / maxVUnits );
      rows = Math.round( artwork.height / units.height );
      cols = Math.round( artwork.width / units.width );
      units.count = cols * rows;
      units.list = new Array(units.count);

      // console.log( 'Layout = ( cols:', cols, 'row:', rows, ' unit.width:', units.width, ' unit.height:', units.height, ' )');

      // Max Targets
      targetUnits.count = Utils.round( units.count * Utils.randomBetween( targetUnits.minRatio, targetUnits.maxRatio ) );

      // Create Linked List of CompositionUnits
      for( i=units.count-1; i!==-1; i-- )
      {
        row = Math.floor( i/cols );
        col = i % cols;
        cu = new CompositionUnit( i, col, row );
        cu.set( cu.col*units.width, cu.row*units.height, units.width, units.height );
        cu.next = units.linkItem; //(i < units-1) ? units.list[ i+1 ] : null;
        units.linkItem = cu;
        units.list[i] = cu;
      }
    }


    function createClusters() {

      var third = null,
        thirdsIndex = 0,
        thirdProbability = 0,
        offsetUnit,
        i,
        // The units at the 'rule of thirds' positions
        topLeft = units.getUnitByCoord( Math.floor(cols/3)-1, Math.floor(rows/3)-1 ),
        topRight = units.getUnitByCoord( Math.ceil(2*(cols/3)), Math.floor(rows/3)-1 ),
        botLeft = units.getUnitByCoord( Math.floor(cols/3)-1, Math.ceil(2*(rows/3)) ),
        botRight = units.getUnitByCoord( Math.ceil(2*(cols/3)), Math.ceil(2*(rows/3)) );

      thirds = [
        { name:'topLeft', unit:topLeft, cluster:[] },
        { name:'topRight', unit:topRight, cluster:[] },
        { name:'botLeft', unit:botLeft, cluster:[] },
        { name:'botRight', unit:botRight, cluster:[] }
      ];
      thirds.sort( Utils.shuffle );

      // Max offset amounts when picking an offset from any specific unit
      offsetMaxCols = Utils.round( cols*maxOffsetRatio );
      offsetMaxRows = Utils.round( rows*maxOffsetRatio );


      // console.log( targetUnits.count );
      // Here we figure out how many random blocks we pick around each unitThird
      for( i=targetUnits.count-1; i!==-1; i-- ) {

        thirdProbability = window.Expo.easeIn.getRatio(Math.random());
        thirdsIndex = Utils.round( Utils.ratioOf( thirdProbability, 0, 3 ) );
        third = thirds[thirdsIndex];

        // console.log( ' - ', third.name, '\tindex:', thirdsIndex, ' items:', third.cluster.length );

        offsetUnit = getOffsetUnit( third.unit );


        if( targetUnits.map[ '_' + offsetUnit.index ] === undefined ){
          targetUnits.map[ '_' + offsetUnit.index ] = true;
          targetUnits.list.push( offsetUnit );
          third.cluster.push( offsetUnit );
        }
      }
      // console.log( targetUnits );
    }


    function getOffsetUnit( uc ) {
      var offsetC = Utils.eitherOr(-1,1) * Utils.round( Utils.ratioOf( getOffset(Math.random()), 0, offsetMaxCols ) ),
        offsetR = Utils.eitherOr(-1,1) * Utils.round( Utils.ratioOf( getOffset(Math.random()), 0, offsetMaxRows ) ),
        colOff = Utils.clamp( uc.col + offsetC, 0, cols-1 ),
        rowOff = Utils.clamp( uc.row + offsetR, 0, rows ),
        offsetUC = units.getUnitByCoord( colOff, rowOff );

      // console.log( uc.index, " applying offset ", offsetC, offsetR, " = ", offsetUC.index );
      return offsetUC;
    }



    // --------------------------------------------------------------------
    // Rendering/Display Methods
    // --------------------------------------------------------------------

    var heatMapRendered = false;

    function renderHeatMap(){

      if( heatMapRendered ) {
        return;
      }

      var i, cu;
      
      heatMapCvs.ctx.lineWidth = 5;
      heatMapCvs.ctx.strokeStyle = colors.gridLines.getRGBA();
      heatMapCvs.ctx.beginPath();
      heatMapCvs.ctx.rect( 0, 0, artwork.width, artwork.height );
      heatMapCvs.ctx.stroke();
      heatMapCvs.ctx.closePath();

      // Render Canvas creates the heatmap block
      renderCvs.size( units.width, units.height );
      renderCvs.ctx.lineWidth = 5;
      renderCvs.ctx.beginPath();
      renderCvs.ctx.rect( 0, 0, units.width, units.height );
      renderCvs.ctx.closePath();
      renderCvs.ctx.fillStyle = colors.gridLines.getRGBA();
      renderCvs.ctx.fill();
      renderCvs.ctx.strokeStyle = colors.gridLines.getRGBA();
      renderCvs.ctx.stroke();

      // renderCvs.ctx.rect( 2, 2, units.width-4, units.height-4 );
      // for( i=units.count-1; i!==-1; i-- ) {
      //   cu = units.list[i];
      //   heatMapCvs.ctx.drawImage( renderCvs.cvs, 0, 0, units.width, units.height, cu.x, cu.y, cu.width, cu.height );
      // }

      for( i=targetUnits.list.length-1; i!==-1; i-- ) {
        cu = targetUnits.list[i];
        heatMapCvs.ctx.drawImage( renderCvs.cvs, 0, 0, units.width, units.height, cu.x, cu.y, cu.width, cu.height );
      }
      // Clear the render canvas
      renderCvs.clear();

      heatMapCvs.ctx.fillStyle = colors.gridBlocks.getRGBA();
      
      for( i=3; i!==-1; i-- ) {
        cu = thirds[i].unit;
        heatMapCvs.ctx.beginPath();
        heatMapCvs.ctx.rect( cu.x, cu.y, units.width, units.height );
        heatMapCvs.ctx.fill();
        heatMapCvs.ctx.closePath();
      }
      // Finally, clear the render canvas
      heatMapRendered = true;
    }





    // --------------------------------------------------------------------
    // Class & Namespace Definition
    // --------------------------------------------------------------------

    // fiveleft.CompositionLayout = CompositionLayout;


    /**
     * [CompositionUnit description]
     * @param {[type]} index [description]
     * @param {[type]} col   [description]
     * @param {[type]} row   [description]
     */
    var CompositionUnit = function( index, col, row )
    {
      this.col = col;
      this.row = row;
      this.index = index;
      this.next = null;
      this.log = function(){
        console.log( 'CUnit[' + this.index + '], col=' + this.col + ', row=' + this.row + ', rect=' + this.toString() );
      };
    };
    // CompositoinUnit extends Rectangle
    CompositionUnit.prototype = new Rectangle();
    CompositionUnit.constructor = CompositionUnit;
    







    return CompositionView;
  });
