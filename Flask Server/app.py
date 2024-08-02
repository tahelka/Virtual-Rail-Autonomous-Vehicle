from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from graph import Graph
from health import health_check
import time
import threading
import os
import uuid
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variable to store the calculated path
calculated_path = None

def execute_code():
    while(True):
        print("Executing code...")
        time.sleep(1)

@app.route('/graph', methods=['POST'])
def receive_graph():
    try:
        global calculated_path
        
        graph_data = request.json
        graph = Graph()

        for node in graph_data:
            graph.add_vertex(node['id'])
        for node in graph_data:
            for edge in node['edges']:
                graph.add_edge(node['id'], edge['vertex'], edge['direction'])

        start = request.args.get('start')
        target = request.args.get('target')

        if not start or not target:
            return jsonify({"error": "Start and target parameters are required"}), 400

        all_paths = graph.find_all_paths(start, target)
        shortest_paths = graph.find_shortest_paths(all_paths)

        if shortest_paths:
            path_obj = shortest_paths[0]
            calculated_path = {
                "path": path_obj['path']['path'],
                "directions": path_obj['path']['directions']
            }

            

            return jsonify({
                "shortest_path": calculated_path
            }), 200
        else:
            return jsonify({"message": "No paths found"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/graph', methods=['GET'])
def get_route_instructions():


# receive_graph request that return the jason file of the map that server got for debugging.
# @app.route('/graph', methods=['POST'])
# def receive_graph():
#     try:
#         global calculated_path
        
#         graph_data = request.json
#         print("Received graph data:", graph_data)  # Print the JSON graph data

#         graph = Graph()

#         for node in graph_data:
#             graph.add_vertex(node['id'])
#         for node in graph_data:
#             for edge in node['edges']:
#                 graph.add_edge(node['id'], edge['vertex'], edge['direction'])

#         start = request.args.get('start')
#         target = request.args.get('target')

#         if not start or not target:
#             return jsonify({"error": "Start and target parameters are required"}), 400

#         all_paths = graph.find_all_paths(start, target)
#         shortest_paths = graph.find_shortest_paths(all_paths)

#         if shortest_paths:
#             path_obj = shortest_paths[0]
#             calculated_path = {
#                 "path": path_obj['path']['path'],
#                 "directions": path_obj['path']['directions']
#             }

#             # Start a thread to execute the code
#             threading.Thread(target=execute_code).start()
#             return jsonify({
#                 "shortest_path": calculated_path
#             }), 200
#         else:
#             return jsonify({"message": "No paths found"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 400


@app.route('/calculated_path', methods=['GET'])
def get_calculated_path():
    global calculated_path
    if calculated_path:
        return jsonify(calculated_path), 200
    else:
        return jsonify({"message": "No path calculated yet"}), 404

app.add_url_rule('/health', view_func=health_check)

# Define the folder for storing map files
MAPS_FOLDER = 'maps'
if not os.path.exists(MAPS_FOLDER):
    os.makedirs(MAPS_FOLDER)
app.config['MAPS_FOLDER'] = MAPS_FOLDER

@app.route('/api/maps/save', methods=['POST'])
def save_map():
    try:
        map_data = request.json.get('mapData')
        map_data = json.loads(map_data)

        # Convert node IDs to strings
        for node in map_data:
            node['id'] = str(node['id'])
            for edge in node['edges']:
                edge['vertex'] = str(edge['vertex'])

        map_name = f'map_{uuid.uuid4()}.json'
        file_path = os.path.join(app.config['MAPS_FOLDER'], map_name)
        
        # Save the map data with proper formatting
        with open(file_path, 'w') as file:
            file.write(json.dumps(map_data, indent=2))
        
        return jsonify({"message": "Map saved successfully", "id": map_name.split('_')[1].split('.')[0]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400    

@app.route('/api/maps/delete/<map_id>', methods=['DELETE'])
def delete_map(map_id):
    try:
        file_name = f'map_{map_id}.json'
        file_path = os.path.join(app.config['MAPS_FOLDER'], file_name)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({"message": "Map deleted successfully"}), 200
        else:
            return jsonify({"message": "Map not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route('/api/maps', methods=['GET'])
def list_maps():
    try:
        map_files = os.listdir(app.config['MAPS_FOLDER'])
        maps = []
        for file_name in map_files:
            if file_name.endswith('.json'):
                map_id = file_name.split('_')[1].split('.')[0]
                file_path = os.path.join(app.config['MAPS_FOLDER'], file_name)
                creation_time = os.path.getctime(file_path)  # Get the creation time
                with open(file_path, 'r') as file:
                    map_data = json.load(file)
                    maps.append({"id": map_id, "data": map_data, "creation_time": creation_time})
        
        # Sort maps by creation time
        maps.sort(key=lambda x: x['creation_time'])
        
        return jsonify(maps), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/download/<path:filename>', methods=['GET'])
def download_map(filename):
    return send_from_directory(app.config['MAPS_FOLDER'], filename, as_attachment=True)

if __name__ == '__main__':
    from config import DEFAULT_PORT
    app.run(debug=True, port=DEFAULT_PORT)