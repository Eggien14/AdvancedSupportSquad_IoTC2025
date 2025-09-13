#include "millis.h"
#include "em_device.h"

volatile uint32_t msTicks = 0;  // biến đếm mili-giây

// ISR SysTick: chạy mỗi 1ms
void SysTick_Handler(void) {
  msTicks++;
}

// Khởi tạo SysTick 1ms
void init_millis(void) {
  // Tạo ngắt SysTick mỗi 1ms
  SysTick_Config(SystemCoreClock / 1000);
}

// Hàm trả về số mili-giây đã trôi qua
uint32_t millis(void) {
  return msTicks;
}
