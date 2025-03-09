import { Effect, ShaderMaterial, Texture } from "@babylonjs/core";
import Editor from "./Editor";

export default class VatMaterial extends ShaderMaterial {
    constructor(name: string, textureName: string) {
        const { scene, assetManager } = Editor.GetInstance()

        super(name, scene, "vat", {
            attributes: ["position", "normal", "uv", "uv2","uv3","uv4","uv5"],
            defines: ["#define INSTANCES"],
            uniforms: ["worldViewProjection", "posTex", "frame"]
        });

        Effect.ShadersStore.vatVertexShader = `
                precision highp float;

                attribute vec3 position;
                attribute vec2 uv;
                attribute vec2 uv2;
                attribute vec2 uv3;
                attribute vec2 uv4;
                attribute vec2 uv5;

                uniform mat4 worldViewProjection;
                uniform sampler2D posTex;
                uniform float frame;

                uniform float posTexWidth;
                uniform float posTexHeight;

                void main() {
                    vec4 texturePos = texture2D(posTex,vec2(uv2.x, 1.0 - frame));

                    float minX = uv3.x;
                    float maxX = uv3.y;

                    float minY = uv4.x;
                    float maxY = uv4.y;

                    float minZ = uv5.x;
                    float maxZ = uv5.y;

                    float posX = texturePos.x * (maxX - minX) + minX;
                    float posY = texturePos.y * (maxY - minY) + minY;
                    float posZ = texturePos.z * (maxZ - minZ) + minZ;

                    // gl_Position = worldViewProjection * vec4(position.x,position.y,position.z, 1.0);
                    gl_Position = worldViewProjection * vec4(posX,posY,posZ, 1.0);
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

        let a = 0
        scene.onBeforeRenderObservable.add(() => {
            a += 0.002
            if (a > 1) a = 0.0
            this.setFloat("frame", a)
        })
    }
}