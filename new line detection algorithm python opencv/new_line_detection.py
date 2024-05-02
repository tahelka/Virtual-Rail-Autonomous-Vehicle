import cv2
import urllib.request
import numpy as np

kernel = np.ones((5, 5), np.uint8)

# Define the URL for the MJPEG video stream
stream_url = 'http://192.168.1.38:81/stream'


# Create a named window for display
cv2.namedWindow('settings', cv2.WINDOW_AUTOSIZE)


def update_value(x):
    pass  

# Add a trackbar (slider) to the window 
cv2.createTrackbar('Threshold', 'settings', 60, 255, update_value)
cv2.createTrackbar('Contrast', 'settings', 19, 20, update_value)
cv2.createTrackbar('Contrast_radius', 'settings', 95, 100, update_value)

bottom_percentage = 60 / 100  # Adjust this value as needed

stream = urllib.request.urlopen(stream_url)
bytes = b''
while True:
    try:
        bytes += stream.read(1024)
        a = bytes.find(b'\xff\xd8')  # frame starting
        b = bytes.find(b'\xff\xd9')  # frame ending
        if a != -1 and b != -1:
            jpg = bytes[a:b+2]
            bytes = bytes[b+2:]
            
            # Ensure the JPEG data is not empty before decoding
            if jpg:
                frame = cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)
                

                # Get the current threshold value from the trackbar
                threshold_value = cv2.getTrackbarPos('Threshold', 'settings')

                # Get the current contrast factor value from the trackbar
                contrast_factor = cv2.getTrackbarPos('Contrast', 'settings') / 10

                #Get the current contrast radius value from the trackbar
                contrast_radius = cv2.getTrackbarPos('Contrast_radius', 'settings') / 100


                # Calculate the height of the frame
                frame_height = frame.shape[0]

                # Calculate the starting point for cropping the bottom portion
                start_height = int((1 - bottom_percentage) * frame_height)

                # Crop the frame to only the bottom portion
                bottom_frame = frame[start_height:, :]

                frame = bottom_frame #just change of name

                frame_width = frame.shape[1]
                frame_height = frame.shape[0]
                frame_center_x = frame_width // 2
                frame_center_y = frame_height // 2

                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

                # Get the dimensions of the image
                height, width = gray.shape

                # Calculate the center of the image
                center_x, center_y = width // 2, height // 2

                # Specify the outer radius from the center
                outer_radius = min(center_x, center_y) * contrast_radius  # Adjust the factor as needed

                # Create a mask with the same dimensions as the image
                mask = np.ones((height, width), dtype=np.uint8) * 255  # Start with all white

                # Create a black circle in the mask within the outer radius from the center
                cv2.circle(mask, (center_x, center_y), int(outer_radius), 0, -1)

                # Apply the mask to the grayscale image to isolate the region outside the circle
                outside_region = cv2.bitwise_and(gray, gray, mask=mask)

                # Adjust the contrast in the specified region outside the circle
                adjusted_region = cv2.convertScaleAbs(outside_region, alpha=contrast_factor, beta=0)

                # Combine the adjusted region with the unmodified parts of the grayscale image
                gray = cv2.add(cv2.bitwise_and(gray, gray, mask=cv2.bitwise_not(mask)), adjusted_region)

                _, binary_thresh = cv2.threshold(gray, threshold_value, 255, cv2.THRESH_BINARY)

                binary_thresh = cv2.bitwise_not(binary_thresh)

                binary_thresh = cv2.morphologyEx(binary_thresh, cv2.MORPH_OPEN, kernel, iterations=2) # Remove noise from the binary image

                contours, hierarchy = cv2.findContours(binary_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                if contours:
                    largest_contour = max(contours, key=cv2.contourArea) # Find the largest contour

                    # Calculate moments of the largest contour
                    M = cv2.moments(largest_contour)

                    # Calculate the centroid of the largest contour
                    if M['m00'] != 0:
                        cx = int(M['m10'] / M['m00'])
                        cy = int(M['m01'] / M['m00'])

                        # Calculate the area of the largest contour
                        area = cv2.contourArea(largest_contour)

                        # Calculate the horizontal offset
                        horizontal_offset = cx - frame_center_x

                        # Display the area on the video frame
                        area_text = f"Area: {area:.2f}"
                        cv2.putText(frame, area_text, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

                        # Overlay the horizontal offset on the video frame
                        offset_text = f"Offset: {horizontal_offset}"
                        cv2.putText(frame, offset_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

                        # Draw the largest contour on the frame
                        cv2.drawContours(frame, [largest_contour], -1, (0, 255, 0), 2)

                        # Draw the centroid on the frame
                        cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)  # Draw a red circle at the centroid

                cv2.circle(frame, (frame_center_x, frame_center_y), 5, (255, 0, 0), -1)  # Draw a blue circle at the center

                # Show the image in a window
                cv2.imshow('image', binary_thresh)
                cv2.imshow('image2', frame)
            
            # Check for user input to stop the video stream
            if cv2.waitKey(1) == 27:
                cv2.destroyAllWindows()
                break
    
    except urllib.error.URLError as e:
        print(f"Stream error: {e}")
        break
    except cv2.error as e:
        print(f"OpenCV error: {e}")
        break
