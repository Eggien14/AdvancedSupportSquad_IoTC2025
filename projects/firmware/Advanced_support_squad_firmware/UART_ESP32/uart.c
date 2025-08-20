#include "uart.h"

#include "peripheral_handler.h"
#include <stdio.h>


void EUSART_SendString(EUSART_TypeDef *eusart, const char *str)
{
  while (*str != '\0') {
    EUSART_Tx(eusart, *str);  // gửi từng ký tự
    str++;
  }
}


void send_uart(void)
{
  char buffer[30];
  sprintf(buffer,"0.8 0.8 180.00\r\n");
  EUSART_SendString(EUSART1 ,buffer);

}


//TIMER_SEND
#ifndef SEND_DELAY_MS
#define SEND_DELAY_MS         100
#endif
/*******************************************************************************
 ***************************  LOCAL VARIABLES   ********************************
 ******************************************************************************/
sl_sleeptimer_timer_handle_t timer;
volatile bool send_timeout = false;
/*******************************************************************************
 *********************   LOCAL FUNCTION PROTOTYPES   ***************************
 ******************************************************************************/

SL_CODE_RAM static void on_timeout(sl_sleeptimer_timer_handle_t *handle,
                                   void *data);

/*******************************************************************************
 **************************   GLOBAL FUNCTIONS   *******************************
 ******************************************************************************/

/***************************************************************************//**
 * Initialize blink example.
 ******************************************************************************/
void send_uart_init(void)
{
  // Create timer for waking up the system periodically.
  sl_sleeptimer_start_periodic_timer_ms(&timer,
                                        SEND_DELAY_MS,
                                        on_timeout, NULL,
                                        0,
                                        SL_SLEEPTIMER_NO_HIGH_PRECISION_HF_CLOCKS_REQUIRED_FLAG);
}

/***************************************************************************//**
 * Blink ticking function.
 ******************************************************************************/
void send_uart_timer(void)
{
  if (send_timeout == true) {
    send_uart();
    send_timeout = false;
  }
}

/***************************************************************************//**
 * Sleeptimer timeout callback.
 ******************************************************************************/
static void on_timeout(sl_sleeptimer_timer_handle_t *handle,
                       void *data)
{
  (void)&handle;
  (void)&data;
  send_timeout = true;
}
