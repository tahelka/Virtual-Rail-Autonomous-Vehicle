import cv2
import os
import numpy as np

aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)

# Set the size of the marker and the image
marker_size = 150  # Size of the marker in pixels
gap = 10  # Width of the white line between markers in pixels
image_width = marker_size * 3 + gap * 2  # Width of the image to hold 3 markers horizontally with white lines between them
image_height = marker_size  # Height of the image is the same as a single marker

# Define the path where you want to save the markers
path = "C:\\Users\\khare\\OneDrive\\Desktop\\autonomous_vehicle_proj\\generated markers"

# Generate and draw the markers
for i in range(0, 11):  # Start from 0 to 10
    # Generate a single marker image
    marker_img = cv2.aruco.generateImageMarker(aruco_dict, i, marker_size)
    
    # Create a blank image to hold 3 markers with white lines between them
    combined_img = np.zeros((image_height, image_width), dtype=np.uint8)
    
    # Place 3 copies of the marker onto the combined image with white lines between them
    for j in range(3):  # 3 markers next to each other
        x_offset = j * (marker_size + gap)
        combined_img[0:image_height, x_offset:x_offset+marker_size] = marker_img
        # Add a white line after the first and second marker
        if j < 2:  # Only for the first two markers
            white_line_start = x_offset + marker_size
            combined_img[:, white_line_start:white_line_start+gap] = 255  # Fill the gap with white pixels
    
    # Save the combined image
    cv2.imwrite(os.path.join(path, f"marker_{i}.png"), combined_img)