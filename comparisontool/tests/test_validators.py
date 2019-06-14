from django.core.exceptions import ValidationError
from django.test import TestCase

from comparisontool.validators import validate_uuid4


class UUIDValidatorTestCase(TestCase):
    def test_valid_uuid4(self):
        result = validate_uuid4('841df17e-784f-4ea4-bfb3-ebac5d2fcfe5')
        # validators do not return a value, only indications are raising
        # ValidationError, or not
        assert(result is None)

    def test_invalid_uuid4(self):
        invalid_uuid = 'not a UUID'
        self.assertRaises(ValidationError, validate_uuid4, invalid_uuid)
