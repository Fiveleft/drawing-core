define(
  [ 'jquery', 'underscore', 'Vector' ],
  function( $, _, Vector ){

    var _ui = null,
      cvs = null,
      clickTime = 300,
      moveThrottle = 30,
      mouseEvents,
      touchEvents,
      dragList = [],
      dragHistory = [],
      dragHistorySteps = 10;


    var DrawUI = {

      eventTypes : {
        begin : 'drawUI:begin',
        end : 'drawUI:end',
        draw : 'drawUI:draw',
        click : 'drawUI:click'
      },

      useTouch : false,

      initialize : function() {
        var self = this;

        this.isDown = false;
        this.isDragged = false;
        this.timeDown = 0;
        this.vCanvas = new Vector();
        this.vDown = new Vector();
        this.vUp = new Vector();
        this.vPos = new Vector();
        this.vDrag = new Vector();
        this.vClick = new Vector();
        this.vDownLast = new Vector();
        this.vUpLast = new Vector();
        this.vPosLast = new Vector();

        mouseEvents = {
          'mousedown' : self._down,
          'mouseup' : self._up,
          'mousemove' : _.throttle( function(e){self._move(e);}, moveThrottle ),
        };
        touchEvents = {
          'touchstart' : self._touchStart,
          'touchend' : self._touchEnd,
          'touchmove' : _.throttle( function(e){self._touchMove(e);}, moveThrottle ),
        };

        return this;
      },


      setCanvas : function( el ) {
        this.$canvas = $(el);
        this.updateCanvas( el );
      },


      updateCanvas : function( el ) {
        var pos = $(el).offset();
        cvs = $(el)[0];
        this.$canvas = $(el);
        this.vCanvas.set( pos.left, pos.top );
      },


      start : function() {
        if( _ui.useTouch ) {
          _ui.$canvas.off( touchEvents ).on( touchEvents );
        }else{
          _ui.$canvas.off( mouseEvents ).on( mouseEvents );
        }
      },


      stop : function() {
        _ui.$canvas.off( touchEvents );
        _ui.$canvas.off( mouseEvents );
      },


      _click : function( e ) {
        _ui.vClick
          .set( e.pageX, e.pageY )
          .subtract( _ui.vCanvas );

        window.dispatchEvent( new CustomEvent( _ui.eventTypes.click, {detail:{p:_ui.vClick}}) );
      },


      _down : function( e ) {
        var evtDetail = {
          p : null
        };

        _ui.$canvas.addClass('no-select');
        _ui.timeDown = e.timeStamp;
        _ui.isDown = true;
        _ui.vDownLast.copy( _ui.vDown );
        _ui.vDown
          .set( e.pageX, e.pageY )
          .subtract( _ui.vCanvas );

        evtDetail.p = _ui.vDown;
        window.dispatchEvent( new CustomEvent( _ui.eventTypes.begin, {detail : evtDetail}) );
        // console.log( '***\nDrawUI._down', _ui.vDown.toString(), e.timeStamp );
      },


      _up : function( e ) {
        var evtDetail = {
          p : null,
          endDraw : false,
          isClick : false
        };

        _ui.$canvas.removeClass('no-select');
        _ui.isDown = false;

        if( _ui.isDragged ) {
          _ui.isDragged = false;
          evtDetail.endDraw = true;
          endDrag(e);
        }

        _ui.vUpLast.copy( _ui.vUp );
        _ui.vUp
          .set( e.pageX, e.pageY )
          .subtract( _ui.vCanvas );

        evtDetail.p = _ui.vUp;
        evtDetail.isClick = (_ui.vUp.distance(_ui.vDown) <= 2) && (e.timeStamp - _ui.timeDown) < clickTime;

        window.dispatchEvent( new CustomEvent( _ui.eventTypes.end, {detail : evtDetail}) );
        if( evtDetail.isClick ) {
          _ui._click( e );
        }
      },


      _drag : function( e ) {

        var evtDetail = {
          p : null,
          startDraw : false
        };

        if( !_ui.isDragged ) {
          dragList = [];
          evtDetail.startDraw = true;
        }

        _ui.isDragged = true;
        _ui.vDrag
          .set( e.pageX, e.pageY )
          .subtract( _ui.vCanvas );

        dragList.push( _ui.vDrag.raw() );
        evtDetail.p = _ui.vDrag.clone();
        window.dispatchEvent( new CustomEvent( _ui.eventTypes.draw, {detail : evtDetail}) );
      },


      _move : function( e ) {
        if( _ui.isDown ) {
          _ui._drag(e);
          return;
        }
        _ui.isDragged = false;
        _ui.vPosLast.copy( _ui.vPos );
        _ui.vPos
          .set( e.pageX, e.pageY )
          .subtract( _ui.vCanvas );
      },


      _touchStart : function( e ) {
        var mEvt = {
          pageX: e.originalEvent.touches[0].clientX,
          pageY: e.originalEvent.touches[0].clientY,
          timeStamp: e.timeStamp
        };
        _ui._down( mEvt );
      },


      _touchEnd : function( e ) {
        var mEvt = {
          pageX: e.originalEvent.changedTouches[0].clientX,
          pageY: e.originalEvent.changedTouches[0].clientY,
          timeStamp: e.timeStamp
        };
        _ui._up( mEvt );
      },


      _touchMove : function( e ) {
        var mEvt = {
          pageX: e.originalEvent.touches[0].clientX,
          pageY: e.originalEvent.touches[0].clientY,
          timeStamp: e.timeStamp
        };
        _ui._move( mEvt );
      },

    };



    function endDrag( e ) {
      var dragEvent = {
        timeStamp: e.timeStamp,
        list: dragList
      };
      if( dragHistory.length >= dragHistorySteps ) {
        dragHistory = _.last( dragHistory, 9 );
      }
      dragHistory.push( dragEvent );
      // console.log( dragEvent );
    }






    if( _ui === null ) {
      _ui = DrawUI.initialize();
    }
    return _ui;
  });