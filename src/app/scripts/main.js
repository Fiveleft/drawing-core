'use strict';
require.config({
  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    underscore: '../bower_components/underscore/underscore',
    handlebars: '../bower_components/handlebars/handlebars',
    tweenlite: '../bower_components/gsap/src/uncompressed/TweenLite',
    tweenmax: '../bower_components/gsap/src/uncompressed/TweenMax',
    scrollPlugin: '../bower_components/gsap/src/uncompressed/plugins/ScrollToPlugin',
    easePack: '../bower_components/gsap/src/uncompressed/easing/EasePack',
    app: 'app/Application',
    
    drawAPI: 'draw/DrawAPI',
    drawUI: 'draw/DrawUI',
    RenderView: 'draw/RenderView',

    CanvasView: 'fiveleft/canvas/CanvasView',

    Color: 'fiveleft/core/Color',
    Vector: 'fiveleft/core/Vector',
    MotionVector: 'fiveleft/core/MotionVector',
    Rectangle: 'fiveleft/core/Rectangle',
    Utils: 'fiveleft/core/Utils',
  },
  shim: {
    'tweenlite': {
      deps: ['easePack', 'scrollPlugin'],
      exports: 'TweenLite'
    }
  }
});

// Load our app module and pass it to our definition function
require(['jquery','app'], function($,App) {
  $(function(){
    App.start();
  });
});