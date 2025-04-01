import logging
from datetime import datetime
from typing import Any, Optional

class ColorLogger:
    # Cores ANSI
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

    # Emojis para diferentes tipos de logs
    EMOJIS = {
        'start': '🚀',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️',
        'database': '🗄️',
        'file': '📄',
        'processing': '⚙️',
        'excel': '📊',
        'pdf': '📑',
        'upload': '⬆️',
        'download': '⬇️',
        'api': '🌐',
        'time': '⏱️',
    }

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)

    def _format_message(self, emoji: str, color: str, message: str, details: Optional[Any] = None) -> str:
        timestamp = datetime.now().strftime('%H:%M:%S')
        base_message = f"{color}[{timestamp}] {emoji} {message}{self.RESET}"
        
        if details:
            if isinstance(details, dict):
                details_str = "\n".join(f"  └─ {k}: {v}" for k, v in details.items())
            elif isinstance(details, (list, tuple)):
                details_str = "\n".join(f"  └─ {item}" for item in details)
            else:
                details_str = f"  └─ {details}"
            return f"{base_message}\n{color}{details_str}{self.RESET}"
        
        return base_message

    def start(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['start'], self.BLUE, message, details)
        self.logger.info(formatted)

    def success(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['success'], self.GREEN, message, details)
        self.logger.info(formatted)

    def error(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['error'], self.RED, message, details)
        self.logger.error(formatted)

    def warning(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['warning'], self.YELLOW, message, details)
        self.logger.warning(formatted)

    def info(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['info'], self.RESET, message, details)
        self.logger.info(formatted)

    def database(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['database'], self.BLUE, message, details)
        self.logger.info(formatted)

    def file(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['file'], self.RESET, message, details)
        self.logger.info(formatted)

    def processing(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['processing'], self.BLUE, message, details)
        self.logger.info(formatted)

    def excel(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['excel'], self.GREEN, message, details)
        self.logger.info(formatted)

    def pdf(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['pdf'], self.BLUE, message, details)
        self.logger.info(formatted)

    def upload(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['upload'], self.GREEN, message, details)
        self.logger.info(formatted)

    def download(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['download'], self.GREEN, message, details)
        self.logger.info(formatted)

    def api(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['api'], self.BLUE, message, details)
        self.logger.info(formatted)

    def time(self, message: str, details: Optional[Any] = None):
        formatted = self._format_message(self.EMOJIS['time'], self.YELLOW, message, details)
        self.logger.info(formatted)

# Criar uma instância global do logger
logger = ColorLogger('relatorios') 