// CompositionView.js

define(
  [ 'jquery', 'RenderView', 'Vector', 'Utils', 'CanvasView', 'Color', 'tweenlite' ],
  function( $, RenderView, Vector, Utils, CanvasView, Color, TweenLite ){


    var viewCvs = new CanvasView(),
      // cacheCvs = new CanvasView(),
      renderCvs = new CanvasView(),
      guideCvs = new CanvasView(),
      colors = {
        gridLines : new Color( 0, 0, 0, 0.2 ),
        gridBlocks : new Color( 255, 127, 0, 0.2 )
      };
    


    var CompositionView = RenderView.extend({




      initialize : function() {

      },

      updateCanvas : function() {
        viewCvs.initialize( this._cvs );
        renderCvs.size( viewCvs.cvs );
        guideCvs.size( viewCvs.cvs );
      },



    });



    return CompositionView;
  });
