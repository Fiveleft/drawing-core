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
        var i, v, d, a=0;

        // ensures its always an even number
        points.count = Utils.round( Utils.randomBetween(points.min, points.max)*0.5 ) * 2;
        // points.count = 10;
        angleOffset = (360/points.count);

        console.log( points.count, ' a: ', angleOffset );

        for( i=points.count-1; i!==-1; i-- ) {
          a = (angleOffset * (i+1)) % 360;
          a = a + Utils.randomAround( 20 );
          angles.push( a );
          // console.log( a );
        }
        angles.sort( function(a,b) { return a>b ? 1 : a<b ? -1 : 0; } );

        blobPoints = [];

        for( i=points.count-1; i!==-1; i-- ) {
          v = new Vector();
          d = Utils.randomBetween( radius.min, radius.max );
          v.angleOffset( v, Utils.toRad(angles[i]), d );
          blobPoints.push( v );
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
          v = new Vector().copy(blobPoints[i]),
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


        v.add(p);

        renderCvs.clear();
        renderCvs.ctx.drawImage( cacheCvs.cvs, 0, 0, 20, 20, renderCvs.center.x-10, renderCvs.center.y-10, 20, cacheCvs.height );
        


        for( i=0; i<=c; i+=2 ) {

          p1Ind = i;
          p2Ind = (i+2>c) ? 0 : i+2;
          h0Ind = (i-1<0) ? blobPoints.length-1 : i-1;
          h1Ind = (i+1>c) ? 1 : i + 1;
          h2Ind = (i+3>c) ? 1 : i + 3;

          p1.addVectors( p, blobPoints[p1Ind] );
          p2.addVectors( p, blobPoints[p2Ind] );
          h0.addVectors( p, blobPoints[h0Ind] );
          h1.addVectors( p, blobPoints[h1Ind] );
          h2.addVectors( p, blobPoints[h2Ind] );

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

          color = Color.random();
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


          // renderCvs.ctx.strokeStyle = color.getRGBA();


          // p1.addVectors( p,  );
          // console.log( 'Targeting ', p1Ind, ' to ', p2Ind, ' handles:[ ', h0Ind, h1Ind, h2Ind, ' ]' );
        }

        for( i=blobPoints.length-1; i!==-1; i-- ) {
          var o = i%2===0 ? 40 : 0,
            ga = i%2===0 ? 0.5 : 0.8;
          v = blobPoints[i].clone().add(p);
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






// for( i=0; i<=c; i+=2 ) {

//           var vP = (i+2>c) ? 0 : i+2,
//             vM = (i-2<0) ? blobPoints.length-2 : i-2,
//             hP = (i+1>c) ? 1 : i + 1,
//             hMid = (i-1<0) ? blobPoints.length-1 : i-1,
//             hM = (i-3<0) ? blobPoints.length-3 : i-3,
//             dP = 0,
//             dM = 0,
//             dH = 0;

//           // Point
//           v.addVectors( p, blobPoints[i] );
//           vPlus.addVectors( p, blobPoints[vP] );
//           hPlus.addVectors( p, blobPoints[hP] );
//           hMiddle.addVectors( p, blobPoints[hMid] );
//           hMinus.addVectors( p, blobPoints[hM] );

//           a = hPlus.angleTo( hMiddle );
//           dH = hPlus.distance( hMiddle );
//           a1.angleOffset( v, a, dH*0.5 );

//           a = hMiddle.angleTo( hMinus );
//           dH = hMiddle.distance( hMinus );
//           a2.angleOffset( vPlus, a, dH*0.5 );

//           renderCvs.ctx.lineWidth = 0.5;

//           renderCvs.ctx.strokeStyle = Color.random().getRGBA();
//           renderCvs.ctx.beginPath();
//           renderCvs.ctx.moveTo( a1.x, a1.y );
//           renderCvs.ctx.lineTo( v.x, v.y );
//           renderCvs.ctx.closePath();
//           renderCvs.ctx.stroke();

//           // renderCvs.ctx.strokeStyle = "rgba(0,0,255,1)";
//           renderCvs.ctx.beginPath();
//           renderCvs.ctx.moveTo( v.x, v.y );
//           renderCvs.ctx.lineTo( a2.x, a2.y );
//           renderCvs.ctx.closePath();
//           renderCvs.ctx.stroke();


//           // vPlus.addVectors( p, blobPoints[ vP ] );
//           // vMinus.addVectors( p, blobPoints[ vM ] );
//           // hPlus.addVectors( p, blobPoints[ hP ] );
//           // hMinus.addVectors( p, blobPoints[ hM ] );

//           // var dV = vPlus.distance( vMinus );
//           // var dVP = v.distance( vPlus );
//           // var dHP = v.distance( hPlus );
//           // var dVM = v.distance( vMinus );
//           // var dHM = v.distance( hMinus );
//           // var dH = hPlus.distance( hMinus );

//           // a = vPlus.angleTo( vMinus );


//           // var aVPlus = Vector.clone(v);
//           // var aVMinus = Vector.clone(v);
//           // var hMid = Vector.clone(v).interpolateVectors( hPlus, hMinus, 0.5 );
//           // var dPlus = (dHP / (dHP + hPlus.distance(vPlus))) * dVP;
//           // var dMinus = (dHM / (dHM + hMinus.distance(vMinus))) * dVM;


//           // aVPlus.angleOffset( v, hPlus.angleTo( hMinus ), dPlus );
//           // aVMinus.angleOffset( v, hMinus.angleTo( hPlus ), dHM );
//           // // var aVMinus = Vector.clone(v).angleOffset( v, a, -(dHM/dVM)*dH );





//           // console.log( "main:", i, " plus:", vP, " minus:", vM, " hPlus:", hP, " hMinus:", hM );
//           // console.log( i, ' d vplus:', dVP.toFixed(2), ' d vminus:', dVM.toFixed(2) );

//           // // renderCvs.ctx.strokeStyle = Color.random().desaturate(0).getRGB();

//           // renderCvs.ctx.strokeStyle = "rgba(0,0,0,0.2)";
//           // renderCvs.ctx.lineWidth = 0.5;
//           // renderCvs.ctx.beginPath();
//           // renderCvs.ctx.moveTo( vPlus.x, vPlus.y );
//           // renderCvs.ctx.lineTo( v.x, v.y );
//           // renderCvs.ctx.closePath();
//           // renderCvs.ctx.stroke();
          
//           // renderCvs.ctx.beginPath();
//           // renderCvs.ctx.moveTo( aVPlus.x, aVPlus.y  );
//           // renderCvs.ctx.lineTo( aVMinus.x, aVMinus.y );
//           // renderCvs.ctx.closePath();
//           // renderCvs.ctx.stroke();


//           // renderCvs.ctx.strokeStyle = Color.random().desaturate(0).getRGB();
//           // renderCvs.ctx.beginPath();
//           // renderCvs.ctx.lineWidth = 2;
//           // renderCvs.ctx.moveTo( vMinus.x, vMinus.y );
//           // // renderCvs.ctx.quadraticCurveTo( v.x, v.y, hPlus.x, hPlus.y );
//           // // renderCvs.ctx.moveTo( vPlus.x, vMinus.y );
//           // renderCvs.ctx.bezierCurveTo( aVMinus.x, aVMinus.y, aVPlus.x, aVPlus.y, vPlus.x, vPlus.y );
//           // renderCvs.ctx.closePath();
//           // renderCvs.ctx.stroke();

        
//         // renderCvs.ctx.lineTo( vMinus.x, vMinus.y );
//         // renderCvs.ctx.lineTo( vPlus.x, vPlus.y );



//           // h1 = blobPoints[ (i!==0 ? (i-1) : blobPoints.length-1) ].clone().add(p);
//           // h2 = blobPoints[ (i!==blobPoints.length-1 ? (i+1) : 0) ].clone().add(p);
          
          

//           // renderCvs.ctx.lineTo( h2.x, h2.y );
//           // renderCvs.ctx.lineTo( v.x, v.y );

//           // renderCvs.ctx.bezierCurveTo( h2.x, h2.y, v.x, v.y, h1.x, h1.y );
          
//           // renderCvs.ctx.quadraticCurveTo( h2.x, h2.y, v.x, v.y );

//           console.log( i, v.toString(0) );
//           // console.log( v.toString(0) );
//         }
//         // renderCvs.ctx.closePath();
        // renderCvs.ctx.stroke();