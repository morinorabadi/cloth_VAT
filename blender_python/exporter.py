

import bpy
import json

# add your object name here
object_name = "Plane"

# add your json address export 
export_json_path="/home/mori/my projects/cloth_VAT/data.json"

obj = bpy.data.objects.get(object_name)
if not obj:
    raise ValueError(f"Object '{object_name}' not found in the scene.")


if obj.type != 'MESH':
    raise ValueError(f"Object '{object_name}' is not a mesh.")


start_frame = bpy.context.scene.frame_start
end_frame = bpy.context.scene.frame_end


vertex_data = []


for frame in range(start_frame, end_frame + 1):
    bpy.context.scene.frame_set(frame)
    
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated_obj = obj.evaluated_get(depsgraph)
    evaluated_mesh = evaluated_obj.data
    
    frame_data = []
    for vertex in evaluated_mesh.vertices:
        position = [vertex.co.x , vertex.co.z, vertex.co.y]
        frame_data.append(position)
    
    vertex_data.append(frame_data)


with open(export_json_path, "w") as f:
    json.dump(vertex_data, f)

print(f"Vertex data exported to {export_json_path}")