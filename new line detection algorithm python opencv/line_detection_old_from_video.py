import cv2
import numpy as np

video_path = 'line_video.mkv' 
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

kernel = np.ones((5, 5), np.uint8)

delay = 20  # Increase this value to slow down the video

while True:
    
    ret, frame = cap.read()
        
    if not ret:
        break
    
    frame_width = frame.shape[1]
    frame_height = frame.shape[0]
    frame_center_x = frame_width // 2
    frame_center_y = frame_height // 2
    
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
  
    valueForCalibration = 120 # This value is used to calibrate the threshold value
    
    _, binary_thresh = cv2.threshold(gray, valueForCalibration, 255, cv2.THRESH_BINARY)

    binary_thresh = cv2.bitwise_not(binary_thresh)
 
    binary_thresh = cv2.morphologyEx(binary_thresh, cv2.MORPH_OPEN, kernel, iterations=2)
 
    contours, hierarchy = cv2.findContours(binary_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
 
    if contours:
        largest_contour = max(contours, key=cv2.contourArea)
         
        M = cv2.moments(largest_contour)
       
        if M['m00'] != 0:
            cx = int(M['m10'] / M['m00'])
            cy = int(M['m01'] / M['m00'])
            
            horizontal_offset = cx - frame_center_x
            
            offset_text = f"Offset: {horizontal_offset}"
            cv2.putText(frame, offset_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            cv2.drawContours(frame, [largest_contour], -1, (0, 255, 0), 2)
           
            cv2.circle(frame, (cx, cy), 5, (0, 0, 255), -1)  
    
    cv2.circle(frame, (frame_center_x, frame_center_y), 5, (255, 0, 0), -1)  # Draw a blue circle at the center
    
    cv2.imshow('Video', frame)
    
    if cv2.waitKey(delay) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
