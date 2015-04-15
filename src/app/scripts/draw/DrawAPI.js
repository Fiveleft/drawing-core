define(
  [ 'drawUI', 'jquery', 'underscore', 'tweenlite' ],
  function( DrawUI, $, _, TweenLite ){

    var _instance = null,
      cvs,
      ctx,
      renderFtn,
      windowEvents;

    var DrawAPI = {

      initialize : function() {
        var self = this;

        // Properties
        this.paused = false;
        this.playing = false;

        renderFtn = function(){ self._tick(); };
        windowEvents = {
          'resize' : _.throttle(function(){self._resize();}, 200),
        };

        DrawUI.useTouch = $('html').hasClass('touch');

        $(window).on( windowEvents );
        return this;
      },


      /**
       * [destroy description]
       * @return {[type]} [description]
       */
      destroy : function() {
        $(window).off( windowEvents );
      },


      /**
       * [setCanvas description]
       * @param {[type]} el [description]
       */
      setCanvas : function( el ) {
        this.$canvas = $(el);
        cvs = $(el)[0];
        ctx = cvs.getContext('2d');
        DrawUI.setCanvas( cvs );
      },


      /**
       * [start description]
       * @return {[type]} [description]
       */
      start : function(){
        var self = this;
        this.playing = true;
        if( this.paused ) {
          this.resume();
          return;
        }

        TweenLite.ticker.removeEventListener('tick', renderFtn);
        TweenLite.ticker.addEventListener('tick', renderFtn);
        DrawUI.start();
      },


      /**
       * [stop description]
       * @return {[type]} [description]
       */
      stop : function() {
        var self = this;
        this.playing = false;
        this.paused = false;
        TweenLite.ticker.removeEventListener('tick', renderFtn);
        DrawUI.stop();
      },


      /**
       * [pause description]
       * @return {[type]} [description]
       */
      pause : function() {
        // console.log( 'PAUSED' );
        this.paused = true;
      },


      /**
       * [resume description]
       * @return {[type]} [description]
       */
      resume : function() {
        // console.log( 'RESUMING' );
        this.paused = false;
      },


      /**
       * [_render description]
       * @return {[type]} [description]
       */
      _render : function() {
        // console.log( 'RENDERING' );
      },


      /**
       * [_tick description]
       * @return {[type]} [description]
       */
      _tick : function() {
        if(!this.paused) this._render();


      },


      /**
       * [_resize description]
       * @return {[type]} [description]
       */
      _resize : function() {
        cvs.width = this.$canvas.width();
        cvs.height = this.$canvas.height();
        DrawUI.updateCanvas( cvs );
      }
    };

    if( _instance === null ) {
      _instance = DrawAPI.initialize();
    }
    return _instance;
  });