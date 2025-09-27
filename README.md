# Memory Card Game API

A RESTful API for a memory card matching game built with NestJS, MongoDB, and Docker. Players can start games, match cards, track attempts, and view leaderboards.

## Brief Description

This API provides a complete backend for a memory card game where players match pairs of animal cards on a 4x4 grid. The game tracks attempts, completion time, and maintains a leaderboard of top performers. Built with modern technologies and containerized for easy deployment.

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

## Design Choices & Technologies Used

### Backend Framework
- **NestJS**: Progressive Node.js framework with TypeScript support
  - Modular architecture with dependency injection
  - Built-in support for decorators and metadata
  - Excellent for building scalable APIs

### Database & Data Layer
- **MongoDB**: NoSQL document database
  - Flexible schema for game state management
  - Excellent for storing nested card arrays and game history
- **Mongoose**: MongoDB object modeling for Node.js
  - Schema validation and type safety
  - Built-in timestamps and middleware support
- **@nestjs/mongoose**: NestJS integration for Mongoose
  - Seamless integration with NestJS modules
  - Type-safe database operations

### API Documentation & Validation
- **Swagger/OpenAPI**: Interactive API documentation
  - Auto-generated from TypeScript decorators
  - Built-in testing interface at `/api`
- **class-validator**: Runtime validation for DTOs
  - Ensures data integrity at API boundaries
  - Custom validation rules for card positions
- **class-transformer**: Data transformation and serialization
  - Converts between DTOs and entities
  - Handles MongoDB document serialization

### Development & Build Tools
- **TypeScript**: Type-safe JavaScript development
  - Compile-time error checking
  - Enhanced IDE support and refactoring
- **ESLint & Prettier**: Code quality and formatting
  - Consistent code style across the project
  - Automated linting and formatting
- **Jest**: Testing framework
  - Unit tests for utilities and services
  - End-to-end tests for API endpoints
  - Coverage reporting

### Containerization & Deployment
- **Docker**: Containerization for consistent environments
  - Multi-stage builds for optimization
  - Separate containers for API and database
- **Docker Compose**: Multi-container orchestration
  - Easy local development setup
  - Isolated testing environment

### Design Decisions

1. **4x4 Grid Layout**: Chosen for optimal game difficulty and user experience
2. **Animal Card Types**: 8 unique types provide good variety without complexity
3. **UUID Game IDs**: Ensures uniqueness and prevents enumeration attacks
4. **Attempt Tracking**: Detailed logging for analytics and debugging
5. **RESTful API Design**: Standard HTTP methods and status codes
6. **MongoDB Document Structure**: Nested cards array for efficient queries
7. **Validation at Boundaries**: Input validation prevents invalid game states
8. **Swagger Integration**: Self-documenting API reduces maintenance overhead

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

## Data Models

The application uses MongoDB with Mongoose schemas to define the following data structures:

### Game Model
Represents a complete memory card game session:

```typescript
{
  gameId: string;           // Unique identifier (UUID)
  board: Card[];           // Array of 16 cards in 4x4 grid
  matchedPairs: CardType[]; // Array of successfully matched card types
  attempts: number;         // Total number of attempts made
  isCompleted: boolean;     // Whether the game is finished
  startTime: Date;          // When the game started
  endTime?: Date;           // When the game completed (optional)
  gridSize: string;         // Grid dimensions (default: "4x4")
  createdAt: Date;          // Document creation timestamp
  updatedAt: Date;          // Document last update timestamp
}
```

### Card Model
Represents an individual card in the game:

```typescript
{
  type: CardType;           // Card type (Dog, Cat, Horse, etc.)
  position: GridPosition;   // Grid position (A1, A2, B1, etc.)
  isFlipped: boolean;       // Whether card is currently visible
  isMatched: boolean;       // Whether card has been matched
}
```

**Card Types**: Dog, Cat, Horse, Bird, Fish, Lion, Elephant, Monkey
**Grid Positions**: A1-D4 (4x4 layout with 16 total positions)

### Attempt Model
Tracks each matching attempt made during a game:

