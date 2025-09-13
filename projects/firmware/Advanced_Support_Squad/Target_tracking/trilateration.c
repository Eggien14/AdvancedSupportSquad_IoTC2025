#include <math.h>



#include "trilateration.h"


int comb_beacon[NUM_COMBINATIONS][3] = {
    {0,1,2},
    {0,1,3},
    {0,2,3},
    {1,2,3}
};
double  beacon_dist[NUM_ANCHORS][NUM_ANCHORS];
Coordinate_t  intersection_coordinates[3][2] = {0};
TrilaterationCoordinates_t    comb_tri_coor[NUM_COMBINATIONS];  // Coordinates calculated from anchor combinations
FinalCoordinates_t            final_coordinates;                // Final calculated target position



double compute_distances(int x1, int y1, int x2, int y2){
    double result = sqrt(pow(x1 - x2, 2) + pow(y1 - y2, 2));
    return result;
}



void compute_beacon_dist(void) {
  for (int i = 0; i < NUM_ANCHORS; i++){
      for (int j = 0; j < NUM_ANCHORS; j++){
          beacon_dist[i][j] = compute_distances(anchors[i].x, anchors[i].y, anchors[j].x, anchors[j].y);
      }
  }
}



void intersection_point(int beacon1, double x1, double y1, double r1,
                        int beacon2, double x2, double y2, double r2, int id) {
    double d = beacon_dist[beacon1][beacon2];
    double a = (pow(r1, 2) - pow(r2, 2) + pow(d, 2)) / (2 * d);
    double h = sqrt(pow(r1, 2) - pow(a, 2));
    double x0 = x1 + a * (x2 - x1) / d;
    double y0 = y1 + a * (y2 - y1) / d;
    intersection_coordinates[id][0].x = x0 + h * (y2 - y1) / d;
    intersection_coordinates[id][0].y = y0 - h * (x2 - x1) / d;
    intersection_coordinates[id][1].x = x0 - h * (y2 - y1) / d;
    intersection_coordinates[id][1].y = y0 + h * (x2 - x1) / d;
}



