import errno
import cv2
import urllib.request
import numpy as np
import select
import socket
import urllib.parse
import os
import sys

kernel = np.ones((5, 5), np.uint8)
stream_url = 'http://192.168.2.100:81/stream'
cv2.namedWindow('settings', cv2.WINDOW_AUTOSIZE)
bottom_percentage = 60 / 100
# ESP32 server IP address and port
esp32_ip = '192.168.2.101'
esp32_port = '80'  # Assuming your ESP32 server is running on port 80
global no_data_received_counter
no_data_received_counter = 20  # Number of times to check for no data received before restarting the entire program

# Define constants for command names
GO = "go"
CRUISE_GO = "cgo"
LEFT = "left"
HEAVY_LEFT = "hleft"
RIGHT = "right"
HEAVY_RIGHT = "hright"
STOP = "stop"
BACK = "back"
TURN_LEFT = "turnLeft"
TURN_RIGHT = "turnRight"
CROSS = "cross"
Left_back = "leftBack"
Right_back = "rightBack"
TURN_LEFT_back = "TurnLeftBack"
TURN_RIGHT_back = "TurnRightBack"
CROSS_back = "crossBack"

def update_value(x):
    pass

cv2.createTrackbar('Threshold', 'settings', 80, 255, update_value)
cv2.createTrackbar('Contrast', 'settings', 19, 20, update_value)
cv2.createTrackbar('Contrast_radius', 'settings', 95, 100, update_value)
current_fps = 30  # Default FPS

def set_fps(fps):
    global current_fps, stream_url
    current_fps = fps
    stream_url = f'http://{esp32_ip}:81/stream?fps={current_fps}'
    print(f"Setting FPS to {current_fps} and stream URL to {stream_url}")


def setup_non_blocking_stream(url):
    parsed_url = urllib.parse.urlparse(url)
    host = parsed_url.hostname
    port = parsed_url.port or 80
    path = parsed_url.path or '/'
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setblocking(0)
        result = sock.connect_ex((host, port))
        
        if result != 0 and result != errno.EINPROGRESS and result != errno.WSAEWOULDBLOCK:
            raise socket.error(f"Connection failed with error code {result}")
        
        # Wait until the socket is writable
        while True:
            _, writable, _ = select.select([], [sock], [], 1)
            if writable:
                break
        
        request = f"GET {path} HTTP/1.1\r\nHost: {host}\r\n\r\n"
        sock.send(request.encode('utf-8'))
        
        return sock
    except socket.error as e:
        print(f"Failed to set up non-blocking stream: {e}")
        return None

def get_latest_frame_bytes(sock, buffer, chunk_size=65536, timeout=10, reconnection_attempts=3):
    global no_data_received_counter
    latest_frame = None

    while True:
        ready = select.select([sock], [], [], 0.1)[0]
        if ready:
            try:
                new_bytes = sock.recv(chunk_size)
                if new_bytes:
                    buffer += new_bytes
                    no_data_received_counter = 20
                else:
                    print("Connection possibly closed by the server decrementing the restart counter...")
                    no_data_received_counter -= 1
            except socket.error as e:
                print(f"Socket error: {e}")
                break

        if no_data_received_counter == 0:
            # Restart the entire program
            print("Restarting the program... no new data received for a long time")
            os.execv(sys.executable, ['python'] + sys.argv)
          
        while True:
            start_marker = buffer.rfind(b'\xff\xd8')  # JPEG start of image
            end_marker = buffer.rfind(b'\xff\xd9')    # JPEG end of image

            # Continue searching for a valid start marker if the end marker is found before the start marker
            while start_marker != -1 and end_marker != -1 and start_marker > end_marker:
                # Search for the next start marker before the current start_marker position
                start_marker = buffer.rfind(b'\xff\xd8', 0, start_marker)
            

            if start_marker != -1 and end_marker != -1 and start_marker < end_marker:
                 # Extract the complete frame
                latest_frame = buffer[start_marker:end_marker + 2]
                # Keep the remaining buffer after the frame
                buffer = buffer[end_marker + 2:]
            else:
                break

        return latest_frame, buffer

def get_frame_from_bytes(jpg):
    if jpg:
        return cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)
    return None

def get_trackbar_values():
    threshold_value = cv2.getTrackbarPos('Threshold', 'settings')
    contrast_factor = cv2.getTrackbarPos('Contrast', 'settings') / 10
    contrast_radius = cv2.getTrackbarPos('Contrast_radius', 'settings') / 100
    return threshold_value, contrast_factor, contrast_radius

def process_frame(frame):
    frame_height = frame.shape[0]
    start_height = int((1 - bottom_percentage) * frame_height)
    bottom_frame = frame[start_height:, :]
    return bottom_frame

def draw_markers(frame, gray):
    aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    parameters = cv2.aruco.DetectorParameters()
    corners, ids, rejectedImgPoints = cv2.aruco.detectMarkers(gray, aruco_dict, parameters=parameters)
    if len(corners) > 0:
        frame = cv2.aruco.drawDetectedMarkers(frame, corners, ids)
    return frame,ids

