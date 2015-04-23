// BlobView.js


define(
  [ 'jquery', 'drawUI', 'RenderView', 'Vector', 'Utils', 'CanvasView', 'MotionVector', 'Color' ],
  function( $, DrawUI, RenderView, Vector, Utils, CanvasView, MotionVector, Color ){


    var viewCvs;
    var cacheCvs = new CanvasView();
    var renderCvs = new CanvasView();
    var mv = new MotionVector( {maxVelocity:15} );

    var blobPoints ;

    var BlobView = RenderView.extend({

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
        
        this.initBlob();

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

        this.drawBlob( renderCvs.center );
      },


      render : function() {

        // mv.update();

        // renderCvs.clear();
        // renderCvs.ctx.drawImage( cacheCvs.cvs, 20, 0, 20, 20, renderCvs.center.x-10, renderCvs.center.y-10, 20, cacheCvs.height );
        // renderCvs.ctx.drawImage( cacheCvs.cvs, 0, 0, 20, 20, mv.target.x-10, mv.target.y-10, 20, cacheCvs.height );
        // renderCvs.ctx.drawImage( cacheCvs.cvs, 40, 0, 20, 20, mv.pos.x-10, mv.pos.y-10, 20, cacheCvs.height );

        // viewCvs.clear();
        // viewCvs.ctx.drawImage( renderCvs.cvs, 0, 0 );
      },


      initBlob : function() {

        var angles = [];
        var radius = { min: 100, max: 400 };
        var points = { min: 8, max: 24, count:0 };
        var angleOffset = 90;
        var bp, i, v, d, a=0;

        // ensures its always an even number
        points.count = Utils.round( Utils.randomBetween(points.min, points.max)*0.5 ) * 2;
        angleOffset = (360/points.count);

        console.log( points.count, ' a: ', angleOffset );

        for( i=points.count-1; i!==-1; i-- ) {
          a = (angleOffset * (i+1)) % 360;
          a = a + Utils.randomAround( 5 );
          angles.push( a );
        }
        angles.sort( function(a,b) { return a>b ? 1 : a<b ? -1 : 0; } );

        blobPoints = [];

        for( i=points.count-1; i!==-1; i-- ) {
          bp = {
            angle : Utils.toRad(angles[i]),
            vector : new Vector(),
            distance : Utils.randomBetween( radius.min, radius.max ),
            ratio : 0
          };
          bp.vector.angleOffset( bp.vector, Utils.toRad(angles[i]), bp.distance );
          blobPoints.push( bp );
        }
      },


      drawBlob : function( p ) {

        var c = blobPoints.length-1,
          color,
          a = 0,
          d = 0,
          dMax = 0,
          d1 = 0,
          d2 = 0,
          i = 0,
          v = Vector.clone(p).add(blobPoints[i]),
          p1Ind,
          p2Ind,
          h0Ind,
          h1Ind,
          h2Ind,
          p1 = new Vector(),
          p2 = new Vector(),
          a1 = new Vector(),
          a2 = new Vector(),
          h0 = new Vector(),
          h1 = new Vector(),
          h2 = new Vector();


        // v.add(p);

        renderCvs.clear();
        renderCvs.ctx.drawImage( cacheCvs.cvs, 0, 0, 20, 20, renderCvs.center.x-10, renderCvs.center.y-10, 20, cacheCvs.height );
        


        for( i=0; i<=c; i+=2 ) {

          p1Ind = i;
          p2Ind = (i+2>c) ? 0 : i+2;
          h0Ind = (i-1<0) ? blobPoints.length-1 : i-1;
          h1Ind = (i+1>c) ? 1 : i + 1;
          h2Ind = (i+3>c) ? 1 : i + 3;

          p1.addVectors( p, blobPoints[p1Ind].vector );
          p2.addVectors( p, blobPoints[p2Ind].vector );
          h0.addVectors( p, blobPoints[h0Ind].vector );
          h1.addVectors( p, blobPoints[h1Ind].vector );
          h2.addVectors( p, blobPoints[h2Ind].vector );

          dMax = p1.distance( p2 );

          // Behind point
          a = h1.angleTo( h0 );
          d1 = p1.distance( h0 );
          d2 = p1.distance( h1 );
          d = (d2 / (d1+d2)) * h0.distance( h1 );
          a1.angleOffset( p1, a, Math.min(d, dMax) );

          // Forward point
          a = h1.angleTo( h2 );
          d1 = p2.distance( h1 );
          d2 = p2.distance( h2 );
          d = (d1 / (d1+d2)) * h1.distance( h2 );
          a2.angleOffset( p2, a, Math.min(d, dMax) );

          color = Color.random( 100, 200 ).desaturate( 0 );
          // color.alpha = 0.5;

          renderCvs.ctx.strokeStyle = color.getRGBA();

          // Draw Anchors
          renderCvs.ctx.lineWidth = 0.5;

          renderCvs.ctx.beginPath();
          renderCvs.ctx.moveTo( p1.x, p1.y );
          renderCvs.ctx.lineTo( a1.x, a1.y );
          // renderCvs.ctx.closePath();
          renderCvs.ctx.stroke();

          renderCvs.ctx.beginPath();
          renderCvs.ctx.moveTo( p2.x, p2.y );
          renderCvs.ctx.lineTo( a2.x, a2.y );
          // renderCvs.ctx.closePath();
          renderCvs.ctx.stroke();

          // Draw Line
          renderCvs.ctx.lineWidth = 2;
          renderCvs.ctx.beginPath();
          renderCvs.ctx.moveTo( p1.x, p1.y );
          renderCvs.ctx.bezierCurveTo( a1.x, a1.y, a2.x, a2.y, p2.x, p2.y );
          renderCvs.ctx.stroke();
        }

        for( i=blobPoints.length-1; i!==-1; i-- ) {
          var o = i%2===0 ? 40 : 0,
            ga = i%2===0 ? 0.25 : 0.5;
          v = blobPoints[i].vector.clone().add(p);
          renderCvs.ctx.globalAlpha = ga;
          renderCvs.ctx.drawImage( cacheCvs.cvs, o, 0, 20, 20, v.x-10, v.y-10, 20, cacheCvs.height );
        }


        viewCvs.clear();
        viewCvs.ctx.drawImage( renderCvs.cvs, 0, 0 );
      },



      _createMotion : function( data ) {
        // mv.setTarget( data.p );
      },


      _drawClick : function( e ){
        var data = e.originalEvent.detail;
        this._createMotion( data );
      },


    });

    return BlobView;
  });