```typescript
{
  gameId: string;           // Reference to the game
  cardsChosen: GridPosition[]; // Array of exactly 2 card positions
  isMatch: boolean;         // Whether the attempt was successful
  timestamp: Date;          // When the attempt was made
  createdAt: Date;          // Document creation timestamp
  updatedAt: Date;          // Document last update timestamp
}
```

### Game Logic Features

- **Card Shuffling**: Fisher-Yates algorithm ensures random card placement
- **Grid Layout**: 4x4 grid with 8 pairs of matching cards (16 cards total)
- **Validation**: Strict validation of card positions and game state
- **Attempt Tracking**: Every card selection is logged with timestamps
- **Completion Detection**: Automatic game completion when all pairs are matched

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

The API provides the following endpoints for managing memory card games:

### Game Management

#### Start a New Game
- **Endpoint**: `POST /games/start`
- **Description**: Creates a new memory card game with shuffled cards
- **Request Body**: None
- **Example Request**:
  ```bash
  curl -X POST http://localhost:3000/games/start
  ```
- **Example Response**:
  ```json
  {
    "gameId": "123e4567-e89b-12d3-a456-426614174000",
    "board": [
      {
        "type": "Dog",
        "position": "A1",
        "isFlipped": false,
        "isMatched": false
      },
      {
        "type": "Cat",
        "position": "A2",
        "isFlipped": false,
        "isMatched": false
      }
    ],
    "matchedPairs": [],
    "attempts": 0,
    "isCompleted": false,
    "startTime": "2024-01-15T10:30:00.000Z",
    "gridSize": "4x4"
  }
  ```

#### Submit Cards for Matching
- **Endpoint**: `POST /games/:gameId/submit-cards`
- **Description**: Submit two card positions to check for a match
- **Path Parameters**: 
  - `gameId` (string): The unique identifier of the game
- **Request Body**:
  ```json
  {
    "card1Position": "A1",
    "card2Position": "B2"
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST http://localhost:3000/games/123e4567-e89b-12d3-a456-426614174000/submit-cards \
    -H "Content-Type: application/json" \
    -d '{"card1Position": "A1", "card2Position": "B2"}'
  ```
- **Example Response**:
  ```json
  {
    "isMatch": true,
    "matchedCards": ["A1", "B2"],
    "gameState": {
      "gameId": "123e4567-e89b-12d3-a456-426614174000",
      "attempts": 1,
      "isCompleted": false,
      "matchedPairs": ["Dog"]
    }
  }
  ```

#### Get Game State
- **Endpoint**: `GET /games/:gameId`
- **Description**: Retrieve the current state of a game
- **Path Parameters**: 
  - `gameId` (string): The unique identifier of the game
- **Example Request**:
  ```bash
  curl http://localhost:3000/games/123e4567-e89b-12d3-a456-426614174000
  ```
- **Example Response**:
  ```json
  {
    "gameId": "123e4567-e89b-12d3-a456-426614174000",
    "board": [
      {
        "type": "Dog",
        "position": "A1",
        "isFlipped": true,
        "isMatched": true
      }
    ],
    "matchedPairs": ["Dog"],
    "attempts": 5,
    "isCompleted": false,
    "startTime": "2024-01-15T10:30:00.000Z",
    "gridSize": "4x4"
  }
  ```

### Leaderboard

#### Get Top Games
- **Endpoint**: `GET /leaderboard`
- **Description**: Retrieve the top 5 completed games by completion time
- **Query Parameters**: None
- **Example Request**:
  ```bash
  curl http://localhost:3000/leaderboard
  ```
- **Example Response**:
  ```json
  {
    "leaderboard": [
      {
        "gameId": "123e4567-e89b-12d3-a456-426614174000",
        "attempts": 8,
        "completionTime": 45.2,
        "completedAt": "2024-01-15T10:32:15.000Z"
      },
      {
        "gameId": "456e7890-e89b-12d3-a456-426614174001",
        "attempts": 12,
        "completionTime": 67.8,
        "completedAt": "2024-01-15T11:15:30.000Z"
      }
    ]
  }
  ```

