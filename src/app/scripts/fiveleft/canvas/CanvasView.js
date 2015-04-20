define(
  [ 'Vector', 'Rectangle' ],
  function( Vector, Rectangle ){

    var CanvasView = function( cvs ) {

      this.cvs = false;
      this.ctx = false;
      this.width = 0;
      this.height = 0;
      this.center = new Vector();
      this.rect = new Rectangle();
      this._drawRect = new Rectangle();
      this.initialize( cvs );
    };


    CanvasView.prototype = {

      constructor : CanvasView,
      cvs : false,
      ctx : false,
      width : 0,
      height : 0,
      center : {x:0, y:0},
      rect : {x:0, y:0, width:0, height:0},
      _drawRect : {x:0, y:0, width:0, height:0},

      initialize : function( cvs ){
        this.cvs = (cvs || document.createElement('canvas'));
        this.ctx = this.cvs.getContext('2d');
        this.size( this.cvs );
      },

      size : function( c, y ){
        var w = (c.nodeName === 'CANVAS') ? c.width : c,
          h = (c.nodeName === 'CANVAS') ? c.height : y;
        this.width = this.cvs.width = w;
        this.height = this.cvs.height = h;
        this.measure();
      },

      measure : function() {
        this.rect.setSize( this.cvs.width, this.cvs.height );
        this.center.copy( this.rect.getCenter() );
      },

      drawImage : function( cvs, dr, sr ) {
        this._drawRect.copy( dr );
        if( !sr ) {
          this.ctx.drawImage( cvs, dr.x, dr.y, dr.width, dr.height );
        }else{
          this.ctx.drawImage( cvs, dr.x, dr.y, dr.width, dr.height, sr.x, sr.y, sr.width, sr.height );
        }
      },

      clear : function() {
        this.ctx.clearRect( 0, 0, this.width, this.height );
      },

      clearDrawRect : function() {
        this.ctx.clearRect( this._drawRect.x, this._drawRect.y, this._drawRect.width, this._drawRect.height );
      }

    };

    

    // Utilities
    function updateSize( cv ) {
      if( cv ) {
        cv.center.set( cv.width*0.5, cv.height*0.5 ).round();
      }
    }



    return CanvasView;


  });