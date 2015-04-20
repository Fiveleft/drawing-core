define(
  [ 'drawUI', 'jquery', 'underscore', 'tweenlite', 'draw/views/BlobView' ],
  function( DrawUI, $, _, TweenLite, RenderView ){

    var _instance = null,
      cvs,
      ctx,
      renderFtn,
      windowEvents;

    var DrawAPI = {

      initialize : function() {
        var self = this;

        // Set up the DrawUI
        DrawUI.useTouch = $('html').hasClass('touch');

        // Properties
        this.paused = false;
        this.playing = false;

        renderFtn = function(){ self._tick(); };
        windowEvents = {
          'resize' : _.throttle(function(){self._resize();}, 200),
        };

        this.renderView = new RenderView();

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
        cvs.width = cvs.clientWidth;
        cvs.height = cvs.clientHeight;
        ctx = cvs.getContext('2d');
        DrawUI.setCanvas( cvs );
        this.renderView.setCanvas( cvs );
      },


      /**
       * [start description]
       * @return {[type]} [description]
       */
      start : function(){
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
        this.renderView.render();
      },


      /**
       * [_tick description]
       * @return {[type]} [description]
       */
      _tick : function() {
        if(!this.paused) {
          this._render();
        }
      },


      /**
       * [_resize description]
       * @return {[type]} [description]
       */
      _resize : function() {
        cvs.width = cvs.clientWidth;
        cvs.height = cvs.clientHeight;
        DrawUI.updateCanvas( cvs );
        this.renderView.updateCanvas( cvs );
      }
    };

    if( _instance === null ) {
      _instance = DrawAPI.initialize();
    }
    return _instance;
  });