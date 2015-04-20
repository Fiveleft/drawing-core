// VelocityView.js


define(
  [ 'jquery', 'drawUI', 'RenderView', 'Vector', 'Utils', 'CanvasView', 'MotionVector', 'Color' ],
  function( $, DrawUI, RenderView, Vector, Utils, CanvasView, MotionVector, Color ){


    var viewCvs;
    var cacheCvs = new CanvasView();
    var renderCvs = new CanvasView();
    var mv = new MotionVector( {maxVelocity:15} );


    var VelocityView = RenderView.extend({

      drawUIEvents : false,


      initialize : function() {
        var self = this;
        var colors = [
          new Color( 255, 0, 127, 0.1 ),
          new Color( 127, 127, 255, 0.1 ),
          new Color( 0, 255, 151, 0.8 ),
        ];
        cacheCvs.size( (colors.length*20), 20 );
        for( var i=0; i<colors.length; i++ ) {
          cacheCvs.ctx.fillStyle = colors[i].getRGBA();
          cacheCvs.ctx.beginPath();
          cacheCvs.ctx.arc( 9.5 + (20*i), 9.5, 9, 0, 2 * Math.PI, false);
          cacheCvs.ctx.fill();
          cacheCvs.ctx.moveTo( 9.5 + (20*i), 4.5 );
          cacheCvs.ctx.lineTo( 9.5 + (20*i), 14.5 );
          cacheCvs.ctx.moveTo( 4.5 + (20*i), 9.5 );
          cacheCvs.ctx.lineTo( 14.5 + (20*i), 9.5 );
          cacheCvs.ctx.stroke();
          cacheCvs.ctx.closePath();
        }
        
        this.drawUIEvents = {};
        this.drawUIEvents[ DrawUI.eventTypes.click ] = function(e){self._drawClick(e);};
        $(window).on( this.drawUIEvents );
      },


      destroy : function() {
        $(window).off( this.drawUIEvents );
      },


      updateCanvas : function() {
        viewCvs = new CanvasView( this._cvs );
        renderCvs = new CanvasView();
        renderCvs.size( viewCvs.cvs );

        renderCvs.clear();
        renderCvs.ctx.drawImage( cacheCvs.cvs, 0, 0, 20, 20, renderCvs.center.x-10, renderCvs.center.y-10, 20, cacheCvs.height );
        
        viewCvs.clear();
        viewCvs.ctx.drawImage( renderCvs.cvs, 0, 0 );

        mv.pos.copy( renderCvs.center );
        mv.setTarget( mv.pos );
      },


      render : function() {

        mv.update();

        renderCvs.clear();
        renderCvs.ctx.drawImage( cacheCvs.cvs, 20, 0, 20, 20, renderCvs.center.x-10, renderCvs.center.y-10, 20, cacheCvs.height );
        renderCvs.ctx.drawImage( cacheCvs.cvs, 0, 0, 20, 20, mv.target.x-10, mv.target.y-10, 20, cacheCvs.height );
        renderCvs.ctx.drawImage( cacheCvs.cvs, 40, 0, 20, 20, mv.pos.x-10, mv.pos.y-10, 20, cacheCvs.height );

        viewCvs.clear();
        viewCvs.ctx.drawImage( renderCvs.cvs, 0, 0 );
      },


      _createMotion : function( data ) {
        mv.setTarget( data.p );
      },


      _drawClick : function( e ){
        var data = e.originalEvent.detail;
        this._createMotion( data );
      },


    });

    return VelocityView;
  });