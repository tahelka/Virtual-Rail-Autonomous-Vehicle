from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from graph import Graph
from health import health_check
import time
import os
import uuid
import json
import logging
import random
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from bson.json_util import dumps

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="*")

# MongoDB connection setup
client = MongoClient("mongodb+srv://mongodb:Ha6j5kggIMvKE55S@cluster0.1kxk0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client['talide']  
maps_collection = db['maps']
trips_collection = db['trips']
orders_collection = db['orders']
vehicle_checkpoints_collection = db['vehicle_checkpoints']

def serialize_document(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])  
    return doc

@app.route('/api/vehicle_checkpoints/<trip_id>', methods=['GET'])
def get_checkpoints_by_trip(trip_id):
    
    checkpoints = vehicle_checkpoints_collection.find({'trip_id': trip_id})
    
    
    checkpoints_list = [serialize_document(doc) for doc in checkpoints]
    
    
    if not checkpoints_list:
        return jsonify({'error': 'No checkpoints found for this trip_id'}), 404

    
    return jsonify(checkpoints_list), 200

@app.route('/api/vehicle_checkpoints', methods=['POST'])
def insert_vehicle_checkpoint():
    data = request.json

    required_fields = ['trip_id', 'map_id', 'checkpoint_id', 'average_offset']

    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    checkpoint_doc = {
        'trip_id': data['trip_id'],
        'checkpoint_id': data['checkpoint_id'],
        'map_id': data['map_id'],
        'avg_offset': data['average_offset'],
        'created_at': datetime.now()
    }

    checkpoint_doc['created_at'] = checkpoint_doc['created_at'].strftime("%Y-%m-%d %H:%M:%S") 

    result = vehicle_checkpoints_collection.insert_one(checkpoint_doc)

    checkpoint_doc['_id'] = str(checkpoint_doc['_id']) 
    socketio.emit('checkpoint_data', checkpoint_doc)

    return jsonify({'result': 'success', 'inserted_id': str(result.inserted_id)}), 200

@app.route('/api/trips', methods=['GET'])
def get_trips():
    
    # Retrieve all documents from the collection
    trips = list(trips_collection.find())
    
    # Convert MongoDB documents to JSON format
    for trip in trips:
        trip['_id'] = str(trip['_id'])  # Convert ObjectId to string for JSON serialization
    
    return jsonify(trips)

@app.route('/api/trips/<trip_id>', methods=['GET'])
def get_trip_by_id(trip_id):
    # Check if trip_id is a valid ObjectId
    if not ObjectId.is_valid(trip_id):
        return jsonify({"error": "Invalid trip ID format"}), 400
    
    # Convert trip_id to ObjectId
    trip_id_obj = ObjectId(trip_id)
    
    # Retrieve the trip document from the collection
    trip = trips_collection.find_one({'_id': trip_id_obj})
    
    if trip is None:
        return jsonify({"error": "Trip not found"}), 404
    
    # Convert MongoDB document to JSON format
    trip['_id'] = str(trip['_id'])  # Convert ObjectId to string for JSON serialization
    
    return jsonify(trip)

