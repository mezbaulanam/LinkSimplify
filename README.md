# LinkSimplify

LinkSimplify is a powerful and user-friendly URL shortener designed to streamline the sharing of links across various platforms. This project features both a web interface and an API, allowing users to easily create, update, and delete shortened URLs as needed.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [External Credits](#external-credits)
- [Docker Support](#docker-support)

## Features

- User authentication (register, login, logout)
- URL shortening with custom aliases
- Blacklist for custom aliases (reserved keywords)
- URL management (edit, delete)
- URL analytics (click tracking)
- Social Media Sharing
- QR Code Generation
- Responsive design
- Secure password storage with bcrypt
- JWT-based authentication
- Docker support
- API Access ( Planned )
- Extendable with additional features ( Planned )
- Custom Domain Support ( Planned )
- Password-protected URLs ( Planned )
- Expiration Dates ( Planned )
- Rate Limiting ( Planned )
- Google Analytics Integration ( Planned )
- API Key Authentication ( Planned )
- Geo Location Tracking ( Planned )
- Logging and Monitoring ( Planned )
- Spam Protection ( Planned )
- Abuse Prevention ( Planned )

## Demo

[LinkSimplify Demo](https://linksimplify-57f95a96384c.herokuapp.com/)  
Users can register with any credentials.

## Installation

To get started with LinkSimplify, follow these steps:

1. Clone the repository:

    ```sh
    git clone https://github.com/mezbaulanam/LinkSimplify.git
    ```

2. Navigate to the project directory:

    ```sh
    cd LinkSimplify
    ```

3. Install the dependencies:

    ```sh
    npm install
    ```

4. Create a `.env` file in the root directory and add your environment variables:

    ```env
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```

5. Start the development server:

    ```sh
    npm start
    ```

## Docker Support

LinkSimplify can be easily set up using Docker. Follow these steps to run the application in a Docker container:

1. Build the Docker image:

    ```sh
    docker build -t linksimplify .
    ```

2. Run the Docker container:

    ```sh
    docker run -p 3000:3000 --env-file .env linksimplify
    ```

Alternatively, you can use Docker Compose to manage the setup:

1. Build and start the services:

    ```sh
    docker-compose up --build
    ```

2. The application will be available at `http://localhost:3000`.

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Register a new account or log in with an existing account.
3. Use the URL shortener form to create a new shortened URL.
4. Manage your URLs from the dashboard.


## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## External Credits

- [Free SVG Backgrounds and Patterns by SVGBackgrounds.com](https://www.svgbackgrounds.com/set/free-svg-backgrounds-and-patterns/)

---

Made with ❤️ by [mezbaulanam](https://github.com/mezbaulanam)