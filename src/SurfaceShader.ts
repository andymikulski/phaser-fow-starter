// The inputs for our shader
const shaderUniforms = [
  // Defaults
  "uResolution", // Canvas size (in pixels)
  "uMainSampler", // Texture for applied object
  "uTime", // Game timestamp (in milliseconds)

  "uStrength", // effect strength
  // Shader-specific
  // 'uProgress',  // Transition progress
];

const fragmentShader = `#ifdef GL_ES
precision mediump float;
#endif

#define SHADER_NAME WATER_SURFACE

uniform vec2 uResolution;
uniform float uTime;
uniform sampler2D uMainSampler;
uniform float uStrength;

varying vec2 outTexCoord;

//-------


#define M_PI 3.14159265358979323846

float rand(vec2 co){return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);}
float rand (vec2 co, float l) {return rand(vec2(rand(co), l));}
float rand (vec2 co, float l, float t) {return rand(vec2(rand(co, l), t));}

float perlin(vec2 p, float dim, float time) {
	vec2 pos = floor(p * dim);
	vec2 posx = pos + vec2(1.0, 0.0);
	vec2 posy = pos + vec2(0.0, 1.0);
	vec2 posxy = pos + vec2(1.0);

	float c = rand(pos, dim, time);
	float cx = rand(posx, dim, time);
	float cy = rand(posy, dim, time);
	float cxy = rand(posxy, dim, time);

	vec2 d = fract(p * dim);
	d = -0.5 * cos(d * M_PI) + 0.5;

	float ccx = mix(c, cx, d.x);
	float cycxy = mix(cy, cxy, d.x);
	float center = mix(ccx, cycxy, d.y);

	return center * 2.0 - 1.0;
}

// p must be normalized!
float perlin(vec2 p, float dim) {

	vec2 pos = floor(p * dim);
	vec2 posx = pos + vec2(1.0, 0.0);
	vec2 posy = pos + vec2(0.0, 1.0);
	vec2 posxy = pos + vec2(1.0);

	// For exclusively black/white noise
	/*float c = step(rand(pos, dim), 0.5);
	float cx = step(rand(posx, dim), 0.5);
	float cy = step(rand(posy, dim), 0.5);
	float cxy = step(rand(posxy, dim), 0.5);*/

	float c = rand(pos, dim);
	float cx = rand(posx, dim);
	float cy = rand(posy, dim);
	float cxy = rand(posxy, dim);

	vec2 d = fract(p * dim);
	d = -0.5 * cos(d * M_PI) + 0.5;

	float ccx = mix(c, cx, d.x);
	float cycxy = mix(cy, cxy, d.x);
	float center = mix(ccx, cycxy, d.y);

	return center * 2.0 - 1.0;
	// return perlin(p, dim, 0.0);
}


//----

float hash( vec2 p )
{
  float h = dot(p,vec2(127.1,311.7));
  return -1.0 + 2.0*fract(sin(h)*0.4437585453123) + (uTime * 0.01);
}

float noise( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );

  vec2 u = f*f*(3.0-2.0*f);

    return mix(
      mix( hash( i + vec2(0.0,0.0) ), hash( i + vec2(1.0,0.0) ), u.x),
      mix( hash( i + vec2(0.0,1.0) ), hash( i + vec2(1.0,1.0) ), u.x),
    u.y);
}

float t( in vec2 coord )
{
    float value = perlin(coord, 1.0);
    value += noise(coord / 32.) * 32.;
    value += noise(coord / 16.) * 16.;
    value += noise(coord / 8.) * 8.;
    value += noise(coord / 4.) * 4.;
    value += noise(coord / 2.) * 2.;
    value += noise(coord);
    value += noise(coord / .5) * .5;
    value += noise(coord / .25) * .25;
    return value;
}

void main()
{
  vec2 moveDir = vec2(cos(uTime * 0.1), sin(uTime * 0.1));
  vec2 coord = outTexCoord * uResolution;
  float timeScale = 0.1;
  vec2 zoomCoord = ((outTexCoord * uResolution) * 0.05); //  + sin(uTime * 0.1);
  float v = sin(zoomCoord.x + zoomCoord.y + t(zoomCoord +(uTime*10.0*timeScale*moveDir)));


  // ! ! ! WARNING ! ! ! -----------------------
  // Messing with the math for your displacement field can/will lead to flickering images or
  // generate patterns that quickly trigger headaches or migraines. Be careful!
  // (It somewhat helps to shrink the window with the preview canvas, but even that can be tough.)

  // Use this line to debug what your displacement texture looks like:
  gl_FragColor = vec4(v, v, v, 1.0);

  // -------------------------------------------

  // Sample the texture at 'outTexCoord', BUT offset the coord by the noise value.
  gl_FragColor = texture2D(uMainSampler, outTexCoord + (v * uStrength * 0.01));
}`;

export class SurfacePipeline extends Phaser.Renderer.WebGL.Pipelines
  .SinglePipeline {
  constructor(game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      shaders: [
        {
          name: "SurfacePipeline",
          fragShader: fragmentShader,
          uniforms: shaderUniforms,
        } as any,
      ],
    });
  }

  onBind(
    gameObject?: Phaser.GameObjects.GameObject &
      Phaser.GameObjects.Components.Pipeline
  ) {
    super.onBind();
    if (gameObject && gameObject.pipelineData) {
      const data = gameObject.pipelineData as { strength?: number };
      this.set1f(
        "uStrength",
        data.strength === undefined ? 0.01 : data.strength
      );
    }
  }

  onBoot() {
    this.set1f("uStrength", 0.01);
    this.set2f("uResolution", this.game.scale.width, this.game.scale.height);
  }

  onPreRender() {
    // Update the `uTime` uniform automatically.
    this.set1f("uTime", this.game.getTime() * 0.001);
  }
}


/**
 * PostFX is slightly different but uses the same shader under the hood.
 * (This may not be the right way to share code between a `SinglePipeline` and `PostFXPipeline`)
 */
export class SurfacePostFX extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      shaders: [
        {
          name: "SurfacePostFX",
          fragShader: fragmentShader,
          uniforms: shaderUniforms,
        } as any,
      ],
    });
  }

  onBoot() {
    this.set1f("uStrength", 0.25);
    this.set2f("uResolution", this.game.scale.width, this.game.scale.height);
  }

  onPreRender() {
    // Update the `uTime` uniform automatically.
    this.set1f("uTime", this.game.getTime() * 0.001);
  }
}
