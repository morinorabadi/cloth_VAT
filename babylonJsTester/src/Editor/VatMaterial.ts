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

                varying vec2 Vuv;
                varying vec2 Vuv2;

                // Denormalize 8-bit color channels to integers in the range 0 to 255.
                ivec4 floatsToBytes(vec4 inputFloats, bool littleEndian) {
                    ivec4 bytes = ivec4(inputFloats * 255.0);
                    return (
                      littleEndian
                      ? bytes.abgr
                      : bytes
                    );
                }
                
                // Break the four bytes down into an array of 32 bits.
                void bytesToBits(const in ivec4 bytes, out bool bits[32]) {
                    for (int channelIndex = 0; channelIndex < 4; ++channelIndex) {
                        float acc = float(bytes[channelIndex]);
                        for (int indexInByte = 7; indexInByte >= 0; --indexInByte) {
                        float powerOfTwo = exp2(float(indexInByte));
                        bool bit = acc >= powerOfTwo;
                        bits[channelIndex * 8 + (7 - indexInByte)] = bit;
                        acc = mod(acc, powerOfTwo);
                        }
                    }
                }
                
                // Compute the exponent of the 32-bit float.
                float getExponent(bool bits[32]) {
                    const int startIndex = 1;
                    const int bitStringLength = 8;
                    const int endBeforeIndex = startIndex + bitStringLength;
                    float acc = 0.0;
                    int pow2 = bitStringLength - 1;
                    for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {
                        acc += float(bits[bitIndex]) * exp2(float(pow2--));
                    }
                    return acc;
                }
                
                // Compute the mantissa of the 32-bit float.
                float getMantissa(bool bits[32], bool subnormal) {
                    const int startIndex = 9;
                    const int bitStringLength = 23;
                    const int endBeforeIndex = startIndex + bitStringLength;
                    // Leading/implicit/hidden bit convention:
                    // If the number is not subnormal (with exponent 0), we add a leading 1 digit.
                    float acc = float(!subnormal) * exp2(float(bitStringLength));
                    int pow2 = bitStringLength - 1;
                    for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {
                        acc += float(bits[bitIndex]) * exp2(float(pow2--));
                    }
                    return acc;
                }
                
                // Parse the float from its 32 bits.
                float bitsToFloat(bool bits[32]) {
                    float signBit = float(bits[0]) * -2.0 + 1.0;
                    float exponent = getExponent(bits);
                    bool subnormal = abs(exponent - 0.0) < 0.01;
                    float mantissa = getMantissa(bits, subnormal);
                    float exponentBias = 127.0;
                    return signBit * mantissa * exp2(exponent - exponentBias - 23.0);
                }
                
                // Decode a 32-bit float from the RGBA color channels of a texel.
                float rgbaToFloat(vec4 texelRGBA, bool littleEndian) {
                    ivec4 rgbaBytes = floatsToBytes(texelRGBA, littleEndian);
                    bool bits[32];
                    bytesToBits(rgbaBytes, bits);
                    return bitsToFloat(bits);
                }

                void main() {
                    Vuv = uv;
                    Vuv2 = uv2;

                    vec4 texturePos = texture2D(posTex,vec2(uv2.x, 1.0 - frame));

                    vec4 pix0 = texture2D(posTex,vec2(Vuv2.x, 1.0 - (0.5 / posTexHeight)));
                    vec4 pix1 = texture2D(posTex,vec2(Vuv2.x, 1.0 - (1.5 / posTexHeight)));
                    vec4 pix2 = texture2D(posTex,vec2(Vuv2.x, 1.0 - (2.5 / posTexHeight)));
                    vec4 pix3 = texture2D(posTex,vec2(Vuv2.x, 1.0 - (3.5 / posTexHeight)));
                    vec4 pix4 = texture2D(posTex,vec2(Vuv2.x, 1.0 - (4.5 / posTexHeight)));
                    vec4 pix5 = texture2D(posTex,vec2(Vuv2.x, 1.0 - (5.5 / posTexHeight)));
                    vec4 pix6 = texture2D(posTex,vec2(Vuv2.x, 1.0 - (6.5 / posTexHeight)));
                    vec4 pix7 = texture2D(posTex,vec2(Vuv2.x, 1.0 - (7.5 / posTexHeight)));
    
                    float minX = rgbaToFloat(vec4(pix0.rgb,pix1.r), true);
                    float maxX = rgbaToFloat(vec4(pix1.gb,pix2.rg), true);

                    float minY = rgbaToFloat(vec4(pix2.b,pix3.rgb), true);
                    float maxY = rgbaToFloat(vec4(pix4.rgb,pix5.r), true);

                    float minZ = rgbaToFloat(vec4(pix5.gb,pix6.rg), true);
                    float maxZ = rgbaToFloat(vec4(pix6.b,pix7.rgb), true);

                    float posX = texturePos.x * (maxX - minX) + minX;
                    float posY = texturePos.y * (maxY - minY) + minY;
                    float posZ = texturePos.z * (maxZ - minZ) + minZ;

<<<<<<< HEAD
                    // gl_Position = worldViewProjection * vec4(posX,posY,posZ, 1.0);
                    gl_Position = worldViewProjection * vec4(position.x,minY,position.z, 1.0);
=======
                    gl_Position = worldViewProjection * vec4(posX,posY,posZ, 1.0);
>>>>>>> 8fc015c25ce786baee353beadd94bc2f66a9d56f
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
        console.log(size.height)
        this.setFloat("posTexHeight", size.height);

        const max = (size.height - 8) / size.height
        let a = 1 - max

        scene.onBeforeRenderObservable.add(() => {
            a += 0.002
            if (a > max) a = 1 - max
            this.setFloat("frame", a)
        })
    }
}