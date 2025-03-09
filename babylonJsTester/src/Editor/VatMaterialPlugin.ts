import { Material, MaterialDefines, MaterialPluginBase, ShaderLanguage, Texture } from "@babylonjs/core";

export default class VatMaterialPlugin extends MaterialPluginBase {
    texture: Texture

    constructor(material: Material, texture: Texture) {
        super(material, "VatMaterialPlugin", 200, { VAT: false });
        this.texture = texture;
        this._enable(true);
    }

    prepareDefines(defines: MaterialDefines) {
        defines["VAT"] = true;
    }

    getClassName() {
        return "VatMaterialPlugin";
    }

    // getSamplers(samplers: string[]) {
    //     samplers.push("arrayTex")
    // }

    getAttributes(attributes: string[]) {
        attributes.push("indexX", "minMaxX", "minMaxY", "minMaxZ")
    }


    // This is used to inform the system which language is supported
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
                `,
                    "CUSTOM_VERTEX_MAIN_END": `
                    // vec4 test = gl_Position;
                    // test.x = gl_Position.x * 2;
                    gl_Position = vec4(0.0,0.1,0.1,0.1);
                    `
                }
            }
        }
        // for other shader types we're not doing anything, return null
        return null;
    }
}