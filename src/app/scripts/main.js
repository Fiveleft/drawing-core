'use strict';
require.config({
  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    underscore: '../bower_components/underscore/underscore',
    // backbone: '../bower_components/backbone/backbone',
    handlebars: '../bower_components/handlebars/handlebars',
    tweenlite: '../bower_components/gsap/src/uncompressed/TweenLite',
    tweenmax: '../bower_components/gsap/src/uncompressed/TweenMax',
    scrollPlugin: '../bower_components/gsap/src/uncompressed/plugins/ScrollToPlugin',
    app: 'app/Application',
    drawAPI: 'draw/DrawAPI',
    drawUI: 'draw/DrawUI',
    Vector: 'fiveleft/core/Vector',
    
  },
  shim: {
    // backbone: {
    //   deps: ['jquery', 'underscore'],
    //   exports: 'backbone'
    // },
    'tweenlite': {
      deps: ['scrollPlugin'],
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
