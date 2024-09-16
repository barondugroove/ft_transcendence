export const PROD_MODE = true
export const IP_SERVER = PROD_MODE ? ':8000' : '127.0.0.1:8000'
export const HTTP_MODE = PROD_MODE ? 'https://' : 'http://'
export const WS_MODE = PROD_MODE ? 'wss://' : 'ws://'