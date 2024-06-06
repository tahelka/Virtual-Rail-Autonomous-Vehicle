from flask import Flask, request, jsonify
from graph import Graph
from health import health_check
import time
import threading

app = Flask(__name__)

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

            # Start a thread to execute the code
            threading.Thread(target=execute_code).start()
            return jsonify({
                "shortest_path": calculated_path
            }), 200
        else:
            return jsonify({"message": "No paths found"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/calculated_path', methods=['GET'])
def get_calculated_path():
    global calculated_path
    if calculated_path:
        return jsonify(calculated_path), 200
    else:
        return jsonify({"message": "No path calculated yet"}), 404

app.add_url_rule('/health', view_func=health_check)

if __name__ == '__main__':
    from config import DEFAULT_PORT
    app.run(debug=True, port=DEFAULT_PORT)
