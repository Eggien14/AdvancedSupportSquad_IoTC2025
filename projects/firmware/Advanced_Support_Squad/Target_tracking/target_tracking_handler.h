#ifndef TARGET_TRACKING_TARGET_TRACKING_HANDLER_H_
/******************************************************************************************//**
 * This is the "parent" module for target tracking, which includes:
 *   ├── target_tracking_handler.h   // function declarations and internal data types
 *   ├── target_tracking_handler.c   // global variable definitions and target_tracking()
 *   ├── rssi_filter.h               // Kalman filter interface
 *   ├── rssi_filter.c               // Kalman filter implementation
 *   ├── path_loss.h                 // path-loss interface (A, m)
 *   ├── path_loss.c                 // distance calculation and radius correction
 *   ├── trilateration.h             // trilateration interface
 *   └── trilateration.c             // trilateration algorithm
 *********************************************************************************************/
#define TARGET_TRACKING_TARGET_TRACKING_HANDLER_H_



/******************************************************************************************//**
 * @file target_tracking_handler.h
 * @brief Header file for target tracking handler module.
 *        Contains function declarations and data structure definitions for the target tracking system.
 *********************************************************************************************/

#include "config.h"



/******************************************************************************************//**
 *
 * Target Tracking Variables and Data Structure Definitions
 *
*********************************************************************************************/

// Data structure for Kalman filter
typedef struct {
    double x_est;   ///< Current RSSI estimation
    double p_est;   ///< Estimation error
    double Q;       ///< Process noise covariance
    double R;       ///< Measurement noise covariance
    int8_t TBC;     ///< TBC filter params
} KalmanState_t;

// Store the most recent RSSI values and filtered results
typedef struct {
    int8_t raw_rssi[10];        // Array of 10 most recent raw RSSI values (newest in, oldest out)
    double filtered_rssi;       // RSSI value after Kalman filter
} AnchorFilter_t;

// PathLoss_t data structure stores path loss parameters
typedef struct {
    double A;   // Reference RSSI coefficient at distance d0 (dBm)
    double m;   // Path loss exponent (a real value, typically in range 2-4)
} PathLoss_t;

// Store RSSI values after calculating distance
typedef struct {
    double d_raw;               // Distance calculated from pure RSSI
    double d_corrected;         // Distance after radius correction
} AnchorPathloss_t;

// Store beacon configuration
typedef struct {
    double         x, y;        // Cartesian coordinates of beacon
    PathLoss_t     pl;          // Path-loss parameters (defined in path_loss.h)
    KalmanState_t  kf;          // Kalman filter parameters (defined in rssi_filter.h)
} AnchorConfig_t;

// Store coordinates
typedef struct {
  double x;
  double y;
} Coordinate_t;

// Data structure stores preliminary and final calculations for trilateration algorithm
typedef struct {
    Coordinate_t pre_coordinate[3];  // Set of 3 coordinates forming intersection area
    Coordinate_t final_coordinate;   // Final calculated coordinate
    double error_index;              // Radius estimation error
} TrilaterationCoordinates_t;

// Data structure stores coordinate information from beacon combinations
typedef struct {
    Coordinate_t pre_coordinate[4];  // Set of 4 coordinates from 4 beacon combinations
    Coordinate_t final_coordinate;    // Final calculated coordinate
    double error_index;               // Radius estimation error
} FinalCoordinates_t;

/* --- Global variables, defined in target_tracking_handler.c --- */
extern AnchorConfig_t               anchors[NUM_ANCHORS];
extern AnchorFilter_t               anchor_filters[NUM_ANCHORS];
extern AnchorPathloss_t             anchor_pathloss[NUM_ANCHORS];
extern TrilaterationCoordinates_t   comb_tri_coor[NUM_COMBINATIONS];
extern FinalCoordinates_t           final_coordinates;
extern double                       beacon_dist[NUM_ANCHORS][NUM_ANCHORS];

/* Structs and functions related to trilateration will be defined later */



/******************************************************************************************//**
 *
 * Target Tracking Function Definitions
 *
 *********************************************************************************************/

/**
 * @brief Updates the RSSI buffer with the latest value for a specific beacon
 * @param beacon_idx Index of the beacon to update
 * @param new_rssi Latest RSSI value to add to the buffer
 */
void update_rssi_buffer(int beacon_idx, int8_t new_rssi);

/**
 * @brief Initializes the target tracking system:
 *   - Set up default Kalman filter parameters
 *   - Set up path-loss parameters
 *   - Calculate inter-beacon distances
 */
void target_tracking_setup(void);

/**
 * @brief Main function that runs one tracking cycle:
 *   - Update RSSI filters
 *   - Calculate path-loss -> distance
 *   - Trilateration (to be added later)
 */
void target_tracking(void);

void get_anchor_position(float*, float*, float*, float*, float*, float*, float*, float*);

#endif /* TARGET_TRACKING_TARGET_TRACKING_HANDLER_H_ */
