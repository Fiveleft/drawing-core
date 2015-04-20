define(
  ['Vector'],
  function( Vector ){

    var minSpeed = 0.0001,
      maxSpeed = 1;


    var MotionVector = function( options ) {
      
      var oldTarget = new Vector(),
        vel = new Vector(),
        spd = new Vector();

      options = (options || {});

      this.pos = new Vector(1,1,1);
      this.target = new Vector();
      this.maxVelocity = options.maxVelocity || MotionVector.defaults.maxVelocity;
      this.friction = options.friction || MotionVector.defaults.friction;
      this.speed = options.speed || MotionVector.defaults.speed;
      this.acceleration = options.acceleration || MotionVector.defaults.acceleration;
      this.moving = false;
     // this.flagMoving = false;

      this.setTarget = function( x, y, z ) {
        oldTarget.copy( this.target );
        if( typeof x === 'number' ) {
          this.target.set( x, y, z );
        }else{
          this.target.copy(x);
        }
        this.moving = this.getDistance() > 0.99;
        return this;
      };

      this.update = function() {
        // Update the Motion Vectors
        this.moving = this.getDistance() > 0.99;

        spd
          .set()
          .addScalar( this.friction )
          .multiplyScalar( this.speed );

        vel
          .subtractVectors( this.target, this.pos )
          .multiply( spd )
          .limit( -this.maxVelocity, this.maxVelocity );

        this.pos
          .add( vel );

        this.speed = (this.speed<maxSpeed) ? this.speed * (1+this.acceleration) : maxSpeed;

        return this;
      };

      this.getDistance = function() {
        return this.target.distance( this.pos );
      };

      this.getRatio = function() {
        return this.target.distance( oldTarget ) / this.pos.distance( oldTarget );
      };

    };


    MotionVector.defaults = {
      maxVelocity : 5,
      friction : 0.095,
      speed : minSpeed,
      acceleration : 0.5
    };

    return MotionVector;
  });