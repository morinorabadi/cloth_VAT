import { Effect, Scene, ShaderMaterial } from "@babylonjs/core";

export default class VatMaterial extends ShaderMaterial {
    constructor(name: string, scene: Scene) {
        Effect.ShadersStore.vatVertexShader = `
                precision highp float;

                attribute vec3 position;
                attribute vec2 uv;

                uniform mat4 worldViewProjection;
                uniform mat4 viewProjection;

                // varying vec3 vPosition;
                // varying vec3 vColor;
                // varying vec2 vUv;
                
                // uniform float totalFrames;
                // attribute vec4 animation;
                
                // uniform float bbox_max;
                // uniform float bbox_min;
               
                // uniform float offset;
                // uniform float time;
                
                // uniform sampler2D posTex;
                // uniform sampler2D mainTexture;
                
             
                
                void main() {
                    // vUv = uv;
                    // float range1 = animation.x;
                    // float range2 = animation.y;
                    // float _numOfFrames = range2 - range1;
                    // float timeInFrames = ((ceil(fract(time * animation.w / _numOfFrames) * _numOfFrames))/ totalFrames) + (1.0/ totalFrames);
                    // timeInFrames += range1 / totalFrames;
                    // vec4 texturePos = texture2D(posTex,vec2(uv2.x, (timeInFrames + uv2.y)));
                    // float expand = bbox_max - bbox_min;
                    // texturePos.xyz *= expand;
                    // texturePos.xyz += bbox_min;
                    // p += texturePos.xyz;  //swizzle y and z because textures are exported with z-up
                    // vColor = texture2D(mainTexture,uv).rgb;

                    // vec3 p = position;

                    gl_Position = worldViewProjection * vec4(position, 1.0);

            }`;


        Effect.ShadersStore.vatPixelShader = `
                precision highp float;
                // varying vec3 vPosition;
                // varying vec3 vColor;
                // varying vec2 vUv;
                // uniform sampler2D mainTexture;
            
            
                void main(void) {
                    
                   gl_FragColor = vec4(1.0,0.0,0.0,1.0);
                //    gl_FragColor = texture2D(mainTexture,vUv);
                }`;


        super(name, scene, "vat", {
            attributes: ["position", "normal", "uv"],
            defines: ["#define INSTANCES"],
            uniforms: ["worldViewProjection", "viewProjection"]
        });
    }
}