import { Material, MaterialDefines, MaterialPluginBase, ShaderLanguage, Texture, UniformBuffer } from "@babylonjs/core";

export default class VatMaterialPlugin extends MaterialPluginBase {
    texture: Texture
    frame: number

    constructor(material: Material, texture: Texture) {
        super(material, "VatMaterialPlugin", 200, { VAT: false });
        this.texture = texture;

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
        samplers.push("posTex", "posTexWidth", "posTexHeight", "frame")
    }

    getAttributes(attributes: string[]) {
        attributes.push("indexX", "minMaxX", "minMaxY", "minMaxZ")
    }

    bindForSubMesh(uniformBuffer: UniformBuffer): void {
        uniformBuffer.setTexture("posTex", this.texture);
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

                    uniform sampler2D posTex;
                `,
                    "CUSTOM_VERTEX_UPDATE_POSITION": `
                    vec4 texturePos = texture2D(posTex,vec2(indexX, 1.0 - frame));

                    float minX = minMaxX.x;
                    float maxX = minMaxX.y;

                    float minY = minMaxY.x;
                    float maxY = minMaxY.y;

                    float minZ = minMaxZ.x;
                    float maxZ = minMaxZ.y;

                    float posX = texturePos.x * (maxX - minX) + minX;
                    float posY = texturePos.y * (maxY - minY) + minY;
                    float posZ = texturePos.z * (maxZ - minZ) + minZ;

                    positionUpdated = vec3(posX,posY,posZ);
                    `
                }
            }
        }
        return null;
    }
}