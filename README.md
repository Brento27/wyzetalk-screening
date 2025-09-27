<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

WyzeTalk Screening - A NestJS application with MongoDB integration, containerized with Docker for easy development and deployment.

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/) (package manager)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Local Development Setup

### Option 1: Using Docker (Recommended)

This is the easiest way to get started as it handles all dependencies automatically.

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wyzetalk-screening
   ```

2. **Start the application with Docker Compose**
   ```bash
   # Build and start all services (API + MongoDB)
   docker-compose up --build

   # Or run in detached mode (background)
   docker-compose up --build -d
   ```

3. **Access the application**
   - API: http://localhost:3000
   - MongoDB: localhost:27017

4. **Stop the services**
   ```bash
   docker-compose down
   ```

### Option 2: Manual Setup

If you prefer to run the application without Docker:

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up MongoDB**
   - Install MongoDB locally or use a cloud service
   - Create a database and note the connection string

3. **Set environment variables**
   ```bash
   # Create .env file
   echo "MONGODB_URI=mongodb://localhost:27017/wyzetalk_db" > .env
   echo "PORT=3000" >> .env
   ```

4. **Run the application**
   ```bash
   # Development mode with hot reload
   pnpm run start:dev

   # Production mode
   pnpm run start:prod
   ```

## Docker Commands Reference

```bash
# Build and start services
docker-compose up --build

# Start services in background
docker-compose up -d

# Run tests in Docker
docker-compose up --build test

# Run tests with coverage
docker-compose run --rm test pnpm test:cov

# View logs
docker-compose logs api
docker-compose logs mongo
docker-compose logs test

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build --force-recreate

# View running containers
docker-compose ps
```

## Project Structure

```
wyzetalk-screening/
├── src/                    # Source code
│   ├── schemas/           # MongoDB schemas
│   │   ├── game.schema.ts # Game data model
│   │   ├── card.schema.ts # Card data model
│   │   └── attempt.schema.ts # Attempt tracking model
│   ├── types/             # TypeScript type definitions
│   │   └── card.types.ts  # Card types and interfaces
│   ├── utils/             # Utility functions
│   │   ├── card.utils.ts  # Card shuffling and game logic
│   │   └── card.utils.spec.ts # Tests for card utilities
│   ├── app.controller.ts  # Main controller
│   ├── app.service.ts     # Main service
│   ├── app.module.ts      # Main module (with MongoDB & Config integration)
│   └── main.ts           # Application entry point
├── test/                  # E2E tests
├── dist/                  # Compiled output
├── data/                  # MongoDB data (created by Docker)
├── .env                   # Environment variables (not in git)
├── .env.example          # Environment variables template
├── Dockerfile            # Docker configuration for API
├── Dockerfile.test       # Docker configuration for tests
├── docker-compose.yml    # Docker Compose configuration
└── .dockerignore         # Docker ignore file
```

## Database Integration

The application uses **MongoDB** with **Mongoose** for database operations:

- **Mongoose**: MongoDB object modeling for Node.js
- **@nestjs/mongoose**: NestJS integration for Mongoose
- **@nestjs/config**: Configuration management with environment variables
- **dotenv**: Environment variable loading

### Database Configuration

The MongoDB connection is configured in `src/app.module.ts`:

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'),
  }),
  inject: [ConfigService],
}),
```

### MongoDB Credentials (Docker)

- **Username**: `admin`
- **Password**: `password123`
- **Database**: `wyzetalk_db`
- **Port**: `27017`

## Game Logic & Data Models

The application implements a **Memory Card Game** with the following features:

### Card Types
- 8 unique animal card types: Dog, Cat, Horse, Bird, Fish, Lion, Elephant, Monkey
- Each card type appears twice (16 cards total for 4x4 grid)
- Grid positions: A1-D4 (4x4 layout)

### Data Models

**Game Schema:**
- `gameId`: Unique identifier for each game session
- `board`: Array of 16 cards with positions and states
- `matchedPairs`: Array of matched card types
- `attempts`: Number of attempts made
- `isCompleted`: Game completion status
- `startTime`/`endTime`: Game timing
- `gridSize`: Grid dimensions (4x4)

**Card Schema:**
- `type`: Card type (enum)
- `position`: Grid position (A1-D4)
- `isFlipped`: Card visibility state
- `isMatched`: Match status

**Attempt Schema:**
- `gameId`: Reference to game
- `cardsChosen`: Array of 2 card positions
- `isMatch`: Whether attempt was successful
- `timestamp`: When attempt was made

### Card Shuffling
- Fisher-Yates shuffle algorithm for random card placement
- Ensures 8 pairs are distributed across 4x4 grid
- Validates card positions and match logic
- Utility functions for game state management

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://admin:password123@mongo:27017/wyzetalk_db?authSource=admin` |
| `NODE_ENV` | Environment mode | `production` |

### Environment Configuration

The application uses `.env` files for environment configuration. Copy `.env.example` to `.env` and modify as needed:

```bash
# Copy environment template
cp .env.example .env
```

**For Docker development:**
```env
MONGODB_URI=mongodb://admin:password123@mongo:27017/wyzetalk_db?authSource=admin
```

**For local development:**
```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/wyzetalk_db?authSource=admin
```

## API Endpoints

- `GET /` - Health check endpoint (returns "Hello World!")

## Development Commands

```bash
# Install dependencies
pnpm install

# Development with hot reload
pnpm run start:dev

# Build the application
pnpm run build

# Start production server
pnpm run start:prod

# Run tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Lint code
pnpm run lint

# Format code
pnpm run format

# Run specific test file
pnpm test src/utils/card.utils.spec.ts
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
