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
        position = [vertex.co.x , vertex.co.z, vertex.co.y]
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
            vertexData.append([[x],[y],[z]])
        else:
            vertexData[vertexIndex][0].append(framesData[vertexIndex][0])
            vertexData[vertexIndex][1].append(framesData[vertexIndex][1])
            vertexData[vertexIndex][2].append(framesData[vertexIndex][2])


image = Image.new("RGB", (len(obj.data.vertices), end_frame - start_frame), "white")
draw = ImageDraw.Draw(image)
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
    
    metadata.append({
        "index" : vertexIndex / lenVertexData,
        "min_x" : min_x,
        "max_x" : max_x,
        "min_y" : min_y,
        "max_y" : max_y,
        "min_z" : min_z,
        "max_z" : max_z,
    })
    
    for i in range(len(x_array)):
        r = math.floor(((x_array[i] - min_x) / (max_x - min_x)) * 255)
        g = math.floor(((y_array[i] - min_y) / (max_y - min_y)) * 255)
        b = math.floor(((z_array[i] - min_z) / (max_z - min_z)) * 255)
        fill = "#{:02X}{:02X}{:02X}".format(r, g, b)
        draw.rectangle([vertexIndex, i, vertexIndex+1, i+1], fill=fill)

image.save(export_path + "VAT_texture.png")

obj["vertexData"] = metadata
bpy.ops.export_scene.gltf(
    filepath=export_path + "object.glb",
    export_format='GLB', 
    use_selection=True,  
    export_extras=True   
)

# c:\Program Files\Blender Foundation\Blender 4.2\4.2\python\bin\python.exe
