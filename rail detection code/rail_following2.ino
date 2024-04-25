#include "esp_camera.h"
#include "esp_timer.h"
#include "img_converters.h"
#include <WiFi.h>
#include <WiFiClient.h>


#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

const char* ssid = "enter wifi";
const char* password = "enter password";
const char* host = "enter ip after connnectiong to wifi";
const int port = 45000; // Change this to the port number on your PC for TCP
WiFiClient client;


// GPIO Setting
int gpLb =  2; // Left 1
int gpLf = 14; // Left 2
int gpRb = 15; // Right 1
int gpRf = 13; // Right 2
int gpLed =  4; // Light
String WiFiAddr ="";

void initializeCamera(camera_config_t &config) {
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_GRAYSCALE;
  config.frame_size = FRAMESIZE_QQVGA; // Change to FRAMESIZE_QQVGA for 160X120 size
  config.jpeg_quality = 10;
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    //Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(gpLb, OUTPUT); //Left Backward
  pinMode(gpLf, OUTPUT); //Left Forward
  pinMode(gpRb, OUTPUT); //Right Forward
  pinMode(gpRf, OUTPUT); //Right Backward
  pinMode(gpLed, OUTPUT); //Light

  //initialize
  digitalWrite(gpLb, LOW);
  digitalWrite(gpLf, LOW);
  digitalWrite(gpRb, LOW);
  digitalWrite(gpRf, LOW);
  digitalWrite(gpLed, LOW);
  //SerialESP.begin(115200); // Set the baud rate to 115200
  //connectToSerial(); // Call the function to initialize serial communication
  camera_config_t config;
  initializeCamera(config);
  sensor_t * sensor = esp_camera_sensor_get();
    if (!sensor) {
        Serial.println("Failed to get camera sensor");
        return;
    }
    //sensor->set_brightness(sensor, 2);     // -2 to 2
    sensor->set_contrast(sensor, 2);       // -2 to 2
    sensor->set_saturation(sensor, -2);     // -2 to 2

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  
  // Connect to the server
    if (!client.connect(host, port)) {
        Serial.println("Connection failed");
        return;
    }


}


#define THRESHOLD_VALUE 80
const short threshold_for_intersection = 10; // Set the threshold value for detecting an intersection. You may need to adjust this.
#define CAMERA_HEIGHT 160 // Adjusted height for 160X120 after rotation it will be 120X160
#define CAMERA_WIDTH 120  // Adjusted width for 160X120 after rotation it will be 120X160

void sendDataOverTCP(WiFiClient client, uint8_t* grayscale_image, uint8_t* binary_image, int* left_edge, int* right_edge, bool intersection, short direction, size_t size) {
    // Attempt connection if not connected
    while (!client.connected()) {
        // Connect to the server
        if (!client.connect(host, port)) {
            Serial.println("Connection failed. Retrying...");
            delay(1000); // Wait before retrying
        }
    }
    // Wait for the initial acknowledgment 'A' from the PC
    char initialAck;
    while (true) {
        if (client.available() > 0) {
            initialAck = client.read();
            if (initialAck == 'A') {
                break;
            }
        }
    }

    // Send grayscale image
    client.write(grayscale_image, size);
    client.flush();
    Serial.println("grayscale image sent");

    // Wait for acknowledgment 'A' from the PC before sending the next data
    char ack;
    while (true) {
        if (client.available() > 0) {
            ack = client.read();
            if (ack == 'A') {
                break;
            }
        }
    }

    // Send binary image
    client.write(binary_image, size);
    client.flush();
    Serial.println("binary_image sent");

    // Wait for acknowledgment 'A' from the PC before sending the next data
    while (true) {
        if (client.available() > 0) {
            ack = client.read();
            if (ack == 'A') {
                break;
            }
        }
    }

    // Send left edge
    client.write(reinterpret_cast<uint8_t*>(left_edge), sizeof(int) * CAMERA_HEIGHT);
    client.flush();
    Serial.println("left edge sent");

    // Wait for acknowledgment 'A' from the PC before sending the next data
    while (true) {
        if (client.available() > 0) {
            ack = client.read();
            if (ack == 'A') {
                break;
            }
        }
    }

    // Send right edge
    client.write(reinterpret_cast<uint8_t*>(right_edge), sizeof(int) * CAMERA_HEIGHT);
    client.flush();
    Serial.println("right edge sent");

    // Wait for acknowledgment 'A' from the PC before sending the next data
    while (true) {
        if (client.available() > 0) {
            ack = client.read();
            if (ack == 'A') {
                break;
            }
        }
    }

    // Send intersection flag
    client.write(reinterpret_cast<uint8_t*>(&intersection), sizeof(bool));
    client.flush();
    Serial.println("intersection flag sent");

    // Wait for acknowledgment 'A' from the PC before sending the next data
    while (true) {
        if (client.available() > 0) {
            ack = client.read();
            if (ack == 'A') {
                break;
            }
        }
    }

    // Send direction
    client.write(reinterpret_cast<uint8_t*>(&direction), sizeof(short));
    client.flush();
    Serial.println("direction sent");

    // Wait for acknowledgment 'A' from the PC before continuing to next frame
    while (true) {
        if (client.available() > 0) {
            ack = client.read();
            if (ack == 'A') {
                break;
            }
        }
    }
}

