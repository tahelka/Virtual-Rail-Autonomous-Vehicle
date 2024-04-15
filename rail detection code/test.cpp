#include <iostream>
#include <opencv2/opencv.hpp>

uint8_t* convert_frame_to_buf(const cv::Mat& frame) {
    int width = frame.cols;
    int height = frame.rows;
    int size = width * height;

    uint8_t* buf = new uint8_t[size];
    if (!buf) {
        std::cerr << "Failed to allocate memory for buffer" << std::endl;
        return nullptr;
    }

    // Assuming the frame is grayscale
    for (int i = 0; i < height; ++i) {
        for (int j = 0; j < width; ++j) {
            buf[i * width + j] = frame.at<uint8_t>(i, j);
        }
    }

    return buf;
}
uint8_t* apply_sobel_operator(uint8_t* image, int width, int height) {

    uint8_t* edge_image = (uint8_t*)malloc(width * height);
    if (!edge_image) {
        std::cout << "Failed to allocate memory for edge_image" << std::endl;
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
    int threshold = 250; // Set the threshold value. You may need to adjust this.
    int min_edge_length = 0; // Set the minimum edge length. You may need to adjust this. // can detect curves better if this value is lower but filters noise better needs to be adjusted according to the images from the car camera

    for (int y = 0; y < height; ++y) {
        left_edge[y] = -1;
        right_edge[y] = -1;

        // Scan from the left side of the row until we hit an edge
        for (int x = 1; x < width; ++x) {
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
        for (int x = width - 2; x >= 0; --x) {
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

int determine_direction(int left_edge, int right_edge, int width) {
    // Calculate the center of the image
    int center = width / 2;

    // Calculate the distances of the left and right edges from the center
    int left_distance = abs(center - left_edge);
    int right_distance = abs(center - right_edge);

    // Calculate the difference between the distances
    int difference = right_distance - left_distance;

    // Return the difference
    // A positive value indicates the left edge is closer to the center and the right edge is further away.
    // A negative value indicates the right edge is closer to the center and the left edge is further away.
    return difference;
}

void draw_edges(uint8_t* image, int width, int height, int* left_edge, int* right_edge) {
    // Set the color for the edges
    uint8_t edge_color = 255; // white in grayscale

    // Draw the left edge
    for (int y = 0; y < height; ++y) {
        if (left_edge[y] >= 0 && left_edge[y] < width) {
            image[y * width + left_edge[y]] = edge_color;
        }
    }

    // Draw the right edge
    for (int y = 0; y < height; ++y) {
        if (right_edge[y] >= 0 && right_edge[y] < width) {
            image[y * width + right_edge[y]] = edge_color;
        }
    }
}

void draw_edges_color(cv::Mat& image, int width, int height, int* left_edge, int* right_edge, cv::Scalar color) {
    // Draw the left edge
    for (int y = 0; y < height; ++y) {
        if (left_edge[y] >= 0 && left_edge[y] < width) {
            image.at<cv::Vec3b>(y, left_edge[y]) = cv::Vec3b(color[0], color[1], color[2]);
        }
    }

    // Draw the right edge
    for (int y = 0; y < height; ++y) {
        if (right_edge[y] >= 0 && right_edge[y] < width) {
            image.at<cv::Vec3b>(y, right_edge[y]) = cv::Vec3b(color[0], color[1], color[2]);
        }
    }
}
void convert_to_grayscale(cv::Mat& frame) {
    cv::cvtColor(frame, frame, cv::COLOR_BGR2GRAY);
}

void convert_to_binary(cv::Mat& frame, cv::Mat& binary_image) {
    double threshold_value = 128.0;
    double max_binary_value = 255.0;
    cv::threshold(frame, binary_image, threshold_value, max_binary_value, cv::THRESH_BINARY);
}

void calculate_average_edges(int* left_edge, int* right_edge, int rows, int& avg_left_edge, int& avg_right_edge) {
    int sum_left_edge = 0;
    int sum_right_edge = 0;
    int count = 0;
    for (int i = 0; i < rows; ++i) {
        if (left_edge[i] != -1 && right_edge[i] != -1) {
            sum_left_edge += left_edge[i];
            sum_right_edge += right_edge[i];
            ++count;
        }
    }
    if (count != 0) {
        avg_left_edge = sum_left_edge / count;
        avg_right_edge = sum_right_edge / count;
    }
    else {
        avg_left_edge = -1; // or any other value that indicates no valid edges were found
        avg_right_edge = -1; // or any other value that indicates no valid edges were found
    }
}

void display_images(cv::Mat& binary_image, cv::Mat& grayscale_mat, cv::Mat& color_mat) {
    cv::imshow("Binary Image", binary_image);
    cv::imshow("Grayscale Image with Edges", grayscale_mat);
    cv::imshow("Color Image with Edges", color_mat);
    cv::waitKey(1);
}

void free_memory(uint8_t* edge_image, int* left_edge, int* right_edge, uint8_t* buf_binary, uint8_t* buf_gray) {
    delete[] left_edge;
    delete[] right_edge;
    free(edge_image);
    delete[] buf_binary;
    delete[] buf_gray;
}

void process_frame(cv::Mat& frame) {
    cv::resize(frame, frame, cv::Size(160, 120)); // Resize the frame to 96x96
    convert_to_grayscale(frame);

    cv::Mat binary_image;
    convert_to_binary(frame, binary_image);

    uint8_t* buf_binary = convert_frame_to_buf(binary_image);
    uint8_t* edge_image = apply_sobel_operator(buf_binary, frame.cols, frame.rows);

    int* left_edge = new int[frame.rows];
    int* right_edge = new int[frame.rows];
    find_rail_edges(edge_image, frame.cols, frame.rows, left_edge, right_edge);

    int avg_left_edge, avg_right_edge;
    calculate_average_edges(left_edge, right_edge, frame.rows, avg_left_edge, avg_right_edge);

    int direction = determine_direction(avg_left_edge, avg_right_edge, frame.cols);
    std::cout << "Direction: " << direction << std::endl;

    uint8_t* buf_gray = convert_frame_to_buf(frame);
    draw_edges(buf_gray, frame.cols, frame.rows, left_edge, right_edge);

    cv::Mat grayscale_mat(frame.rows, frame.cols, CV_8U, buf_gray);
    cv::Mat color_mat;
    cv::cvtColor(grayscale_mat, color_mat, cv::COLOR_GRAY2BGR);

    draw_edges_color(color_mat, frame.cols, frame.rows, left_edge, right_edge, cv::Scalar(0, 0, 255));
    std::string direction_text = "Direction: " + std::to_string(direction);
    cv::putText(color_mat, direction_text, cv::Point(10, 30), cv::FONT_HERSHEY_SIMPLEX, 0.5, cv::Scalar(0, 255, 0), 2);

    display_images(binary_image, grayscale_mat, color_mat);

    free_memory(edge_image, left_edge, right_edge, buf_binary, buf_gray);
}

int main() {
    cv::VideoCapture cap("C:\\Users\\khare\\OneDrive\\Desktop\\curve_test_white_paper.mp4");

    if (!cap.isOpened()) {
        std::cerr << "Error opening video file" << std::endl;
        return -1;
    }

    cv::Mat frame;
    while (1) {
        bool success = cap.read(frame);
        if (!success)
            break;

        process_frame(frame);
    }

    cap.release();
    cv::destroyAllWindows();

    return 0;
}