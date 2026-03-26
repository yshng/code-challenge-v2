# Chicago Restaurant Permit Map

## Overview

An interactive map of restaurant permits issued within each [Chicago Community
Area](https://en.wikipedia.org/wiki/Community_areas_of_Chicago) from 2016-2026.

This is a fork of [DataMade's 2026 Code Challenge](https://github.com/datamade/code-challenge-v2).

## Development

Deploying locally for development requires a local installation of [Docker](https://docs.docker.com/get-started/get-docker/)
and [Docker Compose](https://docs.docker.com/compose/install/). These are the only two system-level dependencies you
should need.

Once you have Docker and Docker Compose installed, build the application
containers from the project's root directory:

```bash
docker compose build
```

Load in the data:

```bash
docker compose run --rm app python manage.py loaddata map/fixtures/restaurant_permits.json map/fixtures/community_areas.json
```

And finally, run the app:

```bash
docker compose up
```

The app will log to the console, and you should be able to visit it at
http://localhost:8000

## Testing

Use this command to run tests:

```bash
 docker compose -f docker-compose.yml -f tests/docker-compose.yml run --rm app
```
