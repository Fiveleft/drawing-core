// Application.js
define(
  [ 'jquery','drawAPI' ],
  function( $, DrawAPI ){
    
    var Application = {


      initialize : function() {
        var self = this;

        DrawAPI.setCanvas( $('canvas') );
        
        this.$canvasUI = $('.canvas-ui');
        this.$btnStart = $('.stop', this.$canvasUI);
        this.$btnPause = $('.pause', this.$canvasUI);
        this.$btnReset = $('.reset', this.$canvasUI);

        this.$btnStart.on('click', function(e){self._togglePlay(e);});
        this.$btnPause.on('click', function(e){self._togglePause(e);});

        return this;
      },


      start : function() {
        this._setState( 'playing' );
      },


      _setState : function( state ) {

        this.state = state;
        this.$canvasUI.attr('data-state', state);

        switch( state ) {

          case 'playing' :
          this.$btnStart.text('Stop');
          this.$btnPause.text('Pause').removeAttr('disabled');
          this.$btnReset.removeAttr('disabled');
          DrawAPI.start();
          break;

          case 'paused' :
          this.$btnStart.text('Stop');
          this.$btnPause.text('Resume').removeAttr('disabled');
          this.$btnReset.removeAttr('disabled');
          DrawAPI.pause();
          break;

          case 'stopped' :
          this.$btnStart.text('Start');
          this.$btnPause.text('Pause').attr('disabled','');
          this.$btnReset.removeAttr('disabled');
          DrawAPI.stop();
          break;
        }
      },


      _togglePause : function( e ) {
        e.preventDefault();
        var newState = this.state === 'paused' ? 'playing' : 'paused';
        this._setState( newState );
      },


      _togglePlay : function( e ) {
        e.preventDefault();
        var newState = this.state === 'stopped' ? 'playing' : 'stopped';
        this._setState( newState );
      }

    };
    return Application.initialize();
  });