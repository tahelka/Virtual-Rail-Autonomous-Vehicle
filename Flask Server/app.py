from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from graph import Graph
from health import health_check
import time
import threading
import os
import uuid
import json
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection setup
client = MongoClient("mongodb+srv://mongodb:Ha6j5kggIMvKE55S@cluster0.1kxk0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client['talide']  # Replace 'your_database_name' with the actual database name


@app.route('/api/orders/delete/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    print(f"Deleting order with ID: {order_id}")
    try:
        if not ObjectId.is_valid(order_id):
            return jsonify({"error": "Invalid order ID format"}), 400

        orders_collection = db['orders']
        result = orders_collection.delete_one({"_id": ObjectId(order_id)})

        if result.deleted_count > 0:
            return jsonify({"message": "Order deleted successfully"}), 200
        else:
            return jsonify({"error": "Order not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/orders/create', methods=['POST'])
def create_order():
    try:
        # Extract data from the request body
        data = request.json
        created_at = datetime.now()  # Current datetime
        contents = data.get('contents')
        map = data.get('map')
        origin = data.get('origin')
        destination = data.get('destination')

        # Validate required fields
        if not contents or not map or not origin or not destination:
            return jsonify({"error": "contents, map, origin, and destination are required"}), 400

        # Create the order document
        order = {
            "created_at": created_at,
            "contents": contents,
            "map": map,
            "origin": origin,
            "destination": destination
        }

        # Insert the order into the "orders" collection
        orders_collection = db['orders']
        result = orders_collection.insert_one(order)

        # Return success response with the order ID
        return jsonify({"message": "Order created successfully", "order_id": str(result.inserted_id)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        # Retrieve all orders from the "orders" collection
        orders_collection = db['orders']
        orders = orders_collection.find()

        # Convert orders to a list of dictionaries
        orders_list = []
        for order in orders:
            order['_id'] = str(order['_id'])  # Convert ObjectId to string
            orders_list.append(order)

        # Return the list of orders
        return jsonify({"orders": orders_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/graph', methods=['GET'])
def get_route_instructions():
    try:
        # Extract query parameters
        mapid = request.args.get('mapid')
        start = request.args.get('start')
        target = request.args.get('target')
        orientation = request.args.get('orientation')
        
        # Validate query parameters
        if not mapid or not start or not target or not orientation:
            return jsonify({"error": "mapid, start, target, and orientation parameters are required"}), 400
        
        # Determine the current working directory
        current_directory = os.getcwd()
        print(f"Current working directory: {current_directory}")

        # Construct the absolute path to the "maps" folder
        maps_folder = os.path.join(current_directory, 'maps')
        
        # Construct the full path to the JSON file
        json_filename = f"map_{mapid}.json"
        json_filepath = os.path.join(maps_folder, json_filename)
        
        # Print the path for debugging
        print(f"Checking file at: {json_filepath}")
        
        # Check if the file exists
        if os.path.isfile(json_filepath):
            print(f"File found: {json_filepath}")
            # Read and parse the JSON file
            with open(json_filepath, 'r') as file:
                graph_data = json.load(file)
            # Print the loaded data for debugging
            print(f"Loaded data: {graph_data}")
            
            # Initialize the graph and populate it with the data
            graph = Graph()
            for node in graph_data:
                graph.add_vertex(node['id'])
            for node in graph_data:
                for edge in node['edges']:
                    graph.add_edge(node['id'], edge['vertex'], edge['direction'])
            
            # Validate start and target parameters
            if not start or not target:
                return jsonify({"error": "Start and target parameters are required"}), 400
            
            # Find all paths and shortest paths
            all_paths = graph.find_all_paths(start, target)
            shortest_paths = graph.find_shortest_paths(all_paths)
            
            # Return the shortest path
            if shortest_paths:
                path_obj = shortest_paths[0]
                calculated_path = {
                    "path": path_obj['path']['path'],
                    "directions": path_obj['path']['directions'],
                    "orientation": orientation,
                    "mapid": mapid
                }
                return jsonify({
                    "shortest_path": calculated_path
                }), 200
            else:
                return jsonify({"message": "No paths found"}), 404

        else:
            print(f"File not found: {json_filepath}")
            return jsonify({"message": "File not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 400


app.add_url_rule('/health', view_func=health_check)

# Define the folder for storing map files
MAPS_FOLDER = 'maps'
if not os.path.exists(MAPS_FOLDER):
    os.makedirs(MAPS_FOLDER)
app.config['MAPS_FOLDER'] = MAPS_FOLDER

@app.route('/api/maps/save', methods=['POST'])
def save_map():
    try:
        map_data = request.json

        map_name = f'{uuid.uuid4()}.json'
        file_path = os.path.join(app.config['MAPS_FOLDER'], "map_" + map_name)
        
        # Save the map data with proper formatting
        with open(file_path, 'w') as file:
            file.write(json.dumps(map_data, indent=2))
        
        return jsonify({"message": "Map saved successfully"}), 200
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