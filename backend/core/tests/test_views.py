import pytest
from rest_framework import status
from rest_framework.test import APIClient
from model_bakery import baker
from django.contrib.auth import get_user_model

from boards.models import Board, BoardMember

User = get_user_model()

STRONG_PASSWORD = "SecureP@ss1"


@pytest.mark.django_db
class TestRegisterEndpoint:

    def test_successful_registration(self):
        client = APIClient()
        response = client.post("/api/auth/register/", {
            "username": "newuser",
            "email": "new@example.com",
            "password": STRONG_PASSWORD,
            "password2": STRONG_PASSWORD,
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
        assert response.data["user"]["username"] == "newuser"

    def test_password_mismatch(self):
        client = APIClient()
        response = client.post("/api/auth/register/", {
            "username": "testuser",
            "email": "test@example.com",
            "password": STRONG_PASSWORD,
            "password2": "DifferentPass1!",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_duplicate_username(self):
        baker.make(User, username="taken")
        client = APIClient()
        response = client.post("/api/auth/register/", {
            "username": "taken",
            "email": "unique@example.com",
            "password": STRONG_PASSWORD,
            "password2": STRONG_PASSWORD,
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_duplicate_email(self):
        baker.make(User, email="taken@example.com")
        client = APIClient()
        response = client.post("/api/auth/register/", {
            "username": "unique",
            "email": "taken@example.com",
            "password": STRONG_PASSWORD,
            "password2": STRONG_PASSWORD,
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_short_username_rejected(self):
        client = APIClient()
        response = client.post("/api/auth/register/", {
            "username": "ab",
            "email": "short@example.com",
            "password": STRONG_PASSWORD,
            "password2": STRONG_PASSWORD,
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_numeric_username_rejected(self):
        client = APIClient()
        response = client.post("/api/auth/register/", {
            "username": "12345",
            "email": "num@example.com",
            "password": STRONG_PASSWORD,
            "password2": STRONG_PASSWORD,
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_weak_password_rejected(self):
        client = APIClient()
        response = client.post("/api/auth/register/", {
            "username": "testuser",
            "email": "test@example.com",
            "password": "simple",
            "password2": "simple",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLoginEndpoint:

    def test_successful_login(self):
        user = User.objects.create_user(
            username="loginuser",
            email="login@example.com",
            password=STRONG_PASSWORD
        )
        client = APIClient()
        response = client.post("/api/auth/login/", {
            "username": "loginuser",
            "password": STRONG_PASSWORD,
        })
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
        assert response.data["user"]["username"] == "loginuser"

    def test_wrong_password(self):
        User.objects.create_user(
            username="loginuser2",
            email="login2@example.com",
            password=STRONG_PASSWORD
        )
        client = APIClient()
        response = client.post("/api/auth/login/", {
            "username": "loginuser2",
            "password": "WrongPass1!",
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_nonexistent_user(self):
        client = APIClient()
        response = client.post("/api/auth/login/", {
            "username": "ghost",
            "password": STRONG_PASSWORD,
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenRefreshEndpoint:

    def test_refresh_token(self):
        User.objects.create_user(
            username="refreshuser",
            email="refresh@example.com",
            password=STRONG_PASSWORD
        )
        client = APIClient()
        login = client.post("/api/auth/login/", {
            "username": "refreshuser",
            "password": STRONG_PASSWORD,
        })
        refresh_token = login.data["refresh"]

        response = client.post("/api/auth/refresh/", {
            "refresh": refresh_token,
        })
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data


@pytest.mark.django_db
class TestUserSearchEndpoint:

    def test_search_users(self):
        user = baker.make(User, username="searcher")
        baker.make(User, username="findme_user")

        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get("/api/users/search/?q=findme")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert response.data[0]["username"] == "findme_user"

    def test_search_excludes_board_members(self):
        owner = baker.make(User, username="searchowner")
        member = baker.make(User, username="searchmember")
        outsider = baker.make(User, username="searchoutsider")
        board = baker.make(Board, owner=owner)
        BoardMember.objects.create(board=board, user=member)

        client = APIClient()
        client.force_authenticate(user=owner)
        response = client.get(f"/api/users/search/?q=search&board_id={board.id}")

        usernames = [u["username"] for u in response.data]
        assert "searchoutsider" in usernames
        assert "searchowner" not in usernames
        assert "searchmember" not in usernames

    def test_search_unauthenticated(self):
        client = APIClient()
        response = client.get("/api/users/search/?q=test")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_search_short_query_returns_empty(self):
        user = baker.make(User)
        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get("/api/users/search/?q=a")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0