void compute_trilateration(int beacon0, int beacon1, int beacon2, int comb_index) {
  double r0 = anchor_pathloss[beacon0].d_raw;
  double r1 = anchor_pathloss[beacon1].d_raw;
  double r2 = anchor_pathloss[beacon2].d_raw;
//  printf("D%d dit: %2f\r\n",beacon0,r0);
//  printf("D%d dit: %2f\r\n",beacon1,r1);
//  printf("D%d dit: %2f\r\n",beacon2,r2);
  adjust_three_dist(beacon_dist[beacon0][beacon1],
                    beacon_dist[beacon0][beacon2],
                    beacon_dist[beacon1][beacon2],
                    &r0, &r1, &r2);
//  printf("D%d me: %2f\r\n",beacon0,r0);
//  printf("D%d me: %2f\r\n",beacon1,r1);
//  printf("D%d me: %2f\r\n",beacon2,r2);
  adjust_last_dist(beacon_dist[beacon0][beacon1],
                   beacon_dist[beacon0][beacon2],
                   beacon_dist[beacon1][beacon2],
                   &r0, &r1, &r2);
//  printf("D%d may: %2f\r\n",beacon0,r0);
//  printf("D%d may: %2f\r\n",beacon1,r1);
//  printf("D%d may: %2f\r\n",beacon2,r2);
  intersection_point(beacon0, anchors[beacon0].x, anchors[beacon0].y, r0,
                     beacon1, anchors[beacon1].x, anchors[beacon1].y, r1, 0);
  comb_tri_coor[comb_index].pre_coordinate[2].x = (compute_distances(intersection_coordinates[0][0].x,
                                                          intersection_coordinates[0][0].y,
                                                          anchors[beacon2].x, anchors[beacon2].y) <
                                      compute_distances(intersection_coordinates[0][1].x,
                                                          intersection_coordinates[0][1].y,
                                                          anchors[beacon2].x, anchors[beacon2].y)) ?
                                      intersection_coordinates[0][0].x : intersection_coordinates[0][1].x;
  comb_tri_coor[comb_index].pre_coordinate[2].y = (compute_distances(intersection_coordinates[0][0].x,
                                                          intersection_coordinates[0][0].y,
                                                          anchors[beacon2].x, anchors[beacon2].y) <
                                      compute_distances(intersection_coordinates[0][1].x,
                                                          intersection_coordinates[0][1].y,
                                                          anchors[beacon2].x, anchors[beacon2].y)) ?
                                      intersection_coordinates[0][0].y : intersection_coordinates[0][1].y;

  intersection_point(beacon0, anchors[beacon0].x, anchors[beacon0].y, r0,
                     beacon2, anchors[beacon2].x, anchors[beacon2].y, r2, 1);
  comb_tri_coor[comb_index].pre_coordinate[1].x = (compute_distances(intersection_coordinates[1][0].x,
                                                          intersection_coordinates[1][0].y,
                                                          anchors[beacon1].x, anchors[beacon1].y) <
                                      compute_distances(intersection_coordinates[1][1].x,
                                                          intersection_coordinates[1][1].y,
                                                          anchors[beacon1].x, anchors[beacon1].y)) ?
                                      intersection_coordinates[1][0].x : intersection_coordinates[1][1].x;
  comb_tri_coor[comb_index].pre_coordinate[1].y = (compute_distances(intersection_coordinates[1][0].x,
                                                          intersection_coordinates[1][0].y,
                                                          anchors[beacon1].x, anchors[beacon1].y) <
                                      compute_distances(intersection_coordinates[1][1].x,
                                                          intersection_coordinates[1][1].y,
                                                          anchors[beacon1].x, anchors[beacon1].y)) ?
                                      intersection_coordinates[1][0].y : intersection_coordinates[1][1].y;

  intersection_point(beacon1, anchors[beacon1].x, anchors[beacon1].y, r1,
                     beacon2, anchors[beacon2].x, anchors[beacon2].y, r2, 2);
  comb_tri_coor[comb_index].pre_coordinate[0].x = (compute_distances(intersection_coordinates[2][0].x,
                                                          intersection_coordinates[2][0].y,
                                                          anchors[beacon0].x, anchors[beacon0].y) <
                                      compute_distances(intersection_coordinates[2][1].x,
                                                          intersection_coordinates[2][1].y,
                                                          anchors[beacon0].x, anchors[beacon0].y)) ?
                                      intersection_coordinates[2][0].x : intersection_coordinates[2][1].x;
  comb_tri_coor[comb_index].pre_coordinate[0].y = (compute_distances(intersection_coordinates[2][0].x,
                                                          intersection_coordinates[2][0].y,
                                                          anchors[beacon0].x, anchors[beacon0].y) <
                                      compute_distances(intersection_coordinates[2][1].x,
                                                          intersection_coordinates[2][1].y,
                                                          anchors[beacon0].x, anchors[beacon0].y)) ?
                                      intersection_coordinates[2][0].y : intersection_coordinates[2][1].y;
  
  // Tính toán tọa độ trung bình của 3 điểm giao nhau
  double pre_x = (comb_tri_coor[comb_index].pre_coordinate[0].x +
                  comb_tri_coor[comb_index].pre_coordinate[1].x +
                  comb_tri_coor[comb_index].pre_coordinate[2].x) / 3.0;
  if (pre_x > WEST_BORDER && pre_x < EAST_BORDER){
      comb_tri_coor[comb_index].final_coordinate.x = pre_x;
  }
  else if(pre_x < WEST_BORDER){
      comb_tri_coor[comb_index].final_coordinate.x = WEST_BORDER;
  }
  else if(pre_x > EAST_BORDER){
      comb_tri_coor[comb_index].final_coordinate.x = EAST_BORDER;
  }

  double pre_y = (comb_tri_coor[comb_index].pre_coordinate[0].y +
                  comb_tri_coor[comb_index].pre_coordinate[1].y +
                  comb_tri_coor[comb_index].pre_coordinate[2].y) / 3.0;
  if (pre_y > SOUTH_BORDER && pre_y < NORTH_BORDER){
      comb_tri_coor[comb_index].final_coordinate.y = pre_y;
  }
  else if(pre_y < SOUTH_BORDER){
      comb_tri_coor[comb_index].final_coordinate.y = SOUTH_BORDER;
  }
  else if(pre_y > NORTH_BORDER){
      comb_tri_coor[comb_index].final_coordinate.y = NORTH_BORDER;
  }
  // Tính toán sai số bán kính
  comb_tri_coor[comb_index].error_index = compute_distances(comb_tri_coor[comb_index].pre_coordinate[0].x,
                                                  comb_tri_coor[comb_index].pre_coordinate[0].y,
                                                  comb_tri_coor[comb_index].final_coordinate.x,
                                                  comb_tri_coor[comb_index].final_coordinate.y);
//  printf("Comb|%d|%d|%d| x: %.2f, y: %.2f, err: %.2f\r\n",beacon0,beacon1, beacon2,
//                                               comb_tri_coor[comb_index].final_coordinate.x,
//                                               comb_tri_coor[comb_index].final_coordinate.y,
//                                               comb_tri_coor[comb_index].error_index);
}



