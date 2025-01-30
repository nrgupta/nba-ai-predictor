#include <iostream>
#include <curl/curl.h>
#include "nlohmann/json.hpp"
#include <ctime>

using json = nlohmann::json;

// Function to handle the response from the HTTP request
size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* buffer) {
    size_t totalSize = size * nmemb;
    buffer->append((char*)contents, totalSize);
    return totalSize;
}

// Function to get the current date in YYYY-MM-DD format
std::string getCurrentDate() {
    time_t t = time(nullptr);
    struct tm* now = localtime(&t);

    char buffer[11];
    strftime(buffer, sizeof(buffer), "%Y-%m-%d", now);
    return std::string(buffer);
}

int main() {
    // Get today's date
    std::string today = getCurrentDate();
    std::string url = "https://www.balldontlie.io/api/v1/games?dates[]=" + today;

    CURL* curl;
    CURLcode res;
    std::string response;

    curl = curl_easy_init(); // Initialize CURL
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);

        // Perform the HTTP request
        res = curl_easy_perform(curl);
        if (res != CURLE_OK) {
            std::cerr << "curl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;
            return 1;
        }

        // Clean up CURL
        curl_easy_cleanup(curl);

        // Parse the JSON response
        try {
            auto jsonResponse = json::parse(response);

            // Print each game
            std::cout << "Today's NBA Games (" << today << "):\n";
            for (const auto& game : jsonResponse["data"]) {
                std::string home_team = game["home_team"]["full_name"];
                std::string visitor_team = game["visitor_team"]["full_name"];
                std::string status = game["status"];

                std::cout << home_team << " vs. " << visitor_team
                          << " (Status: " << status << ")\n";
            }
        } catch (const json::exception& e) {
            std::cerr << "JSON parsing error: " << e.what() << std::endl;
            return 1;
        }
    } else {
        std::cerr << "Failed to initialize CURL." << std::endl;
        return 1;
    }

    return 0;
}
