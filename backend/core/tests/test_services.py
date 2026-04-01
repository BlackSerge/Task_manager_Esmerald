import pytest
from model_bakery import baker
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from core.services.auth_service import register_user
from core.services.user_service import user_update_profile, user_delete_account

User = get_user_model()


@pytest.mark.django_db
class TestRegisterUser:

    def test_creates_user(self):
        user = register_user(
            username="testuser",
            email="test@example.com",
            password="Test@1234"
        )
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.check_password("Test@1234")

    def test_user_persisted_in_db(self):
        register_user(
            username="persisted",
            email="p@example.com",
            password="Test@1234"
        )
        assert User.objects.filter(username="persisted").exists()


@pytest.mark.django_db
class TestUserUpdateProfile:

    def test_updates_username_and_email(self):
        user = baker.make(User, username="old", email="old@test.com")
        updated = user_update_profile(
            user=user, username="new", email="new@test.com"
        )
        assert updated.username == "new"
        assert updated.email == "new@test.com"

    def test_rejects_duplicate_email(self):
        baker.make(User, email="taken@test.com")
        user = baker.make(User, email="mine@test.com")
        with pytest.raises(ValidationError):
            user_update_profile(
                user=user, username="valid", email="taken@test.com"
            )

    def test_allows_keeping_own_email(self):
        user = baker.make(User, email="mine@test.com")
        updated = user_update_profile(
            user=user, username="newname", email="mine@test.com"
        )
        assert updated.email == "mine@test.com"


@pytest.mark.django_db
class TestUserDeleteAccount:

    def test_deletes_user(self):
        user = baker.make(User)
        user_id = user.id
        user_delete_account(user=user)
        assert not User.objects.filter(id=user_id).exists()