void compute_coordinate(void){
  for (int comb_index = 0; comb_index < NUM_COMBINATIONS; comb_index++){
      compute_trilateration(comb_beacon[comb_index][0],
                            comb_beacon[comb_index][1],
                            comb_beacon[comb_index][2], comb_index);
      final_coordinates.pre_coordinate[comb_index].x = comb_tri_coor[comb_index].final_coordinate.x;
      final_coordinates.pre_coordinate[comb_index].y = comb_tri_coor[comb_index].final_coordinate.y;
  }
  // Tính toán tọa độ trung bình của 4 tổ hợp
  final_coordinates.final_coordinate.x = (final_coordinates.pre_coordinate[0].x +
                                          final_coordinates.pre_coordinate[1].x +
                                          final_coordinates.pre_coordinate[2].x +
                                          final_coordinates.pre_coordinate[3].x) / 4.0;
  final_coordinates.final_coordinate.y = (final_coordinates.pre_coordinate[0].y +
                                          final_coordinates.pre_coordinate[1].y +
                                          final_coordinates.pre_coordinate[2].y +
                                          final_coordinates.pre_coordinate[3].y) / 4.0;
  // Tính toán sai số bán kính
  final_coordinates.error_index = (compute_distances(final_coordinates.pre_coordinate[0].x,
                                                    final_coordinates.pre_coordinate[0].y,
                                                    final_coordinates.final_coordinate.x,
                                                    final_coordinates.final_coordinate.y) +
                                  compute_distances(final_coordinates.pre_coordinate[1].x,
                                                    final_coordinates.pre_coordinate[1].y,
                                                    final_coordinates.final_coordinate.x,
                                                    final_coordinates.final_coordinate.y) +
                                  compute_distances(final_coordinates.pre_coordinate[2].x,
                                                    final_coordinates.pre_coordinate[2].y,
                                                    final_coordinates.final_coordinate.x,
                                                    final_coordinates.final_coordinate.y) +
                                  compute_distances(final_coordinates.pre_coordinate[3].x,
                                                    final_coordinates.pre_coordinate[3].y,
                                                    final_coordinates.final_coordinate.x,
                                                    final_coordinates.final_coordinate.y)) / NUM_COMBINATIONS;
//  printf("||FINAL COORDINATE|| x: %.2f, y:%.2f, err: %.2f\r\n",final_coordinates.final_coordinate.x,
//                                                           final_coordinates.final_coordinate.y,
//                                                           final_coordinates.error_index);
}

// Lấy tọa độ
void get_final_coordinate(float* x, float* y)
{
  *x   = (float)final_coordinates.final_coordinate.x;
  *y   = (float)final_coordinates.final_coordinate.y;
}




