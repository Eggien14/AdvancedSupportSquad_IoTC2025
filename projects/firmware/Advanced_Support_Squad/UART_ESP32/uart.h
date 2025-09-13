#ifndef UART_H
#define UART_H

#include "em_eusart.h"

#include "sl_sleeptimer.h"
#include "sl_code_classification.h"

void EUSART_SendString(EUSART_TypeDef *eusart, const char *str);
void send_uart(void);

void send_uart_init(void);
void send_uart_timer(void);

#endif // UART_H