// Function to convert the captured image to binary
void convert_to_binary(camera_fb_t * fb, uint8_t * binary_image) {
    // Copy the original frame buffer to binary_image
    memcpy(binary_image, fb->buf, fb->len);

    // Convert binary_image to binary
    for (int i = 0; i < fb->len; ++i) {
        binary_image[i] = (binary_image[i] >= THRESHOLD_VALUE) ? 255 : 0;
    }
}

void rotate_image(camera_fb_t *fb) {
    // Create a new buffer for the rotated image
    uint8_t *rotated_data = (uint8_t *)malloc(fb->height * fb->width * sizeof(uint8_t));
    if (!rotated_data) {
        Serial.println("Memory allocation failed");
        return;
    }

    // Rotate the image data
    for (int y = 0; y < fb->height; y++) {
        for (int x = 0; x < fb->width; x++) {
            int rotated_x = fb->height - y - 1;
            int rotated_y = x;
            rotated_data[rotated_y * fb->height + rotated_x] = fb->buf[y * fb->width + x];
        }
    }

    // Update width and height to reflect the new dimensions
    int temp = fb->width;
    fb->width = fb->height;
    fb->height = temp;

    // Free the original buffer
    free(fb->buf);

    // Assign the rotated buffer to fb->buf
    fb->buf = rotated_data;
}


void captureAndProcessImage(WiFiClient client) {
  // Capture an image
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    //Serial.println("Camera capture failed");
    return;
  }
  
  // Rotate image
  rotate_image(fb);
  //unsigned long long startTime = micros(); // Start time of current processing

  // Convert the image to grayscale
  uint8_t * grayscale_image = fb->buf;
  uint8_t * binary_image = (uint8_t *)malloc(fb->len * sizeof(uint8_t)); // Allocate memory for binary_image
  medianFilter(fb->buf, CAMERA_WIDTH, CAMERA_HEIGHT);
  convert_to_binary(fb, binary_image); // Convert to binary
  //medianFilter(binary_image, CAMERA_WIDTH, CAMERA_HEIGHT);
  // Apply the Sobel operator to detect edges
  uint8_t * edge_image = apply_sobel_operator(binary_image, CAMERA_WIDTH, CAMERA_HEIGHT); // Use adjusted width and height
  //medianFilter(edge_image, CAMERA_WIDTH, CAMERA_HEIGHT);
  // Analyze the edge image to find the two edges of the rail
  int* left_edge = new int[CAMERA_HEIGHT];
  int* right_edge = new int[CAMERA_HEIGHT];
  find_rail_edges(edge_image, CAMERA_WIDTH, CAMERA_HEIGHT, left_edge, right_edge);

  short avg_left_edge, avg_right_edge;
  bool no_edges_detected;
  calculate_average_edges(left_edge, right_edge, CAMERA_HEIGHT, avg_left_edge, avg_right_edge, no_edges_detected, threshold_for_intersection);
  short direction = 0;
  if (!no_edges_detected) 
  {
  // Determine the direction to move based on the position of the rail edges
  direction = determine_direction(avg_left_edge, avg_right_edge,CAMERA_WIDTH);
  }
  sendDataOverTCP(client,grayscale_image, binary_image, left_edge, right_edge, no_edges_detected ,direction, fb->len);
  // Don't forget to free the framebuffer when you're done.
  esp_camera_fb_return(fb);
  free(binary_image); // Free the memory when done
  binary_image = NULL;

  // Delay between captures
  delay(100);
}


void loop() {
  captureAndProcessImage(client);
  // Check if the server is still reachable
    if (!client.connected()) {
        Serial.println("Server is not reachable. Closing the connection.");
        client.stop();
    }
}

uint8_t* apply_sobel_operator(uint8_t* image, int width, int height) {

    uint8_t* edge_image = (uint8_t*)malloc(width * height);
    if (!edge_image) {
        //Serial.println("Failed to allocate memory for edge_image");
        return NULL;
    }

    int Gx[3][3] = { {-1, 0, 1}, {-2, 0, 2}, {-1, 0, 1} };
    int Gy[3][3] = { {-1, -2, -1}, {0, 0, 0}, {1, 2, 1} };

    for (int y = 1; y < height - 1; ++y) {
        for (int x = 1; x < width - 1; ++x) {
            int sumX = 0;
            int sumY = 0;
            if (y == 0 || y == height - 1 || x == 0 || x == width - 1) {
                edge_image[y * width + x] = 0;
            }
            else {
                for (int i = -1; i <= 1; i++) {
                    for (int j = -1; j <= 1; j++) {
                        sumX += image[(y + i) * width + (x + j)] * Gx[i + 1][j + 1];
                        sumY += image[(y + i) * width + (x + j)] * Gy[i + 1][j + 1];
                    }
                }
                int sum = abs(sumX) + abs(sumY);
                edge_image[y * width + x] = sum > 255 ? 255 : sum;
            }
        }
    }

    return edge_image;
}

