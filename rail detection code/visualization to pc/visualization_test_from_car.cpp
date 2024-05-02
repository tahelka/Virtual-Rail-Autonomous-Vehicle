#include <iostream>
#include <opencv2/opencv.hpp>
#include <winsock2.h>
#include <ws2tcpip.h> // Include this header for inet_pton function on Windows
#include <chrono>
#include <fstream>            // For file input/output operations

const short threshold_for_intersection = 10; // Set the threshold value for detecting an intersection. You may need to adjust this.
#define CAMERA_HEIGHT 160   //after rotation by 90 degrees
#define CAMERA_WIDTH 120    //after rotation by 90 degrees

int left_edge[160];  // Assuming the height is 160 after rotation by 90 degrees
int right_edge[160]; // Assuming the height is 160 after rotation by 90 degrees

const char* pc_ip = "enter pc ip";
const int pc_port = 45000; // Port to listen for incoming connections

bool receiveDataAndAcknowledge(SOCKET socket, void* buffer, size_t bufferSize)
{
    // Receive data
    int totalReceived = 0;
    // Start the timer before the loop
    auto start_time = std::chrono::steady_clock::now();
    while (totalReceived < bufferSize)
    {
        int bytesReceived = recv(socket, static_cast<char*>(buffer) + totalReceived, bufferSize - totalReceived, 0);
        if (bytesReceived == SOCKET_ERROR)
        {
            std::cerr << "Error receiving data: " << WSAGetLastError() << std::endl;
            return false;
        }
        else if (bytesReceived == 0)
        {
            // Check if the elapsed time exceeds 2 minutes
            auto current_time = std::chrono::steady_clock::now();
            auto elapsed_time = std::chrono::duration_cast<std::chrono::seconds>(current_time - start_time).count();
            if (elapsed_time >= 120)
            {
                std::cerr << "Timeout: No data received for 2 minutes." << std::endl;
                return false;
            }
		}
        totalReceived += bytesReceived;
    }

    // Send acknowledgment
    char ack = 'A';
    if (send(socket, &ack, sizeof(char), 0) == SOCKET_ERROR)
    {
        std::cerr << "Error sending acknowledgment." << std::endl;
        return false;
    }

    return true;
}

