import { Effect, ShaderMaterial, Texture } from "@babylonjs/core";
import Editor from "./Editor";

export default class VatMaterial extends ShaderMaterial {
    constructor(name: string, textureName: string) {
        const { scene, assetManager } = Editor.GetInstance()

        super(name, scene, "vat", {
            attributes: ["position", "normal", "uv", "uv2"],
            defines: ["#define INSTANCES"],
            uniforms: ["worldViewProjection", "posTex", "frame"]
        });

        Effect.ShadersStore.vatVertexShader = `
                precision highp float;

                attribute vec3 position;
                attribute vec2 uv;
                attribute vec2 uv2;

                uniform mat4 worldViewProjection;
                uniform sampler2D posTex;
                uniform float frame;

                uniform float posTexWidth;
                uniform float posTexHeight;
                
                float unpackFloatFromUint(float packed) {
                    float sign = step(0.5, mod(packed, 2.0)); 
                    packed = floor(packed / 2.0);             
                
                    float exponent = mod(packed, 256.0);      
                    packed = floor(packed / 256.0);           
                
                    float mantissa = packed;                  
                
                    
                    if (exponent == 255.0) {
                        
                        return sign > 0.5 ? -1e38 : 1e38; 
                    } else if (exponent == 0.0) {
                        
                        return sign > 0.5 ? -mantissa * pow(2.0, -126.0) : mantissa * pow(2.0, -126.0);
                    } else {
                        
                        return sign > 0.5 ? 
                            -(mantissa + pow(2.0, 23.0)) * pow(2.0, exponent - 127.0) : 
                            (mantissa + pow(2.0, 23.0)) * pow(2.0, exponent - 127.0);
                    }
                }

                float decodeFloat32(vec4 pixel) {
                    float byte1 = floor(pixel.r * 255.0); 
                    float byte2 = floor(pixel.g * 255.0); 
                    float byte3 = floor(pixel.b * 255.0); 
                    float byte4 = floor(pixel.a * 255.0); 
                
                    float combined = 
                        byte1 * 256.0 * 256.0 * 256.0 + 
                        byte2 * 256.0 * 256.0 +         
                        byte3 * 256.0 +                 
                        byte4;                          
                        
                    return unpackFloatFromUint(combined);
                }
                
                void main() {
                    vec4 texturePos = texture2D(posTex,vec2(uv2.x, frame));

                    vec4 pix0 = texture2D(posTex,vec2(uv2.x, 1.0 - (0.0 / float(posTexHeight))));
                    vec4 pix1 = texture2D(posTex,vec2(uv2.x, 1.0 - (1.0 / float(posTexHeight))));
                    vec4 pix2 = texture2D(posTex,vec2(uv2.x, 1.0 - (2.0 / float(posTexHeight))));
                    vec4 pix3 = texture2D(posTex,vec2(uv2.x, 1.0 - (3.0 / float(posTexHeight))));
                    vec4 pix4 = texture2D(posTex,vec2(uv2.x, 1.0 - (4.0 / float(posTexHeight))));
                    vec4 pix5 = texture2D(posTex,vec2(uv2.x, 1.0 - (5.0 / float(posTexHeight))));
                    vec4 pix6 = texture2D(posTex,vec2(uv2.x, 1.0 - (6.0 / float(posTexHeight))));
                    vec4 pix7 = texture2D(posTex,vec2(uv2.x, 1.0 - (7.0 / float(posTexHeight))));

                    float minX = decodeFloat32(vec4(pix0.rgb,pix1.r));
                    float maxX = decodeFloat32(vec4(pix1.gb,pix1.rg));

                    float minY = decodeFloat32(vec4(pix2.b,pix3.rgb));
                    float maxY = decodeFloat32(vec4(pix4.rgb,pix5.r));

                    float minZ = decodeFloat32(vec4(pix5.gb,pix6.rg));
                    float maxZ = decodeFloat32(vec4(pix6.b,pix7.rgb));

                    float posX = texturePos.x * (maxX - minX) + minX;
                    float posY = texturePos.y * (maxY - minY) + minY;
                    float posZ = texturePos.z * (maxZ - minZ) + minZ;

                    // gl_Position = worldViewProjection * vec4(texturePos.x,position.y,texturePos.z, 1.0);
                    // gl_Position = worldViewProjection * vec4(position.x,texturePos.y,position.z, 1.0);
                    // gl_Position = worldViewProjection * vec4(position.x,texturePos.y,position.z, 1.0);
                    gl_Position = worldViewProjection * vec4(position.x,maxY,position.z, 1.0);
                    // gl_Position = worldViewProjection * vec4(posX,posY,posZ, 1.0);
            }`;


        Effect.ShadersStore.vatPixelShader = `
                precision highp float;
            
                void main(void) {
                   gl_FragColor = vec4(1.0,0.0,0.0,1.0);
                }`;


        const posTexture = assetManager.getTexture(textureName)
        posTexture.wrapU = Texture.WRAP_ADDRESSMODE;
        posTexture.wrapV = Texture.WRAP_ADDRESSMODE;

        const size = posTexture.getSize()

        this.setTexture("posTex", posTexture);
        this.setFloat("posTexWidth", size.width);
        this.setFloat("posTexHeight", size.height);

        let a = 0.0
        const maxA = (size.height - 8) / size.height
        console.log(maxA)

        scene.onBeforeRenderObservable.add(() => {
            a += 0.005
            if (a > maxA) a = 0.0
            this.setFloat("frame", a)
        })
    }
}