### Health Check
- **Endpoint**: `GET /`
- **Description**: Health check endpoint
- **Example Response**: `"Hello World!"`

### Swagger UI Documentation

For detailed API documentation with interactive testing, visit: **http://localhost:3000/api**

The Swagger UI provides:
- Complete API documentation
- Interactive request/response testing
- Schema definitions
- Example requests and responses

## Future Enhancements

### Authentication & User Management
- **User Registration/Login**: JWT-based authentication system
- **User Profiles**: Personal game statistics and achievements
- **Social Features**: Friend lists and multiplayer support
- **Session Management**: Persistent game sessions across devices

### Game Modes & Features
- **Multiple Grid Sizes**: 3x3, 5x5, 6x6 grid options
- **Time-based Challenges**: Speed rounds with time limits
- **Difficulty Levels**: Easy, Medium, Hard with different card counts
- **Custom Card Sets**: User-uploaded images and themes
- **Power-ups**: Hints, shuffle, and reveal cards

### Analytics & Insights
- **Player Statistics**: Average completion time, success rate
- **Game Analytics**: Most challenging card positions
- **Performance Metrics**: API response times and usage patterns
- **Heat Maps**: Visual representation of card selection patterns

### UI Integration
- **Web Frontend**: React/Vue.js client application
- **Mobile App**: React Native or Flutter mobile application
- **Real-time Updates**: WebSocket integration for live game state
- **Progressive Web App**: Offline capability and push notifications

### Advanced Features
- **AI Opponent**: Computer player with adjustable difficulty
- **Tournament Mode**: Bracket-style competitions
- **Leaderboards**: Global, regional, and friend-based rankings
- **Achievements System**: Badges and rewards for milestones
- **Game Replay**: Record and replay completed games

### Technical Improvements
- **Caching Layer**: Redis for improved performance
- **Rate Limiting**: API protection against abuse
- **Monitoring**: Application performance monitoring (APM)
- **CI/CD Pipeline**: Automated testing and deployment
- **Microservices**: Split into smaller, focused services

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

## Running Tests

The project includes comprehensive testing with Jest for both unit and end-to-end tests.

### Test Commands

```bash
# Run all unit tests
pnpm run test

# Run tests in watch mode (for development)
pnpm run test:watch

# Run tests with coverage report
pnpm run test:cov

# Run end-to-end tests
pnpm run test:e2e

# Run tests in debug mode
pnpm run test:debug

# Run specific test file
pnpm test src/utils/card.utils.spec.ts

# Run tests with verbose output
pnpm test --verbose
```

### Test Coverage

The test suite includes:

- **Unit Tests**: 
  - Card utility functions (`src/utils/card.utils.spec.ts`)
  - Game service logic (`src/game/game.service.spec.ts`)
  - Controller tests (`src/game/game.controller.spec.ts`)

- **End-to-End Tests**:
  - API endpoint testing (`test/game.e2e-spec.ts`)
  - Integration testing with MongoDB
  - Full game flow validation

### Running Tests with Docker

```bash
# Run tests in Docker container
docker-compose up --build test

# Run tests with coverage in Docker
docker-compose run --rm test pnpm test:cov

# Run e2e tests in Docker
docker-compose run --rm test pnpm test:e2e
```

### Test Configuration

- **Jest Configuration**: Located in `package.json`
- **E2E Configuration**: `test/jest-e2e.json`
- **Coverage Reports**: Generated in `coverage/` directory
- **Test Environment**: Node.js with MongoDB integration

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

## Contributing

We welcome contributions to improve the Memory Card Game API! Here's how you can help:

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/wyzetalk-screening.git`
3. Install dependencies: `pnpm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Make your changes and add tests
6. Run tests: `pnpm test && pnpm test:e2e`
7. Commit your changes: `git commit -m "Add your feature"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Create a Pull Request

### Code Standards

- Follow the existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages
- Ensure all tests pass before submitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [NestJS](https://nestjs.com/) framework
- Uses [MongoDB](https://www.mongodb.com/) for data storage
- Containerized with [Docker](https://www.docker.com/)
- API documentation powered by [Swagger](https://swagger.io/)
