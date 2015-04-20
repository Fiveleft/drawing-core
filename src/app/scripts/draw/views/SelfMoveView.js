define(
  [ 'jquery', 'RenderView', 'Vector', 'Utils', 'CanvasView', 'MotionVector', 'Color' ],
  function( $, RenderView, Vector, Utils, CanvasView, MotionVector, Color ){


    var viewCvs;
    var cacheCvs = new CanvasView();
    var renderCvs = new CanvasView();

    var vDir = new Vector( 1, -1 );
    var vMove = new Vector( 2, 2 );
    var vVel = new Vector();
    var vPos = new Vector();
    var moveAngle = 0; // degrees;
    var moveVariant = 20;
    var moveDistance = 10;

    var mv = new MotionVector( {maxVelocity:15, friction:0.05} );


    var SelfMoveView = RenderView.extend({

      // drawUIEvents : false,


      initialize : function() {
        // var self = this;
        var colors = [
          new Color( 255, 0, 127, 0.1 ),
          new Color( 127, 127, 255, 0.1 ),
          new Color( 0, 255, 151, 0.8 ),
        ];
        cacheCvs.size( (colors.length*20), 20 );
        for( var i=0; i<colors.length; i++ ) {
          cacheCvs.ctx.lineStyle = new Color( 0, 0, 0, 0.2 ).getRGBA();
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
        
        // this.drawUIEvents = {};
        // this.drawUIEvents[ DrawUI.eventTypes.click ] = function(e){self._drawClick(e);};
        // $(window).on( this.drawUIEvents );
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

        vPos.copy( renderCvs.center );
        mv.setTarget( renderCvs.center );
      },


      render : function() {

        vDir.x *= Utils.inRange( vPos.x, 10, viewCvs.width-20 ) ? 1 : -1;
        vDir.y *= Utils.inRange( vPos.y, 10, viewCvs.height-20 ) ? 1 : -1;

        moveAngle = 1 + (moveAngle + Utils.randomBetween( -moveVariant, moveVariant )) % 360;
        moveDistance = Utils.randomBetween( 5, 15 );//moveVariant + Utils.randomAround( moveVariant );

        // moveDistance = Utils.clamp( moveVariant, 5, (moveVariant*2)-4 );

        vMove.angleOffset( vPos, Utils.toRad(moveAngle), moveDistance );

        vVel.subtractVectors( vMove, vPos ).multiply( vDir );
        vPos.add( vVel );

        mv.setTarget( vPos ).update();

        renderCvs.clear();
        renderCvs.ctx.drawImage( cacheCvs.cvs, 0, 0, 20, 20, renderCvs.center.x-10, renderCvs.center.y-10, 20, cacheCvs.height );
        renderCvs.ctx.drawImage( cacheCvs.cvs, 40, 0, 20, 20, vPos.x-10, vPos.y-10, 20, cacheCvs.height );
        renderCvs.ctx.drawImage( cacheCvs.cvs, 20, 0, 20, 20, mv.pos.x-10, mv.pos.y-10, 20, cacheCvs.height );

        viewCvs.clear();
        viewCvs.ctx.drawImage( renderCvs.cvs, 0, 0 );
      },


    });

    return SelfMoveView;
  });