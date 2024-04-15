#include "esp_camera.h"
#include "esp_timer.h"
#include "img_converters.h"
#include <WiFi.h>

#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

#define WIFI_SSID "your_wifi_ssid"
#define WIFI_PASSWORD "your_wifi_password"


void connectToWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

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
  config.pixel_format = PIXFORMAT_GRAYSCALE; // Choose this format for grayscale
  config.frame_size = FRAMESIZE_96X96; // Choose this size for smallest images
  config.jpeg_quality = 10;
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
}

void setup() {
  Serial.begin(115200);
  connectToWiFi();
  camera_config_t config;
  initializeCamera(config);
}

void captureAndProcessImage() {
  // Capture an image
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  // Convert the image to grayscale
  uint8_t * grayscale_image = fb->buf;

  // Apply the Sobel operator to detect edges
  uint8_t * edge_image = apply_sobel_operator(grayscale_image, fb->width, fb->height);

  // Analyze the edge image to find the two edges of the rail
  int left_edge, right_edge;
  find_rail_edges(edge_image, fb->width, fb->height, &left_edge, &right_edge);

  // Determine the direction to move based on the position of the rail edges
  int direction = determine_direction(left_edge, right_edge,fb->width);

  // Draw the detected edges on the image for visualization
  draw_edges(grayscale_image, fb->width, fb->height, left_edge, right_edge);

  // Don't forget to free the framebuffer when you're done.
  esp_camera_fb_return(fb);

  // Delay between captures
  delay(10000);
}

void loop() {
  captureAndProcessImage();
}

uint8_t * apply_sobel_operator(uint8_t * image, int width, int height) {

  uint8_t * edge_image = (uint8_t *)malloc(width * height);
  if (!edge_image) {
    Serial.println("Failed to allocate memory for edge image");
    return NULL;
  }

  int Gx[3][3] = {{-1, 0, 1}, {-2, 0, 2}, {-1, 0, 1}};
  int Gy[3][3] = {{-1, -2, -1}, {0, 0, 0}, {1, 2, 1}};

  for (int y = 0; y < height; ++y) {
    for (int x = 0; x < width; ++x) {
      int sumX = 0;
      int sumY = 0;
      if (y == 0 || y == height - 1 || x == 0 || x == width - 1) {
        edge_image[y * width + x] = 0;
      } else {
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

void find_rail_edges(uint8_t * edge_image, int width, int height, int * left_edge, int * right_edge) {
  int threshold = 128; // Set the threshold value. You may need to adjust this.

  for (int y = 0; y < height; ++y) {
    left_edge[y] = -1;
    right_edge[y] = -1;

    // Scan from the left side of the row until we hit an edge
    for (int x = 0; x < width; ++x) {
      if (edge_image[y * width + x] > threshold) {
        left_edge[y] = x;
        break;
      }
    }

    // Scan from the right side of the row until we hit an edge
    for (int x = width - 1; x >= 0; --x) {
      if (edge_image[y * width + x] > threshold) {
        right_edge[y] = x;
        break;
      }
    }
  }
}

int determine_direction(int left_edge, int right_edge, int width) {
  // Calculate the center of the image
  int center = width / 2;

  // Calculate the distances of the left and right edges from the center
  int left_distance = abs(center - left_edge);
  int right_distance = abs(center - right_edge);

  // Calculate the difference between the distances
  int difference = right_distance - left_distance;

  // If the difference is positive, the right edge is closer to the center
  // If the difference is negative, the left edge is closer to the center
  // If the difference is zero, both edges are equally distant from the center

  // Return the difference
  return difference;
}

void draw_edges(uint8_t * image, int width, int height, int left_edge, int right_edge) {
  // Set the color for the edges
  uint8_t edge_color = 255; // white in grayscale

  // Draw the left edge
  for (int y = 0; y < height; ++y) {
    if (left_edge >= 0 && left_edge < width) {
      image[y * width + left_edge] = edge_color;
    }
  }

  // Draw the right edge
  for (int y = 0; y < height; ++y) {
    if (right_edge >= 0 && right_edge < width) {
      image[y * width + right_edge] = edge_color;
    }
  }
}