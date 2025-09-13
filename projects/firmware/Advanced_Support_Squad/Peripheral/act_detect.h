#ifndef ACT_DETECT_H
#define ACT_DETECT_H

#define ACC_THRESHOLD 0
#define TILT_THRESHOLD 0
#define FALL_THRESHOLD 0

//DETECT DEFINE
#define NO_ACT 0
#define TILT 1 //  NGHIENG
#define PUSH_HARD 2

extern int detect_code;
void act_detect(void);

#endif // ACT_DETECT
