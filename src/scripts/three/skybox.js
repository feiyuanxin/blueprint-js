import {EventDispatcher, SphereGeometry, ShaderMaterial, Mesh, TextureLoader, BackSide, Color, DoubleSide} from 'three';

export class Skybox extends EventDispatcher
{
	constructor(scene)
	{
		super();
		
		this.topColor = 0xffffff;//0xD8ECF9
		this.bottomColor = 0xe9e9e9; //0xf9f9f9;//0x565e63
		this.verticalOffset = 500;
		
		var uniforms = {topColor: {type: 'c',value: new Color(this.topColor)},bottomColor: {type: 'c',value: new Color(this.bottomColor)},offset: {type: 'f',value: this.verticalOffset}};
		
		this.scene = scene;
		
		this.sphereRadius = 4000;
		this.widthSegments = 32;
		this.heightSegments = 15;
		this.sky = null;

		this.plainVertexShader = ['varying vec3 vWorldPosition;','void main() {','  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );','  vWorldPosition = worldPosition.xyz;','  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );','}'].join('\n');
		this.plainFragmentShader = ['uniform vec3 topColor;','uniform vec3 bottomColor;','uniform float offset;','varying vec3 vWorldPosition;','void main() {','  float h = normalize( vWorldPosition + offset ).y;','  gl_FragColor = vec4( mix( bottomColor, topColor, (h + 1.0) / 2.0), 1.0 );','}'].join('\n');
		
		this.vertexShader = ['varying vec2 vUV;','void main() {','  vUV=uv;','  vec4 pos = vec4(position, 1.0);', '   gl_Position = projectionMatrix * modelViewMatrix * pos;','}'].join('\n');
		this.fragmentShader = ['uniform sampler2D texture;', 'varying vec2 vUV;', 'void main() {  ', 'vec4 sample = texture2D(texture, vUV);', 'gl_FragColor = vec4(sample.xyz, sample.w);' ,'}'].join('\n');
		
		this.texture = new TextureLoader();
		this.skyGeo = undefined;
		this.skyMat = undefined;
		this.plainSkyMat = new ShaderMaterial({vertexShader: this.plainvertexShader,fragmentShader: this.plainfragmentShader,uniforms: uniforms, side: BackSide});
		this.sky = undefined;
		
		this.init();
	}
	
	toggleEnvironment(flag)
	{
		if(!flag)
		{
			this.sky.material = this.plainSkyMat;
		}
		else
		{
			this.sky.material = this.skyMat;
		}
		this.sky.visible = flag;
	}
	
	setEnvironmentMap(url)
	{
		var scope = this;
		scope.texture.load(url, function (t)
		{
			console.log('SKYBOX BACKGROUND LOADED');
			if(scope.sky)
			{
				scope.scene.remove(scope.sky);
			}
			var textureUniform = {type: 't', value: t};
			var uniforms = {texture: textureUniform};
			scope.skyGeo = new SphereGeometry(scope.sphereRadius, scope.widthSegments, scope.heightSegments);
			scope.skyMat = new ShaderMaterial({vertexShader: scope.vertexShader, fragmentShader: scope.fragmentShader, uniforms: uniforms, side: DoubleSide});
			scope.sky = new Mesh(scope.skyGeo, scope.skyMat);
			scope.sky.position.x += scope.sphereRadius*0.5;
			scope.scene.add(scope.sky);
		}, undefined, function()
		{
			console.log('ERROR LOADEING FILE');
		});
	}
	
	init() 
	{		
		this.toggleEnvironment(false);
	}
}