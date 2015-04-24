// BlobExpandView.js


define(
  [ 'jquery', 'drawUI', 'RenderView', 'Vector', 'Utils', 'CanvasView', 'Color', 'tweenlite', 'draw/shapes/Blob' ],
  function( $, DrawUI, RenderView, Vector, Utils, CanvasView, Color, TweenLite, Blob ){


    var viewCvs;
    var cacheCvs = new CanvasView();
    var renderCvs = new CanvasView();
    var guideCvs = new CanvasView();
    


    var BlobExpandView = RenderView.extend({

      drawUIEvents : false,


      initialize : function() {
        var self = this;
        var colors = [
          new Color( 255, 0, 127, 0.8 ),
          new Color( 127, 127, 255, 0.8 ),
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
        renderCvs.size( viewCvs.cvs );
        guideCvs.size( viewCvs.cvs );

        // guideCvs.clear();
        // guideCvs.ctx.drawImage( cacheCvs.cvs, 0, 0, 20, 20, guideCvs.center.x-10, guideCvs.center.y-10, 20, cacheCvs.height );
        
        viewCvs.clear();
        viewCvs.ctx.drawImage( renderCvs.cvs, 0, 0 );
        viewCvs.ctx.drawImage( guideCvs.cvs, 0, 0 );
      },


      render : function() {

        if( this.blob && this.blob.animating ) {

          renderCvs.clear();
          this.blob.draw( renderCvs.ctx );

          viewCvs.clear();
          viewCvs.ctx.drawImage( renderCvs.cvs, 0, 0 );
        }
      },


      drawBlob : function( p ) {

        renderCvs.clear();

        var b = new Blob( { minRadius:50, maxRadius:100 });
        this.blob = b;

        b.sizeRatio = 0;
        b.create( p );
        b.update();
        b.draw( renderCvs.ctx );

        var t = Utils.randomBetween( 0.5, 2 );

        TweenLite.to( b, t, {
            sizeRatio : 1,
            ease : window.Sine.easeInOut,
            onStart : function(){b.animationStart();},
            onUpdate : function(){b.update();},
            onComplete : function(){b.animationEnd();},
          });

        // viewCvs.clear();
        // viewCvs.ctx.drawImage( renderCvs.cvs, 0, 0 );
        // viewCvs.ctx.drawImage( guideCvs.cvs, 0, 0 );
      },


      drawBlobComplete : function() {
        console.log( 'drawBlobComplete' );
      },


      _createMotion : function( data ) {
        // this.initBlob();
        this.drawBlob( data.p );
      },


      _drawClick : function( e ){
        var data = e.originalEvent.detail;
        this._createMotion( data );
      },


    });

    return BlobExpandView;
  });


