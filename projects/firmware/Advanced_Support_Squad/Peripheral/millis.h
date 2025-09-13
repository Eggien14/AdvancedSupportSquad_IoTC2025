#ifndef MILLIS_H
#define MILLIS_H

#include <stdint.h>

// Khởi tạo SysTick cho 1ms interrupt
void init_millis(void);

// Trả về số mili-giây đã trôi qua
uint32_t millis(void);

#endif