def adjust_contrast(gray, contrast_factor, contrast_radius):
    height, width = gray.shape
    center_x, center_y = width // 2, height // 2
    outer_radius = min(center_x, center_y) * contrast_radius
    mask = np.ones((height, width), dtype=np.uint8) * 255
    cv2.circle(mask, (center_x, center_y), int(outer_radius), 0, -1)
    outside_region = cv2.bitwise_and(gray, gray, mask=mask)
    adjusted_region = cv2.convertScaleAbs(outside_region, alpha=contrast_factor, beta=0)
    gray = cv2.add(cv2.bitwise_and(gray, gray, mask=cv2.bitwise_not(mask)), adjusted_region)
    return gray

def get_binary_image(gray, threshold_value):
    _, binary_thresh = cv2.threshold(gray, threshold_value, 255, cv2.THRESH_BINARY)
    binary_thresh = cv2.bitwise_not(binary_thresh)
    binary_thresh = cv2.morphologyEx(binary_thresh, cv2.MORPH_OPEN, kernel, iterations=2)
    return binary_thresh

def find_and_draw_contours(frame, binary_thresh):
    contours, hierarchy = cv2.findContours(binary_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    frame_center_x = frame.shape[1] // 2  # Calculate the center of the frame
    frame_center_y = frame.shape[0] // 2 # Calculate the center of the frame
    horizontal_offset = 0
    foundContours = False
    if contours:
        foundContours = True
        largest_contour = max(contours, key=cv2.contourArea)
        M = cv2.moments(largest_contour)
        if M['m00'] != 0:
            cx = int(M['m10'] / M['m00'])
            cy = int(M['m01'] / M['m00'])
            area = cv2.contourArea(largest_contour)
            horizontal_offset = cx - frame_center_x
            area_text = f"Area: {area:.2f}"
            cv2.putText(frame, area_text, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            offset_text = f"Offset: {horizontal_offset}"
            cv2.putText(frame, offset_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.drawContours(frame, [largest_contour], -1, (0, 255, 0), 2)
            cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
    cv2.circle(frame, (frame_center_x, frame_center_y), 5, (255, 0, 0), -1)  # Draw a blue circle at the center
    return frame, horizontal_offset, foundContours

def show_frames(binary_thresh, frame):
    cv2.imshow('image', binary_thresh)
    cv2.imshow('image2', frame)

# Function to send commands to the ESP32 server
def send_command(command):
    try:
        url = f'http://{esp32_ip}:{esp32_port}/action_handler?action={command}'
        response = urllib.request.urlopen(url)
        response_data = response.read().decode()
        # Check if the response contains the time
        try:
            time_taken = int(response_data)
            print(f"{command} command sent successfully. Time taken to complete {time_taken} ms")
        except ValueError:
            print(f"Error: {response_data}")
        return command  # Return the command sent
    except urllib.error.URLError as e:
        print(f"Error sending {command} command: {e}")
        return None  # Return None if no command was sent

def opposite_command(command):
    if command == GO:
        return BACK
    if command == LEFT:
        return Right_back
    elif command == RIGHT:
        return Left_back
    elif command == TURN_LEFT:
        return TURN_RIGHT_back
    elif command == TURN_RIGHT:
        return TURN_LEFT_back
    elif command == CROSS:
        return CROSS_back
    return command

def process_frames(sock, bytes):
    frame_counter = 0  # Initialize a frame counter
    command_interval = 1  # Send command every 1 frames
    send_commands = True  # Initialize the flag to True
    previous_marker = -1
    path = 1
    consecutive_left = 10   #counter for when its cosidered stuck on left turn- need to perform heavy left turn when 0
    consecutive_right = 10  #counter for when its cosidered stuck on right turn- need to perform heavy right turn when 0
    cruise_mode_counter = 7 #counter for when to start cruise mode
    threshold_value, contrast_factor, contrast_radius = get_trackbar_values()
    while True:
        jpg, bytes = get_latest_frame_bytes(sock, bytes) # Get the latest frame bytes
        frame = get_frame_from_bytes(jpg) # Get the frame from the bytes
        if frame is not None:
                frame = process_frame(frame)
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                frame, id_of_marker = draw_markers(frame, gray)
                gray = adjust_contrast(gray, contrast_factor, contrast_radius)
                binary_thresh = get_binary_image(gray, threshold_value)
                frame , offset,foundContour = find_and_draw_contours(frame, binary_thresh)
                frame_counter += 1  # Increment the frame counter
                command_sent = None  # Initialize the command sent to None
                if id_of_marker is not None:
                            if path == 1:
                                if id_of_marker[0] == 0:
                                    command_sent = TURN_RIGHT
                                elif id_of_marker[0] == 1:
                                    command_sent = TURN_LEFT
                                elif id_of_marker[0] == 2:
                                    command_sent = TURN_RIGHT
                                elif id_of_marker[0] == 3:
                                    command_sent = send_command(STOP)
                                    break
                                elif id_of_marker[0] == 4:
                                    command_sent = send_command(STOP)
                                    break
                                elif id_of_marker[0] == 5:
                                    command_sent = CROSS
                                elif id_of_marker[0] == 6:
                                    command_sent = TURN_LEFT
                                elif id_of_marker[0] == 7:
                                    command_sent = TURN_RIGHT
                                elif id_of_marker[0] == 8:
                                    command_sent = TURN_RIGHT
                                elif id_of_marker[0] == 9:
                                    command_sent = TURN_LEFT

                            elif path == 2:
                                if id_of_marker[0] == 0:
                                    command_sent = CROSS
                                elif id_of_marker[0] == 1:
                                    command_sent = TURN_RIGHT
                                elif id_of_marker[0] == 2:
                                    command_sent = TURN_RIGHT
                                elif id_of_marker[0] == 3:
                                    command_sent = send_command(STOP)
                                    break
                                elif id_of_marker[0] == 4:
                                    command_sent = send_command(STOP)
                                    break
                                elif id_of_marker[0] == 5:
                                    command_sent = CROSS
                                elif id_of_marker[0] == 6:
                                    command_sent = TURN_RIGHT
                                elif id_of_marker[0] == 7:
                                    command_sent = TURN_LEFT
                                elif id_of_marker[0] == 8:
                                    command_sent = TURN_RIGHT
                                elif id_of_marker[0] == 9:
                                    command_sent = TURN_LEFT

                            elif path == 3:
                                if id_of_marker[0] == 0:
                                    command_sent = CROSS
                                elif id_of_marker[0] == 1:
                                    command_sent = TURN_LEFT
                                elif id_of_marker[0] == 2:
                                    command_sent = TURN_LEFT
                                elif id_of_marker[0] == 3:
                                    command_sent = send_command(STOP)
                                    break
                                elif id_of_marker[0] == 4:
                                    command_sent = send_command(STOP)
                                    break
                                elif id_of_marker[0] == 5:
                                    command_sent = CROSS
                                elif id_of_marker[0] == 6:
                                    command_sent = TURN_LEFT
                                elif id_of_marker[0] == 7:
                                    command_sent = TURN_RIGHT
                                elif id_of_marker[0] == 8:
                                    command_sent = TURN_LEFT
                                elif id_of_marker[0] == 9:
                                    command_sent = TURN_RIGHT

                            # Check if the current marker is the same as the previous marker
                            if previous_marker == id_of_marker[0] and command_sent is not CROSS:
                                # If it is, do not send the command
                                command_sent = None
                            elif send_commands == True:
                                # If it is not, send the command
                                send_command(command_sent)
                                previous_marker = id_of_marker[0]
                                
                            consecutive_left = 10
                            consecutive_right = 10
                            cruise_mode_counter = 7
                elif frame_counter == command_interval and id_of_marker is None:  # If the counter reaches the command interval
                    previous_marker = -1  # Reset the previous marker
                    if send_commands:  # Only send commands if the flag is True
                        if id_of_marker is None and foundContour == True:
                            if offset < -50:
                                command_sent = send_command(LEFT)
                                consecutive_left -=1
                                consecutive_right = 10
                                cruise_mode_counter = 7
                            elif offset > 50:
                                command_sent = send_command(RIGHT)
                                consecutive_right -=1
                                consecutive_left = 10
                                cruise_mode_counter = 7
                            elif cruise_mode_counter > 0:
                                command_sent = send_command(GO)
                                cruise_mode_counter -=1
                                consecutive_left = 10
                                consecutive_right = 10
                            elif cruise_mode_counter == 0:
                                command_sent = send_command(CRUISE_GO)
                                cruise_mode_counter -=1 # drop it below 0 so we wont send cruise_go commands for no reason(one command is enough its a continous command)
                        elif id_of_marker is None and foundContour == False: # If the flag is False, start backtracking
                                command_sent = None
                                send_command(CROSS_back)
                                consecutive_left = 10
                                consecutive_right = 10
                                cruise_mode_counter = 7
                               
                    else:  #emergency stop
                        command_sent = send_command(STOP)
                if frame_counter >= command_interval:
                    frame_counter = 0
                if consecutive_left == 0:   # if stuck on left turn perform strong left turn
                    send_command(HEAVY_LEFT)
                    consecutive_left = 10
                elif consecutive_right == 0:  # if stuck on right turn perform strong right turn
                    send_command(HEAVY_RIGHT)
                    consecutive_right = 10

                show_frames(binary_thresh, frame)
                key = cv2.waitKey(1)
                if key == 27:
                    cv2.destroyAllWindows()
                    break
                elif key == ord('d'):  # If the "d" key is pressed, toggle the flag
                    send_commands = not send_commands

def main():

    set_fps(current_fps)  # Set the initial FPS
    bytes = b''
    
    sock = setup_non_blocking_stream(stream_url)
    try:
        process_frames(sock, bytes)
    finally:
        sock.close()  # Ensure the socket is closed at the end


if __name__ == "__main__":
    main()