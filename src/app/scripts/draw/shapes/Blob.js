// Blob.js
define(
  [ 'Utils', 'Vector', 'tweenlite' ],
  function( Utils, Vector, TweenLite ){


    var Blob = function( options ) {
      this.initialize( options );
    };

    Blob.prototype = {

      constructor : Blob,
      animating : false,
      minRadius : 100,
      maxRadius : 300,
      minPoints : 6,
      maxPoints : 30,
      points : [],
      count : 0,
      showGuides : false,
      sizeRatio : 1,
      drawVars : {},

      initialize : function( options ) {
        options = options||{};
        this.minRadius = options.minRadius||this.minRadius;
        this.maxRadius = options.maxRadius||this.maxRadius;
        this.minPoints = options.minPoints||this.minPoints;
        this.maxPoints = options.maxPoints||this.maxPoints;
        this.showGuides = options.showGuides||this.showGuides;
        this.sizeRatio = options.sizeRatio||0;
        this.initDrawVars();
      },

      initDrawVars : function() {
        this.drawVars = {
          count : 0,
          a : 0,
          d : 0,
          dMax : 0,
          d1 : 0,
          d2 : 0,
          i : 0,
          p1Ind : 0,
          p2Ind : 0,
          h0Ind : 0,
          h1Ind : 0,
          h2Ind : 0,
          center : new Vector(),
          p1 : new Vector(),
          p2 : new Vector(),
          a1 : new Vector(),
          a2 : new Vector(),
          h0 : new Vector(),
          h1 : new Vector(),
          h2 : new Vector()
        };
      },

      animationStart : function() {
        this.animating = true;
      },

      animationEnd : function() {
        this.animating = false;
      },

      center : function( vector ) {
        if( vector && vector.type === 'Vector' ) {
          this.drawVars.center.copy( vector );
        }
      },

      create : function( center ) {

        var anglePartition,
          angleOffset,
          a,
          d,
          i,
          bp;

        if( center && center.type === 'Vector' ) {
          this.drawVars.center.copy( center );
        }

        // ensures its always an even number
        this.points = [];
        this.count = Utils.round( Utils.randomBetween( this.minPoints, this.maxPoints )*0.5 ) * 2;
        anglePartition = (360/this.count);
        angleOffset = Utils.round( anglePartition * 0.5 );

        for( i=this.count-1; i!==-1; i-- ) {
          a = (Utils.randomAround( angleOffset ) + (anglePartition * (i+1))) % 360;
          d = Utils.roundRandomBetween( this.minRadius, this.maxRadius );
          bp = new BlobPoint({
            angle: Utils.toRad(a),
            distance: d,
            startVector: this.drawVars.center
          });
          this.points.push( bp );
        }
        this.points.sort( function(a,b) {
          return a.angle>b.angle ? 1 : a.angle<b.angle ? -1 : 0;
        });
      },

      update : function() {
        for( var i=this.count-1; i!==-1; i-- ) {
          this.points[i].ratio = this.sizeRatio;//this.points[i].ease.getRatio( this.sizeRatio );
          this.points[i].update();
        }
      },

      draw : function( ctx ) {

        var dv = this.drawVars;
        dv.count = this.count-1;

        // v.add(p);
        // if( this.showGuides ) {
        //   guideCvs.clear();
        //   guideCvs.ctx.globalAlpha = 1;
        //   guideCvs.ctx.lineWidth = 1;
        //   guideCvs.ctx.strokeStyle = guideColor.getRGBA();
        //   guideCvs.ctx.fillStyle = guideColor.getRGBA();
        //   guideCvs.ctx.drawImage( cacheCvs.cvs, 0, 0, 20, 20, guideCvs.center.x-10, guideCvs.center.y-10, 20, cacheCvs.height );
        // }
        
        ctx.beginPath();

        for( var i=0; i<=dv.count; i+=2 ) {

          dv.p1Ind = i;
          dv.p2Ind = (i+2>dv.count) ? 0 : i+2;
          dv.h0Ind = (i-1<0) ? dv.count : i-1;
          dv.h1Ind = (i+1>dv.count) ? 1 : i + 1;
          dv.h2Ind = (i+3>dv.count) ? 1 : i + 3;

          dv.p1 = this.points[ dv.p1Ind ].vector;
          dv.p2 = this.points[ dv.p2Ind ].vector;
          dv.h0 = this.points[ dv.h0Ind ].vector;
          dv.h1 = this.points[ dv.h1Ind ].vector;
          dv.h2 = this.points[ dv.h2Ind ].vector;

          dv.dMax = dv.p1.distance( dv.p2 ) * 0.5;

          // Behind point
          dv.a = dv.h1.angleTo( dv.h0 );
          dv.d1 = dv.p1.distance( dv.h0 );
          dv.d2 = dv.p1.distance( dv.h1 );
          dv.d = (dv.d2 / (dv.d1+dv.d2)) * dv.h0.distance( dv.h1 );
          dv.a1.angleOffset( dv.p1, dv.a, Math.min(dv.d, dv.dMax) );

          // Forward point
          dv.a = dv.h1.angleTo( dv.h2 );
          dv.d1 = dv.p2.distance( dv.h1 );
          dv.d2 = dv.p2.distance( dv.h2 );
          dv.d = (dv.d1 / (dv.d1+dv.d2)) * dv.h1.distance( dv.h2 );
          dv.a2.angleOffset( dv.p2, dv.a, Math.min(dv.d, dv.dMax) );

          // Draw Line
          if( i===0 ) {
            ctx.moveTo( dv.p1.x, dv.p1.y );
          }
          ctx.bezierCurveTo( dv.a1.x, dv.a1.y, dv.a2.x, dv.a2.y, dv.p2.x, dv.p2.y );

          if( this.showGuides ) {
            // // Draw Anchors onto Guide
            // guideCvs.ctx.beginPath();
            // guideCvs.ctx.moveTo( dv.p1.x, dv.p1.y );
            // guideCvs.ctx.lineTo( dv.a1.x, dv.a1.y );
            // guideCvs.ctx.stroke();

            // guideCvs.ctx.beginPath();
            // guideCvs.ctx.moveTo( dv.p2.x, dv.p2.y );
            // guideCvs.ctx.lineTo( dv.a2.x, dv.a2.y );
            // guideCvs.ctx.stroke();

            // guideCvs.ctx.arc( dv.a1.x, dv.a1.y, 4, 0, 2*Math.PI, false );
            // guideCvs.ctx.arc( dv.a2.x, dv.a2.y, 4, 0, 2*Math.PI, false );
            // guideCvs.fill();
          }
        }
        ctx.closePath();
        ctx.fill();
      }
    };




    var easeMethods = [
      window.Cubic.easeOut,
      window.Sine.easeOut,
      window.Quint.easeOut,
      window.Circ.easeOut,
      // window.Cubic.easeIn,
      // window.Sine.easeIn,
      // window.Circ.easeIn,
      // window.Quint.easeIn,
      // window.Cubic.easeInOut,
      // window.Quint.easeInOut,
      // window.Sine.easeInOut,
      // window.Circ.easeInOut,
    ];

    var BlobPoint = function( options ) {

      options = (options||{});
      this.angle = options.angle || 0;
      this.startVector = options.startVector || new Vector();
      this.vector = options.vector || new Vector();
      this.distance = options.distance || 1;
      this.ratio = options.ratio || 0.5;
      this.setAngle = bpSetAngle;
      this.ease = bpRandomEase();
      this.update = bpUpdate;
    };

    function bpRandomEase() {
      return easeMethods[ Utils.roundRandomBetween(0, easeMethods.length-1 ) ];
    }
    function bpSetAngle( a ) {
      this.angle = a;
      this.vector.angleOffset( this.startVector, this.angle, (this.distance*this.ratio) );
    }
    function bpUpdate(){
      var r = this.ease.getRatio( this.ratio );
      this.vector.angleOffset( this.startVector, this.angle, (this.distance*r) );
    }


    return Blob;

  });