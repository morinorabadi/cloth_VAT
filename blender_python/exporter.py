import bpy
from PIL import Image, ImageDraw
import math

# fill this
export_path = "C:/mori/cloth_VAT/"


obj = bpy.context.selected_objects[0]
start_frame = bpy.context.scene.frame_start
end_frame = bpy.context.scene.frame_end


frames_data = []
for frame in range(start_frame, end_frame + 1):
    bpy.context.scene.frame_set(frame)
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated_obj = obj.evaluated_get(depsgraph)
    evaluated_mesh = evaluated_obj.data
    frame_data = []
    for vertex in evaluated_mesh.vertices:
        position = [vertex.co.x , vertex.co.z, vertex.co.y,vertex.normal.x , vertex.normal.z, vertex.normal.y]
        frame_data.append(position)
    frames_data.append(frame_data)

vertexData = []
for frameIndex in range(len(frames_data)):
    framesData = frames_data[frameIndex]
    for vertexIndex in range(len(framesData)):  
        if frameIndex == 0:
            x = framesData[vertexIndex][0]
            y = framesData[vertexIndex][1]
            z = framesData[vertexIndex][2]
            xn = framesData[vertexIndex][3]
            yn = framesData[vertexIndex][4]
            zn = framesData[vertexIndex][5]
            vertexData.append([[x],[y],[z],[xn],[yn],[zn]])
        else:
            vertexData[vertexIndex][0].append(framesData[vertexIndex][0])
            vertexData[vertexIndex][1].append(framesData[vertexIndex][1])
            vertexData[vertexIndex][2].append(framesData[vertexIndex][2])
            vertexData[vertexIndex][3].append(framesData[vertexIndex][3])
            vertexData[vertexIndex][4].append(framesData[vertexIndex][4])
            vertexData[vertexIndex][5].append(framesData[vertexIndex][5])


image = Image.new("RGB", (len(obj.data.vertices), end_frame - start_frame), "white")
draw = ImageDraw.Draw(image)

imageN = Image.new("RGB", (len(obj.data.vertices), end_frame - start_frame), "white")
drawN = ImageDraw.Draw(imageN)

metadata=[]
lenVertexData = len(vertexData)
for vertexIndex in range(lenVertexData):
    x_array = vertexData[vertexIndex][0]
    y_array = vertexData[vertexIndex][1]
    z_array = vertexData[vertexIndex][2]
    
    min_x = min(x_array)
    max_x = max(x_array)
    min_y = min(y_array)
    max_y = max(y_array)
    min_z = min(z_array)
    max_z = max(z_array)
    
    xn_array = vertexData[vertexIndex][3]    
    yn_array = vertexData[vertexIndex][4]
    zn_array = vertexData[vertexIndex][5]
    
    min_xn = min(xn_array)
    max_xn = max(xn_array)
    min_yn = min(yn_array)
    max_yn = max(yn_array)
    min_zn = min(zn_array)
    max_zn = max(zn_array)
    
    metadata.append({
        "index" : vertexIndex / lenVertexData,
        "nx" : min_x,
        "xx" : max_x,
        "ny" : min_y,
        "xy" : max_y,
        "nz" : min_z,
        "xz" : max_z,
        "nxn" : min_xn,
        "xxn" : max_xn,
        "nyn" : min_yn,
        "xyn" : max_yn,
        "nzn" : min_zn,
        "xzn" : max_zn,
    })
    
    for i in range(len(x_array)):
        r = math.floor(((x_array[i] - min_x) / (max_x - min_x)) * 255)
        g = math.floor(((y_array[i] - min_y) / (max_y - min_y)) * 255)
        b = math.floor(((z_array[i] - min_z) / (max_z - min_z)) * 255)
        fill = "#{:02X}{:02X}{:02X}".format(r, g, b)
        draw.rectangle([vertexIndex, i, vertexIndex+1, i+1], fill=fill)

        r = math.floor(((xn_array[i] - min_xn) / (max_xn - min_xn)) * 255)
        g = math.floor(((yn_array[i] - min_yn) / (max_yn - min_yn)) * 255)
        b = math.floor(((zn_array[i] - min_zn) / (max_zn - min_zn)) * 255)
        fill = "#{:02X}{:02X}{:02X}".format(r, g, b)
        drawN.rectangle([vertexIndex, i, vertexIndex+1, i+1], fill=fill)

image.save(export_path + "VAT_texture.png")
imageN.save(export_path + "VAT_normal_texture.png")

obj["vertexData"] = metadata
bpy.ops.export_scene.gltf(
    filepath=export_path + "object.glb",
    export_format='GLB', 
    use_selection=True,  
    export_extras=True   
)

# c:\Program Files\Blender Foundation\Blender 4.2\4.2\python\bin\python.exe