int main()
{
    // Open the file for writing
    std::ofstream outFile("C:\\Users\\khare\\OneDrive\\Desktop\\pixel_values.txt");
    if (!outFile.is_open()) {
        std::cerr << "Error opening file for writing." << std::endl;
        return 1;
    }

    int matrix_number = 0; // Counter variable for matrix number

    // Initialize Winsock
    WSADATA wsaData;
    int iResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (iResult != 0)
    {
        std::cerr << "WSAStartup failed: " << iResult << std::endl;
        return 1;
    }

    // Create a socket for TCP connection
    SOCKET ListenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (ListenSocket == INVALID_SOCKET)
    {
        std::cerr << "Error creating socket: " << WSAGetLastError() << std::endl;
        WSACleanup();
        return 1;
    }

    // Set timeout for receiving data
    DWORD timeout = 120000; // 120 seconds in milliseconds
    if (setsockopt(ListenSocket, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeout, sizeof timeout) < 0) {
        std::cerr << "Error setting receive timeout" << std::endl;
        closesocket(ListenSocket);
        WSACleanup();
        return 1;
    }

    // Adjust receive buffer size
    int recvBufferSize = 1024 * 1024; // 1 MB buffer size (adjust as needed)
    if (setsockopt(ListenSocket, SOL_SOCKET, SO_RCVBUF, (const char*)&recvBufferSize, sizeof(recvBufferSize)) < 0) {
        std::cerr << "Error setting receive buffer size" << std::endl;
        closesocket(ListenSocket);
        WSACleanup();
        return 1;
    }

    // Bind the socket
    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(pc_port);
    iResult = bind(ListenSocket, (SOCKADDR*)&serverAddr, sizeof(serverAddr));
    if (iResult == SOCKET_ERROR)
    {
        std::cerr << "Bind failed with error: " << WSAGetLastError() << std::endl;
        closesocket(ListenSocket);
        WSACleanup();
        return 1;
    }

    // Listen for incoming connections
    if (listen(ListenSocket, SOMAXCONN) == SOCKET_ERROR)
    {
        std::cerr << "Listen failed with error: " << WSAGetLastError() << std::endl;
        closesocket(ListenSocket);
        WSACleanup();
        return 1;
    }

    std::cout << "Waiting for incoming connection..." << std::endl;

    // Accept a client socket
    SOCKET ClientSocket = accept(ListenSocket, NULL, NULL);
    if (ClientSocket == INVALID_SOCKET)
    {
        std::cerr << "Accept failed: " << WSAGetLastError() << std::endl;
        closesocket(ListenSocket);
        WSACleanup();
        return 1;
    }

    std::cout << "Client connected." << std::endl;

    std::vector<cv::Mat> frames; // Vector to store received frames
    std::vector<cv::Mat> binary_frames; // Vector to store received binary images


    int frame_count = 0; // Counter to track the number of frames received


    while (frame_count < 30)
    {
        char ack = 'A';
        if (send(ClientSocket, &ack, sizeof(char), 0) == SOCKET_ERROR)
        {
            std::cerr << "Error sending starting signal to esp32(client)" << std::endl;
            return false;
        }
        else
        {
            std::cout << "Starting frame signal sent to esp32(client)" << std::endl;
        }

        // Receive and acknowledge grayscale image
        cv::Mat grayscale_mat(CAMERA_HEIGHT, CAMERA_WIDTH, CV_8UC1);
        if (!receiveDataAndAcknowledge(ClientSocket, grayscale_mat.data, sizeof(uint8_t) * CAMERA_HEIGHT * CAMERA_WIDTH))
        {
            closesocket(ClientSocket);
            WSACleanup();
            return 1;
        }

        // Receive and acknowledge binary image
        cv::Mat binary_mat(CAMERA_HEIGHT, CAMERA_WIDTH, CV_8UC1);
        if (!receiveDataAndAcknowledge(ClientSocket, binary_mat.data, sizeof(uint8_t) * CAMERA_HEIGHT * CAMERA_WIDTH))
        {
            closesocket(ClientSocket);
            WSACleanup();
            return 1;
        }
        // Store binary image in vector
        binary_frames.push_back(binary_mat);

        // Receive and acknowledge left edge
        if (!receiveDataAndAcknowledge(ClientSocket, left_edge, sizeof(int) * CAMERA_HEIGHT))
        {
            closesocket(ClientSocket);
            WSACleanup();
            return 1;
        }

        // Receive and acknowledge right edge
        if (!receiveDataAndAcknowledge(ClientSocket, right_edge, sizeof(int) * CAMERA_HEIGHT))
        {
            closesocket(ClientSocket);
            WSACleanup();
            return 1;
        }

        // Receive and acknowledge intersection flag
        bool intersection_flag;
        if (!receiveDataAndAcknowledge(ClientSocket, &intersection_flag, sizeof(bool)))
        {
            closesocket(ClientSocket);
            WSACleanup();
            return 1;
        }

        short direction;
        if (!receiveDataAndAcknowledge(ClientSocket, &direction, sizeof(short)))
        {
            closesocket(ClientSocket);
            WSACleanup();
            return 1;
        }

        cv::Mat color_mat;
        cv::cvtColor(grayscale_mat, color_mat, cv::COLOR_GRAY2BGR);
        matrix_number++;
        // Draw edges
        for (int y = 0; y < CAMERA_HEIGHT; ++y)
        {
            if (left_edge[y] >= 0 && left_edge[y] < CAMERA_WIDTH)
            {
                color_mat.at<cv::Vec3b>(y, left_edge[y]) = cv::Vec3b(0, 0, 255); // Red color for left edge
            }
            if (right_edge[y] >= 0 && right_edge[y] < CAMERA_WIDTH)
            {
                color_mat.at<cv::Vec3b>(y, right_edge[y]) = cv::Vec3b(0, 255, 0); // Green color for right edge
            }
        }

        // Iterate over each pixel in the image
        for (int y = 0; y < grayscale_mat.rows; ++y) {
            for (int x = 0; x < grayscale_mat.cols; ++x) {
                uint8_t pixel = grayscale_mat.at<uint8_t>(y, x);
                // Write matrix number and pixel value to the file
                outFile << "Matrix " << matrix_number << " - Pixel at (" << x << ", " << y << "): " << static_cast<int>(pixel) << "\n";
            }
            // Add newline to separate rows
            outFile << "\n";
        }


        std::cout << "Pixel values written to pixel_values.txt" << std::endl;
       
        // Write intersection status on the image
        std::string status_text = intersection_flag ? "Intersection" : "Regular Path";
        cv::putText(color_mat, status_text, cv::Point(10, 20), cv::FONT_HERSHEY_SIMPLEX, 0.5, cv::Scalar(0, 255, 0), 1);

        // Display the direction on the image
        std::string direction_text = "Direction: " + std::to_string(direction);
        cv::putText(color_mat, direction_text, cv::Point(10, 40), cv::FONT_HERSHEY_SIMPLEX, 0.5, cv::Scalar(255, 0, 0), 1);

        std::cout << "Frame " << frame_count + 1 << " received. Intersection flag: " << (intersection_flag ? "Intersection" : "Regular Path") << ", Direction: " << direction << std::endl;

        // Display the frame live
        cv::imshow("Live Frame", color_mat);
        // Introduce a delay of one second (1000 milliseconds)
        cv::waitKey(1000);
        // Display the binary image
        cv::imshow("Binary Image", binary_mat);
        cv::waitKey(1000); // Wait for a second to display the image

        frame_count++; // Increment the frame count
        frames.push_back(color_mat); // Store the frame in the vector
    }

    // Write frames to video file
    cv::VideoWriter video_writer("C:\\Users\\khare\\OneDrive\\Desktop\\output_video.mp4", cv::VideoWriter::fourcc('X', '2', '6', '4'), 1, cv::Size(CAMERA_WIDTH, CAMERA_HEIGHT));
    for (const auto& frame : frames)
    {
        video_writer.write(frame);
    }
    video_writer.release();

    // Write binary frames to video file
    cv::VideoWriter binary_video_writer("C:\\Users\\khare\\OneDrive\\Desktop\\output_binary_video.mp4", cv::VideoWriter::fourcc('X', '2', '6', '4'), 1, cv::Size(CAMERA_WIDTH, CAMERA_HEIGHT), false);
    for (const auto& binary_frame : binary_frames)
    {
        binary_video_writer.write(binary_frame);
    }
    binary_video_writer.release();
    // Close the file
    outFile.close();


    // Cleanup
    closesocket(ClientSocket);
    closesocket(ListenSocket);
    WSACleanup();

    return 0;
}
