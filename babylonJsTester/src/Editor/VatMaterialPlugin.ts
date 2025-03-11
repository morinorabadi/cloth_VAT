import { Material, MaterialDefines, MaterialPluginBase, ShaderLanguage, Texture, UniformBuffer } from "@babylonjs/core";

export default class VatMaterialPlugin extends MaterialPluginBase {
    texture: Texture
    normalTexture: Texture
    frame: number

    constructor(material: Material, texture: Texture, normalTexture: Texture) {
        super(material, "VatMaterialPlugin", 200, { VAT: false });
        this.texture = texture;
        this.normalTexture = normalTexture;

        this.texture.wrapU = Texture.WRAP_ADDRESSMODE;
        this.texture.wrapV = Texture.WRAP_ADDRESSMODE;

        this.frame = 0.0

        this._enable(true);
    }

    prepareDefines(defines: MaterialDefines) {
        defines["VAT"] = true;
    }

    getClassName() {
        return "VatMaterialPlugin";
    }

    getSamplers(samplers: string[]) {
        samplers.push("posTex", "norTex", "frame")
    }

    getAttributes(attributes: string[]) {
        attributes.push("indexX", "minMaxX", "minMaxY", "minMaxZ", "minMaxNX", "minMaxNY", "minMaxNZ")
    }

    bindForSubMesh(uniformBuffer: UniformBuffer): void {
        uniformBuffer.setTexture("posTex", this.texture);
        uniformBuffer.setTexture("norTex", this.normalTexture);
        uniformBuffer.updateFloat("frame", this.frame)
    }

    getUniforms() {
        return {
            "ubo": [
                { name: "frame", size: 1, type: "float" },
            ],
            "vertex":
                `#ifdef VAT
                    uniform float frame;
                #endif
                `,
        }
    }

    isCompatible(shaderLanguage: ShaderLanguage) {
        switch (shaderLanguage) {
            case ShaderLanguage.GLSL:
                return true;
            case ShaderLanguage.WGSL:
            default:
                return false;
        }
    }

    getCustomCode(shaderType: string, shaderLanguage: ShaderLanguage) {
        if (shaderType === "vertex") {
            if (shaderLanguage === ShaderLanguage.GLSL) {
                return {
                    "CUSTOM_VERTEX_DEFINITIONS": `
                    attribute float indexX;

                    attribute vec2 minMaxX;
                    attribute vec2 minMaxY;
                    attribute vec2 minMaxZ;

                    attribute vec2 minMaxNX;
                    attribute vec2 minMaxNY;
                    attribute vec2 minMaxNZ;

                    uniform sampler2D posTex;
                    uniform sampler2D norTex;
                `,
                    "CUSTOM_VERTEX_UPDATE_POSITION": `
                    vec4 texturePos = texture2D(posTex,vec2(indexX, 1.0 - frame));


                    float posX = texturePos.x * (minMaxX.y - minMaxX.x) + minMaxX.x;
                    float posY = texturePos.y * (minMaxY.y - minMaxY.x) + minMaxY.x;
                    float posZ = texturePos.z * (minMaxZ.y - minMaxZ.x) + minMaxZ.x;

                    positionUpdated = vec3(posX,posY,posZ);
                    `,
                    "CUSTOM_VERTEX_UPDATE_NORMAL": `
                    vec4 textureNor = texture2D(norTex,vec2(indexX, 1.0 - frame));

                    float norX = textureNor.x * (minMaxNX.y - minMaxNX.x) + minMaxNX.x;
                    float norY = textureNor.y * (minMaxNY.y - minMaxNY.x) + minMaxNY.x;
                    float norZ = textureNor.z * (minMaxNZ.y - minMaxNZ.x) + minMaxNZ.x;

                    normalUpdated = vec3(norX,norY,norZ);
                    `
                }
            }
        }
        return null;
    }
}