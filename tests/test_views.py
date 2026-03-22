import pytest
from datetime import date

from django.shortcuts import reverse
from rest_framework.test import APIClient

from map.models import CommunityArea, RestaurantPermit


@pytest.fixture
def map_data_response():
    # Create some test community areas
    area1 = CommunityArea.objects.create(name="Beverly", area_id=1)
    area2 = CommunityArea.objects.create(name="Lincoln Park", area_id=2)

    # Test permits for Beverly
    RestaurantPermit.objects.create(
        community_area_id=area1.area_id, issue_date=date(2021, 1, 15)
    )
    RestaurantPermit.objects.create(
        community_area_id=area1.area_id, issue_date=date(2021, 2, 20)
    )

    # Test permits for Lincoln Park
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 3, 10)
    )
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 2, 14)
    )
    RestaurantPermit.objects.create(
        community_area_id=area2.area_id, issue_date=date(2021, 6, 22)
    )

    # Query the map data endpoint
    client = APIClient()
    return client.get(reverse("map_data"), {"year": 2021})

@pytest.mark.django_db
def test_map_data_status(map_data_response):
    assert map_data_response.status_code == 200

@pytest.mark.django_db
def test_map_data_permit_counts(map_data_response):
    area_data = {item["area_id"]: item for item in map_data_response.json()}
    
    assert area_data[1]["num_permits"] == 2
    assert area_data[2]["num_permits"] == 3