@app.route('/api/orders/delete/<order_id>', methods=['DELETE'])
def delete_order(order_id):
    print(f"Deleting order with ID: {order_id}")
    try:
        if not ObjectId.is_valid(order_id):
            return jsonify({"error": "Invalid order ID format"}), 400

        
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
        orderid = request.args.get('orderid')
        
        # Validate query parameters
        if not mapid or not start or not target or not orientation:
            return jsonify({"error": "mapid, start, target, and orientation parameters are required"}), 400
        
        # Fetch map data from MongoDB
        map_document = maps_collection.find_one({'_id': mapid})
        
        if not map_document:
            return jsonify({"message": "Map not found"}), 404
        
        # Get the graph data from the MongoDB document
        graph_data = map_document.get('map_data')
        
        if not graph_data:
            return jsonify({"message": "Graph data not found in the map document"}), 404
        
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
                "mapid": mapid,
                "orderid": orderid,
            }
            
            # Create a new trip document
            trip_id = str(uuid.uuid4())  # Generate a unique ID for the trip
            trip_document = {
                "_id": trip_id,
                "map_id": mapid,
                "order_id": orderid,
                "starting_point": start,
                "destination_point": target,
                "starting_orientation": orientation,
                "created_at": datetime.now(),
                "directions": calculated_path["directions"],
                "path": calculated_path["path"],
                "arrived_at_destination": False,
                "avg_offset": 0.0,
            }
            
            # Insert the trip document into the trips collection
            trips_collection.insert_one(trip_document)
            
            return jsonify({
                "shortest_path": calculated_path,
                "trip_id": trip_id  # Include the trip ID in the response
            }), 200
        else:
            return jsonify({"message": "No paths found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 400


app.add_url_rule('/health', view_func=health_check)

@app.route('/api/maps/save', methods=['POST'])
def save_map():
    try:
        # Get the map data from the request
        map_data = request.json
        
        # Generate a unique identifier for the map
        map_id = str(uuid.uuid4())
        
        # Get the current time
        creation_time = datetime.now()
        
        # Save the map data to the MongoDB collection
        result = maps_collection.insert_one({
            '_id': map_id,
            'map_data': map_data,
            'created_at': creation_time
        })
        
        # Get the inserted ID from MongoDB
        inserted_id = str(result.inserted_id)
        
        return jsonify({"message": "Map saved successfully", "map_id": inserted_id, "created_at": creation_time.isoformat()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400 

@app.route('/api/maps/delete/<map_id>', methods=['DELETE'])
def delete_map(map_id):
    try:
        # Delete the map document from MongoDB
        result = maps_collection.delete_one({'_id': map_id})
        
        if result.deleted_count > 0:
            return jsonify({"message": "Map deleted successfully"}), 200
        else:
            return jsonify({"message": "Map not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route('/api/maps', methods=['GET'])
def list_maps():
    try:
        # Retrieve all maps from the MongoDB collection
        cursor = maps_collection.find()
        
        # Convert MongoDB documents to a list of dictionaries
        maps = []
        for document in cursor:
            # Extract relevant data
            map_id = document.get('_id')
            map_data = document.get('map_data')
            creation_time = document.get('created_at')
            
            # Use a default value if creation_time is missing
            if creation_time is None:
                creation_time = datetime.now()  # Default to current time
            else:
                # Ensure creation_time is a datetime object
                if isinstance(creation_time, str):
                    creation_time = datetime.fromisoformat(creation_time)
            
            # Format creation_time for response (ISO format string)
            formatted_creation_time = creation_time.isoformat()
            
            maps.append({
                "id": map_id,
                "data": map_data,
                "creation_time": formatted_creation_time
            })
        
        # Sort maps by creation time
        maps.sort(key=lambda x: x['creation_time'])
        
        return jsonify(maps), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# WebSocket server code
# logging.basicConfig(level=logging.INFO)
# history = []
# HISTORY_DIR = "history_files"
# os.makedirs(HISTORY_DIR, exist_ok=True)
# async def send_data(websocket, path):
#     global history
#     start_time = time.time()
#     trip_id = str(uuid.uuid4())
#     try:
#         while time.time() - start_time < 15:
#             avg_offset = random.uniform(-100, 100)
#             speed = random.uniform(20, 120)
#             data = {
#                 "avg_offset": avg_offset,
#                 "speed": speed,
#                 "timestamp": time.time()
#             }
#             history.append(data)
#             await websocket.send(json.dumps({"type": "data", "payload": data}))
#             await asyncio.sleep(1)
#         filename = f"{trip_id}.json"
#         filepath = os.path.join(HISTORY_DIR, filename)
#         with open(filepath, 'w') as f:
#             json.dump(history, f)
#         logging.info(f"History automatically saved as {filename}")
#         await websocket.send(json.dumps({
#             "type": "end",
#             "message": "Real-time data ended and history saved",
#             "tripId": trip_id
#         }))
#         history = []
#         while True:
#             message = await websocket.recv()
#             try:
#                 data = json.loads(message)
#                 if data['type'] == 'load':
#                     filepath = os.path.join(HISTORY_DIR, f"{data['tripId']}.json")
#                     if os.path.exists(filepath):
#                         with open(filepath, 'r') as f:
#                             loaded_history = json.load(f)
#                         await websocket.send(json.dumps({"type": "load", "payload": loaded_history}))
#                         logging.info(f"History loaded and sent to client: {data['tripId']}")
#                     else:
#                         await websocket.send(json.dumps({"type": "load", "message": "No history found"}))
#                         logging.warning(f"No history file found for trip ID: {data['tripId']}")
#                 elif data['type'] == 'list_histories':
#                     history_files = [f.split('.')[0] for f in os.listdir(HISTORY_DIR) if f.endswith('.json')]
#                     await websocket.send(json.dumps({"type": "history_list", "payload": history_files}))
#                     logging.info("Sent list of history files to client")
#                 else:
#                     logging.warning(f"Unknown message type: {data['type']}")
#             except json.JSONDecodeError:
#                 logging.error(f"Invalid JSON received: {message}")
#             except KeyError:
#                 logging.error(f"Invalid message format: {message}")
#     except websockets.exceptions.ConnectionClosed:
#         logging.info("Connection closed")
#     except Exception as e:
#         logging.error(f"An error occurred: {str(e)}")
# async def main():
#     websocket_server = await websockets.serve(send_data, "localhost", 8765)
#     logging.info("WebSocket server started on ws://localhost:8765")
    
#     # Start Flask in a separate thread
#     flask_thread = threading.Thread(target=lambda: app.run(debug=True, port=5000, use_reloader=False))
#     flask_thread.start()
#     # Keep the WebSocket server running
#     await asyncio.Future()  # This will keep the main function running indefinitely

# if __name__ == '__main__':
#     asyncio.run(main())


# if __name__ == '__main__':
#     asyncio.run(main())

@socketio.on('connect')
def handle_connect():
    print("Client connected")
    emit('response', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")


if __name__ == '__main__':
    from config import DEFAULT_PORT
    socketio.run(app, debug=True, port=DEFAULT_PORT)