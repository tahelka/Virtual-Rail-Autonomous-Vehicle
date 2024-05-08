import cv2
import os

# Define the dictionary
aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)

# Set the size of the marker
marker_size = 150  # Size of the marker in pixels

# Define the path where you want to save the markers
path = "C:\\Users\\khare\\OneDrive\\Desktop\\autonomous_vehicle_proj\\generated markers"

# Generate and draw the markers
for i in range(10):
    marker_img = cv2.aruco.generateImageMarker(aruco_dict, i, marker_size)
    cv2.imwrite(os.path.join(path, f"marker_{i}.png"), marker_img)  # Save the image

    