void find_rail_edges(uint8_t* edge_image, int width, int height, int* left_edge, int* right_edge) {
    int threshold = 100; // Set the threshold value. You may need to adjust this.
    int min_edge_length = 20; // Set the minimum edge length. You may need to adjust this.  with 25 i was able to detect intersection but made navigation not good direction numbers were small (and also kernel 7 but might have worked without it)

    for (int y = 0; y < height; ++y) {
        left_edge[y] = -1;
        right_edge[y] = -1;

        // Scan from the left side of the row until we hit an edge
        for (int x = 1; x < width - 1; ++x) {
            if (edge_image[y * width + x] > threshold && edge_image[y * width + x - 1] <= threshold) {
                // Check if the edge is consistent over the next few rows
                bool is_consistent = true;
                for (int i = 1; i < min_edge_length && y + i < height; ++i) {
                    if (edge_image[(y + i) * width + x] <= threshold) {
                        is_consistent = false;
                        break;
                    }
                }

                if (is_consistent) {
                    left_edge[y] = x;
                    break;
                }
            }
        }

        // Scan from the right side of the row until we hit an edge
        for (int x = width - 2; x >= 1; --x) {
            if (edge_image[y * width + x] > threshold && edge_image[y * width + x + 1] <= threshold) {
                // Check if the edge is consistent over the next few rows
                bool is_consistent = true;
                for (int i = 1; i < min_edge_length && y + i < height; ++i) {
                    if (edge_image[(y + i) * width + x] <= threshold) {
                        is_consistent = false;
                        break;
                    }
                }

                if (is_consistent) {
                    right_edge[y] = x;
                    break;
                }
            }
        }
    }
}

short determine_direction(short left_edge, short right_edge, int width) {
    // Calculate the center of the image
    int center = width / 2;

    // Calculate the distances of the left and right edges from the center
    int left_distance = abs(center - left_edge);
    int right_distance = abs(center - right_edge);

    // Calculate the difference between the distances
    short difference = right_distance - left_distance;

    // Return the difference
    // A positive value indicates the left edge is closer to the center and the right edge is further away.
    // A negative value indicates the right edge is closer to the center and the left edge is further away.
    return difference;
}

void calculate_average_edges(int* left_edge, int* right_edge, short rows, short& avg_left_edge, short& avg_right_edge, bool& no_edges_detected, short threshold) {
    short sum_left_edge = 0;
    short sum_right_edge = 0;
    short count = 0;
    static short no_edges_counter = 0; // Counter for consecutive frames with no edges

    for (short i = 0; i < rows; ++i) {
        if (left_edge[i] != -1 && right_edge[i] != -1) {
            sum_left_edge += left_edge[i];
            sum_right_edge += right_edge[i];
            ++count;
        }
    }
    if (count != 0) {
        avg_left_edge = sum_left_edge / count;
        avg_right_edge = sum_right_edge / count;
        no_edges_counter = 0; // Reset the counter because valid edges were found
    }
    else {
        avg_left_edge = -1; // or any other value that indicates no valid edges were found
        avg_right_edge = -1; // or any other value that indicates no valid edges were found
        ++no_edges_counter; // Increment the counter because no valid edges were found
    }

    // If the counter exceeds the threshold, set the boolean flag to true
    if (no_edges_counter >= threshold) {
        no_edges_detected = true;
    }
    else {
        no_edges_detected = false;
    }
}
void medianFilter(uint8_t* image, int width, int height) {
    uint8_t* copy = new uint8_t[width * height];
    memcpy(copy, image, width * height);

    int kernelSize = 3; // Change this to adjust the kernel size (odd number)   adjust for a higher number kernel if want to remove more noise i have notice 3 is kind of enough maybe wrong
    int halfKernel = kernelSize / 2;

    for (int y = halfKernel; y < height - halfKernel; y++) {
        for (int x = halfKernel; x < width - halfKernel; x++) {
            // Create a window centered around the current pixel
            uint8_t window[9]; // Assuming kernelSize is 3 (3x3 window)
            int k = 0;
            for (int dy = -halfKernel; dy <= halfKernel; dy++) {
                for (int dx = -halfKernel; dx <= halfKernel; dx++) {
                    window[k++] = copy[(y + dy) * width + (x + dx)];
                }
            }

            // Sort the window to find the median
            std::sort(window, window + kernelSize * kernelSize);
            image[y * width + x] = window[kernelSize * kernelSize / 2];
        }
    }

    delete[] copy;
}
