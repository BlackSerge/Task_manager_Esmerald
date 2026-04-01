import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class ComplexityPasswordValidator:
    def __init__(self, regex=None, message=None):
        self.regex = regex or r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
        self.message = message or _(
            'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
        )

    def validate(self, password, user=None):
        if not re.match(self.regex, password):
            raise ValidationError(self.message, code='password_too_weak')

    def get_help_text(self):
        return self.message